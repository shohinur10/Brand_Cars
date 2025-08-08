import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { CarTransactionType, CarCategory, CarStatus, CarLocation } from '../../enums/car.enum';
import { Member, TotalCounter } from '../member';
import { ObjectId } from 'mongoose';

@ObjectType()
export class Car {
  @Field(() => ID)
  _id: ObjectId;

  @Field(() => CarTransactionType)
  carTransactionType: CarTransactionType;

  @Field(() => CarCategory)
  carCategory: CarCategory;

  @Field(() => CarStatus, { nullable: true })
  carStatus?: CarStatus;

  @Field(() => CarLocation)
  carLocation: CarLocation;

  @Field(() => String)
   brand: string;


  @Field()
  carAddress: string;

  @Field()
  carTitle: string;

  @Field(() => Number)
  carPrice: number;

  @Field(() => Int)
  carYear: number;

  @Field(() => Int)
  carSeats: number;

  @Field(() => Int)
  carDoors: number;

  @Field(() => Int)
  carViews: number;

  @Field(() => Int)
  carLikes: number;

  @Field(() => Int, { nullable: true })
  carComments?: number;

  @Field(() => Int, { nullable: true })
  carRank?: number;

  @Field(() => [String])
  carImages: string[];

  @Field({ nullable: true })
  carDesc?: string;

  @Field({ nullable: true })
  isBarterAvailable?: boolean;

  @Field({ nullable: true })
  isForRent?: boolean;

  @Field(() => Int, { nullable: true })
  discountPercent?: number;

  @Field(() => Number, { nullable: true })
  discountedPrice?: number;

  @Field(() => ID)
  memberId: ObjectId;

  @Field(() => Date, { nullable: true })
  soldAt?: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date, { nullable: true })
  registeredAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

    /** from aggregation */

 @Field(() => Member, { nullable: true })
   memberData?: Member;
	list: any;
}
    @ObjectType()
     export class Cars { 
	@Field(() => [Car])
	list: Car[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}

