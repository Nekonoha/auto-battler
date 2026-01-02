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
        <Tooltip :title="`${getStatusIcon(effect.type)} ${getStatusName(effect.type)}`" :content="getStatusDescription(effect.type)">
          <span class="status-icon">{{ getStatusIcon(effect.type) }}</span>
          <span class="status-stacks">×{{ effect.stacks }}</span>
          <span class="status-duration">({{ effect.duration }}T)</span>
        </Tooltip>
      </div>
    </div>

    <!-- 敵のステータス -->
    <div class="enemy-stats-section">
      <h3 class="section-title">📊 ステータス</h3>
      <div class="stats-grid">
        <Tooltip title="⚔️ 攻撃力" :content="getStatTooltipContent('attack')">
          <div class="stat-item">
            <span class="stat-icon">⚔️</span>
            <div class="stat-info">
              <span class="stat-value">
                {{ getEnemyStat('attack').value }}
                <span class="stat-detail">({{ getEnemyStat('attack').base }})</span>
                <span v-if="getEnemyStat('attack').buff > 0" class="stat-buff">(+{{ getEnemyStat('attack').buff }})</span>
                <span v-if="getEnemyStat('attack').debuff > 0" class="stat-debuff">(-{{ getEnemyStat('attack').debuff }})</span>
              </span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="🔮 魔力" :content="getStatTooltipContent('magic')">
          <div class="stat-item">
            <span class="stat-icon">🔮</span>
            <div class="stat-info">
              <span class="stat-value">
                {{ getEnemyStat('magic').value }}
                <span class="stat-detail">({{ getEnemyStat('magic').base }})</span>
                <span v-if="getEnemyStat('magic').buff > 0" class="stat-buff">(+{{ getEnemyStat('magic').buff }})</span>
                <span v-if="getEnemyStat('magic').debuff > 0" class="stat-debuff">(-{{ getEnemyStat('magic').debuff }})</span>
              </span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="🛡️ 防御力" :content="getStatTooltipContent('defense')">
          <div class="stat-item">
            <span class="stat-icon">🛡️</span>
            <div class="stat-info">
              <span class="stat-value">
                {{ getEnemyStat('defense').value }}
                <span class="stat-detail">({{ getEnemyStat('defense').base }})</span>
                <span v-if="getEnemyStat('defense').buff > 0" class="stat-buff">(+{{ getEnemyStat('defense').buff }})</span>
                <span v-if="getEnemyStat('defense').debuff > 0" class="stat-debuff">(-{{ getEnemyStat('defense').debuff }})</span>
              </span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="✨ 魔法防御" :content="getStatTooltipContent('magicDefense')">
          <div class="stat-item">
            <span class="stat-icon">✨</span>
            <div class="stat-info">
              <span class="stat-value">
                {{ getEnemyStat('magicDefense').value }}
                <span class="stat-detail">({{ getEnemyStat('magicDefense').base }})</span>
                <span v-if="getEnemyStat('magicDefense').buff > 0" class="stat-buff">(+{{ getEnemyStat('magicDefense').buff }})</span>
                <span v-if="getEnemyStat('magicDefense').debuff > 0" class="stat-debuff">(-{{ getEnemyStat('magicDefense').debuff }})</span>
              </span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="⚡ 速度" :content="getStatTooltipContent('speed')">
          <div class="stat-item">
            <span class="stat-icon">⚡</span>
            <div class="stat-info">
              <span class="stat-value">
                {{ getEnemyStat('speed').value }}
                <span class="stat-detail">({{ getEnemyStat('speed').base }})</span>
                <span v-if="getEnemyStat('speed').buff > 0" class="stat-buff">(+{{ getEnemyStat('speed').buff }})</span>
                <span v-if="getEnemyStat('speed').debuff > 0" class="stat-debuff">(-{{ getEnemyStat('speed').debuff }})</span>
              </span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="🧿 状態異常威力" :content="getStatTooltipContent('statusPower')">
          <div class="stat-item">
            <span class="stat-icon">🧿</span>
            <div class="stat-info">
              <span class="stat-value">
                {{ getEnemyStat('statusPower').value }}
                <span class="stat-detail">({{ getEnemyStat('statusPower').base }})</span>
                <span v-if="getEnemyStat('statusPower').buff > 0" class="stat-buff">(+{{ getEnemyStat('statusPower').buff }})</span>
                <span v-if="getEnemyStat('statusPower').debuff > 0" class="stat-debuff">(-{{ getEnemyStat('statusPower').debuff }})</span>
              </span>
            </div>
          </div>
        </Tooltip>
        <Tooltip title="🩸 ライフスティール" :content="'与えたダメージの一部をHPとして吸収'">
          <div class="stat-item">
            <span class="stat-icon">🩸</span>
            <div class="stat-info">
              <span class="stat-value">
                {{ (getEnemyStat('lifeSteal')?.value ?? 0).toFixed(1) }}%
              </span>
            </div>
          </div>
        </Tooltip>
      </div>
    </div>

    <!-- 敵の特性（耐性・無効・状態異常付与） -->
    <div v-if="hasTraits" class="enemy-traits">
      <h3 class="traits-title">⚠️ 特性</h3>
      <div class="traits-list">
        <Tooltip v-if="enemy.traits?.physicalResistance" :title="getEnemyTraitName('physicalResistance')" :content="getEnemyTraitDescription('physicalResistance')">
          <div class="trait">
            <span class="trait-icon">{{ getEnemyTraitIcon('physicalResistance') }}</span>
            <span class="trait-text">{{ getEnemyTraitName('physicalResistance') }} {{ enemy.traits.physicalResistance }}%</span>
          </div>
        </Tooltip>
        <Tooltip v-if="enemy.traits?.magicalResistance" :title="getEnemyTraitName('magicalResistance')" :content="getEnemyTraitDescription('magicalResistance')">
          <div class="trait">
            <span class="trait-icon">{{ getEnemyTraitIcon('magicalResistance') }}</span>
            <span class="trait-text">{{ getEnemyTraitName('magicalResistance') }} {{ enemy.traits.magicalResistance }}%</span>
          </div>
        </Tooltip>
        <Tooltip v-if="enemy.traits?.attackImmunities && enemy.traits.attackImmunities.length > 0" :title="getEnemyTraitName('attackImmunities')" :content="getEnemyTraitDescription('attackImmunities')">
          <div class="trait">
            <span class="trait-icon">{{ getEnemyTraitIcon('attackImmunities') }}</span>
            <span class="trait-text">{{ getEnemyTraitName('attackImmunities') }}: {{ formatAttackTypes(enemy.traits.attackImmunities) }}</span>
          </div>
        </Tooltip>
        <Tooltip v-if="enemy.traits?.statusImmunities && enemy.traits.statusImmunities.length > 0" :title="getEnemyTraitName('statusImmunities')" :content="getEnemyTraitDescription('statusImmunities')">
          <div class="trait">
            <span class="trait-icon">{{ getEnemyTraitIcon('statusImmunities') }}</span>
            <span class="trait-text">{{ getEnemyTraitName('statusImmunities') }}: {{ formatStatusTypes(enemy.traits.statusImmunities) }}</span>
          </div>
        </Tooltip>
        <Tooltip v-if="hasStatusResistance('control')" title="制御耐性" :content="`睡眠・凍結・石化などの行動不能系状態異常が${getStatusResistancePercent('control')}%軽減される`">
          <div class="trait">
            <span class="trait-icon">🔒</span>
            <span class="trait-text">制御耐性 {{ getStatusResistancePercent('control') }}%</span>
          </div>
        </Tooltip>
        <Tooltip v-if="hasStatusResistance('damage')" title="ダメージ系耐性" :content="`毒・出血・火傷などの継続ダメージ系状態異常が${getStatusResistancePercent('damage')}%軽減される`">
          <div class="trait">
            <span class="trait-icon">🛡️</span>
            <span class="trait-text">継続ダメージ耐性 {{ getStatusResistancePercent('damage') }}%</span>
          </div>
        </Tooltip>
        <Tooltip v-if="hasStatusResistance('modifier')" title="能力低下耐性" :content="`弱体・恐怖などの能力低下系状態異常が${getStatusResistancePercent('modifier')}%軽減される`">
          <div class="trait">
            <span class="trait-icon">💪</span>
            <span class="trait-text">能力低下耐性 {{ getStatusResistancePercent('modifier') }}%</span>
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
import { useEnemyStatDisplay, getStatTooltipContent as getStatTooltip } from '~/composables/useStatDisplay'
import Tooltip from './Tooltip.vue'
import { getEnemyTraitName, getEnemyTraitDescription, getEnemyTraitIcon } from '~/data/traits'

const props = defineProps<{
  enemy: Enemy
}>()

const hpPercentage = computed(() => {
  const pct = (props.enemy.currentHp / props.enemy.maxHp) * 100
  return Math.min(100, Math.max(0, pct))
})

const minDisplay = (value: number, threshold = 0.1) => {
  if (value === 0) return 0
  const abs = Math.abs(value)
  if (abs < threshold) return threshold * Math.sign(value)
  return value
}

const hasTraits = computed(() => {
  const traits = props.enemy.traits
  if (!traits) return false
  return !!(
    traits.physicalResistance ||
    traits.magicalResistance ||
    (traits.attackImmunities && traits.attackImmunities.length > 0) ||
    (traits.statusImmunities && traits.statusImmunities.length > 0) ||
    hasStatusResistanceAny() ||
    (traits.inflictsStatus && traits.inflictsStatus.length > 0)
  )
})

const hasStatusResistanceAny = (): boolean => {
  const resMap = props.enemy.traits?.statusResistances
  if (!resMap) return false
  return Object.keys(resMap).length > 0
}

const hasStatusResistance = (category: 'control' | 'damage' | 'modifier'): boolean => {
  const resMap = props.enemy.traits?.statusResistances
  if (!resMap) return false
  return resMap[category] !== undefined && resMap[category]! > 0
}

const getStatusResistancePercent = (category: 'control' | 'damage' | 'modifier'): number => {
  const resMap = props.enemy.traits?.statusResistances
  if (!resMap) return 0
  const value = resMap[category]
  return value ? Math.max(0, value) : 0
}

const getStatusIcon = (type: string) => {
  return StatusEffectSystem.getStatusIcon(type as any)
}

const getStatusColor = (type: string) => {
  return StatusEffectSystem.getStatusColor(type as any)
}

const getStatusName = (type: StatusEffectType) => {
  return StatusEffectSystem.getStatusName(type)
}

const getStatusDescription = (type: StatusEffectType) => {
  return StatusEffectSystem.getStatusDescription(type)
}

type StatKey = 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed' | 'statusPower' | 'lifeSteal'

const statKeys: StatKey[] = ['attack', 'magic', 'defense', 'magicDefense', 'speed', 'statusPower', 'lifeSteal']

// useStatDisplay composable を使用
const { enemyStatDetails, getEnemyStat } = useEnemyStatDisplay(computed(() => props.enemy))

const getStatTooltipContent = (stat: StatKey): string => {
  const statDetail = getEnemyStat(stat)
  return getStatTooltip(statDetail, stat, (type: string) => StatusEffectSystem.getStatusName(type as any))
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

.stat-value {
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
}

.stat-detail {
  font-size: 11px;
  color: #4ade80;
  font-weight: 500;
}

.stat-debuff {
  font-size: 11px;
  color: #ff6b6b;
  font-weight: 600;
}

.stat-buff {
  font-size: 11px;
  color: #6ef3a6;
  font-weight: 600;
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
