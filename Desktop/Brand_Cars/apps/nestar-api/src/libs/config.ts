import{ObjectId} from 'bson';//Ko‘p hollarda string ko‘rinishidagi id larni ObjectId ga aylantirish kerak bo‘ladi (aksi holda Mongo query ishlamaydi).

export const availableAgentSorts =["createdAt", "updatedAt", "memberLikes", "memberViews","memberRank"] ;
export const availableMemberSorts =["createdAt", "updatedAt", "memberLikes", "memberViews"];

export const availableOptions =['CarLoan','CarRent','CarInsurance','CarExchange','CarDelivery','CarMaintenance','CarAccessories','CarParts','CarServices'];
export const availableCarSorts =[
	"createdAt",
	"updatedAt",
	'carLikes',
	'carViews',
	'carRank',
	'carPrice',
]
export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];
export const availableCommentSorts = ['createdAt', 'updatedAt'];

/** IMAGE CONFIGURATION */

import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';
import { pipeline } from 'stream';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;//path.parse() orqali sen fayl haqidagi kerakli ma’lumotlarni osongina olishing mumkin.
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId= (target: any) => {
  return typeof target === "string" ? new ObjectId(target) : target;
 };


 export const lookupAuthMemberLiked = (
	memberId: T,// Foydalanuvchining ID si (like qilgan odam)
	targetRefId: string = '$_id' // targetRefId — bu "qaysi element (car, post, article va hokazo) like qilinganini" aniqlash uchun ishlatiladi.
  ) => {
	return {
	  $lookup: {
		from: 'likes',   // "likes" degan collectiondan ma'lumot qidiradi
		let: {
		  localLikeRefId: targetRefId, // qaysi elementni tekshiramiz // database uchun bu mantiq 
		  localMemberId: memberId,     // kim tekshirilmoqda
		  localMyFavorite: true,       // bu doimiy qiymat: agar topsa, "true"
		},
		pipeline: [
		  {
			$match: {
			  $expr: {
				$and: [
				  { $eq: ['$likeRefId', '$$localLikeRefId'] },   // like qilingan element shu bo'lishi kerak
				  { $eq: ['$memberId', '$$localMemberId'] },     // like qilgan foydalanuvchi shu bo'lishi kerak
				],
			  },
			},
		  },
		  {
			$project: {
			  _id: 0,
			  memberId: 1,
			  likeRefId: 1,
			  myFavorite: '$$localMyFavorite', // doimiy true qaytariladi
			},
		  },
		],
		as: 'meLiked', // natija shu nom bilan chiqadi
	  },
	};
  };
  

interface LookupAuthMemberFollowed {
	followerId: T;
	followingId: string;
}
export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
	const { followerId, followingId } = input;  // 1. input dan follower va following id lar olinadi
	return {
		$lookup: {                              // 2. $lookup operatori — boshqa collection bilan bog‘lanish uchun
			from: 'follows',                    // 3. 'follows' nomli collectiondan ma’lumot qidiramiz
			let: {                             // 4. $lookup ichida o‘zgaruvchilar tayinlanadi:
				localFollowerId: followerId,   // followerId — kim ergashyapti (foydalanuvchi)
				localFollowingId: followingId, // followingId — kimga ergashilyapti (maqsad)
				localMyFavorite: true,         // doimiy qiymat, keyin pipeline da ishlatiladi
			},
			pipeline: [                        // 5. pipeline ichida filtr va map qilamiz
				{
					$match: {                 // 6. $match — mos keladigan hujjatlarni tanlaymiz
						$expr: {              // 7. $expr bilan ifoda yozamiz (o‘zgaruvchilarni taqqoslash uchun)
							$and: [             // 8. ikkita shart: followerId va followingId tengligi
								{ $eq: ['$followerId', '$$localFollowerId'] },  // 'follows'dagi followerId shu foydalanuvchi bo‘lishi kerak
								{ $eq: ['$followingId', '$$localFollowingId'] },// 'follows'dagi followingId maqsad foydalanuvchi bo‘lishi kerak
							],
						},
					},
				},
				{
					$project: {               // 9. Natijani qanday ko‘rsatishni belgilaymiz
						_id: 0,
						followerId: 1,
						followingId: 1,
						myFollowing: '$$localMyFavorite',  // doimiy true qiymatni natijaga qo‘shamiz
					},
				},
			],
			as: 'meFollowed',              // 10. Natijani 'meFollowed' degan nom bilan saqlaymiz
		},
	};
};


 export const lookupMember ={
	$lookup:{
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};


export const lookupFollowingData = {
	$lookup: {
		from: 'members',
		localField: 'followingId',
		foreignField: '_id',
		as: 'followingData',
	},
};
export const lookupFollowerData = {
	$lookup: {
		from: 'members',
		localField: 'followerId',
		foreignField: '_id',
		as: 'followerData',
	},
};

export const lookupFavorite = {
	$lookup: {
		from: 'members',
		localField: 'favoriteCar.memberId',// favorite Car.memberId ichidan malumot qidirib uni favorite Car.memberData joylab beryapti 
		foreignField: '_id',
		as: 'favoriteACar.memberData',
	},
};

export const lookupVisit = {
	$lookup: {
		from: 'members',
		localField: 'visitedCar.memberId',
		foreignField: '_id',
		as: 'visitedCar.memberData',
	},
};