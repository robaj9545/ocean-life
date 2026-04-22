import { LinearGradient } from 'expo-linear-gradient'
import { Backpack, CheckSquare, Coins, Drumstick, Heart, ShoppingCart } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import {
  Modal,
  Platform,
  StyleSheet,
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
import { scale, verticalScale, spacing, radius, iconSize } from '../utils/responsive'

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
    const sellPrice = useGameStore.getState().getSellPrice(selectedFish)
    addCoins(sellPrice)
    useGameStore.getState().removeFish(selectedFish.id)
    setSelectedFish(null)
  }

  // Responsive HUD positions
  const hudTop = Platform.OS === 'ios' ? verticalScale(48) : verticalScale(32)
  const sideNavTop = hudTop + verticalScale(52)

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
        style={[StyleSheet.absoluteFillObject, { height: windowHeight * 0.28 }]}
      />

      {/* Bottom vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(0,5,20,0.7)']}
        style={[StyleSheet.absoluteFillObject, { top: windowHeight * 0.72 }]}
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
      <View style={[styles.topHud, { top: hudTop, left: spacing.md, right: spacing.md }]}>
        {/* Left: coins + food */}
        <View style={{ gap: spacing.sm }}>
          <CurrencyChip
            icon={<Coins color="#FFD700" size={iconSize.sm} strokeWidth={2.5} />}
            value={coins}
            color="#FFD700"
            onAdd={() => setActiveModal('Shop')}
          />
          <CurrencyChip
            icon={<Drumstick color="#FF8C00" size={iconSize.sm} strokeWidth={2.5} />}
            value={foodAmount}
            color="#FF8C00"
            onAdd={() => setActiveModal('Shop')}
          />
        </View>

        {/* Right: level badge */}
        <LevelBadge level={level} xp={xp} onPress={() => setActiveModal('Profile')} />
      </View>

      {/* ── SIDE NAV (right rail) ── */}
      <View style={[styles.sideNav, { right: spacing.md, top: sideNavTop, bottom: spacing.xl }]}>
        <NavButton
          icon={<ShoppingCart color="#00E5FF" size={iconSize.md} strokeWidth={2} />}
          label="Loja"
          onPress={() => setActiveModal('Shop')}
          accent="#00E5FF"
        />
        <NavButton
          icon={<Backpack color="#B29DFF" size={iconSize.md} strokeWidth={2} />}
          label="Mochila"
          onPress={() => setActiveModal('Inventory')}
          accent="#B29DFF"
        />
        <NavButton
          icon={<Heart color="#FF6B9D" size={iconSize.md} strokeWidth={2} />}
          label="Criadouro"
          onPress={() => setActiveModal('Breeding')}
          accent="#FF6B9D"
        />
        <NavButton
          icon={<CheckSquare color="#00E5A0" size={iconSize.md} strokeWidth={2} />}
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
              <View style={[styles.modalContent, { width: '95%', maxWidth: scale(780), maxHeight: '90%', flex: 1, marginVertical: '5%' }]}>
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
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden'
  },
  sideNav: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: 10,
  },
})
