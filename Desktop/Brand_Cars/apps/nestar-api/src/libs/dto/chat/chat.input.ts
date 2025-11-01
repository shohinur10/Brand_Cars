import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ChatType } from '../../enums/chat.enum';

@InputType()
export class ChatSettingsInput {
	@Field(() => Boolean, { defaultValue: true })
	isPublic: boolean;

	@Field(() => Boolean, { defaultValue: true })
	allowGuests: boolean;

	@Field(() => Boolean, { defaultValue: true })
	allowFileSharing: boolean;
}

@InputType()
export class ChatInput {
	@Field(() => ChatType)
	chatType: ChatType;

	@Field(() => String, { nullable: true })
	chatName?: string;

	@Field(() => String, { nullable: true })
	chatDescription?: string;

	@Field(() => [String], { nullable: true })
	participants?: ObjectId[];

	@Field(() => Number, { defaultValue: 100 })
	maxParticipants: number;

	@Field(() => ChatSettingsInput, { nullable: true })
	settings?: ChatSettingsInput;
}

@InputType()
export class ChatUpdate {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String, { nullable: true })
	chatName?: string;

	@Field(() => String, { nullable: true })
	chatDescription?: string;

	@Field(() => [String], { nullable: true })
	participants?: ObjectId[];

	@Field(() => Number, { nullable: true })
	maxParticipants?: number;

	@Field(() => ChatSettingsInput, { nullable: true })
	settings?: ChatSettingsInput;
}

@InputType()
export class ChatsInquiry {
	@Field(() => Number, { defaultValue: 1 })
	page: number;

	@Field(() => Number, { defaultValue: 10 })
	limit: number;

	@Field(() => ChatType, { nullable: true })
	chatType?: ChatType;
}






















