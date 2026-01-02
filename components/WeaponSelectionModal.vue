<template>
  <div v-if="show" class="weapon-selection-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>⚙️ 武器の付け替え</h2>
        <div class="gold-display">💰 {{ player.gold }}G</div>
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
        <h3>装備中の武器 ({{ player.weapons.length }}/4)</h3>
        <div v-if="player.weapons.length === 0" class="empty-slot">
          装備武器がありません
        </div>
        <div v-else class="weapon-list">
          <div
            v-for="weapon in player.weapons"
            :key="weapon.id"
            class="weapon-list-item"
            :style="{ borderColor: getWeaponRarityColor(weapon.rarity) }"
          >
            <div class="weapon-list-info">
              <div class="weapon-list-name">
                {{ weapon.name }}
                <span class="weapon-rarity-badge" :style="{ background: getWeaponRarityColor(weapon.rarity) }">{{ weapon.rarity }}</span>
              </div>
              <div class="weapon-list-type">{{ weapon.type }}</div>
              <div class="weapon-description">{{ weapon.description }}</div>
              <div class="weapon-list-stats">
                <Tooltip v-if="weapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                  <span>⚔️{{ weapon.stats.attack }}</span>
                </Tooltip>
                <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                  <span>✨{{ weapon.stats.magic }}</span>
                </Tooltip>
                <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                  <span>⚡{{ weapon.stats.speed }}</span>
                </Tooltip>
                <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                  <span>🎯{{ weapon.stats.critChance }}%</span>
                </Tooltip>
                <Tooltip v-if="weapon.stats.critDamage > 0" title="💥 クリティカルダメージ" content="クリティカル時のダメージ増加">
                  <span>💥{{ weapon.stats.critDamage }}%</span>
                </Tooltip>
                <Tooltip v-if="weapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                  <span>🔮{{ weapon.stats.statusPower }}</span>
                </Tooltip>
              </div>
              <div class="weapon-list-tags-effects">
                <Tooltip v-for="tag in weapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
                  <span class="mini-tag">{{ tag }}</span>
                </Tooltip>
                <Tooltip v-for="effect in weapon.effects" :key="effect.type" :title="effect.type" :content="getStatusDescription(effect.type)">
                  <span class="mini-effect">{{ effect.type }}</span>
                </Tooltip>
              </div>
            </div>
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
        <div v-else class="weapon-list">
          <div
            v-for="weapon in filteredWeapons"
            :key="weapon.id"
            class="weapon-list-item"
            :style="{ borderColor: getWeaponRarityColor(weapon.rarity) }"
            @click.stop="$emit('select', weapon)"
            style="cursor: pointer;"
          >
            <div class="weapon-list-info">
              <div class="weapon-list-name">
                {{ weapon.name }}
                <span class="weapon-rarity-badge" :style="{ background: getWeaponRarityColor(weapon.rarity) }">{{ weapon.rarity }}</span>
              </div>
              <div class="weapon-list-type">{{ weapon.type }}</div>
              <div class="weapon-description">{{ weapon.description }}</div>
              <div class="weapon-list-stats">
                <Tooltip v-if="weapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                  <span>⚔️{{ weapon.stats.attack }}</span>
                </Tooltip>
                <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                  <span>✨{{ weapon.stats.magic }}</span>
                </Tooltip>
                <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                  <span>⚡{{ weapon.stats.speed }}</span>
                </Tooltip>
                <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                  <span>🎯{{ weapon.stats.critChance }}%</span>
                </Tooltip>
                <Tooltip v-if="weapon.stats.critDamage > 0" title="💥 クリティカルダメージ" content="クリティカル時のダメージ増加">
                  <span>💥{{ weapon.stats.critDamage }}%</span>
                </Tooltip>
                <Tooltip v-if="weapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                  <span>🔮{{ weapon.stats.statusPower }}</span>
                </Tooltip>
              </div>
              <div class="weapon-list-tags-effects">
                <Tooltip v-for="tag in weapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
                  <span class="mini-tag">#{{ tag }}</span>
                </Tooltip>
                <Tooltip v-for="effect in weapon.effects" :key="effect.type" :title="effect.type" :content="getStatusDescription(effect.type)">
                  <span class="mini-effect">{{ effect.type }}</span>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tooltip from './Tooltip.vue'
import type { Player, Weapon } from '~/types'
import { getWeaponRarityColor, getTagDescription, getStatusDescription } from '~/utils/weaponPresentation'

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
</script>
