
import { Field, InputType, Int, ID } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsInt, Min, Length, IsBoolean, IsDateString, IsMongoId } from 'class-validator';
import { CarCategory, CarLocation, CarStatus, CarTransactionType } from '../../enums/car.enum';

@InputType()
export class CarInput {
  @IsNotEmpty()
  @Field(() => CarTransactionType)
  carTransactionType: CarTransactionType;

  @IsNotEmpty()
  @Field(() => CarCategory)
  carCategory: CarCategory;

  @IsOptional()
  @Field(() => CarStatus, { nullable: true })
  carStatus?: CarStatus;

  @IsNotEmpty()
  @Field(() => CarLocation)
  carLocation: CarLocation;

  @IsNotEmpty()
  @Length(3, 100)
  @Field()
  carAddress: string;

  @IsNotEmpty()
  @Length(3, 100)
  @Field()
  carTitle: string;

  @IsNotEmpty()
  @Field(() => Number)
  carPrice: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1900)
  @Field(() => Int)
  carYear: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Field(() => Int)
  carSeats: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Field(() => Int)
  carDoors: number;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  carViews?: number;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  carLikes?: number;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  carComments?: number;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  carRank?: number;

  @IsNotEmpty()
  @Field(() => [String])
  carImages: string[];

  @IsOptional()
  @Length(0, 500)
  @Field({ nullable: true })
  carDesc?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isBarterAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isForRent?: boolean;

  @IsNotEmpty()
  @IsMongoId()
  @Field(() => ID)
  memberId: string;

  @IsOptional()
  @IsDateString()
  @Field({ nullable: true })
  soldAt?: string;

  @IsOptional()
  @IsDateString()
  @Field({ nullable: true })
  deletedAt?: string;

  @IsOptional()
  @IsDateString()
  @Field({ nullable: true })
  registeredAt?: string;
}
