<template>
  <div class="enemy-info">
    <div class="heading">
      <h2>👾 {{ enemy.name }}</h2>
      <span class="tier-badge" :class="`tier-${enemy.tier}`">{{ tierLabel }}</span>
    </div>
    
    <!-- HPバー -->
    <div class="hp-container">
      <div class="hp-label">
        <span>HP</span>
        <span>{{ enemy.currentHp }} / {{ enemy.maxHp }}</span>
      </div>
      <div class="hp-bar">
        <div 
          class="hp-bar-fill" 
          :style="{ width: hpPercentage + '%' }"
        ></div>
      </div>
    </div>

    <!-- 状態異常表示 -->
    <div v-if="enemy.statusEffects.length > 0" class="status-effects">
      <div 
        v-for="effect in enemy.statusEffects" 
        :key="effect.type"
        class="status-effect"
        :style="{ backgroundColor: getStatusColor(effect.type) }"
      >
        <span class="status-icon">{{ getStatusIcon(effect.type) }}</span>
        <span class="status-stacks">×{{ effect.stacks }}</span>
        <span class="status-duration">({{ effect.duration }}T)</span>
      </div>
    </div>

    <!-- 敵のステータス -->
    <div class="enemy-stats">
      <div class="stat">
        <span class="stat-label">⚔️ 攻撃力:</span>
        <span class="stat-value">{{ enemy.stats?.attack || 0 }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">🛡️ 防御力:</span>
        <span class="stat-value">{{ enemy.stats?.defense || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Enemy } from '~/types'
import { StatusEffectSystem } from '~/systems/StatusEffectSystem'

const props = defineProps<{
  enemy: Enemy
}>()

const hpPercentage = computed(() => {
  return (props.enemy.currentHp / props.enemy.maxHp) * 100
})

const getStatusIcon = (type: string) => {
  return StatusEffectSystem.getStatusIcon(type as any)
}

const getStatusColor = (type: string) => {
  return StatusEffectSystem.getStatusColor(type as any)
}

const tierLabel = computed(() => {
  const map: Record<string, string> = {
    normal: '通常',
    elite: 'エリート',
    named: 'ネームド',
    boss: 'ボス'
  }
  return map[props.enemy.tier] ?? '通常'
})
</script>

<style scoped>
.enemy-info {
  background: linear-gradient(135deg, #2d1b2e 0%, #3d1f2e 100%);
  padding: 20px;
  border-radius: 12px;
  color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 100, 100, 0.3);
}

.heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

h2 {
  margin: 0;
  font-size: 24px;
}

.tier-badge {
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.tier-elite {
  background: rgba(52, 152, 219, 0.2);
  border-color: #3498db;
}

.tier-named {
  background: rgba(243, 156, 18, 0.25);
  border-color: #f39c12;
}

.hp-container {
  margin-bottom: 15px;
}

.hp-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: bold;
}

.hp-bar {
  width: 100%;
  height: 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.hp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  transition: width 0.3s ease;
}

.status-effects {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.status-effect {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.status-icon {
  font-size: 16px;
}

.status-stacks {
  font-size: 14px;
}

.status-duration {
  font-size: 11px;
  opacity: 0.8;
}

.enemy-stats {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.stat {
  display: flex;
  gap: 5px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
}

.stat-label {
  opacity: 0.9;
}

.stat-value {
  font-weight: bold;
}
</style>
