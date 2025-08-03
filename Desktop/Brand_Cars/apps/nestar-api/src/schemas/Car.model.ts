import { Schema } from 'mongoose';
import { CarStatus, CarLocation, CarTransactionType, CarCategory } from '../libs/enums/car.enum';

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

    carStatus: {
      type: String,
      enum: CarStatus,
      default: CarStatus.AVAILABLE,
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
  { CarCategory: 1, carLocation: 1, carTitle: 1, carPrice: 1 },
  { unique: true },
);

export default CarSchema;

