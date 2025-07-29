import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Car } from 'apps/nestar-api/src/libs/dto/car/car';
import { Member } from 'apps/nestar-api/src/libs/dto/member';
import { CarStatus } from 'apps/nestar-api/src/libs/enums/car.enum';
import { MemberStatus, MemberType } from 'apps/nestar-api/src/libs/enums/member.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Car') private readonly carModel: Model<Car>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		await this.carModel.updateMany({ carStatus: CarStatus.AVAILABLE}, { carRank: 0 }).exec();
		await this.memberModel
			.updateMany({ memberStatus: MemberStatus.ACTIVE, memberType: MemberType.AGENT }, { memberRank: 0 })
			.exec();
	}

	public async batchTopCars(): Promise<void> {
		const cars: Car[] = await this.carModel
			.find({
				carStatus: CarStatus.AVAILABLE,
				carRank: 0,
			})
			.exec();

		const promisedList = cars.map(async (ele: Car) => { // botta map orqali iteration qilyapmiz 
			const { _id, carLikes, carViews } = ele;
			const rank = carLikes * 2 + carViews * 1;
			return await this.carModel.findByIdAndUpdate(_id, { carRank: rank });
		});
		await Promise.all(promisedList);
	}

  public async batchTopAgents(): Promise<void> {
    const agents: Member[] = await this.memberModel
      .find({
        memberType: MemberType.AGENT,
        memberStatus: MemberStatus.ACTIVE,
        memberRank: 0,
      })
      .exec();
  
    const promisedList = agents.map(async (ele: Member) => {
      const {
        _id,
        memberCars= 0,
        memberArticles = 0,
        memberLikes = 0,
        memberViews = 0,
      } = ele;
  
      const rank =
        (memberCars || 0) * 5 +
        (memberArticles || 0) * 3 +
        (memberLikes || 0) * 2 +
        (memberViews || 0) * 1;
  
      // Log for debugging
      console.log('Calculated rank for agent:', {
        id: _id,
        memberCars,
        memberArticles,
        memberLikes,
        memberViews,
        rank,
      });
  
      return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
    });
  
    await Promise.all(promisedList);
  }  
  public getHello(): string {
		return 'Welcome to Nestar BATCH Server!';
	}
}