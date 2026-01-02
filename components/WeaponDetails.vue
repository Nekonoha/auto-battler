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
          ⚔️ {{ formatStatValue(weapon.stats.attack) }}
          <span v-if="hasDiff('attack')" class="stat-diff">{{ formatDiff('attack') }}</span>
        </span>
      </Tooltip>
      <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
        <span class="stat" :class="statClass('magic')">
          ✨ {{ formatStatValue(weapon.stats.magic) }}
          <span v-if="hasDiff('magic')" class="stat-diff">{{ formatDiff('magic') }}</span>
        </span>
      </Tooltip>
      <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
        <span class="stat" :class="statClass('speed')">
          ⚡ {{ formatStatValue(weapon.stats.speed) }}
          <span v-if="hasDiff('speed')" class="stat-diff">{{ formatDiff('speed') }}</span>
        </span>
      </Tooltip>
      <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
        <span class="stat" :class="statClass('critChance')">
          🎯 {{ formatStatValue(weapon.stats.critChance) }}%
          <span v-if="hasDiff('critChance')" class="stat-diff">{{ formatDiff('critChance') }}%</span>
        </span>
      </Tooltip>
      <Tooltip v-if="weapon.stats.critDamage > 1" title="💥 クリティカルダメージ" content="クリティカル時のダメージ倍率">
        <span class="stat" :class="statClass('critDamage')">
          💥 {{ formatStatValue(weapon.stats.critDamage) }}x
          <span v-if="hasDiff('critDamage')" class="stat-diff">{{ formatDiff('critDamage') }}</span>
        </span>
      </Tooltip>
      <Tooltip v-if="weapon.stats.statusPower > 0" title="🧿 状態異常威力" content="状態異常の効果を強化">
        <span class="stat" :class="statClass('statusPower')">
          🧿 {{ formatStatValue(weapon.stats.statusPower) }}
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

    <div v-if="weapon.traits" class="weapon-traits">
      <div class="trait-title">🛡️ 特性</div>
      <div class="trait-list">
        <Tooltip v-if="weapon.traits.physicalResistance" title="物理耐性" content="物理ダメージを軽減">
          <span class="trait-item">🛡️ 物理耐性 {{ weapon.traits.physicalResistance }}%</span>
        </Tooltip>
        <Tooltip v-if="weapon.traits.magicalResistance" title="魔法耐性" content="魔法ダメージを軽減">
          <span class="trait-item">🔮 魔法耐性 {{ weapon.traits.magicalResistance }}%</span>
        </Tooltip>
        <Tooltip v-if="weapon.traits.statusResistance" title="状態異常耐性" content="状態異常の効果を軽減">
          <span class="trait-item">✨ 状態異常耐性 {{ weapon.traits.statusResistance }}%</span>
        </Tooltip>
        <Tooltip v-if="weapon.traits.damageReduction" title="ダメージ軽減" content="受けるダメージを軽減">
          <span class="trait-item">💎 ダメージ軽減 {{ weapon.traits.damageReduction }}%</span>
        </Tooltip>
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

const minDisplay = (value: number, threshold = 0.1) => {
  if (value === 0) return 0
  const abs = Math.abs(value)
  if (abs < threshold) return threshold * Math.sign(value)
  return value
}

const formatNumber = (value: number, decimals = 2) => {
  if (!Number.isFinite(value)) return '0'
  if (Math.abs(value - Math.round(value)) < 1e-6) return Math.round(value).toString()
  return value.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d+?)0+$/, '$1')
}

const formatStatValue = (value: number) => formatNumber(value, 2)

const hasDiff = (key: keyof Weapon['stats']) => props.compareTo !== undefined && statDiff(key) !== 0

const statDiff = (key: keyof Weapon['stats']) => {
  if (!props.compareTo) return 0
  const diffRaw = props.weapon.stats[key] - props.compareTo.stats[key]
  const rounded = Math.round(diffRaw * 100) / 100
  if (rounded !== 0) return rounded
  return Math.round(minDisplay(diffRaw) * 100) / 100
}

const statClass = (key: keyof Weapon['stats']) => {
  const diff = statDiff(key)
  if (!props.compareTo || diff === 0) return ''
  return diff > 0 ? 'improved' : 'worse'
}

const formatDiff = (key: keyof Weapon['stats']) => {
  const diff = statDiff(key)
  if (diff === 0) return ''
  const adjusted = minDisplay(diff)
  const formatted = formatNumber(Math.abs(adjusted), 2)
  return diff > 0 ? `+${formatted}` : `-${formatted}`
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
  background: rgba(76, 175, 80, 0.25);
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.effect-badge.debuff {
  background: rgba(244, 67, 54, 0.25);
  border: 1px solid rgba(244, 67, 54, 0.5);
}

.weapon-traits {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 215, 0, 0.08);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.trait-title {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
}

.trait-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.trait-item {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid rgba(255, 215, 0, 0.4);
}

.compact {
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
