import { LinearGradient } from 'expo-linear-gradient'
import { Backpack, ChevronUp, Coins, Drumstick, Heart, Plus, ShoppingCart, X, CheckSquare } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions, // can keep it for some fallbacks
  useWindowDimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import AquariumScene3D from '../components/scene/AquariumScene3D'
import { useGameLoop } from '../hooks/useGameLoop'
import { useGameStore } from '../store/useGameStore'

import BreedingScreen from './BreedingScreen'
import InventoryScreen from './InventoryScreen'
import ProfileScreen from './ProfileScreen'
import ShopScreen from './ShopScreen'
import MissionsScreen from './MissionsScreen'
import { DAILY_MISSIONS, ACHIEVEMENTS } from '../data/missions'

// Modulos UI Importados
import { StatBar, CurrencyChip, LevelBadge } from '../components/ui/Stats'
import { NavButton } from '../components/ui/Buttons'
import { FishPanel, HungryBubble } from '../components/ui/Overlays'

const { width, height } = Dimensions.get('window')

export default function AquariumScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const fishes = useGameStore(state => state.fishes)
  const coins = useGameStore(state => state.coins)
  const level = useGameStore(state => state.level)
  const xp = useGameStore(state => state.xp)
  const addCoins = useGameStore(state => state.addCoins)
  const consumeFood = useGameStore(state => state.consumeFood)
  const foodAmount = useGameStore(state => state.foodAmount)
  const stats = useGameStore(state => state.stats)
  const dailyProgress = useGameStore(state => state.dailyProgress)
  const claimedMissions = useGameStore(state => state.claimedMissions)
  const [selectedFish, setSelectedFish] = useState<any>(null)

  const pendingDailies = DAILY_MISSIONS.filter(m => !claimedMissions.includes(m.id) && (dailyProgress[m.action] || 0) >= m.targetAmount).length
  const pendingAchv = ACHIEVEMENTS.filter(m => !claimedMissions.includes(m.id) && (stats[m.action as keyof typeof stats] || 0) >= m.targetAmount).length
  const totalPending = pendingDailies + pendingAchv

  // Hungry tracking
  const hungryRefs = useRef<any>({})
  const [hungrySpots, setHungrySpots] = useState<any[]>([])

  useEffect(() => {
    const iv = setInterval(() => {
      const spots: any[] = []
      for (const key in hungryRefs.current) {
        if (hungryRefs.current[key]?.isHungry) {
          spots.push({ id: key, ...hungryRefs.current[key] })
        }
      }
      setHungrySpots(spots)
    }, 16)
    return () => clearInterval(iv)
  }, [])

  const [activeModal, setActiveModal] = useState<'Shop' | 'Inventory' | 'Breeding' | 'Profile' | 'Missions' | null>(null)

  useGameLoop()

  const handleSellFish = () => {
    if (!selectedFish) return
    const sellPrice = selectedFish.species === 'clownfish' ? 100 : 250
    addCoins(sellPrice)
    useGameStore.getState().removeFish(selectedFish.id)
    setSelectedFish(null)
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#020D1F' }}>
      {/* Ocean gradient background */}
      <LinearGradient
        colors={['#0A2A6E', '#0D4FA0', '#0A8AD0', '#05C4E8']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      {/* Subtle top vignette */}
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent']}
        style={[StyleSheet.absoluteFillObject, { height: height * 0.28 }]}
      />

      {/* Bottom vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(0,5,20,0.7)']}
        style={[StyleSheet.absoluteFillObject, { top: height * 0.72 }]}
      />

      {/* 3D scene */}
      <View style={StyleSheet.absoluteFillObject}>
        <AquariumScene3D setSelectedFish={setSelectedFish} hungryRefs={hungryRefs} />
      </View>

      {/* Hungry overlays */}
      {hungrySpots.map(spot => (
        <HungryBubble
          key={`hungry_${spot.id}`}
          spot={spot}
          onFeed={() => {
            if (consumeFood(1)) {
              useGameStore.getState().updateFishes(all =>
                all.map(f =>
                  f.id === spot.id
                    ? { ...f, hunger: Math.min(100, f.hunger + 50), happiness: Math.min(100, f.happiness + 20) }
                    : f,
                ),
              )
              hungryRefs.current[spot.id].isHungry = false
            }
          }}
        />
      ))}

      {/* ── TOP HUD ── */}
      <View style={styles.topHud}>
        {/* Left: coins + food */}
        <View style={{ gap: 8 }}>
          <CurrencyChip
            icon={<Coins color="#FFD700" size={15} strokeWidth={2.5} />}
            value={coins}
            color="#FFD700"
            onAdd={() => setActiveModal('Shop')}
          />
          <CurrencyChip
            icon={<Drumstick color="#FF8C00" size={15} strokeWidth={2.5} />}
            value={foodAmount}
            color="#FF8C00"
            onAdd={() => setActiveModal('Shop')}
          />
        </View>

        {/* Right: level badge */}
        <LevelBadge level={level} xp={xp} onPress={() => setActiveModal('Profile')} />
      </View>

      {/* ── SIDE NAV (right rail) ── */}
      <View style={styles.sideNav}>
        <NavButton
          icon={<ShoppingCart color="#00E5FF" size={18} strokeWidth={2} />}
          label="Loja"
          onPress={() => setActiveModal('Shop')}
          accent="#00E5FF"
        />
        <NavButton
          icon={<Backpack color="#B29DFF" size={18} strokeWidth={2} />}
          label="Mochila"
          onPress={() => setActiveModal('Inventory')}
          accent="#B29DFF"
        />
        <NavButton
          icon={<Heart color="#FF6B9D" size={18} strokeWidth={2} />}
          label="Criadouro"
          onPress={() => setActiveModal('Breeding')}
          accent="#FF6B9D"
        />
        <NavButton
          icon={<CheckSquare color="#00E5A0" size={18} strokeWidth={2} />}
          label="Missões"
          onPress={() => setActiveModal('Missions')}
          accent="#00E5A0"
          badge={totalPending}
        />
        {/* <NavButton
          icon={<Zap color="#FFD700" size={18} strokeWidth={2} />}
          label="Batalha"
          onPress={() => {}}
          accent="#FFD700"
        /> */}
      </View>

      {/* ── FISH DETAIL PANEL ── */}
      {selectedFish && (
        <FishPanel
          fish={selectedFish}
          onClose={() => setSelectedFish(null)}
          onSell={handleSellFish}
        />
      )}

      {/* ── FISH COUNT INDICATOR ── */}
      {/* {!selectedFish && (
        <View style={styles.fishCount}>
          <Text style={styles.fishCountText}>🐠 {fishes.length} peixes</Text>
        </View>
      )} */}

      {/* ── MODALS ── */}

      {activeModal && (
         <Modal transparent animationType="fade" visible={!!activeModal}>
           <View style={styles.modalBackdrop}>
              <View style={[styles.modalContent, { width: '95%', maxWidth: 800, maxHeight: '90%', flex: 1, marginVertical: '5%' }]}>
                {activeModal === 'Shop' && <ShopScreen onClose={() => setActiveModal(null)} />}
                {activeModal === 'Inventory' && <InventoryScreen onClose={() => setActiveModal(null)} />}
                {activeModal === 'Breeding' && <BreedingScreen onClose={() => setActiveModal(null)} />}
                {activeModal === 'Profile' && <ProfileScreen onClose={() => setActiveModal(null)} />}
                {activeModal === 'Missions' && <MissionsScreen onClose={() => setActiveModal(null)} />}
              </View>
           </View>
         </Modal>
       )}
      
    </View>
  )
}

const styles = StyleSheet.create({
  topHud: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'rgba(10, 30, 60, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden'
  },
  sideNav: {
    position: 'absolute',
    right: 14,
    top: height * 0.3,
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  fishCount: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 5,
  },
  fishCountText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  
  closePill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  closeX: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
})


















