import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ConversationType } from '../../enums/chat.enum';

@InputType()
export class ConversationInput {
	@Field(() => ConversationType)
	conversationType: ConversationType;

	@Field(() => [String])
	participants: ObjectId[];

	@Field(() => String, { nullable: true })
	conversationName?: string;

	@Field(() => String, { nullable: true })
	conversationDescription?: string;
}

@InputType()
export class ConversationUpdate {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String, { nullable: true })
	conversationName?: string;

	@Field(() => String, { nullable: true })
	conversationDescription?: string;

	@Field(() => [String], { nullable: true })
	participants?: ObjectId[];
}

@InputType()
export class ConversationsInquiry {
	@Field(() => Number, { defaultValue: 1 })
	page: number;

	@Field(() => Number, { defaultValue: 10 })
	limit: number;

	@Field(() => ConversationType, { nullable: true })
	conversationType?: ConversationType;
}






















