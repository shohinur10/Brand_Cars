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
} from './enums/car.enum';
import { Direction } from './enums/common.enum';

// ===== CORE CAR INTERFACES =====

export interface CarInput {
  carTransactionType: CarTransactionType;
  carCategory: CarCategory;
  carStatus?: CarStatus;
  carLocation: CarLocation;
  carAddress: string;
  carTitle: string;
  brand: CarBrand;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  carCondition: CarCondition;
  carColor: CarColor;
  model: string;
  carPrice: number;
  carYear: number;
  carSeats: number;
  carDoors: number;
  carMileage?: number;
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

export interface CarUpdate {
  _id: string;
  carTransactionType?: CarTransactionType;
  carCategory?: CarCategory;
  carStatus?: CarStatus;
  carLocation?: CarLocation;
  carAddress?: string;
  carTitle?: string;
  brand?: CarBrand;
  fuelType?: FuelType;
  transmissionType?: TransmissionType;
  carCondition?: CarCondition;
  carColor?: CarColor;
  model?: string;
  carPrice?: number;
  carYear?: number;
  carSeats?: number;
  carDoors?: number;
  carViews?: number;
  carLikes?: number;
  carComments?: number;
  carRank?: number;
  carImages?: string[];
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

export interface Car {
  _id: string;
  carTransactionType: CarTransactionType;
  carCategory: CarCategory;
  carStatus?: CarStatus;
  carLocation: CarLocation;
  brand: CarBrand;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  carCondition: CarCondition;
  carColor: CarColor;
  model: string;
  carAddress: string;
  carTitle: string;
  carPrice: number;
  carYear: number;
  carSeats: number;
  carDoors: number;
  carMileage?: number;
  carViews: number;
  carLikes: number;
  carComments?: number;
  carRank?: number;
  carImages: string[];
  carDesc?: string;
  isBarterAvailable?: boolean;
  isForRent?: boolean;
  discountPercent?: number;
  discountedPrice?: number;
  memberId: string;
  soldAt?: Date;
  deletedAt?: Date;
  registeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  memberData?: Member;
}

// ===== MEMBER INTERFACES =====

export interface Member {
  _id: string;
  memberType: string;
  memberStatus: string;
  memberAuthType: string;
  memberPhone: string;
  memberNick: string;
  memberFullName?: string;
  memberImage?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberCars: number;
  memberArticles: number;
  memberFollowers: number;
  memberFollowings: number;
  memberPoints?: number;
  memberLikes: number;
  memberViews: number;
  memberComments?: number;
  memberRank: number;
  memberBlocks: number;
  memberWarnings: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  accessToken?: string;
  meLiked?: MeLiked[];
  meFollowed?: MeFollowed[];
}

export interface MeLiked {
  memberId: string;
  likeRefId: string;
  myFavorite: boolean;
}

export interface MeFollowed {
  followingId: string;
  followerId: string;
  myFollowing: boolean;
}

// ===== SEARCH & FILTER INTERFACES =====

export interface PricesRange {
  start: number;
  end: number;
}

export interface PeriodsRange {
  start: number;
  end: number;
}

export interface YearRange {
  startYear: number;
  endYear: number;
}

export interface PISearch {
  memberId?: string;
  locationList?: CarLocation[];
  typeList?: CarTransactionType[];
  carCategoryList?: CarCategory[];
  yearRange?: number[];
  fuelTypes?: FuelType[];
  brands?: CarBrand[];
  pricesRange?: PricesRange;
  periodsRange?: PeriodsRange;
  minMileage?: number;
  maxMileage?: number;
  seatsList?: number[];
  doorsList?: number[];
  options?: string[];
  searchText?: string;
}

export interface APISearch {
  carStatus?: CarStatus;
}

export interface ALPISearch {
  carStatus?: CarStatus;
  carLocationList?: CarLocation[];
}

// ===== INQUIRY INTERFACES =====

export interface CarsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: PISearch;
}

export interface AgentCarsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: APISearch;
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

// ===== RESPONSE INTERFACES =====

export interface TotalCounter {
  total: number;
}

export interface Cars {
  list: Car[];
  metaCounter: TotalCounter[];
}

// ===== ENUM VALUES =====

export const CarTransactionTypeValues = {
  RENT: 'RENT',
  LOAN: 'LOAN',
  BUY: 'BUY'
} as const;

export const CarCategoryValues = {
  SEDAN: 'SEDAN',
  SUV: 'SUV',
  COUPE: 'COUPE',
  LUXURY: 'LUXURY',
  HATCHBACK: 'HATCHBACK',
  TRUCK: 'TRUCK'
} as const;

export const CarStatusValues = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
  UNAVAILABLE: 'UNAVAILABLE'
} as const;

export const CarLocationValues = {
  LOS_ANGELES: 'LOS_ANGELES',
  PARIS: 'PARIS',
  BARCELONA: 'BARCELONA',
  TOKYO: 'TOKYO',
  DUBAI: 'DUBAI',
  NEW_YORK: 'NEW_YORK',
  MUNICH: 'MUNICH',
  SHANGHAI: 'SHANGHAI',
  RIO_DE_JANEIRO: 'RIO_DE_JANEIRO',
  SEOUL: 'SEOUL',
  LONDON: 'LONDON'
} as const;

export const FuelTypeValues = {
  GASOLINE: 'GASOLINE',
  DIESEL: 'DIESEL',
  ELECTRIC: 'ELECTRIC',
  HYBRID: 'HYBRID'
} as const;

export const TransmissionTypeValues = {
  AUTOMATIC: 'AUTOMATIC',
  MANUAL: 'MANUAL'
} as const;

export const CarConditionValues = {
  NEW: 'NEW',
  USED: 'USED',
  CERTIFIED_PRE_OWNED: 'CERTIFIED_PRE_OWNED',
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  FAIR: 'FAIR'
} as const;

export const CarColorValues = {
  WHITE: 'WHITE',
  BLACK: 'BLACK',
  SILVER: 'SILVER',
  GRAY: 'GRAY',
  RED: 'RED',
  BLUE: 'BLUE',
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  BROWN: 'BROWN',
  OTHER: 'OTHER'
} as const;

export const CarBrandValues = {
  TOYOTA: 'TOYOTA',
  BMW: 'BMW',
  MERCEDES: 'MERCEDES',
  AUDI: 'AUDI',
  VOLKSWAGEN: 'VOLKSWAGEN',
  HONDA: 'HONDA',
  NISSAN: 'NISSAN',
  HYUNDAI: 'HYUNDAI',
  KIA: 'KIA',
  FORD: 'FORD',
  CHEVROLET: 'CHEVROLET',
  LEXUS: 'LEXUS',
  PORSCHE: 'PORSCHE',
  LAMBORGHINI: 'LAMBORGHINI',
  FERRARI: 'FERRARI',
  BENTLEY: 'BENTLEY',
  ROLLS_ROYCE: 'ROLLS_ROYCE',
  OTHER: 'OTHER'
} as const;


