# Use Node.js 18 alpine
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG VITE_API_URL
ARG VITE_SOCKET_URL

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install a simple static server
RUN npm install -g sirv-cli

# Copy the build output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port
EXPOSE 5173

# Command to serve the build on port 5173
# sirv is used to serve the SPA correctly (routing support)
CMD ["sirv", "dist", "--port", "5173", "--host", "0.0.0.0", "--single"]
