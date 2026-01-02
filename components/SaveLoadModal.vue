<template>
  <div v-if="show" class="loot-modal">
    <div class="loot-content" style="max-width: 640px;">
      <div class="modal-header">
        <h2>💾 セーブ / ロード</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">💾 セーブスロット</h3>
        <div class="save-slot-list">
          <div v-for="entry in saveEntries" :key="entry.id" class="save-slot-item">
            <div class="save-slot-info">
              <div class="save-slot-name">{{ entry.label }}</div>
              <div class="save-slot-meta">
                <span v-if="entry.savedAt">保存: {{ formatTime(entry.savedAt) }}</span>
                <span v-else>未保存</span>
              </div>
            </div>
            <div class="save-slot-actions">
              <button 
                class="btn btn-primary"
                :disabled="entry.kind === 'auto'"
                @click="$emit('save-entry', entry)"
              >
                上書き保存
              </button>
              <button 
                class="btn btn-secondary" 
                :disabled="!entry.savedAt"
                @click="$emit('load-entry', entry)"
              >ロード</button>
              <button 
                class="btn btn-info" 
                :disabled="!entry.savedAt"
                @click="$emit('download-entry', entry)"
              >DL</button>
              <button 
                class="btn btn-danger" 
                :disabled="entry.kind === 'auto' || !entry.savedAt"
                @click="$emit('delete-entry', entry)"
              >削除</button>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">📤 セーブデータをアップロード</h3>
        <div class="upload-area">
          <input 
            type="file" 
            ref="fileInput" 
            accept=".json" 
            @change="$emit('upload', $event)" 
            style="display: none;"
          />
          <button class="btn btn-success" @click="triggerUpload" style="width: 100%;">
            📤 ファイルからロード
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">🧹 プレイヤーを初期化</h3>
        <p class="settings-note">現在の進行を破棄して最初の状態に戻します（オートセーブも消去）。手動セーブは残ります。</p>
        <button class="btn btn-danger" style="width: 100%;" @click="$emit('hard-reset')">
          プレイヤーデータを削除して最初から
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type SaveEntry = {
  id: string
  label: string
  savedAt: number | null
  kind: 'auto' | 'manual'
}

type Emits = {
  (e: 'close'): void
  (e: 'save-entry', entry: SaveEntry): void
  (e: 'load-entry', entry: SaveEntry): void
  (e: 'download-entry', entry: SaveEntry): void
  (e: 'delete-entry', entry: SaveEntry): void
  (e: 'upload', event: Event): void
  (e: 'hard-reset'): void
}

defineProps<{
  show: boolean
  saveEntries: SaveEntry[]
  formatTime: (ts?: number | null) => string
}>()

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerUpload = () => {
  fileInput.value?.click()
}
</script>
