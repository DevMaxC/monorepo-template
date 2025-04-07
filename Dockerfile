FROM node:lts-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript code
RUN npm run build

# Production image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose the port
EXPOSE 80

# Start the server
CMD ["node", "dist/server.js"]