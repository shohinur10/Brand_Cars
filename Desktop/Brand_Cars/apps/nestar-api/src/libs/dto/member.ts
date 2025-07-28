import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ObjectId } from "mongoose";
import { MemberAuthType, MemberStatus, MemberType } from "../enums/member.enum";
import { MeLiked } from "./like/like";
import { MeFollowed } from "./follow/follow";
 // Ensure this path is correct
@ObjectType()
export class Member {
    @Field(() => String)
    _id:ObjectId

    @Field(() => String)
    memberType: MemberType;


    @Field(() => String)
    memberStatus: MemberStatus;

    @Field(() => String)

    memberAuthType: MemberAuthType;

    @Field(() => String)
    memberPhone: string;

    @Field(() => String)
    memberNick: string;

    memberPassword?: string;

    @Field(() => String, { nullable: true })
    memberFullName?: string;
    
    @Field(() => String, { nullable: true })
    memberImage: string;

    @Field(() => String, { nullable: true })
    memberAddress?: string;

    @Field(() => String, { nullable: true })
    memberDesc?: string;

    @Field(() => Int, { nullable: true })
    memberProperties: number;

    @Field(() => Int)
    memberArticles: number;

    @Field(() => Int)
    memberFollowers: number;

    @Field(() => Int)
    memberFollowings : number;

    @Field(() => Int, { nullable: true })
    memberPoints: number;

    @Field(() => Int)
    memberLikes: number;

    @Field(() => Int)
    memberViews: number;

    @Field(() => Int, { nullable: true }) 
    memberComments: number;

    @Field(() => Int)
    memberRank: number;

    @Field(() =>Int)
    memberBlocks: number;

    @Field(() =>Int)
    memberWarnings: number;


    @Field(() => Date, { nullable: true })
    deletedAt: Date;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date, { nullable: true })
    updatedAt: Date;

    @Field(() =>String, { nullable: true })
    accessToken?: string;


    /** from aggregation */

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

    @Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];
}


@ObjectType()
export class TotalCounter {
    @Field(() => Int, { nullable: true })
    total: number;
}
 @ObjectType()
 export class Members {
    @Field(() => [Member])
    list: Member[];

    @Field(() => [TotalCounter], { nullable: true })
    metaCounter: TotalCounter[];
}



    

  







