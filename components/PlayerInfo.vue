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

    <!-- ステータス表示 -->
    <div class="section-with-action">
      <div class="section-header">
        <h3>⚖️ ステータス</h3>
        <button class="btn btn-secondary btn-compact" @click="$emit('openStatManager')" :disabled="isRunLocked">
          割り振り
        </button>
      </div>
      <div class="stats-display">
      <div class="stat-row">
        <div class="stat-item">
          <Tooltip title="⚔️ 攻撃力" content="敵へのダメージに影響">
            <span class="stat-label">⚔️</span>
            <span class="stat-value">{{ totalStats.attack }}</span>
            <span v-if="synergyBonuses.attack > 0" class="bonus">+{{ synergyBonuses.attack }}</span>
          </Tooltip>
        </div>
        <div class="stat-item">
          <Tooltip title="✨ 魔法" content="魔法攻撃力に影響">
            <span class="stat-label">✨</span>
            <span class="stat-value">{{ totalStats.magic }}</span>
            <span v-if="synergyBonuses.magic > 0" class="bonus">+{{ synergyBonuses.magic }}</span>
          </Tooltip>
        </div>
      </div>
      <div class="stat-row">
        <div class="stat-item">
          <Tooltip title="🛡️ 物理防御" content="物理ダメージの軽減">
            <span class="stat-label">🛡️</span>
            <span class="stat-value">{{ totalStats.defense }}</span>
            <span v-if="synergyBonuses.defense > 0" class="bonus">+{{ synergyBonuses.defense }}</span>
          </Tooltip>
        </div>
        <div class="stat-item">
          <Tooltip title="🔮 魔法防御" content="魔法ダメージの軽減">
            <span class="stat-label">🔮</span>
            <span class="stat-value">{{ totalStats.magicDefense }}</span>
            <span v-if="synergyBonuses.magicDefense > 0" class="bonus">+{{ synergyBonuses.magicDefense }}</span>
          </Tooltip>
        </div>
      </div>
      <div class="stat-row">
        <div class="stat-item">
          <Tooltip title="⚡ 速度" content="攻撃順序に影響">
            <span class="stat-label">⚡</span>
            <span class="stat-value">{{ totalStats.speed }}</span>
            <span v-if="synergyBonuses.speed > 0" class="bonus">+{{ synergyBonuses.speed }}</span>
          </Tooltip>
        </div>
      </div>
      </div>
    </div>

    <!-- 状態異常表示 -->
    <div v-if="player.statusEffects.length > 0" class="status-effects">
      <div 
        v-for="effect in player.statusEffects" 
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

    <!-- 装備武器リスト -->
    <div class="section-with-action">
      <div class="section-header">
        <h3>⚔️ 装備武器</h3>
        <button class="btn btn-secondary btn-compact" @click="$emit('openWeaponManager')" :disabled="isRunLocked">
          武器変更
        </button>
      </div>
      <div class="weapons-section">
      <div v-if="player.weapons.length === 0" class="no-weapons">
        武器が装備されていません
      </div>
      <div v-else class="weapons-list">
        <div 
          v-for="weapon in player.weapons" 
          :key="weapon.id"
          class="weapon-mini"
          :style="{ borderColor: getRarityColor(weapon.rarity) }"
        >
          <div class="weapon-info">
            <div class="weapon-name-row">
              <span class="weapon-name">{{ weapon.name }}</span>
              <span class="weapon-rarity-badge" :style="{ backgroundColor: getRarityColor(weapon.rarity) }">
                {{ weapon.rarity.toUpperCase() }}
              </span>
            </div>
            <div class="weapon-type-row">
              <span class="weapon-type">{{ weapon.type }}</span>
              <span class="weapon-description">{{ weapon.description }}</span>
            </div>
            <!-- 全ステータス表示 -->
            <div class="weapon-mini-stats">
              <Tooltip v-if="weapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                <span>⚔️ {{ weapon.stats.attack }}</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                <span>✨ {{ weapon.stats.magic }}</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                <span>⚡ {{ weapon.stats.speed }}</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                <span>🎯 {{ weapon.stats.critChance }}%</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.critDamage > 1" title="💥 クリティカルダメージ" content="クリティカル時のダメージ倍率">
                <span>💥 {{ weapon.stats.critDamage }}x</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                <span>🔮 {{ weapon.stats.statusPower }}</span>
              </Tooltip>
            </div>
            <!-- タグと効果 -->
            <div class="weapon-tags-effects">
              <div class="weapon-tags">
                <Tooltip 
                  v-for="tag in weapon.tags"
                  :key="tag"
                  :title="`📌 ${tag}`"
                  :content="getTagDescription(tag)"
                >
                  <span 
                    class="tag"
                    :style="{ backgroundColor: getTagColor(tag) }"
                  >
                    {{ tag }}
                  </span>
                </Tooltip>
              </div>
              <!-- 付与効果表示 -->
              <div v-if="weapon.effects.length > 0" class="weapon-mini-effects">
                <Tooltip
                  v-for="effect in weapon.effects"
                  :key="effect.type"
                  :title="`${effect.type}`"
                  :content="`確率: ${effect.chance}% | スタック: ${effect.stacks} | 持続: ${effect.duration}T`"
                >
                  <span class="effect-badge">
                    {{ effect.type }}
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
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
import { calculateActiveSynergies, getTotalSynergyBonus, TAG_DEFINITIONS } from '~/data/synergies'
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

const activeSynergies = computed(() => {
  const weaponTags = props.player.weapons.map(w => w.tags)
  return calculateActiveSynergies(weaponTags)
})

const synergyBonuses = computed(() => {
  return getTotalSynergyBonus(activeSynergies.value)
})

const totalStats = computed(() => ({
  attack: props.player.stats.attack,
  magic: props.player.stats.magic,
  defense: props.player.stats.defense,
  magicDefense: props.player.stats.magicDefense,
  speed: props.player.stats.speed,
  critChance: 0
}))

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

const getRarityColor = (rarity: string) => {
  return WeaponSystem.getRarityColor(rarity)
}

const getTagColor = (tag: string) => {
  const colors: Record<string, string> = {
    fast: '#4facfe',
    heavy: '#f5576c',
    precise: '#feca57',
    elemental: '#6c5ce7',
    cursed: '#a29bfe',
    bleeding: '#d63031'
  }
  return colors[tag] || '#95a5a6'
}

const getTagDescription = (tag: string) => {
  const tagDef = TAG_DEFINITIONS[tag as keyof typeof TAG_DEFINITIONS]
  return tagDef ? tagDef.description : ''
}

const getSynergyDescription = (synergyId: string) => {
  const synergy = activeSynergies.value.find(s => s.id === synergyId)
  return synergy ? synergy.description : ''
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

.stat-label {
  font-size: 16px;
}

.stat-value {
  font-weight: bold;
  font-size: 14px;
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
}

.weapon-tags-effects {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.weapon-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.weapon-mini-effects {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.effect-badge {
  padding: 2px 6px;
  background: rgba(255, 183, 94, 0.3);
  border: 1px solid rgba(255, 183, 94, 0.6);
  border-radius: 4px;
  font-size: 10px;
  color: #ffb75a;
}

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
