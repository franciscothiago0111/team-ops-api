FROM node:22

# Create app directory
WORKDIR /usr/src/app

# Copy dependencies
COPY package*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build Prisma client
# RUN npx prisma generate

RUN npx prisma generate
RUN npm run build

# Expose app port
EXPOSE 3000

# ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
