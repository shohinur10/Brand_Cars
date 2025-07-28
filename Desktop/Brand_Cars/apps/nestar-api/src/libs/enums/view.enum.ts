import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	CARS = 'CARS',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
