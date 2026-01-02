import { ref, computed, type Ref } from 'vue'
import type { Dungeon } from '~/types'
import { dungeons } from '~/data/dungeons'
import { getDungeonOptions, DEBUG_DUNGEON_ID } from '~/data/debugDungeon'

/**
 * ゲーム状態管理（ダンジョン選択、レベル管理）
 */
export function useGameState(player: any) {
  const currentLevel = ref(1)
  const selectedDungeonId = ref<string>((player.unlockedDungeons?.[0] ?? dungeons[0]?.id) || '')
  
  const dungeonOptions = computed(() => getDungeonOptions(dungeons))
  
  const unlockedDungeonIds = computed(() => {
    const list = Array.isArray(player.unlockedDungeons) ? player.unlockedDungeons : []
    return list.length ? list : ['tutorial-field']
  })
  
  const isDungeonUnlocked = (dungeonId: string) => 
    dungeonId === DEBUG_DUNGEON_ID || unlockedDungeonIds.value.includes(dungeonId)
  
  const firstUnlockedDungeonId = computed(() => unlockedDungeonIds.value[0] ?? '')
  
  const selectedDungeon = computed<Dungeon | undefined>(() =>
    dungeonOptions.value.find(d => d.id === selectedDungeonId.value)
  )

  return {
    currentLevel,
    selectedDungeonId,
    dungeonOptions,
    unlockedDungeonIds,
    isDungeonUnlocked,
    firstUnlockedDungeonId,
    selectedDungeon
  }
}
