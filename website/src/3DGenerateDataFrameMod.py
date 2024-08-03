import psycopg2
import json
import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from tqdm import tqdm
from psycopg2.extras import execute_values
import memcache
import logging
from multiprocessing import Pool, cpu_count
import time
import sys

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv(dotenv_path='website/server/database/db.env')

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

veh_label = ["sedan", "suv", "truck", "bus", "pickup", "van"]

def get_cached_vehicle_data(cache_key='vehicle_data', num_templates=100):
    cached_data = mc.get(cache_key)
    if not cached_data:
        cached_data = [
            {
                "vid": i,
                "dimension": [random.randint(0, 20), random.randint(0, 20)],
                "label": random.choice(veh_label),
                "confidence": round(random.random(), 2)
            } for i in range(num_templates)
        ]
        mc.set(cache_key, cached_data, time=3600)  # Cache for 1 hour
    return cached_data

def modify_table_schemas():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            try:
                cur.execute("""
                    ALTER TABLE "FramePrediction"
                    ALTER COLUMN "UnixTimestamp" TYPE BIGINT USING "UnixTimestamp"::bigint;
                """)
                logging.info("Modified FramePrediction.UnixTimestamp to BIGINT type.")
                
                cur.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_constraint WHERE conname = 'FramePrediction_UnixTimestamp_key'
                        ) THEN
                            ALTER TABLE "FramePrediction" 
                            ADD CONSTRAINT "FramePrediction_UnixTimestamp_key" UNIQUE ("UnixTimestamp");
                        END IF;
                    END $$;
                """)
                logging.info("Added unique constraint to FramePrediction.UnixTimestamp if not exists.")
                
                conn.commit()
                logging.info("Table schemas modified successfully.")
            except psycopg2.Error as e:
                logging.error(f"Error modifying table schemas: {e}")
                conn.rollback()

def clear_tables():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            try:
                cur.execute('TRUNCATE TABLE "FramePrediction" CASCADE;')
                conn.commit()
                logging.info("FramePrediction table cleared successfully.")
            except psycopg2.Error as e:
                logging.error(f"Error clearing tables: {e}")
                conn.rollback()

def ensure_lane_ids():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            try:
                for lane_id in range(1, 4):
                    cur.execute(
                        '''
                        INSERT INTO "Lane" ("RoadName", "Direction")
                        VALUES (%s, %s) ON CONFLICT DO NOTHING;
                        ''',
                        ('Main Street', 'North')
                    )
                conn.commit()
                logging.info("Lane IDs ensured.")
            except psycopg2.Error as e:
                logging.error(f"Error ensuring lane IDs: {e}")
                conn.rollback()

def generate_data_chunk(args):
    start_time, end_time, frames_per_second = args
    
    vehicle_templates = get_cached_vehicle_data()
    
    chunk_data = []
    current_time = start_time
    while current_time < end_time:
        unix_timestamp = int(current_time.timestamp() * 1000)
        
        pred = random.sample(vehicle_templates, random.randint(1, 10))
        for p in pred:
            p['position'] = [random.randint(0, 2000), random.randint(0, 2000)]
            p['lane'] = random.choice([1, 2, 3])
            p['speed'] = random.uniform(30, 100)
        
        veh_in_lane = {f"lane{lane_id}": sum(v['lane'] == lane_id for v in pred) for lane_id in range(1, 4)}
        
        chunk_data.append((
            unix_timestamp,
            len(pred),
            json.dumps(veh_in_lane),
            json.dumps(pred)
        ))
        
        current_time += timedelta(seconds=1/frames_per_second)
    
    return chunk_data

def process_and_insert_chunk(args):
    chunk_data = generate_data_chunk(args)
    return insert_chunk_data(chunk_data)

def insert_chunk_data(chunk_data):
    try:
        with psycopg2.connect(**db_credentials) as conn:
            with conn.cursor() as cur:
                insert_frame_query = """
                INSERT INTO "FramePrediction" ("UnixTimestamp", "NumberOfVehicles", "NumberOfVehiclesInEachLane", "VehicleObjects")
                VALUES %s
                ON CONFLICT ("UnixTimestamp") DO UPDATE SET
                    "NumberOfVehicles" = EXCLUDED."NumberOfVehicles",
                    "NumberOfVehiclesInEachLane" = EXCLUDED."NumberOfVehiclesInEachLane",
                    "VehicleObjects" = EXCLUDED."VehicleObjects";
                """
                execute_values(cur, insert_frame_query, chunk_data)
                conn.commit()
        return len(chunk_data)
    except Exception as e:
        logging.error(f"Error inserting chunk data: {e}")
        return 0

def insert_fake_data_parallel(num_days=1, frames_per_second=24):
    start_time = datetime.now().replace(microsecond=0, second=0, minute=0, hour=0) - timedelta(days=num_days)
    end_time = start_time + timedelta(days=num_days)
    
    num_processes = cpu_count()
    chunk_size = timedelta(minutes=5)  # Process data in 5-minute chunks for 1 day
    
    chunks = []
    current_chunk_start = start_time
    while current_chunk_start < end_time:
        chunk_end = min(current_chunk_start + chunk_size, end_time)
        chunks.append((current_chunk_start, chunk_end, frames_per_second))
        current_chunk_start = chunk_end
    
    total_frames = num_days * 24 * 3600 * frames_per_second
    
    with Pool(num_processes) as pool:
        with tqdm(total=total_frames, desc="Generating and inserting data", unit="frame") as pbar:
            for inserted_count in pool.imap_unordered(process_and_insert_chunk, chunks):
                pbar.update(inserted_count)
    
    logging.info(f"Total records inserted/updated: {total_frames}")

def main():
    start_time = time.time()
    try:
        modify_table_schemas()
        clear_tables()
        ensure_lane_ids()
        insert_fake_data_parallel(num_days=1, frames_per_second=24)  # Generate data for 1 day
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        logging.exception("Exception details:")
    finally:
        end_time = time.time()
        logging.info(f"Data generation completed. Total time: {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    main()