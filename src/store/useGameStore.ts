import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { economyService } from '../services/economyService'
import { fishService } from '../services/fishService'
import { statsService, UserStats } from '../services/statsService'
import { FishDNA } from '../utils/dna'

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
  dna?: FishDNA;
  nickname?: string;
}

// Sell prices by rarity
export const SELL_PRICES: Record<string, number> = {
  common: 50,
  rare: 250,
  epic: 1000,
  legendary: 5000,
}

// Level unlock requirements
export const LEVEL_UNLOCKS: Record<string, number> = {
  clownfish: 1,
  bluetang: 1,
  spiderfish: 3,
  lionfish: 5,
  dragonfish: 10,
  ghostshark: 15,
  leviathan: 25,
  breeding: 5,
}

export interface GameState {
  coins: number;
  foodAmount: number;
  fishCoins: Record<string, number>;  // fishId -> pending coin value
  level: number;
  xp: number;
  fishes: FishEntity[];
  deadFishes: FishEntity[];
  lastSaved: number;
  addCoins: (amount: number) => void;
  addFood: (amount: number) => void;
  consumeFood: (amount: number) => boolean;
  addXp: (amount: number) => void;
  spawnCoinOnFish: (fishId: string, value: number) => void;
  collectCoinFromFish: (fishId: string) => void;
  addFish: (fish: FishEntity) => void;
  removeFish: (id: string) => void;
  updateFishes: (updater: (fishes: FishEntity[]) => FishEntity[]) => void;
  killFish: (id: string) => void;
  reviveFish: (id: string, cost: number) => void;
  cleanupDeadFishes: () => void;
  buyNicknameItem: () => void;
  useNicknameItem: (fishId: string, nickname: string) => boolean;
  saveTimestamp: () => void;
  pushToCloud: () => void;
  feedAllHungry: () => number;
  getSellPrice: (fish: FishEntity) => number;
  
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
  }, 2000);
}

export const useGameStore = create<GameState>()(
  (set, get) => ({
    coins: 500,
    foodAmount: 50,
    fishCoins: {},
    level: 1,
    xp: 0,
    fishes: [],
    deadFishes: [],
    lastSaved: Date.now(),
    
    stats: { feed: 0, breed: 0, buy_fish: 0, collect_coin: 0, buy_food: 0, revive: 0, nickname_items: 0 },
    claimedMissions: [],
    dailyProgress: {},
    lastDailyReset: Date.now(),
    
    addCoins: (amount) => {
      set((state) => ({ coins: state.coins + amount }));
      debouncedPush(get);
    },
    addFood: (amount) => {
      set((state) => ({ foodAmount: state.foodAmount + amount }));
      debouncedPush(get);
    },
    consumeFood: (amount) => {
      const state = get();
      if (state.foodAmount >= amount) {
         set({ foodAmount: state.foodAmount - amount });
         get().incrementStat('feed', 1);
         debouncedPush(get);
         return true;
      }
      return false;
    },
    spawnCoinOnFish: (fishId, value) => set((state) => ({
      fishCoins: { ...state.fishCoins, [fishId]: (state.fishCoins[fishId] || 0) + value }
    })),
    collectCoinFromFish: (fishId) => {
      const coinValue = get().fishCoins[fishId] || 0;
      if (coinValue <= 0) return;
      set((state) => {
        const newCoins = { ...state.fishCoins };
        delete newCoins[fishId];
        return { fishCoins: newCoins };
      });
      get().addCoins(coinValue);
      get().addXp(coinValue * 2);
      get().incrementStat('collect_coin', 1);
    },
    // BUG #10 FIX: Multi-level-up with while loop
    addXp: (amount) => {
      set((state) => {
        let newXp = state.xp + amount;
        let newLevel = state.level;
        let xpNeeded = newLevel * 1000;
        while (newXp >= xpNeeded) {
          newLevel += 1;
          newXp -= xpNeeded;
          xpNeeded = newLevel * 1000;
        }
        return { xp: newXp, level: newLevel };
      });
      debouncedPush(get);
    },
    addFish: (fish) => {
      set((state) => ({ fishes: [...state.fishes, fish] }));
      debouncedPush(get);
    },
    removeFish: (id) => {
      set((state) => ({ fishes: state.fishes.filter(f => f.id !== id) }));
      debouncedPush(get);
    },
    updateFishes: (updater) => set((state) => ({ fishes: updater(state.fishes) })),
    killFish: (id) => {
      set((state) => {
        const deceased = state.fishes.find(f => f.id === id);
        if (!deceased || state.deadFishes.some(f => f.id === id)) return state;
        return {
          fishes: state.fishes.filter(f => f.id !== id),
          deadFishes: [...state.deadFishes, { ...deceased, deathTime: Date.now() }]
        };
      });
      debouncedPush(get);
    },
    reviveFish: (id, cost) => {
      set((state) => {
        const ghost = state.deadFishes.find(f => f.id === id);
        if (!ghost || state.coins < cost) return state;
        return {
          coins: state.coins - cost,
          deadFishes: state.deadFishes.filter(f => f.id !== id),
          fishes: [...state.fishes, { ...ghost, hunger: 100, health: 100, happiness: 100, deathTime: undefined }]
        };
      });
      get().incrementStat('revive', 1);
      debouncedPush(get);
    },
    cleanupDeadFishes: () => set((state) => {
      const LIMIT_30_DAYS = 30 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      return {
        deadFishes: state.deadFishes.filter(f => f.deathTime && (now - f.deathTime) <= LIMIT_30_DAYS)
      };
    }),
    saveTimestamp: () => {
      AsyncStorage.setItem('@last_saved_time', Date.now().toString()).catch(() => {});
      set({ lastSaved: Date.now() });
      debouncedPush(get);
    },

    buyNicknameItem: () => {
      const state = get();
      if (state.coins >= 1000) {
        state.addCoins(-1000);
        state.incrementStat('nickname_items', 1);
      }
    },

    useNicknameItem: (fishId, nickname) => {
      let success = false;
      set((state) => {
        if ((state.stats.nickname_items || 0) > 0) {
          const newFishes = state.fishes.map(f => f.id === fishId ? { ...f, nickname } : f);
          const newStats = { ...state.stats, nickname_items: (state.stats.nickname_items || 0) - 1 };
          success = true;
          return { fishes: newFishes, stats: newStats };
        }
        return state;
      });
      if (success) debouncedPush(get);
      return success;
    },

    // Feed all hungry fish at once
    feedAllHungry: () => {
      const state = get();
      const hungryFish = state.fishes.filter(f => f.hunger < 30);
      const needed = hungryFish.length;
      if (needed === 0 || state.foodAmount < needed) return 0;

      set(s => ({
        foodAmount: s.foodAmount - needed,
        fishes: s.fishes.map(f =>
          f.hunger < 30
            ? { ...f, hunger: Math.min(100, f.hunger + 50), happiness: Math.min(100, f.happiness + 20) }
            : f
        )
      }));
      get().incrementStat('feed', needed);
      debouncedPush(get);
      return needed;
    },

    // Dynamic sell price based on rarity, stage, DNA
    getSellPrice: (fish: FishEntity) => {
      let base = SELL_PRICES[fish.rarity] || 50;
      if (fish.stage === 'adult') base = Math.floor(base * 1.5);
      if (fish.dna) {
        const dominant = Object.values(fish.dna).filter(v => v === v.toUpperCase()).length;
        base = Math.floor(base * (1 + dominant * 0.05)); // +5% per dominant gene
      }
      return base;
    },
    
    setStatsData: (data) => set(() => ({ ...data })),
    
    incrementStat: (action, amount = 1) => {
      set((state) => {
        const newStats = { ...state.stats, [action]: (state.stats[action] || 0) + amount };
        const newDaily = { ...state.dailyProgress, [action]: (state.dailyProgress[action] || 0) + amount };
        return { stats: newStats, dailyProgress: newDaily };
      });
      debouncedPush(get);
    },
    
    checkDailyReset: () => {
      const state = get();
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (now - state.lastDailyReset > ONE_DAY) {
        const newClaimed = state.claimedMissions.filter(id => !id.startsWith('daily_'));
        set({ dailyProgress: {}, claimedMissions: newClaimed, lastDailyReset: now });
        debouncedPush(get);
      }
    },
    
    claimMission: (missionId, rewardCoins, rewardXp, _isDaily) => {
      set((state) => ({ claimedMissions: [...state.claimedMissions, missionId] }));
      get().addCoins(rewardCoins);
      get().addXp(rewardXp);
    },

    pushToCloud: () => debouncedPush(get)
  })
)