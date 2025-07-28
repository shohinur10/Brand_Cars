import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, isNotEmpty } from 'class-validator';
import { MemberType, MemberAuthType, MemberStatus } from '../enums/member.enum'
import { ObjectId } from 'mongoose';

@InputType()
export class MemberUpdate {
	@IsNotEmpty()
 @Field(() => String)
 _id: string;  


	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => MemberStatus, { nullable: true })
	memberStatus?: MemberStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberPhone?: string;

	@IsOptional()
	@Length(3, 12)
	@Field(() => String, { nullable: true })
	memberNick?: string;

	@IsOptional()
	@Length(5, 12)
	@Field(() => String, { nullable: true })
	memberPassword?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	memberFullName?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	memberImage?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	memberAddress?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })

	memberDesc?: string;

	deletedAt?: Date; //user delete but not remove from db
}