import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { Properties } from '../../libs/dto/property/property';
import { OrdinaryInquiry } from '../../libs/dto/property/car.input';
import { lookupFavorite } from '../../libs/config';
import { LikeGroup } from '../../libs/enums/like.enum';

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

	public async getFavoriteProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		const { page, limit } = input;
		const match: T = { likeGroup: LikeGroup.PROPERTY, memberId: memberId };
		const data: T = await this.likeModel
			.aggregate([
				{ $match: match },// like log 
				{ $sort: { updatedAt: -1 } },// sort by the last like 
				{
					$lookup: {
						from: 'properties',
						localField: 'likeRefId',
						foreignField: '_id',
						as: 'favoriteProperty',
					},
				},
				{ $unwind: '$favoriteProperty' },//Array ichida 5 ta favoriteProperty bo‘lsa, $unwind ularni 5 ta alohida hujjatga aylantiradi
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorite,
							{ $unwind: '$favoriteProperty.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		console.log('data: ', data);
		const result: Properties = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.favoriteProperty);//  log lardi emas biz favorite mantigin berib olyapmiz 
	// map orqali iteration qilamz	
		console.log('result', result);
		return result;
	}
}