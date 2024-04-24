// Required dependencies and library imports
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./database/config');
const cors = require('cors'); // Import the cors middleware

// Initialize Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Apply middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply middleware to set the Content-Type header for all responses
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  next();
});

// Function to safely parse JSON strings
function safelyParseJSON(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return {};
  }
}

// Database connection
pool.connect(err => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Database connected');
  }
});

// User CRUD operations
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

const userValidationRules = [
  check('username').isEmail(),
  check('password').isLength({ min: 6 }),
  check('role').not().isEmpty(),
];

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

const userUpdateValidationRules = [
  check('username').optional().isEmail(),
  check('password').optional().isLength({ min: 6 }),
  check('role').optional().not().isEmpty(),
];

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

const modifiedVehicleValidationRules = [
  check('vehicleID').isInt(),
  check('modifications').not().isEmpty(),
];

const modifiedVehicleUpdateValidationRules = [
  check('modifications').optional().not().isEmpty(),
];

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

// Ensure that the content type for JSON responses is set correctly
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  next();
});

// Exports for testing
module.exports = app;

// Historical Data API endpoint
app.get('/api/historical-data', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM HistoricalData');
    // Check if any data was returned
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No historical data found' });
    }

    // Process and send the data
    const processedData = result.rows.map(item => {
      return {
        ...item,
        VehicleTypeCounts: item.VehicleTypeCounts ? safelyParseJSON(item.VehicleTypeCounts) : {},
        LaneVehicleCounts: item.LaneVehicleCounts ? safelyParseJSON(item.LaneVehicleCounts) : {}
      };
    });

    res.json(processedData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PerSecondData API endpoint
// PerSecondData API endpoint
// PerSecondData API endpoint with limit parameter
app.get('/api/per-second-data', async (req, res, next) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100; // Default to 100 if no limit is provided
  try {
    const result = await pool.query('SELECT * FROM public."PerSecondData" ORDER BY "Timestamp" LIMIT $1', [limit]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No per-second data found' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching per-second data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Per-hour
app.get('/api/per-hour-data', async (req, res, next) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100; // Default to 100 if no limit is provided
  try {
    const result = await pool.query('SELECT * FROM public."PerHourData" ORDER BY "Timestamp" LIMIT $1', [limit]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No per-hour data found' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching per-hour data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Vehicle Type Count API endpoint
app.get('/api/vehicle-type-count', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM HistoricalData_VehicleTypeCount');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vehicle type counts:', error);
    next(error); // Pass the error to the error handler middleware
  }
});

// Lane Vehicle Count API endpoint
app.get('/api/lane-vehicle-count', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM HistoricalData_LaneVehicleCount');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lane vehicle counts:', error);
    next(error); // Pass the error to the error handler middleware
  }
});

// Lane Type Count API endpoint
app.get('/api/lane-type-count', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM HistoricalData_LaneTypeCount');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lane type counts:', error);
    next(error); // Pass the error to the error handler middleware
  }
});

// Error handler middleware to catch all server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An error occurred' });
});

// Start the server on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the app for testing purposes
module.exports = app;