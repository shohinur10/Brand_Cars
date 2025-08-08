import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isNullableType, NonNullTypeNode } from 'graphql';
import { Model, ObjectId, Schema, Types } from 'mongoose';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';

import { T, StatisticModifier } from '../../libs/types/common';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';

import moment from 'moment';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Car, Cars } from '../../libs/dto/car/car';
import { AgentCarsInquiry, AllCarsInquiry, CarInput,  CarsInquiry, OrdinaryInquiry } from '../../libs/dto/car/car.input';
import { CarStatus } from '../../libs/enums/car.enum';
import { CarUpdate } from '../../libs/dto/car/car.update';

@Injectable()
export class CarService {
    constructor(
        @InjectModel('Car') private readonly carModel: Model<Car>,
private memberService: MemberService,
private readonly viewService: ViewService,
private readonly likeService: LikeService

) {} // Inject the property model
    // This service is responsible for handling property-related operations.
    
    public async createCar(input: CarInput): Promise<Car> {
      try {
        // Calculate discounted price before creating the car
        input.discountedPrice = this.calculateDiscountedPrice(input.carPrice, input.discountPercent);
        
        const result = await this.carModel.create(input);
        await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberCars', modifier: 1 });
        return result;
      } catch (err) {
        console.log('Error, Service.model:', err.message);
        throw new BadRequestException(Message.CREATE_FAILED);
      }
    }
    
    private calculateDiscountedPrice(price: number, discountPercent?: number): number {
      if (!discountPercent || discountPercent <= 0) return price;
      return Math.round(price - (price * discountPercent) / 100);
    }
    
    
      public async getCar(memberId: ObjectId , carId: ObjectId): Promise<Car>{
        const search: T ={
          _id:carId,
          carStatus: CarStatus.AVAILABLE
        };
        const targetCar= await this.carModel.findOne(search).lean().exec();//lean modify
        if (!targetCar) {
          throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        }
        if(!targetCar) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        if (memberId){
          const ViewInput ={memberId: memberId, viewRefId:carId, viewGroup:ViewGroup.CARS}
          const newView =await this.viewService.recordView(ViewInput);

        if (newView){
          await this.carStatsEditor({_id:carId,targetKey:'carViews',modifier:1})};
      targetCar.carViews++;
    }
    targetCar.memberData = await this.memberService.getMember(null, targetCar.memberId) as any;
    return targetCar;
  }

    
    public async carStatsEditor(input: StatisticModifier): Promise<Car> {
      const { _id, targetKey, modifier } = input;
      const updatedCar = await this.carModel
        .findByIdAndUpdate(
          _id,
          { $inc: { [targetKey]: modifier } },
          {
            new: true,
          }
        )
        .exec();

      if (!updatedCar) {
        throw new InternalServerErrorException(Message.UPDATED_FAILED);
      }

      return updatedCar;
    }

    public async updateCar(memberId: ObjectId, input: CarUpdate): Promise<Car> {
      let { carStatus, soldAt, deletedAt } = input;
    
      // 1. Calculate discounted price if price or discountPercent is changed or exists
      if (input.discountPercent !== undefined || input.carPrice !== undefined) {
        // Fetch current car data to get existing values if needed
        const currentCar = await this.carModel.findById(input._id).select('carPrice discountPercent').lean();
    
        const price = input.carPrice ?? currentCar?.carPrice ?? 0;
        const discountPercent = input.discountPercent ?? currentCar?.discountPercent ?? 0;
    
        // Calculate discounted price
        input.discountedPrice = Math.round(price - (price * discountPercent) / 100);
      }
    
      const search: T = {
        _id: input._id,        // The car to update
        memberId: memberId,    // Belongs to the member updating it
        carStatus: CarStatus.AVAILABLE, // Only allow updates if car is AVAILABLE
      };
    
      if (carStatus === CarStatus.SOLD) soldAt = moment().toDate();
      else if (carStatus === CarStatus.UNAVAILABLE) deletedAt = moment().toDate();
    
      const result = await this.carModel
        .findByIdAndUpdate(search, input, {
          new: true,
        })
        .exec();
    
      if (!result) throw new InternalServerErrorException(Message.UPDATED_FAILED);
    
      if (soldAt || deletedAt) {
        await this.memberService.memberStatsEditor({
          _id: memberId,
          targetKey: 'memberCars',
          modifier: -1,
        });
      }
      return result;
    }
    

    public async getCars(memberId: ObjectId, input: CarsInquiry): Promise<Cars> {
      const match: T = { carStatus: CarStatus.AVAILABLE };
    
      const sortDirection = input?.direction === Direction.DESC ? -1 : 1;
      const sortField = input?.sort ?? 'createdAt';
      const sort: T = { [sortField]: sortDirection };
    
      this.shapeMatchQuery(match, input);
      console.log('match:', match);
    
      const result = await this.carModel
        .aggregate([
          { $match: match },
          { $sort: sort },
          {
            $facet: {
              list: [
                { $skip: (input.page - 1) * input.limit },
                { $limit: input.limit },
                lookupAuthMemberLiked(memberId),
                lookupMember,
                { $unwind: '$memberData' },
              ],
              metaCounter: [{ $count: 'total' }],
            },
          },
        ])
        .exec();
    
      if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    
      return result[0];
    }
    
    private shapeMatchQuery(match: any, input: CarsInquiry): void {
      const {
        memberId,
        locationList,
        typeList,
        carCategoryList,
        yearRange,
        fuelTypes,
        brands,
        pricesRange,
        periodsRange,
        minMileage,
        maxMileage,
        options,
        searchText,
      } = input.search;
    
      if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
    
      if (locationList?.length) {
        match.carLocation = { $in: locationList };
      }
    
      if (typeList?.length) {
        match.carTransactionType = { $in: typeList };
      }
    
      if (carCategoryList?.length) {
        match.carCategory = { $in: carCategoryList };
      }
    
      // Handle array-based year range
      if (yearRange?.length === 2) {
        const [startYear, endYear] = yearRange;
        match.carYear = {
          ...(startYear !== undefined && { $gte: startYear }),
          ...(endYear !== undefined && { $lte: endYear }),
        };
      }
    
      if (pricesRange) {
        match.carPrice = {
          ...(pricesRange.start !== undefined && { $gte: pricesRange.start }),
          ...(pricesRange.end !== undefined && { $lte: pricesRange.end }),
        };
      }
    
      if (periodsRange) {
        match.createdAt = {
          ...(periodsRange.start !== undefined && { $gte: periodsRange.start }),
          ...(periodsRange.end !== undefined && { $lte: periodsRange.end }),
        };
      }
    
      if (fuelTypes?.length) {
        match.fuelType = { $in: fuelTypes };
      }
    
      if (brands?.length) {
        match.brand = { $in: brands };
      }
    
      if (minMileage !== undefined || maxMileage !== undefined) {
        match.mileage = {};
        if (minMileage !== undefined) match.mileage.$gte = minMileage;
        if (maxMileage !== undefined) match.mileage.$lte = maxMileage;
        if (Object.keys(match.mileage).length === 0) delete match.mileage;
      }
    
      if (options?.length) {
        match.$or = options.map((option) => ({ [option]: true }));
      }
    
      if (searchText) {
        match.$or = match.$or || [];
        match.$or.push(
          { brand: { $regex: new RegExp(searchText, 'i') } },
          { model: { $regex: new RegExp(searchText, 'i') } },
          { carDesc: { $regex: new RegExp(searchText, 'i') } },
        );
      }
    }
    

  public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Cars> {
		return await this.likeService.getFavoriteCars(memberId, input);
	}
	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Cars> {
		return await this.viewService.getVisitedCars(memberId, input);
	}

  public async getAgentCars(memberId: ObjectId, input: AgentCarsInquiry): Promise<Cars> {
    const {carStatus } = input.search;
    if (carStatus === CarStatus.UNAVAILABLE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
  
    const match: T = {
      memberId: memberId,
      carStatus: carStatus ?? { $ne: CarStatus.UNAVAILABLE },
    };
  

    const sortDirection = input?.direction === Direction.DESC ? -1 : 1;
    const sortField = input?.sort ?? 'createdAt';
    const sort: T = { [sortField]: sortDirection };
  
    const result = await this.carModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
  
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
  
    return result[0];
    }

    public async likeTargetCar(memberId:ObjectId, likeRefId:ObjectId):Promise<Car>{
      const target = await this.carModel.findOne({_id: likeRefId, carStatus: CarStatus.AVAILABLE}).exec();
      if (!target) {
          throw new InternalServerErrorException(Message.NO_DATA_FOUND);
      }
     if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);


     const  input :LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.CARS,
     };

 // Like TAGGLE
 const modifier:number = await this.likeService.toggleLike(input);
 const result = await this.carStatsEditor({_id:likeRefId, targetKey:'carLikes', modifier:modifier});

   if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
   return result;
  }
  

public async getAllCarsByAdmin(input: AllCarsInquiry): Promise<Cars> {
  const { carStatus, carLocationList } = input.search;//destraction qilyapmiz

  const match: T = {};

  const allowedSorts = [
    'createdAt',
    'updateAt',
    'carLikes',
    'carViews',
    'carPrice',
    'carRank',
  ];

  const sortField = allowedSorts.includes(input.sort ?? '')
    ? input.sort!
    : 'createdAt';

  const sortDirection = input.direction === Direction.ASC ? 1 : -1;

  const sort: T = {
    [sortField]: sortDirection,
  };

  if (carStatus) match.carStatus = carStatus;
  if (carLocationList) match.carLocation = { $in: carLocationList };

  const result = await this.carModel
    .aggregate([
      { $match: match },
      { $sort: sort },
      {
        $facet: {
          list: [
            { $skip: (input.page - 1) * input.limit },
            { $limit: input.limit },
            lookupMember,
            { $unwind: '$memberData' },
          ],
          metaCounter: [{ $count: 'total' }],
        },
      },
    ])
    .exec();

  if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

  return result[0];
}
public async updateCarByAdmin(input: CarUpdate): Promise<Car> {
  let { carStatus, soldAt, deletedAt } = input;

  // Fetch current car info to fallback if needed
  const currentCar = await this.carModel.findById(input._id).select('carPrice discountPercent').lean();

  const price = input.carPrice ?? currentCar?.carPrice ?? 0;
  const discountPercent = input.discountPercent ?? currentCar?.discountPercent ?? 0;

  // Calculate discounted price if discountPercent or price is present
  if (discountPercent > 0 || input.carPrice !== undefined) {
    input.discountedPrice = Math.round(price - (price * discountPercent) / 100);
  }

  const search: T = {
    _id: input._id,
    carStatus: CarStatus.AVAILABLE, // Only update available cars
  };

  if (carStatus === CarStatus.SOLD) soldAt = moment().toDate();
  else if (carStatus === CarStatus.UNAVAILABLE) deletedAt = moment().toDate();

  const result = await this.carModel
    .findOneAndUpdate(search, input, {
      new: true,
    })
    .exec();

  if (!result) throw new InternalServerErrorException(Message.UPDATED_FAILED);

  if (soldAt || deletedAt) {
    await this.memberService.memberStatsEditor({
      _id: result.memberId,
      targetKey: 'memberCars',
      modifier: -1,
    });
  }

  return result;
}


public async removeCarByAdmin(carId: ObjectId): Promise<Car> {
  const search: T = { _id: carId, carStatus: CarStatus.UNAVAILABLE };// this logic only when propertyStatus.delete otherwise no so we cant remove active or sold status 
  const result = await this.carModel.findOneAndDelete(search).exec();
  if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

  return result;
}
}