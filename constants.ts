import { WalletInfo, User, PlanType } from './types';

export const WALLETS: WalletInfo[] = [
  { network: 'Solana', address: 'F2UJS1wNzsfcQTknPsxBk7B25qWbU9JtiRW1eRgdwLJY', icon: 'sol' },
  { network: 'Ethereum', address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50', icon: 'eth' },
  { network: 'Monad', address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50', icon: 'monad' },
  { network: 'Base', address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50', icon: 'base' },
  { network: 'Sui', address: '0x41629e22deff6965100a4c28567dea45036d0360e6126a9c7f9c8fb1860a36c4', icon: 'sui' },
  { network: 'Polygon', address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50', icon: 'poly' },
  { network: 'Bitcoin', address: 'bc1q9s855ehn959s5t2g6kjt9q7pt5t55n9gq7gpd7', icon: 'btc' },
];

export const PLAN_FEATURES: Record<PlanType, { maxGames: number; maxPosts: number; showAds: boolean; badge: string | null }> = {
  free: { maxGames: 5, maxPosts: 1, showAds: true, badge: null },
  trial: { maxGames: 9999, maxPosts: 9999, showAds: false, badge: '🔥' },
  basic: { maxGames: 20, maxPosts: 5, showAds: false, badge: '⭐' },
  pro: { maxGames: 9999, maxPosts: 9999, showAds: false, badge: '🏆' },
  vip: { maxGames: 9999, maxPosts: 9999, showAds: false, badge: '💎' },
};

// Clean template user - stats will be set dynamically in App.tsx
export const MOCK_USER: User = {
  id: 'user_template',
  name: 'User',
  username: '@user',
  avatar: '',
  level: 1,
  wins: 0,
  losses: 0,
  subscriptionPlan: 'free',
  dailyPostsRemaining: 1,
  dailyGamesRemaining: 5,
  gender: 'Male',
  dob: '',
  location: 'غير محدد',
  achievements: [],
  streak: 0,
  xp: 0
};

export const SUPPORT_EMAIL = 'jikob67@gmail.com';
export const SUPPORT_LINKS = [
  'https://jacobalcadiapps.wordpress.com',
  'https://jacobalcadiapps.blogspot.com'
];