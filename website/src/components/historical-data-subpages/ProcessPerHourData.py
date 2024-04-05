import psycopg2
import os
import time
from dotenv import load_dotenv 
import json
from ...ProcessHistoricalData import process_per_second_data, ensure_vehicle_types_exist, ensure_lanes_exist 

# Load environment variables from .env file for database credentials
load_dotenv(dotenv_path='../../../server/database/db.env')

# Database credentials
db_credentials = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}


def process_per_hour_data(cur, start_time, end_time):
     """Process per-hour data and store in history_hr_data table"""
    #query DB, values held in cur
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
        WHERE "Timestamp" BETWEEN  %s AND %s;
        """, (start_time, end_time))
     
     per_hour_data = []
     
     for row in cur.fetchall(): #iterate through each row returned from query
         second, total_vehicles, average_speed, density, average_confidence, vehicle_type_counts, lane_vehicle_counts, lane_type_counts = row
         #convert per-sec data to per-hour data
         hour = second /3600
         #populate per-hour data list with new data point
         per_hour_data.append((
            hour,
            total_vehicles, 
            average_speed, 
            density, 
            average_confidence,
            vehicle_type_counts, 
            lane_vehicle_counts, 
            lane_type_counts
             
         ))
        
    #insert per-hour data into columns
     if per_hour_data:
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
        
        placeholders = ',  '.join(['%s']*len(per_hour_data[0]))
            
        # SQL query
        query = f"INSERT INTO PerHourData ({columns}) VALUES ({placeholders})"

        try:
            # Error handling
            cur.executemany(query, per_hour_data)
        except Exception as e:
            print(f"Error inserting data: {e}")  # Log or handle the error appropriately
            
def create_per_hour_table(cur):
    """create new per-hour table"""
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS "PerHourData" (
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
    except Exception as e:
        print(f"Error creating table: {e}")

if __name__ == "__main__":
    try:
        #connecty to the DB
        conn = psycopg2.connect(**db_credentials)
        cur = conn.cursor()    
            
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
        
        create_per_hour_table(cur)
        
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