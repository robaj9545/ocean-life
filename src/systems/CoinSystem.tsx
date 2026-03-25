import React from 'react'
import Coin from '../components/Coin'

export const CoinSystem = (entities: any, { time }: any) => {
  // Chance to spawn coin occasionally per fish
  Object.values(entities).forEach((e: any) => {
    if (e.type === 'fish') {
      if (e.happiness > 70 && Math.random() < 0.001) { // Very rare per frame
        const coinId = 'coin_' + Math.random();
        entities[coinId] = {
          id: coinId,
          type: 'coin',
          value: 10 + Math.floor(e.happiness / 10),
          position: { x: e.position.x, y: e.position.y },
          renderer: <Coin />
        }
      }
    }
  });

  // Fall logic for coins
  Object.keys(entities).forEach((k: any) => {
    const e = entities[k];
    if (e.type === 'coin') {
      e.position.y += 1;
      if (e.position.y > 800) {
        delete entities[k];
      }
    }
  });

  return entities;
}
