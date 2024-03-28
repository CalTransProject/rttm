import psycopg2
import os
import time
from dotenv import load_dotenv
import json

# Load environment variables from .env file for database credentials
load_dotenv(dotenv_path='server/database/db.env')

# Database credentials
db_credentials = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

def ensure_vehicle_types_exist(cur, vehicle_types):
    """Ensure all vehicle types exist in the database."""
    for vt_id, vt_name in vehicle_types.items():
        cur.execute("""
            INSERT INTO "VehicleType" ("TypeID", "TypeName", "Description")
            VALUES (%s, %s, %s) ON CONFLICT ("TypeID") DO NOTHING;
        """, (vt_id, vt_name, f'Description of {vt_name}'))

def ensure_lanes_exist(cur, lanes):
    """Ensure all lanes exist in the database."""
    for lane_id in lanes:
        cur.execute("""
            INSERT INTO "Lane" ("LaneID", "RoadName", "Direction")
            VALUES (%s, 'Main Road', 'Both') ON CONFLICT ("LaneID") DO NOTHING;
        """, (lane_id,))

def process_per_second_data(cur, start_time, end_time):
    """Processes per-frame data into per-second data and stores it in the historical data table."""
    # Retrieve the unique seconds within the specified time range from the FramePrediction table
    cur.execute("""
        SELECT DISTINCT ("UnixTimestamp" / 1000) AS "Second"
        FROM "FramePrediction"
        WHERE "UnixTimestamp" BETWEEN %s AND %s;
    """, (start_time, end_time))
    unique_seconds = [row[0] for row in cur.fetchall()]

    # Process the data for each unique second
    for second in unique_seconds:
        # Retrieve the frames for the current second
        cur.execute("""
            SELECT "NumberOfVehicles", CAST("VehicleObjects" AS JSONB)
            FROM "FramePrediction"
            WHERE "UnixTimestamp" >= %s AND "UnixTimestamp" < %s;
        """, (second * 1000, (second + 1) * 1000))
        second_frames = cur.fetchall()

        total_vehicles = sum(frame[0] for frame in second_frames)
        vehicle_objects = [frame[1] for frame in second_frames]
        flattened_objects = [obj for sublist in vehicle_objects for obj in sublist]

        # Calculate metrics
        average_speed = round(sum(obj.get('speed', 0) for obj in flattened_objects) / len(flattened_objects), 2) if flattened_objects else 0
        density = round(len(flattened_objects) / (100 * len(second_frames)), 2) if second_frames else 0
        average_confidence = round(sum(obj.get('confidence', 0) for obj in flattened_objects) / len(flattened_objects), 2) if flattened_objects else 0

        # Count vehicles by type and lane
        vehicle_type_count = {}
        lane_vehicle_count = {}
        lane_type_count = {}

        for obj in flattened_objects:
            vt_name = obj.get('label', 'Unknown')  # Handle missing label
            if vt_name in vehicle_types.values():
                vt_id = list(vehicle_types.keys())[list(vehicle_types.values()).index(vt_name)]
                vehicle_type_count[f"Type{vt_id}"] = vehicle_type_count.get(f"Type{vt_id}", 0) + 1

            lane = obj.get('lane', 0)  # Handle missing lane, assign 0 for missing lane
            if 1 <= lane <= 20:
                lane_vehicle_count[f"Lane{lane}"] = lane_vehicle_count.get(f"Lane{lane}", 0) + 1
                lane_type_count[f"Lane{lane}"] = vt_name

        # Update the HistoricalData table if a row with the same UnixTimestamp exists, otherwise insert a new row
        query = """
            UPDATE "HistoricalData"
            SET "TotalVehicles" = %s,
                "AverageSpeed" = %s,
                "Density" = %s,
                "AverageConfidence" = %s,
                "VehicleTypeCounts" = %s,
                "LaneVehicleCounts" = %s
            WHERE "UnixTimestamp" = %s;

            INSERT INTO "HistoricalData" ("UnixTimestamp", "TotalVehicles", "AverageSpeed", "Density", "AverageConfidence", "VehicleTypeCounts", "LaneVehicleCounts")
            SELECT %s, %s, %s, %s, %s, %s, %s
            WHERE NOT EXISTS (
                SELECT 1 FROM "HistoricalData" WHERE "UnixTimestamp" = %s
            );
        """
        cur.execute(query, (total_vehicles, average_speed, density, average_confidence, json.dumps(vehicle_type_count), json.dumps(lane_vehicle_count), second,
                            second, total_vehicles, average_speed, density, average_confidence, json.dumps(vehicle_type_count), json.dumps(lane_vehicle_count), second))

        # Insert the per-second data into the PerSecondData table
        cur.execute("""
            INSERT INTO "PerSecondData" ("Timestamp", "TotalVehicles", "AverageSpeed", "Density", "AverageConfidence",
                                         "VehicleTypeCounts", "LaneVehicleCounts", "LaneTypeCounts")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT ("Timestamp") DO UPDATE SET
                "TotalVehicles" = EXCLUDED."TotalVehicles",
                "AverageSpeed" = EXCLUDED."AverageSpeed",
                "Density" = EXCLUDED."Density",
                "AverageConfidence" = EXCLUDED."AverageConfidence",
                "VehicleTypeCounts" = EXCLUDED."VehicleTypeCounts",
                "LaneVehicleCounts" = EXCLUDED."LaneVehicleCounts",
                "LaneTypeCounts" = EXCLUDED."LaneTypeCounts";
        """, (second, total_vehicles, average_speed, density, average_confidence,
              json.dumps(vehicle_type_count), json.dumps(lane_vehicle_count), json.dumps(lane_type_count)))

try:
    # Connect to the PostgreSQL database
    conn = psycopg2.connect(**db_credentials)
    cur = conn.cursor()

    # Ensure vehicle types and lanes exist
    vehicle_types = {
        1: 'Car',
        2: 'Truck',
        3: 'Bus',
        4: 'Motorcycle',
        5: 'Van',
        6: 'SUV',
        7: 'Bicycle',
        8: 'Pedestrian',
        9: 'Pickup',
        10: 'Sedan'
    }
    lanes = list(range(1, 21))
    ensure_vehicle_types_exist(cur, vehicle_types)
    ensure_lanes_exist(cur, lanes)

    # Create the PerSecondData table if it doesn't exist
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

    # Check if the VehicleTypeCounts column exists in the HistoricalData table
    cur.execute("""
        SELECT column_name 
        FROM information_schema.columns
        WHERE table_name = 'HistoricalData' AND column_name = 'VehicleTypeCounts';
    """)
    if not cur.fetchone():
        # Add the VehicleTypeCounts column to the HistoricalData table
        cur.execute("""
            ALTER TABLE "HistoricalData"
            ADD COLUMN "VehicleTypeCounts" JSONB;
        """)
    
    # Check if the LaneVehicleCounts column exists in the HistoricalData table
    cur.execute("""
        SELECT column_name 
        FROM information_schema.columns
        WHERE table_name = 'HistoricalData' AND column_name = 'LaneVehicleCounts';
    """)
    if not cur.fetchone():
        # Add the LaneVehicleCounts column to the HistoricalData table
        cur.execute("""
            ALTER TABLE "HistoricalData"
            ADD COLUMN "LaneVehicleCounts" JSONB;
        """)

    # Get the minimum and maximum timestamps from the FramePrediction table
    cur.execute("SELECT MIN(\"UnixTimestamp\"), MAX(\"UnixTimestamp\") FROM \"FramePrediction\";")
    min_timestamp, max_timestamp = cur.fetchone()

    # Process the data for the available time range
    start_time = min_timestamp
    end_time = max_timestamp
    process_per_second_data(cur, start_time, end_time)

    # Commit the changes
    conn.commit()
    print("Data processed and inserted successfully.")

except (Exception, psycopg2.DatabaseError) as error:
    print(f"Error: {error}")

finally:
    if cur is not None:
        cur.close()
    if conn is not None:
        conn.close()
    print("Database connection closed.")