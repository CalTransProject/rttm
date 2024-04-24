import psycopg2
from dotenv import load_dotenv
import json
import os

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

def process_per_5_minute_data(cur, start_time, end_time):
    cur.execute("""
        SELECT 
            "Timestamp",
            "TotalVehicles",
            "AverageSpeed",
            "Density",
            "AverageConfidence",
            "VehicleTypeCounts"::jsonb,
            "LaneVehicleCounts"::jsonb,
            "LaneTypeCounts"::jsonb
        FROM "PerSecondData"
        WHERE "Timestamp" BETWEEN %s AND %s;
    """, (start_time, end_time))

    per_5_minute_data = {}

    for row in cur.fetchall():
        second, total_vehicles, average_speed, density, average_confidence, vehicle_type_counts, lane_vehicle_counts, lane_type_counts = row
        five_minute = (second // 300) * 300

        if five_minute not in per_5_minute_data:
            per_5_minute_data[five_minute] = {
                "TotalVehicles": 0,
                "TotalSpeed": 0,
                "TotalDensity": 0,
                "TotalConfidence": 0,
                "Count": 0,
                "VehicleTypeCounts": {},
                "LaneVehicleCounts": {},
                "LaneTypeCounts": {}
            }

        per_5_minute_data[five_minute]["TotalVehicles"] += total_vehicles
        per_5_minute_data[five_minute]["TotalSpeed"] += average_speed
        per_5_minute_data[five_minute]["TotalDensity"] += density
        per_5_minute_data[five_minute]["TotalConfidence"] += average_confidence
        per_5_minute_data[five_minute]["Count"] += 1

        for vehicle_type, count in vehicle_type_counts.items():
            per_5_minute_data[five_minute]["VehicleTypeCounts"][vehicle_type] = per_5_minute_data[five_minute]["VehicleTypeCounts"].get(vehicle_type, 0) + count

        for lane, count in lane_vehicle_counts.items():
            per_5_minute_data[five_minute]["LaneVehicleCounts"][lane] = per_5_minute_data[five_minute]["LaneVehicleCounts"].get(lane, 0) + count

        for lane, type_counts in lane_type_counts.items():
            if lane not in per_5_minute_data[five_minute]["LaneTypeCounts"]:
                per_5_minute_data[five_minute]["LaneTypeCounts"][lane] = {}
            for vehicle_type, count in type_counts.items():
                per_5_minute_data[five_minute]["LaneTypeCounts"][lane][vehicle_type] = per_5_minute_data[five_minute]["LaneTypeCounts"][lane].get(vehicle_type, 0) + count

    processed_per_5_minute_data = []
    for five_minute, data in per_5_minute_data.items():
        processed_per_5_minute_data.append((
            five_minute,
            data["TotalVehicles"],
            data["TotalSpeed"] / data["Count"],
            data["TotalDensity"] / data["Count"],
            data["TotalConfidence"] / data["Count"],
            json.dumps(data["VehicleTypeCounts"]),
            json.dumps(data["LaneVehicleCounts"]),
            json.dumps(data["LaneTypeCounts"])
        ))

    if processed_per_5_minute_data:
        columns = ', '.join([f'"{col}"' for col in (
            "Timestamp",
            "TotalVehicles",
            "AverageSpeed",
            "Density",
            "AverageConfidence",
            "VehicleTypeCounts",
            "LaneVehicleCounts",
            "LaneTypeCounts"
        )])

        placeholders = ', '.join(['%s'] * len(processed_per_5_minute_data[0]))

        query = f"INSERT INTO \"Per5MinuteData\" ({columns}) VALUES ({placeholders}) ON CONFLICT (\"Timestamp\") DO UPDATE SET \"TotalVehicles\" = EXCLUDED.\"TotalVehicles\", \"AverageSpeed\" = EXCLUDED.\"AverageSpeed\", \"Density\" = EXCLUDED.\"Density\", \"AverageConfidence\" = EXCLUDED.\"AverageConfidence\", \"VehicleTypeCounts\" = EXCLUDED.\"VehicleTypeCounts\", \"LaneVehicleCounts\" = EXCLUDED.\"LaneVehicleCounts\", \"LaneTypeCounts\" = EXCLUDED.\"LaneTypeCounts\";"

        try:
            cur.executemany(query, processed_per_5_minute_data)
        except Exception as e:
            print(f"Error inserting data: {e}")

def create_per_5_minute_table(cur):
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "Per5MinuteData" (
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

with psycopg2.connect(**db_credentials) as conn:
    with conn.cursor() as cur:
        vehicle_types = {
            1: 'Car', 2: 'Truck', 3: 'Bus', 4: 'Motorcycle', 5: 'Van',
            6: 'SUV', 7: 'Bicycle', 8: 'Pedestrian', 9: 'Pickup', 10: 'Sedan'
        }
        lanes = list(range(1, 21))
        ensure_vehicle_types_exist(cur, vehicle_types)
        ensure_lanes_exist(cur, lanes)

        create_per_5_minute_table(cur)

        cur.execute("SELECT MIN(\"Timestamp\"), MAX(\"Timestamp\") FROM \"PerSecondData\";")
        result = cur.fetchone()
        if result:
            start_timestamp, end_timestamp = result
            process_per_5_minute_data(cur, start_timestamp, end_timestamp)
            print("Per-5-minute data processed and inserted into Per5MinuteData successfully.")
        else:
            print("No data found in PerSecondData table.")

    conn.commit()