export type MissionType = 'daily' | 'achievement';
export type MissionAction = 'feed' | 'breed' | 'buy_fish' | 'collect_coin' | 'buy_food' | 'revive';

export interface MissionDef {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  action: MissionAction;
  targetAmount: number;
  rewardCoins: number;
  rewardXp: number;
  icon?: string;
}

// Missões Diárias (sorteadas ou sempre ativas no dia)
export const DAILY_MISSIONS: MissionDef[] = [
  {
    id: 'daily_feed_5',
    type: 'daily',
    title: 'Banquete Marítimo',
    description: 'Alimente os seus peixes 5 vezes.',
    action: 'feed',
    targetAmount: 5,
    rewardCoins: 50,
    rewardXp: 100,
    icon: 'Drumstick'
  },
  {
    id: 'daily_collect_10',
    type: 'daily',
    title: 'Caçador de Tesouros',
    description: 'Colete 10 moedas brilhantes do fundo do mar.',
    action: 'collect_coin',
    targetAmount: 10,
    rewardCoins: 30,
    rewardXp: 50,
    icon: 'Coins'
  },
  {
    id: 'daily_breed_1',
    type: 'daily',
    title: 'Milagre da Vida',
    description: 'Faça um cruzamento no Criadouro hoje.',
    action: 'breed',
    targetAmount: 1,
    rewardCoins: 150,
    rewardXp: 200,
    icon: 'Heart'
  }
];

// Conquistas Únicas (Lifetime Achievements)
export const ACHIEVEMENTS: MissionDef[] = [
  {
    id: 'ach_feed_100',
    type: 'achievement',
    title: 'Nutricionista Chefe',
    description: 'Alimente seus peixes 100 vezes.',
    action: 'feed',
    targetAmount: 100,
    rewardCoins: 500,
    rewardXp: 1000,
    icon: 'Drumstick'
  },
  {
    id: 'ach_collect_500',
    type: 'achievement',
    title: 'Bilionário das Águas',
    description: 'Colete 500 moedas no chão do aquário.',
    action: 'collect_coin',
    targetAmount: 500,
    rewardCoins: 1000,
    rewardXp: 2000,
    icon: 'Coins'
  },
  {
    id: 'ach_breed_10',
    type: 'achievement',
    title: 'Mestre Geneticista',
    description: 'Realize 10 cruzamentos bem-sucedidos no laboratório.',
    action: 'breed',
    targetAmount: 10,
    rewardCoins: 1500,
    rewardXp: 2500,
    icon: 'Dna'
  },
  {
    id: 'ach_buy_20',
    type: 'achievement',
    title: 'Grande Investidor',
    description: 'Compre 20 peixes novos na loja.',
    action: 'buy_fish',
    targetAmount: 20,
    rewardCoins: 2000,
    rewardXp: 3000,
    icon: 'ShoppingCart'
  },
  {
    id: 'ach_revive_1',
    type: 'achievement',
    title: 'Deus da Morte',
    description: 'Reviva um peixe faminto que passava dos limites.',
    action: 'revive',
    targetAmount: 1,
    rewardCoins: 500,
    rewardXp: 1000,
    icon: 'Skull'
  }
];
