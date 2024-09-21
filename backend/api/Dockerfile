# Dockerfile for backend

# Use node as the base image
FROM node:16.20.2

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Rebuild bcrypt to avoid architecture issues
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the backend files
COPY . .

# Wait-for-it script for database readiness (optional, but recommended)
COPY wait-for-it.sh /usr/local/bin/

# Make sure the script has execution permission
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Expose the port for the backend server
EXPOSE 3008

# Start the backend and handle database migrations
CMD ["/bin/sh", "-c", "/usr/local/bin/wait-for-it.sh db:5432 -- npm run init:db && npm start"]
