import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Conversation } from '../../libs/dto/chat/conversation';
import { Message } from '../../libs/dto/chat/message';
import { Chat } from '../../libs/dto/chat/chat';
import { ConversationType, MessageType, ChatType } from '../../libs/enums/chat.enum';
import { ConversationInput, ConversationUpdate, ConversationsInquiry } from '../../libs/dto/chat/conversation.input';
import { MessageInput, MessageUpdate, MessagesInquiry, MessageReactionInput } from '../../libs/dto/chat/message.input';
import { ChatInput, ChatUpdate, ChatsInquiry } from '../../libs/dto/chat/chat.input';
import { Message as MessageEnum } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class ChatService {
	constructor(
		@InjectModel('Conversation') private readonly conversationModel: Model<Conversation>,
		@InjectModel('Message') private readonly messageModel: Model<Message>,
		@InjectModel('Chat') private readonly chatModel: Model<Chat>,
	) {}

	// ==================== CONVERSATION METHODS ====================

	// Create a new conversation
	public async createConversation(memberId: ObjectId, input: ConversationInput): Promise<Conversation> {
		try {
			// For private conversations, check if one already exists
			if (input.conversationType === ConversationType.PRIVATE && input.participants.length === 2) {
				const existingConversation = await this.conversationModel.findOne({
					conversationType: ConversationType.PRIVATE,
					participants: { $all: input.participants },
				}).exec();

				if (existingConversation) {
					return existingConversation;
				}
			}

			const conversation = await this.conversationModel.create({
				...input,
				createdBy: memberId,
				participants: [...input.participants, memberId], // Include creator
			});

			console.log('✅ Conversation created:', conversation._id);
			return conversation;
		} catch (err) {
			console.log('❌ Error creating conversation:', err.message);
			throw new BadRequestException(MessageEnum.CREATE_FAILED);
		}
	}

	// Get conversations for a user
	public async getConversations(memberId: ObjectId, input: ConversationsInquiry): Promise<{ list: Conversation[]; metaCounter: any[] }> {
		const { page = 1, limit = 10, conversationType } = input;
		
		const match: T = { 
			participants: memberId,
			isActive: true,
		};

		if (conversationType) {
			match.conversationType = conversationType;
		}
		
		try {
			const result = await this.conversationModel.aggregate([
				{ $match: match },
				{ $sort: { lastMessageAt: -1 } },
				{
					$lookup: {
						from: 'members',
						localField: 'participants',
						foreignField: '_id',
						as: 'participantsData',
					},
				},
				{
					$lookup: {
						from: 'members',
						localField: 'createdBy',
						foreignField: '_id',
						as: 'createdByData',
					},
				},
				{
					$lookup: {
						from: 'messages',
						localField: 'lastMessage',
						foreignField: '_id',
						as: 'lastMessageData',
					},
				},
				{
					$addFields: {
						unreadCount: {
							$ifNull: [`$unreadCount.${memberId.toString()}`, 0]
						}
					}
				},
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							{ $unwind: { path: '$createdByData', preserveNullAndEmptyArrays: true } },
							{ $unwind: { path: '$lastMessageData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			]).exec();

			return result[0] || { list: [], metaCounter: [{ total: 0 }] };
		} catch (err) {
			console.log('❌ Error fetching conversations:', err.message);
			throw new InternalServerErrorException(MessageEnum.UPDATED_FAILED);
		}
	}

	// Get conversation by ID
	public async getConversation(conversationId: string, memberId: ObjectId): Promise<Conversation> {
		const id = shapeIntoMongoObjectId(conversationId);
		
		try {
			const conversation = await this.conversationModel.findOne({
				_id: id,
				participants: memberId,
				isActive: true,
			}).populate('participants').populate('createdBy').exec();

			if (!conversation) {
				throw new NotFoundException('Conversation not found or access denied');
			}

			return conversation;
		} catch (err) {
			console.log('❌ Error fetching conversation:', err.message);
			throw new BadRequestException(MessageEnum.UPDATED_FAILED);
		}
	}

	// Update conversation
	public async updateConversation(memberId: ObjectId, input: ConversationUpdate): Promise<Conversation> {
		const id = shapeIntoMongoObjectId(input._id);
		
		try {
			const conversation = await this.conversationModel.findOneAndUpdate(
				{ _id: id, createdBy: memberId },
				{ $set: input },
				{ new: true }
			).populate('participants').populate('createdBy').exec();

			if (!conversation) {
				throw new NotFoundException('Conversation not found or access denied');
			}

			console.log('✅ Conversation updated:', conversation._id);
			return conversation;
		} catch (err) {
			console.log('❌ Error updating conversation:', err.message);
			throw new BadRequestException(MessageEnum.UPDATED_FAILED);
		}
	}

	// Delete conversation
	public async deleteConversation(conversationId: string, memberId: ObjectId): Promise<boolean> {
		const id = shapeIntoMongoObjectId(conversationId);
		
		try {
			const conversation = await this.conversationModel.findOneAndUpdate(
				{ _id: id, createdBy: memberId },
				{ isActive: false }
			).exec();

			if (!conversation) {
				throw new NotFoundException('Conversation not found or access denied');
			}

			console.log('✅ Conversation deleted:', conversationId);
			return true;
		} catch (err) {
			console.log('❌ Error deleting conversation:', err.message);
			throw new BadRequestException(MessageEnum.REMOVE_FAILED);
		}
	}

	// ==================== MESSAGE METHODS ====================

	// Create a new message
	public async createMessage(memberId: ObjectId, input: MessageInput): Promise<Message> {
		try {
			// Verify user is participant in conversation
			const conversation = await this.conversationModel.findOne({
				_id: input.conversationId,
				participants: memberId,
				isActive: true,
			}).exec();

			if (!conversation) {
				throw new NotFoundException('Conversation not found or access denied');
			}

			const message = await this.messageModel.create({
				...input,
				senderId: memberId,
			});

			// Update conversation's last message
			await this.conversationModel.findByIdAndUpdate(input.conversationId, {
				lastMessage: message._id,
				lastMessageAt: message.createdAt,
			}).exec();

			// Increment unread count for all participants except sender
			await this.conversationModel.findByIdAndUpdate(input.conversationId, {
				$inc: {
					[`unreadCount.${memberId.toString()}`]: 0, // Don't increment for sender
				}
			}).exec();

			// Increment for other participants
			const otherParticipants = conversation.participants.filter(p => p.toString() !== memberId.toString());
			for (const participant of otherParticipants) {
				await this.conversationModel.findByIdAndUpdate(input.conversationId, {
					$inc: {
						[`unreadCount.${participant.toString()}`]: 1
					}
				}).exec();
			}

			console.log('✅ Message created:', message._id);
			return message;
		} catch (err) {
			console.log('❌ Error creating message:', err.message);
			throw new BadRequestException(MessageEnum.CREATE_FAILED);
		}
	}

	// Get messages for a conversation
	public async getMessages(memberId: ObjectId, input: MessagesInquiry): Promise<{ list: Message[]; metaCounter: any[] }> {
		const { conversationId, page = 1, limit = 20 } = input;
		const convId = shapeIntoMongoObjectId(conversationId);
		
		// Verify user is participant
		const conversation = await this.conversationModel.findOne({
			_id: convId,
			participants: memberId,
			isActive: true,
		}).exec();

		if (!conversation) {
			throw new NotFoundException('Conversation not found or access denied');
		}
		
		try {
			const result = await this.messageModel.aggregate([
				{ $match: { conversationId: convId, isDeleted: false } },
				{ $sort: { createdAt: -1 } },
				{
					$lookup: {
						from: 'members',
						localField: 'senderId',
						foreignField: '_id',
						as: 'senderData',
					},
				},
				{
					$lookup: {
						from: 'messages',
						localField: 'replyTo',
						foreignField: '_id',
						as: 'replyToData',
					},
				},
				{
					$lookup: {
						from: 'members',
						localField: 'readBy.userId',
						foreignField: '_id',
						as: 'readByUserData',
					},
				},
				{
					$lookup: {
						from: 'members',
						localField: 'reactions.userId',
						foreignField: '_id',
						as: 'reactionsUserData',
					},
				},
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							{ $unwind: { path: '$senderData', preserveNullAndEmptyArrays: true } },
							{ $unwind: { path: '$replyToData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			]).exec();

			return result[0] || { list: [], metaCounter: [{ total: 0 }] };
		} catch (err) {
			console.log('❌ Error fetching messages:', err.message);
			throw new InternalServerErrorException(MessageEnum.UPDATED_FAILED);
		}
	}

	// Update message
	public async updateMessage(memberId: ObjectId, input: MessageUpdate): Promise<Message> {
		const id = shapeIntoMongoObjectId(input._id);
		
		try {
			const message = await this.messageModel.findOneAndUpdate(
				{ _id: id, senderId: memberId, isDeleted: false },
				{ 
					$set: { 
						content: input.content,
						isEdited: true,
						editedAt: new Date(),
					}
				},
				{ new: true }
			).populate('senderId').exec();

			if (!message) {
				throw new NotFoundException('Message not found or access denied');
			}

			console.log('✅ Message updated:', message._id);
			return message;
		} catch (err) {
			console.log('❌ Error updating message:', err.message);
			throw new BadRequestException(MessageEnum.UPDATED_FAILED);
		}
	}

	// Delete message
	public async deleteMessage(messageId: string, memberId: ObjectId): Promise<boolean> {
		const id = shapeIntoMongoObjectId(messageId);
		
		try {
			const message = await this.messageModel.findOneAndUpdate(
				{ _id: id, senderId: memberId },
				{ 
					isDeleted: true,
					deletedAt: new Date(),
					content: 'This message was deleted',
				}
			).exec();

			if (!message) {
				throw new NotFoundException('Message not found or access denied');
			}

			console.log('✅ Message deleted:', messageId);
			return true;
		} catch (err) {
			console.log('❌ Error deleting message:', err.message);
			throw new BadRequestException(MessageEnum.REMOVE_FAILED);
		}
	}

	// Mark messages as read
	public async markMessagesAsRead(conversationId: string, memberId: ObjectId): Promise<number> {
		const id = shapeIntoMongoObjectId(conversationId);
		
		try {
			// Reset unread count
			await this.conversationModel.findByIdAndUpdate(id, {
				$unset: { [`unreadCount.${memberId.toString()}`]: 1 }
			}).exec();

			// Mark messages as read
			const result = await this.messageModel.updateMany(
				{ 
					conversationId: id,
					'senderId': { $ne: memberId },
					'readBy.userId': { $ne: memberId }
				},
				{ 
					$push: { 
						readBy: { 
							userId: memberId, 
							readAt: new Date() 
						} 
					} 
				}
			).exec();

			console.log('✅ Messages marked as read:', result.modifiedCount);
			return result.modifiedCount;
		} catch (err) {
			console.log('❌ Error marking messages as read:', err.message);
			throw new BadRequestException(MessageEnum.UPDATED_FAILED);
		}
	}

	// Add reaction to message
	public async addMessageReaction(memberId: ObjectId, input: MessageReactionInput): Promise<Message> {
		const messageId = shapeIntoMongoObjectId(input.messageId);
		
		try {
			// Remove existing reaction from this user
			await this.messageModel.findByIdAndUpdate(messageId, {
				$pull: { reactions: { userId: memberId } }
			}).exec();

			// Add new reaction
			const message = await this.messageModel.findByIdAndUpdate(messageId, {
				$push: { 
					reactions: { 
						userId: memberId, 
						emoji: input.emoji,
						createdAt: new Date()
					} 
				}
			}, { new: true }).populate('senderId').exec();

			if (!message) {
				throw new NotFoundException('Message not found');
			}

			console.log('✅ Reaction added to message:', messageId);
			return message;
		} catch (err) {
			console.log('❌ Error adding reaction:', err.message);
			throw new BadRequestException(MessageEnum.UPDATED_FAILED);
		}
	}

	// ==================== CHAT ROOM METHODS ====================

	// Create a chat room
	public async createChatRoom(memberId: ObjectId, input: ChatInput): Promise<Chat> {
		try {
			const chat = await this.chatModel.create({
				...input,
				createdBy: memberId,
				participants: input.participants ? [...input.participants, memberId] : [memberId],
			});

			console.log('✅ Chat room created:', chat._id);
			return chat;
		} catch (err) {
			console.log('❌ Error creating chat room:', err.message);
			throw new BadRequestException(MessageEnum.CREATE_FAILED);
		}
	}

	// Get chat rooms
	public async getChatRooms(memberId: ObjectId, input: ChatsInquiry): Promise<{ list: Chat[]; metaCounter: any[] }> {
		const { page = 1, limit = 10, chatType } = input;
		
		const match: T = { 
			isActive: true,
		};

		if (chatType) {
			match.chatType = chatType;
		} else {
			// For non-global chats, user must be participant
			match.$or = [
				{ chatType: ChatType.GLOBAL },
				{ participants: memberId }
			];
		}
		
		try {
			const result = await this.chatModel.aggregate([
				{ $match: match },
				{ $sort: { lastActivity: -1 } },
				{
					$lookup: {
						from: 'members',
						localField: 'participants',
						foreignField: '_id',
						as: 'participantsData',
					},
				},
				{
					$lookup: {
						from: 'members',
						localField: 'createdBy',
						foreignField: '_id',
						as: 'createdByData',
					},
				},
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							{ $unwind: { path: '$createdByData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			]).exec();

			return result[0] || { list: [], metaCounter: [{ total: 0 }] };
		} catch (err) {
			console.log('❌ Error fetching chat rooms:', err.message);
			throw new InternalServerErrorException(MessageEnum.UPDATED_FAILED);
		}
	}

	// Join chat room
	public async joinChatRoom(chatId: string, memberId: ObjectId): Promise<Chat> {
		const id = shapeIntoMongoObjectId(chatId);
		
		try {
			const chat = await this.chatModel.findOneAndUpdate(
				{ 
					_id: id, 
					isActive: true,
					$expr: { $lt: [{ $size: '$participants' }, '$maxParticipants'] }
				},
				{ 
					$addToSet: { participants: memberId },
					$set: { lastActivity: new Date() }
				},
				{ new: true }
			).populate('participants').populate('createdBy').exec();

			if (!chat) {
				throw new NotFoundException('Chat room not found, full, or access denied');
			}

			console.log('✅ User joined chat room:', chatId);
			return chat;
		} catch (err) {
			console.log('❌ Error joining chat room:', err.message);
			throw new BadRequestException(MessageEnum.UPDATED_FAILED);
		}
	}

	// Leave chat room
	public async leaveChatRoom(chatId: string, memberId: ObjectId): Promise<boolean> {
		const id = shapeIntoMongoObjectId(chatId);
		
		try {
			const chat = await this.chatModel.findOneAndUpdate(
				{ _id: id, participants: memberId },
				{ 
					$pull: { participants: memberId },
					$set: { lastActivity: new Date() }
				}
			).exec();

			if (!chat) {
				throw new NotFoundException('Chat room not found or user not participant');
			}

			console.log('✅ User left chat room:', chatId);
			return true;
		} catch (err) {
			console.log('❌ Error leaving chat room:', err.message);
			throw new BadRequestException(MessageEnum.UPDATED_FAILED);
		}
	}
}
