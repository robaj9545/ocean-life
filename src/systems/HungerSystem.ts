import { useGameStore } from '../store/useGameStore';

export const HungerSystem = (entities: any, { time }: any) => {
  const dt = time.delta || 16;
  // Decrease hunger very slowly (e.g. 1 point every 2 seconds)
  const hungerDropRate = 1 / 2000;

  Object.values(entities).forEach((e: any) => {
    if (e.type === 'fish') {
      e.hunger = Math.max(0, e.hunger - hungerDropRate * dt);
      
      // If starving, lose happiness
      if (e.hunger < 30) {
        e.happiness = Math.max(0, e.happiness - (hungerDropRate * dt * 2));
      }

      // Segredos do Mar mechanics: Lose      // If completely full, hunger = 100, no health drops. 
      // User requested exactly 1 hour for a starved fish's health to go from 100 to 0.
      // 1 hour = 3600000 ms.
      // Health drop per ms = 100 / 3600000 = 0.00002777...
      const hourlyHealthDropRate = (100 / 3600000);

      if (e.hunger === 0) {
        e.health = Math.max(0, (e.health || 100) - (hourlyHealthDropRate * dt)); 
        if (e.health === 0) {
          delete entities[e.id];
          useGameStore.getState().killFish(e.id);
        }
      } else {
        // Regenerate health slowly if fed
        if (e.hunger > 50 && (e.health || 100) < 100) {
          e.health = Math.min(100, e.health + hungerDropRate * dt);
        }
      }
    }
  });

  return entities;
}
