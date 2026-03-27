import React from 'react'
import { TouchableOpacity, Text, Dimensions } from 'react-native'
import { useGameStore } from '../store/useGameStore'

const { height } = Dimensions.get('window')

export const CoinSystem = (entities: any, { time }: any) => {
  // Chance to spawn coin occasionally per fish
  Object.values(entities).forEach((e: any) => {
    if (e.type === 'fish') {
      if (e.happiness > 70 && e.stage === 'adult' && Math.random() < 0.001) { // Very rare per frame, only adults
        const coinId = 'coin_' + Math.random();
        const coinValue = 10 + Math.floor(e.happiness / 10);
        const coinPosition = { x: e.position.x, y: e.position.y };

        entities[coinId] = {
          id: coinId,
          type: 'coin',
          value: coinValue,
          position: coinPosition,
          renderer: (
             <TouchableOpacity style={{ position: 'absolute', left: coinPosition.x - 15, top: coinPosition.y - 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', zIndex: 10 }} onPress={() => {
                useGameStore.getState().addCoins(coinValue);
                useGameStore.getState().addXp(coinValue * 2); // Grind XP!
                delete entities[coinId];
             }}>
               <Text style={{ fontSize: 24, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>🪙</Text>
             </TouchableOpacity>
            )
        }
      }
    }
  });

  // Fall logic for coins
  Object.keys(entities).forEach((k: any) => {
    const e = entities[k];
    if (e.type === 'coin') {
      e.position.y += 1;
      // Clear coin when it falls past the screen height
      if (e.position.y > height + 50) {
        delete entities[k];
      }
    }
  });

  return entities;
}
