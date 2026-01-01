import type { Dungeon } from '../types'

export const dungeons: Dungeon[] = [
  {
    id: 'tutorial-field',
    name: '訓練場',
    description: '初心者向けの安全な場所。基礎を学ぶのに最適。',
    levelRange: [1, 2],
    tierWeights: { normal: 0.9, elite: 0.1, named: 0, boss: 0 },
    lootWeights: { common: 0.85, rare: 0.15, epic: 0, legendary: 0 },
    chestChance: 0.05,
    enemyPool: ['スライム', 'ゴブリン', '大ネズミ']
  },
  {
    id: 'beginner-cave',
    name: '初心の洞窟',
    description: '少し慣れたら挑戦できる洞窟。報酬は控えめ。',
    levelRange: [2, 4],
    tierWeights: { normal: 0.75, elite: 0.2, named: 0.05, boss: 0 },
    lootWeights: { common: 0.7, rare: 0.25, epic: 0.05, legendary: 0 },
    chestChance: 0.08,
    enemyPool: ['ウルフ', 'バイパー', 'バンディット', 'スケルトン']
  },
  {
    id: 'dark-forest',
    name: '暗黒の森',
    description: '魔物が棲み着く暗い森。狙いを定めてくる敵が多い。',
    levelRange: [4, 6],
    tierWeights: { normal: 0.65, elite: 0.25, named: 0.1, boss: 0 },
    lootWeights: { common: 0.6, rare: 0.3, epic: 0.09, legendary: 0.01 },
    chestChance: 0.1,
    enemyPool: ['ウルフ', 'ベア', 'ゴブリンウォーリア', 'ダークエルフ', 'トレント']
  },
  {
    id: 'ancient-ruins',
    name: '古代の遺跡',
    description: '少し難しい遺跡。エリートが頻出し、レア武器が期待できる。',
    levelRange: [5, 8],
    tierWeights: { normal: 0.55, elite: 0.3, named: 0.15, boss: 0 },
    lootWeights: { common: 0.45, rare: 0.35, epic: 0.18, legendary: 0.02 },
    chestChance: 0.12,
    enemyPool: ['スケルトン', 'ゾンビ', 'ゴースト', 'ナイト', 'メイジ', 'ガーゴイル']
  },
  {
    id: 'volcanic-crater',
    name: '火山クレーター',
    description: '燃え盛る火山の内部。炎系の敵が多数。',
    levelRange: [7, 10],
    tierWeights: { normal: 0.5, elite: 0.35, named: 0.15, boss: 0 },
    lootWeights: { common: 0.35, rare: 0.4, epic: 0.2, legendary: 0.05 },
    chestChance: 0.13,
    enemyPool: ['ファイアエレメンタル', 'ラバゴーレム', 'フレイムドレイク', 'サラマンダー', 'イフリート']
  },
  {
    id: 'frozen-tundra',
    name: '凍てつく凍土',
    description: '氷と雪に覆われた過酷な地。氷系の敵が待ち受ける。',
    levelRange: [8, 11],
    tierWeights: { normal: 0.45, elite: 0.4, named: 0.15, boss: 0 },
    lootWeights: { common: 0.3, rare: 0.4, epic: 0.25, legendary: 0.05 },
    chestChance: 0.14,
    enemyPool: ['アイスエレメンタル', 'フロストジャイアント', 'アイスドラゴン', 'イエティ', 'フローズンリッチ']
  },
  {
    id: 'cursed-cathedral',
    name: '呪われた大聖堂',
    description: '邪悪に侵された聖域。アンデッドと悪魔が横行する。',
    levelRange: [9, 13],
    tierWeights: { normal: 0.4, elite: 0.4, named: 0.2, boss: 0 },
    lootWeights: { common: 0.25, rare: 0.35, epic: 0.3, legendary: 0.1 },
    chestChance: 0.15,
    enemyPool: ['リッチ', 'デーモンウォーリア', 'ヴァンパイア', 'デスナイト', 'ダークプリースト']
  },
  {
    id: 'abyssal-depths',
    name: '深淵の奈落',
    description: '最難関ダンジョン。ネームドが出現し、伝説級の報酬が狙える。',
    levelRange: [11, 15],
    tierWeights: { normal: 0.35, elite: 0.4, named: 0.25, boss: 0 },
    lootWeights: { common: 0.2, rare: 0.35, epic: 0.3, legendary: 0.15 },
    chestChance: 0.16,
    enemyPool: ['リッチ', 'デーモンウォーリア', 'ストームエレメンタル', 'ドレイク', 'ゴーレム', 'アサシン']
  },
  {
    id: 'dragons-lair',
    name: '竜の巣',
    description: '強大な竜が棲む危険な場所。最高級の報酬が待っている。',
    levelRange: [13, 18],
    tierWeights: { normal: 0.3, elite: 0.4, named: 0.25, boss: 0.05 },
    lootWeights: { common: 0.15, rare: 0.3, epic: 0.35, legendary: 0.2 },
    chestChance: 0.18,
    enemyPool: ['ドラゴン', 'ワイバーン', 'ドレイク', 'ドラゴンナイト', '竜人シャーマン']
  },
  {
    id: 'void-nexus',
    name: '虚無の核心',
    description: '現実が歪む異次元空間。最強の敵と最高の報酬。',
    levelRange: [15, 20],
    tierWeights: { normal: 0.25, elite: 0.35, named: 0.3, boss: 0.1 },
    lootWeights: { common: 0.1, rare: 0.25, epic: 0.4, legendary: 0.25 },
    chestChance: 0.2,
    enemyPool: ['ヴォイドウォーカー', 'エルドリッチホラー', '混沌の使徒', '次元の守護者', '虚無の支配者']
  }
]
