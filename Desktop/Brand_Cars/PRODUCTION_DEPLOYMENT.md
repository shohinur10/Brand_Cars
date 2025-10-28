# Production Deployment Checklist

## ✅ Completed Fixes (Local)
- [x] Updated `docker-compose.yml` to pass environment variables
- [x] Increased MongoDB connection timeouts
- [x] Changed `NODE_ENV` to `production` in `.env`
- [x] Tested database connection locally
- [x] Committed and pushed changes to `master` branch

## 🔧 Required Steps for Production Server

### Step 1: MongoDB Atlas IP Whitelist

**CRITICAL:** The production server IP must be whitelisted in MongoDB Atlas.

1. Log into MongoDB Atlas: https://cloud.mongodb.com/
2. Select your project (Brand Cars project)
3. Go to **Network Access** in the left sidebar
4. Click **Add IP Address**
5. Add the production server IP: `72.60.236.198/32`
6. Click **Confirm**
7. Wait 1-2 minutes for changes to propagate

**Alternative (Less Secure):** For testing, you can add `0.0.0.0/0` to allow all IPs, but this is not recommended for production.

### Step 2: Verify .env on Production Server

SSH into the production server and check/edit the `.env` file:

```bash
# SSH into production server
ssh user@72.60.236.198

# Navigate to project directory
cd /path/to/Brand_Cars

# Check current .env file
cat .env

# Ensure NODE_ENV=production is set
# The file should contain:
# NODE_ENV=production
# MONGO_PROD=mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/BrandProd?retryWrites=true&w=majority
# MONGO_DEV=...
```

### Step 3: Deploy to Production Server

On the production server, run:

```bash
cd /path/to/Brand_Cars

# Pull the latest changes
git pull origin master

# Run the deployment script (this will rebuild containers)
./deploy.sh

# Or manually deploy
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Step 4: Verify Deployment

```bash
# Check container logs
docker logs job-board-ai

# Look for these messages:
# "🔗 Connecting to MongoDB Production (BrandProd) database..."
# "✅ MongoDB is connected to BrandProd Production database successfully!"

# Test the API
curl http://localhost:4001/status

# Test GraphQL
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

### Step 5: Test Login Flow

The login should now work without database timeout errors. Test the full authentication flow:

1. Open frontend at `http://72.60.236.198:4000`
2. Attempt to login
3. Verify no timeout errors occur
4. Check backend logs for successful database queries

## 🚨 Troubleshooting

### If Still Getting Timeout Errors:

1. **Check IP Whitelist:**
   ```bash
   # Verify IP is whitelisted in Atlas
   # Look in Network Access section
   ```

2. **Verify Environment Variables:**
   ```bash
   docker exec job-board-ai env | grep MONGO
   # Should show MONGO_PROD with your connection string
   ```

3. **Check MongoDB Atlas Status:**
   - Visit: https://status.cloud.mongodb.com/
   - Ensure no ongoing incidents

4. **Test Connection Directly:**
   ```bash
   # SSH into production server
   ssh user@72.60.236.198
   
   # Try connecting with mongosh (if installed)
   mongosh "mongodb+srv://Adam:uXxanQ7wECkOgqgT@cluster0.fme80.mongodb.net/BrandProd"
   ```

5. **Check Firewall/Security Groups:**
   - Ensure port 27017 (MongoDB) is not blocked
   - MongoDB Atlas uses port 27017 for standard connections
   - For mongodb+srv, it uses DNS SRV records

### Rollback Plan:

If deployment fails, rollback to previous version:

```bash
cd /path/to/Brand_Cars
git reset --hard HEAD~1
docker compose down
docker compose build
docker compose up -d
```

## 📝 Notes

- The production server is running at: `72.60.236.198:4001`
- Frontend is at: `http://72.60.236.198:4000`
- Current uptime shows it was running for ~174739 seconds before our fix
- After deployment, the server will restart with the new configuration

## ✅ Success Indicators

After successful deployment, you should see:
- ✅ Backend API responding on port 4001
- ✅ GraphQL endpoint working
- ✅ No database connection timeouts in logs
- ✅ Successful login without "Socket 'secureConnect' timed out" errors
- ✅ Database queries completing successfully

