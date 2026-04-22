import React, { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator, LogBox, Platform, AppState } from 'react-native'
import { setStatusBarHidden } from 'expo-status-bar'
import * as NavigationBar from 'expo-navigation-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './src/services/supabase'
import { economyService } from './src/services/economyService'
import { fishService } from './src/services/fishService'
import { statsService } from './src/services/statsService'
import { useGameStore } from './src/store/useGameStore'
import { calculateOfflineProgress } from './src/utils/time'
import { Coins, Fish, Skull, Waves } from 'lucide-react-native'

import AquariumScreen from './src/screens/AquariumScreen'
import LoginScreen from './src/screens/LoginScreen'
import { AlertProvider } from './src/components/ui/Alert'
import { scale, fonts, spacing, radius, iconSize } from './src/utils/responsive'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [offlineSummary, setOfflineSummary] = useState<{ coins: number; deaths: number; grown: number } | null>(null)

  // ─── Immersive Mode: Hide system bars ──────────────────────────────────────
  useEffect(() => {
    const hideSystemBars = () => {
      // Hide status bar using expo-status-bar imperative API (works in Expo Go)
      setStatusBarHidden(true, 'fade')
      
      // Hide Android navigation bar (bottom bar with back/home/recent)
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('hidden')
      }
    }

    hideSystemBars()

    // Re-hide bars when app returns from background (they reappear after multitasking)
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        hideSystemBars()
      }
    })

    return () => subscription.remove()
  }, [])

  // Suppress non-actionable warnings (Three.js internals + edge-to-edge deprecations)
  useEffect(() => {
    LogBox.ignoreLogs([
      'THREE.WARNING: Multiple instances of Three.js being imported.',
      'THREE.THREE.Clock: This module has been deprecated',
      'THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated',
      '`setBehaviorAsync` is not supported',
      '`setBackgroundColorAsync` is not supported',
    ]);
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
        <Text style={{ color: '#fff', marginTop: spacing.md, fontWeight: 'bold', fontSize: fonts.base }}>Conectando Fundo do Mar...</Text>
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
                top: spacing.xxxl,
                left: spacing.xl,
                right: spacing.xl,
                backgroundColor: 'rgba(0,30,60,0.95)',
                borderRadius: radius.lg,
                padding: spacing.lg,
                borderWidth: 1,
                borderColor: 'rgba(0,229,255,0.3)',
                zIndex: 999,
                gap: spacing.xs,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Waves color="#00E5FF" size={iconSize.md} strokeWidth={2} />
                  <Text style={{ color: '#00E5FF', fontWeight: '900', fontSize: fonts.base }}>
                    Enquanto você esteve fora...
                  </Text>
                </View>
                {offlineSummary.coins > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Coins color="#FFD700" size={iconSize.sm} strokeWidth={2} />
                    <Text style={{ color: '#FFD700', fontWeight: '700', fontSize: fonts.sm }}>
                      +{offlineSummary.coins.toLocaleString()} moedas coletadas
                    </Text>
                  </View>
                )}
                {offlineSummary.grown > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Fish color="#00E5A0" size={iconSize.sm} strokeWidth={2} />
                    <Text style={{ color: '#00E5A0', fontWeight: '700', fontSize: fonts.sm }}>
                      {offlineSummary.grown} peixe(s) cresceram para adulto!
                    </Text>
                  </View>
                )}
                {offlineSummary.deaths > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Skull color="#FF6B6B" size={iconSize.sm} strokeWidth={2} />
                    <Text style={{ color: '#FF6B6B', fontWeight: '700', fontSize: fonts.sm }}>
                      {offlineSummary.deaths} peixe(s) morreram de fome...
                    </Text>
                  </View>
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
