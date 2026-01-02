<template>
  <div 
    ref="wrapperRef"
    class="tooltip-wrapper" 
    @mouseenter="handleMouseEnter" 
    @mouseleave="handleMouseLeave"
  >
    <slot></slot>
    <ClientOnly>
      <Teleport to="body">
        <div 
          v-if="showTooltip" 
          class="tooltip"
          :style="tooltipStyle"
        >
          <div class="tooltip-title">{{ title }}</div>
          <div class="tooltip-content" v-html="formattedContent"></div>
        </div>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  title: string
  content: string
}>()

const showTooltip = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

const handleMouseEnter = () => {
  if (wrapperRef.value) {
    const rect = wrapperRef.value.getBoundingClientRect()
    tooltipPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.top
    }
  }
  showTooltip.value = true
}

const handleMouseLeave = () => {
  showTooltip.value = false
}

const formattedContent = computed(() => {
  return props.content.replace(/\n/g, '<br>')
})

const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value.x}px`,
  top: `${tooltipPosition.value.y}px`
}))
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: fixed;
  transform: translate(-50%, calc(-100% - 12px));
  background: rgba(0, 0, 0, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 9999;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  animation: slideUp 0.2s ease;
  max-width: 300px;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.95);
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #4facfe;
}

.tooltip-content {
  font-size: 11px;
  opacity: 0.9;
  line-height: 1.6;
  white-space: normal;
}

.tooltip-positive {
  color: #4ade80;
  font-weight: 500;
}

.tooltip-negative {
  color: #ff6b6b;
  font-weight: 500;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, calc(-100% - 4px));
  }
  to {
    opacity: 1;
    transform: translate(-50%, calc(-100% - 12px));
  }
}
</style>
