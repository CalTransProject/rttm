import psycopg2
import json
import os
import random
import time
from dotenv import load_dotenv

# Load environment variables from .env file for database credentials
load_dotenv(dotenv_path='website/server/database/db.env')

# Database credentials
db_credentials = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

# Print the credentials to verify they are loaded correctly
print(db_credentials)

# Connect to your PostgreSQL database
conn = psycopg2.connect(**db_credentials)
cur = conn.cursor()

def clear_tables():
    """
    Function to clear the relevant tables in the database.
    """
    tables_to_clear = ["FramePrediction", "Lane"]
    for table in tables_to_clear:
        cur.execute(f'TRUNCATE TABLE "{table}" CASCADE;')
    conn.commit()
    print("Tables cleared successfully.")

# Function to ensure Lane IDs exist
def ensure_lane_ids():
    for lane_id in range(1, 4):
        cur.execute(
            '''
            INSERT INTO "Lane" ("RoadName", "Direction")
            VALUES (%s, %s) ON CONFLICT DO NOTHING;
            ''',
            ('Main Street', 'North')
        )
    conn.commit()
    print("Lane IDs ensured.")

veh_label = ["sedan", "suv", "truck", "bus", "pickup", "van"]

# Function to generate fake data and insert it into the database
def insert_fake_data(num_hours=1, frames_per_second=24):
    start_timestamp = int(time.time() * 1000)  # Current time in milliseconds
    
    total_frames = num_hours * 3600 * frames_per_second
    records_inserted = 0

    for frame in range(total_frames):
        # Calculate timestamp for this frame
        timestamp = start_timestamp + (frame * (1000 // frames_per_second))
        
        generate_lane = lambda: random.choice([1, 2, 3])
        pred = [{
            "vid": random.randint(0, 5),
            "position": [random.randint(0, 2000), random.randint(0, 2000)],
            "dimension": [random.randint(0, 20), random.randint(0, 20)],
            "label": random.choice(veh_label),
            "lane": generate_lane(),
            "confidence": round(random.random(), 2),
            "speed": random.uniform(30, 100)
        } for _ in range(random.randint(1, 10))]
        
        veh_in_lane = {f"lane{lane_id}": sum(v['lane'] == lane_id for v in pred) for lane_id in range(1, 4)}
        
        # Insert data into the "FramePrediction" table
        insert_frame_query = """
        INSERT INTO "FramePrediction" ("UnixTimestamp", "NumberOfVehicles", "NumberOfVehiclesInEachLane", "VehicleObjects")
        VALUES (%s, %s, %s, %s);
        """
        cur.execute(insert_frame_query, (timestamp, len(pred), json.dumps(veh_in_lane), json.dumps(pred)))
        records_inserted += 1
        
        if frame % (frames_per_second * 60) == 0:  # Commit every minute to avoid large transactions
            conn.commit()
            print(f"Inserted {records_inserted} records...")
    
    conn.commit()  # Final commit
    print(f"Total records inserted: {records_inserted}")

# Main execution
if __name__ == "__main__":
    try:
        # Clear tables
        clear_tables()
        
        # Ensure Lane IDs exist
        ensure_lane_ids()
        
        # Generate fake data for 1 hour with 24 frames per second
        insert_fake_data(num_hours=1, frames_per_second=24)
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Close the connection and cursor
        cur.close()
        conn.close()
        print("Database connection closed.")