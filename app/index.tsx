import React, { useEffect } from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import AppNavigator from '../src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    console.log('App: index.tsx loaded');
  }, []);

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
