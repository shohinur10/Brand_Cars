import { gql } from '@apollo/client';

export const GET_CAR = gql`
	query GetCar($input: String!) {
    getCar(carId: $input) {
        _id
        carTransactionType
        carCategory
        carStatus
        carLocation
        carAddress
        carTitle
        carPrice
        carYear
        carSeats
        carDoors
        carViews
        carLikes
        carComments
        carRank
        carImages
        carDesc
        isBarterAvailable
        isForRent
        discountPercent
        discountedPrice
        memberId
        soldAt
        deletedAt
        registeredAt
        createdAt
        updatedAt
        memberData {
            _id
            memberType
            memberStatus
            memberAuthType
            memberPhone
            memberNick
            memberFullName
            memberImage
            memberAddress
            memberDesc
            memberCars
            memberArticles
            memberFollowers
            memberFollowings
            memberPoints
            memberLikes
            memberViews
            memberComments
            memberRank
            memberBlocks
            memberWarnings
            deletedAt
            createdAt
            updatedAt
            accessToken
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            meFollowed {
                followingId
                followerId
                myFollowing
            }
        }
        brand
        fuelType
        transmissionType
        carCondition
        carColor
        model
        carMileage
    }
}
`;

export const GET_CARS = gql`
	query GetCars($input: CarsInquiry!) {
    getCars(input: $input) {
        list {
            _id
            carTransactionType
            carCategory
            carStatus
            carLocation
            carAddress
            carTitle
            carPrice
            carYear
            carSeats
            carDoors
            carViews
            carLikes
            carComments
            carRank
            carImages
            carDesc
            isBarterAvailable
            isForRent
            discountPercent
            discountedPrice
            memberId
            soldAt
            deletedAt
            registeredAt
            createdAt
            updatedAt
            brand
            memberData {
                _id
                memberType
                memberStatus
                memberAuthType
                memberPhone
                memberNick
                memberFullName
                memberImage
                memberAddress
                memberDesc
                memberCars
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberBlocks
                memberWarnings
                deletedAt
                createdAt
                updatedAt
                accessToken
                meLiked {
                    memberId
                    likeRefId
                    myFavorite
                }
                meFollowed {
                    followingId
                    followerId
                    myFollowing
                }
            }
            # ✅ These fields are required by the backend schema
            fuelType
            transmissionType
            carCondition
            carColor
            model
            carMileage
        }
        metaCounter {
            total
        }
    }
}
`;


