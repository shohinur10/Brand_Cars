import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress}from'graphql-upload';
import * as express from 'express';
import { WsAdapter } from '@nestjs/platform-ws';

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
  app.enableCors({origin: true, credentials: true}); // Enable CORS for all routes security 
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 })); // Middleware for handling file uploads in GraphQL
  app.use('/uploads',express.static('./uploads')); // Serve static files from the uploads directory

  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(process.env.PORT_API ?? 3000);  // uploads faile ochib beryapiz static qilib tashqi olamga 
}
bootstrap(); // bu oddiy function
