import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';
import { SocketModule } from './socket/socket.module';

// This is the main application module for the Nestar API service.
// It imports necessary modules, sets up GraphQL with Apollo, and configures global error handling.
//Design Pattern: Modular Architecture
@Module({
  imports: [ // buninig asosiy matigini rest Api di Graphql Api otkasish 
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      uploads: false, // defauld uploads ishga tushirma deyapmiz 
      autoSchemaFile: true,
      formatError: (error: T) => { // formatting GraphQL errors globally
        const graphqlFormatError = {
          code: error?.extensions.code ,// GraphQL error code standard tarziga olib otyapmiz 
          message: 
          error?.extensions?.exception?.response?.message || error?.extensions?.exception?.message || error?.message,
        };
        console.log('GRAPHQL GLOBAL ERR:', graphqlFormatError);
        return graphqlFormatError;
      },
    
    }),
    ComponentsModule,
    DatabaseModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],//ingredients orqali boyitvolyapmiz 
})
export class AppModule {}
