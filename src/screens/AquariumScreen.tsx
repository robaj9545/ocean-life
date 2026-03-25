import React, { useRef, useMemo, useEffect, useState } from 'react'
import { TouchableWithoutFeedback, View, Text, StyleSheet, Dimensions } from 'react-native'
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

export default function AquariumScreen() {
  const engine = useRef<any>(null)
  
  const fishes = useGameStore(state => state.fishes)
  const coins = useGameStore(state => state.coins)
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

      {/* UI Overlay: Segredos do Mar Top Bar */}
      <View style={styles.topHud}>
        <View style={styles.currencyBox}>
          <Text style={styles.gemIcon}>💎</Text>
          <Text style={styles.currencyText}>{Math.floor(coins)}</Text>
          <View style={styles.plusBtn}><Text style={styles.plusText}>+</Text></View>
        </View>

        <View style={styles.levelBox}>
          <View style={styles.levelCircle}><Text style={styles.levelText}>9</Text></View>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: '70%' }]} />
            <Text style={styles.xpLabel}>XP: 1450/2000</Text>
          </View>
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

      {/* Selected Fish Panel */}
      {selectedFish && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{selectedFish.species}</Text>
          <Text>Gênero: ♂️/♀️</Text>
          <Text>Fome: {Math.floor(selectedFish.hunger)}/100</Text>
          <Text>Felicidade: {Math.floor(selectedFish.happiness)}/100</Text>
          <Text>Moedas Intervalo: ~{(1000 - selectedFish.happiness*5)}ms</Text>
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
  panel: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 10,
    zIndex: 10,
    elevation: 5
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 5
  }
})
