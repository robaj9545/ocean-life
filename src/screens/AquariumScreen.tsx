import React, { useRef, useMemo, useEffect, useState } from 'react'
import { TouchableWithoutFeedback, TouchableOpacity, View, Text, StyleSheet, Modal, Dimensions, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { GameEngine } from 'react-native-game-engine'
import { Coins, ShoppingCart, Backpack, Heart, X, Plus } from 'lucide-react-native'
import AquariumScene3D from '../components/scene/AquariumScene3D'
import { useGameStore } from '../store/useGameStore'
import { CoinSystem } from '../systems/CoinSystem'
import { CollisionSystem } from '../systems/CollisionSystem'
import { GrowthSystem } from '../systems/GrowthSystem'
import { HungerSystem } from '../systems/HungerSystem'
import { MovementSystem } from '../systems/MovementSystem'
import { SyncSystem } from '../systems/SyncSystem'
import { BreedingSystem } from '../systems/BreedingSystem'
import Fish from '../components/Fish'
import Food from '../components/Food'
import Coin from '../components/Coin'
import Egg from '../components/Egg'

// Import Modals (previously screens)
import ShopScreen from './ShopScreen'
import InventoryScreen from './InventoryScreen'
import BreedingScreen from './BreedingScreen'
import ProfileScreen from './ProfileScreen'

const { width, height } = Dimensions.get('window')

export default function AquariumScreen() {
  const engine = useRef<any>(null)
  
  const fishes = useGameStore(state => state.fishes)
  const coins = useGameStore(state => state.coins)
  const level = useGameStore(state => state.level)
  const xp = useGameStore(state => state.xp)
  const addCoins = useGameStore(state => state.addCoins)
  const [engineReady, setEngineReady] = useState(false)
  const [selectedFish, setSelectedFish] = useState<any>(null)
  
  // Navigation State
  const [activeModal, setActiveModal] = useState<'Shop' | 'Inventory' | 'Breeding' | 'Profile' | null>(null)

  // Initialize entities once for the game engine from persistent store
  const initialEntities = useMemo(() => {
    const e: any = {}
    fishes.forEach(fish => {
      e[fish.id] = { ...fish, renderer: <Fish /> }
    })
    return e
  }, [])

  useEffect(() => {
    setEngineReady(true)
  }, [])

  return (
    <View style={{ flex: 1 }}>
      {/* 2D VIBRANT TROPICAL OCEAN BACKGROUND */}
      <LinearGradient 
        colors={['#4facfe', '#00f2fe', '#0652DD']} 
        style={StyleSheet.absoluteFillObject} 
      />

      {/* 2.5D CANVAS LAYER */}
      <View style={StyleSheet.absoluteFillObject}>
        <AquariumScene3D setSelectedFish={setSelectedFish} />
      </View>

      {/* TOP HUD */}
      <View style={styles.topHud}>
        {/* LEFTSIDE: COINS */}
        <View style={styles.glassBox}>
          <Coins color="#FFD700" size={18} style={{ marginRight: 6 }} />
          <Text style={styles.currencyText}>{Math.floor(coins)}</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setActiveModal('Shop')}>
            <Plus color="#fff" size={16} strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* CENTER: NAV MENUS */}
        <View style={styles.topNavCenter}>
          <TouchableOpacity style={styles.navButton} onPress={() => setActiveModal('Shop')}>
            <ShoppingCart color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => setActiveModal('Inventory')}>
            <Backpack color="#fff" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => setActiveModal('Breeding')}>
            <Heart color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        {/* RIGHTSIDE: PROFILE */}
        <TouchableOpacity style={styles.glassBox} onPress={() => setActiveModal('Profile')}>
          <View style={styles.levelCircle}><Text style={styles.levelText}>{level}</Text></View>
          <View style={styles.xpInfo}>
             <Text style={styles.xpLabel}>NÍVEL {level}</Text>
             <View style={styles.xpBarContainer}>
               <View style={[styles.xpBarFill, { width: `${Math.min(100, (xp / (level * 1000)) * 100)}%` }]} />
             </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* INVISIBLE GAME ENGINE (For background logic like Hunger and Supabase syncing) */}
      <View style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }} pointerEvents="none">
        {engineReady && (
          <GameEngine
            ref={engine}
            systems={[HungerSystem, GrowthSystem, SyncSystem, BreedingSystem]}
            entities={initialEntities}
          />
        )}
      </View>

      {selectedFish && (
        <View style={styles.glassPanel}>
          <Text style={styles.panelTitle}>{selectedFish.species.toUpperCase()}</Text>
          <Text style={styles.panelSubtitle}>{selectedFish.stage === 'baby' ? 'Filhote' : 'Adulto'} ♂️/♀️</Text>
          
          {/* Health Bar */}
          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>Saúde</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { backgroundColor: '#ff4444', width: `${Math.floor(selectedFish.health || 100)}%` }]} />
            </View>
          </View>

          {/* Hunger Bar */}
          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>Fome</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { backgroundColor: '#ffb347', width: `${Math.floor(selectedFish.hunger)}%` }]} />
            </View>
          </View>

          {/* Happiness Bar */}
          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>Alegria</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { backgroundColor: '#ffdf00', width: `${Math.floor(selectedFish.happiness)}%` }]} />
            </View>
          </View>

          {selectedFish.stage === 'adult' && (
             <TouchableOpacity style={styles.premiumSellButton} onPress={() => {
                const sellPrice = selectedFish.species === 'clownfish' ? 100 : 250;
                addCoins(sellPrice);
                useGameStore.getState().removeFish(selectedFish.id);
                if (engine.current) {
                  engine.current.dispatch({ type: 'SELL_FISH', payload: { id: selectedFish.id } })
                }
                setSelectedFish(null);
             }}>
               <Text style={styles.sellButtonText}>VENDER 💰 {selectedFish.species === 'clownfish' ? 100 : 250}</Text>
             </TouchableOpacity>
          )}
        </View>
      )}

      {/* MODAL OVERLAYS */}
      {activeModal && (
        <Modal transparent animationType="fade" visible={!!activeModal}>
          <View style={styles.modalBackdrop}>
             <View style={styles.modalContent}>
               {activeModal === 'Shop' && <ShopScreen onClose={() => setActiveModal(null)} />}
               {activeModal === 'Inventory' && <InventoryScreen onClose={() => setActiveModal(null)} />}
               {activeModal === 'Breeding' && <BreedingScreen onClose={() => setActiveModal(null)} />}
               {activeModal === 'Profile' && <ProfileScreen onClose={() => setActiveModal(null)} />}
             </View>
          </View>
        </Modal>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  sandFloor: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
    backgroundColor: '#F4A460', // SandyBrown
    borderTopLeftRadius: 50,
    borderTopRightRadius: 70,
  },
  decor: {
    position: 'absolute',
    opacity: 0.9,
  },
  topHud: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 100,
    zIndex: 10
  },
  sunRay: {
    position: 'absolute',
    top: -100,
    width: 120,
    height: '150%',
    backgroundColor: '#fff',
    opacity: 0.08,
  },
  glassBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3
  },
  gemIcon: {
    fontSize: 16,
    marginRight: 4
  },
  currencyText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 1
  },
  addButton: {
    backgroundColor: '#32CD32',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff'
  },
  addText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18
  },
  levelCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFA500',
    marginRight: 8
  },
  levelText: {
    color: '#8B4513',
    fontWeight: '900',
    fontSize: 14
  },
  xpInfo: {
    justifyContent: 'center'
  },
  xpLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 0.5
  },
  xpBarContainer: {
    width: 80,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#32CD32',
    borderRadius: 4
  },
  topNavCenter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  ambientBubble: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassPanel: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
    marginBottom: 2
  },
  panelSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  barLabel: {
    width: 60,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555'
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 6
  },
  premiumSellButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#32CD32',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  sellButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeModalButton: {
    position: 'absolute',
    top: 25,
    right: 30,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3
  },
  closeModalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase'
  },
  modalContent: {
    width: '70%',
    height: '75%',
    backgroundColor: 'rgba(10, 30, 60, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden'
  }
})
