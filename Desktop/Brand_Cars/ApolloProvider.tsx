import React from 'react';
import { ApolloProvider as ApolloClientProvider } from '@apollo/client';
import client from './apollo-client';

interface ApolloProviderProps {
  children: React.ReactNode;
}

const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
  return (
    <ApolloClientProvider client={client}>
      {children}
    </ApolloClientProvider>
  );
};

export default ApolloProvider;
