import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';
import CarSchema from '../../schemas/Car.model';
import { CarService } from './car.service';
import { CarResolver } from './car.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Car',
         schema: CarSchema ,
        },
      ]),
         AuthModule,
         ViewModule ,// Assuming you have a CarSchema defined
         MemberModule,
         LikeModule
  ],
  providers: [CarResolver, CarService],
  exports: [CarService],
})
export class CarModule {}
