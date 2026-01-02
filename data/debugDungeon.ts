import type { Dungeon } from '~/types'

export const DEBUG_DUNGEON_ID = 'debug-arena'

export const debugDungeon: Dungeon = {
  id: DEBUG_DUNGEON_ID,
  name: 'デバッグアリーナ',
  description: 'デバッグ用スパーリング。報酬なし。',
  levelRange: [1, 1],
  tierWeights: { normal: 1, elite: 0, named: 0, boss: 0 },
  lootWeights: { common: 0, rare: 0, epic: 0, legendary: 0 },
  chestChance: 0,
  enemyPool: ['デバッグターゲット'],
  prereq: undefined
}

export const getDungeonOptions = (base: Dungeon[]): Dungeon[] => {
  return [...base, debugDungeon]
}
