import { CarInput } from './frontend-car-interfaces';

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
}

export const validateCarInput = (input: Partial<CarInput>): ValidationResult => {
  const missingFields: string[] = [];
  const errors: string[] = [];

  // Required fields that must be present
  const requiredFields: (keyof CarInput)[] = [
    'carTransactionType',
    'carCategory',
    'carLocation',
    'carAddress',
    'carTitle',
    'brand',
    'fuelType',
    'transmissionType',
    'carCondition',
    'carColor',
    'model', // ✅ CRITICAL: This was missing!
    'carPrice',
    'carYear',
    'carSeats',
    'carDoors',
    'carImages'
  ];

  // Check for missing required fields
  requiredFields.forEach(field => {
    if (!input[field]) {
      missingFields.push(field);
    }
  });

  // Validate specific field values
  if (input.carPrice && input.carPrice <= 0) {
    errors.push('Car price must be greater than 0');
  }

  if (input.carYear && (input.carYear < 1900 || input.carYear > 2030)) {
    errors.push('Car year must be between 1900 and 2030');
  }

  if (input.carSeats && (input.carSeats < 1 || input.carSeats > 10)) {
    errors.push('Car seats must be between 1 and 10');
  }

  if (input.carDoors && (input.carDoors < 1 || input.carDoors > 6)) {
    errors.push('Car doors must be between 1 and 6');
  }

  if (input.carMileage && input.carMileage < 0) {
    errors.push('Car mileage cannot be negative');
  }

  if (input.carImages && input.carImages.length === 0) {
    errors.push('At least one car image is required');
  }

  // Validate enum values
  const validTransactionTypes = ['RENT', 'LOAN', 'BUY'];
  if (input.carTransactionType && !validTransactionTypes.includes(input.carTransactionType)) {
    errors.push('Invalid transaction type');
  }

  const validCategories = ['SEDAN', 'SUV', 'COUPE', 'LUXURY', 'HATCHBACK', 'TRUCK'];
  if (input.carCategory && !validCategories.includes(input.carCategory)) {
    errors.push('Invalid car category');
  }

  const validFuelTypes = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'];
  if (input.fuelType && !validFuelTypes.includes(input.fuelType)) {
    errors.push('Invalid fuel type');
  }

  const validTransmissionTypes = ['AUTOMATIC', 'MANUAL'];
  if (input.transmissionType && !validTransmissionTypes.includes(input.transmissionType)) {
    errors.push('Invalid transmission type');
  }

  const validConditions = ['NEW', 'USED', 'CERTIFIED_PRE_OWNED', 'EXCELLENT', 'GOOD', 'FAIR'];
  if (input.carCondition && !validConditions.includes(input.carCondition)) {
    errors.push('Invalid car condition');
  }

  const validColors = ['WHITE', 'BLACK', 'SILVER', 'GRAY', 'RED', 'BLUE', 'GREEN', 'YELLOW', 'BROWN', 'OTHER'];
  if (input.carColor && !validColors.includes(input.carColor)) {
    errors.push('Invalid car color');
  }

  const validBrands = [
    'TOYOTA', 'BMW', 'MERCEDES', 'AUDI', 'VOLKSWAGEN', 'HONDA', 'NISSAN', 
    'HYUNDAI', 'KIA', 'FORD', 'CHEVROLET', 'LEXUS', 'PORSCHE', 'LAMBORGHINI', 
    'FERRARI', 'BENTLEY', 'ROLLS_ROYCE', 'OTHER'
  ];
  if (input.brand && !validBrands.includes(input.brand)) {
    errors.push('Invalid car brand');
  }

  const validLocations = [
    'LOS_ANGELES', 'PARIS', 'BARCELONA', 'TOKYO', 'DUBAI', 'NEW_YORK', 
    'MUNICH', 'SHANGHAI', 'RIO_DE_JANEIRO', 'SEOUL', 'LONDON'
  ];
  if (input.carLocation && !validLocations.includes(input.carLocation)) {
    errors.push('Invalid car location');
  }

  const isValid = missingFields.length === 0 && errors.length === 0;

  return {
    isValid,
    missingFields,
    errors
  };
};

// Helper function to create a complete car input object
export const createCompleteCarInput = (partialInput: Partial<CarInput>): CarInput => {
  // Default values for required fields
  const defaults: CarInput = {
    carTransactionType: 'RENT',
    carCategory: 'LUXURY',
    carLocation: 'MUNICH',
    carAddress: '123Street',
    carTitle: 'this is super nice car',
    brand: 'OTHER',
    fuelType: 'GASOLINE', // ✅ ADDED MISSING FIELD
    transmissionType: 'AUTOMATIC', // ✅ ADDED MISSING FIELD
    carCondition: 'NEW', // ✅ ADDED MISSING FIELD
    carColor: 'BLACK', // ✅ ADDED MISSING FIELD
    model: 'Civic', // ✅ ADDED MISSING FIELD - Set a default model
    carPrice: 400,
    carYear: 2024,
    carSeats: 2,
    carDoors: 2,
    carMileage: 200,
    carImages: ['uploads/car/b0b655a8-5415-4e3e-a73d-8bdaf4f3dcd1.jpg'],
    carDesc: 'this is fastest car ever seen',
    isBarterAvailable: false,
    isForRent: true,
  };

  // Merge with provided input
  return { ...defaults, ...partialInput };
};

// Example usage function
export const submitCarData = async (carData: Partial<CarInput>) => {
  // First validate the input
  const validation = validateCarInput(carData);
  
  if (!validation.isValid) {
    console.error('Validation failed:', validation);
    throw new Error(`Validation failed: Missing fields: ${validation.missingFields.join(', ')}. Errors: ${validation.errors.join(', ')}`);
  }

  // If validation passes, create complete input
  const completeInput = createCompleteCarInput(carData);
  
  console.log('Submitting car data:', completeInput);
  
  // Here you would make the actual API call
  // const result = await createCarMutation({ variables: { input: completeInput } });
  
  return completeInput;
};













