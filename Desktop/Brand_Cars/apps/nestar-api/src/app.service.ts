import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      message: 'Welcome to Brand Cars API Service!',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        graphql: '/graphql',
        playground: '/graphql (GraphQL Playground)',
        api: '/api'
      },
      services: {
        api: 'Brand Cars API Service',
        batch: 'Brand Cars Batch Service'
      },
      database: {
        status: 'connected',
        type: 'MongoDB Atlas'
      }
    };
  }
}
