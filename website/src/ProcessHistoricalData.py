import psycopg2
import os
import time
from dotenv import load_dotenv
import random
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

def process_per_frame_data(cur, num_rows):
    """Processes per-frame data for historical analysis."""
    vehicle_types = {1: 'Car', 2: 'Truck', 3: 'Bus', 4: 'Motorcycle', 5: 'Van', 6: 'SUV', 7: 'Bicycle', 8: 'Pedestrian'}
    lanes = [1, 2, 3, 4]
    weather_conditions = ['Sunny', 'Rainy', 'Cloudy', 'Snowy']

    # Ensure vehicle types and lanes exist
    ensure_vehicle_types_exist(cur, vehicle_types)
    ensure_lanes_exist(cur, lanes)

    timestamp = int(time.time())  # Get the current timestamp

    for _ in range(num_rows):
        # Generate fake data for "Weather" table
        condition = random.choice(weather_conditions)
        temperature = round(random.uniform(-10, 40), 2)
        cur.execute("""
            INSERT INTO "Weather" ("Timestamp", "Condition", "Temperature")
            VALUES (%s, %s, %s) RETURNING "WeatherID";
        """, (timestamp, condition, temperature))
        weather_id = cur.fetchone()[0]

        # Generate fake data for "Real_Time_Traffic_Data" table
        vehicle_count = random.randint(1, 100)
        speed = round(random.uniform(20, 100), 2)
        lane_id = random.choice(lanes)
        cur.execute("""
            INSERT INTO "Real_Time_Traffic_Data" ("Timestamp", "VehicleCount", "Speed", "LaneID", "WeatherID")
            VALUES (%s, %s, %s, %s, %s);
        """, (timestamp, vehicle_count, speed, lane_id, weather_id))

       # Generate fake data for "HistoricalData" table
        total_vehicles = random.randint(1, 100)
        average_speed = round(random.uniform(20, 100), 2)
        density = round(random.uniform(0, 1), 2)
        average_confidence = round(random.uniform(0.5, 1), 2)

        cur.execute("""
            INSERT INTO "HistoricalData" ("UnixTimestamp", "TotalVehicles", "AverageSpeed", "Density", "AverageConfidence")
            VALUES (%s, %s, %s, %s, %s) RETURNING "DataID";
        """, (timestamp, total_vehicles, average_speed, density, average_confidence))
        historical_data_id = cur.fetchone()[0]

        # Generate fake data for auxiliary tables
        vehicle_type_count = {vt_id: random.randint(1, 10) for vt_id in vehicle_types.keys()}
        lane_vehicle_count = {lane: random.randint(1, 10) for lane in lanes}
        lane_type_count = {(lane, vt_id): random.randint(1, 5) for lane in lanes for vt_id in vehicle_types.keys()}

        for vt_id, count in vehicle_type_count.items():
            cur.execute("""
                INSERT INTO "HistoricalData_VehicleTypeCount" ("HistoricalDataID", "VehicleTypeID", "Count")
                VALUES (%s, %s, %s);
            """, (historical_data_id, vt_id, count))

        for lane_id, count in lane_vehicle_count.items():
            cur.execute("""
                INSERT INTO "HistoricalData_LaneVehicleCount" ("HistoricalDataID", "LaneID", "Count")
                VALUES (%s, %s, %s);
            """, (historical_data_id, lane_id, count))

        for (lane_id, vt_id), count in lane_type_count.items():
            cur.execute("""
                INSERT INTO "HistoricalData_LaneTypeCount" ("HistoricalDataID", "LaneID", "VehicleTypeID", "Count")
                VALUES (%s, %s, %s, %s);
            """, (historical_data_id, lane_id, vt_id, count))


        # Generate fake data for "ModifiedVehicle" table
        for _ in range(random.randint(1, 10)):
            coordinates = json.dumps([random.uniform(0, 100), random.uniform(0, 100)])
            dimension = json.dumps([random.uniform(1, 5), random.uniform(1, 3)])
            classification = random.choice(list(vehicle_types.values()))
            confidence_level = round(random.uniform(0.5, 1), 2)
            lane = random.choice(lanes)
            cur.execute("""
                INSERT INTO "ModifiedVehicle" ("CoordinatesOfCenter", "Dimension", "Classification", "ConfidenceLevel", "Lane")
                VALUES (%s, %s, %s, %s, %s) RETURNING "VehicleID";
            """, (coordinates, dimension, classification, confidence_level, lane))
            vehicle_id = cur.fetchone()[0]

            # Generate fake data for "VehicleHistory" table
            for _ in range(random.randint(1, 5)):
                historical_timestamp = timestamp - random.randint(60, 600)
                location_history = json.dumps([random.uniform(0, 100), random.uniform(0, 100)])
                cur.execute("""
                    INSERT INTO "VehicleHistory" ("VehicleID", "HistoricalTimestamp", "LocationHistory")
                    VALUES (%s, %s, %s);
                """, (vehicle_id, historical_timestamp, location_history))

            # Generate fake data for "VehicleDetectionEvent" table
            event_types = ['Entry', 'Exit']
            for _ in range(random.randint(1, 3)):
                event_timestamp = timestamp - random.randint(30, 300)
                event_type = random.choice(event_types)
                event_description = f'{event_type} event for vehicle {vehicle_id}'
                cur.execute("""
                    INSERT INTO "VehicleDetectionEvent" ("VehicleID", "UnixTimestamp", "EventType", "EventDescription")
                    VALUES (%s, %s, %s, %s);
                """, (vehicle_id, event_timestamp, event_type, event_description))

        # Generate fake data for "FramePrediction" table
        num_vehicles = random.randint(1, 20)
        num_vehicles_in_each_lane = {lane: random.randint(0, 5) for lane in lanes}
        vehicle_objects = json.dumps([{
            'vid': random.randint(1, 100),
            'position': [random.uniform(0, 100), random.uniform(0, 100)],
            'dimension': [random.uniform(1, 5), random.uniform(1, 3)],
            'label': random.choice(list(vehicle_types.values())),
            'lane': random.choice(lanes),
            'confidence': round(random.uniform(0.5, 1), 2)
        } for _ in range(num_vehicles)])
        cur.execute("""
            INSERT INTO "FramePrediction" ("UnixTimestamp", "NumberOfVehicles", "NumberOfVehiclesInEachLane", "VehicleObjects")
            VALUES (%s, %s, %s, %s);
        """, (timestamp, num_vehicles, json.dumps(num_vehicles_in_each_lane), vehicle_objects))

        timestamp += 1  # Increment the timestamp for the next row

try:
    # Connect to the PostgreSQL database
    conn = psycopg2.connect(**db_credentials)
    cur = conn.cursor()

    # Process the data and generate multiple rows
    num_rows = 100  # Specify the number of rows you want to generate
    process_per_frame_data(cur, num_rows)

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