import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { BadRequestException, InternalServerErrorException, UseGuards, UsePipes,  } from '@nestjs/common';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member.input';
import { Member, Members } from '../../libs/dto/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member.update';
import { ObjectId } from 'mongoose';
import { getSerialForImage, shapeIntoMongoObjectId, validMimeTypes } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Message } from '../../libs/enums/common.enum';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService) {}// inject the service

    @Mutation(() => Member) // Use validation pipe for input validation
    public async signup(@Args("input") input: MemberInput): Promise<Member> {
        console.log('Mutation: signup');
         // Implement the signup logic here
        return  this.memberService.signup(input);
    }
    @Mutation(() => Member)
    public async login(@Args("input") input: LoginInput): Promise<Member> {
        console.log('Mutation: login');
     
        return  await this.memberService.login(input);
    }
    // Authenticated : (user ,admin ,agent )
    @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async updateMember(
         @Args('input') input: MemberUpdate,
        @AuthMember('_id') memberId: ObjectId):
         Promise<Member> {
        console.log(' Mutation: update ');

       delete (input as Partial<MemberUpdate>)._id;  // Remove _id from input if not needed
        
        // Implement the update logic here
        return  await this.memberService.updateMember(memberId, input);
    }
    @UseGuards(AuthGuard)
    @Query(() => String)
    public async checkAuth(@AuthMember('memberNick') memberNick: string ): Promise<string> {
        console.log(' checkAuth: update ');
        console.log( 'memberNick:', memberNick);
        // Implement the update logic here
        return `Hi${memberNick}`;
    }

    @Roles(MemberType.USER, MemberType.AGENT) // Allow USER, ADMIN, AGENT roles
    @UseGuards(RolesGuard)
    @Query(() => String)
    public async checkAuthRoles(@AuthMember() authMember: Member ): Promise<string> {
        console.log(' checkAuth: update ');
        console.log( 'authMember:', authMember.memberNick);
        // Implement the update logic here
        return `Hi${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
    }

     @UseGuards(WithoutGuard)
    @Query(() => Member)
    public async getMember(@Args('memberId') input: string,@AuthMember('_id') memberId:ObjectId): Promise<Member> {
        console.log('Query :  getMember ');
        console.log('memberId:', memberId);
        const targetId = shapeIntoMongoObjectId(input);
        // Implement the get logic here
        return await this.memberService.getMember(targetId, memberId);
    }

    @Query(() => Members)
public async getAgents(@Args('input') input: AgentsInquiry, @AuthMember('_id') memberId: ObjectId): Promise<Members> {
  try {
    console.log('Input for getAgents:', input);
    return await this.memberService.getAgents(memberId, input);
  } catch (error) {
    console.error('Error in getAgents resolver:', error);
    throw error;
  }
}

@UseGuards(AuthGuard)
@Mutation(()=>Member)
public async likeTargetMember(
  @Args('memberId') input: string,
  @AuthMember('_id') memberId: ObjectId,
): Promise<Member>{
  console.log('Mutation likeTargetMember ');
  const likeRefId = shapeIntoMongoObjectId(input);
  return await this.memberService.likeTargetMember(memberId, likeRefId);
}
 
    //Authorization :Admin 
    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Query(() => Members)
    public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
        console.log('Query: getAllMembersByAdmin');
        return await this.memberService.getAllMembersByAdmin(input);
    }

     @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => Member)
public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
  try {
    console.log('Mutation: updateMemberByAdmin, input:', input);

    return await this.memberService.updateMemberByAdmin(input);
  } catch (error) {
    console.error('Update failed:', error);
    throw new BadRequestException(error.message || 'Bad Request Exception');
  }
}


/** UPLOADER */
@UseGuards(AuthGuard)
@Mutation((returns) => String)
public async imageUploader(
	@Args({ name: 'file', type: () => GraphQLUpload })
	file: FileUpload,
	@Args('target') target: String,
): Promise<string> {
	console.log('Mutation: imageUploader');
	console.log('Target directory:', target);

	if (!file) {
		throw new Error('No file provided in the request');
	}

	const { createReadStream, filename, mimetype } = await file;
	console.log(`Processing file: ${filename}, type: ${mimetype}`);

	if (!filename) throw new Error('Filename is missing');
const validMime = validMimeTypes.includes(mimetype);
if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

const imageName = getSerialForImage(filename);
const url = `uploads/${target}/${imageName}`;
const stream = createReadStream();

const result = await new Promise((resolve, reject) => {
	stream
		.pipe(createWriteStream(url))
		.on('finish', () => {
			console.log(`✅ File saved successfully: ${url}`);
			resolve(true);
		})
		.on('error', (error) => {
			console.log(`❌ File write failed:`, error.message);
			reject(new Error(`File write failed: ${error.message}`));
		});
});
if (!result) throw new Error('File upload failed');

return url;
}
@UseGuards(AuthGuard)
@Mutation((returns) => [String])
public async imagesUploader(
	@Args('files', { type: () => [GraphQLUpload] })
files: Promise<FileUpload>[],
@Args('target') target: String,
): Promise<string[]> {
	console.log('Mutation: imagesUploader');
	console.log('Number of files received:', files.length);
	console.log('Target directory:', target);

  const uploadedImages: string[] = [];
	const promisedList = files.map(async (img: Promise<FileUpload>, index: number): Promise<Promise<void>> => {
		try {
			if (!img) {
				console.log(`File at index ${index} is null or undefined`);
				return;
			}
			const { filename, mimetype, encoding, createReadStream } = await img;
			console.log(`Processing file ${index}: ${filename}, type: ${mimetype}`);

			const validMime = validMimeTypes.includes(mimetype);
			if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

			const imageName = getSerialForImage(filename);
			const url = `uploads/${target}/${imageName}`;
			const stream = createReadStream();

			const result = await new Promise((resolve, reject) => {
				stream
					.pipe(createWriteStream(url))
					.on('finish', () => {
						console.log(`✅ File ${index} saved successfully: ${url}`);
						resolve(true);
					})
					.on('error', (error) => {
						console.log(`❌ File ${index} write failed:`, error.message);
						reject(new Error(`File write failed: ${error.message}`));
					});
			});
			if (!result) throw new Error(Message.UPLOAD_FAILED);

			uploadedImages[index] = url;
		} catch (err) {
			console.log('Error processing file at index', index, ':', err.message || err);
		}
	});

	await Promise.all(promisedList);
	
	// Filter out null/undefined values to return only successful uploads
	const successfulUploads = uploadedImages.filter(url => url !== null && url !== undefined);
	console.log(`📊 Upload Summary: ${successfulUploads.length} successful out of ${files.length} files`);
	
	return successfulUploads;
}

  
}