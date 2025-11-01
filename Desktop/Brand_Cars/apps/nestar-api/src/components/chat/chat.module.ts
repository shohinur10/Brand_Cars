import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import ConversationSchema from '../../schemas/Conversation.model';
import MessageSchema from '../../schemas/Message.model';
import ChatSchema from '../../schemas/Chat.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Conversation', schema: ConversationSchema },
			{ name: 'Message', schema: MessageSchema },
			{ name: 'Chat', schema: ChatSchema },
		]),
		AuthModule, // Import AuthModule for AuthGuard dependency
	],
	providers: [ChatResolver, ChatService],
	exports: [ChatService],
})
export class ChatModule {}






















