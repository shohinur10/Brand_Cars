import { Module } from '@nestjs/common';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.NODE_ENV === 'production'
            ? process.env.MONGO_PROD // ✅ mos nom
            : process.env.MONGO_DEV,  // ✅ mos nom
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {
  constructor(@InjectConnection() private readonly connection: Connection) {
    if (connection.readyState === 1) {
      console.log(
        `✅ MongoDB is connected into ${
          process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
        } mode`,
      );
    } else {
      console.log('❌ DB is not connected!');
    }
  }
}
