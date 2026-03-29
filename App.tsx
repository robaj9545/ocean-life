import React, { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { supabase } from './src/services/supabase'
import { economyService } from './src/services/economyService'
import { fishService } from './src/services/fishService'
import { useGameStore } from './src/store/useGameStore'
import { calculateOfflineProgress } from './src/utils/time'

import AquariumScreen from './src/screens/AquariumScreen'
import LoginScreen from './src/screens/LoginScreen'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const loadData = async (session: any) => {
      setSession(session);
      if (session?.user) {
        const [economy, fishesObj, deadFishesObj] = await Promise.all([
          economyService.loadEconomy(),
          fishService.loadFishes(),
          fishService.loadDeadFishes()
        ]);
        
        if (economy.data) {
          useGameStore.setState({ 
            coins: economy.data.coins !== null ? economy.data.coins : 500, 
            foodAmount: economy.data.foodAmount !== null ? economy.data.foodAmount : 50,
            level: economy.data.level || 1,
            xp: economy.data.xp || 0,
            fishes: fishesObj.data || [],
            deadFishes: deadFishesObj.data || []
          });
          // Remove dead fishes older than 30 days
          useGameStore.getState().cleanupDeadFishes();
          
          if (economy.data?.lastSaved) {
            const { coins: offlineCoins } = calculateOfflineProgress(economy.data.lastSaved);
            if (offlineCoins > 0) {
              useGameStore.getState().addCoins(Math.floor(offlineCoins));
            }
          }
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
    <View style={{ flex: 1, backgroundColor: '#002244' }}>
      {session && session.user ? (
        <AquariumScreen />
      ) : (
        <LoginScreen />
      )}
    </View>
  )
}
