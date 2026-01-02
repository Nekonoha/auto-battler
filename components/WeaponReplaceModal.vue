<template>
  <div v-if="show && selectedWeapon" class="loot-modal">
    <div class="loot-content" style="max-width: 1400px;">
      <div class="modal-header">
        <h2>⚔️ 装備を置き換え</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>
      <p class="loot-subtitle">
        {{ playerWeapons.length < 4 ? '空きスロットまたは' : '' }}置き換える装備をクリックしてください
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
          v-if="playerWeapons.length < 4"
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
</style>
