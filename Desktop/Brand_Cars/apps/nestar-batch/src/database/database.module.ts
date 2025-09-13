import { Module } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as dotenv from 'dotenv';

// Load environment variables (only if not already set by Docker)
if (!process.env.MONGO_PROD && !process.env.MONGO_DEV) {
  dotenv.config();
}

@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: () => {
				const isProduction = process.env.NODE_ENV === 'production';
				const mongoUri = isProduction ? process.env.MONGO_PROD : process.env.MONGO_DEV;
				
				if (!mongoUri) {
					throw new Error(
						`MongoDB connection string is not defined for ${isProduction ? 'production' : 'development'} environment`
					);
				}

				console.log(`🔗 Batch service connecting to MongoDB ${isProduction ? 'Production (BrandProd)' : 'Development'} database...`);
				console.log(`🔍 Connection URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
				
				return {
					uri: mongoUri,
					retryWrites: true,
					w: 'majority',
					maxPoolSize: 10,
					serverSelectionTimeoutMS: 5000,
					socketTimeoutMS: 45000,
				};
			},
		}),
	],
	exports: [MongooseModule],
})
export class DatabaseModule {
	constructor(@InjectConnection() private readonly connection: Connection) {
		if (connection.readyState === 1) {
			console.log(
				`✅ Batch service MongoDB connected to ${
					process.env.NODE_ENV === 'production' ? 'BrandProd Production' : 'Development'
				} database successfully!`,
			);
		} else {
			console.log('❌ Batch service MongoDB connection failed!');
		}
	}
}