import psycopg2
import json
import os
import random
import time
from dotenv import load_dotenv

print(os.getcwd())
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

print(f"DB_USER: {os.getenv('DB_USER')}")
print(f"DB_PASSWORD: {os.getenv('DB_PASSWORD')}")
print(f"DB_HOST: {os.getenv('DB_HOST')}")
print(f"DB_PORT: {os.getenv('DB_PORT')}")
print(f"DB_NAME: {os.getenv('DB_NAME')}")

# Connect to your PostgreSQL database
conn = psycopg2.connect(**db_credentials)
cur = conn.cursor()

# Ensure Lane IDs Exist (Assuming lanes 1 to 3 need to exist)
for lane_id in range(1, 4):  # Adjust range as necessary
    cur.execute(
        '''
        INSERT INTO "Lane" ("LaneID", "RoadName", "Direction")
        VALUES (%s, 'Main Street', 'North') ON CONFLICT ("LaneID") DO NOTHING;
        ''',
        (lane_id,)
    )
conn.commit()

veh_label = ["sedan", "suv", "truck", "bus", "pickup", "van"]

# Function to generate fake data and insert it into the database
def insert_fake_data():
    start_timestamp = int(time.time())
    
    for x in range(1, 1200):
        timestamp = start_timestamp + x
        generate_lane = lambda: random.choice([1, 2, 3])  # Use existing Lane IDs

        pred = [{
            "vid": random.randint(0, 5),
            "position": [random.randint(0, 2000), random.randint(0, 2000)],
            "dimension": [random.randint(0, 20), random.randint(0, 20)],
            "label": random.choice(veh_label),
            "land": generate_lane(),
            "confidence": round(random.random(), 2),
            "iconfidence": round(random.random(), 2)
        } for _ in range(random.randint(1, 10))]

        veh_in_lane = {"lane1": random.randint(0, 5), "lane2": random.randint(0, 5), "lane3": random.randint(0, 5)}

        # Insert data into the "FramePrediction" table
        insert_frame_query = """
        INSERT INTO "FramePrediction" ("UnixTimestamp", "NumberOfVehicles", "NumberOfVehiclesInEachLane", "VehicleObjects")
        VALUES (%s, %s, %s, %s);
        """
        cur.execute(insert_frame_query, (timestamp, len(pred), json.dumps(veh_in_lane), json.dumps(pred)))

        # Insert data into the "ModifiedVehicle" table
        for prediction in pred:
            insert_vehicle_query = """
            INSERT INTO "ModifiedVehicle" ("FrameUnixTimestamp", "ConfidenceLevel", "Lane", "Dimension", "CoordinatesOfCenter", "Classification")
            VALUES (%s, %s, %s, %s, %s, %s);
            """
            cur.execute(insert_vehicle_query, (timestamp, prediction["confidence"], prediction["land"], json.dumps(prediction["dimension"]), json.dumps(prediction["position"]), prediction["label"]))

        if x % 20 == 0:
            time.sleep(1)

    conn.commit()

insert_fake_data()

cur.close()
conn.close()
