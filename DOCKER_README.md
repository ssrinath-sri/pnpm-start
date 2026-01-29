# Docker Configuration

A complete Docker setup for the pnpm monorepo with MongoDB.

## Files

- **Dockerfile** - Container image for the Bun application
- **docker-compose.yml** - Orchestrates MongoDB and the app service
- **.dockerignore** - Excludes unnecessary files from Docker builds

## Services

### MongoDB
- **Port**: 27017 (internal), exposed on host
- **Admin User**: root
- **Password**: mongodb
- **Database**: myapp
- **UI**: Mongo Express available at http://localhost:8081

### Application
- **Port**: 3000
- **Runtime**: Bun
- **Auto-reload**: Enabled (via volumes)

## Usage

### Start all services
\`\`\`bash
docker-compose up
\`\`\`

### Start in background
\`\`\`bash
docker-compose up -d
\`\`\`

### Stop services
\`\`\`bash
docker-compose down
\`\`\`

### Clean up volumes
\`\`\`bash
docker-compose down -v
\`\`\`

### View logs
\`\`\`bash
docker-compose logs -f app
docker-compose logs -f mongodb
\`\`\`

### Access MongoDB
- **Direct**: \`mongodb://root:mongodb@localhost:27017/myapp\`
- **UI**: http://localhost:8081 (admin/pass)

## Environment Variables

The app automatically receives:
- \`MONGO_URI\`: mongodb://root:mongodb@mongodb:27017/myapp?authSource=admin
- \`DB_NAME\`: myapp
- \`NODE_ENV\`: development
