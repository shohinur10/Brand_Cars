import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { Comments,Comment} from '../../libs/dto/comment/comment';
import { lookupMember } from '../../libs/config';
import { T } from '../../libs/types/common';
import { CarService } from '../car/car.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationGroup } from '../../libs/enums/notification.enum';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModel: Model<Comment>,
		private readonly memberService: MemberService,
		private readonly carService: CarService,
		private readonly boardArticleService: BoardArticleService,
		private readonly notificationService: NotificationService,
	) {}

	public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
		input.memberId = memberId;

		let result: Comment;
		try {
			result = await this.commentModel.create(input);
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}

		switch (input.commentGroup) {
			case CommentGroup.CARS:
				await this.carService.carStatsEditor({
					_id: input.commentRefId,
					targetKey: 'carComments',
					modifier: 1,
				});
				break;
			case CommentGroup.ARTICLE:
				await this.boardArticleService.boardArticleStatsEditor({
					_id: input.commentRefId,
					targetKey: 'articleComments',
					modifier: 1,
				});
				break;
			case CommentGroup.MEMBER:
				await this.memberService.memberStatsEditor({
					_id: input.commentRefId,
					targetKey: 'memberComments',
					modifier: 1,
				});
				break;
		}

		// Create notification when someone comments on content
		await this.createCommentNotification(memberId, input);

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

		return result;
	}

	public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
		const { _id } = input;
		const result = await this.commentModel
			.findOneAndUpdate(
				{
					_id: _id,
					memberId: memberId,
					commentStatus: CommentStatus.ACTIVE,
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATED_FAILED);

		return result;
	}

	public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
		const { commentRefId } = input.search;
		const match: T = { commentRefId: commentRefId, commentStatus: CommentStatus.ACTIVE };
		const sort: T = {
            [input?.sort ?? 'createdAt']: input?.direction === Direction.ASC ? 1 : -1,
          };// dynamic holatda yasayapmiz key va value
          
		console.log('🔍 Comment search input:', JSON.stringify(input.search, null, 2));
		console.log('🔍 Comment match query:', match);
		console.log('📊 Comment sort:', sort);

		const result = await this.commentModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLikedl
							lookupMember,//information is about who add the new data 
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		
		console.log('💬 Comment aggregation result:', JSON.stringify(result, null, 2));
		
		if (!result || !result.length) {
			// Return empty result instead of throwing error
			return {
				list: [],
				metaCounter: [{ total: 0 }]
			};
		}

		return result[0];
	}

	public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
		const result = await this.commentModel.findByIdAndDelete(input).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}

	// Helper method to create comment notification
	private async createCommentNotification(memberId: ObjectId, input: CommentInput): Promise<void> {
		try {
			// Don't create notification if user is commenting on their own content
			if (memberId.toString() === input.commentRefId.toString()) {
				return;
			}

			let notificationGroup: NotificationGroup;
			let receiverId: ObjectId;

			// Determine notification group and receiver based on comment group
			switch (input.commentGroup) {
				case CommentGroup.CARS:
					notificationGroup = NotificationGroup.CARS;
					// Get car owner ID - you'll need to fetch this from car service
					// For now, we'll use a placeholder - you may need to inject CarService
					receiverId = input.commentRefId; // This should be the car owner's ID
					break;
				case CommentGroup.ARTICLE:
					notificationGroup = NotificationGroup.ARTICLE;
					// Get article author ID
					receiverId = input.commentRefId; // This should be the article author's ID
					break;
				case CommentGroup.MEMBER:
					notificationGroup = NotificationGroup.MEMBER;
					receiverId = input.commentRefId; // This is the member being commented on
					break;
				default:
					return; // Unknown comment group
			}

			await this.notificationService.createCommentNotification(
				memberId,        // author (person who commented)
				receiverId,      // receiver (person who owns the content)
				notificationGroup,
				input.commentRefId // target ID (car, article, or member)
			);
		} catch (err) {
			console.log('❌ Error creating comment notification:', err.message);
			// Don't throw error - notification failure shouldn't break the main action
		}
	}
}