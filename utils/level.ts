import type { Dungeon } from '~/types'

export const clampLevel = (level: number, dungeon?: Dungeon) => {
  const min = dungeon?.levelRange?.[0] ?? 1
  const max = dungeon?.levelRange?.[1] ?? Math.max(level, 1)
  return Math.min(Math.max(level, min), max)
}
