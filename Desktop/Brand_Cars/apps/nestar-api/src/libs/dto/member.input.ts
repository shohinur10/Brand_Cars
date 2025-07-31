import { Field, InputType, Int } from "@nestjs/graphql";
import { MemberType, MemberAuthType, MemberStatus } from '../enums/member.enum';
import { IsIn, IsNotEmpty, IsOptional,Length, Min} from 'class-validator';
import { availableAgentSorts, availableMemberSorts } from "../config";
import { Direction } from "../enums/common.enum";


@InputType()
export class MemberInput {
    @IsNotEmpty()
    @Length(3,12)
    @Field(() => String)
    memberNick: string ;

    @IsNotEmpty()
    @Length(5, 12)
    @Field(() => String)
    memberPassword: string;

    @IsNotEmpty()
    @Field(() => String)
    memberPhone: string;

    @IsNotEmpty()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType;

    @IsOptional()
    @Field(() => MemberAuthType, { nullable: true })
    MemberAuthType?: MemberAuthType;

    @Field(() => Boolean)
    hasBonus: boolean;

}

@InputType()
export class LoginInput {
    @IsNotEmpty()
    @Length(3,12)
    @Field(() => String)
    memberNick: string ;

    @IsNotEmpty()
    @Length(5, 12)
    @Field(() => String)
    memberPassword: string;
}
   

@InputType()
export class AISearch {
    @IsNotEmpty()
    @Field(() => String, { nullable: true })
    text?: string;
}
@InputType()
export class AgentsInquiry {
    @IsNotEmpty()
    @Field(() => Int)    // <-- use Int for number, not String
    page: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit: number;

    @IsOptional()
    @IsIn(availableAgentSorts)
    @Field(() => String, { nullable: true })
    sort?: string;

    @IsOptional()
   @Field(() => Direction, { nullable: true })  // Change from String to Direction here
   direction?: Direction;


    @IsNotEmpty()
    @Field(() => AISearch)
    search: AISearch;
}



@InputType()
export class MISearch {

    @IsOptional()
    @Field(() => MemberStatus, { nullable: true })
    memberStatus?: MemberStatus;

    @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType;



    @IsOptional()
    @Field(() => String, { nullable: true })
    text?: string;
}
@InputType()
export class MembersInquiry {
    @IsNotEmpty()
    @Field(() => Int)    // <-- use Int for number, not String
    page: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit: number;

    @IsOptional()
    @IsIn(availableMemberSorts)
    @Field(() => String, { nullable: true })
    sort?: string;

    @IsOptional()
    @Field(() => Direction, { nullable: true })  // Change from String to Direction here
    direction?: Direction;
    
    @IsNotEmpty()
    @Field(() => MISearch)
    search: MISearch;
}
