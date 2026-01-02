<template>
  <div class="unit-stats">
    <!-- HPバー -->
    <div class="hp-container">
      <div class="hp-label">
        <span>HP</span>
        <span>{{ unit.currentHp }} / {{ unit.maxHp }}</span>
      </div>
      <div class="hp-bar">
        <div 
          class="hp-bar-fill" 
          :style="{ width: hpPercentage + '%' }"
        ></div>
      </div>
    </div>

    <!-- 状態異常表示（バフ/デバフ分離） -->
    <div v-if="unit.statusEffects.length > 0" class="status-effects-wrapper">
      <div v-if="buffStatusEffects.length" class="status-group">
        <div class="status-group-title">🟢 バフ</div>
        <div class="status-effects">
          <Tooltip 
            v-for="effect in buffStatusEffects" 
            :key="effect.type"
            :title="getStatusName(effect.type)"
            :content="getStatusDescription(effect)"
          >
            <div 
              class="status-effect"
              :style="{ backgroundColor: getStatusColor(effect.type) }"
            >
              <span class="status-icon">{{ getStatusIcon(effect.type) }}</span>
              <span class="status-stacks">×{{ effect.stacks }}</span>
              <span class="status-duration">({{ effect.duration }}T)</span>
            </div>
          </Tooltip>
        </div>
      </div>

      <div v-if="debuffStatusEffects.length" class="status-group">
        <div class="status-group-title">🔴 デバフ</div>
        <div class="status-effects">
          <Tooltip 
            v-for="effect in debuffStatusEffects" 
            :key="effect.type"
            :title="getStatusName(effect.type)"
            :content="getStatusDescription(effect)"
          >
            <div 
              class="status-effect"
              :style="{ backgroundColor: getStatusColor(effect.type) }"
            >
              <span class="status-icon">{{ getStatusIcon(effect.type) }}</span>
              <span class="status-stacks">×{{ effect.stacks }}</span>
              <span class="status-duration">({{ effect.duration }}T)</span>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- ステータス -->
    <div class="stats-section">
      <h3 class="section-title">{{ sectionTitle }}</h3>
      <div class="stats-grid">
        <Tooltip title="⚔️ 攻撃力" content="物理ダメージの基礎値。防御力で軽減される。">
          <div class="stat-item">
            <span class="stat-icon">⚔️</span>
            <div class="stat-info">
              <span class="stat-name">攻撃力</span>
              <span class="stat-value">{{ getStatValue('attack') }}</span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="🔮 魔力" content="魔法ダメージの基礎値。魔法防御で軽減される。">
          <div class="stat-item">
            <span class="stat-icon">🔮</span>
            <div class="stat-info">
              <span class="stat-name">魔力</span>
              <span class="stat-value">{{ getStatValue('magic') }}</span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="🛡️ 防御力" content="物理攻撃のダメージを軽減する。">
          <div class="stat-item">
            <span class="stat-icon">🛡️</span>
            <div class="stat-info">
              <span class="stat-name">防御力</span>
              <span class="stat-value">{{ getStatValue('defense') }}</span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="✨ 魔法防御" content="魔法攻撃のダメージを軽減する。">
          <div class="stat-item">
            <span class="stat-icon">✨</span>
            <div class="stat-info">
              <span class="stat-name">魔法防御</span>
              <span class="stat-value">{{ getStatValue('magicDefense') }}</span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="⚡ 速度" content="行動速度。高いほど手数が増える。">
          <div class="stat-item">
            <span class="stat-icon">⚡</span>
            <div class="stat-info">
              <span class="stat-name">速度</span>
              <span class="stat-value">{{ getStatValue('speed') }}</span>
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player, Enemy, StatusEffect } from '~/types'
import { getStatusEffectDefinition, STATUS_EFFECTS_DB } from '~/data/statusEffects'
import { StatusEffectSystem } from '~/systems/StatusEffectSystem'

interface Props {
  unit: Player | Enemy
  sectionTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  sectionTitle: '📊 ステータス'
})

const hpPercentage = computed(() => {
  return (props.unit.currentHp / props.unit.maxHp) * 100
})

const buffStatusEffects = computed(() => props.unit.statusEffects.filter(e => STATUS_EFFECTS_DB[e.type as keyof typeof STATUS_EFFECTS_DB]?.type === 'Buff'))
const debuffStatusEffects = computed(() => props.unit.statusEffects.filter(e => STATUS_EFFECTS_DB[e.type as keyof typeof STATUS_EFFECTS_DB]?.type === 'Debuff'))

// PlayerとEnemyの両方に対応するため、statsプロパティを考慮
const getStatValue = (stat: 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed'): number => {
  const unit = props.unit
  // Playerの場合は直接プロパティにアクセス、Enemyの場合はstats経由
  if ('stats' in unit && unit.stats) {
    return unit.stats[stat] || 0
  }
  return (unit as any)[stat] || 0
}

const getStatusIcon = (type: string): string => StatusEffectSystem.getStatusIcon(type as any)

const getStatusColor = (type: string): string => StatusEffectSystem.getStatusColor(type as any)

const getStatusName = (type: string): string => StatusEffectSystem.getStatusName(type as any)

const getStatusDescription = (effect: StatusEffect): string => {
  const definition = getStatusEffectDefinition(effect.type as any)
  if (!definition) return '不明な効果'
  
  let desc = definition.description
  desc += `\n\nスタック: ${effect.stacks}`
  desc += `\n残りターン: ${effect.duration}`
  
  return desc
}
</script>

<style scoped>
.unit-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hp-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hp-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ecf0f1;
}

.hp-bar {
  width: 100%;
  height: 24px;
  background-color: #34495e;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #2c3e50;
}

.hp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #e74c3c 0%, #f39c12 50%, #27ae60 100%);
  transition: width 0.3s ease;
}

.status-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.status-effects-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.status-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-group-title {
  font-size: 0.8rem;
  font-weight: 700;
  opacity: 0.85;
}

.status-effect {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
  color: white;
  cursor: help;
  transition: transform 0.2s;
}

.status-effect:hover {
  transform: scale(1.1);
}

.status-icon {
  font-size: 1rem;
}

.status-stacks {
  font-weight: bold;
}

.status-duration {
  opacity: 0.8;
  font-size: 0.75rem;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #f39c12;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #34495e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #2c3e50;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: help;
}

.stat-item:hover {
  background-color: #34495e;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.stat-name {
  font-size: 0.85rem;
  color: #95a5a6;
  font-weight: 500;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ecf0f1;
}
</style>
