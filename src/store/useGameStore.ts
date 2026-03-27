import { create } from 'zustand'
import { economyService } from '../services/economyService'
import { fishService } from '../services/fishService'

export interface FishEntity {
  id: string;
  type: string;
  species: string;
  rarity: string;
  color: string;
  size: number;
  speed: number;
  hunger: number;
  happiness: number;
  age: number;
  position: { x: number; y: number };
  direction: number;
  stage?: string;
  health?: number;
  deathTime?: number;
}

export interface GameState {
  coins: number;
  level: number;
  xp: number;
  fishes: FishEntity[];
  deadFishes: FishEntity[];
  lastSaved: number;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  addFish: (fish: FishEntity) => void;
  removeFish: (id: string) => void;
  updateFishes: (updater: (fishes: FishEntity[]) => FishEntity[]) => void;
  killFish: (id: string) => void;
  reviveFish: (id: string, cost: number) => void;
  cleanupDeadFishes: () => void;
  saveTimestamp: () => void;
  pushToCloud: () => void;
}

export const useGameStore = create<GameState>()(
  (set, get) => ({
    coins: 500,
    level: 1,
    xp: 0,
    fishes: [],
    deadFishes: [],
    lastSaved: Date.now(),
    
    addCoins: (amount) => set((state) => {
      const next = { coins: state.coins + amount };
      // Fire and forget save
      setTimeout(() => get().pushToCloud(), 100);
      return next;
    }),
    addXp: (amount) => set((state) => {
      let newXp = state.xp + amount;
      let newLevel = state.level;
      const xpNeeded = state.level * 1000;
      if (newXp >= xpNeeded) {
        newLevel += 1;
        newXp -= xpNeeded;
      }
      return { xp: newXp, level: newLevel };
    }),
    addFish: (fish) => set((state) => {
      setTimeout(() => get().pushToCloud(), 100);
      return { fishes: [...state.fishes, fish] };
    }),
    removeFish: (id) => set((state) => {
      setTimeout(() => get().pushToCloud(), 100);
      return { fishes: state.fishes.filter(f => f.id !== id) };
    }),
    updateFishes: (updater) => set((state) => ({ fishes: updater(state.fishes) })),
    killFish: (id) => set((state) => {
      const deceased = state.fishes.find(f => f.id === id);
      if (!deceased) return state;
      setTimeout(() => get().pushToCloud(), 100);
      return {
        fishes: state.fishes.filter(f => f.id !== id),
        deadFishes: [...state.deadFishes, { ...deceased, deathTime: Date.now() }]
      };
    }),
    reviveFish: (id, cost) => set((state) => {
      const ghost = state.deadFishes.find(f => f.id === id);
      if (!ghost || state.coins < cost) return state;
      setTimeout(() => get().pushToCloud(), 100);
      return {
        coins: state.coins - cost,
        deadFishes: state.deadFishes.filter(f => f.id !== id),
        fishes: [...state.fishes, { ...ghost, hunger: 100, health: 100, happiness: 100, deathTime: undefined }]
      };
    }),
    cleanupDeadFishes: () => set((state) => {
      const LIMIT_30_DAYS = 30 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      return {
        deadFishes: state.deadFishes.filter(f => f.deathTime && (now - f.deathTime) <= LIMIT_30_DAYS)
      };
    }),
    saveTimestamp: () => set((state) => {
      get().pushToCloud();
      return { lastSaved: Date.now() };
    }),
    pushToCloud: () => {
      const s = get();
      economyService.saveEconomy(s.coins, s.level, s.xp);
      fishService.saveFishes(s.fishes);
      fishService.saveDeadFishes(s.deadFishes);
    }
  })
)