# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install root dependencies (concurrently, etc)
RUN npm install

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Copy source code
COPY backend/ ./

# Build TypeScript
RUN npm run build

# Expose Port
EXPOSE 5000

# Start Command
CMD ["npm", "start"]
