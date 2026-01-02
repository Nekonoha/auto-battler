<template>
  <div class="weapon-card" :class="{ compact }" :style="{ borderColor: getWeaponRarityColor(weapon.rarity) }">
    <div class="weapon-header">
      <div class="weapon-title-row">
        <span class="weapon-name">{{ weapon.name }}</span>
        <span
          v-if="showRarityBadge"
          class="weapon-rarity"
          :style="{ backgroundColor: getWeaponRarityColor(weapon.rarity) }"
        >
          {{ weapon.rarity.toUpperCase() }}
        </span>
      </div>
      <div class="weapon-subtitle">
        <span class="weapon-type">{{ weapon.type }}</span>
        <span v-if="showDesc" class="weapon-description">{{ weapon.description }}</span>
      </div>
    </div>

    <div class="weapon-stats">
      <Tooltip v-if="weapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
        <span class="stat" :class="statClass('attack')">
          ⚔️ {{ weapon.stats.attack }}
          <span v-if="hasDiff('attack')" class="stat-diff">{{ formatDiff('attack') }}</span>
        </span>
      </Tooltip>
      <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
        <span class="stat" :class="statClass('magic')">
          ✨ {{ weapon.stats.magic }}
          <span v-if="hasDiff('magic')" class="stat-diff">{{ formatDiff('magic') }}</span>
        </span>
      </Tooltip>
      <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
        <span class="stat" :class="statClass('speed')">
          ⚡ {{ weapon.stats.speed }}
          <span v-if="hasDiff('speed')" class="stat-diff">{{ formatDiff('speed') }}</span>
        </span>
      </Tooltip>
      <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
        <span class="stat" :class="statClass('critChance')">
          🎯 {{ weapon.stats.critChance }}%
          <span v-if="hasDiff('critChance')" class="stat-diff">{{ formatDiff('critChance') }}%</span>
        </span>
      </Tooltip>
      <Tooltip v-if="weapon.stats.critDamage > 1" title="💥 クリティカルダメージ" content="クリティカル時のダメージ倍率">
        <span class="stat" :class="statClass('critDamage')">
          💥 {{ weapon.stats.critDamage }}x
          <span v-if="hasDiff('critDamage')" class="stat-diff">{{ formatDiff('critDamage') }}</span>
        </span>
      </Tooltip>
      <Tooltip v-if="weapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
        <span class="stat" :class="statClass('statusPower')">
          🔮 {{ weapon.stats.statusPower }}
          <span v-if="hasDiff('statusPower')" class="stat-diff">{{ formatDiff('statusPower') }}</span>
        </span>
      </Tooltip>
    </div>

    <div class="weapon-tags-effects">
      <div class="weapon-tags" v-if="weapon.tags.length">
        <Tooltip v-for="tag in weapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
          <span class="tag">#{{ tag }}</span>
        </Tooltip>
      </div>

      <div v-if="weapon.effects.length" class="weapon-effects">
        <div v-if="buffEffects.length" class="effect-group">
          <span class="effect-group-title">🟢 バフ</span>
          <Tooltip
            v-for="effect in buffEffects"
            :key="`${effect.type}-buff`"
            :title="`${getStatusIcon(effect.type)} ${getStatusName(effect.type)}`"
            :content="effectDetail(effect)">
            <span class="effect-badge buff">{{ getStatusName(effect.type) }}</span>
          </Tooltip>
        </div>
        <div v-if="debuffEffects.length" class="effect-group">
          <span class="effect-group-title">🔴 デバフ</span>
          <Tooltip
            v-for="effect in debuffEffects"
            :key="`${effect.type}-debuff`"
            :title="`${getStatusIcon(effect.type)} ${getStatusName(effect.type)}`"
            :content="effectDetail(effect)">
            <span class="effect-badge debuff">{{ getStatusName(effect.type) }}</span>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tooltip from './Tooltip.vue'
import type { Weapon } from '~/types'
import { getTagDescription, getStatusDescription, getWeaponRarityColor } from '~/utils/weaponPresentation'
import { StatusEffectSystem } from '~/systems/StatusEffectSystem'
import { STATUS_EFFECTS_DB } from '~/data/statusEffects'

const props = defineProps<{
  weapon: Weapon
  compareTo?: Weapon
  showRarityBadge?: boolean
  compact?: boolean
  showDescription?: boolean
}>()

const showDesc = computed(() => props.showDescription ?? !props.compact)

const hasDiff = (key: keyof Weapon['stats']) => props.compareTo !== undefined && statDiff(key) !== 0

const statDiff = (key: keyof Weapon['stats']) => {
  if (!props.compareTo) return 0
  return props.weapon.stats[key] - props.compareTo.stats[key]
}

const statClass = (key: keyof Weapon['stats']) => {
  const diff = statDiff(key)
  if (!props.compareTo || diff === 0) return ''
  return diff > 0 ? 'improved' : 'worse'
}

const formatDiff = (key: keyof Weapon['stats']) => {
  const diff = statDiff(key)
  if (diff === 0) return ''
  return diff > 0 ? `+${diff}` : `${diff}`
}

const getEffectKind = (type: string) => STATUS_EFFECTS_DB[type as keyof typeof STATUS_EFFECTS_DB]?.type || 'Debuff'
const classifyEffects = (effects: Weapon['effects'], kind: 'Buff' | 'Debuff') => effects.filter(effect => getEffectKind(effect.type) === kind)

const buffEffects = computed(() => classifyEffects(props.weapon.effects, 'Buff'))
const debuffEffects = computed(() => classifyEffects(props.weapon.effects, 'Debuff'))

const effectDetail = (effect: Weapon['effects'][number]) => {
  const desc = getStatusDescription(effect.type)
  return `${desc}<br>確率: ${effect.chance}% | スタック: ${effect.stacks} | 持続: ${effect.duration}T` as string
}

const getStatusIcon = (type: string) => StatusEffectSystem.getStatusIcon(type as any)
const getStatusName = (type: string) => StatusEffectSystem.getStatusName(type as any)
</script>

<style scoped>
.weapon-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
}

.weapon-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.weapon-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}

.weapon-name {
  font-weight: 700;
  font-size: 15px;
}

.weapon-rarity {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: #fff;
  letter-spacing: 0.4px;
}

.weapon-subtitle {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  opacity: 0.85;
}

.weapon-description {
  opacity: 0.8;
}

.weapon-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
}

.stat-diff {
  font-size: 11px;
  opacity: 0.9;
}

.improved {
  color: #4caf50;
}

.worse {
  color: #e57373;
}

.weapon-tags-effects {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.weapon-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 3px 7px;
  border-radius: 8px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.1);
}

.weapon-effects {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.effect-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.effect-group-title {
  font-size: 12px;
  opacity: 0.85;
  min-width: 60px;
}

.effect-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.12);
}

.effect-badge.buff {
  background: rgba(46, 204, 113, 0.16);
  color: #8ee0b0;
}

.effect-badge.debuff {
  background: rgba(231, 76, 60, 0.16);
  color: #f29c9c;
}

.compact .weapon-description {
  display: none;
}

.compact .weapon-stats {
  gap: 4px;
}
</style>
