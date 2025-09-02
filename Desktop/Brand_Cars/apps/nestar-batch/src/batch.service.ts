import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Car } from 'apps/nestar-api/src/libs/dto/car/car';
import { Member } from 'apps/nestar-api/src/libs/dto/member';
import { CarStatus } from 'apps/nestar-api/src/libs/enums/car.enum';
import { MemberStatus, MemberType } from 'apps/nestar-api/src/libs/enums/member.enum';
import { Model, ObjectId } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Car') private readonly carModel: Model<Car>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Follow') private readonly followModel: Model<any>,
	) {}

	public async batchRollback(): Promise<void> {
		await this.carModel.updateMany({ carStatus: CarStatus.AVAILABLE}, { carRank: 0 }).exec();
		await this.memberModel
			.updateMany({ memberStatus: MemberStatus.ACTIVE, memberType: MemberType.AGENT }, { memberRank: 0 })
			.exec();
	}

	public async batchTopCars(): Promise<void> {
		const cars: Car[] = await this.carModel
			.find({
				carStatus: CarStatus.AVAILABLE,
				carRank: 0,
			})
			.exec();

		const promisedList = cars.map(async (ele: Car) => { // botta map orqali iteration qilyapmiz 
			const { _id, carLikes, carViews } = ele;
			const rank = carLikes * 2 + carViews * 1;
			return await this.carModel.findByIdAndUpdate(_id, { carRank: rank });
		});
		await Promise.all(promisedList);
	}

  public async batchTopAgents(): Promise<void> {
    const agents: Member[] = await this.memberModel
      .find({
        memberType: MemberType.AGENT,
        memberStatus: MemberStatus.ACTIVE,
        memberRank: 0,
      })
      .exec();
  
    const promisedList = agents.map(async (ele: Member) => {
      const {
        _id,
        memberCars= 0,
        memberArticles = 0,
        memberLikes = 0,
        memberViews = 0,
      } = ele;
  
      const rank =
        (memberCars || 0) * 5 +
        (memberArticles || 0) * 3 +
        (memberLikes || 0) * 2 +
        (memberViews || 0) * 1;
  
      // Log for debugging
      console.log('Calculated rank for agent:', {
        id: _id,
        memberCars,
        memberArticles,
        memberLikes,
        memberViews,
        rank,
      });
  
      return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
    });
  
    await Promise.all(promisedList);
  }  
  public getHello(): string {
		return 'Welcome to Brand Cars BATCH Server!';
	}

	public async batchFollowMembers(followerId: ObjectId, followingIds: ObjectId[]): Promise<void> {
		console.log(`Starting batch follow operation for follower: ${followerId}`);
		console.log(`Target following IDs: ${followingIds.length}`);

		const existingFollows = await this.followModel
			.find({
				followerId: followerId,
				followingId: { $in: followingIds }
			})
			.select('followingId')
			.exec();

		const existingFollowingIds = existingFollows.map(follow => follow.followingId.toString());
		const newFollowingIds = followingIds.filter(id => !existingFollowingIds.includes(id.toString()));

		if (newFollowingIds.length === 0) {
			console.log('All members are already being followed');
			return;
		}

		// Create new follow relationships
		const followPromises = newFollowingIds.map(followingId => 
			this.followModel.create({
				followerId: followerId,
				followingId: followingId,
			})
		);

		// Update member stats
		const memberStatsPromises = [
			// Update follower's following count
			this.memberModel.findByIdAndUpdate(
				followerId,
				{ $inc: { memberFollowings: newFollowingIds.length } }
			),
			// Update each following member's follower count
			...newFollowingIds.map(followingId =>
				this.memberModel.findByIdAndUpdate(
					followingId,
					{ $inc: { memberFollowers: 1 } }
				)
			)
		];

		await Promise.all([...followPromises, ...memberStatsPromises]);
		console.log(`Successfully followed ${newFollowingIds.length} new members`);
	}

	public async batchUnfollowMembers(followerId: ObjectId, followingIds: ObjectId[]): Promise<void> {
		console.log(`Starting batch unfollow operation for follower: ${followerId}`);
		console.log(`Target following IDs: ${followingIds.length}`);

		// Find and delete follow relationships
		const deleteResult = await this.followModel
			.deleteMany({
				followerId: followerId,
				followingId: { $in: followingIds }
			})
			.exec();

		if (deleteResult.deletedCount === 0) {
			console.log('No follow relationships found to delete');
			return;
		}

		// Update member stats
		const memberStatsPromises = [
			// Update follower's following count
			this.memberModel.findByIdAndUpdate(
				followerId,
				{ $inc: { memberFollowings: -deleteResult.deletedCount } }
			),
			// Update each following member's follower count
			...followingIds.map(followingId =>
				this.memberModel.findByIdAndUpdate(
					followingId,
					{ $inc: { memberFollowers: -1 } }
				)
			)
		];

		await Promise.all(memberStatsPromises);
		console.log(`Successfully unfollowed ${deleteResult.deletedCount} members`);
	}

	public async batchFollowByMemberType(followerId: ObjectId, memberType: MemberType, limit: number = 10): Promise<void> {
		console.log(`Starting batch follow by member type: ${memberType}`);

		// Find members of the specified type that are not already being followed
		const membersToFollow = await this.memberModel.aggregate([
			{
				$match: {
					_id: { $ne: followerId },
					memberType: memberType,
					memberStatus: MemberStatus.ACTIVE
				}
			},
			{
				$lookup: {
					from: 'follows',
					let: { memberId: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$followingId', '$$memberId'] },
										{ $eq: ['$followerId', followerId] }
									]
								}
							}
						}
					],
					as: 'existingFollow'
				}
			},
			{
				$match: {
					existingFollow: { $size: 0 }
				}
			},
			{
				$limit: limit
			},
			{
				$project: {
					_id: 1
				}
			}
		]).exec();

		if (membersToFollow.length === 0) {
			console.log(`No new ${memberType} members to follow`);
			return;
		}

		const followingIds = membersToFollow.map(member => member._id);
		await this.batchFollowMembers(followerId, followingIds);
	}

	public async batchUnfollowByMemberType(followerId: ObjectId, memberType: MemberType): Promise<void> {
		console.log(`Starting batch unfollow by member type: ${memberType}`);

		// Find all follows where the following member is of the specified type
		const followsToRemove = await this.followModel.aggregate([
			{
				$match: {
					followerId: followerId
				}
			},
			{
				$lookup: {
					from: 'members',
					localField: 'followingId',
					foreignField: '_id',
					as: 'followingMember'
				}
			},
			{
				$unwind: '$followingMember'
			},
			{
				$match: {
					'followingMember.memberType': memberType
				}
			},
			{
				$project: {
					followingId: 1
				}
			}
		]).exec();

		if (followsToRemove.length === 0) {
			console.log(`No ${memberType} members currently being followed`);
			return;
		}

		const followingIds = followsToRemove.map(follow => follow.followingId);
		await this.batchUnfollowMembers(followerId, followingIds);
	}

	public async getFollowStats(followerId: ObjectId): Promise<any> {
		const [followingCount, followersCount] = await Promise.all([
			this.followModel.countDocuments({ followerId }),
			this.followModel.countDocuments({ followingId: followerId })
		]);

		return {
			followingCount,
			followersCount
		};
	}
}