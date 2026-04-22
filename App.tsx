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
import { AlertProvider } from './src/components/ui/Alert'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [offlineSummary, setOfflineSummary] = useState<{ coins: number; deaths: number; grown: number } | null>(null)

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
          
          const loadedFishes = fishesObj.data || [];
          
          // BUG #5 FIX: Full offline progress calculation including hunger, death, growth
          const offlineResult = calculateOfflineProgress(localLastSaved, loadedFishes);
          
          // Apply offline updates to fishes
          const survivingFishes = offlineResult.updatedFishes.filter(
            f => !offlineResult.deaths.includes(f.id)
          );
          
          // Build dead fish list from offline deaths
          const newDeadFishes = offlineResult.updatedFishes
            .filter(f => offlineResult.deaths.includes(f.id))
            .map(f => ({ ...f, deathTime: Date.now() }));

          const allDeadFishes = [...(deadFishesObj.data || []), ...newDeadFishes];

          // Count fish that grew to adult during offline
          const grownCount = loadedFishes.filter(
            (f, i) => f.stage === 'baby' && offlineResult.updatedFishes[i]?.stage === 'adult'
          ).length;

          useGameStore.setState({ 
            coins: (economy.data.coins !== null ? economy.data.coins : 500) + Math.floor(offlineResult.coins), 
            foodAmount: economy.data.foodAmount !== null ? economy.data.foodAmount : 50,
            level: economy.data.level || 1,
            xp: economy.data.xp || 0,
            fishes: survivingFishes,
            deadFishes: allDeadFishes,
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
          
          // Show offline summary if player was away for > 5 minutes
          const offlineMinutes = (Date.now() - localLastSaved) / (1000 * 60);
          if (offlineMinutes > 5 && (offlineResult.coins > 1 || offlineResult.deaths.length > 0 || grownCount > 0)) {
            setOfflineSummary({
              coins: Math.floor(offlineResult.coins),
              deaths: offlineResult.deaths.length,
              grown: grownCount,
            });
            // Auto-dismiss after 5 seconds
            setTimeout(() => setOfflineSummary(null), 5000);
          }

          // Save the new state after applying offline progress
          useGameStore.getState().pushToCloud();
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
    <AlertProvider>
      <View style={{ flex: 1, backgroundColor: '#002244' }}>
        {session && session.user ? (
          <>
            <AquariumScreen />
            {/* Offline summary banner */}
            {offlineSummary && (
              <View style={{
                position: 'absolute',
                top: 80,
                left: 20,
                right: 20,
                backgroundColor: 'rgba(0,30,60,0.95)',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: 'rgba(0,229,255,0.3)',
                zIndex: 999,
                gap: 6,
              }}>
                <Text style={{ color: '#00E5FF', fontWeight: '900', fontSize: 14 }}>
                  🌊 Enquanto você esteve fora...
                </Text>
                {offlineSummary.coins > 0 && (
                  <Text style={{ color: '#FFD700', fontWeight: '700', fontSize: 12 }}>
                    💰 +{offlineSummary.coins.toLocaleString()} moedas coletadas
                  </Text>
                )}
                {offlineSummary.grown > 0 && (
                  <Text style={{ color: '#00E5A0', fontWeight: '700', fontSize: 12 }}>
                    🐟 {offlineSummary.grown} peixe(s) cresceram para adulto!
                  </Text>
                )}
                {offlineSummary.deaths > 0 && (
                  <Text style={{ color: '#FF6B6B', fontWeight: '700', fontSize: 12 }}>
                    💀 {offlineSummary.deaths} peixe(s) morreram de fome...
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <LoginScreen />
        )}
      </View>
    </AlertProvider>
  )
}
