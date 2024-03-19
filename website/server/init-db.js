// server/init-db.js

const pool = require('./database/config'); // Assuming you've set up your pool

const createTables = `
BEGIN;

CREATE TABLE IF NOT EXISTS "User" (
  "UserID" SERIAL PRIMARY KEY,
  "Username" VARCHAR(255) NOT NULL UNIQUE,
  "Password" TEXT NOT NULL,
  "Role" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_user_username" ON "User" ("Username");

CREATE TABLE IF NOT EXISTS "VehicleType" (
  "TypeID" SERIAL PRIMARY KEY,
  "TypeName" TEXT NOT NULL,
  "Description" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "ModifiedVehicle" (
  "VehicleID" SERIAL PRIMARY KEY,
  "FrameUnixTimestamp" BIGINT NOT NULL DEFAULT extract(epoch from now()),
  "CoordinatesOfCenter" TEXT NOT NULL,
  "Dimension" TEXT NOT NULL,
  "Classification" TEXT NOT NULL,
  "ConfidenceLevel" REAL NOT NULL,
  "Lane" INTEGER NOT NULL CHECK ("Lane" > 0)
);

CREATE INDEX IF NOT EXISTS "idx_modified_vehicle_timestamp_classification" ON "ModifiedVehicle" ("FrameUnixTimestamp", "Classification");

CREATE TABLE IF NOT EXISTS "VehicleHistory" (
  "HistoryID" SERIAL PRIMARY KEY,
  "VehicleID" INTEGER NOT NULL,
  "HistoricalTimestamp" BIGINT NOT NULL,
  "LocationHistory" TEXT NOT NULL,
  FOREIGN KEY ("VehicleID") REFERENCES "ModifiedVehicle" ("VehicleID") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_vehicle_history" ON "VehicleHistory" ("VehicleID", "HistoricalTimestamp");

CREATE TABLE IF NOT EXISTS "FramePrediction" (
  "UnixTimestamp" BIGINT PRIMARY KEY,
  "NumberOfVehicles" INTEGER NOT NULL,
  "NumberOfVehiclesInEachLane" TEXT NOT NULL,
  "VehicleObjects" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_frame_prediction_timestamp" ON "FramePrediction" ("UnixTimestamp");

CREATE TABLE IF NOT EXISTS "HistoricalData" (
  "DataID" SERIAL PRIMARY KEY,
  "UnixTimestamp" BIGINT NOT NULL,
  "TotalVehicles" INTEGER NOT NULL,
  "AverageConfidence" REAL NOT NULL,
  "VehicleTypesCount" TEXT NOT NULL,
  FOREIGN KEY ("UnixTimestamp") REFERENCES "FramePrediction" ("UnixTimestamp") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_historical_data_timestamp" ON "HistoricalData" ("UnixTimestamp");

CREATE TABLE IF NOT EXISTS "VehicleDetectionEvent" (
  "EventID" SERIAL PRIMARY KEY,
  "VehicleID" INTEGER NOT NULL,
  "UnixTimestamp" BIGINT NOT NULL,
  "EventType" TEXT NOT NULL,
  "EventDescription" TEXT NOT NULL,
  FOREIGN KEY ("VehicleID") REFERENCES "ModifiedVehicle" ("VehicleID") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_vehicle_detection_event" ON "VehicleDetectionEvent" ("VehicleID", "UnixTimestamp");

COMMIT;
`;

pool.query(createTables, (err, res) => {
  if (err) {
    console.error('Error executing query', err.stack);
    // Handle error as needed
  } else {
    console.log('Tables created successfully', res);
    // Proceed with any further setup
  }
  pool.end();
});