import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ConversationType } from '../../enums/chat.enum';
import { Member } from '../member';
import { Message } from './message';

@ObjectType()
export class Conversation {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => ConversationType)
	conversationType: ConversationType;

	@Field(() => [String])
	participants: ObjectId[];

	@Field(() => String, { nullable: true })
	lastMessage?: ObjectId;

	@Field(() => Date, { nullable: true })
	lastMessageAt?: Date;

	@Field(() => String, { nullable: true })
	conversationName?: string;

	@Field(() => String, { nullable: true })
	conversationDescription?: string;

	@Field(() => String)
	createdBy: ObjectId;

	@Field(() => Boolean)
	isActive: boolean;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	// Populated fields
	@Field(() => [Member], { nullable: true })
	participantsData?: Member[];

	@Field(() => Member, { nullable: true })
	createdByData?: Member;

	@Field(() => Message, { nullable: true })
	lastMessageData?: Message;

	@Field(() => Number, { nullable: true })
	unreadCount?: number;
}


















