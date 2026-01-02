<template>
  <div v-if="show" class="weapon-selection-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>⚙️ 武器の付け替え</h2>
        <div class="gold-display">💰 {{ player.gold }}G</div>
        <div class="rating-display">総合評価: {{ Math.round(equippedRatingTotal) }}</div>
        <div class="modal-header-buttons">
          <button class="btn btn-secondary btn-compact" @click="$emit('openSellMenu')" :disabled="isRunLocked">
            💰 売却
          </button>
          <button @click="$emit('close')" class="btn-close">×</button>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="$emit('close')">バトルに戻る</button>
      </div>

      <div class="current-weapons">
        <h3>装備中の武器 ({{ player.weapons.length }}/{{ player.weaponSlots }})</h3>
        <div v-if="player.weapons.length === 0" class="empty-slot">
          装備武器がありません
        </div>
        <div v-else class="weapon-grid">
          <div
            v-for="weapon in player.weapons"
            :key="weapon.id"
            class="weapon-list-item"
            :style="{ borderColor: getWeaponRarityColor(weapon.rarity) }"
          >
            <WeaponDetails :weapon="weapon" />
            <button
              class="btn btn-danger btn-compact"
              @click.stop="$emit('remove', weapon)"
              :disabled="isRunLocked"
            >
              外す
            </button>
          </div>
        </div>
      </div>

      <div class="available-weapons">
        <div class="weapons-header">
          <h3>利用可能な武器 ({{ filteredWeapons.length }})</h3>
          <div class="filter-controls">
            <select v-model="localRarityFilter" class="filter-select">
              <option value="all">全レア度</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
            <select v-model="localTypeFilter" class="filter-select">
              <option value="all">全タイプ</option>
              <option value="melee">melee</option>
              <option value="ranged">ranged</option>
              <option value="magic">magic</option>
              <option value="dot">dot</option>
            </select>
            <select v-model="localSortBy" class="filter-select">
              <option value="name">名前順</option>
              <option value="rarity">レア度順</option>
              <option value="attack">攻撃力順</option>
              <option value="magic">魔法力順</option>
              <option value="speed">速度順</option>
              <option value="defense">防御力順</option>
              <option value="magicDefense">魔法防御順</option>
              <option value="critChance">クリ率順</option>
              <option value="critDamage">クリダメ順</option>
              <option value="statusPower">状態異常威力順</option>
              <option value="rating">武器評価順</option>
              <option value="acquired">入手順</option>
            </select>
          </div>

          <div class="filter-section">
            <div class="filter-section-title">🏷️ タグフィルタ</div>
            <div class="tag-filters">
              <label v-for="tag in availableTags" :key="tag" class="tag-chip">
                <input type="checkbox" :value="tag" v-model="localSelectedTags" />
                <span>{{ tag }}</span>
              </label>
            </div>
          </div>

          <div class="filter-section">
            <div class="filter-section-title">✨ 効果フィルタ</div>
            <div class="effect-filters">
              <label v-for="effect in availableEffects" :key="effect" class="effect-chip">
                <input type="checkbox" :value="effect" v-model="localSelectedEffects" />
                <span>{{ effect }}</span>
              </label>
            </div>
          </div>
        </div>

        <div v-if="filteredWeapons.length === 0" class="empty-slot">
          条件に一致する武器がありません
        </div>
        <div v-else class="weapon-grid">
          <div
            v-for="weapon in filteredWeapons"
            :key="weapon.id"
            class="weapon-list-item selectable"
            :style="{ borderColor: getWeaponRarityColor(weapon.rarity) }"
            @click.stop="$emit('select', weapon)"
          >
            <WeaponDetails :weapon="weapon" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WeaponDetails from './WeaponDetails.vue'
import type { Player, Weapon } from '~/types'
import { getWeaponRarityColor } from '~/utils/weaponPresentation'
import { WeaponSystem } from '~/systems/WeaponSystem'

type Emits = {
  (e: 'close'): void
  (e: 'remove', weapon: Weapon): void
  (e: 'select', weapon: Weapon): void
  (e: 'openSellMenu'): void
  (e: 'update:rarityFilter', value: string): void
  (e: 'update:typeFilter', value: string): void
  (e: 'update:sortBy', value: string): void
  (e: 'update:selectedTags', value: string[]): void
  (e: 'update:selectedEffects', value: string[]): void
}

const props = defineProps<{
  show: boolean
  player: Player
  filteredWeapons: Weapon[]
  availableWeapons: Weapon[]
  rarityFilter: string
  typeFilter: string
  sortBy: string
  selectedTags: string[]
  selectedEffects: string[]
  availableTags: string[]
  availableEffects: string[]
  isRunLocked: boolean
}>()

const emit = defineEmits<Emits>()

const localRarityFilter = computed({
  get: () => props.rarityFilter,
  set: value => emit('update:rarityFilter', value)
})

const localTypeFilter = computed({
  get: () => props.typeFilter,
  set: value => emit('update:typeFilter', value)
})

const localSortBy = computed({
  get: () => props.sortBy,
  set: value => emit('update:sortBy', value)
})

const localSelectedTags = computed({
  get: () => props.selectedTags,
  set: value => emit('update:selectedTags', value)
})

const localSelectedEffects = computed({
  get: () => props.selectedEffects,
  set: value => emit('update:selectedEffects', value)
})

const equippedRatingTotal = computed(() =>
  props.player.weapons.reduce((sum, w) => sum + WeaponSystem.evaluateWeapon(w), 0)
)
</script>

<style scoped>
.weapon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

@media (min-width: 1100px) {
  .weapon-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.weapon-list-item {
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weapon-list-item.selectable {
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.weapon-list-item.selectable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
}

.empty-slot {
  text-align: center;
  padding: 16px;
  opacity: 0.7;
  background: rgba(0, 0, 0, 0.25);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
.rating-display {
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
}
</style>
