import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { EnhancedSocketGateway } from './enhanced-socket.gateway';
import { AuthModule } from '../components/auth/auth.module';
import { ChatModule } from '../components/chat/chat.module';

@Module({
  imports: [AuthModule, ChatModule],
  providers: [SocketGateway, EnhancedSocketGateway],
})
export class SocketModule {}