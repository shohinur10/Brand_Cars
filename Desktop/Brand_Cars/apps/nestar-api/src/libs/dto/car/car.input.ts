
import { Field, InputType, Int, ID } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsInt, Min, Length, IsBoolean, IsDateString, IsMongoId, IsIn, ArrayMinSize, IsArray } from 'class-validator';
import { CarCategory, CarLocation, CarStatus, CarTransactionType, CarBrand, FuelType, TransmissionType, CarCondition, CarColor } from '../../enums/car.enum';
import { ObjectId } from 'mongoose';
import { availableCarSorts, availableOptions, } from '../../config';
import { Direction } from '../../enums/common.enum';

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
  @IsInt()
  @Min(0)
  @Field(() => Int, { nullable: true })
  carMileage?: number;

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

  @IsNotEmpty()
  @Field(() => CarBrand)
  brand: CarBrand;

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
  @IsBoolean()
  @Field({ nullable: true })
  isForRent?: boolean;

 
  memberId?: ObjectId;

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


  @Field(() => Number, { nullable: true })
  discountPercent?: number;

  @Field(() => Number, { nullable: true })
  discountedPrice?: number;

}

@InputType()
export class PricesRange {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}

 @InputType()
export class PeriodsRange {
  @Field(() => Int )
  start: number; // e.g., start month (1-12)

  @Field(() => Int )
  end: number; // e.g., end month (1-12)
}

@InputType()
export class YearRange {
  @Field(() => Int)
  startYear: number; // e.g., 2000

  @Field(() => Int)
  endYear: number; // e.g., 2023
}

@InputType()
export class PISearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;

  @IsOptional()
  @Field(() => [CarLocation], { nullable: true })
  locationList?: CarLocation[];

  @IsOptional()
  @Field(() => [CarTransactionType], { nullable: true })
  typeList?: CarTransactionType[];

  @IsOptional()
  @Field(() => [CarCategory], { nullable: true })
  carCategoryList?: CarCategory[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @Field(() => [Int], { nullable: true })
  yearRange?: number[]; // [startYear, endYear]

  @IsOptional()
  @Field(() => [String], { nullable: true })
  fuelTypes?: string[]; // e.g., ["Gasoline", "Diesel", "Electric"]

  @IsOptional()
  @Field(() => [String], { nullable: true })
  brands?: string[]; // e.g., ["Toyota", "Hyundai"]

  @IsOptional()
  @Field(() => PricesRange, { nullable: true })
  pricesRange?: PricesRange;

  @IsOptional()
  @Field(() => PeriodsRange, { nullable: true })
  periodsRange?: PeriodsRange;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  minMileage?: number;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  maxMileage?: number;

  @IsOptional()
  @IsIn(availableOptions,{each: true})
  @Field(() => [String], { nullable: true })
  options?: string[];//CarLoan, CarInsurance, etc.

  @IsOptional()
  @Field(() => String, { nullable: true })
  searchText?: string; // For fuzzy search (brand, model, etc.)
}

@InputType()
export class CarsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableCarSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => PISearch )
	search: PISearch;
}

@InputType()
class APISearch {
	@IsOptional()
	@Field(() => CarStatus, { nullable: true })
carStatus: CarStatus;
}

@InputType()
export class AgentCarsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableCarSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => APISearch)
	search: APISearch;
}

@InputType()
export class ALPISearch {
	@IsOptional()
	@Field(() => CarStatus, { nullable: true })
	carStatus?: CarStatus;

	@IsOptional()
	@Field(() => [CarLocation], { nullable: true })
	carLocationList?: String[];
}

@InputType()
export class AllCarsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableCarSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ALPISearch)
	search: ALPISearch;
}

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;
}