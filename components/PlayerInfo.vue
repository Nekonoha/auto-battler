<template>
  <div class="player-info">
    <!-- プレイヤーヘッダー -->
    <div class="player-header">
      <h2>{{ player.name }} (Lv.{{ player.level }})</h2>
    </div>

    <!-- リソース表示 -->
    <div class="player-resources">
      <div class="level-section">
        <div class="level-display">EXP {{ player.exp ?? 0 }} / {{ player.nextLevelExp ?? 0 }}</div>
        <div class="exp-bar">
          <div class="exp-bar-fill" :style="{ width: expPercentage + '%' }"></div>
        </div>
        <div class="exp-text">次のレベルまで {{ Math.max(0, (player.nextLevelExp ?? 0) - (player.exp ?? 0)) }}</div>
      </div>
      <div class="player-actions-row">
        <div class="resource-item">💰 Gold {{ player.gold ?? 0 }}G</div>
      </div>
    </div>

    <!-- HPバー -->
    <div class="hp-container">
      <div class="hp-label">
        <span>HP</span>
        <span>{{ player.currentHp }} / {{ player.maxHp }}</span>
      </div>
      <div class="hp-bar">
        <div class="hp-bar-fill" :style="{ width: hpPercentage + '%' }"></div>
      </div>
    </div>

    <!-- 状態異常表示（バフ/デバフ分離） -->
    <div v-if="player.statusEffects.length > 0" class="status-effects-wrapper accordion">
      <div class="section-header accordion-header" @click="toggleSection('statusEffects')">
        <h3>⚡ 状態異常 <span class="accordion-toggle">{{ expandedSections.statusEffects ? '▼' : '▶' }}</span></h3>
      </div>
      <div v-show="expandedSections.statusEffects">
        <div v-if="buffStatusEffects.length" class="status-group">
          <div class="status-group-title">🟢 バフ</div>
          <div class="status-effects">
            <div v-for="effect in buffStatusEffects" :key="effect.type" class="status-effect"
              :style="{ backgroundColor: getStatusColor(effect.type) }">
              <Tooltip :title="`${getStatusIcon(effect.type)} ${getStatusName(effect.type)}`"
                :content="getStatusDescription(effect.type)">
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
            <div v-for="effect in debuffStatusEffects" :key="effect.type" class="status-effect"
              :style="{ backgroundColor: getStatusColor(effect.type) }">
              <Tooltip :title="`${getStatusIcon(effect.type)} ${getStatusName(effect.type)}`"
                :content="getStatusDescription(effect.type)">
                <span class="status-icon">{{ getStatusIcon(effect.type) }}</span>
                <span class="status-stacks">×{{ effect.stacks }}</span>
                <span class="status-duration">({{ effect.duration }}T)</span>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ステータス表示（メインアコーディオン） -->
    <div class="section-with-action">
      <div class="section-header accordion-header" @click="toggleSection('stats')">
        <h3>⚖️ ステータス <span class="accordion-toggle">{{ expandedSections.stats ? '▼' : '▶' }}</span></h3>
      </div>
      <div v-show="expandedSections.stats">
        <div class="stats-toolbar">
          <div class="toolbar-buttons">
            <button class="btn btn-secondary btn-compact" @click.stop="$emit('openStatManager')"
              :disabled="isRunLocked">
              🧠 ステ振り
              <span>SP {{ player.statPoints ?? 0 }}</span>
            </button>
          </div>
        </div>
        <!-- メインステータスセクション -->
        <div class="stats-subsection">
          <div class="section-header accordion-header" @click="toggleSection('mainStats')">
            <h3 style="font-size: 14px; margin: 10px 0;">メイン <span class="accordion-toggle">{{
              expandedSections.mainStats ? '▼' : '▶' }}</span></h3>
          </div>
          <div v-show="expandedSections.mainStats" class="stats-display stats-grid stats-grid-2col">
            <div class="stat-item">
              <Tooltip :title="formatStatTitle('attack')" :content="getStatTooltipContent('attack')">
                <div class="stat-display">
                  <span class="stat-label">⚔️</span>
                  <span class="stat-value">
                    {{ coreStats.attack.value }}
                    <span class="stat-detail">({{ coreStats.attack.base }}<span v-if="coreStats.attack.synergy > 0"> +
                        {{
                          coreStats.attack.synergy }}</span>)</span>
                    <span v-if="coreStats.attack.buff > 0" class="stat-buff">(+{{ coreStats.attack.buff }})</span>
                    <span v-if="coreStats.attack.debuff > 0" class="stat-debuff">(-{{ coreStats.attack.debuff }})</span>
                  </span>
                </div>
              </Tooltip>
            </div>
            <div class="stat-item">
              <Tooltip :title="formatStatTitle('magic')" :content="getStatTooltipContent('magic')">
                <div class="stat-display">
                  <span class="stat-label">✨</span>
                  <span class="stat-value">
                    {{ coreStats.magic.value }}
                    <span class="stat-detail">({{ coreStats.magic.base }}<span v-if="coreStats.magic.synergy > 0"> + {{
                      coreStats.magic.synergy }}</span>)</span>
                    <span v-if="coreStats.magic.buff > 0" class="stat-buff">(+{{ coreStats.magic.buff }})</span>
                    <span v-if="coreStats.magic.debuff > 0" class="stat-debuff">(-{{ coreStats.magic.debuff }})</span>
                  </span>
                </div>
              </Tooltip>
            </div>
            <div class="stat-item">
              <Tooltip :title="formatStatTitle('defense')" :content="getStatTooltipContent('defense')">
                <div class="stat-display">
                  <span class="stat-label">🛡️</span>
                  <span class="stat-value">
                    {{ coreStats.defense.value }}
                    <span class="stat-detail">({{ coreStats.defense.base }})</span>
                    <span v-if="coreStats.defense.buff > 0" class="stat-buff">(+{{ coreStats.defense.buff }})</span>
                    <span v-if="coreStats.defense.debuff > 0" class="stat-debuff">(-{{ coreStats.defense.debuff
                    }})</span>
                  </span>
                </div>
              </Tooltip>
            </div>
            <div class="stat-item">
              <Tooltip :title="formatStatTitle('magicDefense')" :content="getStatTooltipContent('magicDefense')">
                <div class="stat-display">
                  <span class="stat-label">🔮</span>
                  <span class="stat-value">
                    {{ coreStats.magicDefense.value }}
                    <span class="stat-detail">({{ coreStats.magicDefense.base }})</span>
                    <span v-if="coreStats.magicDefense.buff > 0" class="stat-buff">(+{{ coreStats.magicDefense.buff
                    }})</span>
                    <span v-if="coreStats.magicDefense.debuff > 0" class="stat-debuff">(-{{
                      coreStats.magicDefense.debuff
                    }})</span>
                  </span>
                </div>
              </Tooltip>
            </div>
            <div class="stat-item">
              <Tooltip :title="formatStatTitle('speed')" :content="getStatTooltipContent('speed')">
                <div class="stat-display">
                  <span class="stat-label">⚡</span>
                  <span class="stat-value">
                    {{ coreStats.speed.value }}
                    <span class="stat-detail">({{ coreStats.speed.base }}<span v-if="coreStats.speed.synergy > 0"> + {{
                      coreStats.speed.synergy }}</span>)</span>
                    <span v-if="coreStats.speed.buff > 0" class="stat-buff">(+{{ coreStats.speed.buff }})</span>
                    <span v-if="coreStats.speed.debuff > 0" class="stat-debuff">(-{{ coreStats.speed.debuff }})</span>
                  </span>
                </div>
              </Tooltip>
            </div>
            <div class="stat-item">
              <Tooltip :title="formatStatTitle('statusPower')" :content="getStatTooltipContent('statusPower')">
                <div class="stat-display">
                  <span class="stat-label">🧿</span>
                  <span class="stat-value">
                    {{ coreStats.statusPower.value }}
                    <span class="stat-detail">({{ coreStats.statusPower.base }})</span>
                    <span v-if="coreStats.statusPower.buff > 0" class="stat-buff">(+{{ coreStats.statusPower.buff
                    }})</span>
                    <span v-if="coreStats.statusPower.debuff > 0" class="stat-debuff">(-{{ coreStats.statusPower.debuff
                    }})</span>
                  </span>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        <!-- サブステータスセクション -->
        <div class="stats-subsection">
          <div class="section-header accordion-header" @click="toggleSection('substats')">
            <h3 style="font-size: 14px; margin: 10px 0;">サブ <span class="accordion-toggle">{{ expandedSections.substats
              ? '▼' : '▶' }}</span></h3>
          </div>
          <div v-show="expandedSections.substats" class="stats-display stats-grid stats-grid-2col">
            <div class="stat-item">
              <Tooltip :title="formatStatTitle('lifeSteal')" :content="getStatSubstatsDescription('lifeSteal')">
                <div class="stat-display">
                  <span class="stat-label">🩸</span>
                  <span class="stat-value">
                    {{ subStats.lifeSteal.value }}%
                    <span class="stat-detail">({{ subStats.lifeSteal.base }}<span v-if="subStats.lifeSteal.synergy > 0">
                        +
                        {{ subStats.lifeSteal.synergy }}</span>)</span>
                  </span>
                </div>
              </Tooltip>
            </div>
            <div class="stat-item">
              <Tooltip :title="formatStatTitle('critChance')" :content="getStatSubstatsDescription('critChance')">
                <div class="stat-display">
                  <span class="stat-label">🎯</span>
                  <span class="stat-value">
                    {{ subStats.critChance.value }}%
                    <span class="stat-detail">({{ subStats.critChance.base }}<span
                        v-if="subStats.critChance.synergy > 0"> +
                        {{ subStats.critChance.synergy }}</span>)</span>
                  </span>
                </div>
              </Tooltip>
            </div>
            <div class="stat-item">
              <Tooltip :title="formatStatTitle('critDamage')" :content="getStatSubstatsDescription('critDamage')">
                <div class="stat-display">
                  <span class="stat-label">💥</span>
                  <span class="stat-value">
                    {{ subStats.critDamage.value }}%
                    <span class="stat-detail">({{ subStats.critDamage.base }}<span
                        v-if="subStats.critDamage.synergy > 0"> +
                        {{ subStats.critDamage.synergy }}</span>)</span>
                  </span>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 装備武器から得られるtraitボーナス -->
    <div v-if="traitEntries.length > 0" class="section-with-action">
      <div class="section-header accordion-header" @click="toggleSection('traits')">
        <h3>🛡️ 装備特性 <span class="accordion-toggle">{{ expandedSections.traits ? '▼' : '▶' }}</span></h3>
      </div>
      <div v-show="expandedSections.traits" class="traits-display">
        <div v-for="trait in traitEntries" :key="trait.key as string" class="trait-item">
          <Tooltip :title="`${trait.icon} ${trait.name}`" :content="trait.description">
            <span class="trait-label">{{ trait.icon }} {{ trait.name }}</span>
            <span class="trait-value">{{ trait.value }}%</span>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- 装備武器リスト -->
    <div class="section-with-action">
      <div class="section-header accordion-header" @click="toggleSection('weapons')">
        <h3>⚔️ 装備武器 <span class="accordion-toggle">{{ expandedSections.weapons ? '▼' : '▶' }}</span></h3>
      </div>
      <div v-show="expandedSections.weapons" class="weapons-section">
        <div class="weapons-toolbar">
          <div class="toolbar-buttons">
            <button class="btn btn-secondary btn-compact" @click.stop="$emit('openWeaponManager')"
              :disabled="isRunLocked">
              🛡️ 武器管理
            </button>
          </div>
          <div class="toolbar-buttons">
            <button class="btn btn-primary btn-compact" @click.stop="$emit('purchaseSlot')"
              :disabled="!nextSlotCost || !canPurchaseSlot || isRunLocked">
              🔓 スロット拡張 <span v-if="nextSlotCost">({{ nextSlotCost }}G)</span>
              <span> 枠 {{ player.weapons.length }} / {{ player.weaponSlots }}</span>
            </button>
          </div>
        </div>
        <div class="weapons-grid">
          <div v-for="(weapon, index) in slotEntries" :key="weapon?.id || `slot-${index}`" class="weapon-slot"
            :class="{ empty: !weapon }" :style="weapon ? { borderColor: getRarityColor(weapon.rarity) } : {}">
            <WeaponDetails v-if="weapon" :weapon="weapon" :showRarityBadge="true" compact />
            <div v-else class="empty-slot">
              <div class="empty-slot-icon">➕</div>
              <div class="empty-slot-text">空きスロット</div>
              <button class="btn btn-secondary btn-compact" @click="$emit('openWeaponManager')" :disabled="isRunLocked">
                装備する
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- タグシナジー表示 -->
    <div v-if="activeSynergies.length > 0" class="synergies-display accordion">
      <div class="section-header accordion-header" @click="toggleSection('synergies')">
        <h3>✨ アクティブシナジー <span class="accordion-toggle">{{ expandedSections.synergies ? '▼' : '▶' }}</span></h3>
      </div>
      <div v-show="expandedSections.synergies" class="synergy-list">
        <div v-for="synergy in activeSynergies" :key="synergy.id" class="synergy-item">
          <Tooltip :title="`🔥 ${synergy.name}`" :content="formatSynergyTooltip(synergy)">
            <span class="synergy-tag">{{ synergy.name }}</span>
            <span v-if="synergy.stackable && getActiveSynergyCount(synergy.id) > 1" class="synergy-stack">×{{
              getActiveSynergyCount(synergy.id) }}</span>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Player, Weapon } from '~/types'
import { StatusEffectSystem } from '~/systems/StatusEffectSystem'
import { WeaponSystem } from '~/systems/WeaponSystem'
import { calculateActiveSynergies, getTotalSynergyBonus } from '~/data/synergies'
import { STATUS_EFFECTS_DB } from '~/data/statusEffects'
import { getStatDefinition, formatStatTitle, getStatSubstatsDescription } from '~/data/statDefinitions'
import { usePlayerStatDisplay, getStatTooltipContent as getStatTooltip } from '~/composables/useStatDisplay'
import WeaponDetails from './WeaponDetails.vue'
import Tooltip from './Tooltip.vue'
import { getWeaponTraitName, getWeaponTraitDescription, getWeaponTraitIcon } from '~/data/traits'

const props = defineProps<{
  player: Player
  isRunLocked?: boolean
  nextSlotCost?: number
  canPurchaseSlot?: boolean
}>()

const emit = defineEmits<{
  openWeaponManager: []
  openStatManager: []
  updatePlayerName: [name: string]
  purchaseSlot: []
}>()

// アコーディオン状態管理
const expandedSections = ref({
  stats: true,
  mainStats: true,
  substats: true,
  traits: true,
  statusEffects: true,
  weapons: true,
  synergies: true
})

const toggleSection = (section: keyof typeof expandedSections.value) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const expPercentage = computed(() => {
  const maxExp = props.player.nextLevelExp ?? 0
  if (maxExp <= 0) return 0
  const pct = ((props.player.exp ?? 0) / maxExp) * 100
  return Math.min(100, Math.max(0, pct))
})

const hpPercentage = computed(() => {
  const pct = (props.player.currentHp / props.player.maxHp) * 100
  return Math.min(100, Math.max(0, pct))
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

const slotEntries = computed<Array<Weapon | null>>(() => {
  const limit = Math.max(2, props.player.weaponSlots || 0)
  const slots: Array<Weapon | null> = [...sortedWeapons.value]
  while (slots.length < limit) slots.push(null)
  return slots.slice(0, limit)
})

const activeSynergies = computed(() => {
  const weaponTags = props.player.weapons.map(w => w.tags)
  return calculateActiveSynergies(weaponTags)
})

const synergyBonuses = computed(() => {
  return getTotalSynergyBonus(activeSynergies.value)
})

type StatKey = 'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed' | 'statusPower'

// 装備武器から得られるtraitボーナス
const equipmentTraits = computed(() => {
  return WeaponSystem.getWeaponTraitsBonus(props.player.weapons, synergyBonuses.value)
})

const traitEntries = computed(() => {
  const traits = equipmentTraits.value
  const keys: Array<keyof typeof traits> = ['physicalResistance', 'magicalResistance', 'statusResistance', 'damageReduction', 'resistancePenetration']
  return keys
    .filter(key => (traits[key] ?? 0) > 0)
    .map(key => ({
      key,
      value: traits[key] ?? 0,
      name: getWeaponTraitName(key),
      description: getWeaponTraitDescription(key),
      icon: getWeaponTraitIcon(key)
    }))
})

// useStatDisplay composable を使用
const { getEffectiveStat } = usePlayerStatDisplay(computed(() => props.player))

const coreStats = computed(() => ({
  attack: getEffectiveStat('attack'),
  magic: getEffectiveStat('magic'),
  defense: getEffectiveStat('defense'),
  magicDefense: getEffectiveStat('magicDefense'),
  speed: getEffectiveStat('speed'),
  statusPower: getEffectiveStat('statusPower')
}))

const subStats = computed(() => ({
  lifeSteal: getEffectiveStat('lifeSteal'),
  critChance: getEffectiveStat('critChance'),
  critDamage: getEffectiveStat('critDamage')
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
  return StatusEffectSystem.getStatusName(type as any)
}

const buffStatusEffects = computed(() => props.player.statusEffects.filter(e => STATUS_EFFECTS_DB[e.type as keyof typeof STATUS_EFFECTS_DB]?.type === 'Buff'))
const debuffStatusEffects = computed(() => props.player.statusEffects.filter(e => STATUS_EFFECTS_DB[e.type as keyof typeof STATUS_EFFECTS_DB]?.type === 'Debuff'))

const getStatTooltipContent = (stat: StatKey): string => {
  const statDetail = getEffectiveStat(stat)
  return getStatTooltip(statDetail, stat, (type: string) => StatusEffectSystem.getStatusName(type as any))
}

const getRarityColor = (rarity: string) => {
  return WeaponSystem.getRarityColor(rarity)
}

// シナジーのアクティブ数をカウント
const getActiveSynergyCount = (synergyId: string): number => {
  return activeSynergies.value.filter(s => s.id === synergyId).length
}

// シナジーのボーナス情報をフォーマット
const formatSynergyTooltip = (synergy: any): string => {
  let tooltip = synergy.description + '\n\n効果：\n'

  const effects = synergy.effects || {}
  const bonuses = []

  if (effects.attackBonus) bonuses.push(`⚔️ 攻撃力 +${effects.attackBonus}`)
  if (effects.magicBonus) bonuses.push(`✨ 魔法 +${effects.magicBonus}`)
  if (effects.speedBonus) bonuses.push(`⚡ 速度 +${effects.speedBonus}`)
  if (effects.statusPowerBonus) bonuses.push(`🧿 状態異常威力 +${effects.statusPowerBonus}`)
  if (effects.lifeStealBonus) bonuses.push(`🩸 ライフスティール +${effects.lifeStealBonus}%`)
  if (effects.critChanceBonus) bonuses.push(`💥 クリティカル率 +${effects.critChanceBonus}%`)
  if (effects.critDamageBonus) bonuses.push(`💥 クリティカルダメージ +${effects.critDamageBonus}%`)

  return tooltip + bonuses.join('\n')
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
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 15px;
}

.player-resources {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.stats-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}

.stats-toolbar .toolbar-buttons {
  display: flex;
  gap: 8px;
}

.stats-display {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.stats-grid-2col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.weapons-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}

.toolbar-buttons {
  display: flex;
  gap: 8px;
}

.slot-count {
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  white-space: nowrap;
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
  padding: 3px 8px;
  background: linear-gradient(135deg, rgba(18, 31, 63, 0.7), rgba(10, 14, 30, 0.9));
  border: 1px solid rgba(120, 207, 255, 0.7);
  border-radius: 2px;
  font-size: 10px;
  color: #cfe7ff;
  cursor: help;
  letter-spacing: 0.2px;
  box-shadow: 0 0 0 1px rgba(5, 10, 25, 0.8), 0 4px 10px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  text-transform: uppercase;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease;
}

.buff-badge {
  background: linear-gradient(135deg, rgba(20, 120, 70, 0.85), rgba(16, 200, 140, 0.45));
  border-color: rgba(50, 255, 190, 0.75);
  color: #d9fff2;
  box-shadow: 0 0 0 1px rgba(0, 255, 170, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.debuff-badge {
  background: linear-gradient(135deg, rgba(140, 32, 32, 0.9), rgba(255, 78, 78, 0.4));
  border-color: rgba(255, 120, 120, 0.75);
  color: #ffe9e6;
  box-shadow: 0 0 0 1px rgba(255, 90, 90, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

.effect-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 0 1px rgba(5, 10, 25, 0.8), 0 6px 14px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1);
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

.player-name-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-name-display {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.player-name-display:hover {
  background: rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 8px rgba(107, 157, 255, 0.3);
}

.player-name-edit {
  flex: 1;
  max-width: 250px;
}

.player-name-input {
  width: 100%;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid #4a9eff;
  border-radius: 4px;
  color: #e8eaed;
  font-size: 16px;
  font-weight: bold;
  font-family: inherit;
}

.player-name-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 8px rgba(74, 158, 255, 0.5);
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

.weapons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.weapon-slot {
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.35);
  padding: 8px;
  min-height: 160px;
  display: flex;
}

.weapon-slot.empty {
  border-style: dashed;
  align-items: center;
  justify-content: center;
}

.empty-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  color: #9aa5b1;
}

.empty-slot-icon {
  font-size: 26px;
}

.empty-slot-text {
  font-size: 13px;
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
  gap: 4px;
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

.synergy-item {
  position: relative;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #3a86ff;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.synergy-tag {
  font-weight: bold;
  font-size: 14px;
  text-transform: capitalize;
}

.synergy-stack {
  margin-left: auto;
  padding: 2px 6px;
  background: rgba(58, 134, 255, 0.3);
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: #6bb6ff;
}
</style>
