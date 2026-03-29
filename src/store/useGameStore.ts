import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { economyService } from '../services/economyService'
import { fishService } from '../services/fishService'
import { statsService, UserStats } from '../services/statsService'

export interface FishEntity {
  id: string;
  type: string;
  species: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
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
  dna?: any;
}

export interface GameState {
  coins: number;
  foodAmount: number;
  coinsInWater: { id: string; value: number; position: { x: number; y: number; z: number } }[];
  level: number;
  xp: number;
  fishes: FishEntity[];
  deadFishes: FishEntity[];
  lastSaved: number;
  addCoins: (amount: number) => void;
  addFood: (amount: number) => void;
  consumeFood: (amount: number) => boolean;
  addXp: (amount: number) => void;
  spawnCoin: (coin: any) => void;
  collectCoin: (id: string, value: number) => void;
  addFish: (fish: FishEntity) => void;
  removeFish: (id: string) => void;
  updateFishes: (updater: (fishes: FishEntity[]) => FishEntity[]) => void;
  killFish: (id: string) => void;
  reviveFish: (id: string, cost: number) => void;
  cleanupDeadFishes: () => void;
  saveTimestamp: () => void;
  pushToCloud: () => void;
  
  // Stats & Missions
  stats: UserStats;
  claimedMissions: string[];
  dailyProgress: Record<string, number>;
  lastDailyReset: number;
  setStatsData: (data: { stats: UserStats, claimedMissions: string[], dailyProgress: Record<string, number>, lastDailyReset: number }) => void;
  incrementStat: (action: keyof UserStats, amount?: number) => void;
  claimMission: (missionId: string, rewardCoins: number, rewardXp: number, isDaily: boolean) => void;
  checkDailyReset: () => void;
}

let pushTimeout: any;
const debouncedPush = (get: () => GameState) => {
  if (pushTimeout) clearTimeout(pushTimeout);
  pushTimeout = setTimeout(() => {
    const s = get();
    AsyncStorage.setItem('@last_saved_time', Date.now().toString()).catch(() => {});
    economyService.saveEconomy(s.coins, s.level, s.xp, s.foodAmount);
    fishService.saveFishes(s.fishes);
    fishService.saveDeadFishes(s.deadFishes);
    statsService.saveStats(s.stats, s.claimedMissions, s.dailyProgress, s.lastDailyReset);
  }, 5000);
}

export const useGameStore = create<GameState>()(
  (set, get) => ({
    coins: 500,
    foodAmount: 50,
    coinsInWater: [],
    level: 1,
    xp: 0,
    fishes: [],
    deadFishes: [],
    lastSaved: Date.now(),
    
    stats: { feed: 0, breed: 0, buy_fish: 0, collect_coin: 0, buy_food: 0, revive: 0 },
    claimedMissions: [],
    dailyProgress: {},
    lastDailyReset: Date.now(),
    
    addCoins: (amount) => set((state) => {
      const next = { coins: state.coins + amount };
      // Fire and forget save
      setTimeout(() => get().pushToCloud(), 100);
      return next;
    }),
    addFood: (amount) => set((state) => {
      setTimeout(() => get().pushToCloud(), 100);
      return { foodAmount: state.foodAmount + amount };
    }),
    consumeFood: (amount) => {
      const state = get();
      if (state.foodAmount >= amount) {
         set({ foodAmount: state.foodAmount - amount });
         get().incrementStat('feed', 1);
         setTimeout(() => get().pushToCloud(), 100);
         return true;
      }
      return false;
    },
    spawnCoin: (coin) => set((state) => ({ coinsInWater: [...state.coinsInWater, coin] })),
    collectCoin: (id, value) => {
      set((state) => ({ coinsInWater: state.coinsInWater.filter(c => c.id !== id) }));
      get().addCoins(value);
      get().addXp(value * 2);
      get().incrementStat('collect_coin', 1);
    },
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
      if (!deceased || state.deadFishes.some(f => f.id === id)) return state;
      setTimeout(() => get().pushToCloud(), 100);
      return {
        fishes: state.fishes.filter(f => f.id !== id),
        deadFishes: [...state.deadFishes, { ...deceased, deathTime: Date.now() }]
      };
    }),
    reviveFish: (id, cost) => set((state) => {
      const ghost = state.deadFishes.find(f => f.id === id);
      if (!ghost || state.coins < cost) return state;
      setTimeout(() => {
         get().incrementStat('revive', 1);
         get().pushToCloud();
      }, 100);
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
      AsyncStorage.setItem('@last_saved_time', Date.now().toString()).catch(() => {});
      get().pushToCloud();
      return { lastSaved: Date.now() };
    }),
    
    setStatsData: (data) => set(() => ({ ...data })),
    
    incrementStat: (action, amount = 1) => set((state) => {
      const newStats = { ...state.stats, [action]: (state.stats[action] || 0) + amount };
      const newDaily = { ...state.dailyProgress, [action]: (state.dailyProgress[action] || 0) + amount };
      setTimeout(() => get().pushToCloud(), 100);
      return { stats: newStats, dailyProgress: newDaily };
    }),
    
    checkDailyReset: () => set((state) => {
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (now - state.lastDailyReset > ONE_DAY) {
        // Reset daily missions progress and last reset time
        const newClaimed = state.claimedMissions.filter(id => !id.startsWith('daily_'));
        setTimeout(() => get().pushToCloud(), 100);
        return { dailyProgress: {}, claimedMissions: newClaimed, lastDailyReset: now };
      }
      return state;
    }),
    
    claimMission: (missionId, rewardCoins, rewardXp, isDaily) => {
      set((state) => ({ claimedMissions: [...state.claimedMissions, missionId] }));
      get().addCoins(rewardCoins);
      get().addXp(rewardXp);
    },

    pushToCloud: () => debouncedPush(get)
  })
)