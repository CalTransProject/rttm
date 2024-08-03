import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv, find_dotenv
import os
import json
from datetime import datetime, timedelta
import logging
import memcache
from tqdm import tqdm
import hashlib
from multiprocessing import Pool, cpu_count
import time

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
dotenv_path = find_dotenv('website/server/database/db.env')
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

def get_cache_key(prefix, *args):
    """Generate a unique cache key based on the prefix and arguments."""
    key = f"{prefix}_{'_'.join(map(str, args))}"
    return hashlib.md5(key.encode()).hexdigest()

def clear_tables(tables_to_clear):
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            for table in tables_to_clear:
                cur.execute(f'TRUNCATE TABLE "{table}" CASCADE;')
            conn.commit()
    logging.info(f"Cleared tables: {', '.join(tables_to_clear)}")

def create_aggregated_table(table_name):
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS "{table_name}" (
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
    logging.info(f"Table {table_name} created or already exists")

def calculate_vehicle_speed(x1, y1, x2, y2, delta_t):
    """Calculate the speed of a vehicle based on its positions in two consecutive frames."""
    distance = ((x2 - x1)**2 + (y2 - y1)**2)**0.5
    return distance / delta_t

def preprocess_frame_data(cur, start_time, end_time):
    """Preprocess frame data to calculate individual vehicle speeds."""
    query = """
    WITH consecutive_frames AS (
        SELECT 
            "UnixTimestamp" AS timestamp,
            "VehicleObjects"::jsonb AS vehicle_objects,
            LAG("UnixTimestamp") OVER (ORDER BY "UnixTimestamp") AS prev_timestamp,
            LAG("VehicleObjects"::jsonb) OVER (ORDER BY "UnixTimestamp") AS prev_vehicle_objects
        FROM "FramePrediction"
        WHERE "UnixTimestamp" BETWEEN %s AND %s
    )
    SELECT * FROM consecutive_frames WHERE prev_timestamp IS NOT NULL
    """
    cur.execute(query, (start_time, end_time))
    
    processed_data = []
    for row in cur.fetchall():
        current_timestamp, current_vehicles, prev_timestamp, prev_vehicles = row
        delta_t = (current_timestamp - prev_timestamp) / 1000  # Convert to seconds
        
        for current_vehicle in current_vehicles:
            vehicle_id = current_vehicle['id']
            prev_vehicle = next((v for v in prev_vehicles if v['id'] == vehicle_id), None)
            
            if prev_vehicle:
                speed = calculate_vehicle_speed(
                    prev_vehicle['x'], prev_vehicle['y'],
                    current_vehicle['x'], current_vehicle['y'],
                    delta_t
                )
                current_vehicle['speed'] = speed
        
        processed_data.append((current_timestamp, current_vehicles))
    
    return processed_data

def calculate_per_second_data(cur, start_time, end_time):
    logging.debug(f"Calculating per-second data from {start_time} to {end_time}")
    cache_key = get_cache_key("per_second_data", start_time, end_time)
    cached_data = mc.get(cache_key)
    if cached_data:
        logging.info(f"Retrieved per-second data from cache for {start_time} to {end_time}")
        return cached_data

    processed_data = preprocess_frame_data(cur, start_time, end_time)
    
    result = []
    for timestamp, vehicles in processed_data:
        total_vehicles = len(vehicles)
        avg_speed = sum(v['speed'] for v in vehicles) / total_vehicles if total_vehicles > 0 else 0
        avg_confidence = sum(float(v['confidence']) for v in vehicles) / total_vehicles if total_vehicles > 0 else 0
        
        vehicle_type_counts = {}
        lane_vehicle_counts = {}
        for v in vehicles:
            vehicle_type_counts[v['label']] = vehicle_type_counts.get(v['label'], 0) + 1
            lane_vehicle_counts[v['lane']] = lane_vehicle_counts.get(v['lane'], 0) + 1
        
        result.append((
            timestamp,
            total_vehicles,
            avg_speed,
            avg_confidence,
            json.dumps(vehicle_type_counts),
            json.dumps(lane_vehicle_counts)
        ))

    logging.debug(f"Calculated {len(result)} rows of per-second data")
    mc.set(cache_key, result, time=3600)  # Cache for 1 hour
    logging.info(f"Cached per-second data for {start_time} to {end_time}")
    return result

def process_aggregated_data(cur, table_name, time_interval, start_time, end_time):
    logging.debug(f"Processing aggregated data for {table_name} from {start_time} to {end_time}")
    cache_key = get_cache_key("aggregated_data", table_name, start_time, end_time)
    cached_data = mc.get(cache_key)
    
    if cached_data:
        logging.info(f"Retrieved aggregated data from cache for {table_name}")
        return json.loads(cached_data)
    
    per_second_data = calculate_per_second_data(cur, start_time, end_time)
    
    aggregated_data = []
    for i in range(0, len(per_second_data), time_interval):
        chunk = per_second_data[i:i+time_interval]
        if not chunk:
            continue
        
        timestamp = chunk[0][0]
        total_vehicles = sum(row[1] for row in chunk)
        avg_speed = sum(row[2] * row[1] for row in chunk) / total_vehicles if total_vehicles > 0 else 0
        avg_confidence = sum(row[3] * row[1] for row in chunk) / total_vehicles if total_vehicles > 0 else 0
        
        vehicle_type_counts = {}
        lane_vehicle_counts = {}
        for row in chunk:
            for vtype, count in json.loads(row[4]).items():
                vehicle_type_counts[vtype] = vehicle_type_counts.get(vtype, 0) + count
            for lane, count in json.loads(row[5]).items():
                lane_vehicle_counts[lane] = lane_vehicle_counts.get(lane, 0) + count
        
        density = total_vehicles / ROAD_LENGTH if avg_speed > 0 else 0
        
        aggregated_data.append((
            timestamp,
            total_vehicles,
            avg_speed,
            density,
            avg_confidence,
            json.dumps(vehicle_type_counts),
            json.dumps(lane_vehicle_counts),
            json.dumps({})  # Placeholder for LaneTypeCounts
        ))
    
    if aggregated_data:
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
        execute_values(cur, insert_query, aggregated_data)
        logging.info(f"Inserted/Updated {len(aggregated_data)} rows in {table_name}")
        
        mc.set(cache_key, json.dumps(aggregated_data), time=3600)  # Cache for 1 hour
    else:
        logging.warning(f"No data to aggregate for {table_name}")
        
    return aggregated_data

def process_chunk(args):
    table_name, time_interval, start_time, end_time = args
    logging.debug(f"Processing chunk for {table_name} from {start_time} to {end_time}")
    try:
        with psycopg2.connect(**db_credentials) as conn:
            conn.set_session(autocommit=True)
            with conn.cursor() as cur:
                data = process_aggregated_data(cur, table_name, time_interval, start_time, end_time)
        return len(data)
    except Exception as e:
        logging.error(f"Error processing chunk: {e}")
        return 0

def process_data_in_parallel(table_name, time_interval, chunk_size, start_time, end_time):
    chunks = []
    current_start = start_time
    while current_start < end_time:
        chunk_end = min(current_start + chunk_size, end_time)
        chunks.append((table_name, time_interval, current_start, chunk_end))
        current_start = chunk_end

    total_chunks = len(chunks)
    with Pool(processes=cpu_count()) as pool:
        with tqdm(total=total_chunks, desc=f"Processing {table_name}", unit="chunk") as pbar:
            for result in pool.imap_unordered(process_chunk, chunks):
                pbar.update(1)
                pbar.set_postfix({"Rows": result})

def main():
    try:
        with psycopg2.connect(**db_credentials) as conn:
            conn.set_session(autocommit=True)
            with conn.cursor() as cur:
                cur.execute("SELECT MIN(\"UnixTimestamp\"), MAX(\"UnixTimestamp\") FROM \"FramePrediction\";")
                min_timestamp, max_timestamp = cur.fetchone()
                if not max_timestamp:
                    logging.error("No data available for processing.")
                    return
                
                # Ensure we're only processing one day of data
                min_datetime = datetime.fromtimestamp(min_timestamp / 1000)
                max_datetime = min(datetime.fromtimestamp(max_timestamp / 1000), min_datetime + timedelta(days=1))
                
                min_timestamp = int(min_datetime.timestamp() * 1000)
                max_timestamp = int(max_datetime.timestamp() * 1000)
                
                available_seconds = (max_timestamp - min_timestamp) // 1000
                available_hours = available_seconds / 3600
                
                logging.info(f"Processing data from {min_datetime} to {max_datetime}")
                logging.info(f"Total available hours: {available_hours:.2f}")
                
                time_ranges = [
                    ("PerSecondData", 1, timedelta(minutes=5).total_seconds()),
                    ("PerMinuteData", 60, timedelta(minutes=30).total_seconds()),
                    ("Per5MinuteData", 300, timedelta(hours=1).total_seconds()),
                    ("PerHourData", 3600, timedelta(hours=4).total_seconds()),
                ]
                
                tables_to_clear = [table_name for table_name, _, _ in time_ranges]
                clear_tables(tables_to_clear)
                
                for table_name, interval, chunk_size in time_ranges:
                    create_aggregated_table(table_name)
                    process_data_in_parallel(table_name, interval, int(chunk_size * 1000), min_timestamp, max_timestamp)
                
                logging.info("All data processed and committed successfully.")
    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        logging.exception("Exception details:")

if __name__ == "__main__":
    main()