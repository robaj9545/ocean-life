import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

export const useGameLoop = () => {
  const lastSaved = useGameStore(state => state.lastSaved);
  const lastTimeRef = useRef(lastSaved || Date.now());
  const lastSaveRef = useRef(Date.now());
  const lastCoinSpawnRef = useRef(Date.now());

  useEffect(() => {
    // Runs once a second to update slow-moving stats
    const loopInterval = setInterval(() => {
      const now = Date.now();
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Allow dt to be up to 30 days for offline progress
      const simDt = Math.min(dt, 30 * 24 * 60 * 60 * 1000);

      const state = useGameStore.getState();
      const fishes = [...state.fishes];
      let hasUpdates = false;
      
      const deaths: string[] = [];

      // Rates (scaled by simDt which is in ms)
      const H_12_MS = 12 * 3600 * 1000;
      const H_24_MS = 24 * 3600 * 1000;
      const hungerDropRate = 100 / H_12_MS; // Drops 100 hunger in 12 hours
      const healthDropRate = 100 / H_12_MS; // Drops 100 health in 12 hours (starts when hunger is 0)
      const baseGrowthRate = 100 / H_24_MS; // Grows 100 units in 24 hours

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
          const healthDrop = healthDropRate * timeAtZeroHunger;
          const newHealth = Math.max(0, (fish.health ?? 100) - healthDrop);
          if (newHealth !== fish.health) {
             fish.health = newHealth;
             fishChanged = true;
          }
          
          if (fish.health === 0) {
             deaths.push(fish.id);
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

        if (fishChanged) {
           fishes[i] = fish;
           hasUpdates = true;
        }
      }

      // BUG #6 FIX: Remove dead fish from local list BEFORE calling updateFishes
      const survivingFishes = fishes.filter(f => !deaths.includes(f.id));

      const latestState = useGameStore.getState();
      if (deaths.length > 0) {
         deaths.forEach(id => latestState.killFish(id));
      }
      
      if (hasUpdates) {
         latestState.updateFishes(() => survivingFishes);
      }

      // --- COIN SPAWNING: Adult fish generate coins every 30 seconds ---
      const timeSinceLastCoinSpawn = now - lastCoinSpawnRef.current;
      if (timeSinceLastCoinSpawn >= 30000) { // Every 30 seconds
        lastCoinSpawnRef.current = now;
        const currentState = useGameStore.getState();
        const adultFish = currentState.fishes.filter(f => f.stage === 'adult');
        
        // Each adult fish has a chance to spawn a coin (as 2D overlay icon)
        adultFish.forEach(fish => {
          // Skip fish that already have a pending coin
          if (currentState.fishCoins[fish.id]) return;

          if (Math.random() < 0.6) { // 60% chance per fish per 30s
            const coinValue = fish.rarity === 'legendary' ? 10 
              : fish.rarity === 'epic' ? 5 
              : fish.rarity === 'rare' ? 3 
              : 1;

            // Happiness affects coin generation: happy fish generate more
            const happinessBonus = (fish.happiness || 50) / 100;
            const finalValue = Math.max(1, Math.round(coinValue * happinessBonus));

            currentState.spawnCoinOnFish(fish.id, finalValue);
          }
        });
      }

      // --- PERIODIC SAVE: Save to cloud every 60 seconds if there are updates ---
      if (now - lastSaveRef.current > 60000) {
        lastSaveRef.current = now;
        useGameStore.getState().pushToCloud();
      }

    }, 1000); // 1 second interval

    return () => clearInterval(loopInterval);
  }, []);
}
