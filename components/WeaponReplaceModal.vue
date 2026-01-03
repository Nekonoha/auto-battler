<template>
  <div v-if="show && selectedWeapon" class="loot-modal">
    <div class="loot-content" style="max-width: 1400px;">
      <div class="modal-header">
        <h2>⚔️ 装備を置き換え</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>
      <p class="loot-subtitle">
        {{ playerWeapons.length < maxSlots ? '空きスロットまたは' : '' }}置き換える装備をクリックしてください
      </p>
      <div class="replacement-comparison-grid">
        <!-- 既存の武器 -->
        <div 
          v-for="(weapon, index) in playerWeapons" 
          :key="weapon.id" 
          class="replacement-comparison-card"
          @click="$emit('replace-weapon', index)"
        >
          <!-- 現在の装備 -->
          <div class="comparison-weapon-section">
            <div class="comparison-weapon-title">現在の装備</div>
            <WeaponDetails :weapon="weapon" :showRarityBadge="false" />
          </div>

          <!-- 矢印 -->
          <div class="comparison-arrow-section">
            <div class="comparison-arrow">→</div>
            <div class="comparison-click-hint">クリック</div>
          </div>

          <!-- 新しい装備 -->
          <div class="comparison-weapon-section">
            <div class="comparison-weapon-title">新しい装備</div>
            <WeaponDetails :weapon="selectedWeapon" :compareTo="weapon" :showRarityBadge="false" />
          </div>
        </div>
        
        <!-- 空きスロット -->
        <div 
          v-if="playerWeapons.length < maxSlots"
          class="replacement-comparison-card empty-slot-card"
          @click="$emit('add-to-empty-slot')"
        >
          <div class="comparison-weapon-section empty-slot-section">
            <div class="empty-slot-icon">➕</div>
            <div class="empty-slot-text">空きスロット</div>
            <div class="empty-slot-hint">クリックで追加</div>
          </div>
          
          <div class="comparison-arrow-section">
            <div class="comparison-arrow">→</div>
            <div class="comparison-click-hint">クリック</div>
          </div>
          
          <div class="comparison-weapon-section">
            <div class="comparison-weapon-title">新しい装備</div>
            <WeaponDetails :weapon="selectedWeapon" :showRarityBadge="false" />
          </div>
        </div>
      </div>
      <button class="btn btn-secondary" style="width: 100%; margin-top: 15px;" @click="$emit('close')">
        キャンセル
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Weapon } from '~/types'
import WeaponDetails from './WeaponDetails.vue'

interface Props {
  show: boolean
  selectedWeapon: Weapon | null
  playerWeapons: Weapon[]
  maxSlots: number
}

defineProps<Props>()

defineEmits<{
  close: []
  'replace-weapon': [index: number]
  'add-to-empty-slot': []
}>()
</script>

<style scoped>
/* 既存のスタイルはindex.vueから移動 */

/* WeaponReplaceModal レスポンシブ対応 */
@media (max-width: 768px) {
  :deep(.loot-modal) {
    padding: 10px !important;
  }

  :deep(.loot-content) {
    max-width: 100% !important;
    padding: 16px !important;
  }

  :deep(.modal-header) {
    margin-bottom: 12px;
  }

  :deep(.modal-header h2) {
    font-size: 18px;
    margin-bottom: 8px;
  }

  :deep(.loot-subtitle) {
    font-size: 13px;
    margin-bottom: 16px;
  }

  :deep(.replacement-comparison-grid) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  :deep(.replacement-comparison-card) {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }

  :deep(.comparison-arrow-section) {
    flex-direction: row;
    justify-content: center;
    gap: 8px;
    padding: 8px 0;
  }

  :deep(.comparison-arrow) {
    font-size: 20px;
  }

  :deep(.comparison-click-hint) {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  :deep(.loot-modal) {
    padding: 8px !important;
  }

  :deep(.loot-content) {
    max-width: 100% !important;
    padding: 12px !important;
  }

  :deep(.modal-header) {
    margin-bottom: 10px;
  }

  :deep(.modal-header h2) {
    font-size: 16px;
    margin-bottom: 6px;
  }

  :deep(.btn-close) {
    font-size: 24px;
    padding: 4px 8px;
  }

  :deep(.loot-subtitle) {
    font-size: 12px;
    margin-bottom: 12px;
  }

  :deep(.replacement-comparison-grid) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }

  :deep(.replacement-comparison-card) {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
    border-radius: 8px;
  }

  :deep(.comparison-weapon-section) {
    gap: 8px;
  }

  :deep(.comparison-weapon-title) {
    font-size: 11px;
    margin-bottom: 4px;
  }

  :deep(.comparison-arrow-section) {
    flex-direction: row;
    justify-content: center;
    gap: 6px;
    padding: 6px 0;
    align-items: center;
  }

  :deep(.comparison-arrow) {
    font-size: 18px;
  }

  :deep(.comparison-click-hint) {
    font-size: 10px;
  }

  :deep(.empty-slot-icon) {
    font-size: 24px;
  }

  :deep(.empty-slot-text) {
    font-size: 12px;
  }

  :deep(.empty-slot-hint) {
    font-size: 10px;
  }

  :deep(.btn) {
    font-size: 13px;
    padding: 8px 12px;
    margin-top: 12px !important;
  }
}
</style>
