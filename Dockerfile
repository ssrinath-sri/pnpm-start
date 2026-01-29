# Use Bun base image
FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# Copy workspace packages
COPY packages ./packages
COPY apps ./apps

# Install dependencies
RUN bun install

# Expose ports
EXPOSE 3000

# Default command
CMD ["bun", "run", "dev"]
