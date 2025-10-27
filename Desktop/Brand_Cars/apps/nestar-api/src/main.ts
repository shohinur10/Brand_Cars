import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress}from'graphql-upload';
import * as express from 'express';
import { Request, Response } from 'express';
import { WsAdapter } from '@nestjs/platform-ws';
import { serverConfig } from './config/server.config';
import * as cors from 'cors';
import * as fs from 'fs';
import * as https from 'https';

// bu yerda global integration qurvoryapmiz 
async function bootstrap() { // call qismi
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: false, // Don't throw errors for unknown properties
    transform: true, // Transform payloads to DTO instances
    disableErrorMessages: false, // Keep error messages for debugging
  })); // Middleware for validating incoming requests
  app.useGlobalInterceptors(new LoggingInterceptor()); // Middleware for logging requests and responses
  // Use Express CORS middleware directly
  app.use(cors.default({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = serverConfig.corsOrigins;
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS: Origin not allowed:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
  })); 
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 })); // Middleware for handling file uploads in GraphQL
  app.use('/uploads',express.static('./uploads')); // Serve static files from the uploads directory
  app.use('/public',express.static('./public')); // Serve static files from the public directory (for logos, etc.)

  // Get the underlying Express instance
  const expressApp = app.getHttpAdapter().getInstance();

  // Health check endpoint
  expressApp.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'OK',
      server: serverConfig.server.name,
      version: serverConfig.server.version,
      timestamp: new Date().toISOString(),
      frontendUrl: serverConfig.frontendUrl,
      apiUrl: serverConfig.apiUrl
    });
  });

  // Serve a simple HTML page at root
  expressApp.get('/', (req: Request, res: Response) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Brand Cars API</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
            }
            .container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: rgba(255,255,255,0.1);
                padding: 30px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            h1 { 
                color: #fff; 
                text-align: center; 
                margin-bottom: 30px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .endpoint { 
                background: rgba(255,255,255,0.2); 
                padding: 15px; 
                margin: 10px 0; 
                border-radius: 8px;
                border-left: 4px solid #4CAF50;
            }
            .endpoint h3 { 
                margin: 0 0 10px 0; 
                color: #4CAF50;
            }
            .endpoint p { 
                margin: 5px 0; 
                opacity: 0.9;
            }
            .status { 
                background: rgba(76, 175, 80, 0.2); 
                padding: 10px; 
                border-radius: 5px; 
                margin: 20px 0;
                text-align: center;
            }
            a { 
                color: #4CAF50; 
                text-decoration: none; 
                font-weight: bold;
            }
            a:hover { 
                text-decoration: underline; 
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                opacity: 0.7;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚗 Brand Cars API Service</h1>
            
            <div class="status">
                <h3>✅ Service Status: Online</h3>
                <p>API is running and ready to serve requests</p>
            </div>

            <div class="endpoint">
                <h3>🔧 API Endpoints</h3>
                <p><strong>GET /</strong> - This page (API information)</p>
                <p><strong>GET /health</strong> - Health check endpoint</p>
                <p><strong>GET /api</strong> - API details and documentation</p>
                <p><strong>GET /status</strong> - Server status and metrics</p>
                <p><strong>POST /graphql</strong> - GraphQL API endpoint</p>
            </div>

            <div class="endpoint">
                <h3>🎮 Interactive Tools</h3>
                <p><a href="/graphql" target="_blank">GraphQL Playground</a> - Interactive API explorer</p>
                <p><a href="/health" target="_blank">Health Check</a> - Service health status</p>
                <p><a href="/api" target="_blank">API Info</a> - Detailed API information</p>
            </div>

            <div class="endpoint">
                <h3>📊 Service Information</h3>
                <p><strong>Server:</strong> ${serverConfig.server.name}</p>
                <p><strong>Version:</strong> ${serverConfig.server.version}</p>
                <p><strong>Environment:</strong> Production</p>
                <p><strong>Database:</strong> MongoDB Atlas</p>
                <p><strong>Frontend URL:</strong> ${serverConfig.frontendUrl}</p>
            </div>

            <div class="footer">
                <p>Brand Cars API Service - Built with NestJS & GraphQL</p>
                <p>Timestamp: ${new Date().toISOString()}</p>
            </div>
        </div>
    </body>
    </html>
    `;
    res.send(html);
  });

  app.useWebSocketAdapter(new WsAdapter(app));
  
  // Check if SSL certificates are provided for HTTPS
  const sslCertPath = process.env.SSL_CERT_PATH;
  const sslKeyPath = process.env.SSL_KEY_PATH;
  
  if (sslCertPath && sslKeyPath && fs.existsSync(sslCertPath) && fs.existsSync(sslKeyPath)) {
    // HTTPS configuration
    const httpsOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    };
    
    const httpsServer = https.createServer(httpsOptions, app.getHttpAdapter().getInstance());
    await app.init();
    httpsServer.listen(process.env.PORT ?? 3005, () => {
      console.log(`🚀 HTTPS Server running on port ${process.env.PORT ?? 3005}`);
      console.log(`🔒 SSL enabled for domain: avtonova.store`);
    });
  } else {
    // HTTP configuration (fallback)
    await app.listen(process.env.PORT ?? 3005);
    console.log(`🚀 HTTP Server running on port ${process.env.PORT ?? 3005}`);
    console.log(`⚠️  SSL not configured - using HTTP only`);
  }
}
bootstrap(); // bu oddiy function
