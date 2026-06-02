import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, AuthContext } from './context/AuthContext';

import LoginScreen       from './screens/LoginScreen';
import HomeScreen        from './screens/HomeScreen';
import ScanScreen        from './screens/ScanScreen';
import ResultScreen      from './screens/ResultScreen';
import SpecialistsScreen from './screens/SpecialistsScreen';
import MedicinesScreen   from './screens/MedicinesScreen';
import DietScreen        from './screens/DietScreen';
import OralHygieneScreen from './screens/OralHygieneScreen';
import EmergencyScreen   from './screens/EmergencyScreen';
import HistoryScreen     from './screens/HistoryScreen';
import RiskScreen        from './screens/RiskScreen';
import HospitalFinderScreen from './screens/HospitalFinderScreen';
import ConsentScreen     from './screens/ConsentScreen';
import ChangePinScreen   from './screens/ChangePinScreen';

const Stack = createStackNavigator();

function RootNavigator() {
  const { workerId, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F0F4F8' },
        gestureEnabled: true,
      }}
    >
      {workerId == null ? (
        // --- AUTH STACK ---
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animationTypeForReplace: 'pop' }}
        />
      ) : (
        // --- MAIN APP STACK ---
        <>
          <Stack.Screen name="Home"         component={HomeScreen} />
          <Stack.Screen name="Consent"      component={ConsentScreen} />
          <Stack.Screen name="Scan"         component={ScanScreen} />
          <Stack.Screen name="Result"       component={ResultScreen} />
          <Stack.Screen name="Specialists"  component={SpecialistsScreen} />
          <Stack.Screen name="Medicines"    component={MedicinesScreen} />
          <Stack.Screen name="Diet"         component={DietScreen} />
          <Stack.Screen name="OralHygiene"  component={OralHygieneScreen} />
          <Stack.Screen name="Emergency"    component={EmergencyScreen} />
          <Stack.Screen name="History"      component={HistoryScreen} />
          <Stack.Screen name="Risk"         component={RiskScreen} />
          <Stack.Screen name="HospitalFinder" component={HospitalFinderScreen} />
          <Stack.Screen name="ChangePin"    component={ChangePinScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
