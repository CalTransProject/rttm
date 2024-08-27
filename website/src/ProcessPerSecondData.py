# File: process_perseconddata.py
# Description: This script processes and aggregates traffic data into second intervals,
#              optimized for large datasets with millions of records at 24 frames per second.

import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv, find_dotenv
import os
import json
from datetime import datetime, timedelta
import logging
import memcache
import hashlib
from tqdm import tqdm

# Real-world data insertion point 1:
# Import necessary libraries for interfacing with the VLP-32C sensor
# For example:
# from velodyne_decoder import VLP32CDecoder
# from your_data_acquisition_module import acquire_vlp32c_data, process_vlp32c_data

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

# Real-world data insertion point 2:
# Initialize your VLP-32C sensor interface here
# sensor = VLP32CDecoder()

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

def create_perseconddata_table():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS "PerSecondData" (
                    "Timestamp" BIGINT PRIMARY KEY,
                    "TotalVehicles" INTEGER NOT NULL,
                    "AverageSpeed" REAL NOT NULL,
                    "Density" REAL NOT NULL,
                    "AverageConfidence" REAL NOT NULL,
                    "VehicleTypeCounts" JSONB NOT NULL,
                    "LaneVehicleCounts" JSONB NOT NULL,
                    "LaneTypeCounts" JSONB NOT NULL
                );
            """)
            conn.commit()
    logging.info("Table PerSecondData created or already exists")

def calculate_vehicle_speed(x1, y1, x2, y2, delta_t):
    """Calculate the speed of a vehicle based on its positions in two consecutive frames."""
    distance = ((x2 - x1)**2 + (y2 - y1)**2)**0.5
    return distance / delta_t

def preprocess_frame_data(cur, start_time, end_time, chunk_size=CHUNK_SIZE):
    """Preprocess frame data to calculate individual vehicle speeds, using chunks."""
    # Real-world data insertion point 3:
    # Replace this query with a function that retrieves data directly from the VLP-32C sensor
    # For example:
    # def get_vlp32c_data(start_time, end_time, chunk_size):
    #     raw_data = acquire_vlp32c_data(sensor, start_time, end_time, chunk_size)
    #     return process_vlp32c_data(raw_data)
    
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
            
            # Log the structure of the first vehicle object
            if total_processed == 0 and current_vehicles:
                logging.info(f"Structure of a vehicle object: {json.dumps(current_vehicles[0], indent=2)}")
            
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

def process_perseconddata(cur, start_time, end_time):
    logging.debug(f"Processing PerSecondData from {start_time} to {end_time}")
    cache_key = get_cache_key("perseconddata", start_time, end_time)
    cached_data = mc.get(cache_key)
    
    if cached_data:
        logging.info(f"Retrieved PerSecondData from cache")
        return json.loads(cached_data)
    
    result = {}
    
    with tqdm(total=TOTAL_RECORDS, desc="Processing frame data", unit="frame") as pbar:
        for timestamp, vehicles in preprocess_frame_data(cur, start_time, end_time):
            second_timestamp = timestamp // 1000  # Convert to seconds
            if second_timestamp not in result:
                result[second_timestamp] = {
                    'total_vehicles': 0,
                    'speed_sum': 0,
                    'confidence_sum': 0,
                    'vehicle_types': {},
                    'lane_counts': {},
                    'frame_count': 0
                }
            
            result[second_timestamp]['total_vehicles'] += len(vehicles)
            result[second_timestamp]['speed_sum'] += sum(v.get('speed', 0) for v in vehicles)
            result[second_timestamp]['confidence_sum'] += sum(float(v.get('confidence', 0)) for v in vehicles)
            result[second_timestamp]['frame_count'] += 1
            
            for v in vehicles:
                vtype = v.get('label', 'unknown')
                lane = v.get('lane', 'unknown')
                result[second_timestamp]['vehicle_types'][vtype] = result[second_timestamp]['vehicle_types'].get(vtype, 0) + 1
                result[second_timestamp]['lane_counts'][lane] = result[second_timestamp]['lane_counts'].get(lane, 0) + 1
            
            pbar.update(1)

    per_second_data = []
    for timestamp, data in result.items():
        frames = data['frame_count']
        if frames > 0:
            avg_vehicles = data['total_vehicles'] / frames
            avg_speed = data['speed_sum'] / data['total_vehicles'] if data['total_vehicles'] > 0 else 0
            avg_confidence = data['confidence_sum'] / data['total_vehicles'] if data['total_vehicles'] > 0 else 0
            density = avg_vehicles / ROAD_LENGTH
            
            vehicle_types = {k: v / frames for k, v in data['vehicle_types'].items()}
            lane_counts = {k: v / frames for k, v in data['lane_counts'].items()}
            
            per_second_data.append((
                timestamp * 1000,  # Convert back to milliseconds
                avg_vehicles,
                avg_speed,
                density,
                avg_confidence,
                json.dumps(vehicle_types),
                json.dumps(lane_counts),
                json.dumps({})  # Placeholder for LaneTypeCounts
            ))

    logging.info(f"Processed {len(per_second_data)} seconds of data")
    
    if per_second_data:
        insert_query = """
            INSERT INTO "PerSecondData" (
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
        execute_values(cur, insert_query, per_second_data)
        logging.info(f"Inserted/Updated {len(per_second_data)} rows in PerSecondData")
        
        mc.set(cache_key, json.dumps(per_second_data), time=3600)  # Cache for 1 hour
    else:
        logging.warning(f"No data to aggregate for PerSecondData")
    
    return per_second_data

def main():
    try:
        with psycopg2.connect(**db_credentials) as conn:
            conn.set_session(autocommit=True)
            with conn.cursor() as cur:
                # Real-world data insertion point 4:
                # Replace this query with a function that gets the time range directly from the VLP-32C sensor
                # For example:
                # start_time, end_time = get_vlp32c_time_range(sensor)
                cur.execute("SELECT MIN(\"UnixTimestamp\"), MAX(\"UnixTimestamp\") FROM \"FramePrediction\";")
                min_timestamp, max_timestamp = cur.fetchone()
                if not max_timestamp:
                    logging.error("No data available for processing.")
                    return
                
                # Process all available data
                min_datetime = datetime.fromtimestamp(min_timestamp / 1000)
                max_datetime = datetime.fromtimestamp(max_timestamp / 1000)
                
                min_timestamp = int(min_datetime.timestamp() * 1000)
                max_timestamp = int(max_datetime.timestamp() * 1000)
                
                available_seconds = (max_timestamp - min_timestamp) / 1000
                
                logging.info(f"Processing data from {min_datetime} to {max_datetime}")
                logging.info(f"Total available seconds: {available_seconds:.2f}")
                
                clear_table("PerSecondData")
                create_perseconddata_table()
                process_perseconddata(cur, min_timestamp, max_timestamp)
                
                logging.info("PerSecondData processed and committed successfully.")
    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        logging.exception("Exception details:")

if __name__ == "__main__":
    main()