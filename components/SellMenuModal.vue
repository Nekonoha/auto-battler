<template>
  <div v-if="show" class="loot-modal">
    <div class="loot-content" style="max-height: 80vh; overflow-y: auto;">
      <div class="modal-header">
        <h2>💰 武器を売却</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>
      <p class="loot-subtitle">複数の武器を選択して一括売却できます</p>

      <div v-if="availableWeapons.length === 0" style="text-align: center; padding: 20px; opacity: 0.6;">
        売却可能な武器がありません
      </div>
      <div v-else>
        <div style="margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>
              選択中: {{ selectedCount }} 件
              <span v-if="selectedCount > 0">
                (合計 {{ totalGold }}G)
              </span>
            </span>
            <button
              v-if="selectedCount > 0"
              class="btn btn-success"
              @click="$emit('sell')"
            >
              売却実行
            </button>
          </div>
        </div>

        <div class="weapons-grid">
          <div
            v-for="weapon in availableWeapons"
            :key="weapon.id"
            class="sell-weapon-card"
            :class="{ 'sell-selected': selectedSellWeapons.has(weapon.id), 'sell-disabled': !canSellWeapon(weapon) }"
            :style="{ borderColor: selectedSellWeapons.has(weapon.id) ? '#4CAF50' : getWeaponRarityColor(weapon.rarity) }"
            @click="canSellWeapon(weapon) && $emit('toggle', weapon.id)"
          >
            <input
              type="checkbox"
              :checked="selectedSellWeapons.has(weapon.id)"
              :disabled="!canSellWeapon(weapon)"
              class="sell-checkbox"
            />

            <div class="sell-weapon-header">
              <div class="sell-weapon-name">{{ weapon.name }}</div>
              <span class="weapon-rarity-badge" :style="{ background: getWeaponRarityColor(weapon.rarity) }">{{ weapon.rarity }}</span>
            </div>
            <div class="sell-weapon-type">{{ weapon.type }}</div>
            <div class="sell-weapon-desc">{{ weapon.description }}</div>

            <div class="sell-weapon-stats">
              <Tooltip v-if="weapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                <span class="sell-stat">⚔️{{ weapon.stats.attack }}</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                <span class="sell-stat">✨{{ weapon.stats.magic }}</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                <span class="sell-stat">⚡{{ weapon.stats.speed }}</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                <span class="sell-stat">🎯{{ weapon.stats.critChance }}%</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.critDamage > 0" title="💥 クリティカルダメージ" content="クリティカル時のダメージ増加">
                <span class="sell-stat">💥{{ weapon.stats.critDamage }}%</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                <span class="sell-stat">🔮{{ weapon.stats.statusPower }}</span>
              </Tooltip>
            </div>

            <div class="sell-weapon-tags">
              <Tooltip v-for="tag in weapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
                <span class="sell-tag">#{{ tag }}</span>
              </Tooltip>
              <Tooltip v-for="effect in weapon.effects" :key="effect.type" :title="effect.type" :content="getStatusDescription(effect.type)">
                <span class="sell-effect">{{ effect.type }}</span>
              </Tooltip>
            </div>

            <div class="sell-weapon-value">
              売値: <strong>{{ (weapon as any).sellValue || 10 }}G</strong>
            </div>

            <div v-if="!canSellWeapon(weapon)" class="sell-weapon-disabled">
              {{ weapon.id === initialWeaponId ? '初期装備（売却不可）' : '装備中' }}
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn-secondary" style="width: 100%; margin-top: 15px;" @click="$emit('close')">
        閉じる
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tooltip from './Tooltip.vue'
import type { Weapon } from '~/types'
import { getStatusDescription, getTagDescription, getWeaponRarityColor } from '~/utils/weaponPresentation'

type Emits = {
  (e: 'close'): void
  (e: 'toggle', id: string): void
  (e: 'sell'): void
}

const props = defineProps<{
  show: boolean
  availableWeapons: Weapon[]
  selectedSellWeapons: Set<string>
  canSellWeapon: (weapon: Weapon) => boolean
  initialWeaponId: string
}>()

const emit = defineEmits<Emits>()

const selectedCount = computed(() => props.selectedSellWeapons.size)
const totalGold = computed(() => {
  let total = 0
  props.availableWeapons.forEach(w => {
    if (props.selectedSellWeapons.has(w.id)) {
      total += (w as any).sellValue || 10
    }
  })
  return total
})
</script>
