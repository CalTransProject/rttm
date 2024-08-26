import unittest
import psycopg2
import json
import os
from unittest.mock import patch, MagicMock
from dotenv import load_dotenv

# Import the functions from your script
from ProcessPerSecondData import insert_fake_data, db_credentials

class TestDataGeneration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Load environment variables
        load_dotenv(dotenv_path='website/server/database/db.env')
        
        # Connect to the test database
        cls.conn = psycopg2.connect(**db_credentials)
        cls.cur = cls.conn.cursor()

    @classmethod
    def tearDownClass(cls):
        # Close the database connection
        cls.cur.close()
        cls.conn.close()

    def setUp(self):
        # Clear the test database before each test
        self.cur.execute('DELETE FROM "FramePrediction";')
        self.conn.commit()

    def test_insert_fake_data(self):
        # Test inserting fake data for one day
        insert_fake_data(num_days=1)

        # Check if data was inserted
        self.cur.execute('SELECT COUNT(*) FROM "FramePrediction";')
        count = self.cur.fetchone()[0]
        self.assertEqual(count, 86400)  # 86400 seconds in a day

    def test_data_structure(self):
        # Test the structure of inserted data
        insert_fake_data(num_days=1, num_seconds_per_day=1)  # Insert just one record for testing

        self.cur.execute('SELECT * FROM "FramePrediction" LIMIT 1;')
        row = self.cur.fetchone()

        # Check if all expected columns are present
        self.assertEqual(len(row), 4)  # 4 columns expected

        # Check if NumberOfVehiclesInEachLane is valid JSON
        lane_data = json.loads(row[2])
        self.assertIsInstance(lane_data, dict)
        self.assertTrue(all(f"lane{i}" in lane_data for i in range(1, 4)))

        # Check if VehicleObjects is valid JSON and has expected structure
        vehicle_objects = json.loads(row[3])
        self.assertIsInstance(vehicle_objects, list)
        if vehicle_objects:  # If there are any vehicles
            vehicle = vehicle_objects[0]
            expected_keys = {"vid", "position", "dimension", "label", "land", "confidence", "speed"}
            self.assertTrue(all(key in vehicle for key in expected_keys))

    def test_unique_timestamps(self):
        # Test that all timestamps are unique
        insert_fake_data(num_days=1, num_seconds_per_day=100)  # Insert 100 records

        self.cur.execute('SELECT COUNT(DISTINCT "UnixTimestamp") FROM "FramePrediction";')
        unique_count = self.cur.fetchone()[0]

        self.cur.execute('SELECT COUNT(*) FROM "FramePrediction";')
        total_count = self.cur.fetchone()[0]

        self.assertEqual(unique_count, total_count)

    @patch('random.randint')
    @patch('random.choice')
    @patch('random.random')
    @patch('random.uniform')
    def test_data_ranges(self, mock_uniform, mock_random, mock_choice, mock_randint):
        # Test that generated data is within expected ranges
        mock_randint.side_effect = [5, 1000, 1000, 10, 10, 1]  # vid, position x, position y, dimension x, dimension y, num vehicles
        mock_choice.side_effect = ["sedan", 1]  # label, land
        mock_random.return_value = 0.5  # confidence
        mock_uniform.return_value = 65.0  # speed

        insert_fake_data(num_days=1, num_seconds_per_day=1)

        self.cur.execute('SELECT "VehicleObjects" FROM "FramePrediction" LIMIT 1;')
        vehicle_objects = json.loads(self.cur.fetchone()[0])

        vehicle = vehicle_objects[0]
        self.assertLessEqual(vehicle['vid'], 5)
        self.assertLessEqual(max(vehicle['position']), 2000)
        self.assertLessEqual(max(vehicle['dimension']), 20)
        self.assertIn(vehicle['label'], ["sedan", "suv", "truck", "bus", "pickup", "van"])
        self.assertIn(vehicle['land'], [1, 2, 3])
        self.assertLessEqual(vehicle['confidence'], 1.0)
        self.assertGreaterEqual(vehicle['speed'], 30)
        self.assertLessEqual(vehicle['speed'], 100)

if __name__ == '__main__':
    unittest.main()