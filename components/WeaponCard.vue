<template>
  <div 
    class="weapon-card"
    :style="{ borderColor: getRarityColor(weapon.rarity) }"
  >
    <div class="weapon-header">
      <div class="weapon-name">{{ weapon.name }}</div>
      <div class="header-badges">
        <div 
          class="weapon-rarity"
          :style="{ backgroundColor: getRarityColor(weapon.rarity) }"
        >
          {{ weapon.rarity.toUpperCase() }}
        </div>
      </div>
    </div>

    <div class="weapon-type-badge">
      <span class="type-icon">{{ getTypeIcon(weapon.type) }}</span>
      <span class="type-name">{{ weapon.type }}</span>
    </div>

    <div class="weapon-description">
      {{ weapon.description }}
    </div>

    <div class="weapon-stats">
      <div class="stat" v-if="weapon.stats.attack > 0">
        <span class="stat-label">⚔️</span>
        <span class="stat-value">{{ weapon.stats.attack }}</span>
      </div>
      <div class="stat" v-if="weapon.stats.magic > 0">
        <span class="stat-label">✨</span>
        <span class="stat-value">{{ weapon.stats.magic }}</span>
      </div>
      <div class="stat" v-if="weapon.stats.speed > 0">
        <span class="stat-label">⚡</span>
        <span class="stat-value">{{ weapon.stats.speed }}</span>
      </div>
      <div class="stat" v-if="weapon.stats.critChance > 0">
        <span class="stat-label">🎯</span>
        <span class="stat-value">{{ weapon.stats.critChance }}%</span>
      </div>
    </div>

    <div v-if="weapon.effects.length > 0" class="weapon-effects">
      <Tooltip 
        v-for="(effect, index) in weapon.effects" 
        :key="index"
        :title="`${getStatusIcon(effect.type)} ${getStatusName(effect.type)}`"
        :content="getStatusDescription(effect.type)"
      >
        <div 
          class="effect-badge"
          :style="{ backgroundColor: getStatusColor(effect.type) }"
        >
          {{ getStatusIcon(effect.type) }} {{ effect.type }} ({{ effect.chance }}%)
        </div>
      </Tooltip>
    </div>

    <div v-if="weapon.tags.length > 0" class="weapon-tags">
      <Tooltip 
        v-for="tag in weapon.tags" 
        :key="tag"
        :title="`#${tag}`"
        :content="getTagDescription(tag)"
      >
        <span class="tag">
          #{{ tag }}
        </span>
      </Tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Weapon, WeaponType } from '~/types'
import { WeaponSystem } from '~/systems/WeaponSystem'
import { StatusEffectSystem } from '~/systems/StatusEffectSystem'
import Tooltip from './Tooltip.vue'

defineProps<{
  weapon: Weapon
}>()

const getRarityColor = (rarity: string) => {
  return WeaponSystem.getRarityColor(rarity)
}

const getStatusIcon = (type: string) => {
  return StatusEffectSystem.getStatusIcon(type as any)
}

const getStatusColor = (type: string) => {
  return StatusEffectSystem.getStatusColor(type as any)
}

const getTypeIcon = (type: WeaponType) => {
  const icons: Record<WeaponType, string> = {
    melee: '⚔️',
    ranged: '🏹',
    magic: '🔮',
    dot: '☠️'
  }
  return icons[type]
}

const getStatusDescription = (type: string) => {
  return StatusEffectSystem.getStatusDescription(type as any)
}

const getStatusName = (type: string) => {
  const names: Record<string, string> = {
    poison: '毒',
    burn: '火傷',
    bleed: '出血',
    kissed: '口付け',
    epidemic: '疫病',
    slow: '鈍足',
    stun: '気絶',
    sleep: '睡眠',
    frozen: '凍結',
    petrification: '石化',
    fear: '恐怖',
    drunk: '酩酊',
    vulnerable: '虚弱',
    weak: '弱体',
    fleet: '俊足',
    armor: 'アーマー',
    thorn: '棘の鎧'
  }
  return names[type] || type
}

const getTagDescription = (tag: string) => {
  const descriptions: Record<string, string> = {
    fast: '攻撃速度が速い',
    heavy: '高ダメージだが遅い',
    precise: 'クリティカル率が高い',
    elemental: '属性攻撃を行う',
    cursed: '状態異常を付与する',
    bleeding: '出血効果を付与する'
  }
  return descriptions[tag] || ''
}
</script>

<style scoped>
.weapon-card {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 12px;
  padding: 15px;
  border: 3px solid;
  color: white;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.weapon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.weapon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header-badges {
  display: flex;
  gap: 6px;
  align-items: center;
}

.limit-break-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #1a1a2e;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.5);
}

.weapon-name {
  font-size: 18px;
  font-weight: bold;
}

.weapon-rarity {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.weapon-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-bottom: 10px;
  font-size: 13px;
  text-transform: uppercase;
}

.type-icon {
  font-size: 16px;
}

.weapon-description {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 12px;
  line-height: 1.4;
  font-style: italic;
}

.weapon-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
}

.weapon-effects {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.effect-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.weapon-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-size: 11px;
  opacity: 0.8;
}
</style>
