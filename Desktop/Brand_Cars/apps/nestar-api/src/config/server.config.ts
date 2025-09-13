export const serverConfig = {
  // Server URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://72.60.108.222',
  apiUrl: process.env.API_URL || 'http://72.60.108.222:4001',
  
  // CORS Configuration
  corsOrigins: [
    'http://72.60.108.222',
    'http://72.60.108.222:80',
    'http://72.60.108.222:3000',
    'http://72.60.108.222:3001',
    'http://72.60.108.222:4000',
    'http://72.60.108.222:4001',
    'http://72.60.108.222:5000',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4000',
    'http://localhost:4001',
    'http://localhost:5000'
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
