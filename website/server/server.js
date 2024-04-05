require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./database/config');

const app = express();

app.use(bodyParser.json());

pool.connect(err => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Database connected');
  }
});

app.get('/', (req, res) => {
  res.send('Server is running.');
});

// User CRUD operations
app.get('/users', (req, res, next) => {
  pool.query('SELECT * FROM "User"', (error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json(results.rows);
    }
  });
});

app.get('/users/:id', (req, res, next) => {
  const { id } = req.params;
  pool.query('SELECT * FROM "User" WHERE UserID = $1', [id], (error, results) => {
    if (error) {
      next(error);
    } else {
      if (results.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(results.rows[0]);
    }
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
  const hashedPassword = await bcrypt.hash(password, 10);
  pool.query('INSERT INTO "User" (Username, Password, Role) VALUES ($1, $2, $3) RETURNING *',
    [username, hashedPassword, role], (error, results) => {
      if (error) {
        next(error);
      } else {
        const user = results.rows[0];
        const token = jwt.sign({ user_id: user.UserID }, process.env.JWT_SECRET, {
          expiresIn: '2h',
        });
        res.status(201).json({ user, token });
      }
    });
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
  const updateFields = {};
  if (username) updateFields.Username = username;
  if (password) updateFields.Password = await bcrypt.hash(password, 10);
  if (role) updateFields.Role = role;

  const setClause = Object.keys(updateFields).map((key, index) => `"${key}" = $${index + 1}`).join(', ');
  const values = Object.values(updateFields);
  values.push(id);

  pool.query(`UPDATE "User" SET ${setClause} WHERE UserID = $${values.length} RETURNING *`,
    values, (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json(results.rows[0]);
      }
    });
});

app.delete('/users/:id', (req, res, next) => {
  const { id } = req.params;
  pool.query('DELETE FROM "User" WHERE UserID = $1', [id], (error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(200).send(`User deleted with ID: ${id}`);
    }
  });
});

app.post('/login', [
  check('username').isEmail(),
  check('password').not().isEmpty(),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  pool.query('SELECT * FROM "User" WHERE Username = $1', [username], (error, results) => {
    if (error) {
      next(error);
    } else {
      const user = results.rows[0];
      if (!user || !bcrypt.compareSync(password, user.Password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ user_id: user.UserID }, process.env.JWT_SECRET, {
        expiresIn: '2h',
      });
      res.status(200).json({ user, token });
    }
  });
});

app.post('/vehicletype', [
  check('type').not().isEmpty(),
  check('description').not().isEmpty(),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, description } = req.body;
  pool.query('INSERT INTO "VehicleType" (Type, Description) VALUES ($1, $2) RETURNING *',
    [type, description], (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(201).json(results.rows[0]);
      }
    });
});

app.get('/vehicletype', (req, res, next) => {
  pool.query('SELECT * FROM "VehicleType"', (error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json(results.rows);
    }
  });
});

app.get('/vehicletype/:id', (req, res, next) => {
  const { id } = req.params;
  pool.query('SELECT * FROM "VehicleType" WHERE TypeID = $1', [id], (error, results) => {
    if (error) {
      next(error);
    } else {
      if (results.rows.length === 0) {
        return res.status(404).json({ message: 'Vehicle type not found' });
      }
      res.status(200).json(results.rows[0]);
    }
  });
});

app.put('/vehicletype/:id', [
  check('type').optional().not().isEmpty(),
  check('description').optional().not().isEmpty(),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { type, description } = req.body;
  pool.query('UPDATE "VehicleType" SET Type = $1, Description = $2 WHERE TypeID = $3 RETURNING *',
    [type, description, id], (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json(results.rows[0]);
      }
    });
});

app.delete('/vehicletype/:id', (req, res, next) => {
  const { id } = req.params;
  pool.query('DELETE FROM "VehicleType" WHERE TypeID = $1', [id], (error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(200).send(`VehicleType deleted with ID: ${id}`);
    }
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

// Historical Data API endpoints

app.get('/api/historical-data', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM HistoricalData');
    const processedData = result.rows.map(item => ({
      ...item,
      VehicleTypeCounts: item.VehicleTypeCounts ? JSON.parse(item.VehicleTypeCounts) : {},
      LaneVehicleCounts: item.LaneVehicleCounts ? JSON.parse(item.LaneVehicleCounts) : {},
    }));
    res.json(processedData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/vehicle-type-count', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM HistoricalData_VehicleTypeCount');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vehicle type counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/lane-vehicle-count', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM HistoricalData_LaneVehicleCount');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lane vehicle counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/lane-type-count', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM HistoricalData_LaneTypeCount');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lane type counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('An error occurred!');
});