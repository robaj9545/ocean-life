import React, { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator, LogBox } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './src/services/supabase'
import { economyService } from './src/services/economyService'
import { fishService } from './src/services/fishService'
import { statsService } from './src/services/statsService'
import { useGameStore } from './src/store/useGameStore'
import { calculateOfflineProgress } from './src/utils/time'

import AquariumScreen from './src/screens/AquariumScreen'
import LoginScreen from './src/screens/LoginScreen'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  // Ignore multiple instances of Three.js warning usually caused by generic Expo setup
  useEffect(() => {
    LogBox.ignoreLogs(['THREE.WARNING: Multiple instances of Three.js being imported.']);
  }, []);

  useEffect(() => {
    const loadData = async (session: any) => {
      setSession(session);
      if (session?.user) {
        const [economy, fishesObj, deadFishesObj, statsObj] = await Promise.all([
          economyService.loadEconomy(),
          fishService.loadFishes(),
          fishService.loadDeadFishes(),
          statsService.loadStats()
        ]);
        
        if (economy.data) {
          // Load lastSaved from AsyncStorage
          const lastSavedStr = await AsyncStorage.getItem('@last_saved_time');
          const localLastSaved = lastSavedStr ? parseInt(lastSavedStr) : Date.now();
          
          useGameStore.setState({ 
            coins: economy.data.coins !== null ? economy.data.coins : 500, 
            foodAmount: economy.data.foodAmount !== null ? economy.data.foodAmount : 50,
            level: economy.data.level || 1,
            xp: economy.data.xp || 0,
            fishes: fishesObj.data || [],
            deadFishes: deadFishesObj.data || [],
            lastSaved: localLastSaved
          });
          
          if (statsObj.data) {
             useGameStore.getState().setStatsData({
               stats: statsObj.data.stats,
               claimedMissions: statsObj.data.claimedMissions,
               dailyProgress: statsObj.data.dailyProgress,
               lastDailyReset: statsObj.data.lastDailyReset || Date.now()
             });
             useGameStore.getState().checkDailyReset();
          }
          // Remove dead fishes older than 30 days
          useGameStore.getState().cleanupDeadFishes();
          
          const { coins: offlineCoins } = calculateOfflineProgress(localLastSaved);
          if (offlineCoins > 0) {
            useGameStore.getState().addCoins(Math.floor(offlineCoins));
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
