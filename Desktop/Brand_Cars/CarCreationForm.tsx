import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const CREATE_CAR = gql`
  mutation CreateCar($input: CarInput!) {
    createCar(input: $input) {
      _id
      carTitle
      brand
      model
      carPrice
      carCategory
      carLocation
      carAddress
      isForRent
      isBarterAvailable
      carDoors
      carSeats
      carYear
      carMileage
      carDesc
      carImages
      fuelType
      transmissionType
      carCondition
      carColor
      carTransactionType
    }
  }
`;

interface CarFormData {
  carTransactionType: string;
  carCategory: string;
  carLocation: string;
  carAddress: string;
  carTitle: string;
  brand: string;
  fuelType: string;
  transmissionType: string;
  carCondition: string;
  carColor: string;
  model: string; // ✅ ADDED MISSING FIELD
  carPrice: number;
  carYear: number;
  carSeats: number;
  carDoors: number;
  carMileage?: number;
  carImages: string[];
  carDesc?: string;
  isBarterAvailable: boolean;
  isForRent: boolean;
}

const CarCreationForm: React.FC = () => {
  const [formData, setFormData] = useState<CarFormData>({
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
    model: '', // ✅ ADDED MISSING FIELD - USER MUST FILL THIS
    carPrice: 400,
    carYear: 2024,
    carSeats: 2,
    carDoors: 2,
    carMileage: 200,
    carImages: ['uploads/car/b0b655a8-5415-4e3e-a73d-8bdaf4f3dcd1.jpg'],
    carDesc: 'this is fastest car ever seen',
    isBarterAvailable: false,
    isForRent: true,
  });

  const [createCar, { loading, error }] = useMutation(CREATE_CAR);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createCar({
        variables: {
          input: formData
        }
      });
      console.log('Car created successfully:', result.data.createCar);
      alert('Car created successfully!');
    } catch (err) {
      console.error('Error creating car:', err);
      alert('Error creating car. Please check the console for details.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Car Listing</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type *
            </label>
            <select
              name="carTransactionType"
              value={formData.carTransactionType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="RENT">Rent</option>
              <option value="LOAN">Loan</option>
              <option value="BUY">Buy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="carCategory"
              value={formData.carCategory}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="SEDAN">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="COUPE">Coupe</option>
              <option value="LUXURY">Luxury</option>
              <option value="HATCHBACK">Hatchback</option>
              <option value="TRUCK">Truck</option>
            </select>
          </div>
        </div>

        {/* Brand and Model - CRITICAL FIX */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="TOYOTA">Toyota</option>
              <option value="BMW">BMW</option>
              <option value="MERCEDES">Mercedes</option>
              <option value="AUDI">Audi</option>
              <option value="VOLKSWAGEN">Volkswagen</option>
              <option value="HONDA">Honda</option>
              <option value="NISSAN">Nissan</option>
              <option value="HYUNDAI">Hyundai</option>
              <option value="KIA">Kia</option>
              <option value="FORD">Ford</option>
              <option value="CHEVROLET">Chevrolet</option>
              <option value="LEXUS">Lexus</option>
              <option value="PORSCHE">Porsche</option>
              <option value="LAMBORGHINI">Lamborghini</option>
              <option value="FERRARI">Ferrari</option>
              <option value="BENTLEY">Bentley</option>
              <option value="ROLLS_ROYCE">Rolls Royce</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model * <span className="text-red-500">(REQUIRED)</span>
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              placeholder="e.g., Civic, 3 Series, Model S"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type *
            </label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="GASOLINE">Gasoline</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Electric</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transmission *
            </label>
            <select
              name="transmissionType"
              value={formData.transmissionType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="AUTOMATIC">Automatic</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition *
            </label>
            <select
              name="carCondition"
              value={formData.carCondition}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="NEW">New</option>
              <option value="USED">Used</option>
              <option value="CERTIFIED_PRE_OWNED">Certified Pre-owned</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color *
            </label>
            <select
              name="carColor"
              value={formData.carColor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="WHITE">White</option>
              <option value="BLACK">Black</option>
              <option value="SILVER">Silver</option>
              <option value="GRAY">Gray</option>
              <option value="RED">Red</option>
              <option value="BLUE">Blue</option>
              <option value="GREEN">Green</option>
              <option value="YELLOW">Yellow</option>
              <option value="BROWN">Brown</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Location and Address */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <select
              name="carLocation"
              value={formData.carLocation}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="LOS_ANGELES">Los Angeles</option>
              <option value="PARIS">Paris</option>
              <option value="BARCELONA">Barcelona</option>
              <option value="TOKYO">Tokyo</option>
              <option value="DUBAI">Dubai</option>
              <option value="NEW_YORK">New York</option>
              <option value="MUNICH">Munich</option>
              <option value="SHANGHAI">Shanghai</option>
              <option value="RIO_DE_JANEIRO">Rio de Janeiro</option>
              <option value="SEOUL">Seoul</option>
              <option value="LONDON">London</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              name="carAddress"
              value={formData.carAddress}
              onChange={handleInputChange}
              placeholder="Street address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Car Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="carTitle"
              value={formData.carTitle}
              onChange={handleInputChange}
              placeholder="Car title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              name="carPrice"
              value={formData.carPrice}
              onChange={handleInputChange}
              placeholder="Price"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="number"
              name="carYear"
              value={formData.carYear}
              onChange={handleInputChange}
              placeholder="Year"
              min="1900"
              max="2030"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mileage
            </label>
            <input
              type="number"
              name="carMileage"
              value={formData.carMileage || ''}
              onChange={handleInputChange}
              placeholder="Mileage"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seats *
            </label>
            <input
              type="number"
              name="carSeats"
              value={formData.carSeats}
              onChange={handleInputChange}
              placeholder="Number of seats"
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doors *
            </label>
            <input
              type="number"
              name="carDoors"
              value={formData.carDoors}
              onChange={handleInputChange}
              placeholder="Number of doors"
              min="1"
              max="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="carDesc"
            value={formData.carDesc || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, carDesc: e.target.value }))}
            placeholder="Car description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isForRent"
              checked={formData.isForRent}
              onChange={(e) => setFormData(prev => ({ ...prev, isForRent: e.target.checked }))}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Available for Rent</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isBarterAvailable"
              checked={formData.isBarterAvailable}
              onChange={(e) => setFormData(prev => ({ ...prev, isBarterAvailable: e.target.checked }))}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Barter Available</label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !formData.model} // Disable if model is empty
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading || !formData.model
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading ? 'Creating...' : 'Create Car Listing'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error.message}
          </div>
        )}

        {/* Success Message */}
        {!error && !loading && formData.model && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            ✅ All required fields are filled. Form is ready to submit!
          </div>
        )}
      </form>
    </div>
  );
};

export default CarCreationForm;








