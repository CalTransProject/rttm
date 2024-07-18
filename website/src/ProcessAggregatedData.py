import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv, find_dotenv
import os
import json
from datetime import datetime, timedelta
import logging

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

def get_table_columns(cur, table_name):
    cur.execute(f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '{table_name}';
    """)
    return [row[0] for row in cur.fetchall()]

def update_speed_and_density_calculation(cur, start_time, end_time):
    columns = get_table_columns(cur, 'PerSecondData')
    logging.info(f"Columns in PerSecondData: {columns}")

    if "vehicleobjects" in columns:
        speed_calculation = """
            (SELECT AVG(CAST(vehicle->>'speed' AS FLOAT))
             FROM jsonb_array_elements("vehicleobjects") AS vehicle)
        """
    elif "VehicleObjects" in columns:
        speed_calculation = """
            (SELECT AVG(CAST(vehicle->>'speed' AS FLOAT))
             FROM jsonb_array_elements("VehicleObjects") AS vehicle)
        """
    else:
        speed_calculation = '"AverageSpeed"' if "AverageSpeed" in columns else "0"

    update_query = f"""
        UPDATE "PerSecondData"
        SET 
            "AverageSpeed" = CASE 
                WHEN "TotalVehicles" > 0 THEN {speed_calculation}
                ELSE 0
            END,
            "Density" = CASE 
                WHEN "AverageSpeed" > 0 THEN 
                    "TotalVehicles" / ("AverageSpeed" * 1)  -- Assuming 1 second interval
                ELSE 0
            END
        WHERE "Timestamp" BETWEEN %s AND %s;
    """
    
    cur.execute(update_query, (start_time, end_time))
    logging.info(f"Updated speed and density calculations for {cur.rowcount} rows")

def process_aggregated_data(cur, table_name, time_interval, start_time, end_time):
    columns = get_table_columns(cur, 'PerSecondData')
    
    basic_query = f"""
    SELECT 
        (FLOOR("Timestamp" / %s) * %s) AS aggregated_timestamp,
        SUM("TotalVehicles") AS total_vehicles,
        AVG("AverageSpeed") AS avg_speed,
        AVG("Density") AS density,
        AVG("AverageConfidence") AS avg_confidence
    FROM "PerSecondData"
    WHERE "Timestamp" BETWEEN %s AND %s
    GROUP BY aggregated_timestamp
    """
    cur.execute(basic_query, (time_interval, time_interval, start_time, end_time))
    basic_data = cur.fetchall()

    vehicle_type_counts_column = "VehicleTypeCounts" if "VehicleTypeCounts" in columns else "vehicletypecounts"
    lane_vehicle_counts_column = "LaneVehicleCounts" if "LaneVehicleCounts" in columns else "lanevehiclecounts"
    lane_type_counts_column = "LaneTypeCounts" if "LaneTypeCounts" in columns else "lanetypecounts"

    vehicle_type_query = f"""
    SELECT 
        (FLOOR("Timestamp" / %s) * %s) AS aggregated_timestamp,
        key,
        SUM(value::int) AS count_sum
    FROM "PerSecondData", jsonb_each_text("{vehicle_type_counts_column}")
    WHERE "Timestamp" BETWEEN %s AND %s
    GROUP BY aggregated_timestamp, key
    """
    cur.execute(vehicle_type_query, (time_interval, time_interval, start_time, end_time))
    vehicle_type_data = cur.fetchall()

    lane_vehicle_query = f"""
    SELECT 
        (FLOOR("Timestamp" / %s) * %s) AS aggregated_timestamp,
        key,
        SUM(value::int) AS count_sum
    FROM "PerSecondData", jsonb_each_text("{lane_vehicle_counts_column}")
    WHERE "Timestamp" BETWEEN %s AND %s
    GROUP BY aggregated_timestamp, key
    """
    cur.execute(lane_vehicle_query, (time_interval, time_interval, start_time, end_time))
    lane_vehicle_data = cur.fetchall()

    lane_type_query = f"""
    SELECT 
        (FLOOR("Timestamp" / %s) * %s) AS aggregated_timestamp,
        lane_key,
        type_key,
        SUM(type_value::int) AS type_count_sum
    FROM "PerSecondData",
         jsonb_each("{lane_type_counts_column}") AS lane_types(lane_key, lane_value),
         jsonb_each_text(lane_value) AS type_counts(type_key, type_value)
    WHERE "Timestamp" BETWEEN %s AND %s
    GROUP BY aggregated_timestamp, lane_key, type_key
    """
    cur.execute(lane_type_query, (time_interval, time_interval, start_time, end_time))
    lane_type_data = cur.fetchall()

    # Reconstruct JSONB objects from the aggregated data
    vehicle_type_counts = {}
    for row in vehicle_type_data:
        timestamp, key, count_sum = row
        if timestamp not in vehicle_type_counts:
            vehicle_type_counts[timestamp] = {}
        vehicle_type_counts[timestamp][key] = count_sum

    lane_vehicle_counts = {}
    for row in lane_vehicle_data:
        timestamp, key, count_sum = row
        if timestamp not in lane_vehicle_counts:
            lane_vehicle_counts[timestamp] = {}
        lane_vehicle_counts[timestamp][key] = count_sum

    lane_type_counts = {}
    for row in lane_type_data:
        timestamp, lane_key, type_key, type_count_sum = row
        if timestamp not in lane_type_counts:
            lane_type_counts[timestamp] = {}
        if lane_key not in lane_type_counts[timestamp]:
            lane_type_counts[timestamp][lane_key] = {}
        lane_type_counts[timestamp][lane_key][type_key] = type_count_sum

    # Combine all data
    aggregated_data = []
    for row in basic_data:
        timestamp = row[0]
        aggregated_data.append((
            timestamp,
            row[1],  # total_vehicles
            row[2],  # avg_speed
            row[3],  # density
            row[4],  # avg_confidence
            json.dumps(vehicle_type_counts.get(timestamp, {})),
            json.dumps(lane_vehicle_counts.get(timestamp, {})),
            json.dumps(lane_type_counts.get(timestamp, {}))
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
    else:
        logging.warning(f"No data to aggregate for {table_name}")

def check_data_availability(cur):
    cur.execute("SELECT MIN(\"Timestamp\"), MAX(\"Timestamp\") FROM \"PerSecondData\";")
    min_timestamp, max_timestamp = cur.fetchone()
    if min_timestamp and max_timestamp:
        logging.info(f"Data available from {datetime.fromtimestamp(min_timestamp)} to {datetime.fromtimestamp(max_timestamp)}")
        return min_timestamp, max_timestamp
    else:
        logging.warning("No data found in PerSecondData table.")
        return None, None

def process_data_in_chunks(cur, table_name, time_interval, chunk_size, start_time, end_time):
    chunk_start = start_time
    while chunk_start < end_time:
        chunk_end = min(chunk_start + chunk_size, end_time)
        update_speed_and_density_calculation(cur, chunk_start, chunk_end)
        process_aggregated_data(cur, table_name, time_interval, chunk_start, chunk_end)
        chunk_start = chunk_end
        logging.info(f"Processed chunk from {datetime.fromtimestamp(chunk_start)} to {datetime.fromtimestamp(chunk_end)}")

def main():
    try:
        with psycopg2.connect(**db_credentials) as conn:
            with conn.cursor() as cur:
                columns = get_table_columns(cur, 'PerSecondData')
                logging.info(f"Columns in PerSecondData: {columns}")

                min_timestamp, max_timestamp = check_data_availability(cur)
                if not max_timestamp:
                    logging.error("No data available for processing.")
                    return

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
                tables_to_clear = [table_name for table_name, _, _ in time_ranges if table_name != "PerSecondData"]
                clear_tables(cur, tables_to_clear)

                for table_name, interval, chunk_size in time_ranges:
                    if table_name != "PerSecondData":  # Skip PerSecondData as it's the source table
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