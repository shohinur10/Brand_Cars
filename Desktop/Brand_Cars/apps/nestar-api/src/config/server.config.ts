export const serverConfig = {
  // Server URLs - HTTPS only
  frontendUrl: process.env.FRONTEND_URL || 'https://avtonova.store',
  apiUrl: process.env.API_URL || 'https://avtonova.store',
  
  // CORS Configuration - HTTPS only for production
  corsOrigins: [
    // Production domain - HTTPS only
    'https://avtonova.store',
    'https://www.avtonova.store',
    // Development localhost (for local development only)
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3003',
    'http://localhost:4000',
    'http://localhost:4001',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:4000',
    'http://127.0.0.1:4001',
    'http://127.0.0.1:5000'
  ],
  
  // API Endpoints
  endpoints: {
    graphql: '/graphql',
    health: '/health',
    uploads: '/uploads'
  },
  
  // Server Information
  server: {
    name: 'Brand Cars API',
    version: '1.0.0',
    description: 'Brand Cars Backend API Server'
  }
};
