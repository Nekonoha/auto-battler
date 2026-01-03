<template>
  <div v-if="show" class="weapon-selection-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>🎁 カードパック開封</h2>
        <div class="modal-header-buttons">
          <button @click="$emit('close')" class="btn-close">×</button>
        </div>
      </div>

      <div class="pack-shop">
        <div class="pack-shop-header">
          <span>カードパックショップ</span>
          <span class="pack-gold">所持 {{ playerGold.toLocaleString() }} G</span>
        </div>
        <div class="pack-shop-grid">
          <button
            v-for="pack in packOptions"
            :key="pack.id"
            class="pack-button"
            :disabled="playerGold < pack.cost || isChestOpening"
            @click="$emit('buy-pack', pack.id)"
          >
            <div class="pack-label">{{ pack.label }}</div>
            <div class="pack-meta">{{ pack.cardsPerPack }}枚入り / {{ pack.cost.toLocaleString() }}G</div>
            <div class="pack-odds">高価なほど高レア率</div>
            <div class="pack-weights">
              <span v-for="rarity in rarityOrder(pack.weights)" :key="rarity">
                {{ rarityLabel(rarity) }} {{ rarityPercent(pack.weights, rarity) }}%
              </span>
            </div>
          </button>
        </div>
      </div>

      <div class="chest-controls">
        <div class="chest-remaining">
          未開封カード: <span class="chest-remaining-count">{{ chestCount }}</span> 枚
        </div>
        <div class="chest-control-row solo">
          <button class="btn btn-primary wide" @click="$emit('open-chests', Math.min(9, chestCount))" :disabled="chestCount === 0 || isChestOpening">
            まとめて（最大9枚）めくる
          </button>
        </div>
        <div class="chest-hint">最新のドロップ元: {{ lastLootSourceLabel }}</div>
      </div>

      <!-- 開封済み武器リスト -->
      <div v-if="chestDropCards.length > 0" class="available-weapons">
        <h3>📦 開封カード ({{ chestDropCards.length }})</h3>
        <div v-if="chestDropCards.length === 0" class="empty-slot">
          まだ開封されていません
        </div>
        <div v-else class="weapon-grid">
          <div
            v-for="card in chestDropCards"
            :key="card.id"
            class="weapon-card-wrapper"
            :class="{ revealed: isRevealed(card.id) }"
            :style="{ '--card-delay': card.delay + 'ms' }"
            :data-card-id="card.id"
            :data-rarity="card.weapon.rarity"
            @pointerdown.prevent="startRevealDrag(card.id)"
            @pointermove="dragReveal(card.id)"
            @pointerenter="dragReveal(card.id)"
            @pointerup="stopRevealDrag"
            @pointerleave="stopRevealDrag"
            @click="revealCard(card.id)"
          >
            <div class="card-stack">
              <div
                class="mystery-card"
                :class="[
                  {
                    flipping: isRevealed(card.id),
                    'upgrade-anim': isRevealed(card.id) && willUpgrade(card.weapon.rarity),
                    'guaranteed-high': isGuaranteedHigh(card.weapon.rarity)
                  },
                  'variant-' + getRevealVariant(card.id, card.weapon.rarity)
                ]"
                :data-rarity="getMysteryFaceRarity(card.weapon.rarity)"
                :data-target="card.weapon.rarity"
                :style="{ '--flip-delay': willUpgrade(card.weapon.rarity) ? '0.9s' : '0s' }"
              >
                <div class="mystery-glow"></div>
                <div class="mystery-mask">??</div>
                <div class="mystery-shine"></div>
              </div>
              <div class="reveal-card" :class="{ showing: isRevealed(card.id) }" :style="{ '--flip-delay': willUpgrade(card.weapon.rarity) ? '0.9s' : '0s' }">
                <transition name="reveal-pop">
                  <WeaponDetails
                    v-show="isRevealed(card.id)"
                    :weapon="card.weapon"
                    :showRarityBadge="true"
                    :compact="false"
                  />
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { WeaponSystem } from '~/systems/WeaponSystem'
import WeaponDetails from './WeaponDetails.vue'
import type { Weapon } from '~/types'

interface PackOption {
  id: string
  label: string
  cost: number
  cardsPerPack: number
  weights: Record<string, number>
}

interface ChestDropCard {
  id: string
  weapon: Weapon
  delay: number
}

interface ChestLootEntry {
  id: string
  name: string
  rarity: string
  status: string
  level: number
  tier: string
  timestamp: number
}

interface Props {
  show: boolean
  chestCount: number
  chestOpenCount: number
  isChestOpening: boolean
  lastLootSourceLabel: string
  chestLootHistory: ChestLootEntry[]
  chestDropCards: ChestDropCard[]
  packOptions: PackOption[]
  playerGold: number
  formatTime: (timestamp: number) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'open-chests': [count: number]
  'buy-pack': [packId: string]
}>()

const localChestOpenCount = ref(props.chestOpenCount)

const revealedIds = ref<Set<string>>(new Set())
const isDraggingReveal = ref(false)
const revealAnimMap = ref<Map<string, string>>(new Map())

const rarityOrder = (weights: Record<string, number>) =>
  Object.keys(weights).sort((a, b) => rarityRank(a) - rarityRank(b))

const rarityLabel = (rarity: string) => {
  const map: Record<string, string> = {
    common: 'コモン',
    rare: 'レア',
    epic: 'エピック',
    legendary: 'レジェンド',
    mythic: 'ミシック'
  }
  return map[rarity] ?? rarity
}

const rarityPercent = (weights: Record<string, number>, rarity: string) => {
  const total = Object.values(weights).reduce((sum, v) => sum + v, 0) || 1
  return Math.round(((weights[rarity] ?? 0) / total) * 1000) / 10
}

const pickRevealVariant = (rarity: string) => {
  if (!willUpgrade(rarity)) return 'base'
  if (rarityRank(rarity) < rarityRank('legendary')) return 'base'
  const variants = ['spin-burst', 'spiral-prism', 'blink-shift', 'crack-flare', 'ripple-spread']
  return variants[Math.floor(Math.random() * variants.length)]
}

const getRevealVariant = (id: string, rarity: string) => {
  if (!revealAnimMap.value.has(id)) {
    revealAnimMap.value.set(id, pickRevealVariant(rarity))
  }
  return revealAnimMap.value.get(id) || 'base'
}

const isGuaranteedHigh = (rarity: string) => rarityRank(rarity) >= rarityRank('legendary') && !willUpgrade(rarity)

const isRevealed = (id: string) => revealedIds.value.has(id)

const revealCard = (id: string) => {
  if (!revealedIds.value.has(id)) {
    revealedIds.value = new Set([...revealedIds.value, id])
    
    // カード高さを動的に更新
    nextTick(() => {
      setTimeout(() => {
        const cardEl = document.querySelector(`[data-card-id="${id}"]`) as HTMLElement | null
        if (cardEl) {
          const revealCardEl = cardEl.querySelector('.reveal-card') as HTMLElement | null
          if (revealCardEl) {
            const contentHeight = revealCardEl.scrollHeight
            cardEl.style.height = `${contentHeight}px`
          }
        }
      }, 100)
    })
  }
}

const rarityRank = (rarity: string) => {
  const order = ['common', 'rare', 'epic', 'legendary', 'mythic']
  const base = order.indexOf(rarity)
  if (base >= 0) return base
  const plus = /^mythic(\+*)$/.exec(rarity)
  return plus ? order.indexOf('mythic') + (plus[1]?.length || 0) : order.length
}

const getMysteryFaceRarity = (rarity: string) => {
  if (rarity.startsWith('mythic')) return 'legendary'
  if (rarity === 'legendary') return 'epic'
  if (rarity === 'epic') return 'rare'
  return rarity
}

const willUpgrade = (rarity: string) => getMysteryFaceRarity(rarity) !== rarity

const startRevealDrag = (id: string) => {
  isDraggingReveal.value = true
  revealCard(id)
}

const dragReveal = (id: string) => {
  if (isDraggingReveal.value) revealCard(id)
}

const stopRevealDrag = () => {
  isDraggingReveal.value = false
}

const handleGlobalPointerMove = (event: PointerEvent) => {
  if (!isDraggingReveal.value) return
  const target = event.target as HTMLElement | null
  let cardEl = target?.closest('[data-card-id]') as HTMLElement | null
  if (!cardEl && typeof document !== 'undefined') {
    const elAtPoint = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
    cardEl = elAtPoint?.closest('[data-card-id]') as HTMLElement | null
  }
  const cardId = cardEl?.dataset.cardId
  if (cardId) revealCard(cardId)
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('pointerup', stopRevealDrag)
    window.addEventListener('pointermove', handleGlobalPointerMove)
  }
})

watch(() => props.chestOpenCount, (val) => {
  localChestOpenCount.value = val
})

watch(
  () => props.show,
  (val) => {
    if (val && props.chestCount > 0 && props.chestDropCards.length === 0) {
      emit('open-chests', Math.min(10, props.chestCount))
    }
  },
  { immediate: true }
)

watch(
  () => props.chestDropCards,
  (cards) => {
    const currentIds = new Set(cards.map((c) => c.id))
    revealedIds.value = new Set([...revealedIds.value].filter((id) => currentIds.has(id)))
    revealAnimMap.value = new Map(
      [...revealAnimMap.value].filter(([id]) => currentIds.has(id))
    )
    stopRevealDrag()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  stopRevealDrag()
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointerup', stopRevealDrag)
    window.removeEventListener('pointermove', handleGlobalPointerMove)
  }
})

const getRarityColor = (rarity: string) => {
  return WeaponSystem.getRarityColor(rarity)
}
</script>

<style scoped>
@keyframes chestBounce {
  0% {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes chestGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(255, 215, 0, 0.2);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
  }
}

.weapon-selection-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 15px;
  max-height: 90vh;
  max-width: 90vw;
  overflow-y: auto;
  padding: 20px;
  color: #e0e0e0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.modal-header-buttons {
  display: flex;
  gap: 10px;
}

.btn-close {
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.chest-controls {
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.pack-shop {
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(75, 216, 255, 0.2);
  border-radius: 10px;
}

.pack-shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
}

.pack-gold {
  font-size: 13px;
  color: #ffd479;
}

.pack-shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 6px;
}

.pack-button {
  border: 1px solid rgba(75, 216, 255, 0.35);
  background: linear-gradient(135deg, rgba(15, 25, 40, 0.9), rgba(8, 14, 26, 0.9));
  color: #e0e0e0;
  border-radius: 10px;
  padding: 9px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.pack-button:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(75, 216, 255, 0.6);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
}

.pack-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.pack-label {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
}

.pack-meta {
  font-size: 12px;
  opacity: 0.8;
}

.pack-odds {
  font-size: 12px;
  color: #4bd8ff;
  margin-top: 2px;
}

.pack-weights {
  display: grid;
  gap: 2px;
  font-size: 11px;
  opacity: 0.55;
  transition: opacity 0.18s ease;
  margin-top: 4px;
  color: #cde8ff;
  max-height: 72px;
  overflow: hidden;
}

.pack-button:hover .pack-weights {
  opacity: 1;
}

.chest-control-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.chest-control-row label {
  font-size: 14px;
}

.chest-count-input {
  width: 60px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
  color: #e0e0e0;
}

.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
.chest-remaining {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.chest-remaining-count {
  font-size: 22px;
  color: #4bd8ff;
}
  font-size: 13px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.btn.wide {
  width: 100%;
  justify-content: center;
}
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #2c3446 0%, #202735 100%);
  color: #e0e0e0;
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3c4456 0%, #303745 100%);
}

.chest-hint {
  font-size: 12px;
  opacity: 0.7;
}

h3 {
  margin: 15px 0 10px 0;
  font-size: 16px;
}

.available-weapons {
  margin-top: 20px;
}

.weapon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
}

@media (max-width: 1100px) {
  .weapon-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .weapon-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .weapon-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}

@media (min-width: 1100px) {
  .weapon-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.weapon-card-wrapper {
  animation: chestBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-delay: var(--card-delay, 0ms);
  position: relative;
  height: 260px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  background: transparent;
}

@media (max-width: 768px) {
  .weapon-card-wrapper {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .weapon-card-wrapper {
    height: 160px;
  }
}

@media (max-width: 768px) {
  .weapon-card-wrapper {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .weapon-card-wrapper {
    height: 160px;
  }
}

.weapon-card-wrapper.revealed {
  animation: chestBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), revealGlow 1.1s ease forwards;
}

@keyframes revealGlow {
  0% { box-shadow: 0 0 0 rgba(75, 216, 255, 0.0); }
  50% { box-shadow: 0 0 28px rgba(75, 216, 255, 0.45); }
  100% { box-shadow: 0 0 8px rgba(75, 216, 255, 0.25); }
}

.card-stack {
  position: relative;
  width: 100%;
  height: 100%;
  perspective: 1200px;
  background: transparent;
}

.mystery-card,
.reveal-card {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  transition: transform 0.45s ease, opacity 0.45s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  transition-delay: var(--flip-delay, 0s);
}

.mystery-card {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(6, 6, 8, 0.92), rgba(2, 2, 4, 0.95));
  overflow: hidden;
  display: grid;
  place-items: center;
  color: rgba(75, 216, 255, 0.8);
  letter-spacing: 2px;
  text-transform: uppercase;
  box-shadow: inset 0 0 32px rgba(0, 0, 0, 0.7);
  transform: rotateY(0deg);
  z-index: 2;
}

.mystery-card.guaranteed-high[data-target="legendary"] {
  border-color: rgba(255, 206, 120, 0.9);
  background: linear-gradient(145deg, rgba(70, 45, 10, 0.98), rgba(35, 22, 4, 0.98));
  box-shadow:
    inset 0 0 60px rgba(255, 190, 90, 0.4),
    0 0 28px rgba(255, 200, 120, 0.35);
}

.mystery-card.guaranteed-high[data-target^="mythic"] {
  border-color: rgba(255, 230, 180, 0.95);
  background: linear-gradient(145deg, rgba(35, 26, 80, 0.96), rgba(20, 10, 40, 0.96));
  box-shadow:
    inset 0 0 70px rgba(120, 180, 255, 0.45),
    0 0 30px rgba(255, 220, 200, 0.45);
}

.mystery-card.upgrade-anim::after {
  content: "";
  position: absolute;
  inset: -20%;
  background: transparent;
  opacity: 0;
  animation: upgradeFlash 0.6s ease forwards;
  filter: blur(6px);
  pointer-events: none;
}

.mystery-card.upgrade-anim.variant-spin-burst {
  animation: upgradeSpinBurst 0.9s ease-in-out forwards;
}

.mystery-card.upgrade-anim.variant-spiral-prism {
  animation: upgradeSpiralPrism 0.9s ease-in-out forwards;
}

.mystery-card.upgrade-anim.variant-blink-shift {
  animation: upgradeBlinkShift 0.9s steps(6, end) forwards;
}

.mystery-card.upgrade-anim.variant-crack-flare {
  animation: upgradeCrackFlare 0.95s ease-in-out forwards;
}

.mystery-card.upgrade-anim.variant-ripple-spread {
  animation: upgradeRippleSpread 0.95s ease-in-out forwards;
}

.mystery-card.upgrade-anim[data-target="legendary"],
.mystery-card.upgrade-anim[data-target^="mythic"] {
  border-color: rgba(255, 210, 130, 0.9);
  box-shadow:
    inset 0 0 70px rgba(255, 190, 90, 0.55),
    0 0 32px rgba(255, 210, 130, 0.45);
}

.mystery-card.upgrade-anim[data-target="epic"] {
  border-color: rgba(186, 120, 255, 0.85);
  box-shadow:
    inset 0 0 55px rgba(120, 60, 160, 0.55),
    0 0 26px rgba(186, 120, 255, 0.35);
}

.mystery-card.upgrade-anim[data-target="rare"] {
  border-color: rgba(90, 140, 255, 0.8);
  box-shadow:
    inset 0 0 48px rgba(60, 90, 180, 0.45),
    0 0 22px rgba(90, 140, 255, 0.3);
}

@keyframes upgradeFlash {
  0% { opacity: 0; transform: scale(0.92); }
  40% { opacity: 0.95; transform: scale(1.02); }
  70% { opacity: 0.6; transform: scale(1.05); }
  100% { opacity: 0; transform: scale(1.08); }
}

@keyframes upgradeSpinBurst {
  0% { transform: rotateY(0deg) scale(1); filter: hue-rotate(0deg) brightness(1); }
  40% { transform: rotateY(360deg) scale(1.05); filter: hue-rotate(90deg) brightness(1.1); }
  80% { transform: rotateY(540deg) scale(1.08); filter: hue-rotate(160deg) brightness(1.2); }
  100% { transform: rotateY(720deg) scale(1.1); filter: hue-rotate(220deg) brightness(1.2); }
}

@keyframes upgradeSpiralPrism {
  0% { transform: rotateY(0deg) rotateZ(0deg) scale(1); filter: saturate(1); }
  30% { transform: rotateY(270deg) rotateZ(6deg) scale(1.04); filter: saturate(1.2) hue-rotate(60deg); }
  60% { transform: rotateY(540deg) rotateZ(-6deg) scale(1.08); filter: saturate(1.4) hue-rotate(140deg); }
  100% { transform: rotateY(720deg) rotateZ(0deg) scale(1.1); filter: saturate(1.5) hue-rotate(200deg); }
}

@keyframes upgradeBlinkShift {
  0% { filter: hue-rotate(0deg) brightness(1); transform: scale(1); }
  20% { filter: hue-rotate(80deg) brightness(1.2); transform: scale(1.04); }
  40% { filter: hue-rotate(140deg) brightness(0.9); transform: scale(0.97); }
  60% { filter: hue-rotate(220deg) brightness(1.25); transform: scale(1.06); }
  80% { filter: hue-rotate(300deg) brightness(0.95); transform: scale(0.99); }
  100% { filter: hue-rotate(360deg) brightness(1.2); transform: scale(1.08); }
}

@keyframes upgradeCrackFlare {
  0% { clip-path: inset(0 0 0 0); filter: brightness(0.9); }
  30% { clip-path: polygon(0 0, 100% 0, 60% 45%, 0 55%); filter: brightness(1.3) hue-rotate(60deg); }
  60% { clip-path: polygon(0 45%, 100% 35%, 100% 100%, 0 100%); filter: brightness(1.4) hue-rotate(140deg); }
  100% { clip-path: inset(0 0 0 0); filter: brightness(1.15) hue-rotate(220deg); }
}

@keyframes upgradeRippleSpread {
  0% { background: radial-gradient(circle at var(--touch-x, 50%) var(--touch-y, 50%), rgba(255,255,255,0.25), transparent 30%), #050608; filter: hue-rotate(0deg); }
  40% { background: radial-gradient(circle at var(--touch-x, 50%) var(--touch-y, 50%), rgba(120,200,255,0.35), transparent 45%), #0a0f18; filter: hue-rotate(100deg); }
  70% { background: radial-gradient(circle at var(--touch-x, 50%) var(--touch-y, 50%), rgba(255,180,220,0.4), transparent 60%), #121c30; filter: hue-rotate(180deg); }
  100% { background: radial-gradient(circle at var(--touch-x, 50%) var(--touch-y, 50%), rgba(255,220,180,0.35), transparent 75%), #1a2540; filter: hue-rotate(240deg); }
}

.mystery-card[data-rarity="legendary"]::after,
.mystery-card[data-rarity="mythic"]::after {
  content: "";
  position: absolute;
  inset: -20%;
  background: conic-gradient(
    from 0deg,
    rgba(255, 200, 120, 0.15),
    rgba(255, 120, 200, 0.22),
    rgba(120, 200, 255, 0.18),
    rgba(255, 200, 120, 0.15)
  );
  filter: blur(18px);
  animation: prismGlow 2.8s linear infinite;
  pointer-events: none;
}

@keyframes prismGlow {
  0% { transform: rotate(0deg) scale(1); opacity: 0.65; }
  50% { transform: rotate(180deg) scale(1.05); opacity: 0.9; }
  100% { transform: rotate(360deg) scale(1); opacity: 0.65; }
}

.weapon-card-wrapper:hover .mystery-card {
  transform: translateY(-2px) rotateY(0deg);
  border-color: rgba(75, 216, 255, 0.6);
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.6), 0 6px 16px rgba(0, 0, 0, 0.4);
}

.mystery-card.flipping {
  transform: rotateY(180deg);
  opacity: 0;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.7);
}

.reveal-card {
  background: rgba(10, 15, 28, 0.92);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5), 0 10px 30px rgba(0, 0, 0, 0.45);
  transform: rotateY(-180deg);
  z-index: 3;
  display: grid;
  place-items: stretch;
  padding: 8px;
  opacity: 0;
  overflow: hidden;
  position: relative;
  max-width: 100%;
  max-height: 100%;
}

.reveal-card.showing {
  transform: rotateY(0deg);
  opacity: 1;
  transition-delay: var(--flip-delay, 0s);
}

.reveal-card > * {
  width: 100%;
  height: 100%;
  overflow: auto;
  max-width: 100%;
  max-height: 100%;
  box-sizing: border-box;
}

.weapon-card-wrapper.revealed .reveal-card::after {
  content: "";
  position: absolute;
  inset: -10%;
  background: radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.25), transparent 55%),
    radial-gradient(circle at 80% 60%, rgba(75, 216, 255, 0.22), transparent 50%);
  mix-blend-mode: screen;
  opacity: 0;
  animation: burstGlow 1s ease forwards 0.1s;
  pointer-events: none;
}

.weapon-card-wrapper[data-rarity="legendary"].revealed .reveal-card::after,
.weapon-card-wrapper[data-rarity="mythic"].revealed .reveal-card::after {
  background:
    conic-gradient(
      from 0deg,
      rgba(255, 220, 140, 0.25),
      rgba(255, 120, 200, 0.3),
      rgba(120, 200, 255, 0.28),
      rgba(255, 220, 140, 0.25)
    ),
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.35), transparent 55%),
    radial-gradient(circle at 70% 70%, rgba(255, 200, 120, 0.3), transparent 50%);
  animation: burstPrism 1.2s ease forwards 0.05s;
}

@keyframes burstGlow {
  0% { opacity: 0; transform: scale(0.95); }
  50% { opacity: 0.8; transform: scale(1.02); }
  100% { opacity: 0; transform: scale(1.08); }
}

@keyframes burstPrism {
  0% { opacity: 0; transform: scale(0.92) rotate(0deg); }
  45% { opacity: 0.9; transform: scale(1.05) rotate(8deg); }
  100% { opacity: 0; transform: scale(1.12) rotate(16deg); }
}

.mystery-mask {
  font-size: 32px;
  font-weight: 800;
  z-index: 2;
  text-shadow: 0 0 8px rgba(75, 216, 255, 0.6);
}

@media (max-width: 768px) {
  .mystery-mask {
    font-size: 26px;
  }
}

@media (max-width: 480px) {
  .mystery-mask {
    font-size: 20px;
  }
}

.mystery-glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle at 50% 40%, rgba(75, 216, 255, 0.35), transparent 55%);
  filter: blur(12px);
  opacity: 0.8;
  animation: pulseGlow 1.6s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.35; transform: scale(0.95); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.mystery-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 40%, rgba(255, 255, 255, 0.12) 50%, transparent 60%);
  transform: translateX(-100%);
  animation: sweep 1.4s ease-in-out infinite;
}

@keyframes sweep {
  0% { transform: translateX(-100%); }
  60% { transform: translateX(60%); }
  100% { transform: translateX(120%); }
}

.reveal-pop-enter-active {
  animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  0% { transform: scale(0.85); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}

.empty-slot {
  text-align: center;
  padding: 16px;
  opacity: 0.7;
  background: rgba(0, 0, 0, 0.25);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

/* パック開封カード レスポンシブ対応 */
@media (max-width: 768px) {
  .pack-shop {
    margin-bottom: 8px;
    padding: 8px;
  }

  .pack-shop-header {
    margin-bottom: 6px;
    font-size: 14px;
  }

  .pack-gold {
    font-size: 12px;
  }

  .pack-shop-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 4px;
  }

  .pack-button {
    padding: 8px;
    border-radius: 8px;
  }

  .pack-label {
    font-size: 13px;
    margin-bottom: 3px;
  }

  .pack-meta {
    font-size: 11px;
  }

  .pack-odds {
    font-size: 11px;
    margin-top: 1px;
  }

  .pack-weights {
    font-size: 10px;
    max-height: 60px;
    margin-top: 3px;
  }
}

@media (max-width: 480px) {
  .pack-shop {
    margin-bottom: 6px;
    padding: 6px;
  }

  .pack-shop-header {
    margin-bottom: 4px;
    font-size: 13px;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .pack-gold {
    font-size: 11px;
  }

  .pack-shop-grid {
    grid-template-columns: 1fr 1fr;
    gap: 3px;
  }

  .pack-button {
    padding: 6px;
    border-radius: 6px;
  }

  .pack-label {
    font-size: 12px;
    margin-bottom: 2px;
  }

  .pack-meta {
    font-size: 10px;
    line-height: 1.2;
  }

  .pack-odds {
    font-size: 10px;
    margin-top: 0px;
  }

  .pack-weights {
    font-size: 9px;
    max-height: 50px;
    margin-top: 2px;
    gap: 1px;
  }

  .mystery-mask {
    font-size: 24px;
  }
}
</style>
