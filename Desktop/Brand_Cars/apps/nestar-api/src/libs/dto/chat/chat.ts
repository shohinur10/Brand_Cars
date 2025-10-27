import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ChatType } from '../../enums/chat.enum';
import { Member } from '../member';

@ObjectType()
export class ChatSettings {
	@Field(() => Boolean)
	isPublic: boolean;

	@Field(() => Boolean)
	allowGuests: boolean;

	@Field(() => Boolean)
	allowFileSharing: boolean;
}

@ObjectType()
export class Chat {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => ChatType)
	chatType: ChatType;

	@Field(() => String, { nullable: true })
	chatName?: string;

	@Field(() => String, { nullable: true })
	chatDescription?: string;

	@Field(() => [String])
	participants: ObjectId[];

	@Field(() => String, { nullable: true })
	createdBy?: ObjectId;

	@Field(() => Boolean)
	isActive: boolean;

	@Field(() => Number)
	maxParticipants: number;

	@Field(() => ChatSettings)
	settings: ChatSettings;

	@Field(() => Date)
	lastActivity: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	// Populated fields
	@Field(() => [Member], { nullable: true })
	participantsData?: Member[];

	@Field(() => Member, { nullable: true })
	createdByData?: Member;
}


















