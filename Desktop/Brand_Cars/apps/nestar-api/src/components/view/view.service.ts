import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/car/car.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisit } from '../../libs/config';
import { Cars } from '../../libs/dto/car/car';

@Injectable()
export class ViewService {
  
    constructor(@InjectModel("View") private readonly viewModel: Model<View>) {} // Inject the View modeel
    
    public async recordView(input: ViewInput): Promise<boolean> {
        const viewExist = await this.checkViewExistence(input);
        if (!viewExist) {
          console.log("-New View Insert -");
          await this.viewModel.create(input);
          return true; // ✅ New view was inserted
        }
        return false; // ❌ Already exists, not new
      }
      
      

      private async checkViewExistence(input: ViewInput): Promise<View | null> {
        const { memberId, viewRefId } = input;
        const result = await this.viewModel.findOne({ memberId, viewRefId }).exec();
        return result; // ✅ No more error throwing
      }

      public async getVisitedCars(memberId: ObjectId, input: OrdinaryInquiry): Promise<Cars> {
        const { page, limit } = input;
        const match: T = { viewGroup: ViewGroup.CARS, memberId: memberId };
        const data: T = await this.viewModel
          .aggregate([
            { $match: match },//Filter: faqat kerakli memberId va Car turidagi yozuvlar olinadi.
            { $sort: { updatedAt: -1 } },// sort by the last view from the top 
            {
              $lookup: {
                from: 'cars',
                localField: 'viewRefId',
                foreignField: '_id',
                as: 'visitedCar',
              },
            },
            { $unwind: '$visitedCar' },
            {
              $facet: { //Bu bosqichda ikkita paralel natija olinadi:
                list: [
                  { $skip: (page - 1) * limit },
                  { $limit: limit },
                  lookupVisit,//lookupVisit: bu ehtimol visitedCarichidagi boshqa bog‘liq ma’lumotlarni olish uchun ishlatiladi (masalan: agent, user, va h.k.).
                  { $unwind: '$visitedCar.memberData' },
                ],
                metaCounter: [{ $count: 'total' }],
              },
            },
          ])
          .exec();
        console.log('data: ', data);
        const result: Cars = { list: [], metaCounter: data[0].metaCounter };
        result.list = data[0].list.map((ele) => ele.visitedCar);
        console.log('result', result);
        return result;
      }
    }
          