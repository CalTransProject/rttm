import psycopg2
from dotenv import load_dotenv, find_dotenv
import json
import os

# Find and load environment variables from .env file for database credentials
dotenv_path = find_dotenv('website/server/database/db.env')
if not dotenv_path:
    print("Error: .env file not found.")
else:
    load_dotenv(dotenv_path)
    print(f"Loaded .env from: {dotenv_path}")

# Print environment variables for debugging
print("DB_NAME:", os.getenv("DB_NAME"))
print("DB_USER:", os.getenv("DB_USER"))
print("DB_PASSWORD:", os.getenv("DB_PASSWORD"))
print("DB_HOST:", os.getenv("DB_HOST"))
print("DB_PORT:", os.getenv("DB_PORT"))

# Database credentials
db_credentials = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

# Check if the database credentials are correctly loaded
print("Database credentials:", db_credentials)

# Function to ensure all vehicle types exist in the database
def ensure_vehicle_types_exist(cur, vehicle_types):
    for vt_id, vt_name in vehicle_types.items():
        cur.execute("""
            INSERT INTO "VehicleType" ("TypeID", "TypeName", "Description")
            VALUES (%s, %s, %s) ON CONFLICT ("TypeID") DO NOTHING;
        """, (vt_id, vt_name, f'Description of {vt_name}'))

# Function to ensure all lanes exist in the database
def ensure_lanes_exist(cur, lanes):
    for lane_id in lanes:
        cur.execute("""
            INSERT INTO "Lane" ("LaneID", "RoadName", "Direction")
            VALUES (%s, 'Main Road', 'Both') ON CONFLICT ("LaneID") DO NOTHING;
        """, (lane_id,))

def process_per_second_data(cur, start_time, num_seconds=86400):
    for i in range(num_seconds):
        timestamp = start_time + i
        cur.execute("""
            SELECT "NumberOfVehicles", "VehicleObjects"
            FROM "FramePrediction"
            WHERE "UnixTimestamp" = %s;
        """, (timestamp,))
        result = cur.fetchone()

        if result:
            num_vehicles, vehicle_objects = result
            if vehicle_objects:
                try:
                    vehicle_objects = json.loads(vehicle_objects)  # Load JSON from the fetched string
                    speeds = [obj.get('speed', 0) for obj in vehicle_objects]
                    average_speed = sum(speeds) / len(speeds) if speeds else 0
                    average_confidence = sum(obj['confidence'] for obj in vehicle_objects) / len(vehicle_objects) if vehicle_objects else 0
                    density = num_vehicles / 100  # Assume a unit area or road segment length of 100 for density calculations

                    vehicle_type_counts = {}
                    lane_vehicle_counts = {}
                    lane_type_counts = {}

                    for obj in vehicle_objects:
                        vehicle_type = obj['label']
                        lane_id = obj['land']

                        vehicle_type_counts[vehicle_type] = vehicle_type_counts.get(vehicle_type, 0) + 1
                        lane_vehicle_counts[lane_id] = lane_vehicle_counts.get(lane_id, 0) + 1
                        lane_type_counts.setdefault(lane_id, {}).update({vehicle_type: lane_type_counts.get(lane_id, {}).get(vehicle_type, 0) + 1})

                        # Print the values being processed
                        print(f"Timestamp: {timestamp}, Vehicle Type: {vehicle_type}, Lane ID: {lane_id}")

                    print(f"Timestamp: {timestamp}, Vehicle Type Counts: {vehicle_type_counts}")
                    print(f"Timestamp: {timestamp}, Lane Vehicle Counts: {lane_vehicle_counts}")
                    print(f"Timestamp: {timestamp}, Lane Type Counts: {lane_type_counts}")

                    # Convert the data to JSON strings
                    vehicle_type_counts_json = json.dumps(vehicle_type_counts)
                    lane_vehicle_counts_json = json.dumps(lane_vehicle_counts)
                    lane_type_counts_json = json.dumps(lane_type_counts)

                    cur.execute("""
                        INSERT INTO "PerSecondData" ("Timestamp", "TotalVehicles", "AverageSpeed", "Density", "AverageConfidence",
                                                     "VehicleTypeCounts", "LaneVehicleCounts", "LaneTypeCounts")
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT ("Timestamp") DO UPDATE SET --This ensures data is updated not duplicated 
                            "TotalVehicles" = EXCLUDED."TotalVehicles",
                            "AverageSpeed" = EXCLUDED."AverageSpeed",
                            "Density" = EXCLUDED."Density",
                            "AverageConfidence" = EXCLUDED."AverageConfidence",
                            "VehicleTypeCounts" = EXCLUDED."VehicleTypeCounts",
                            "LaneVehicleCounts" = EXCLUDED."LaneVehicleCounts",
                            "LaneTypeCounts" = EXCLUDED."LaneTypeCounts";
                    """, (timestamp, num_vehicles, average_speed, density, average_confidence,
                          vehicle_type_counts_json, lane_vehicle_counts_json, lane_type_counts_json))
                except Exception as e:
                    print(f"Error occurred for timestamp {timestamp}: {e}")
            else:
                print(f"No vehicle objects found for timestamp: {timestamp}")
        else:
            print(f"No data found for timestamp: {timestamp}")

with psycopg2.connect(**db_credentials) as conn:
    with conn.cursor() as cur:
        vehicle_types = {
            1: 'Car', 2: 'Truck', 3: 'Bus', 4: 'Motorcycle', 5: 'Van',
            6: 'SUV', 7: 'Bicycle', 8: 'Pedestrian', 9: 'Pickup', 10: 'Sedan'
        }
        lanes = list(range(1, 21))
        ensure_vehicle_types_exist(cur, vehicle_types)
        ensure_lanes_exist(cur, lanes)

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

        cur.execute("SELECT MIN(\"UnixTimestamp\") FROM \"FramePrediction\";")
        start_timestamp = cur.fetchone()[0] if cur.rowcount > 0 else 0
        process_per_second_data(cur, start_timestamp, num_seconds=86400)

    print("86400 rows of data processed and inserted into PerSecondData successfully.")
