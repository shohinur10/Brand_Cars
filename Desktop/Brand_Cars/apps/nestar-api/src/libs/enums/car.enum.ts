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
  name: 'CarBodyType',
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
  