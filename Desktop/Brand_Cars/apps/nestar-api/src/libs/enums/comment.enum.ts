import { registerEnumType } from '@nestjs/graphql';

export enum CommentStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(CommentStatus, {
	name: 'CommentStatus',
});

export enum CommentGroup {
	MEMBER = 'MEMBER',
	CARS = 'CARS',
	ARTICLE = 'ARTICLE',
	
}
registerEnumType(CommentGroup, {
	name: 'CommentGroup',
});
