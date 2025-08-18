import { registerEnumType } from '@nestjs/graphql';

export enum BoardArticleCategory {
	FREE = 'FREE',
	RECOMMEND = 'RECOMMEND',
	NEWS = 'NEWS',
	HUMOR = 'HUMOR',
	REVIEWS = 'REVIEWS',
	QNA = 'QNA',
	EVENTS = 'EVENTS',
	CAR_NEWS = 'CAR_NEWS',
	SHOWCASE = 'SHOWCASE',
}
registerEnumType(BoardArticleCategory, {
	name: 'BoardArticleCategory',
});

export enum BoardArticleStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(BoardArticleStatus, {
	name: 'BoardArticleStatus',
});

export enum BoardArticleReaction {
	LIKE = 'LIKE',
	DISLIKE = 'DISLIKE',
	NONE = 'NONE',
}
registerEnumType(BoardArticleReaction, {
	name: 'BoardArticleReaction',
});
