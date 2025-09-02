import { Schema } from 'mongoose';
import { CarStatus, CarLocation, CarTransactionType, CarCategory, CarBrand, FuelType, TransmissionType, CarCondition, CarColor } from '../libs/enums/car.enum';

const CarSchema = new Schema(
  {
    carTransactionType: {
      type: String,
      enum: CarTransactionType,
      required: true,
    },
    carCategory: {
      type: String,
      enum: CarCategory,
      required: true,
    },

    brand: {
      type: String,
      enum: CarBrand,
      required: true,
    },

    carStatus: {
      type: String,
      enum: CarStatus,
      default: CarStatus.AVAILABLE,
    },

    fuelType: {
      type: String,
      enum: FuelType,
      required: true,
    },

    transmissionType: {
      type: String,
      enum: TransmissionType,
      required: true,
    },

    carCondition: {
      type: String,
      enum: CarCondition,
      required: true,
    },

    carColor: {
      type: String,
      enum: CarColor,
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    carLocation: {
      type: String,
      enum: CarLocation,
      required: true,
    },

    carAddress: {
      type: String,
      required: true,
    },

    carTitle: {
      type: String,
      required: true,
    },

    carPrice: {
      type: Number,
      required: true,
    },

    carYear: {
      type: Number,
      required: true,
    },

    carSeats: {
      type: Number,
      required: true,
    },

    carDoors: {
      type: Number,
      required: true,
    },

    carMileage: {
      type: Number,
      default: 0,
    },

    mileage: {
      type: Number,
      default: 0,
    },

    carViews: {
      type: Number,
      default: 0,
    },

    carLikes: {
      type: Number,
      default: 0,
    },

    carComments: {
      type: Number,
      default: 0,
    },

    carRank: {
      type: Number,
      default: 0,
    },

    carImages: {
      type: [String],
      required: true,
    },

    carDesc: {
      type: String,
    },

    isBarterAvailable: {
      type: Boolean,
      default: false,
    },

    isForRent: {
      type: Boolean,
      default: false,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    soldAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
    },

    registeredAt: {
      type: Date,
    },
  },
  { timestamps: true, collection: 'cars' },
);

CarSchema.index(
  { carCategory: 1, carLocation: 1, carTitle: 1, carPrice: 1 },
  { unique: false },
);

export default CarSchema;

