import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv, find_dotenv
import os
import json
from datetime import datetime, timedelta
import logging
import random
import calendar

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

def create_permonthdata_table():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS "PerMonthData" (
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
    logging.info("Table PerMonthData created or already exists")

def clear_permonthdata_table():
    with psycopg2.connect(**db_credentials) as conn:
        with conn.cursor() as cur:
            cur.execute('TRUNCATE TABLE "PerMonthData";')
            conn.commit()
    logging.info("PerMonthData table cleared")

def get_perweekdata(cur):
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
    FROM "PerWeekData"
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

def aggregate_permonthdata(week_data):
    month_data = []
    
    # Get the timestamp of the first week
    first_week_timestamp = min(week[0] for week in week_data)
    first_day = datetime.fromtimestamp(first_week_timestamp / 1000)
    
    # Find the first day of the month
    current_month_start = first_day.replace(day=1)
    
    for month in range(12):  # Generate 12 months of data
        total_vehicles = 0
        speed_sum = 0
        density_sum = 0
        confidence_sum = 0
        vehicle_types = {}
        lane_counts = {}
        lane_types = {}
        
        # Determine the number of weeks in this month
        if month == 11:  # Last month
            weeks_in_month = 5  # Ensure we use all remaining data
        else:
            next_month = current_month_start + timedelta(days=32)
            next_month = next_month.replace(day=1)
            days_in_month = (next_month - current_month_start).days
            weeks_in_month = (days_in_month + 6) // 7  # Round up to nearest week
        
        # Randomly sample and aggregate weeks worth of data
        for _ in range(weeks_in_month):
            week = random.choice(week_data)
            
            total_vehicles += randomize_value(week[1])
            speed_sum += randomize_value(week[2]) * week[1]
            density_sum += randomize_value(week[3])
            confidence_sum += randomize_value(week[4]) * week[1]
            
            for vtype, count in parse_json_or_dict(week[5]).items():
                vehicle_types[vtype] = vehicle_types.get(vtype, 0) + randomize_value(count)
            
            for lane, count in parse_json_or_dict(week[6]).items():
                lane_counts[lane] = lane_counts.get(lane, 0) + randomize_value(count)
            
            for lane_type, count in parse_json_or_dict(week[7]).items():
                lane_types[lane_type] = lane_types.get(lane_type, 0) + randomize_value(count)
        
        avg_speed = speed_sum / total_vehicles if total_vehicles > 0 else 0
        avg_density = density_sum / weeks_in_month
        avg_confidence = confidence_sum / total_vehicles if total_vehicles > 0 else 0
        
        month_timestamp = int(current_month_start.timestamp() * 1000)
        
        month_data.append((
            month_timestamp,
            int(total_vehicles),
            avg_speed,
            avg_density,
            avg_confidence,
            json.dumps({k: int(v) for k, v in vehicle_types.items()}),
            json.dumps({k: int(v) for k, v in lane_counts.items()}),
            json.dumps({k: int(v) for k, v in lane_types.items()})
        ))
        
        # Move to next month
        current_month_start = (current_month_start + timedelta(days=32)).replace(day=1)
    
    return month_data

def insert_permonthdata(cur, data):
    insert_query = """
    INSERT INTO "PerMonthData" (
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
    logging.info(f"Inserted/Updated {len(data)} rows in PerMonthData")

def main():
    try:
        with psycopg2.connect(**db_credentials) as conn:
            conn.set_session(autocommit=True)
            with conn.cursor() as cur:
                create_permonthdata_table()
                clear_permonthdata_table()
                
                # Get data from PerWeekData
                week_data = get_perweekdata(cur)
                logging.info(f"Retrieved {len(week_data)} rows from PerWeekData")
                
                if not week_data:
                    logging.error("No data available in PerWeekData for processing.")
                    return
                
                # Log the structure of the first row
                logging.info(f"Structure of first row: {week_data[0]}")
                logging.info(f"Types of data in first row: {[type(item) for item in week_data[0]]}")
                
                # Aggregate and randomize data into monthly intervals
                month_data = aggregate_permonthdata(week_data)
                
                # Insert aggregated data into PerMonthData
                insert_permonthdata(cur, month_data)
                
                logging.info("Data processing completed successfully.")
    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        logging.exception("Exception details:")

if __name__ == "__main__":
    main()