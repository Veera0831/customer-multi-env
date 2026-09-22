# ======================================================
# Customer Application Docker Image
# ======================================================

FROM node:20-alpine

# Application working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY src ./src

# Application listens on port 3000 inside container
EXPOSE 3000

# Start Node.js application
CMD ["npm", "start"]