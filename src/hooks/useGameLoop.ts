import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

export const useGameLoop = () => {
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    // Runs once a second to update slow-moving stats (Hunger, Health, Growth, Cloud Sync via debounce)
    const loopInterval = setInterval(() => {
      const now = Date.now();
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Ensure dt max 5000ms to prevent massive jumps on resume
      const safeDt = Math.min(dt, 5000);

      const state = useGameStore.getState();
      const fishes = [...state.fishes];
      let hasUpdates = false;

      // Rates (scaled by safeDt which is in ms)
      const hungerDropRate = 1 / 2000;
      const baseGrowthRate = 1 / 20000;
      const hourlyHealthDropRate = (100 / 3600000);

      for (let i = 0; i < fishes.length; i++) {
        let fish = { ...fishes[i] };
        let fishChanged = false;

        // --- Hunger System ---
        const newHunger = Math.max(0, fish.hunger - hungerDropRate * safeDt);
        if (newHunger !== fish.hunger) {
           fish.hunger = newHunger;
           fishChanged = true;
        }

        if (fish.hunger < 30) {
           const newHappiness = Math.max(0, fish.happiness - (hungerDropRate * safeDt * 2));
           if (newHappiness !== fish.happiness) {
              fish.happiness = newHappiness;
              fishChanged = true;
           }
        }

        if (fish.hunger === 0) {
          const newHealth = Math.max(0, (fish.health ?? 100) - (hourlyHealthDropRate * safeDt));
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
            const newHealth = Math.min(100, (fish.health ?? 100) + hungerDropRate * safeDt);
            if (newHealth !== fish.health) {
               fish.health = newHealth;
               fishChanged = true;
            }
          }
        }

        // --- Growth System ---
        if (fish.stage !== 'adult') {
           const newAge = (fish.age || 0) + (baseGrowthRate * safeDt);
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
        if (fish.happiness > 70 && fish.stage === 'adult' && Math.random() < 0.06) {
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
  }, []);
}
