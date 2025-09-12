import React from 'react';
import CarCreationForm from './CarCreationForm';
import { ApolloProvider } from './ApolloProvider';

const App: React.FC = () => {
  return (
    <ApolloProvider>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Brand Cars - Car Listing Platform
          </h1>
          <CarCreationForm />
        </div>
      </div>
    </ApolloProvider>
  );
};

export default App;








