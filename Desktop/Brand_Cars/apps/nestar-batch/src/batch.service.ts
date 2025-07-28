import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/nestar-api/src/libs/dto/member';
import { Property } from 'apps/nestar-api/src/libs/dto/property/property';
import { MemberStatus, MemberType } from 'apps/nestar-api/src/libs/enums/member.enum';
import { PropertyStatus } from 'apps/nestar-api/src/libs/enums/car.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		await this.propertyModel.updateMany({ propertyStatus: PropertyStatus.ACTIVE }, { propertyRank: 0 }).exec();
		await this.memberModel
			.updateMany({ memberStatus: MemberStatus.ACTIVE, memberType: MemberType.AGENT }, { memberRank: 0 })
			.exec();
	}

	public async batchTopProperties(): Promise<void> {
		const properties: Property[] = await this.propertyModel
			.find({
				propertyStatus: PropertyStatus.ACTIVE,
				propertyRank: 0,
			})
			.exec();

		const promisedList = properties.map(async (ele: Property) => { // botta map orqali iteration qilyapmiz 
			const { _id, propertyLikes, propertyViews } = ele;
			const rank = propertyLikes * 2 + propertyViews * 1;
			return await this.propertyModel.findByIdAndUpdate(_id, { propertyRank: rank });
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
        memberProperties = 0,
        memberArticles = 0,
        memberLikes = 0,
        memberViews = 0,
      } = ele;
  
      const rank =
        (memberProperties || 0) * 5 +
        (memberArticles || 0) * 3 +
        (memberLikes || 0) * 2 +
        (memberViews || 0) * 1;
  
      // Log for debugging
      console.log('Calculated rank for agent:', {
        id: _id,
        memberProperties,
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