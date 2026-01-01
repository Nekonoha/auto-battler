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
    <div class="enemy-stats-section">
      <h3 class="section-title">📊 ステータス</h3>
      <div class="stats-grid">
        <Tooltip title="⚔️ 攻撃力" content="敵が与える物理ダメージ。防御力で軽減可能。">
          <div class="stat-item">
            <span class="stat-icon">⚔️</span>
            <div class="stat-info">
              <span class="stat-name">攻撃力</span>
              <span class="stat-value">{{ enemy.stats?.attack || 0 }}</span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="🔮 魔力" content="敵が与える魔法ダメージ。魔法防御で軽減可能。">
          <div class="stat-item">
            <span class="stat-icon">🔮</span>
            <div class="stat-info">
              <span class="stat-name">魔力</span>
              <span class="stat-value">{{ enemy.stats?.magic || 0 }}</span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="🛡️ 防御力" content="敵の物理防御力。攻撃ダメージを軽減する。">
          <div class="stat-item">
            <span class="stat-icon">🛡️</span>
            <div class="stat-info">
              <span class="stat-name">防御力</span>
              <span class="stat-value">{{ enemy.stats?.defense || 0 }}</span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="✨ 魔法防御" content="敵の魔法防御力。魔法ダメージを軽減する。">
          <div class="stat-item">
            <span class="stat-icon">✨</span>
            <div class="stat-info">
              <span class="stat-name">魔法防御</span>
              <span class="stat-value">{{ enemy.stats?.magicDefense || 0 }}</span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="⚡ 速度" content="敵の行動速度。高いほど先制攻撃しやすい。">
          <div class="stat-item">
            <span class="stat-icon">⚡</span>
            <div class="stat-info">
              <span class="stat-name">速度</span>
              <span class="stat-value">{{ enemy.stats?.speed || 0 }}</span>
            </div>
          </div>
        </Tooltip>
      </div>
    </div>

    <!-- 敵の特性（耐性・無効・状態異常付与） -->
    <div v-if="hasTraits" class="enemy-traits">
      <h3 class="traits-title">⚠️ 特性</h3>
      <div class="traits-list">
        <Tooltip v-if="enemy.traits?.physicalResistance" title="物理耐性" :content="`物理攻撃のダメージを${enemy.traits.physicalResistance}%軽減する`">
          <div class="trait">
            <span class="trait-icon">🛡️</span>
            <span class="trait-text">物理耐性 {{ enemy.traits.physicalResistance }}%</span>
          </div>
        </Tooltip>
        <Tooltip v-if="enemy.traits?.magicalResistance" title="魔法耐性" :content="`魔法攻撃のダメージを${enemy.traits.magicalResistance}%軽減する`">
          <div class="trait">
            <span class="trait-icon">🔮</span>
            <span class="trait-text">魔法耐性 {{ enemy.traits.magicalResistance }}%</span>
          </div>
        </Tooltip>
        <Tooltip v-if="enemy.traits?.attackImmunities && enemy.traits.attackImmunities.length > 0" title="攻撃無効" :content="`${enemy.traits.attackImmunities.join('・')}タイプの攻撃を完全に無効化する`">
          <div class="trait">
            <span class="trait-icon">🚫</span>
            <span class="trait-text">無効: {{ formatAttackTypes(enemy.traits.attackImmunities) }}</span>
          </div>
        </Tooltip>
        <Tooltip v-if="enemy.traits?.statusImmunities && enemy.traits.statusImmunities.length > 0" title="状態異常無効" :content="`${formatStatusTypes(enemy.traits.statusImmunities)}を無効化する`">
          <div class="trait">
            <span class="trait-icon">💊</span>
            <span class="trait-text">状態異常無効: {{ formatStatusTypes(enemy.traits.statusImmunities) }}</span>
          </div>
        </Tooltip>
        <div v-if="enemy.traits?.inflictsStatus && enemy.traits.inflictsStatus.length > 0" class="inflicts-container">
          <Tooltip 
            v-for="(inflict, idx) in enemy.traits.inflictsStatus" 
            :key="idx"
            :title="getStatusName(inflict.type) + '付与'"
            :content="`攻撃時に${inflict.chance * 100}%の確率で${getStatusName(inflict.type)}を${inflict.stacks}スタック付与（${inflict.duration}ターン）`"
          >
            <div class="trait">
              <span class="trait-icon">⚡</span>
              <span class="trait-text">{{ getStatusName(inflict.type) }}付与 {{ Math.round(inflict.chance * 100) }}%</span>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Enemy, WeaponType, StatusEffectType } from '~/types'
import { StatusEffectSystem } from '~/systems/StatusEffectSystem'

const props = defineProps<{
  enemy: Enemy
}>()

const hpPercentage = computed(() => {
  return (props.enemy.currentHp / props.enemy.maxHp) * 100
})

const hasTraits = computed(() => {
  const traits = props.enemy.traits
  if (!traits) return false
  return !!(
    traits.physicalResistance ||
    traits.magicalResistance ||
    (traits.attackImmunities && traits.attackImmunities.length > 0) ||
    (traits.statusImmunities && traits.statusImmunities.length > 0) ||
    (traits.inflictsStatus && traits.inflictsStatus.length > 0)
  )
})

const getStatusIcon = (type: string) => {
  return StatusEffectSystem.getStatusIcon(type as any)
}

const getStatusColor = (type: string) => {
  return StatusEffectSystem.getStatusColor(type as any)
}

const getStatusName = (type: StatusEffectType) => {
  const map: Partial<Record<StatusEffectType, string>> = {
    poison: '毒',
    bleed: '出血',
    burn: '炎上',
    frozen: '凍結',
    stun: 'スタン',
    weak: '脆弱',
    fear: '恐怖'
  }
  return map[type] || type
}

const formatAttackTypes = (types: WeaponType[]) => {
  const map: Partial<Record<WeaponType, string>> = {
    melee: '近接',
    ranged: '遠隔',
    magic: '魔法'
  }
  return types.map(t => map[t] || t).join('・')
}

const formatStatusTypes = (types: StatusEffectType[]) => {
  return types.map(t => getStatusName(t)).join('・')
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

.enemy-stats-section {
  margin-top: 15px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: bold;
  color: #4facfe;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.2s;
  cursor: help;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 22px;
  min-width: 24px;
  text-align: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.stat-name {
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-weight: bold;
  font-size: 18px;
  color: #fff;
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

.enemy-traits {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.traits-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #ffcc00;
}

.traits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.trait {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: rgba(255, 200, 0, 0.15);
  border: 1px solid rgba(255, 200, 0, 0.3);
  border-radius: 12px;
  font-size: 13px;
  font-weight: bold;
  color: #ffdd55;
  cursor: help;
  transition: all 0.2s;
}

.trait:hover {
  background: rgba(255, 200, 0, 0.25);
  border-color: rgba(255, 200, 0, 0.5);
}

.trait-icon {
  font-size: 14px;
}

.trait-text {
  font-size: 12px;
}

.inflicts-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
