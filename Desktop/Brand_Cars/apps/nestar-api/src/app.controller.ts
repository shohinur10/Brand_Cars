import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return this.appService.getHello();
  }

  @Get('api')
  getApiInfo(): any {
    return {
      name: 'Brand Cars API',
      description: 'REST API for Brand Cars application',
      version: '1.0.0',
      endpoints: {
        'GET /': 'API information',
        'GET /health': 'Health check',
        'GET /api': 'API details',
        'POST /graphql': 'GraphQL endpoint',
        'GET /graphql': 'GraphQL Playground'
      },
      documentation: 'Visit /graphql for interactive API explorer'
    };
  }

  @Get('status')
  getStatus(): any {
    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
