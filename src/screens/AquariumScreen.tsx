import { LinearGradient } from 'expo-linear-gradient'
import { Backpack, CheckSquare, Coins, Drumstick, Heart, ShoppingCart } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet, // can keep it for some fallbacks
  useWindowDimensions,
  View
} from 'react-native'
import AquariumScene3D from '../components/scene/AquariumScene3D'
import { useGameLoop } from '../hooks/useGameLoop'
import { useGameStore } from '../store/useGameStore'

import { ACHIEVEMENTS, DAILY_MISSIONS } from '../data/missions'
import BreedingScreen from './BreedingScreen'
import InventoryScreen from './InventoryScreen'
import MissionsScreen from './MissionsScreen'
import ProfileScreen from './ProfileScreen'
import ShopScreen from './ShopScreen'

// Modulos UI Importados
import { NavButton } from '../components/ui/Buttons'
import { FishPanel, HungryBubble, CoinBubble } from '../components/ui/Overlays'
import { CurrencyChip, LevelBadge } from '../components/ui/Stats'

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

  // Hungry + Coin tracking
  const hungryRefs = useRef<any>({})
  const [hungrySpots, setHungrySpots] = useState<any[]>([])
  const [coinSpots, setCoinSpots] = useState<any[]>([])

  useEffect(() => {
    const iv = setInterval(() => {
      const hSpots: any[] = []
      const cSpots: any[] = []
      for (const key in hungryRefs.current) {
        const ref = hungryRefs.current[key]
        if (ref?.isHungry) {
          hSpots.push({ id: key, ...ref })
        }
        if (ref?.hasCoin) {
          cSpots.push({ id: key, ...ref })
        }
      }
      setHungrySpots(hSpots)
      setCoinSpots(cSpots)
    }, 500) // PERF FIX: 500ms instead of 16ms
    return () => clearInterval(iv)
  }, [])

  const [activeModal, setActiveModal] = useState<'Shop' | 'Inventory' | 'Breeding' | 'Profile' | 'Missions' | null>(null)

  useGameLoop()

  const handleSellFish = () => {
    if (!selectedFish) return
    // GAMEPLAY FIX: Dynamic sell price based on rarity/stage/DNA
    const sellPrice = useGameStore.getState().getSellPrice(selectedFish)
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

      {/* Coin overlays — positioned above hungry if both present */}
      {coinSpots.map(spot => (
        <CoinBubble
          key={`coin_${spot.id}`}
          spot={spot}
          hasHungry={spot.isHungry}
          onCollect={() => {
            useGameStore.getState().collectCoinFromFish(spot.id)
            if (hungryRefs.current[spot.id]) {
              hungryRefs.current[spot.id].hasCoin = false
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
        
      </View>

      {/* ── FISH DETAIL PANEL ── */}
      {selectedFish && (
        <FishPanel
          fish={selectedFish}
          sellPrice={useGameStore.getState().getSellPrice(selectedFish)}
          onClose={() => setSelectedFish(null)}
          onSell={handleSellFish}
        />
      )}

      
      

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
    top: Platform.OS === 'ios' ? 100 : 80,
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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


















