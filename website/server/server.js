require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
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

const userValidationRules = [
  check('username').isEmail(),
  check('password').isLength({ min: 6 }),
  check('role').not().isEmpty(),
];

app.post('/users', userValidationRules, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, role } = req.body;
  pool.query('INSERT INTO "User" (Username, Password, Role) VALUES ($1, $2, $3) RETURNING *',
    [username, password, role], (error, results) => {
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

app.put('/users/:id', userUpdateValidationRules, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { username, password, role } = req.body;
  pool.query('UPDATE "User" SET Username = $1, Password = $2, Role = $3 WHERE UserID = $4 RETURNING *',
    [username, password, role, id], (error, results) => {
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

app.post('/vehicletype', [
  // Validation middleware here
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

app.put('/vehicletype/:id', [
  // Validation middleware here
  check('type').optional().not().isEmpty(),
  check('description').optional().not().isEmpty(),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { type, description } = req.body;
  pool.query('UPDATE "VehicleType" SET Type = $1, Description = $2 WHERE ID = $3 RETURNING *',
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
  pool.query('DELETE FROM "VehicleType" WHERE ID = $1', [id], (error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(200).send(`VehicleType deleted with ID: ${id}`);
    }
  });
});

// Middleware for validating the input for creating a ModifiedVehicle
const modifiedVehicleValidationRules = [
  check('vehicleID').isInt(),
  check('modifications').not().isEmpty(),
];

// Middleware for validating the input for updating a ModifiedVehicle
const modifiedVehicleUpdateValidationRules = [
  check('modifications').optional().not().isEmpty(),
];

// Middleware for authorization (Assuming you have a function for this)
const authorize = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decoded; // Add user payload to request object
    next();
  });
};

// POST route for creating a new ModifiedVehicle
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

// GET route for fetching all ModifiedVehicles
app.get('/modifiedvehicle', authorize, (req, res, next) => {
  pool.query('SELECT * FROM ModifiedVehicle', (error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json(results.rows);
    }
  });
});

// PUT route for updating a ModifiedVehicle
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

// DELETE route for removing a ModifiedVehicle
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('An error occurred!');
});
