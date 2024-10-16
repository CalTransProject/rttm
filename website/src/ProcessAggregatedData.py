import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv, find_dotenv
import os
import json
from datetime import datetime, timedelta
import logging
import random
import memcache
import hashlib
from tqdm import tqdm
import multiprocessing
from functools import partial

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
dotenv_path = find_dotenv('website/scriptsServer/database/db.env')
if not dotenv_path:
    logging.error("Error: .env file not found.")
    exit(1)
load_dotenv(dotenv_path)
logging.info(f"Loaded .env from: {dotenv_path}")

# Database credentials
db_credentials = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

# Memcached configuration
memcached_host = os.getenv("MEMCACHED_HOST", "localhost")
memcached_port = os.getenv("MEMCACHED_PORT", "11211")
mc = memcache.Client([f"{memcached_host}:{memcached_port}"], debug=0)

# Road length configuration
ROAD_LENGTH = float(os.getenv("ROAD_LENGTH", 100))  # Default to 100 meters if not specified

# Processing configuration
CHUNK_SIZE = 100000  # Process 100,000 records at a time
TOTAL_RECORDS = 2073600  # Total number of records in FramePrediction table
FRAMES_PER_SECOND = 24

def get_cache_key(prefix, *args):
    """Generate a unique cache key based on the prefix and arguments."""
    key = f"{prefix}_{'_'.join(map(str, args))}"
    return hashlib.md5(key.encode()).hexdigest()

def clear_table(table_name):
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute(f'TRUNCATE TABLE "{table_name}" CASCADE;')
            conn.commit()
    logging.info(f"Cleared table: {table_name}")

def create_table(table_name):
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS "{table_name}" (
                    "Timestamp" BIGINT PRIMARY KEY,
                    "TotalVehicles" BIGINT NOT NULL,
                    "AverageSpeed" REAL NOT NULL,
                    "Density" REAL NOT NULL,
                    "AverageConfidence" REAL NOT NULL,
                    "VehicleTypeCounts" JSONB NOT NULL,
                    "LaneVehicleCounts" JSONB NOT NULL,
                    "LaneTypeCounts" JSONB NOT NULL
                );
            """)
            conn.commit()
    logging.info(f"Table {table_name} created or already exists")

def calculate_vehicle_speed(x1, y1, x2, y2, delta_t):
    """Calculate the speed of a vehicle based on its positions in two consecutive frames."""
    distance = ((x2 - x1)**2 + (y2 - y1)**2)**0.5
    return distance / delta_t

def preprocess_frame_data(start_time, end_time, chunk_size=CHUNK_SIZE):
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            query = """
            WITH consecutive_frames AS (
                SELECT 
                    "UnixTimestamp" AS timestamp,
                    "VehicleObjects"::jsonb AS vehicle_objects,
                    LAG("UnixTimestamp") OVER (ORDER BY "UnixTimestamp") AS prev_timestamp,
                    LAG("VehicleObjects"::jsonb) OVER (ORDER BY "UnixTimestamp") AS prev_vehicle_objects
                FROM "FramePrediction"
                WHERE "UnixTimestamp" BETWEEN %s AND %s
                ORDER BY "UnixTimestamp"
                LIMIT %s OFFSET %s
            )
            SELECT * FROM consecutive_frames WHERE prev_timestamp IS NOT NULL
            """
            
            offset = 0
            total_processed = 0
            
            while True:
                cur.execute(query, (start_time, end_time, chunk_size, offset))
                chunk = cur.fetchall()
                
                if not chunk:
                    break
                
                for row in chunk:
                    current_timestamp, current_vehicles, prev_timestamp, prev_vehicles = row
                    delta_t = (current_timestamp - prev_timestamp) / 1000 / FRAMES_PER_SECOND  # Adjust for 24 FPS
                    
                    processed_vehicles = []
                    for current_vehicle in current_vehicles:
                        vehicle_id = current_vehicle.get('id', current_vehicle.get('object_id', str(hash(json.dumps(current_vehicle)))))
                        
                        prev_vehicle = next((v for v in prev_vehicles if v.get('id', v.get('object_id', str(hash(json.dumps(v))))) == vehicle_id), None)
                        
                        if prev_vehicle:
                            try:
                                speed = calculate_vehicle_speed(
                                    prev_vehicle['x'], prev_vehicle['y'],
                                    current_vehicle['x'], current_vehicle['y'],
                                    delta_t
                                )
                                current_vehicle['speed'] = speed
                            except KeyError as e:
                                logging.warning(f"Missing key for speed calculation: {e}. Vehicle data: {current_vehicle}")
                                current_vehicle['speed'] = 0  # Set a default speed
                        
                        processed_vehicles.append(current_vehicle)
                    
                    yield (current_timestamp, processed_vehicles)
                
                total_processed += len(chunk)
                logging.debug(f"Processed {total_processed} records so far")
                offset += chunk_size

def aggregate_data(results):
    aggregated_data = []
    for timestamp, data in results.items():
        total_vehicles = data['total_vehicles']
        avg_speed = data['speed_sum'] / total_vehicles if total_vehicles > 0 else 0
        avg_density = data['density_sum'] / data['count'] if data['count'] > 0 else 0
        avg_confidence = data['confidence_sum'] / total_vehicles if total_vehicles > 0 else 0
        
        aggregated_data.append((
            timestamp,
            int(total_vehicles),
            avg_speed,
            avg_density,
            avg_confidence,
            json.dumps(data['vehicle_types']),
            json.dumps(data['lane_counts']),
            json.dumps(data['lane_types'])
        ))
    return aggregated_data


def parse_json_or_dict(data):
    if isinstance(data, dict):
        return data
    try:
        return json.loads(data)
    except json.JSONDecodeError:
        logging.warning(f"Failed to parse JSON: {data}")
        return {}

def insert_data(table_name, data):
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            insert_query = f"""
            INSERT INTO "{table_name}" (
                "Timestamp", "TotalVehicles", "AverageSpeed", "Density", 
                "AverageConfidence", "VehicleTypeCounts", "LaneVehicleCounts", "LaneTypeCounts"
            ) VALUES %s
            ON CONFLICT ("Timestamp") DO UPDATE SET
                "TotalVehicles" = EXCLUDED."TotalVehicles",
                "AverageSpeed" = EXCLUDED."AverageSpeed",
                "Density" = EXCLUDED."Density",
                "AverageConfidence" = EXCLUDED."AverageConfidence",
                "VehicleTypeCounts" = EXCLUDED."VehicleTypeCounts",
                "LaneVehicleCounts" = EXCLUDED."LaneVehicleCounts",
                "LaneTypeCounts" = EXCLUDED."LaneTypeCounts";
            """
            execute_values(cur, insert_query, data)
    logging.info(f"Inserted/Updated {len(data)} rows in {table_name}")

def main():
    try:
        with psycopg2.connect(**db_credentials) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT MIN(\"UnixTimestamp\"), MAX(\"UnixTimestamp\") FROM \"FramePrediction\";")
                min_timestamp, max_timestamp = cur.fetchone()
                if not max_timestamp:
                    logging.error("No data available for processing.")
                    return
                
                # Process all available data
                min_datetime = datetime.fromtimestamp(min_timestamp / 1000)
                max_datetime = datetime.fromtimestamp(max_timestamp / 1000)
                
                logging.info(f"Processing data from {min_datetime} to {max_datetime}")
                
                # Define time intervals and corresponding table names
                intervals = [
                    (1, "PerSecondData"),
                    (60, "PerMinuteData"),
                    (3600, "PerHourData"),
                    (86400, "PerDayData"),
                    (604800, "PerWeekData"),
                    (2592000, "PerMonthData"),
                    (31536000, "PerYearData")
                ]
                
                for interval, table_name in intervals:
                    create_table(table_name)
                    clear_table(table_name)

                
                logging.info("All data processed and committed successfully.")
    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        logging.exception("Exception details:")

if __name__ == "__main__":
    # Set up multiprocessing logging
    multiprocessing.log_to_stderr(logging.DEBUG)
    
    # Get the number of available CPU cores
    num_cores = multiprocessing.cpu_count()
    logging.info(f"Number of CPU cores available: {num_cores}")
    
    # Set the maximum number of processes to use (e.g., number of cores minus 1)
    max_processes = max(1, num_cores - 1)
    logging.info(f"Using {max_processes} processes for parallel processing")
    
    # Set the multiprocessing start method
    multiprocessing.set_start_method('spawn')
    
    # Run the main function
    main()