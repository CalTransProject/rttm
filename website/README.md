# RTTM Website

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Project Structure
```
website/
├── public/           # Static files
├── src/             # React source code
│   ├── components/  # React components
│   ├── context/     # React context providers
│   ├── images/      # Image assets
│   └── *.py         # Python data processing scripts
├── scriptsServer/   # Backend server
│   ├── database/    # Database scripts
│   └── server.js    # Express server
└── package.json     # Project dependencies
```

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js and npm
```bash
# For macOS using Homebrew
brew install node

# Verify installation
node --version
npm --version
```

### 2. Python 3.x
```bash
# For macOS using Homebrew
brew install python

# Verify installation
python3 --version
```

### 3. PostgreSQL
```bash
# For macOS using Homebrew
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database
createdb your_database_name
```

### 4. Git (for version control)
```bash
# For macOS using Homebrew
brew install git

# Verify installation
git --version
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd website
```

2. Install frontend dependencies:
```bash
# Install all frontend packages
npm install

# If you encounter any peer dependency issues, you can try:
npm install --legacy-peer-deps

# Or force install if needed:
npm install --force
```

3. Install backend dependencies:
```bash
cd scriptsServer
npm install

# Install specific backend packages if needed:
npm install bcrypt@5.1.1 cors@2.8.5 dotenv@16.4.5 express-validator@7.0.1 jsonwebtoken@9.0.2 pg@8.11.5
```

4. Set up Python virtual environment and dependencies:
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install required Python packages
pip install pandas numpy matplotlib seaborn scipy scikit-learn
pip install requests python-dotenv
```

## Database Setup

1. Create and configure PostgreSQL database:
```bash
# Create database if not already created
createdb your_database_name

# Optional: Create a database user
createuser --interactive --pwprompt

# Initialize database schema
cd scriptsServer
node init-db.js
```

## Environment Variables

1. Create frontend environment file:
```bash
# Create .env file in root directory
cat > .env << EOL
REACT_APP_API_URL=http://localhost:3008
REACT_APP_FIREBASE_CONFIG=your_firebase_config
REACT_APP_COGNITO_REGION=your_region
REACT_APP_COGNITO_USER_POOL_ID=your_user_pool_id
REACT_APP_COGNITO_APP_CLIENT_ID=your_app_client_id
EOL
```

2. Create backend environment file:
```bash
# Create .env file in scriptsServer directory
cd scriptsServer
cat > .env << EOL
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=your_database_name
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
EOL
```

## Running the Application

1. Start the PostgreSQL service (if not already running):
```bash
brew services start postgresql@14
```

2. Start the backend server:
```bash
cd scriptsServer
npm run start:server
```

3. In a new terminal, start the frontend:
```bash
# Make sure you're in the root directory
cd /path/to/website
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Data Processing

The project includes several Python scripts for data processing:
- `GenerateData.py`: Generates sample data
- `ProcessPerSecondData.py`: Processes per-second metrics
- `ProcessPerMinuteData.py`: Processes per-minute metrics
- `ProcessPerHourData.py`: Processes hourly metrics
- `ProcessPerDayData.py`: Processes daily metrics
- `ProcessPerWeekData.py`: Processes weekly metrics
- `ProcessPerMonthData.py`: Processes monthly metrics
- `ProcessPerYearData.py`: Processes yearly metrics

To run data processing:
1. Ensure Python virtual environment is activated (if using)
2. Run the desired script:
```bash
python src/GenerateData.py
```

## Key Dependencies

This project uses several key packages:

### UI Components and Styling
- React Bootstrap (v2.6.0) - UI component library
- Material-UI (@mui/material v5.11.10) - Modern UI components
- Bootstrap (v5.2.3) - CSS framework
- Framer Motion (v11.11.10) - Animation library

### Data Visualization
- Chart.js (v4.2.1) - Charting library
- ApexCharts (v3.37.0) - Advanced charts
- ECharts (v5.4.2) - Interactive charts

### 3D Rendering
- Three.js (v0.169.0) - 3D graphics library
- @react-three/fiber (v8.17.10) - React renderer for Three.js
- @react-three/drei (v9.115.0) - Useful helpers for React Three Fiber

### Backend Integration
- Axios (v1.4.0) - HTTP client
- Socket.io-client (v4.7.5) - Real-time communication
- AWS SDK (v2.1369.0) - AWS services integration
- Firebase (v10.11.0) - Firebase services

### Authentication
- Amazon Cognito Identity JS (v6.3.12) - User authentication
- jsonwebtoken (v9.0.2) - JWT handling

### Development Tools
- gh-pages (v5.0.0) - GitHub Pages deployment
- dotenv (v16.4.5) - Environment variables

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

### `npm run deploy`

Deploys the app to GitHub Pages. The site will be available at http://CalTransProject.github.io/

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Authentication Setup

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication services
3. Add your Firebase configuration to the `.env` file:
```
REACT_APP_FIREBASE_CONFIG={
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
}
```

### AWS Cognito Setup (if using)
1. Create a User Pool in AWS Cognito
2. Add Cognito configuration to `.env`:
```
REACT_APP_COGNITO_REGION=your_region
REACT_APP_COGNITO_USER_POOL_ID=your_user_pool_id
REACT_APP_COGNITO_APP_CLIENT_ID=your_app_client_id
```

## Deployment

### GitHub Pages Deployment
1. Update the `homepage` field in `package.json` with your GitHub Pages URL
2. Deploy to GitHub Pages:
```bash
npm run deploy
```

### Production Build
To create a production build:
```bash
npm run build
```

## Troubleshooting

### Common Issues

1. Node.js/npm Issues:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

2. Python Environment Issues:
```bash
# Recreate virtual environment
deactivate  # if already in a virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. PostgreSQL Issues:
```bash
# Restart PostgreSQL service
brew services restart postgresql@14

# Reset PostgreSQL database
dropdb your_database_name
createdb your_database_name
cd scriptsServer
node init-db.js
```

4. Permission Issues:
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```

## Additional Development Tools (Optional)

Install additional development tools that might be helpful:

```bash
# Install nodemon for automatic server restart during development
npm install -g nodemon

# Install React Developer Tools for Chrome
# Visit: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi

# Install PostgreSQL GUI client (optional)
brew install --cask pgadmin4
# Or
brew install --cask dbeaver-community

# Install Python development tools
pip install pylint autopep8 black
