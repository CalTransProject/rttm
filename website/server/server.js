// Required dependencies and library imports
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./database/config');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  next();
});

// Helper Functions
function safelyParseJSON(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return {};
  }
}

function getTableName(granularity) {
  switch (granularity) {
    case 'second': return 'PerSecondData';
    case 'minute': return 'PerMinuteData';
    case '5minute': return 'Per5MinuteData';
    case 'hour': return 'PerHourData';
    case 'day': return 'PerDayData';
    case 'week': return 'PerWeekData';
    case 'month': return 'PerMonthData';
    case 'year': return 'PerYearData';
    default: throw new Error('Invalid granularity');
  }
}

function getTimeInterval(granularity) {
  switch (granularity) {
    case 'second': return '1 second';
    case 'minute': return '1 minute';
    case '5minute': return '5 minutes';
    case 'hour': return '1 hour';
    case 'day': return '1 day';
    case 'week': return '1 week';
    case 'month': return '1 month';
    case 'year': return '1 year';
    default: throw new Error('Invalid granularity');
  }
}

// Authentication Middleware
const authorize = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
};

// Database connection
pool.connect(err => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Database connected');
  }
});

// Validation Rules
const userValidationRules = [
  check('username').isEmail(),
  check('password').isLength({ min: 6 }),
  check('role').not().isEmpty(),
];

const userUpdateValidationRules = [
  check('username').optional().isEmail(),
  check('password').optional().isLength({ min: 6 }),
  check('role').optional().not().isEmpty(),
];

const modifiedVehicleValidationRules = [
  check('vehicleID').isInt(),
  check('modifications').not().isEmpty(),
];

const modifiedVehicleUpdateValidationRules = [
  check('modifications').optional().not().isEmpty(),
];

const historicalDataValidationRules = [
  check('start').isISO8601().toDate(),
  check('end').isISO8601().toDate(),
  check('granularity').isIn(['second', 'minute', '5minute', 'hour', 'day', 'week', 'month', 'year']),
];

// User Routes
app.get('/users', (req, res, next) => {
  pool.query('SELECT * FROM "User"', (error, results) => {
    if (error) {
      return next(error);
    }
    res.status(200).json(results.rows);
  });
});

app.get('/users/:id', (req, res, next) => {
  const { id } = req.params;
  pool.query('SELECT * FROM "User" WHERE UserID = $1', [id], (error, results) => {
    if (error) {
      return next(error);
    }
    if (results.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(results.rows[0]);
  });
});

app.post('/users', userValidationRules, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    pool.query('INSERT INTO "User" (Username, Password, Role) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, role], (error, results) => {
        if (error) {
          return next(error);
        }
        const user = results.rows[0];
        const token = jwt.sign({ user_id: user.UserID }, process.env.JWT_SECRET, {
          expiresIn: '2h',
        });
        res.status(201).json({ user, token });
      });
  } catch (error) {
    next(error);
  }
});

app.put('/users/:id', userUpdateValidationRules, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;
  const { username, password, role } = req.body;
  let updateFields = {};
  if (username) updateFields.Username = username;
  if (password) {
    try {
      updateFields.Password = await bcrypt.hash(password, 10);
    } catch (error) {
      return next(error);
    }
  }
  if (role) updateFields.Role = role;

  const setClause = Object.keys(updateFields).map((key, index) => `"${key}" = $${index + 1}`).join(', ');
  const values = [...Object.values(updateFields), id];

  pool.query(`UPDATE "User" SET ${setClause} WHERE UserID = $${values.length} RETURNING *`,
    values, (error, results) => {
      if (error) {
        return next(error);
      }
      res.status(200).json(results.rows[0]);
    });
});

app.delete('/users/:id', (req, res, next) => {
  const { id } = req.params;
  pool.query('DELETE FROM "User" WHERE UserID = $1', [id], (error, results) => {
    if (error) {
      return next(error);
    }
    res.status(200).send(`User deleted with ID: ${id}`);
  });
});

// Modified Vehicle Routes
app.post('/modifiedvehicle', [authorize, modifiedVehicleValidationRules], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { vehicleID, modifications } = req.body;
  pool.query('INSERT INTO ModifiedVehicle (VehicleID, Modifications) VALUES ($1, $2) RETURNING *',
    [vehicleID, modifications], (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(201).json(results.rows[0]);
      }
    });
});

app.get('/modifiedvehicle', authorize, (req, res, next) => {
  pool.query('SELECT * FROM ModifiedVehicle', (error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json(results.rows);
    }
  });
});

app.get('/modifiedvehicle/:id', authorize, (req, res, next) => {
  const { id } = req.params;
  pool.query('SELECT * FROM ModifiedVehicle WHERE VehicleID = $1', [id], (error, results) => {
    if (error) {
      next(error);
    } else {
      if (results.rows.length === 0) {
        return res.status(404).json({ message: 'Modified vehicle not found' });
      }
      res.status(200).json(results.rows[0]);
    }
  });
});

app.put('/modifiedvehicle/:id', [authorize, modifiedVehicleUpdateValidationRules], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { modifications } = req.body;
  pool.query('UPDATE ModifiedVehicle SET Modifications = $1 WHERE VehicleID = $2 RETURNING *',
    [modifications, id], (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json(results.rows[0]);
      }
    });
});

app.delete('/modifiedvehicle/:id', authorize, (req, res, next) => {
  const { id } = req.params;
  pool.query('DELETE FROM ModifiedVehicle WHERE VehicleID = $1', [id], (error) => {
    if (error) {
      next(error);
    } else {
      res.status(200).send(`ModifiedVehicle deleted with ID: ${id}`);
    }
  });
});

// Historical Data Routes
app.get('/api/historical-data', historicalDataValidationRules, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { start, end, granularity } = req.query;

  try {
    const tableName = getTableName(granularity);
    const timeInterval = getTimeInterval(granularity);

    const query = `
      WITH time_series AS (
        SELECT generate_series(
          $2::timestamp,
          $3::timestamp,
          $1::interval
        ) AS time
      ),
      aggregated_data AS (
        SELECT
          time_bucket($1::interval, "Timestamp") AS time,
          SUM("TotalVehicles") AS "TotalVehicles",
          AVG("AverageSpeed") AS "AverageSpeed",
          AVG("Density") AS "Density",
          AVG("AverageConfidence") AS "AverageConfidence",
          jsonb_object_agg(COALESCE(vt.key, ''), COALESCE(vt.value, '0')::int) AS "VehicleTypeCounts",
          jsonb_object_agg(COALESCE(lv.key, ''), COALESCE(lv.value, '0')::int) AS "LaneVehicleCounts",
          jsonb_object_agg(COALESCE(lt.key, ''), COALESCE(lt.value, '0')::int) AS "LaneTypeCounts"
        FROM "${tableName}",
          jsonb_each("VehicleTypeCounts") vt,
          jsonb_each("LaneVehicleCounts") lv,
          jsonb_each("LaneTypeCounts") lt
        WHERE "Timestamp" BETWEEN $2 AND $3
        GROUP BY time
      )
      SELECT
        ts.time AS "Timestamp",
        COALESCE(ad."TotalVehicles", 0) AS "TotalVehicles",
        COALESCE(ad."AverageSpeed", 0) AS "AverageSpeed",
        COALESCE(ad."Density", 0) AS "Density",
        COALESCE(ad."AverageConfidence", 0) AS "AverageConfidence",
        COALESCE(ad."VehicleTypeCounts", '{}'::jsonb) AS "VehicleTypeCounts",
        COALESCE(ad."LaneVehicleCounts", '{}'::jsonb) AS "LaneVehicleCounts",
        COALESCE(ad."LaneTypeCounts", '{}'::jsonb) AS "LaneTypeCounts"
      FROM time_series ts
      LEFT JOIN aggregated_data ad ON ts.time = ad.time
      ORDER BY ts.time ASC
    `;

    const result = await pool.query(query, [timeInterval, start, end]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified range and granularity' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    if (error.message === 'Invalid granularity') {
      res.status(400).json({ error: 'Invalid granularity specified' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Helper function to create data endpoints
const createDataEndpoint = (route, tableName, defaultLimit) => {
  app.get(route, async (req, res, next) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : defaultLimit;
    try {
      const result = await pool.query(`SELECT * FROM "${tableName}" ORDER BY "Timestamp" DESC LIMIT $1`, [limit]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: `No ${tableName} found` });
      }

      res.json(result.rows);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

// Create data endpoints
createDataEndpoint('/api/per-second-data', 'PerSecondData', 200);
createDataEndpoint('/api/per-minute-data', 'PerMinuteData', 60);
createDataEndpoint('/api/per-5-minute-data', 'Per5MinuteData', 12);
createDataEndpoint('/api/per-hour-data', 'PerHourData', 24);
createDataEndpoint('/api/per-day-data', 'PerDayData', 30);
createDataEndpoint('/api/per-month-data', 'PerMonthData', 12);
createDataEndpoint('/api/per-year-data', 'PerYearData', 5);

// Additional Data Routes
app.get('/api/vehicle-type-count', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM HistoricalData_VehicleTypeCount');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vehicle type counts:', error);
    next(error);
  }
});

app.get('/api/lane-vehicle-count', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM HistoricalData_LaneVehicleCount');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lane vehicle counts:', error);
    next(error);
  }
});

app.get('/api/lane-type-count', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM HistoricalData_LaneTypeCount');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lane type counts:', error);
    next(error);
  }
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An error occurred', message: err.message });
});

// Start the server
const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;