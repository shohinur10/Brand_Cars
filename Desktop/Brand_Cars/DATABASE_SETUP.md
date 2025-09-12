# BrandProd Database Connection Setup

This guide explains how to connect the Brand Cars backend to the BrandProd MongoDB database.

## Prerequisites

- MongoDB Atlas account with BrandProd cluster
- Access to the BrandProd database
- Docker and Docker Compose installed

## Configuration Steps

### 1. Update Environment Variables

The application uses environment variables to determine which database to connect to:

- `NODE_ENV=production` - Sets the application to production mode
- `MONGO_PROD` - MongoDB Atlas connection string for BrandProd database
- `MONGO_DEV` - Local MongoDB connection string for development

### 2. Configure BrandProd Connection String

Update the `MONGO_PROD` environment variable in `docker-compose.yml` with your actual BrandProd MongoDB Atlas connection string:

```yaml
environment:
  - MONGO_PROD=mongodb+srv://your-username:your-password@brandprod-cluster.mongodb.net/brandcars_prod?retryWrites=true&w=majority
```

**Replace the following placeholders:**
- `your-username` - Your MongoDB Atlas username
- `your-password` - Your MongoDB Atlas password
- `brandprod-cluster` - Your actual cluster name
- `brandcars_prod` - Your database name (or keep as is)

### 3. Security Configuration

1. **Whitelist IP Addresses**: Add your server's IP address to MongoDB Atlas IP whitelist
2. **Database User**: Create a dedicated database user with read/write permissions
3. **Network Access**: Ensure your cluster allows connections from your server

### 4. Running the Application

#### Using Docker Compose (Recommended for Production)

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

#### Using npm scripts (Development)

```bash
# Set environment variables
export NODE_ENV=production
export MONGO_PROD="your-mongodb-connection-string"

# Start the API
npm run start:prod

# Start the batch service
npm run start:prod:batch
```

### 5. Verification

When the application starts successfully, you should see:

```
🔗 Connecting to MongoDB Production (BrandProd) database...
✅ MongoDB is connected to BrandProd Production database successfully!
```

## Database Configuration Details

The application includes optimized MongoDB connection settings:

- **Connection Pool**: Maximum 10 connections
- **Retry Writes**: Enabled for better reliability
- **Write Concern**: Majority for data consistency
- **Timeouts**: 5s server selection, 45s socket timeout

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check IP whitelist in MongoDB Atlas
   - Verify network connectivity
   - Ensure cluster is running

2. **Authentication Failed**
   - Verify username and password
   - Check database user permissions
   - Ensure user has access to the database

3. **Database Not Found**
   - Verify database name in connection string
   - Check if database exists in your cluster

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGO_PROD` | Production MongoDB URI | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `MONGO_DEV` | Development MongoDB URI | `mongodb://localhost:27017/brandcars_dev` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `PORT` | API server port | `3005` |
| `BATCH_PORT` | Batch service port | `3006` |

## Files Modified

- `docker-compose.yml` - Added environment variables
- `apps/nestar-api/src/database/database.module.ts` - Enhanced connection logic
- `apps/nestar-batch/src/database/database.module.ts` - Enhanced connection logic
- `config.env.example` - Environment configuration template

## Next Steps

1. Update the connection string with your actual BrandProd credentials
2. Test the connection by running the application
3. Monitor the logs for successful database connection
4. Verify data operations are working correctly
