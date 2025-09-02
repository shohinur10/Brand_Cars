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

export interface CarUpdate {
  _id: string;
  carTransactionType?: CarTransactionType;
  carCategory?: CarCategory;
  carStatus?: CarStatus;
  carLocation?: CarLocation;
  carAddress?: string;
  carTitle?: string;
  brand?: CarBrand; // ✅ Updated to use CarBrand enum instead of string
  fuelType?: FuelType; // ✅ Added missing field
  transmissionType?: TransmissionType; // ✅ Added missing field
  carCondition?: CarCondition; // ✅ Added missing field
  carColor?: CarColor; // ✅ Added missing field
  model?: string; // ✅ Added missing field
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
  soldAt?: Date;
  deletedAt?: Date;
  registeredAt?: Date;
  discountPercent?: number;
  discountedPrice?: number;
  carMileage?: number; // ✅ Added missing field
}


