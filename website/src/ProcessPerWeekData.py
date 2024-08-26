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

def create_perweekdata_table():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS "PerWeekData" (
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
    logging.info("Table PerWeekData created or already exists")

def clear_perweekdata_table():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute('TRUNCATE TABLE "PerWeekData";')
            conn.commit()
    logging.info("PerWeekData table cleared")

def get_perdaydata(cur):
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
    FROM "PerDayData"
    ORDER BY "Timestamp"
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

def randomize_value(value, fluctuation_range=0.1):
    return value * (1 + random.uniform(-fluctuation_range, fluctuation_range))

def aggregate_perweekdata(day_data):
    week_data = []
    
    # Get the timestamp of the first day
    first_day_timestamp = min(day[0] for day in day_data)
    first_day = datetime.fromtimestamp(first_day_timestamp / 1000)
    
    # Find the most recent Sunday to start our weeks
    week_start = first_day - timedelta(days=first_day.weekday())
    
    for week in range(5):  # Generate 5 weeks of data
        total_vehicles = 0
        speed_sum = 0
        density_sum = 0
        confidence_sum = 0
        vehicle_types = {}
        lane_counts = {}
        lane_types = {}
        
        # Randomly sample and aggregate 7 days worth of data
        for _ in range(7):
            day = random.choice(day_data)
            
            total_vehicles += randomize_value(day[1])
            speed_sum += randomize_value(day[2]) * day[1]
            density_sum += randomize_value(day[3])
            confidence_sum += randomize_value(day[4]) * day[1]
            
            for vtype, count in parse_json_or_dict(day[5]).items():
                vehicle_types[vtype] = vehicle_types.get(vtype, 0) + randomize_value(count)
            
            for lane, count in parse_json_or_dict(day[6]).items():
                lane_counts[lane] = lane_counts.get(lane, 0) + randomize_value(count)
            
            for lane_type, count in parse_json_or_dict(day[7]).items():
                lane_types[lane_type] = lane_types.get(lane_type, 0) + randomize_value(count)
        
        avg_speed = speed_sum / total_vehicles if total_vehicles > 0 else 0
        avg_density = density_sum / 7
        avg_confidence = confidence_sum / total_vehicles if total_vehicles > 0 else 0
        
        week_timestamp = int(week_start.timestamp() * 1000)
        
        week_data.append((
            week_timestamp,
            int(total_vehicles),
            avg_speed,
            avg_density,
            avg_confidence,
            json.dumps({k: int(v) for k, v in vehicle_types.items()}),
            json.dumps({k: int(v) for k, v in lane_counts.items()}),
            json.dumps({k: int(v) for k, v in lane_types.items()})
        ))
        
        # Move to next week
        week_start += timedelta(days=7)
    
    return week_data

def insert_perweekdata(cur, data):
    insert_query = """
    INSERT INTO "PerWeekData" (
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
    logging.info(f"Inserted/Updated {len(data)} rows in PerWeekData")

def main():
    try:
        with psycopg2.connect(**db_credentials) as conn:
            conn.set_session(autocommit=True)
            with conn.cursor() as cur:
                create_perweekdata_table()
                clear_perweekdata_table()
                
                # Get data from PerDayData
                day_data = get_perdaydata(cur)
                logging.info(f"Retrieved {len(day_data)} rows from PerDayData")
                
                if not day_data:
                    logging.error("No data available in PerDayData for processing.")
                    return
                
                # Log the structure of the first row
                logging.info(f"Structure of first row: {day_data[0]}")
                logging.info(f"Types of data in first row: {[type(item) for item in day_data[0]]}")
                
                # Aggregate and randomize data into weekly intervals
                week_data = aggregate_perweekdata(day_data)
                
                # Insert aggregated data into PerWeekData
                insert_perweekdata(cur, week_data)
                
                logging.info("Data processing completed successfully.")
    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        logging.exception("Exception details:")

if __name__ == "__main__":
    main()