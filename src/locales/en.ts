import type { TranslationResources } from './id';

const en: TranslationResources = {
  common: {
    appName: 'Suna',
    back: 'Back',
    comingSoon: 'Coming soon',
    locked: 'Locked',
    premium: 'Premium',
    devOnly: 'Development only',
    demoData: 'Demo data',
    loading: 'Loading…',
  },
  tabs: {
    home: 'Home',
    hafalan: 'Hafalan',
    statistics: 'Statistics',
    profile: 'Profile',
  },
  home: {
    notificationsA11y: 'Open notifications',
    notificationsUnreadA11y: 'Open notifications, unread messages',
    welcomeTitle: 'Welcome to Suna',
    welcomeMessage: 'Learn, arrange, and play.',
    mascotA11y: 'Suna mascot. Tap to say hello.',
    statsTitle: 'Your summary',
    gamesTitle: 'Suna Games',
    leaderboardTitle: 'Suna Leaderboard',
    hafalanTitle: 'Your hafalan list',
  },
  stats: {
    completedChallenges: 'Challenges completed',
    practiceSessions: 'Practice sessions',
    lastActivity: 'Last activity',
    never: 'None yet',
    emptyTitle: 'No activity yet',
    emptyBody:
      'These numbers fill in once you play. The first game, Susun Ayat, is being prepared.',
  },
  games: {
    open: 'View',
    availability: {
      available: 'Available',
      preview: 'In development',
      comingSoon: 'Coming soon',
    },
    susunAyat: {
      title: 'Susun Ayat',
      description: 'Arrange Quran verse pieces into the correct order.',
    },
  },
  susunAyatEntry: {
    statusTitle: 'Not playable yet',
    statusBody:
      'Susun Ayat is being built. We will only use Quran text from a verified, reviewed source before the game opens.',
    howTitle: 'How it will work',
    howBody:
      'You will arrange complete ayat into the correct order by dragging or tapping to place. Learning mode has no timer.',
    difficultyTitle: 'Difficulty levels (provisional labels)',
    difficulty: {
      beginner: 'Beginner',
      medium: 'Medium',
      hard: 'Hard',
      expert: 'Expert',
    },
    note: 'Completing a puzzle never marks an ayah as memorized automatically.',
  },
  leaderboard: {
    demoNotice: 'This is demo data for development, not a real ranking.',
    unavailableTitle: 'Leaderboard not available yet',
    unavailableBody:
      'An optional online leaderboard will come later. You can always play without an account.',
    points: '{{count}} points',
    rank: 'Rank {{rank}}',
  },
  hafalan: {
    title: 'Hafalan tracker',
    description:
      'Record the ayat you are learning, reviewing, and have memorized yourself. Hafalan records are separate from game scores.',
    lockedTitle: 'Premium feature',
    lockedBody:
      'The hafalan tracker is part of the premium package. Purchases are not available in this version.',
    learnMore: 'See what premium includes',
    unlockedTitle: 'No hafalan records yet',
    unlockedBody:
      'The hafalan tracker is in development. Later you can pick ayah ranges and set their status yourself.',
    statuses: 'Planned statuses: learning, reviewing, memorized.',
  },
  statistics: {
    gameTitle: 'Game activity',
    gameCaption: 'Counted automatically from games played on this device.',
    hafalanTitle: 'Hafalan (self-reported)',
    hafalanCaption:
      'Hafalan only changes when you record it yourself. Game scores never affect it.',
    hafalanEmpty: 'No hafalan records yet.',
  },
  profile: {
    localTitle: 'Local profile',
    localName: 'Suna player',
    localBody: 'Progress is stored on this device. No account is needed to play.',
    settingsTitle: 'Settings',
    language: 'Language',
    languageSystem: 'System',
    languageId: 'Indonesia',
    languageEn: 'English',
    sound: 'Sound effects',
    soundCaption: 'Short sounds for taps and completion are coming later. No background music.',
    reduceMotion: 'Reduce motion',
    reduceMotionCaption: 'Stop mascot animation and non-essential transitions.',
    reduceMotionSystem: 'On because of your device setting.',
    premiumTitle: 'Premium',
    premiumRow: 'About the premium package',
    aboutTitle: 'About',
    support: 'Help & feedback',
    privacy: 'Privacy policy',
    version: 'Version {{version}}',
    devTitle: 'Entitlement preview',
    devBody:
      'Development only. Changes locked/unlocked views; it is not proof of purchase and is not present in production builds.',
  },
  premium: {
    title: 'Premium package',
    intro:
      'Suna is free to play. The premium package is a one-time purchase that unlocks the following.',
    includesTitle: 'Includes',
    excludesTitle: 'Does not include',
    features: {
      hafalan_tracker: {
        title: 'Hafalan tracker',
        body: 'Record your own memorization status per ayah range.',
      },
      susun_ayat_full: {
        title: 'Full Susun Ayat',
        body: 'All Susun Ayat challenges beyond the free introductory set, as listed in the package contents in the app.',
      },
    },
    excludes: {
      futureGames: 'Other new games released in the future',
      allQuran: 'A guarantee of all Quran content',
      online: 'Online features (accounts, sync, leaderboard)',
    },
    priceNote:
      'The price will be shown from the App Store or Google Play once purchases are available.',
    unavailable: 'Purchases are not available in this version.',
    active: 'Active (development preview)',
  },
  notifications: {
    title: 'Notifications',
    emptyTitle: 'No notifications yet',
    emptyBody: 'Messages from Suna will appear here. We do not send push notifications.',
  },
  settings: {
    loadError: 'Could not load settings. Defaults are used.',
  },
};

export default en;
