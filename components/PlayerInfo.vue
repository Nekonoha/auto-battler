<template>
  <div class="player-info">
    <div class="player-header">
      <h2>🧙 {{ player.name }}</h2>
      <div class="player-resources">
        <div class="resource-item">💰 {{ player.gold }}G</div>
        <div class="resource-item">✨ {{ player.statPoints }}SP</div>
      </div>
    </div>
    
    <!-- レベルと経験値 -->
    <div class="level-section">
      <div class="level-display">Lv.{{ player.level }}</div>
      <div class="exp-bar">
        <div class="exp-bar-fill" :style="{ width: expPercentage + '%' }"></div>
      </div>
      <div class="exp-text">{{ player.exp }} / {{ player.nextLevelExp }}</div>
    </div>
    
    <!-- HPバー -->
    <div class="hp-container">
      <div class="hp-label">
        <span>HP</span>
        <span>{{ player.currentHp }} / {{ player.maxHp }}</span>
      </div>
      <div class="hp-bar">
        <div 
          class="hp-bar-fill" 
          :style="{ width: hpPercentage + '%' }"
        ></div>
      </div>
    </div>

    <!-- 状態異常表示（バフ/デバフ分離） -->
    <div v-if="player.statusEffects.length > 0" class="status-effects-wrapper">
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

    <!-- ステータス表示 -->
    <div class="section-with-action">
      <div class="section-header">
        <h3>⚖️ ステータス</h3>
        <button class="btn btn-secondary btn-compact" @click="$emit('openStatManager')" :disabled="isRunLocked">
          🧠 ステ振り
        </button>
      </div>
      <div class="stats-display">
      <div class="stat-row">
        <div class="stat-item">
          <Tooltip :title="'⚔️ 攻撃力'" :content="getStatTooltipContent('attack')">
            <div class="stat-display">
              <span class="stat-label">⚔️</span>
              <span class="stat-value">
                {{ getEffectiveStat('attack').value }}
                <span class="stat-detail">({{ getEffectiveStat('attack').base }}<span v-if="getEffectiveStat('attack').synergy > 0"> + {{ getEffectiveStat('attack').synergy }}</span>)</span>
                <span v-if="getEffectiveStat('attack').buff > 0" class="stat-buff">(+{{ getEffectiveStat('attack').buff }})</span>
                <span v-if="getEffectiveStat('attack').debuff > 0" class="stat-debuff">(-{{ getEffectiveStat('attack').debuff }})</span>
              </span>
            </div>
          </Tooltip>
        </div>
        <div class="stat-item">
          <Tooltip :title="'✨ 魔法'" :content="getStatTooltipContent('magic')">
            <div class="stat-display">
              <span class="stat-label">✨</span>
              <span class="stat-value">
                {{ getEffectiveStat('magic').value }}
                <span class="stat-detail">({{ getEffectiveStat('magic').base }}<span v-if="getEffectiveStat('magic').synergy > 0"> + {{ getEffectiveStat('magic').synergy }}</span>)</span>
                <span v-if="getEffectiveStat('magic').buff > 0" class="stat-buff">(+{{ getEffectiveStat('magic').buff }})</span>
                <span v-if="getEffectiveStat('magic').debuff > 0" class="stat-debuff">(-{{ getEffectiveStat('magic').debuff }})</span>
              </span>
            </div>
          </Tooltip>
        </div>
      </div>
      <div class="stat-row">
        <div class="stat-item">
          <Tooltip :title="'🛡️ 物理防御'" :content="getStatTooltipContent('defense')">
            <div class="stat-display">
              <span class="stat-label">🛡️</span>
              <span class="stat-value">
                {{ getEffectiveStat('defense').value }}
                <span class="stat-detail">({{ getEffectiveStat('defense').base }})</span>
                <span v-if="getEffectiveStat('defense').buff > 0" class="stat-buff">(+{{ getEffectiveStat('defense').buff }})</span>
                <span v-if="getEffectiveStat('defense').debuff > 0" class="stat-debuff">(-{{ getEffectiveStat('defense').debuff }})</span>
              </span>
            </div>
          </Tooltip>
        </div>
        <div class="stat-item">
          <Tooltip :title="'🔮 魔法防御'" :content="getStatTooltipContent('magicDefense')">
            <div class="stat-display">
              <span class="stat-label">🔮</span>
              <span class="stat-value">
                {{ getEffectiveStat('magicDefense').value }}
                <span class="stat-detail">({{ getEffectiveStat('magicDefense').base }})</span>
                <span v-if="getEffectiveStat('magicDefense').buff > 0" class="stat-buff">(+{{ getEffectiveStat('magicDefense').buff }})</span>
                <span v-if="getEffectiveStat('magicDefense').debuff > 0" class="stat-debuff">(-{{ getEffectiveStat('magicDefense').debuff }})</span>
              </span>
            </div>
          </Tooltip>
        </div>
      </div>
      <div class="stat-row">
        <div class="stat-item">
          <Tooltip :title="'⚡ 速度'" :content="getStatTooltipContent('speed')">
            <div class="stat-display">
              <span class="stat-label">⚡</span>
              <span class="stat-value">
                {{ getEffectiveStat('speed').value }}
                <span class="stat-detail">({{ getEffectiveStat('speed').base }}<span v-if="getEffectiveStat('speed').synergy > 0"> + {{ getEffectiveStat('speed').synergy }}</span>)</span>
                <span v-if="getEffectiveStat('speed').buff > 0" class="stat-buff">(+{{ getEffectiveStat('speed').buff }})</span>
                <span v-if="getEffectiveStat('speed').debuff > 0" class="stat-debuff">(-{{ getEffectiveStat('speed').debuff }})</span>
              </span>
            </div>
          </Tooltip>
        </div>
      </div>
      </div>
    </div>

    <!-- 装備武器リスト -->
    <div class="section-with-action">
      <div class="section-header">
        <h3>⚔️ 装備武器</h3>
        <button class="btn btn-secondary btn-compact" @click="$emit('openWeaponManager')" :disabled="isRunLocked">
          🛡️ 武器管理
        </button>
      </div>
      <div class="weapons-section">
      <div v-if="player.weapons.length === 0" class="no-weapons">
        武器が装備されていません
      </div>
      <div v-else class="weapons-list">
        <div 
          v-for="weapon in sortedWeapons" 
          :key="weapon.id"
          class="weapon-mini"
          :style="{ borderColor: getRarityColor(weapon.rarity) }"
        >
          <WeaponDetails :weapon="weapon" />
        </div>
      </div>
      </div>
    </div>

    <!-- タグシナジー表示 -->
    <div v-if="activeSynergies.length > 0" class="synergies-display">
      <h3>✨ アクティブシナジー</h3>
      <div class="synergy-list">
        <div v-for="synergy in activeSynergies" :key="synergy.id" class="synergy-item">
          <Tooltip :title="`🔥 ${synergy.name}`" :content="synergy.description">
            <span class="synergy-tag">{{ synergy.name }}</span>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '~/types'
import { StatusEffectSystem } from '~/systems/StatusEffectSystem'
import { WeaponSystem } from '~/systems/WeaponSystem'
import { calculateActiveSynergies, getTotalSynergyBonus } from '~/data/synergies'
import { STATUS_EFFECTS_DB } from '~/data/statusEffects'
import WeaponDetails from './WeaponDetails.vue'
import Tooltip from './Tooltip.vue'

const props = defineProps<{
  player: Player
  isRunLocked?: boolean
}>()

defineEmits<{
  openWeaponManager: []
  openStatManager: []
}>()

const hpPercentage = computed(() => {
  return (props.player.currentHp / props.player.maxHp) * 100
})

const expPercentage = computed(() => {
  return (props.player.exp / props.player.nextLevelExp) * 100
})

const sortedWeapons = computed(() => {
  const rarityOrder: Record<string, number> = {
    legendary: 0,
    epic: 1,
    rare: 2,
    common: 3
  }
  return [...props.player.weapons].sort((a, b) => {
    const orderA = rarityOrder[a.rarity] ?? 999
    const orderB = rarityOrder[b.rarity] ?? 999
    return orderA - orderB
  })
})

const activeSynergies = computed(() => {
  const weaponTags = props.player.weapons.map(w => w.tags)
  return calculateActiveSynergies(weaponTags)
})

const synergyBonuses = computed(() => {
  return getTotalSynergyBonus(activeSynergies.value)
})

type StatKey = 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed'

const statModifiers = computed(() => StatusEffectSystem.getStatModifiers(props.player))

const effectiveStats = computed(() => {
  const modifiers = statModifiers.value
  const stats: Record<StatKey, { value: number; base: number; synergy: number; buff: number; debuff: number; modifierPct: number }> = {
    attack: { value: 0, base: 0, synergy: 0, buff: 0, debuff: 0, modifierPct: 0 },
    magic: { value: 0, base: 0, synergy: 0, buff: 0, debuff: 0, modifierPct: 0 },
    defense: { value: 0, base: 0, synergy: 0, buff: 0, debuff: 0, modifierPct: 0 },
    magicDefense: { value: 0, base: 0, synergy: 0, buff: 0, debuff: 0, modifierPct: 0 },
    speed: { value: 0, base: 0, synergy: 0, buff: 0, debuff: 0, modifierPct: 0 }
  }

  ;(['attack', 'magic', 'defense', 'magicDefense', 'speed'] as StatKey[]).forEach(stat => {
    const base = props.player.stats[stat] || 0
    const synergy = getSynergyBonus(stat)
    const raw = base + synergy
    const modifierPct = modifiers[stat] || 0
    const buffPct = Math.max(0, modifierPct)
    const debuffPct = Math.min(0, modifierPct)
    const buffValue = Math.round(raw * (buffPct / 100))
    const debuffValue = Math.round(raw * Math.abs(debuffPct) / 100)
    const value = Math.max(0, raw + buffValue - debuffValue)

    stats[stat] = {
      value,
      base,
      synergy,
      buff: buffValue,
      debuff: debuffValue,
      modifierPct
    }
  })

  return stats
})

const getEffectiveStat = (stat: StatKey) => effectiveStats.value[stat]

const getStatusIcon = (type: string) => {
  return StatusEffectSystem.getStatusIcon(type as any)
}

const getStatusColor = (type: string) => {
  return StatusEffectSystem.getStatusColor(type as any)
}

const getStatusDescription = (type: string) => {
  return StatusEffectSystem.getStatusDescription(type as any)
}

const getStatusName = (type: string) => {
  return StatusEffectSystem.getStatusName(type as any)
}

const buffStatusEffects = computed(() => props.player.statusEffects.filter(e => STATUS_EFFECTS_DB[e.type as keyof typeof STATUS_EFFECTS_DB]?.type === 'Buff'))
const debuffStatusEffects = computed(() => props.player.statusEffects.filter(e => STATUS_EFFECTS_DB[e.type as keyof typeof STATUS_EFFECTS_DB]?.type === 'Debuff'))

const getSynergyBonus = (stat: StatKey): number => {
  switch (stat) {
    case 'attack':
      return synergyBonuses.value.attackBonus || 0
    case 'magic':
      return synergyBonuses.value.magicBonus || 0
    case 'speed':
      return synergyBonuses.value.speedBonus || 0
    default:
      return 0
  }
}

const getStatusEntriesForStat = (stat: StatKey) => {
  const raw = getEffectiveStat(stat).base + getEffectiveStat(stat).synergy
  return StatusEffectSystem.getStatModifierEntries(props.player, stat).map(entry => {
    const def = STATUS_EFFECTS_DB[entry.type as keyof typeof STATUS_EFFECTS_DB]
    const percent = entry.percent
    const value = Math.round(raw * Math.abs(percent) / 100)
    return { name: def?.name ?? entry.type, type: def?.type ?? 'Debuff', percent, value }
  })
}

const getStatTooltipContent = (stat: StatKey): string => {
  const statInfo = getEffectiveStat(stat)
  const raw = statInfo.base + statInfo.synergy
  const entries = getStatusEntriesForStat(stat)
  const buffEntries = entries.filter(e => e.percent > 0)
  const debuffEntries = entries.filter(e => e.percent < 0)

  const parts: string[] = [`基本値: ${statInfo.base}`]

  if (statInfo.synergy > 0) {
    parts.push(`<span class="tooltip-positive">シナジー: +${statInfo.synergy}</span>`)
  }

  if (statInfo.buff > 0) {
    const detail = buffEntries.length > 0
      ? buffEntries.map(e => `${e.name} +${e.value}`).join(', ')
      : `+${statInfo.buff}`
    parts.push(`<span class="tooltip-positive">バフ: ${detail}</span>`)
  }

  if (statInfo.debuff > 0) {
    const detail = debuffEntries.length > 0
      ? debuffEntries.map(e => `${e.name} -${e.value}`).join(', ')
      : `-${statInfo.debuff}`
    parts.push(`<span class="tooltip-negative">デバフ: ${detail}</span>`)
  }

  parts.push(`適用倍率: ${(statInfo.modifierPct).toFixed(1)}%`)
  parts.push(`実数値: ${statInfo.value} (基準 ${raw})`)

  return parts.join('<br>')
}

const getRarityColor = (rarity: string) => {
  return WeaponSystem.getRarityColor(rarity)
}
</script>

<style scoped>
.player-info {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
  border-radius: 12px;
  color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.player-resources {
  display: flex;
  gap: 12px;
}

.player-actions-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.btn {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #232a38 0%, #1a202c 100%);
  color: #d8deea;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2c3446 0%, #202735 100%);
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-secondary {
  background: linear-gradient(135deg, #232a38 0%, #1a202c 100%);
  color: #d8deea;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2c3446 0%, #202735 100%);
}

.btn-compact {
  padding: 7px 12px;
  font-size: 12px;
}

.resource-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

h2 {
  margin: 0 0 15px 0;
  font-size: 24px;
}

h3 {
  margin: 15px 0 10px 0;
  font-size: 16px;
  opacity: 0.9;
}

.level-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.level-display {
  font-size: 18px;
  font-weight: bold;
}

.exp-bar {
  width: 100%;
  height: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.exp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3a86ff 0%, #8338ec 100%);
  transition: width 0.3s ease;
}

.exp-text {
  font-size: 12px;
  opacity: 0.8;
}

.stats-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.stat-display {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.stat-label {
  font-size: 16px;
  flex-shrink: 0;
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

.bonus {
  color: #4facfe;
  font-size: 12px;
  margin-left: 4px;
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
  background: linear-gradient(90deg, #06ffa5 0%, #00b4d8 100%);
  transition: width 0.3s ease;
}

.status-effects {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.status-effects-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.status-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-group-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  opacity: 0.85;
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

.weapons-section {
  margin-top: 15px;
}

.weapons-section h3 {
  color: #e0e0e0;
}

.no-weapons {
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  opacity: 0.8;
}

.weapons-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weapon-mini {
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  border-left: 4px solid;
  transition: all 0.2s;
}

.weapon-mini:hover {
  background: rgba(0, 0, 0, 0.6);
}

.weapon-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.weapon-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.weapon-name {
  font-weight: bold;
  font-size: 14px;
}

.limit-break-mini {
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #1a1a2e;
}

.weapon-rarity-badge {
  font-size: 9px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
}

.weapon-type-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.weapon-type {
  font-size: 11px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: bold;
}

.weapon-description {
  font-size: 11px;
  opacity: 0.6;
  font-style: italic;
}

.weapon-mini-stats {
  display: flex;
  gap: 8px;
  font-size: 11px;
  opacity: 0.9;
  flex-wrap: wrap;
}

.weapon-mini-stats span {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: help;
}

.weapon-tags-effects {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.weapon-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.weapon-mini-effects {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.effect-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.effect-group-title {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.85;
}

.effect-badge {
  padding: 2px 6px;
  background: rgba(255, 183, 94, 0.3);
  border: 1px solid rgba(255, 183, 94, 0.6);
  border-radius: 4px;
  font-size: 10px;
  color: #ffb75a;
  cursor: help;
  transition: all 0.2s;
}

.buff-badge {
  background: rgba(39, 174, 96, 0.2);
  border-color: rgba(39, 174, 96, 0.5);
  color: #b5f5d1;
}

.debuff-badge {
  background: rgba(231, 76, 60, 0.2);
  border-color: rgba(231, 76, 60, 0.5);
  color: #ffd6cf;
}

.effect-badge:hover {
  background: rgba(255, 183, 94, 0.5);
}

.tag {
  padding: 0;
  background: none;
  border: none;
  font-size: 11px;
  color: #6b9dff;
  cursor: help;
  font-weight: 500;
  transition: all 0.2s;
}

.tag:hover {
  color: #8fb3ff;
  text-shadow: 0 0 8px rgba(107, 157, 255, 0.5);
}

.synergies-display {
  margin-top: 15px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.synergy-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.synergy-item {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #3a86ff;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.synergy-item span:first-child {
  font-weight: bold;
  font-size: 14px;
  text-transform: capitalize;
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
</style>
