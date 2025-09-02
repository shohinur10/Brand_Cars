import { 
  CarTransactionType, 
  CarCategory, 
  CarStatus, 
  CarLocation,
  FuelType,
  TransmissionType,
  CarCondition,
  CarColor,
  CarBrand
} from '../../enums/car.enum';
import { Direction } from '../../enums/common.enum';

export interface CarInput {
  carTransactionType: CarTransactionType;
  carCategory: CarCategory;
  carStatus?: CarStatus;
  carLocation: CarLocation;
  carAddress: string;
  carTitle: string;
  brand: CarBrand; // ✅ Updated to use CarBrand enum instead of string
  fuelType: FuelType; // ✅ Added required field
  transmissionType: TransmissionType; // ✅ Added required field
  carCondition: CarCondition; // ✅ Added required field
  carColor: CarColor; // ✅ Added required field
  model: string; // ✅ Added required field
  carPrice: number;
  carYear: number;
  carMileage?: number;
  carSeats: number;
  carDoors: number;
  carViews?: number;
  carLikes?: number;
  carComments?: number;
  carRank?: number;
  carImages: string[];
  carDesc?: string;
  isBarterAvailable?: boolean;
  isForRent?: boolean;
  memberId?: string;
  soldAt?: Date | string;
  deletedAt?: Date | string;
  registeredAt?: Date | string;
  discountPercent?: number;
  discountedPrice?: number;
}

interface PricesRange {
  start: number;
  end: number;
}

interface PeriodsRange {
  start: number;  // e.g., month or timestamp
  end: number;
}

interface YearRange {
  startYear: number;
  endYear: number;
}

export interface PISearch {
  memberId?: string;
  locationList?: CarLocation[];
  typeList?: CarTransactionType[];
  carCategoryList?: CarCategory[];
  yearRange?: number[];  // [startYear, endYear]
  fuelTypes?: FuelType[]; // ✅ Updated to use FuelType enum
  brands?: CarBrand[]; // ✅ Updated to use CarBrand enum
  pricesRange?: PricesRange;
  periodsRange?: PeriodsRange;
  minMileage?: number;
  maxMileage?: number;
  seatsList?: number[];
  doorsList?: number[];
  options?: string[];  // like CarLoan, CarInsurance
  searchText?: string;
}

export interface CarsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: PISearch;
}

interface APISearch {
  carStatus?: CarStatus;
}

export interface AgentCarsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: APISearch;
}

interface ALPISearch {
  carStatus?: CarStatus;
  carLocationList?: CarLocation[];
}

export interface AllCarsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: ALPISearch;
}

export interface OrdinaryInquiry {
  page: number;
  limit: number;
}


