import { registerEnumType } from '@nestjs/graphql';

export enum CarTransactionType {
  RENT = 'RENT',
  LOAN = 'LOAN',
  BUY = 'BUY',
}
registerEnumType(CarTransactionType, {
  name: 'CarTransactionType',
});

export enum CarCategory{
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  COUPE = 'COUPE',
  LUXURY = 'LUXURY',
  HATCHBACK = 'HATCHBACK',
  TRUCK = 'TRUCK',
}
registerEnumType(CarCategory, {
  name: 'CarCategory',
});

export enum CarStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  UNAVAILABLE = 'UNAVAILABLE',
}
registerEnumType(CarStatus, {
  name: 'CarStatus',
});

export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
}
registerEnumType(FuelType, {
  name: 'FuelType',
});

export enum TransmissionType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}
registerEnumType(TransmissionType, {
  name: 'TransmissionType',
});

export enum CarLocation {
	LOS_ANGELES = 'Los Angeles',
	PARIS = 'Paris',
	BARCELONA = 'Barcelona',
	TOKYO = 'Tokyo',
	DUBAI = 'Dubai',
	NEW_YORK = 'New York',
	MUNICH = 'Munich',
	SHANGHAI = 'Shanghai',
	RIO_DE_JANEIRO = 'Rio de Janeiro',
	SEOUL = 'Seoul',
	LONDON = 'London',
  }
  registerEnumType(CarLocation, {
	name: 'CarLocation',
  });

export enum CarCondition {
  NEW = 'NEW',
  USED = 'USED',
  CERTIFIED_PRE_OWNED = 'CERTIFIED_PRE_OWNED',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
}
registerEnumType(CarCondition, {
  name: 'CarCondition',
});

export enum CarColor {
  WHITE = 'WHITE',
  BLACK = 'BLACK',
  SILVER = 'SILVER',
  GRAY = 'GRAY',
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  BROWN = 'BROWN',
  OTHER = 'OTHER',
}
registerEnumType(CarColor, {
  name: 'CarColor',
});

export enum CarBrand {
  TOYOTA = 'TOYOTA',
  BMW = 'BMW',
  MERCEDES = 'MERCEDES',
  AUDI = 'AUDI',
  VOLKSWAGEN = 'VOLKSWAGEN',
  HONDA = 'HONDA',
  NISSAN = 'NISSAN',
  HYUNDAI = 'HYUNDAI',
  KIA = 'KIA',
  FORD = 'FORD',
  CHEVROLET = 'CHEVROLET',
  LEXUS = 'LEXUS',
  PORSCHE = 'PORSCHE',
  LAMBORGHINI = 'LAMBORGHINI',
  FERRARI = 'FERRARI',
  BENTLEY = 'BENTLEY',
  ROLLS_ROYCE = 'ROLLS_ROYCE',
  OTHER = 'OTHER',
}
registerEnumType(CarBrand, {
  name: 'CarBrand',
});
  