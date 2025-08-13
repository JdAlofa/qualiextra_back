# ---- Builder Stage ----
# This stage installs dependencies and builds the application
FROM node:20-slim AS builder
WORKDIR /app

# Copy dependency files and install all dependencies (including dev)
COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of the application source code
COPY . .

# Run the build script to generate prisma client and compile TS
RUN yarn build

# ---- Production Stage ----
# This stage creates the final, small image with only what's needed to run
FROM node:20-slim AS production
WORKDIR /app

# Copy production dependency files and install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --production

# Copy the built application and necessary assets from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated/swagger.json ./src/generated/swagger.json

# Expose the port the app will run on
EXPOSE 8080

# Set the command to run when the container starts
CMD ["yarn", "start:prod"]