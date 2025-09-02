import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId, Types } from 'mongoose';
import { Query } from '@nestjs/graphql';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { UseGuards } from '@nestjs/common';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Car, Cars } from '../../libs/dto/car/car';
import { CarInput, CarsInquiry, OrdinaryInquiry, AgentCarsInquiry, AllCarsInquiry } from '../../libs/dto/car/car.input';
import { CarUpdate } from '../../libs/dto/car/car.update';
import { CarService } from './car.service';

@Resolver()
export class CarResolver {
	constructor(
		private readonly carService: CarService,
		
	) {}

@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() =>Car)
	public async createCar(
		@Args('input') input: CarInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Car> {
		console.log('Mutation: createCar');
		input.memberId = memberId;
		return await this.carService.createCar(input);
	}

@UseGuards(WithoutGuard)
@Query(() => Car)
public async getCar(
    @Args('carId') input: string,
    @AuthMember("_id") memberId: ObjectId,
): Promise<Car> {
    console.log('Query: getCar');
    const carId = shapeIntoMongoObjectId(input); // Make sure it returns ObjectId
    return await this.carService.getCar(memberId, carId);
}

@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Car)
	public async updateCar(
		@Args('input') input: CarUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Car> {
		console.log('Mutation:updateCar');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.carService.updateCar(memberId, input);
	}

    @UseGuards(WithoutGuard)
    @Query((returns) =>Cars)
    public async getCars(
        @Args('input') input: CarsInquiry,
        @AuthMember("_id") memberId: ObjectId,
        ): Promise<Cars>{
            console.log('Query: getCars');
            return await this.carService.getCars(memberId, input);
        }


	@UseGuards(AuthGuard)
	@Query((returns) => Cars)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Cars> {
		console.log('Query: getFavorites');
		return await this.carService.getFavorites(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query((returns) => Cars)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Cars> {
		console.log('Query: getVisited');
		return await this.carService.getVisited(memberId, input);
	}
	
        @Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query((returns) => Cars)
	public async getAgentCars(
		@Args('input') input: AgentCarsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Cars> {
		console.log('Query: getCars');
		return await this.carService.getAgentCars(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(()=> Car)
	public async likeTargetCar(
	  @Args('carId') input: string,
	  @AuthMember('_id') memberId: ObjectId,
	): Promise<Car>{
	  console.log('Mutation likeTargetMember ');
	  const likeRefId = shapeIntoMongoObjectId(input);
	  return await this.carService.likeTargetCar(memberId, likeRefId);
	}
	 



   /** ADMIN */

   @Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Cars)
	public async getAllCarsByAdmin(
		@Args('input') input: AllCarsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Cars> {
		console.log('Query: getAllCarsByAdmin ');
		return await this.carService.getAllCarsByAdmin(input);
	}
    	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => String)
	public async testUpdateCarSimple(@Args('input') input: CarUpdate): Promise<string> {
		console.log('Test mutation with simple DTO received:', JSON.stringify(input, null, 2));
		return `Test successful for carId: ${input._id}`;
	}

    	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => String)
	public async testUpdateCarByAdmin(@Args('carId') carId: string): Promise<string> {
		console.log('Test mutation received carId:', carId);
		return `Test successful for carId: ${carId}`;
	}

    	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Car)
	public async updateCarByAdmin(@Args('input') input: CarUpdate): Promise<Car> {
		console.log('Mutation: updateCarByAdmin!');
		console.log('Input received:', JSON.stringify(input, null, 2));
		
		try {
			// Convert string _id to ObjectId for the service
			const serviceInput = {
				...input,
				_id: shapeIntoMongoObjectId(input._id)
			};
			return await this.carService.updateCarByAdmin(serviceInput);
		} catch (error) {
			console.error('UpdateCarByAdmin Error:', error);
			throw error;
		}
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Car)
	public async removeCarByAdmin(@Args('carId') input: string): Promise<Car> {
		console.log('Mutation: removeCarByAdmin!');
		const carId = shapeIntoMongoObjectId(input);
		return await this.carService.removeCarByAdmin(carId);
	}


}