import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text, ActivityIndicator } from 'react-native'
import { supabase } from './src/services/supabase'
import { economyService } from './src/services/economyService'
import { useGameStore } from './src/store/useGameStore'

import AquariumScreen from './src/screens/AquariumScreen'
import ShopScreen from './src/screens/ShopScreen'
import InventoryScreen from './src/screens/InventoryScreen'
import BreedingScreen from './src/screens/BreedingScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import LoginScreen from './src/screens/LoginScreen'

const Tab = createBottomTabNavigator();

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const loadData = async (session: any) => {
      setSession(session);
      if (session?.user) {
        const { data } = await economyService.loadEconomy();
        if (data) {
          useGameStore.setState({ 
            coins: data.coins !== null ? data.coins : 500, 
            level: data.level || 1,
            xp: data.xp || 0,
            fishes: data.fishes || [],
            deadFishes: data.dead_fishes || []
          });
          // Remove dead fishes older than 30 days
          useGameStore.getState().cleanupDeadFishes();
        }
      }
      setIsReady(true);
    };

    supabase.auth.getSession().then(({ data: { session } }) => loadData(session));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => loadData(session));
    
    return () => {
      authListener.subscription.unsubscribe();
    }
  }, [])

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#002244' }}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 15, fontWeight: 'bold' }}>Conectando Fundo do Mar...</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      {session && session.user ? (
        <Tab.Navigator id={undefined} screenOptions={{ headerShown: false, tabBarActiveTintColor: '#32CD32', tabBarStyle: { backgroundColor: '#f9f9f9' } }}>
          <Tab.Screen name="Aquarium" component={AquariumScreen} options={{ tabBarLabel: 'Aquário' }} />
          <Tab.Screen name="Shop" component={ShopScreen} options={{ tabBarLabel: 'Loja' }} />
          <Tab.Screen name="Inventory" component={InventoryScreen} options={{ tabBarLabel: 'Inventário' }} />
          <Tab.Screen name="Breeding" component={BreedingScreen} options={{ tabBarLabel: 'Cruzar' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
        </Tab.Navigator>
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  )
}
