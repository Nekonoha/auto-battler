<template>
  <div v-if="show && selectedWeapon" class="loot-modal">
    <div class="loot-content" style="max-width: 1400px;">
      <div class="modal-header">
        <h2>⚔️ 装備を置き換え</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>
      <p class="loot-subtitle">
        {{ playerWeapons.length < 4 ? '空きスロットまたは' : '' }}置き換える装備をクリックしてください
      </p>
      <div class="replacement-comparison-grid">
        <!-- 既存の武器 -->
        <div 
          v-for="(weapon, index) in playerWeapons" 
          :key="weapon.id" 
          class="replacement-comparison-card"
          @click="$emit('replace-weapon', index)"
        >
          <!-- 現在の装備 -->
          <div class="comparison-weapon-section">
            <div class="comparison-weapon-title">現在の装備</div>
            <div class="comparison-weapon-name">{{ weapon.name }}</div>
            <div class="comparison-weapon-type">{{ weapon.type }}</div>
            <div class="comparison-weapon-desc">{{ weapon.description }}</div>
            
            <div class="comparison-stats">
              <Tooltip v-if="weapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                <span class="stat-item">⚔️{{ weapon.stats.attack }}</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                <span class="stat-item">✨{{ weapon.stats.magic }}</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                <span class="stat-item">⚡{{ weapon.stats.speed }}</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                <span class="stat-item">🎯{{ weapon.stats.critChance }}%</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.critDamage > 0" title="💥 クリティカルダメージ" content="クリティカル時のダメージ増加">
                <span class="stat-item">💥{{ weapon.stats.critDamage }}%</span>
              </Tooltip>
              <Tooltip v-if="weapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                <span class="stat-item">🔮{{ weapon.stats.statusPower }}</span>
              </Tooltip>
            </div>
            
            <div class="comparison-tags" v-if="weapon.tags.length > 0 || weapon.effects.length > 0">
              <Tooltip v-for="tag in weapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
                <span class="comparison-tag">#{{ tag }}</span>
              </Tooltip>
              <Tooltip v-for="effect in weapon.effects" :key="effect.type" :title="effect.type" :content="getStatusDescription(effect.type)">
                <span class="comparison-effect">{{ effect.type }}</span>
              </Tooltip>
            </div>
          </div>

          <!-- 矢印 -->
          <div class="comparison-arrow-section">
            <div class="comparison-arrow">→</div>
            <div class="comparison-click-hint">クリック</div>
          </div>

          <!-- 新しい装備 -->
          <div class="comparison-weapon-section">
            <div class="comparison-weapon-title">新しい装備</div>
            <div class="comparison-weapon-name highlight">{{ selectedWeapon.name }}</div>
            <div class="comparison-weapon-type">{{ selectedWeapon.type }}</div>
            <div class="comparison-weapon-desc">{{ selectedWeapon.description }}</div>
            
            <div class="comparison-stats">
              <Tooltip v-if="selectedWeapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                <span class="stat-item" :class="{ improved: selectedWeapon.stats.attack > weapon.stats.attack }">
                  ⚔️{{ selectedWeapon.stats.attack }}
                  <span v-if="selectedWeapon.stats.attack !== weapon.stats.attack" class="stat-diff">
                    {{ selectedWeapon.stats.attack > weapon.stats.attack ? '+' : '' }}{{ selectedWeapon.stats.attack - weapon.stats.attack }}
                  </span>
                </span>
              </Tooltip>
              <Tooltip v-if="selectedWeapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                <span class="stat-item" :class="{ improved: selectedWeapon.stats.magic > weapon.stats.magic }">
                  ✨{{ selectedWeapon.stats.magic }}
                  <span v-if="selectedWeapon.stats.magic !== weapon.stats.magic" class="stat-diff">
                    {{ selectedWeapon.stats.magic > weapon.stats.magic ? '+' : '' }}{{ selectedWeapon.stats.magic - weapon.stats.magic }}
                  </span>
                </span>
              </Tooltip>
              <Tooltip v-if="selectedWeapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                <span class="stat-item" :class="{ improved: selectedWeapon.stats.speed > weapon.stats.speed }">
                  ⚡{{ selectedWeapon.stats.speed }}
                  <span v-if="selectedWeapon.stats.speed !== weapon.stats.speed" class="stat-diff">
                    {{ selectedWeapon.stats.speed > weapon.stats.speed ? '+' : '' }}{{ selectedWeapon.stats.speed - weapon.stats.speed }}
                  </span>
                </span>
              </Tooltip>
              <Tooltip v-if="selectedWeapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                <span class="stat-item" :class="{ improved: selectedWeapon.stats.critChance > weapon.stats.critChance }">
                  🎯{{ selectedWeapon.stats.critChance }}%
                  <span v-if="selectedWeapon.stats.critChance !== weapon.stats.critChance" class="stat-diff">
                    {{ selectedWeapon.stats.critChance > weapon.stats.critChance ? '+' : '' }}{{ selectedWeapon.stats.critChance - weapon.stats.critChance }}%
                  </span>
                </span>
              </Tooltip>
              <Tooltip v-if="selectedWeapon.stats.critDamage > 0" title="💥 クリティカルダメージ" content="クリティカル時のダメージ増加">
                <span class="stat-item" :class="{ improved: selectedWeapon.stats.critDamage > weapon.stats.critDamage }">
                  💥{{ selectedWeapon.stats.critDamage }}%
                  <span v-if="selectedWeapon.stats.critDamage !== weapon.stats.critDamage" class="stat-diff">
                    {{ selectedWeapon.stats.critDamage > weapon.stats.critDamage ? '+' : '' }}{{ selectedWeapon.stats.critDamage - weapon.stats.critDamage }}%
                  </span>
                </span>
              </Tooltip>
              <Tooltip v-if="selectedWeapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                <span class="stat-item" :class="{ improved: selectedWeapon.stats.statusPower > weapon.stats.statusPower }">
                  🔮{{ selectedWeapon.stats.statusPower }}
                  <span v-if="selectedWeapon.stats.statusPower !== weapon.stats.statusPower" class="stat-diff">
                    {{ selectedWeapon.stats.statusPower > weapon.stats.statusPower ? '+' : '' }}{{ selectedWeapon.stats.statusPower - weapon.stats.statusPower }}
                  </span>
                </span>
              </Tooltip>
            </div>
            
            <div class="comparison-tags" v-if="selectedWeapon.tags.length > 0 || selectedWeapon.effects.length > 0">
              <Tooltip v-for="tag in selectedWeapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
                <span class="comparison-tag">#{{ tag }}</span>
              </Tooltip>
              <Tooltip v-for="effect in selectedWeapon.effects" :key="effect.type" :title="effect.type" :content="getStatusDescription(effect.type)">
                <span class="comparison-effect">{{ effect.type }}</span>
              </Tooltip>
            </div>
          </div>
        </div>
        
        <!-- 空きスロット -->
        <div 
          v-if="playerWeapons.length < 4"
          class="replacement-comparison-card empty-slot-card"
          @click="$emit('add-to-empty-slot')"
        >
          <div class="comparison-weapon-section empty-slot-section">
            <div class="empty-slot-icon">➕</div>
            <div class="empty-slot-text">空きスロット</div>
            <div class="empty-slot-hint">クリックで追加</div>
          </div>
          
          <div class="comparison-arrow-section">
            <div class="comparison-arrow">→</div>
            <div class="comparison-click-hint">クリック</div>
          </div>
          
          <div class="comparison-weapon-section">
            <div class="comparison-weapon-title">新しい装備</div>
            <div class="comparison-weapon-name highlight">{{ selectedWeapon.name }}</div>
            <div class="comparison-weapon-type">{{ selectedWeapon.type }}</div>
            <div class="comparison-weapon-desc">{{ selectedWeapon.description }}</div>
            
            <div class="comparison-stats">
              <Tooltip v-if="selectedWeapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                <span class="stat-item">⚔️{{ selectedWeapon.stats.attack }}</span>
              </Tooltip>
              <Tooltip v-if="selectedWeapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                <span class="stat-item">✨{{ selectedWeapon.stats.magic }}</span>
              </Tooltip>
              <Tooltip v-if="selectedWeapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                <span class="stat-item">⚡{{ selectedWeapon.stats.speed }}</span>
              </Tooltip>
              <Tooltip v-if="selectedWeapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                <span class="stat-item">🎯{{ selectedWeapon.stats.critChance }}%</span>
              </Tooltip>
              <Tooltip v-if="selectedWeapon.stats.critDamage > 0" title="💥 クリティカルダメージ" content="クリティカル時のダメージ増加">
                <span class="stat-item">💥{{ selectedWeapon.stats.critDamage }}%</span>
              </Tooltip>
              <Tooltip v-if="selectedWeapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                <span class="stat-item">🔮{{ selectedWeapon.stats.statusPower }}</span>
              </Tooltip>
            </div>
            
            <div class="comparison-tags" v-if="selectedWeapon.tags.length > 0 || selectedWeapon.effects.length > 0">
              <Tooltip v-for="tag in selectedWeapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
                <span class="comparison-tag">#{{ tag }}</span>
              </Tooltip>
              <Tooltip v-for="effect in selectedWeapon.effects" :key="effect.type" :title="effect.type" :content="getStatusDescription(effect.type)">
                <span class="comparison-effect">{{ effect.type }}</span>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn-secondary" style="width: 100%; margin-top: 15px;" @click="$emit('close')">
        キャンセル
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Weapon } from '~/types'
import Tooltip from './Tooltip.vue'
import { getTagDescription, getStatusDescription } from '~/utils/weaponPresentation'

interface Props {
  show: boolean
  selectedWeapon: Weapon | null
  playerWeapons: Weapon[]
}

defineProps<Props>()

defineEmits<{
  close: []
  'replace-weapon': [index: number]
  'add-to-empty-slot': []
}>()
</script>

<style scoped>
/* 既存のスタイルはindex.vueから移動 */
</style>
