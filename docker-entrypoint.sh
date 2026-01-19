#!/bin/sh

# Apply database migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
exec "$@" 