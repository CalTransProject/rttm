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

def create_peryeardata_table():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS "PerYearData" (
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
    logging.info("Table PerYearData created or already exists")

def clear_peryeardata_table():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute('TRUNCATE TABLE "PerYearData";')
            conn.commit()
    logging.info("PerYearData table cleared")

def get_permonthdata(cur):
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
    FROM "PerMonthData"
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

def randomize_value(value, fluctuation_range=0.05):
    return value * (1 + random.uniform(-fluctuation_range, fluctuation_range))

def aggregate_peryeardata(month_data):
    year_data = []
    
    # Get the timestamp of the first month
    first_month_timestamp = min(month[0] for month in month_data)
    first_day = datetime.fromtimestamp(first_month_timestamp / 1000)
    
    # Find the first day of the year
    current_year_start = first_day.replace(month=1, day=1)
    
    for year in range(5):  # Generate 5 years of data
        total_vehicles = 0
        speed_sum = 0
        density_sum = 0
        confidence_sum = 0
        vehicle_types = {}
        lane_counts = {}
        lane_types = {}
        
        # Randomly sample and aggregate 12 months worth of data
        for _ in range(12):
            month = random.choice(month_data)
            
            total_vehicles += randomize_value(month[1])
            speed_sum += randomize_value(month[2]) * month[1]
            density_sum += randomize_value(month[3])
            confidence_sum += randomize_value(month[4]) * month[1]
            
            for vtype, count in parse_json_or_dict(month[5]).items():
                vehicle_types[vtype] = vehicle_types.get(vtype, 0) + randomize_value(count)
            
            for lane, count in parse_json_or_dict(month[6]).items():
                lane_counts[lane] = lane_counts.get(lane, 0) + randomize_value(count)
            
            for lane_type, count in parse_json_or_dict(month[7]).items():
                lane_types[lane_type] = lane_types.get(lane_type, 0) + randomize_value(count)
        
        avg_speed = speed_sum / total_vehicles if total_vehicles > 0 else 0
        avg_density = density_sum / 12
        avg_confidence = confidence_sum / total_vehicles if total_vehicles > 0 else 0
        
        year_timestamp = int(current_year_start.timestamp() * 1000)
        
        year_data.append((
            year_timestamp,
            int(total_vehicles),
            avg_speed,
            avg_density,
            avg_confidence,
            json.dumps({k: int(v) for k, v in vehicle_types.items()}),
            json.dumps({k: int(v) for k, v in lane_counts.items()}),
            json.dumps({k: int(v) for k, v in lane_types.items()})
        ))
        
        # Move to next year
        current_year_start = current_year_start.replace(year=current_year_start.year + 1)
    
    return year_data

def insert_peryeardata(cur, data):
    insert_query = """
    INSERT INTO "PerYearData" (
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
    logging.info(f"Inserted/Updated {len(data)} rows in PerYearData")

def main():
    try:
        with psycopg2.connect(**db_credentials) as conn:
            conn.set_session(autocommit=True)
            with conn.cursor() as cur:
                create_peryeardata_table()
                clear_peryeardata_table()
                
                # Get data from PerMonthData
                month_data = get_permonthdata(cur)
                logging.info(f"Retrieved {len(month_data)} rows from PerMonthData")
                
                if not month_data:
                    logging.error("No data available in PerMonthData for processing.")
                    return
                
                # Log the structure of the first row
                logging.info(f"Structure of first row: {month_data[0]}")
                logging.info(f"Types of data in first row: {[type(item) for item in month_data[0]]}")
                
                # Aggregate and randomize data into yearly intervals
                year_data = aggregate_peryeardata(month_data)
                
                # Insert aggregated data into PerYearData
                insert_peryeardata(cur, year_data)
                
                logging.info("Data processing completed successfully.")
    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        logging.exception("Exception details:")

if __name__ == "__main__":
    main()