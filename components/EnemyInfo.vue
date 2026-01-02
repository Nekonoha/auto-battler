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
    <div v-if="enemy.statusEffects.length > 0" class="status-effects-wrapper accordion">
      <div class="section-header accordion-header" @click="toggleSection('statusEffects')">
        <h3 class="section-title">⚡ 状態異常 <span class="accordion-toggle">{{ expandedSections.statusEffects ? '▼' : '▶' }}</span></h3>
      </div>
      <div v-show="expandedSections.statusEffects" class="status-effects-content">
        <div v-if="buffStatusEffects.length" class="status-group">
          <div class="status-group-title">🟢 バフ</div>
          <div class="status-effects">
            <div 
              v-for="effect in buffStatusEffects" 
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
        </div>

        <div v-if="debuffStatusEffects.length" class="status-group">
          <div class="status-group-title">🔴 デバフ</div>
          <div class="status-effects">
            <div 
              v-for="effect in debuffStatusEffects" 
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
        </div>
      </div>
    </div>

    <!-- 敵のステータス（メイン＋サブを1アコーディオン内に） -->
    <div class="enemy-stats-section accordion">
      <div class="section-header accordion-header" @click="toggleSection('stats')">
        <h3 class="section-title">⚖ ステータス <span class="accordion-toggle">{{ expandedSections.stats ? '▼' : '▶' }}</span></h3>
      </div>
      <div v-show="expandedSections.stats">
        <!-- メインステータス -->
        <div class="stats-subsection">
          <div class="section-header accordion-header" @click="toggleSection('mainStats')">
            <h3 class="section-title" style="font-size: 14px; margin: 0;">メイン <span class="accordion-toggle">{{ expandedSections.mainStats ? '▼' : '▶' }}</span></h3>
          </div>
          <div v-show="expandedSections.mainStats" class="stats-grid stats-grid-2col">
            <Tooltip :title="formatStatTitle('attack')" :content="getStatTooltipContent('attack')">
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
            <Tooltip :title="formatStatTitle('magic')" :content="getStatTooltipContent('magic')">
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
            <Tooltip :title="formatStatTitle('defense')" :content="getStatTooltipContent('defense')">
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
            <Tooltip :title="formatStatTitle('magicDefense')" :content="getStatTooltipContent('magicDefense')">
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
            <Tooltip :title="formatStatTitle('speed')" :content="getStatTooltipContent('speed')">
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
            <Tooltip :title="formatStatTitle('statusPower')" :content="getStatTooltipContent('statusPower')">
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
          </div>
        </div>

        <!-- サブステータス -->
        <div class="stats-subsection">
          <div class="section-header accordion-header" @click="toggleSection('substats')">
            <h3 class="section-title" style="font-size: 14px; margin: 0;">サブ <span class="accordion-toggle">{{ expandedSections.substats ? '▼' : '▶' }}</span></h3>
          </div>
          <div v-show="expandedSections.substats" class="stats-grid stats-grid-2col">
            <Tooltip :title="formatStatTitle('lifeSteal')" :content="getStatSubstatsDescription('lifeSteal')">
              <div class="stat-item">
                <span class="stat-icon">🩸</span>
                <div class="stat-info">
                  <span class="stat-value">
                    {{ getEnemyStat('lifeSteal')?.value ?? 0 }}%
                    <span class="stat-detail">(基礎値のみ)</span>
                  </span>
                </div>
              </div>
            </Tooltip>
            <Tooltip :title="formatStatTitle('critChance')" :content="getStatSubstatsDescription('critChance')">
              <div class="stat-item">
                <span class="stat-icon">🎯</span>
                <div class="stat-info">
                  <span class="stat-value">
                    {{ getEnemyStat('critChance')?.value ?? 0 }}%
                    <span class="stat-detail">(基礎値のみ)</span>
                  </span>
                </div>
              </div>
            </Tooltip>
            <Tooltip :title="formatStatTitle('critDamage')" :content="getStatSubstatsDescription('critDamage')">
              <div class="stat-item">
                <span class="stat-icon">💥</span>
                <div class="stat-info">
                  <span class="stat-value">
                    {{ getEnemyStat('critDamage')?.value ?? 0 }}%
                    <span class="stat-detail">(基礎値のみ)</span>
                  </span>
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- 敵の特性（耐性・無効・状態異常付与） -->
    <div v-if="traitEntries.length" class="enemy-traits section-with-action accordion">
      <div class="section-header accordion-header" @click="toggleSection('traits')">
        <h3> ⚠️ 特性  <span class="accordion-toggle">{{ expandedSections.traits ? '▼' : '▶' }}</span></h3>
      </div>
      <div v-show="expandedSections.traits" class="traits-display">
        <Tooltip
          v-for="trait in traitEntries"
          :key="trait.key"
          :title="trait.title"
          :content="trait.description"
        >
          <div class="trait-item">
            <div class="trait-label">{{ trait.icon }} {{ trait.title }}</div>
            <div class="trait-value">{{ trait.value }}</div>
          </div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Enemy, WeaponType, StatusEffectType, StatusEffect } from '~/types'
import { StatusEffectSystem } from '~/systems/StatusEffectSystem'
import { getStatusEffectDefinition } from '~/data/statusEffects'
import { getStatDefinition, formatStatTitle, getStatSubstatsDescription } from '~/data/statDefinitions'
import { useEnemyStatDisplay, getStatTooltipContent as getStatTooltip } from '~/composables/useStatDisplay'
import Tooltip from './Tooltip.vue'
import { getEnemyTraitName, getEnemyTraitDescription, getEnemyTraitIcon } from '~/data/traits'

const props = defineProps<{
  enemy: Enemy
}>()

// アコーディオン状態管理
const expandedSections = ref({
  stats: true,
  mainStats: true,
  traits: true,
  statusEffects: true,
  substats: true
})

const toggleSection = (section: keyof typeof expandedSections.value) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

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

const hasTraits = computed(() => traitEntries.value.length > 0)

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

type StatKey = 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed' | 'statusPower' | 'lifeSteal' | 'critChance' | 'critDamage'

const statKeys: StatKey[] = ['attack', 'magic', 'defense', 'magicDefense', 'speed', 'statusPower', 'lifeSteal', 'critChance', 'critDamage']

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

type TraitEntry = {
  key: string
  title: string
  icon: string
  value: string
  description: string
}

const traitEntries = computed<TraitEntry[]>(() => {
  const traits = props.enemy.traits
  if (!traits) return []

  const entries: TraitEntry[] = []

  if (traits.physicalResistance) {
    entries.push({
      key: 'physicalResistance',
      title: getEnemyTraitName('physicalResistance'),
      icon: getEnemyTraitIcon('physicalResistance'),
      value: `${traits.physicalResistance}%`,
      description: getEnemyTraitDescription('physicalResistance')
    })
  }

  if (traits.magicalResistance) {
    entries.push({
      key: 'magicalResistance',
      title: getEnemyTraitName('magicalResistance'),
      icon: getEnemyTraitIcon('magicalResistance'),
      value: `${traits.magicalResistance}%`,
      description: getEnemyTraitDescription('magicalResistance')
    })
  }

  if (traits.resistancePenetration) {
    entries.push({
      key: 'resistancePenetration',
      title: getEnemyTraitName('resistancePenetration'),
      icon: getEnemyTraitIcon('resistancePenetration'),
      value: `${traits.resistancePenetration}%`,
      description: getEnemyTraitDescription('resistancePenetration')
    })
  }

  if (traits.attackImmunities && traits.attackImmunities.length > 0) {
    entries.push({
      key: 'attackImmunities',
      title: getEnemyTraitName('attackImmunities'),
      icon: getEnemyTraitIcon('attackImmunities'),
      value: formatAttackTypes(traits.attackImmunities),
      description: getEnemyTraitDescription('attackImmunities')
    })
  }

  if (traits.statusImmunities && traits.statusImmunities.length > 0) {
    entries.push({
      key: 'statusImmunities',
      title: getEnemyTraitName('statusImmunities'),
      icon: getEnemyTraitIcon('statusImmunities'),
      value: formatStatusTypes(traits.statusImmunities),
      description: getEnemyTraitDescription('statusImmunities')
    })
  }

  const resMap = traits.statusResistances
  if (resMap?.control && resMap.control > 0) {
    entries.push({
      key: 'statusResistance-control',
      title: '制御耐性',
      icon: '🔒',
      value: `${getStatusResistancePercent('control')}%`,
      description: `睡眠・凍結・石化などの行動不能系状態異常が${getStatusResistancePercent('control')}%軽減される`
    })
  }
  if (resMap?.damage && resMap.damage > 0) {
    entries.push({
      key: 'statusResistance-damage',
      title: '継続ダメージ耐性',
      icon: '🛡️',
      value: `${getStatusResistancePercent('damage')}%`,
      description: `毒・出血・火傷などの継続ダメージ系状態異常が${getStatusResistancePercent('damage')}%軽減される`
    })
  }
  if (resMap?.modifier && resMap.modifier > 0) {
    entries.push({
      key: 'statusResistance-modifier',
      title: '能力低下耐性',
      icon: '💪',
      value: `${getStatusResistancePercent('modifier')}%`,
      description: `弱体・恐怖などの能力低下系状態異常が${getStatusResistancePercent('modifier')}%軽減される`
    })
  }

  if (traits.inflictsStatus && traits.inflictsStatus.length > 0) {
    traits.inflictsStatus.forEach((inflict, idx) => {
      const chancePct = Math.round(inflict.chance * 100)
      entries.push({
        key: `inflict-${inflict.type}-${idx}`,
        title: `${getStatusName(inflict.type)}付与`,
        icon: '⚡',
        value: `${chancePct}% / ${inflict.stacks}stack`,
        description: `攻撃時に${chancePct}%の確率で${getStatusName(inflict.type)}を${inflict.stacks}スタック付与（${inflict.duration}ターン）`
      })
    })
  }

  return entries
})

const tierLabel = computed(() => {
  const map: Record<string, string> = {
    normal: '通常',
    elite: 'エリート',
    named: 'ネームド',
    boss: 'ボス'
  }
  return map[props.enemy.tier] ?? '通常'
})

const classifyEffect = (effect: StatusEffect): 'buff' | 'debuff' => {
  const def = getStatusEffectDefinition(effect.type as any)
  if (def?.type === 'Buff') return 'buff'
  if (def?.type === 'Debuff') return 'debuff'
  return effect.isBuff ? 'buff' : 'debuff'
}

const buffStatusEffects = computed(() => props.enemy.statusEffects.filter((effect: StatusEffect) => classifyEffect(effect) === 'buff'))
const debuffStatusEffects = computed(() => props.enemy.statusEffects.filter((effect: StatusEffect) => classifyEffect(effect) === 'debuff'))
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

.status-effects-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-group-title {
  font-weight: bold;
  font-size: 14px;
  color: #c5f6fa;
  display: flex;
  align-items: center;
  gap: 6px;
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
  padding: 0;
  background: transparent;
  border-radius: 0;
  border: none;
}

.section-with-action {
  margin-top: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  color: #e0e0e0;
  font-size: 16px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: bold;
  color: #e0e0e0;
}

.status-effects-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.stats-grid-3col {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stats-subsection {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: help;
}

.stat-icon {
  font-size: 16px;
  min-width: 18px;
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
  color: #e0e0e0;
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

.traits-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.trait-item {
  padding: 12px;
  background: rgba(255, 215, 0, 0.08);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: help;
  transition: all 0.2s ease;
}

.trait-item:hover {
  background: rgba(255, 215, 0, 0.12);
  border-color: rgba(255, 215, 0, 0.5);
  transform: translateY(-1px);
}

.trait-label {
  font-size: 12px;
  font-weight: 600;
  color: #ffd700;
  opacity: 0.9;
}

.trait-value {
  font-size: 14px;
  font-weight: bold;
  color: #ffed4e;
}
</style>
