import React from 'react'
import { useGameStore, FishEntity } from '../store/useGameStore'
import Fish from '../components/Fish'

let timer = 0;

export const SyncSystem = (entities: any, { time }: any) => {
  const dt = time.delta || 16;
  timer += dt;

  // Hydrate Store -> Engine (For suddenly bought or hatched fishes)
  if (timer % 1000 < dt) {
    const storeFishes = useGameStore.getState().fishes;
    storeFishes.forEach(fish => {
      if (!entities[fish.id]) {
        entities[fish.id] = { ...fish, renderer: <Fish /> };
      }
    });
  }

  // Sync Engine -> Store (Save game state) every 5 secs
  if (timer > 5000) {
    timer = 0;
    
    const fishes: FishEntity[] = [];
    Object.values(entities).forEach((e: any) => {
      if (e.type === 'fish') {
        fishes.push({
          id: e.id,
          type: 'fish',
          species: e.species,
          rarity: e.rarity,
          color: e.color,
          size: e.size,
          speed: e.speed,
          hunger: e.hunger,
          happiness: e.happiness,
          age: e.age,
          position: e.position,
          direction: e.direction
        });
      }
    });

    useGameStore.getState().updateFishes(() => fishes);
    useGameStore.getState().saveTimestamp();
  }

  return entities;
}
