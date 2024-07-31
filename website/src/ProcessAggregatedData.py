import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv, find_dotenv
import os
import json
from datetime import datetime, timedelta
import logging
import memcache

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

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

def clear_tables(cur, tables_to_clear):
    for table in tables_to_clear:
        cur.execute(f'TRUNCATE TABLE "{table}" CASCADE;')
    logging.info(f"Cleared tables: {', '.join(tables_to_clear)}")

def create_aggregated_table(cur, table_name):
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
    logging.info(f"Table {table_name} created or already exists")

def calculate_per_second_data(cur, start_time, end_time):
    query = """
    WITH frame_data AS (
        SELECT 
            ("UnixTimestamp" / 1000)::BIGINT AS second,
            "VehicleObjects"::jsonb AS vehicle_objects
        FROM "FramePrediction"
        WHERE "UnixTimestamp" BETWEEN %s::BIGINT * 1000 AND %s::BIGINT * 1000
    ),
    expanded_data AS (
        SELECT
            fd.second,
            v.vehicle,
            (v.vehicle->>'speed')::float AS speed,
            (v.vehicle->>'confidence')::float AS confidence,
            v.vehicle->>'label' AS vehicle_type,
            v.vehicle->>'lane' AS lane
        FROM frame_data fd,
        jsonb_array_elements(fd.vehicle_objects) AS v(vehicle)
    ),
    aggregated_data AS (
        SELECT
            second,
            COUNT(DISTINCT vehicle) AS total_vehicles,
            AVG(speed) AS avg_speed,
            AVG(confidence) AS avg_confidence
        FROM expanded_data
        GROUP BY second
    ),
    vehicle_type_counts AS (
        SELECT
            second,
            jsonb_object_agg(vehicle_type, type_count) AS vehicle_type_counts
        FROM (
            SELECT second, vehicle_type, COUNT(*) AS type_count
            FROM expanded_data
            GROUP BY second, vehicle_type
        ) subquery
        GROUP BY second
    ),
    lane_vehicle_counts AS (
        SELECT
            second,
            jsonb_object_agg(lane, lane_count) AS lane_vehicle_counts
        FROM (
            SELECT second, lane, COUNT(*) AS lane_count
            FROM expanded_data
            GROUP BY second, lane
        ) subquery
        GROUP BY second
    )
    SELECT
        a.second,
        a.total_vehicles,
        a.avg_speed,
        a.avg_confidence,
        COALESCE(v.vehicle_type_counts, '{}'::jsonb) AS vehicle_type_counts,
        COALESCE(l.lane_vehicle_counts, '{}'::jsonb) AS lane_vehicle_counts
    FROM aggregated_data a
    LEFT JOIN vehicle_type_counts v ON a.second = v.second
    LEFT JOIN lane_vehicle_counts l ON a.second = l.second
    ORDER BY a.second;
    """
    cur.execute(query, (start_time, end_time))
    return cur.fetchall()

def process_aggregated_data(cur, table_name, time_interval, start_time, end_time):
    cache_key = f"{table_name}_{start_time}_{end_time}"
    cached_data = mc.get(cache_key)
    
    if cached_data:
        logging.info(f"Retrieved data from cache for {table_name}")
        return json.loads(cached_data)
    
    per_second_data = calculate_per_second_data(cur, start_time, end_time)
    
    aggregated_data = []
    for row in per_second_data:
        second, total_vehicles, avg_speed, avg_confidence, vehicle_type_counts, lane_vehicle_counts = row
        
        # Calculate density (vehicles per unit length, assuming 100m road segment)
        road_length = 100  # meters
        density = total_vehicles / road_length if avg_speed > 0 else 0
        
        aggregated_data.append((
            int(second * 1000),  # Convert back to milliseconds for consistency
            int(total_vehicles),
            float(avg_speed),
            float(density),
            float(avg_confidence),
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

def process_data_in_chunks(cur, table_name, time_interval, chunk_size, start_time, end_time):
    chunk_start = start_time
    while chunk_start < end_time:
        chunk_end = min(chunk_start + chunk_size, end_time)
        process_aggregated_data(cur, table_name, time_interval, chunk_start, chunk_end)
        chunk_start = chunk_end
        logging.info(f"Processed chunk from {datetime.fromtimestamp(chunk_start)} to {datetime.fromtimestamp(chunk_end)}")

def main():
    try:
        with psycopg2.connect(**db_credentials) as conn:
            with conn.cursor() as cur:
                # Check data availability and process
                cur.execute("SELECT MIN(\"UnixTimestamp\"), MAX(\"UnixTimestamp\") FROM \"FramePrediction\";")
                min_timestamp, max_timestamp = cur.fetchone()
                if not max_timestamp:
                    logging.error("No data available for processing.")
                    return
                
                min_timestamp = min_timestamp // 1000  # Convert to seconds
                max_timestamp = max_timestamp // 1000  # Convert to seconds
                available_seconds = max_timestamp - min_timestamp
                available_days = available_seconds / 86400  # Convert seconds to days
                
                # Define time ranges and intervals for all required granularities
                time_ranges = [
                    ("PerSecondData", 1, timedelta(hours=1)),
                    ("PerMinuteData", 60, timedelta(hours=6)),
                    ("Per5MinuteData", 300, timedelta(hours=12)),
                    ("PerHourData", 3600, timedelta(days=min(1, available_days))),
                    ("PerDayData", 86400, timedelta(days=min(7, available_days))),
                    ("PerWeekData", 604800, timedelta(days=min(30, available_days))),
                    ("PerMonthData", 2592000, timedelta(days=min(365, available_days))),
                    ("PerYearData", 31536000, timedelta(days=min(365, available_days)))
                ]
                
                # Clear all aggregated tables before processing
                tables_to_clear = [table_name for table_name, _, _ in time_ranges]
                clear_tables(cur, tables_to_clear)
                
                for table_name, interval, chunk_size in time_ranges:
                    create_aggregated_table(cur, table_name)
                    process_data_in_chunks(cur, table_name, interval, int(chunk_size.total_seconds()), min_timestamp, max_timestamp)
                
                conn.commit()
                logging.info("All data processed and committed successfully.")
    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
    except Exception as e:
        logging.error(f"An error occurred: {e}")

if __name__ == "__main__":
    main()