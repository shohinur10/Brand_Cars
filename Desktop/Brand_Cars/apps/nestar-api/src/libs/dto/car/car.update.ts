import { Field, InputType, Int, ID } from '@nestjs/graphql';
import {
  IsOptional,
  IsInt,
  Min,
  Length,
  IsBoolean,
  IsMongoId,
  IsDateString
} from 'class-validator';
import { CarTransactionType, CarCategory, CarStatus, CarLocation } from '../../enums/car.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class CarUpdate{
  @IsMongoId()
  @Field(() => ID)
  _id: ObjectId;

  @IsOptional()
  @Field(() => CarTransactionType, { nullable: true })
  carTransactionType?: CarTransactionType;

  @IsOptional()
  @Field(() => CarCategory, { nullable: true })
  carCategory?: CarCategory;

  @IsOptional()
  @Field(() => CarStatus, { nullable: true })
  carStatus?: CarStatus;

  @IsOptional()
  @Field(() => CarLocation, { nullable: true })
  carLocation?: CarLocation;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  carAddress?: string;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  carTitle?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  carPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Field(() => Int, { nullable: true })
  carYear?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true })
  carSeats?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true })
  carDoors?: number;

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

  @IsOptional()
  @Field(() => [String], { nullable: true })
  carImages?: string[];

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

  @IsOptional()
  @IsMongoId()
  @Field(() => ID, { nullable: true })
  memberId?: string;

  @IsOptional()
  @IsDateString()
  @Field(() => Date, { nullable: true })
  soldAt?: Date;

  @IsOptional()
  @IsDateString()
  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @IsOptional()
  @IsDateString()
  @Field(() => Date, { nullable: true })
  registeredAt?: Date;
}
