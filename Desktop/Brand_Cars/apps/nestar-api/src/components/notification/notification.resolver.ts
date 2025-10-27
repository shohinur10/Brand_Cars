import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Notification } from '../../libs/dto/notification/notification';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationInquiry } from '../../libs/dto/notification/notification.inquiry';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(AuthGuard)
	@Query(() => [Notification])
	public async getNotifications(
		@Args('input') input: NotificationInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification[]> {
		console.log('Query: getNotifications');
		const result = await this.notificationService.getNotifications(memberId, input);
		return result.list;
	}

	@UseGuards(AuthGuard)
	@Query(() => Number)
	public async getNotificationCount(@AuthMember('_id') memberId: ObjectId): Promise<number> {
		console.log('Query: getNotificationCount');
		return await this.notificationService.getNotificationCount(memberId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async markNotificationAsRead(
		@Args('notificationId') notificationId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		console.log('Mutation: markNotificationAsRead');
		return await this.notificationService.markNotificationAsRead(notificationId, memberId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Number)
	public async markAllNotificationsAsRead(@AuthMember('_id') memberId: ObjectId): Promise<number> {
		console.log('Mutation: markAllNotificationsAsRead');
		return await this.notificationService.markAllNotificationsAsRead(memberId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	public async deleteNotification(
		@Args('notificationId') notificationId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<boolean> {
		console.log('Mutation: deleteNotification');
		return await this.notificationService.deleteNotification(notificationId, memberId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async createNotification(
		@Args('input') input: NotificationInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		console.log('Mutation: createNotification');
		// Set the author as the current user
		input.authorId = memberId;
		return await this.notificationService.createNotification(input);
	}
}