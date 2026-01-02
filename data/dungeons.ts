import type { Dungeon } from '../types'

export const dungeons: Dungeon[] = [
  // ========== 超初心者向け（Lv1-10）- 特性なし ==========
  {
    id: 'tutorial-field',
    name: '訓練場',
    description: '初心者向けの安全な場所。基礎を学ぶのに最適。',
    levelRange: [1, 10],
    prereq: undefined,
    tierWeights: { normal: 0.95, elite: 0.05, named: 0, boss: 0 },
    eliteChance: 0.01,
    namedChance: 0,
    lootWeights: { common: 0.95, rare: 0.05, epic: 0, legendary: 0 },
    chestLootWeights: { common: 0.9, rare: 0.08, epic: 0.02, legendary: 0 },
    chestChance: 0.03,
    enemyPool: ['slime', 'goblin', 'giant_rat']
  },

  // ========== 初心者向け（Lv5-15）- 毒・出血系が少し ==========
  {
    id: 'beginner-cave',
    name: '初心の洞窟',
    description: '少し慣れたら挑戦できる洞窟。毒を使う敵が多い。',
    levelRange: [5, 15],
    prereq: 'tutorial-field',
    tierWeights: { normal: 0.85, elite: 0.12, named: 0.03, boss: 0 },
    eliteChance: 0.05,
    namedChance: 0.01,
    lootWeights: { common: 0.85, rare: 0.14, epic: 0.01, legendary: 0 },
    chestLootWeights: { common: 0.8, rare: 0.17, epic: 0.03, legendary: 0 },
    chestChance: 0.05,
    enemyPool: ['wolf', 'viper', 'bandit', 'skeleton'],
    characteristics: {
      statusAffinity: { high: ['poison', 'bleed'], chance: 30 }
    }
  },

  // ========== 初級（Lv10-20）- バランス型 ==========
  {
    id: 'misty-swamp',
    name: '霧の湿地',
    description: '霧に包まれた湿地帯。様々な種類の敵が出現する。',
    levelRange: [10, 20],
    prereq: 'tutorial-field',
    tierWeights: { normal: 0.8, elite: 0.15, named: 0.05, boss: 0 },
    eliteChance: 0.06,
    namedChance: 0.01,
    lootWeights: { common: 0.8, rare: 0.18, epic: 0.02, legendary: 0 },
    chestLootWeights: { common: 0.75, rare: 0.2, epic: 0.05, legendary: 0 },
    chestChance: 0.06,
    enemyPool: ['wolf', 'goblin_warrior', 'dark_elf', 'treant']
  },

  // ========== 中級（Lv15-30）- 物理防御高 ==========
  {
    id: 'dark-forest',
    name: '暗黒の森',
    description: '魔物が棲み着く暗い森。強い敵が多く、物理防御が高い。',
    levelRange: [15, 30],
    prereq: 'beginner-cave',
    tierWeights: { normal: 0.75, elite: 0.18, named: 0.07, boss: 0 },
    eliteChance: 0.08,
    namedChance: 0.02,
    lootWeights: { common: 0.75, rare: 0.22, epic: 0.03, legendary: 0 },
    chestLootWeights: { common: 0.7, rare: 0.24, epic: 0.06, legendary: 0 },
    chestChance: 0.08,
    enemyPool: ['wolf', 'bear', 'goblin_warrior', 'dark_elf', 'treant', 'wild_boar'],
    characteristics: {
      resistanceTheme: { type: 'physical', baseResistance: 15 }
    }
  },

  // ========== 中級（Lv20-35）- 毒沼：毒・疫病系 ==========
  {
    id: 'poison-marsh',
    name: '毒沼地',
    description: '毒に満ちた沼地。敵が次々と状態異常を付与してくる。',
    levelRange: [20, 35],
    prereq: 'beginner-cave',
    tierWeights: { normal: 0.7, elite: 0.2, named: 0.1, boss: 0 },
    eliteChance: 0.09,
    namedChance: 0.02,
    lootWeights: { common: 0.7, rare: 0.25, epic: 0.04, legendary: 0 },
    chestLootWeights: { common: 0.65, rare: 0.27, epic: 0.07, legendary: 0 },
    chestChance: 0.09,
    enemyPool: ['viper', 'zombie', 'dark_elf', 'bandit', 'vampire'],
    characteristics: {
      statusAffinity: { high: ['poison', 'bleed', 'epidemic'], chance: 40 },
      immunitiesTheme: ['poison']
    }
  },

  // ========== 上級（Lv30-60）- 古代遺跡：アンデッド・呪い ==========
  {
    id: 'ancient-ruins',
    name: '古代の遺跡',
    description: '古い遺跡。アンデッド敵が支配し、状態異常に耐性がある。',
    levelRange: [30, 60],
    prereq: 'dark-forest',
    tierWeights: { normal: 0.65, elite: 0.25, named: 0.1, boss: 0 },
    eliteChance: 0.12,
    namedChance: 0.03,
    lootWeights: { common: 0.65, rare: 0.32, epic: 0.03, legendary: 0 },
    chestLootWeights: { common: 0.6, rare: 0.32, epic: 0.08, legendary: 0 },
    chestChance: 0.1,
    enemyPool: ['skeleton', 'zombie', 'ghost', 'knight', 'mage', 'gargoyle', 'lich'],
    characteristics: {
      statusAffinity: { high: ['curse', 'stun'], chance: 32 },
      immunitiesTheme: ['poison', 'bleed']
    }
  },

  // ========== 上級（Lv35-65）- 雷鳴の塔：スタン・麻痺系 ==========
  {
    id: 'thunder-tower',
    name: '雷鳴の塔',
    description: '雷が轟く高い塔。敵がスタンを頻繁に付与してくる。',
    levelRange: [35, 65],
    prereq: 'misty-swamp',
    tierWeights: { normal: 0.6, elite: 0.28, named: 0.12, boss: 0 },
    eliteChance: 0.13,
    namedChance: 0.03,
    lootWeights: { common: 0.6, rare: 0.35, epic: 0.04, legendary: 0 },
    chestLootWeights: { common: 0.55, rare: 0.35, epic: 0.09, legendary: 0 },
    chestChance: 0.11,
    enemyPool: ['storm_elemental', 'dark_priest', 'mage', 'knight', 'banshee'],
    characteristics: {
      statusAffinity: { high: ['stun', 'curse'], chance: 38 },
      resistanceTheme: { type: 'magical', baseResistance: 15 }
    }
  },

  // ========== 高級（Lv50-100）- 火山クレーター：炎系 ==========
  {
    id: 'volcanic-crater',
    name: '火山クレーター',
    description: '燃え盛る火山の内部。炎系の敵が支配し、常に火傷を付与してくる。',
    levelRange: [50, 100],
    prereq: 'ancient-ruins',
    tierWeights: { normal: 0.55, elite: 0.3, named: 0.15, boss: 0 },
    eliteChance: 0.15,
    namedChance: 0.05,
    lootWeights: { common: 0.55, rare: 0.35, epic: 0.09, legendary: 0.01 },
    chestLootWeights: { common: 0.5, rare: 0.35, epic: 0.12, legendary: 0.03 },
    chestChance: 0.12,
    enemyPool: ['fire_elemental', 'lava_golem', 'flame_drake', 'salamander', 'imp', 'demon_warrior'],
    bossId: 'flame_drake',
    characteristics: {
      statusAffinity: { high: ['burn'], chance: 45 },
      resistanceTheme: { type: 'magical', baseResistance: 20 },
      immunitiesTheme: ['burn']
    }
  },

  // ========== 高級（Lv60-110）- 凍土：氷系 ==========
  {
    id: 'frozen-tundra',
    name: '凍てつく凍土',
    description: '氷と雪に覆われた過酷な地。氷系の敵が支配し、魔法に強い。',
    levelRange: [60, 110],
    prereq: 'poison-marsh',
    tierWeights: { normal: 0.5, elite: 0.35, named: 0.15, boss: 0 },
    eliteChance: 0.17,
    namedChance: 0.06,
    lootWeights: { common: 0.5, rare: 0.38, epic: 0.11, legendary: 0.01 },
    chestLootWeights: { common: 0.45, rare: 0.38, epic: 0.13, legendary: 0.04 },
    chestChance: 0.13,
    enemyPool: ['ice_elemental', 'frost_giant', 'ice_dragon', 'yeti', 'frozen_lich'],
    bossId: 'ice_dragon',
    characteristics: {
      statusAffinity: { high: ['frozen'], chance: 48 },
      resistanceTheme: { type: 'magical', baseResistance: 25 },
      immunitiesTheme: ['frozen']
    }
  },

  // ========== 高級（Lv70-120）- 悪魔の塔：複合攻撃 ==========
  {
    id: 'demon-tower',
    name: '悪魔の塔',
    description: '悪魔が支配する暗い塔。複合的な状態異常を付与してくる。',
    levelRange: [70, 120],
    prereq: 'thunder-tower',
    tierWeights: { normal: 0.55, elite: 0.28, named: 0.17, boss: 0 },
    eliteChance: 0.16,
    namedChance: 0.06,
    lootWeights: { common: 0.55, rare: 0.36, epic: 0.08, legendary: 0.01 },
    chestLootWeights: { common: 0.5, rare: 0.36, epic: 0.11, legendary: 0.03 },
    chestChance: 0.13,
    enemyPool: ['imp', 'demon_warrior', 'void_walker', 'dark_priest', 'assassin'],
    characteristics: {
      statusAffinity: { high: ['poison', 'bleed', 'burn', 'curse'], chance: 42 },
      resistanceTheme: { type: 'mixed', baseResistance: 18 }
    }
  },

  // ========== 最高難易度（Lv150-300）- 呪われた大聖堂：状態異常地獄 ==========
  {
    id: 'cursed-cathedral',
    name: '呪われた大聖堂',
    description: '邪悪に侵された聖域。強力なアンデッドと悪魔が蔓延し、呪いと出血をばら撒く。',
    levelRange: [150, 300],
    prereq: 'volcanic-crater',
    tierWeights: { normal: 0.45, elite: 0.38, named: 0.15, boss: 0.02 },
    eliteChance: 0.2,
    namedChance: 0.08,
    lootWeights: { common: 0.45, rare: 0.4, epic: 0.14, legendary: 0.01 },
    chestLootWeights: { common: 0.4, rare: 0.4, epic: 0.16, legendary: 0.04 },
    chestChance: 0.14,
    enemyPool: ['lich', 'demon_warrior', 'vampire', 'death_knight', 'dark_priest', 'banshee', 'wraith'],
    bossId: 'death_knight',
    characteristics: {
      statusAffinity: { high: ['curse', 'bleed', 'stun'], chance: 50 },
      resistanceTheme: { type: 'mixed', baseResistance: 20 },
      immunitiesTheme: ['poison', 'bleed']
    }
  },

  // ========== 最高難易度（Lv200-350）- 深淵の奈落：複合耐性 ==========
  {
    id: 'abyssal-depths',
    name: '深淵の奈落',
    description: '暗黒の深層。あらゆる敵が出現し、複合的な耐性を持つ。',
    levelRange: [200, 350],
    prereq: 'frozen-tundra',
    tierWeights: { normal: 0.4, elite: 0.38, named: 0.2, boss: 0.02 },
    eliteChance: 0.24,
    namedChance: 0.12,
    lootWeights: { common: 0.4, rare: 0.42, epic: 0.16, legendary: 0.02 },
    chestLootWeights: { common: 0.36, rare: 0.42, epic: 0.18, legendary: 0.04 },
    chestChance: 0.15,
    enemyPool: ['lich', 'demon_warrior', 'storm_elemental', 'drake', 'golem', 'assassin', 'void_walker', 'wyvern', 'eldritch_horror'],
    bossId: 'eldritch_horror',
    characteristics: {
      statusAffinity: { high: ['poison', 'bleed', 'curse'], chance: 45 },
      resistanceTheme: { type: 'mixed', baseResistance: 22 },
      immunitiesTheme: ['poison', 'bleed', 'curse']
    }
  },

  // ========== 最高難易度（Lv250-400）- 魔晶の祭壇：魔法防御高 ==========
  {
    id: 'mana-shrine',
    name: '魔晶の祭壇',
    description: '魔力が満ちた祭壇。敵が高い魔法防御を持つ。',
    levelRange: [250, 400],
    prereq: 'demon-tower',
    tierWeights: { normal: 0.42, elite: 0.36, named: 0.2, boss: 0.02 },
    eliteChance: 0.22,
    namedChance: 0.1,
    lootWeights: { common: 0.42, rare: 0.4, epic: 0.15, legendary: 0.02 },
    chestLootWeights: { common: 0.38, rare: 0.4, epic: 0.17, legendary: 0.05 },
    chestChance: 0.14,
    enemyPool: ['mage', 'frozen_lich', 'dark_priest', 'storm_elemental', 'void_walker', 'chaos_apostle'],
    characteristics: {
      statusAffinity: { high: ['curse', 'stun'], chance: 40 },
      resistanceTheme: { type: 'magical', baseResistance: 30 },
      immunitiesTheme: ['burn', 'frozen']
    }
  },

  // ========== 伝説級（Lv350-550）- 竜の巣：竜族支配 ==========
  {
    id: 'dragons-lair',
    name: '竜の巣',
    description: '強大な竜が統べる領域。竜族敵が支配し、あらゆる攻撃に強い。',
    levelRange: [350, 550],
    prereq: 'cursed-cathedral',
    tierWeights: { normal: 0.35, elite: 0.38, named: 0.22, boss: 0.05 },
    eliteChance: 0.28,
    namedChance: 0.15,
    lootWeights: { common: 0.35, rare: 0.43, epic: 0.19, legendary: 0.03 },
    chestLootWeights: { common: 0.32, rare: 0.42, epic: 0.2, legendary: 0.06 },
    chestChance: 0.16,
    enemyPool: ['dragon', 'wyvern', 'drake', 'dragon_knight', 'dragon_shaman', 'ancient_dragon', 'chaos_apostle'],
    bossId: 'ancient_dragon',
    characteristics: {
      statusAffinity: { high: ['burn', 'bleed', 'curse'], chance: 42 },
      resistanceTheme: { type: 'mixed', baseResistance: 30 },
      immunitiesTheme: ['poison']
    }
  },

  // ========== 伝説級（Lv400-650）- 次元の狭間：複合防御 ==========
  {
    id: 'dimensional-rift',
    name: '次元の狭間',
    description: '次元が歪む異空間。複数の特性を持つ敵が出現する。',
    levelRange: [400, 650],
    prereq: 'abyssal-depths',
    tierWeights: { normal: 0.33, elite: 0.37, named: 0.25, boss: 0.05 },
    eliteChance: 0.3,
    namedChance: 0.18,
    lootWeights: { common: 0.33, rare: 0.43, epic: 0.21, legendary: 0.03 },
    chestLootWeights: { common: 0.3, rare: 0.43, epic: 0.21, legendary: 0.06 },
    chestChance: 0.17,
    enemyPool: ['dimension_guardian', 'void_walker', 'chaos_apostle', 'eldritch_horror', 'golem', 'ancient_dragon'],
    characteristics: {
      statusAffinity: { high: ['curse', 'stun', 'bleed'], chance: 48 },
      resistanceTheme: { type: 'mixed', baseResistance: 28 },
      immunitiesTheme: ['poison', 'bleed', 'burn', 'frozen']
    }
  },

  // ========== 究極難易度（Lv800-1000）- 虚無の核心：すべてを無効化 ==========
  {
    id: 'void-nexus',
    name: '虚無の核心',
    description: '現実が歪む異次元空間。究極の強敵。ほぼすべての状態異常が無効。',
    levelRange: [800, 1000],
    prereq: 'dragons-lair',
    tierWeights: { normal: 0.3, elite: 0.35, named: 0.25, boss: 0.1 },
    eliteChance: 0.32,
    namedChance: 0.2,
    lootWeights: { common: 0.3, rare: 0.4, epic: 0.22, legendary: 0.08 },
    chestLootWeights: { common: 0.26, rare: 0.4, epic: 0.24, legendary: 0.1 },
    chestChance: 0.2,
    enemyPool: ['void_walker', 'eldritch_horror', 'chaos_apostle', 'dimension_guardian', 'void_ruler', 'infinite_avatar'],
    bossId: 'void_ruler',
    characteristics: {
      statusAffinity: { high: ['curse', 'stun'], chance: 55 },
      resistanceTheme: { type: 'mixed', baseResistance: 35 },
      immunitiesTheme: ['poison', 'bleed', 'burn', 'frozen', 'stun', 'curse']
    }
  }
]
