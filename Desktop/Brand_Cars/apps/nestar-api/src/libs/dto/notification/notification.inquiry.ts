import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class NotificationInquiry {
	@Field(() => Int, { defaultValue: 1 })
	page: number;

	@Field(() => Int, { defaultValue: 10 })
	limit: number;
}


















