import psycopg2
import json
import os
import random
import time
from dotenv import load_dotenv

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

# Connect to your PostgreSQL database
conn = psycopg2.connect(**db_credentials)
cur = conn.cursor()

# Ensure Lane IDs Exist (Assuming lanes 1 to 3 need to exist)
for lane_id in range(1, 4):
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
def insert_fake_data(num_days=1, num_seconds_per_day=86400):
    # Fetch the highest UnixTimestamp currently in the database to avoid duplicates
    cur.execute('SELECT MAX("UnixTimestamp") FROM "FramePrediction";')
    result = cur.fetchone()
    last_timestamp = result[0] if result[0] is not None else int(time.time())

    for day in range(num_days):
        for second in range(num_seconds_per_day):
            # Increment the timestamp to ensure uniqueness
            timestamp = last_timestamp + (day * num_seconds_per_day) + second

            generate_lane = lambda: random.choice([1, 2, 3])

            pred = [{
                "vid": random.randint(0, 5),
                "position": [random.randint(0, 2000), random.randint(0, 2000)],
                "dimension": [random.randint(0, 20), random.randint(0, 20)],
                "label": random.choice(veh_label),
                "land": generate_lane(),
                "confidence": round(random.random(), 2),
                "speed": random.uniform(30, 100)  # Add the "speed" attribute here
            } for _ in range(random.randint(1, 10))]

            veh_in_lane = {f"lane{lane_id}": sum(v['land'] == lane_id for v in pred) for lane_id in range(1, 4)}

            # Insert data into the "FramePrediction" table, handling unique timestamp conflict
            insert_frame_query = """
            INSERT INTO "FramePrediction" ("UnixTimestamp", "NumberOfVehicles", "NumberOfVehiclesInEachLane", "VehicleObjects")
            VALUES (%s, %s, %s, %s) ON CONFLICT ("UnixTimestamp") DO NOTHING;
            """
            cur.execute(insert_frame_query, (timestamp, len(pred), json.dumps(veh_in_lane), json.dumps(pred)))

        conn.commit()

insert_fake_data(num_days=1)  # Generating fake data for 1 day

# Close the connection and cursor
cur.close()
conn.close()