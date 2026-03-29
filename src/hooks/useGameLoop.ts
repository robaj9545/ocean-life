import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

export const useGameLoop = () => {
  const lastSaved = useGameStore(state => state.lastSaved);
  const lastTimeRef = useRef(lastSaved || Date.now());

  useEffect(() => {
    // Runs once a second to update slow-moving stats (Hunger, Health, Growth, Cloud Sync via debounce)
    const loopInterval = setInterval(() => {
      const now = Date.now();
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Allow dt to be up to 30 days for offline progress
      const simDt = Math.min(dt, 30 * 24 * 60 * 60 * 1000);

      const state = useGameStore.getState();
      const fishes = [...state.fishes];
      let hasUpdates = false;

      // Rates (scaled by simDt which is in ms)
      const hungerDropRate = 1 / 2000;
      const baseGrowthRate = 1 / 20000;
      const hourlyHealthDropRate = (100 / (3 * 3600 * 1000)); // 3 hours to drop 100 health

      for (let i = 0; i < fishes.length; i++) {
        let fish = { ...fishes[i] };
        let fishChanged = false;

        // --- Hunger System ---
        const previousHunger = fish.hunger;
        const hungerDrop = hungerDropRate * simDt;
        fish.hunger = Math.max(0, fish.hunger - hungerDrop);
        
        if (fish.hunger !== previousHunger) fishChanged = true;

        let timeAtZeroHunger = 0;
        if (fish.hunger === 0) {
            if (previousHunger === 0) {
                timeAtZeroHunger = simDt;
            } else {
                const timeToReachZero = previousHunger / hungerDropRate;
                timeAtZeroHunger = Math.max(0, simDt - timeToReachZero);
            }
        }

        if (fish.hunger < 30) {
           const newHappiness = Math.max(0, fish.happiness - (hungerDropRate * simDt * 2));
           if (newHappiness !== fish.happiness) {
              fish.happiness = newHappiness;
              fishChanged = true;
           }
        }

        if (timeAtZeroHunger > 0) {
          const healthDrop = hourlyHealthDropRate * timeAtZeroHunger;
          const newHealth = Math.max(0, (fish.health ?? 100) - healthDrop);
          if (newHealth !== fish.health) {
             fish.health = newHealth;
             fishChanged = true;
          }
          
          if (fish.health === 0) {
             setTimeout(() => useGameStore.getState().killFish(fish.id), 0);
             continue; // Rip
          }
        } else {
          // Regenerate health slowly if fed
          if (fish.hunger > 50 && (fish.health ?? 100) < 100) {
            const newHealth = Math.min(100, (fish.health ?? 100) + hungerDropRate * simDt);
            if (newHealth !== fish.health) {
               fish.health = newHealth;
               fishChanged = true;
            }
          }
        }

        // --- Growth System ---
        if (fish.stage !== 'adult') {
           const newAge = (fish.age || 0) + (baseGrowthRate * simDt);
           if (newAge !== fish.age) {
              fish.age = newAge;
              fishChanged = true;
           }

           if (fish.age > 100 && fish.stage === 'baby') {
              fish.stage = 'adult';
              fish.size = fish.size * 1.5;
              fishChanged = true;
           }
        }

        // --- Coin System ---
        // Only process coin generation for normal game loop ticks, skip if generating massive offline time
        if (dt < 5000 && fish.happiness > 70 && fish.stage === 'adult' && Math.random() < 0.06) {
           const coinId = 'coin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
           const coinValue = 10 + Math.floor(fish.happiness / 10);
           const coinPos = { x: (Math.random() - 0.5) * 16, y: 5, z: (Math.random() - 0.5) * 4 };
           useGameStore.getState().spawnCoin({ id: coinId, value: coinValue, position: coinPos });
        }

        if (fishChanged) {
           fishes[i] = fish;
           hasUpdates = true;
        }
      }

      if (hasUpdates) {
         useGameStore.getState().updateFishes(() => fishes);
      }

    }, 1000); // 1 second interval

    return () => clearInterval(loopInterval);
  }, [lastSaved]);
}
