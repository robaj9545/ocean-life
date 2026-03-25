import React, { useRef, useMemo, useEffect, useState } from 'react'
import { TouchableWithoutFeedback, TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native'
import { GameEngine } from 'react-native-game-engine'
import { LinearGradient } from 'expo-linear-gradient'
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

const { width, height } = Dimensions.get('window')

export default function AquariumScreen({ navigation }: any) {
  const engine = useRef<any>(null)
  
  const fishes = useGameStore(state => state.fishes)
  const coins = useGameStore(state => state.coins)
  const level = useGameStore(state => state.level)
  const xp = useGameStore(state => state.xp)
  const addCoins = useGameStore(state => state.addCoins)
  const [engineReady, setEngineReady] = useState(false)
  const [selectedFish, setSelectedFish] = useState<any>(null)

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
      {/* Background Gradient (Water) */}
      <LinearGradient colors={['#00BFFF', '#1E90FF', '#00008B']} style={StyleSheet.absoluteFillObject} />
      
      {/* Sand floor */}
      <View style={styles.sandFloor} />

      {/* Decorative Corals & Seaweed */}
      <Text style={[styles.decor, { left: 20, bottom: 40, fontSize: 60 }]}>🪸</Text>
      <Text style={[styles.decor, { right: 80, bottom: 30, fontSize: 50 }]}>🌿</Text>
      <Text style={[styles.decor, { left: 120, bottom: 20, fontSize: 40 }]}>🪨</Text>
      <Text style={[styles.decor, { right: 20, bottom: 60, fontSize: 55 }]}>🪸</Text>

      {/* Ambient Bubbles */}
      <View style={[styles.ambientBubble, { width: 40, height: 40, left: '20%', bottom: '30%' }]} />
      <View style={[styles.ambientBubble, { width: 25, height: 25, left: '50%', bottom: '50%' }]} />
      <View style={[styles.ambientBubble, { width: 60, height: 60, right: '15%', bottom: '60%' }]} />
      <View style={[styles.ambientBubble, { width: 15, height: 15, right: '40%', bottom: '20%' }]} />

      {/* UI Overlay: Segredos do Mar Top Bar */}
      <View style={styles.topHud}>
        <View style={styles.currencyBox}>
          <Text style={styles.gemIcon}>💰</Text>
          <Text style={styles.currencyText}>{Math.floor(coins)}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Shop')}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
        
        {/* Genuine Level & XP Bar */}
        <View style={styles.xpBox}>
          <Text style={styles.xpText}>Nível {level}</Text>
          <View style={styles.xpBarContainer}>
             <View style={[styles.xpBarFill, { width: `${Math.min(100, (xp / (level * 1000)) * 100)}%` }]} />
          </View>
          <Text style={styles.xpLabel}>{Math.floor(xp)}/{level * 1000} XP</Text>
        </View>
      </View>

      <TouchableWithoutFeedback
        onPress={(e) => {
          if (engine.current) {
            engine.current.dispatch({ 
              type: 'TAP', 
              payload: { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY } 
            })
          }
        }}
      >
        <View style={StyleSheet.absoluteFillObject}>
          {engineReady && (
            <GameEngine
              ref={engine}
              systems={[
                MovementSystem,
                HungerSystem,
                GrowthSystem,
                CoinSystem,
                CollisionSystem,
                SyncSystem,
                BreedingSystem,
                // Input Handler System
                (entities, { events }) => {
                  if (events) {
                    events.forEach((ev: any) => {
                      if (ev.type === 'TAP') {
                        const { x, y } = ev.payload

                        // 1. Check if tapped a coin
                        let trappedCoin = false
                        Object.keys(entities).forEach(k => {
                          const e = entities[k]
                          if (e.type === 'coin') {
                            const dx = e.position.x - x
                            const dy = e.position.y - y
                            if (Math.sqrt(dx*dx + dy*dy) < 40) {
                              addCoins(e.value)
                              delete entities[k]
                              trappedCoin = true
                            }
                          }
                        })

                        // 2. Check if tapped a fish (To show HUD info)
                        let tappedFish = false
                        if(!trappedCoin) {
                          Object.keys(entities).forEach(k => {
                            const e = entities[k]
                            if (e.type === 'fish') {
                              const dx = e.position.x - x
                              const dy = e.position.y - y
                              if (Math.sqrt(dx*dx + dy*dy) < e.size * 1.5) {
                                setSelectedFish(e)
                                tappedFish = true
                              }
                            }
                          })
                        }

                        // 3. Drop food if blank space
                        if (!trappedCoin && !tappedFish) {
                          setSelectedFish(null) // clear selection
                          const id = 'food_' + Math.random()
                          entities[id] = {
                            id,
                            type: 'food',
                            position: { x, y },
                            renderer: <Food position={{x, y}} />
                          }
                        }
                      } else if (ev.type === 'ADD_EGG') {
                         const id = 'egg_' + Math.random()
                         entities[id] = {
                            id,
                            type: 'egg',
                            fishData: ev.payload.fish,
                            incubationTime: 5000, 
                            position: { x: width / 2, y: height - 150 },
                            renderer: <Egg position={{x: width / 2, y: height - 150}}/>
                         }
                      } else if (ev.type === 'SELL_FISH') {
                         delete entities[ev.payload.id];
                      }
                    })
                  }
                  return entities
                }
              ]}
              entities={initialEntities}
            />
          )}
        </View>
      </TouchableWithoutFeedback>

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
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10
  },
  currencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 5,
    borderRadius: 20,
  },
  gemIcon: {
    fontSize: 20,
    marginRight: 5
  },
  currencyText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10
  },
  plusBtn: {
    backgroundColor: '#32CD32',
    borderRadius: 15,
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
  plusText: {
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 22
  },
  levelBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E90FF',
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18
  },
  xpBox: {
    marginLeft: 'auto',
    alignItems: 'flex-end'
  },
  xpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  xpBarContainer: {
    width: 100,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 2
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4
  },
  xpBar: {
    width: 120,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    marginLeft: -10,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingLeft: 15
  },
  xpFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#20B2AA' // LightSeaGreen
  },
  xpLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    zIndex: 1
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
  }
})
