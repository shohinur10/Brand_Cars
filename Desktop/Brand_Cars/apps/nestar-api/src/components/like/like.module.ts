import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from './like.service';
import LikeSchema from '../../schemas/Like.model';
import { NotificationModule } from '../notification/notification.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: "Like",
        schema: LikeSchema,
      },
    ]),
    NotificationModule, // Import notification module for creating notifications
  ],
  providers: [LikeService],//likemodule ivhida biz resolver charishimiz shart chunki togridan togri service ichida quramiz 
  exports :[LikeService],
})
export class LikeModule {}

