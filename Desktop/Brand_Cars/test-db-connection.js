#!/usr/bin/env node

/**
 * Database Connection Test Script
 * This script tests the connection to BrandProd database
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing BrandProd database connection...\n');
    
    const isProduction = process.env.NODE_ENV === 'production';
    const mongoUri = isProduction ? process.env.MONGO_PROD : process.env.MONGO_DEV;
    
    if (!mongoUri) {
      throw new Error(
        `MongoDB connection string is not defined for ${isProduction ? 'production' : 'development'} environment`
      );
    }
    
    console.log(`Environment: ${isProduction ? 'Production (BrandProd)' : 'Development'}`);
    console.log(`Connection URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}\n`);
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`✅ Database: ${mongoose.connection.db.databaseName}`);
    console.log(`✅ Host: ${mongoose.connection.host}`);
    console.log(`✅ Port: ${mongoose.connection.port}`);
    console.log(`✅ Ready State: ${mongoose.connection.readyState} (1 = connected)`);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 Available collections:');
      collections.forEach(col => console.log(`   - ${col.name}`));
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication failed. Please check:');
      console.error('   - Username and password in connection string');
      console.error('   - Database user permissions');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Connection timeout. Please check:');
      console.error('   - IP address whitelist in MongoDB Atlas');
      console.error('   - Network connectivity');
      console.error('   - Cluster status');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 DNS resolution failed. Please check:');
      console.error('   - Connection string format');
      console.error('   - Cluster name and URL');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testDatabaseConnection();
