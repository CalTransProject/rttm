# File: process_perhourdata.py
# Description: This script retrieves data from PerMinuteData, aggregates it into hourly intervals,
#              and inserts it into the PerHourData table.

import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv, find_dotenv
import os
import json
from datetime import datetime
import logging
from tqdm import tqdm

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

def create_perhourdata_table():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS "PerHourData" (
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
    logging.info("Table PerHourData created or already exists")

def get_perminutedata(cur, start_time, end_time, chunk_size=3600):
    query = """
    SELECT 
        "Timestamp",
        "TotalVehicles",
        "AverageSpeed",
        "Density",
        "AverageConfidence",
        "VehicleTypeCounts",
        "LaneVehicleCounts"
    FROM "PerMinuteData"
    WHERE "Timestamp" BETWEEN %s AND %s
    ORDER BY "Timestamp"
    LIMIT %s OFFSET %s
    """
    
    offset = 0
    while True:
        cur.execute(query, (start_time, end_time, chunk_size, offset))
        chunk = cur.fetchall()
        if not chunk:
            break
        for row in chunk:
            yield row
        offset += chunk_size

def aggregate_perhourdata(minute_data):
    hour_data = {}
    for row in minute_data:
        timestamp, total_vehicles, avg_speed, density, avg_confidence, vehicle_types, lane_counts = row
        hour_timestamp = (timestamp // 3600000) * 3600000
        
        if hour_timestamp not in hour_data:
            hour_data[hour_timestamp] = {
                "total_vehicles": 0,
                "speed_sum": 0,
                "density_sum": 0,
                "confidence_sum": 0,
                "vehicle_types": {},
                "lane_counts": {},
                "count": 0
            }
        
        data = hour_data[hour_timestamp]
        data["total_vehicles"] += total_vehicles
        data["speed_sum"] += avg_speed * total_vehicles
        data["density_sum"] += density
        data["confidence_sum"] += avg_confidence * total_vehicles
        data["count"] += 1
        
        for vtype, count in vehicle_types.items():
            data["vehicle_types"][vtype] = data["vehicle_types"].get(vtype, 0) + count
        for lane, count in lane_counts.items():
            data["lane_counts"][lane] = data["lane_counts"].get(lane, 0) + count
    
    result = []
    for timestamp, data in hour_data.items():
        result.append((
            timestamp,
            data["total_vehicles"],
            data["speed_sum"] / data["total_vehicles"] if data["total_vehicles"] > 0 else 0,
            data["density_sum"] / data["count"],
            data["confidence_sum"] / data["total_vehicles"] if data["total_vehicles"] > 0 else 0,
            json.dumps(data["vehicle_types"]),
            json.dumps(data["lane_counts"]),
            '{}'  # Empty JSON for LaneTypeCounts
        ))
    return result

def insert_perhourdata(cur, data):
    insert_query = """
    INSERT INTO "PerHourData" (
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
    logging.info(f"Inserted/Updated {len(data)} rows in PerHourData")

def main():
    try:
        with psycopg2.connect(**db_credentials) as conn:
            conn.set_session(autocommit=True)
            with conn.cursor() as cur:
                cur.execute("SELECT MIN(\"Timestamp\"), MAX(\"Timestamp\") FROM \"PerMinuteData\";")
                min_timestamp, max_timestamp = cur.fetchone()
                if not max_timestamp:
                    logging.error("No data available in PerMinuteData for processing.")
                    return
                
                min_datetime = datetime.fromtimestamp(min_timestamp / 1000)
                max_datetime = datetime.fromtimestamp(max_timestamp / 1000)
                
                logging.info(f"Processing data from {min_datetime} to {max_datetime}")
                
                create_perhourdata_table()
                
                # Process data in chunks of 1 day
                chunk_size = 86400  # seconds in a day
                for chunk_start in range(min_timestamp, max_timestamp + 1, chunk_size * 1000):
                    chunk_end = min(chunk_start + chunk_size * 1000, max_timestamp)
                    
                    # Get data from PerMinuteData
                    minute_data = list(get_perminutedata(cur, chunk_start, chunk_end))
                    
                    # Aggregate data into hourly intervals
                    hour_data = aggregate_perhourdata(minute_data)
                    
                    # Insert aggregated data into PerHourData
                    insert_perhourdata(cur, hour_data)
                    
                    logging.info(f"Processed chunk from {datetime.fromtimestamp(chunk_start/1000)} to {datetime.fromtimestamp(chunk_end/1000)}")
                
                logging.info("Data processing completed successfully.")
    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        logging.exception("Exception details:")

if __name__ == "__main__":
    main()