import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { MessageType } from '../../enums/chat.enum';

@InputType()
export class MessageAttachmentInput {
	@Field(() => String)
	fileName: string;

	@Field(() => String)
	fileUrl: string;

	@Field(() => String)
	fileType: string;

	@Field(() => Number)
	fileSize: number;
}

@InputType()
export class MessageInput {
	@Field(() => String)
	conversationId: ObjectId;

	@Field(() => MessageType, { defaultValue: 'TEXT' })
	messageType: MessageType;

	@Field(() => String)
	content: string;

	@Field(() => [MessageAttachmentInput], { nullable: true })
	attachments?: MessageAttachmentInput[];

	@Field(() => String, { nullable: true })
	replyTo?: ObjectId;
}

@InputType()
export class MessageUpdate {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	content: string;
}

@InputType()
export class MessagesInquiry {
	@Field(() => String)
	conversationId: ObjectId;

	@Field(() => Number, { defaultValue: 1 })
	page: number;

	@Field(() => Number, { defaultValue: 20 })
	limit: number;
}

@InputType()
export class MessageReactionInput {
	@Field(() => String)
	messageId: ObjectId;

	@Field(() => String)
	emoji: string;
}






















