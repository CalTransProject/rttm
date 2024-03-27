CREATE TABLE "User" (
    "UserID" SERIAL PRIMARY KEY,
    "Username" VARCHAR(255) NOT NULL UNIQUE,
    "Password" TEXT NOT NULL,
    "Role" TEXT NOT NULL
);

CREATE INDEX "idx_user_username" ON "User" ("Username");

CREATE TABLE "VehicleType" (
    "TypeID" SERIAL PRIMARY KEY,
    "TypeName" TEXT NOT NULL,
    "Description" TEXT NOT NULL
);

CREATE TABLE "Lane" (
    "LaneID" SERIAL PRIMARY KEY,
    "RoadName" VARCHAR(255) NOT NULL,
    "Direction" VARCHAR(255) NOT NULL
);

CREATE TABLE "Weather" (
    "WeatherID" SERIAL PRIMARY KEY,
    "Timestamp" BIGINT NOT NULL,
    "Condition" VARCHAR(255) NOT NULL,
    "Temperature" REAL NOT NULL
);

CREATE TABLE "Real_Time_Traffic_Data" (
    "DataID" SERIAL PRIMARY KEY,
    "Timestamp" BIGINT NOT NULL,
    "VehicleCount" INTEGER NOT NULL,
    "Speed" REAL NOT NULL,
    "LaneID" INTEGER NOT NULL,
    "WeatherID" INTEGER NOT NULL,
    FOREIGN KEY ("LaneID") REFERENCES "Lane" ("LaneID"),
    FOREIGN KEY ("WeatherID") REFERENCES "Weather" ("WeatherID")
);

-- HistoricalData table now uses auxiliary tables for dynamic data storage
CREATE TABLE "HistoricalData" (
    "DataID" SERIAL PRIMARY KEY,
    "UnixTimestamp" BIGINT,
    "TotalVehicles" INTEGER NOT NULL,
    "AverageSpeed" REAL NOT NULL,
    "Density" REAL NOT NULL,
    "AverageConfidence" REAL NOT NULL
);

-- Auxiliary tables for vehicle type counts
CREATE TABLE "HistoricalData_VehicleTypeCount" (
    "ID" SERIAL PRIMARY KEY,
    "HistoricalDataID" INTEGER NOT NULL,
    "VehicleTypeID" INTEGER NOT NULL,
    "Count" INTEGER NOT NULL,
    FOREIGN KEY ("HistoricalDataID") REFERENCES "HistoricalData" ("DataID"),
    FOREIGN KEY ("VehicleTypeID") REFERENCES "VehicleType" ("TypeID")
);

-- Auxiliary tables for lane vehicle counts
CREATE TABLE "HistoricalData_LaneVehicleCount" (
    "ID" SERIAL PRIMARY KEY,
    "HistoricalDataID" INTEGER NOT NULL,
    "LaneID" INTEGER NOT NULL,
    "Count" INTEGER NOT NULL,
    FOREIGN KEY ("HistoricalDataID") REFERENCES "HistoricalData" ("DataID"),
    FOREIGN KEY ("LaneID") REFERENCES "Lane" ("LaneID")
);

CREATE TABLE "ModifiedVehicle" (
    "VehicleID" SERIAL PRIMARY KEY,
    "FrameUnixTimestamp" BIGINT NOT NULL DEFAULT extract(epoch from now()),
    "CoordinatesOfCenter" TEXT NOT NULL,
    "Dimension" TEXT NOT NULL,
    "Classification" TEXT NOT NULL,
    "ConfidenceLevel" REAL NOT NULL,
    "Lane" INTEGER NOT NULL,
    FOREIGN KEY ("Lane") REFERENCES "Lane" ("LaneID")
);

CREATE INDEX "idx_modified_vehicle_timestamp_classification" ON "ModifiedVehicle" ("FrameUnixTimestamp", "Classification");

CREATE TABLE "VehicleHistory" (
    "HistoryID" SERIAL PRIMARY KEY,
    "VehicleID" INTEGER NOT NULL,
    "HistoricalTimestamp" BIGINT NOT NULL,
    "LocationHistory" TEXT NOT NULL,
    FOREIGN KEY ("VehicleID") REFERENCES "ModifiedVehicle" ("VehicleID") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "idx_vehicle_history" ON "VehicleHistory" ("VehicleID", "HistoricalTimestamp");

CREATE TABLE "FramePrediction" (
    "UnixTimestamp" BIGINT PRIMARY KEY,
    "NumberOfVehicles" INTEGER NOT NULL,
    "NumberOfVehiclesInEachLane" TEXT NOT NULL,
    "VehicleObjects" TEXT NOT NULL
);

CREATE INDEX "idx_frame_prediction_timestamp" ON "FramePrediction" ("UnixTimestamp");

CREATE INDEX "idx_historical_data_timestamp" ON "HistoricalData" ("UnixTimestamp");

CREATE TABLE "VehicleDetectionEvent" (
    "EventID" SERIAL PRIMARY KEY,
    "VehicleID" INTEGER NOT NULL,
    "UnixTimestamp" BIGINT NOT NULL,
    "EventType" TEXT NOT NULL,
    "EventDescription" TEXT NOT NULL,
    FOREIGN KEY ("VehicleID") REFERENCES "ModifiedVehicle" ("VehicleID") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "idx_vehicle_detection_event" ON "VehicleDetectionEvent" ("VehicleID", "UnixTimestamp");
