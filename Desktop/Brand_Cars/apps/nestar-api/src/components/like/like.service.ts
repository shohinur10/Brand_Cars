import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';

import { OrdinaryInquiry } from '../../libs/dto/car/car.input';
import { lookupFavorite } from '../../libs/config';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Car, Cars } from '../../libs/dto/car/car';
import { NotificationService } from '../notification/notification.service';
import { NotificationGroup } from '../../libs/enums/notification.enum';

@Injectable()
export class LikeService {
	constructor(
		@InjectModel('Like') private readonly likeModel: Model<Like>,
		private readonly notificationService: NotificationService,
	) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = {
			memberId: input.memberId,
			likeRefId: input.likeRefId,  // Taggle is th control and manage like that we liked before and like again 
		};

		const exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;

		if (exist) {
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create(input);
				
				// Create notification when someone likes content
				await this.createLikeNotification(input);
				
			} catch (err) {
				console.log('Error, Service.model', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		console.log(` - Like modifier ${modifier} - `);
		return modifier;
	}

	// Helper method to create like notification
	private async createLikeNotification(input: LikeInput): Promise<void> {
		try {
			// Don't create notification if user is liking their own content
			if (input.memberId.toString() === input.likeRefId.toString()) {
				return;
			}

			let notificationGroup: NotificationGroup;
			let receiverId: ObjectId;

			// Determine notification group and receiver based on like group
			switch (input.likeGroup) {
				case LikeGroup.CARS:
					notificationGroup = NotificationGroup.CARS;
					// Get car owner ID - you'll need to fetch this from car service
					// For now, we'll use a placeholder - you may need to inject CarService
					receiverId = input.likeRefId; // This should be the car owner's ID
					break;
				case LikeGroup.ARTICLE:
					notificationGroup = NotificationGroup.ARTICLE;
					// Get article author ID
					receiverId = input.likeRefId; // This should be the article author's ID
					break;
				case LikeGroup.MEMBER:
					notificationGroup = NotificationGroup.MEMBER;
					receiverId = input.likeRefId; // This is the member being liked
					break;
				default:
					return; // Unknown like group
			}

			await this.notificationService.createLikeNotification(
				input.memberId, // author (person who liked)
				receiverId,     // receiver (person who owns the content)
				notificationGroup,
				input.likeRefId // target ID (car, article, or member)
			);
		} catch (err) {
			console.log('❌ Error creating like notification:', err.message);
			// Don't throw error - notification failure shouldn't break the main action
		}
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId } = input;
		const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
	}

	public async getFavoriteCars(memberId: ObjectId, input: OrdinaryInquiry): Promise<Cars> {
		const { page, limit } = input;
		const match: T = { likeGroup: LikeGroup.CARS, memberId: memberId };
		const data: T = await this.likeModel
			.aggregate([
				{ $match: match },// like log 
				{ $sort: { updatedAt: -1 } },// sort by the last like 
				{
					$lookup: {
						from: 'cars',
						localField: 'likeRefId',
						foreignField: '_id',
						as: 'favoriteCars',
					},
				},
				{ $unwind: '$favoriteCars' },//Array ichida 5 ta favoritecar bo‘lsa, $unwind ularni 5 ta alohida hujjatga aylantiradi
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorite,
							{ $unwind: '$favoriteCar.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		console.log('data: ', data);
		const result: Cars = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.favoriteCar);//  log lardi emas biz favorite mantigin berib olyapmiz 
	// map orqali iteration qilamz	
		console.log('result', result);
		return result;
	}
}