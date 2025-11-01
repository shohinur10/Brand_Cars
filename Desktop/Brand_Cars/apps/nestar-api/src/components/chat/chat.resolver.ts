import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Conversation } from '../../libs/dto/chat/conversation';
import { Message } from '../../libs/dto/chat/message';
import { Chat } from '../../libs/dto/chat/chat';
import { ConversationInput, ConversationUpdate, ConversationsInquiry } from '../../libs/dto/chat/conversation.input';
import { MessageInput, MessageUpdate, MessagesInquiry, MessageReactionInput } from '../../libs/dto/chat/message.input';
import { ChatInput, ChatUpdate, ChatsInquiry } from '../../libs/dto/chat/chat.input';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class ChatResolver {
	constructor(private readonly chatService: ChatService) {}

	// ==================== CONVERSATION QUERIES ====================

	@UseGuards(AuthGuard)
	@Query(() => [Conversation])
	public async getConversations(
		@Args('input') input: ConversationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Conversation[]> {
		console.log('Query: getConversations');
		const result = await this.chatService.getConversations(memberId, input);
		return result.list;
	}

	@UseGuards(AuthGuard)
	@Query(() => Conversation)
	public async getConversation(
		@Args('conversationId') conversationId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Conversation> {
		console.log('Query: getConversation');
		return await this.chatService.getConversation(conversationId, memberId);
	}

	// ==================== CONVERSATION MUTATIONS ====================

	@UseGuards(AuthGuard)
	@Mutation(() => Conversation)
	public async createConversation(
		@Args('input') input: ConversationInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Conversation> {
		console.log('Mutation: createConversation');
		return await this.chatService.createConversation(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Conversation)
	public async updateConversation(
		@Args('input') input: ConversationUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Conversation> {
		console.log('Mutation: updateConversation');
		return await this.chatService.updateConversation(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	public async deleteConversation(
		@Args('conversationId') conversationId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<boolean> {
		console.log('Mutation: deleteConversation');
		return await this.chatService.deleteConversation(conversationId, memberId);
	}

	// ==================== MESSAGE QUERIES ====================

	@UseGuards(AuthGuard)
	@Query(() => [Message])
	public async getMessages(
		@Args('input') input: MessagesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Message[]> {
		console.log('Query: getMessages');
		const result = await this.chatService.getMessages(memberId, input);
		return result.list;
	}

	// ==================== MESSAGE MUTATIONS ====================

	@UseGuards(AuthGuard)
	@Mutation(() => Message)
	public async createMessage(
		@Args('input') input: MessageInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Message> {
		console.log('Mutation: createMessage');
		return await this.chatService.createMessage(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Message)
	public async updateMessage(
		@Args('input') input: MessageUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Message> {
		console.log('Mutation: updateMessage');
		return await this.chatService.updateMessage(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	public async deleteMessage(
		@Args('messageId') messageId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<boolean> {
		console.log('Mutation: deleteMessage');
		return await this.chatService.deleteMessage(messageId, memberId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Number)
	public async markMessagesAsRead(
		@Args('conversationId') conversationId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<number> {
		console.log('Mutation: markMessagesAsRead');
		return await this.chatService.markMessagesAsRead(conversationId, memberId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Message)
	public async addMessageReaction(
		@Args('input') input: MessageReactionInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Message> {
		console.log('Mutation: addMessageReaction');
		return await this.chatService.addMessageReaction(memberId, input);
	}

	// ==================== CHAT ROOM QUERIES ====================

	@UseGuards(AuthGuard)
	@Query(() => [Chat])
	public async getChatRooms(
		@Args('input') input: ChatsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Chat[]> {
		console.log('Query: getChatRooms');
		const result = await this.chatService.getChatRooms(memberId, input);
		return result.list;
	}

	// ==================== CHAT ROOM MUTATIONS ====================

	@UseGuards(AuthGuard)
	@Mutation(() => Chat)
	public async createChatRoom(
		@Args('input') input: ChatInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Chat> {
		console.log('Mutation: createChatRoom');
		return await this.chatService.createChatRoom(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Chat)
	public async joinChatRoom(
		@Args('chatId') chatId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Chat> {
		console.log('Mutation: joinChatRoom');
		return await this.chatService.joinChatRoom(chatId, memberId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	public async leaveChatRoom(
		@Args('chatId') chatId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<boolean> {
		console.log('Mutation: leaveChatRoom');
		return await this.chatService.leaveChatRoom(chatId, memberId);
	}
}






















