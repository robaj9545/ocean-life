import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import AquariumScreen from './src/screens/AquariumScreen'
import ShopScreen from './src/screens/ShopScreen'
import InventoryScreen from './src/screens/InventoryScreen'
import BreedingScreen from './src/screens/BreedingScreen'
import ProfileScreen from './src/screens/ProfileScreen'

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator id={undefined} screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1ca3ec' }}>
        <Tab.Screen name="Aquarium" component={AquariumScreen} options={{ tabBarLabel: 'Aquário' }} />
        <Tab.Screen name="Shop" component={ShopScreen} options={{ tabBarLabel: 'Loja' }} />
        <Tab.Screen name="Inventory" component={InventoryScreen} options={{ tabBarLabel: 'Inventário' }} />
        <Tab.Screen name="Breeding" component={BreedingScreen} options={{ tabBarLabel: 'Cruzar' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
