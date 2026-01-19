# Build stage
FROM node:22-alpine AS builder

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .


# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files and entrypoint script
COPY package*.json ./
COPY prisma ./prisma/
COPY docker-entrypoint.sh ./

# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force



# Generate Prisma Client in production
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user and set permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chmod +x docker-entrypoint.sh && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly and run entrypoint script
ENTRYPOINT ["dumb-init", "--", "/bin/sh", "./docker-entrypoint.sh"]

# Start the application
CMD ["node", "dist/main"]
