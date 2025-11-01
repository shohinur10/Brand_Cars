# Database Connection Setup Guide

## Problem
The backend is experiencing connection timeouts when trying to connect to MongoDB Atlas. The error `Socket 'secureConnect' timed out after 30000ms` indicates the backend cannot reach the database.

## Solution Applied

### 1. Updated docker-compose.yml
Added environment variable configuration to pass MongoDB connection strings to containers:
- Added `environment` section with `NODE_ENV`, `MONGO_PROD`, and `MONGO_DEV`
- Added `env_file: - .env` to load variables from a `.env` file

### 2. Improved MongoDB Connection Timeouts
Updated both `apps/nestar-api/src/database/database.module.ts` and `apps/nestar-batch/src/database/database.module.ts` with:
- `serverSelectionTimeoutMS: 30000` (increased from 5000)
- `connectTimeoutMS: 30000` (added for initial connection)
- `heartbeatFrequencyMS: 10000` (added for Atlas stability)

## Setup Instructions

### Step 1: Create .env File
Create a `.env` file in the root directory of the project:

```bash
cp environment.example .env
```

### Step 2: Configure Environment Variables
Edit the `.env` file and set your MongoDB Atlas connection strings:

```env
NODE_ENV=production
MONGO_PROD=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/BrandProd?retryWrites=true&w=majority
MONGO_DEV=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/BrandDev?retryWrites=true&w=majority
```

**Important:**
- Replace `YOUR_USERNAME` with your Atlas database username
- Replace `YOUR_PASSWORD` with your Atlas database password
- Replace `YOUR_CLUSTER` with your Atlas cluster endpoint

### Step 3: Configure MongoDB Atlas Network Access
1. Log into MongoDB Atlas
2. Go to **Network Access** in the left sidebar
3. Click **Add IP Address**
4. Add your production server IP: `72.60.236.198/32`
5. Or add `0.0.0.0/0` to allow all IPs (only for testing/development)

### Step 4: Restart Docker Containers
Rebuild and restart your containers:

```bash
docker-compose down
docker-compose up --build -d
```

### Step 5: Verify Connection
Check the container logs to verify the database connection:

```bash
docker logs job-board-ai
```

You should see:
```
🔗 Connecting to MongoDB Production (BrandProd) database...
🔍 Connection URI: mongodb+srv://***:***@...
✅ MongoDB is connected to BrandProd Production database successfully!
```

## Troubleshooting

### Still getting timeout errors?
1. **Check IP whitelist**: Ensure your server IP is in Atlas Network Access
2. **Verify credentials**: Double-check username and password in `.env`
3. **Test connection string**: Try connecting with MongoDB Compass or `mongosh`
4. **Check Atlas status**: Visit https://status.cloud.mongodb.com/

### Connection string format
Your MongoDB Atlas connection string should look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

Get this from Atlas: Click **Connect** → **Connect your application** → Copy the connection string.

### Common issues
- **Authentication failed**: Wrong username/password
- **Network timeout**: IP not whitelisted in Atlas
- **Server not found**: Incorrect cluster endpoint
- **SSL/TLS issues**: Add `&ssl=true` to connection string

## Testing the Connection
You can test the connection locally before deploying:

```bash
node test-db-connection.js
```

Or test in production mode:
```bash
NODE_ENV=production node test-db-connection.js
```




