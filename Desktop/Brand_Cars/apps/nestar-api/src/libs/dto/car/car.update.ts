import { Field, InputType, Int, ID } from '@nestjs/graphql';
import {
  IsOptional,
  IsInt,
  Min,
  Length,
  IsBoolean,
  IsMongoId,
  IsDateString,
  Max
} from 'class-validator';
import { CarTransactionType, CarCategory, CarStatus, CarLocation, CarBrand, FuelType, TransmissionType, CarCondition, CarColor } from '../../enums/car.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class CarUpdate {
  @IsMongoId()
  @Field(() => String)
  _id: string; // required for identifying the car to update

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

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Field(() => Int, { nullable: true })
  discountPercent?: number;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  discountedPrice?: number;

  // ✅ Add this to support brand updates
  @IsOptional()
  @Field(() => CarBrand, { nullable: true })
  brand?: CarBrand;

  @IsOptional()
  @Field(() => FuelType, { nullable: true })
  fuelType?: FuelType;

  @IsOptional()
  @Field(() => TransmissionType, { nullable: true })
  transmissionType?: TransmissionType;

  @IsOptional()
  @Field(() => CarCondition, { nullable: true })
  carCondition?: CarCondition;

  @IsOptional()
  @Field(() => CarColor, { nullable: true })
  carColor?: CarColor;

  @IsOptional()
  @Length(1, 100)
  @Field({ nullable: true })
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Field(() => Int, { nullable: true })
  carMileage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Field(() => Int, { nullable: true })
  mileage?: number;
}
