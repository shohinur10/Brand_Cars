import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notification } from '../../libs/dto/notification/notification';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationInquiry } from '../../libs/dto/notification/notification.inquiry';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification') private readonly notificationModel: Model<Notification>,
	) {}

	// Create a new notification
	public async createNotification(input: NotificationInput): Promise<Notification> {
		try {
			const notification = await this.notificationModel.create(input);
			console.log('✅ Notification created:', notification._id);
			return notification;
		} catch (err) {
			console.log('❌ Error creating notification:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	// Get notifications for a user with pagination
	public async getNotifications(memberId: ObjectId, input: NotificationInquiry): Promise<{ list: Notification[]; metaCounter: any[] }> {
		const { page = 1, limit = 10 } = input;
		
		const match: T = { receiverId: memberId };
		
		try {
			const result = await this.notificationModel.aggregate([
				{ $match: match },
				{ $sort: { createdAt: -1 } },
				{
					$lookup: {
						from: 'members',
						localField: 'authorId',
						foreignField: '_id',
						as: 'authorData',
					},
				},
				{
					$lookup: {
						from: 'cars',
						localField: 'carId',
						foreignField: '_id',
						as: 'carData',
					},
				},
				{
					$lookup: {
						from: 'boardarticles',
						localField: 'articleId',
						foreignField: '_id',
						as: 'articleData',
					},
				},
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							{ $unwind: { path: '$authorData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			]).exec();

			return result[0] || { list: [], metaCounter: [{ total: 0 }] };
		} catch (err) {
			console.log('❌ Error fetching notifications:', err.message);
			throw new InternalServerErrorException(Message.UPDATED_FAILED);
		}
	}

	// Get notification count for a user
	public async getNotificationCount(memberId: ObjectId): Promise<number> {
		try {
			const count = await this.notificationModel.countDocuments({
				receiverId: memberId,
				notificationStatus: NotificationStatus.WAIT,
			});
			return count;
		} catch (err) {
			console.log('❌ Error getting notification count:', err.message);
			return 0;
		}
	}

	// Mark notification as read
	public async markNotificationAsRead(notificationId: string, memberId: ObjectId): Promise<Notification> {
		const id = shapeIntoMongoObjectId(notificationId);
		
		try {
			const notification = await this.notificationModel.findOneAndUpdate(
				{ _id: id, receiverId: memberId },
				{ notificationStatus: NotificationStatus.READ },
				{ new: true }
			).exec();

			if (!notification) {
				throw new BadRequestException('Notification not found or unauthorized');
			}

			console.log('✅ Notification marked as read:', notification._id);
			return notification;
		} catch (err) {
			console.log('❌ Error marking notification as read:', err.message);
			throw new BadRequestException(Message.UPDATED_FAILED);
		}
	}

	// Mark all notifications as read for a user
	public async markAllNotificationsAsRead(memberId: ObjectId): Promise<number> {
		try {
			const result = await this.notificationModel.updateMany(
				{ receiverId: memberId, notificationStatus: NotificationStatus.WAIT },
				{ notificationStatus: NotificationStatus.READ }
			).exec();

			console.log('✅ Marked all notifications as read:', result.modifiedCount);
			return result.modifiedCount;
		} catch (err) {
			console.log('❌ Error marking all notifications as read:', err.message);
			throw new InternalServerErrorException(Message.UPDATED_FAILED);
		}
	}

	// Delete notification
	public async deleteNotification(notificationId: string, memberId: ObjectId): Promise<boolean> {
		const id = shapeIntoMongoObjectId(notificationId);
		
		try {
			const result = await this.notificationModel.findOneAndDelete({
				_id: id,
				receiverId: memberId,
			}).exec();

			if (!result) {
				throw new BadRequestException('Notification not found or unauthorized');
			}

			console.log('✅ Notification deleted:', notificationId);
			return true;
		} catch (err) {
			console.log('❌ Error deleting notification:', err.message);
			throw new BadRequestException(Message.REMOVE_FAILED);
		}
	}

	// Helper method to create notification for likes
	public async createLikeNotification(
		authorId: ObjectId,
		receiverId: ObjectId,
		notificationGroup: NotificationGroup,
		targetId?: ObjectId
	): Promise<void> {
		try {
			let notificationTitle = '';
			let carId: ObjectId | undefined;
			let articleId: ObjectId | undefined;

			switch (notificationGroup) {
				case NotificationGroup.CARS:
					notificationTitle = 'Someone liked your car!';
					carId = targetId;
					break;
				case NotificationGroup.ARTICLE:
					notificationTitle = 'Someone liked your article!';
					articleId = targetId;
					break;
				case NotificationGroup.MEMBER:
					notificationTitle = 'Someone liked your profile!';
					break;
			}

			await this.createNotification({
				notificationType: NotificationType.LIKE,
				notificationGroup,
				notificationTitle,
				notificationDesc: 'You received a new like!',
				authorId,
				receiverId,
				carId,
				articleId,
			});
		} catch (err) {
			console.log('❌ Error creating like notification:', err.message);
			// Don't throw error - notification failure shouldn't break the main action
		}
	}

	// Helper method to create notification for comments
	public async createCommentNotification(
		authorId: ObjectId,
		receiverId: ObjectId,
		notificationGroup: NotificationGroup,
		targetId?: ObjectId
	): Promise<void> {
		try {
			let notificationTitle = '';
			let carId: ObjectId | undefined;
			let articleId: ObjectId | undefined;

			switch (notificationGroup) {
				case NotificationGroup.CARS:
					notificationTitle = 'Someone commented on your car!';
					carId = targetId;
					break;
				case NotificationGroup.ARTICLE:
					notificationTitle = 'Someone commented on your article!';
					articleId = targetId;
					break;
				case NotificationGroup.MEMBER:
					notificationTitle = 'Someone commented on your profile!';
					break;
			}

			await this.createNotification({
				notificationType: NotificationType.COMMENT,
				notificationGroup,
				notificationTitle,
				notificationDesc: 'You received a new comment!',
				authorId,
				receiverId,
				carId,
				articleId,
			});
		} catch (err) {
			console.log('❌ Error creating comment notification:', err.message);
			// Don't throw error - notification failure shouldn't break the main action
		}
	}
}