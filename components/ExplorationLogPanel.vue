<template>
  <div class="exploration-log-panel">
    <div class="exploration-log-header">
      <span>🧭 探索ログ（最新{{ explorationTimeline.length }}件）</span>
      <span class="exploration-log-hint">ダンジョン中の戦闘と宝箱を時系列で表示</span>
    </div>
    <div class="exploration-log-list">
      <div 
        v-for="log in explorationTimeline" 
        :key="log.id"
        class="exploration-log-item"
      >
        <!-- 敵戦闘 -->
        <template v-if="log.eventType === 'battle'">
          <div class="exploration-log-main">
            <div class="exploration-log-title">
              <span class="chip dungeon-name">{{ log.dungeonName }}</span>
              <span class="chip tier" :class="log.enemyTier">{{ log.enemyTier }}</span>
              <span class="enemy-name">{{ log.enemyName }}</span>
            </div>
            <div class="exploration-log-meta">
              <span>Lv{{ log.enemyLevel }}</span>
              <span>結果: {{ log.result === 'victory' ? '勝利' : '敗北' }}</span>
              <span>ログ: {{ log.logs?.length || 0 }}件</span>
            </div>
          </div>
          <details class="exploration-log-details">
            <summary>詳細ログ</summary>
            <ul>
              <li v-for="entry in log.logs" :key="entry.turn + entry.message">
                <span class="turn">T{{ entry.turn }}</span>
                <span>{{ entry.message }}</span>
              </li>
            </ul>
          </details>
        </template>

        <!-- 宝箱イベント -->
        <template v-else-if="log.eventType === 'chest'">
          <div class="exploration-log-main">
            <div class="exploration-log-title">
              <span class="chip dungeon-name">{{ log.dungeonName }}</span>
              <span class="chip chest-event">💎 宝箱</span>
            </div>
            <div class="exploration-log-meta">
              <span>💎 宝箱を発見</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExplorationCombatLogEntry } from '~/types'

interface ExplorationTimelineEntry extends ExplorationCombatLogEntry {
  id: string
}

defineProps<{ explorationTimeline: ExplorationTimelineEntry[] }>()
</script>
