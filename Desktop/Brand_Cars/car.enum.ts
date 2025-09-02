export enum CarTransactionType {
  RENT = 'RENT',
  LOAN = 'LOAN',
  BUY = 'BUY',
}

export enum CarCategory {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  COUPE = 'COUPE',
  LUXURY = 'LUXURY',
  HATCHBACK = 'HATCHBACK',
  TRUCK = 'TRUCK',
  // ❌ REMOVED: CAR = "CAR" - This doesn't exist in your backend
}

export enum CarStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum CarCondition {
  NEW = 'NEW',
  USED = 'USED',
  CERTIFIED_PRE_OWNED = 'CERTIFIED_PRE_OWNED',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
}

export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
}

export enum TransmissionType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}

export enum CarLocation {
  LOS_ANGELES = 'LOS_ANGELES',
  PARIS = 'PARIS',
  BARCELONA = 'BARCELONA',
  TOKYO = 'TOKYO',
  DUBAI = 'DUBAI',
  NEW_YORK = 'NEW_YORK',
  MUNICH = 'MUNICH',
  SHANGHAI = 'SHANGHAI',
  RIO_DE_JANEIRO = 'RIO_DE_JANEIRO',
  SEOUL = 'SEOUL',
  LONDON = 'LONDON',
  // ❌ REMOVED: CAR = "CAR" - This doesn't exist in your backend
}

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


