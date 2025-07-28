import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/property/car.input';
import { Properties } from '../../libs/dto/property/property';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisit } from '../../libs/config';

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

      public async getVisitedProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
        const { page, limit } = input;
        const match: T = { viewGroup: ViewGroup.PROPERTY, memberId: memberId };
        const data: T = await this.viewModel
          .aggregate([
            { $match: match },//Filter: faqat kerakli memberId va PROPERTY turidagi yozuvlar olinadi.
            { $sort: { updatedAt: -1 } },// sort by the last view from the top 
            {
              $lookup: {
                from: 'properties',
                localField: 'viewRefId',
                foreignField: '_id',
                as: 'visitedProperty',
              },
            },
            { $unwind: '$visitedProperty' },
            {
              $facet: { //Bu bosqichda ikkita paralel natija olinadi:
                list: [
                  { $skip: (page - 1) * limit },
                  { $limit: limit },
                  lookupVisit,//lookupVisit: bu ehtimol visitedProperty ichidagi boshqa bog‘liq ma’lumotlarni olish uchun ishlatiladi (masalan: agent, user, va h.k.).
                  { $unwind: '$visitedProperty.memberData' },
                ],
                metaCounter: [{ $count: 'total' }],
              },
            },
          ])
          .exec();
        console.log('data: ', data);
        const result: Properties = { list: [], metaCounter: data[0].metaCounter };
        result.list = data[0].list.map((ele) => ele.visitedProperty);
        console.log('result', result);
        return result;
      }
    }
          