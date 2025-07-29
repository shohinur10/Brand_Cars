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

@Injectable()
export class LikeService {
	constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

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
			} catch (err) {
				console.log('Error, Service.model', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		console.log(` - Like modifier ${modifier} - `);
		return modifier;
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