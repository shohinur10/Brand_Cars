import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
	MEMBER = 'MEMBER',
	CARS = 'CARS',
	ARTICLE = 'ARTICLE',
	BOARD_ARTICLE = "BOARD_ARTICLE",
}
registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
