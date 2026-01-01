import type { Dungeon } from '../types'

export const dungeons: Dungeon[] = [
  {
    id: 'beginner-cave',
    name: '初心の洞窟',
    description: '基礎を学ぶための安全な洞窟。報酬は控えめ。',
    levelRange: [1, 3],
    tierWeights: { normal: 0.75, elite: 0.2, named: 0.05, boss: 0 },
    lootWeights: { common: 0.7, rare: 0.25, epic: 0.05, legendary: 0.0 },
    chestChance: 0.08
  },
  {
    id: 'ancient-ruins',
    name: '古代の遺跡',
    description: '少し難しい遺跡。エリートが頻出し、レア武器が期待できる。',
    levelRange: [4, 7],
    tierWeights: { normal: 0.55, elite: 0.3, named: 0.15, boss: 0 },
    lootWeights: { common: 0.45, rare: 0.35, epic: 0.18, legendary: 0.02 },
    chestChance: 0.12
  },
  {
    id: 'abyssal-depths',
    name: '深淵の奈落',
    description: '最難関。ネームドが出現し、伝説級の報酬が狙える。',
    levelRange: [8, 12],
    tierWeights: { normal: 0.35, elite: 0.4, named: 0.25, boss: 0 },
    lootWeights: { common: 0.2, rare: 0.35, epic: 0.3, legendary: 0.15 },
    chestChance: 0.15
  }
]
