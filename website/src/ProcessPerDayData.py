import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv, find_dotenv
import os
import json
from datetime import datetime, timedelta
import logging
import random

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

def create_perdaydata_table():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS "PerDayData" (
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
    logging.info("Table PerDayData created or already exists")

def clear_perdaydata_table():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute('TRUNCATE TABLE "PerDayData";')
            conn.commit()
    logging.info("PerDayData table cleared")

def get_perhourdata(cur):
    query = """
    SELECT 
        "Timestamp",
        "TotalVehicles",
        "AverageSpeed",
        "Density",
        "AverageConfidence",
        "VehicleTypeCounts",
        "LaneVehicleCounts",
        "LaneTypeCounts"
    FROM "PerHourData"
    ORDER BY "Timestamp"
    LIMIT 24
    """
    
    cur.execute(query)
    return cur.fetchall()

def parse_json_or_dict(data):
    if isinstance(data, dict):
        return data
    try:
        return json.loads(data)
    except json.JSONDecodeError:
        logging.warning(f"Failed to parse JSON: {data}")
        return {}

def randomize_value(value, fluctuation_range=0.2):
    return value * (1 + random.uniform(-fluctuation_range, fluctuation_range))

def aggregate_perdaydata(hour_data, week_start):
    day_data = []
    
    for day in range(7):
        total_vehicles = 0
        speed_sum = 0
        density_sum = 0
        confidence_sum = 0
        vehicle_types = {}
        lane_counts = {}
        lane_types = {}
        
        # Randomly sample and aggregate 24 hours worth of data
        for _ in range(24):
            hour = random.choice(hour_data)
            
            total_vehicles += randomize_value(hour[1])
            speed_sum += randomize_value(hour[2]) * hour[1]
            density_sum += randomize_value(hour[3])
            confidence_sum += randomize_value(hour[4]) * hour[1]
            
            for vtype, count in parse_json_or_dict(hour[5]).items():
                vehicle_types[vtype] = vehicle_types.get(vtype, 0) + randomize_value(count)
            
            for lane, count in parse_json_or_dict(hour[6]).items():
                lane_counts[lane] = lane_counts.get(lane, 0) + randomize_value(count)
            
            for lane_type, count in parse_json_or_dict(hour[7]).items():
                lane_types[lane_type] = lane_types.get(lane_type, 0) + randomize_value(count)
        
        avg_speed = speed_sum / total_vehicles if total_vehicles > 0 else 0
        avg_density = density_sum / 24
        avg_confidence = confidence_sum / total_vehicles if total_vehicles > 0 else 0
        
        day_data.append((
            week_start + day * 86400000,  # timestamp for each day
            int(total_vehicles),
            avg_speed,
            avg_density,
            avg_confidence,
            json.dumps({k: int(v) for k, v in vehicle_types.items()}),
            json.dumps({k: int(v) for k, v in lane_counts.items()}),
            json.dumps({k: int(v) for k, v in lane_types.items()})
        ))
    
    return day_data

def insert_perdaydata(cur, data):
    insert_query = """
    INSERT INTO "PerDayData" (
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
    logging.info(f"Inserted/Updated {len(data)} rows in PerDayData")

def main():
    try:
        with psycopg2.connect(**db_credentials) as conn:
            conn.set_session(autocommit=True)
            with conn.cursor() as cur:
                cur.execute("SELECT MAX(\"Timestamp\") FROM \"PerHourData\";")
                max_timestamp = cur.fetchone()[0]
                if not max_timestamp:
                    logging.error("No data available in PerHourData for processing.")
                    return
                
                # Calculate the start of the current week (Sunday)
                current_week_start = max_timestamp - ((max_timestamp - 345600000) % 604800000)
                
                logging.info(f"Processing data for the week of {datetime.fromtimestamp(current_week_start/1000)}")
                
                create_perdaydata_table()
                clear_perdaydata_table()
                
                # Get 24 hours of data from PerHourData
                hour_data = get_perhourdata(cur)
                logging.info(f"Retrieved {len(hour_data)} rows from PerHourData")
                
                # Log the structure of the first row
                if hour_data:
                    logging.info(f"Structure of first row: {hour_data[0]}")
                    logging.info(f"Types of data in first row: {[type(item) for item in hour_data[0]]}")
                
                # Aggregate and randomize data into daily intervals
                day_data = aggregate_perdaydata(hour_data, current_week_start)
                
                # Insert aggregated data into PerDayData
                insert_perdaydata(cur, day_data)
                
                logging.info("Data processing completed successfully.")
    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        logging.exception("Exception details:")

if __name__ == "__main__":
    main()