const http = require("http");
require('dotenv').config();
const { testConnection, initializeDatabase } = require('./config/database');

// MySQL connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to MySQL database. Please check your configuration.');
      process.exit(1);
    }

    // Initialize database tables
    const isInitialized = await initializeDatabase();
    if (!isInitialized) {
      console.error('Failed to initialize database tables.');
      process.exit(1);
    }

    const PORT = process.env.PORT || 3004;
    const app = require("./app");
    const server = http.createServer(app);
    
    server.listen(PORT, () => {
      console.log(`🚀 Server is running successfully on port: ${PORT}`);
      console.log(`📱 Access your app at: http://localhost:${PORT}`);
      console.log(`🗄️  Database: MySQL connected and initialized`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();