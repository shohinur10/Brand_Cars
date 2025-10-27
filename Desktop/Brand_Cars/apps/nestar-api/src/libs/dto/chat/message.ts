import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { MessageType } from '../../enums/chat.enum';
import { Member } from '../member';

@ObjectType()
export class MessageAttachment {
	@Field(() => String)
	fileName: string;

	@Field(() => String)
	fileUrl: string;

	@Field(() => String)
	fileType: string;

	@Field(() => Number)
	fileSize: number;
}

@ObjectType()
export class MessageReaction {
	@Field(() => String)
	userId: ObjectId;

	@Field(() => String)
	emoji: string;

	@Field(() => Date)
	createdAt: Date;

	// Populated field
	@Field(() => Member, { nullable: true })
	userData?: Member;
}

@ObjectType()
export class MessageRead {
	@Field(() => String)
	userId: ObjectId;

	@Field(() => Date)
	readAt: Date;

	// Populated field
	@Field(() => Member, { nullable: true })
	userData?: Member;
}

@ObjectType()
export class Message {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	conversationId: ObjectId;

	@Field(() => String)
	senderId: ObjectId;

	@Field(() => MessageType)
	messageType: MessageType;

	@Field(() => String)
	content: string;

	@Field(() => [MessageAttachment], { nullable: true })
	attachments?: MessageAttachment[];

	@Field(() => String, { nullable: true })
	replyTo?: ObjectId;

	@Field(() => Boolean)
	isEdited: boolean;

	@Field(() => Date, { nullable: true })
	editedAt?: Date;

	@Field(() => Boolean)
	isDeleted: boolean;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => [MessageRead], { nullable: true })
	readBy?: MessageRead[];

	@Field(() => [MessageReaction], { nullable: true })
	reactions?: MessageReaction[];

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	// Populated fields
	@Field(() => Member, { nullable: true })
	senderData?: Member;

	@Field(() => Message, { nullable: true })
	replyToData?: Message;
}


















