<template>
  <div id="app">
    <header class="app-header">
      <h1>⚔️ オートバトラー</h1>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-warning" @click="showSellMenu = true">💰 売却メニュー</button>
        <button class="btn btn-settings" @click="showSettings = true">⚙️ 設定</button>
      </div>
    </header>

    <div class="game-container">
      <div class="control-grid">
        <div class="panel dungeon-panel">
          <div class="panel-header">
            <h2>ダンジョン</h2>
            <div class="chips">
              <span class="chip">ステージ {{ currentStage }}/{{ totalStages }}</span>
              <span class="chip">状態 {{ currentEventLabel }}</span>
              <span class="chip">宝箱 {{ chestCount }}</span>
              <span v-if="hasPendingChest" class="chip warning">宝箱保留中</span>
            </div>
          </div>

          <div class="dungeon-picker">
            <div class="dungeon-info">
              <label for="dungeon-select">ダンジョン</label>
              <select id="dungeon-select" v-model="selectedDungeonId" :disabled="isRunLocked">
                <option v-for="dungeon in dungeons" :key="dungeon.id" :value="dungeon.id">
                  {{ dungeon.name }} (Lv{{ dungeon.levelRange[0] }}-{{ dungeon.levelRange[1] }})
                </option>
              </select>
            </div>
            <div class="dungeon-desc" v-if="selectedDungeon">
              <div class="dungeon-name">{{ selectedDungeon.name }}</div>
              <div class="dungeon-text">{{ selectedDungeon.description }}</div>
              <div class="dungeon-meta">
                敵レベル: {{ selectedDungeon.levelRange[0] }}-{{ selectedDungeon.levelRange[1] }} / 宝箱確率: {{ Math.round((selectedDungeon.chestChance ?? 0.1) * 100) }}%<br />
                レアリティ傾向: Common {{ Math.round(selectedDungeon.lootWeights.common * 100) }}%・Rare {{ Math.round(selectedDungeon.lootWeights.rare * 100) }}%・Epic {{ Math.round(selectedDungeon.lootWeights.epic * 100) }}%・Legend {{ Math.round(selectedDungeon.lootWeights.legendary * 100) }}%
              </div>
            </div>
          </div>

          <div class="button-row">
            <button class="btn btn-action" @click="handleStartBattle" :disabled="isRunLocked">
              探索開始 (10ステージ)
            </button>
            <button
              class="btn btn-success"
              @click="handleNextBattle"
              :disabled="!combat || !combat.isGameOver() || isRunLocked"
            >
              次のステージへ
            </button>
            <button class="btn btn-danger" @click="handleAbandon" :disabled="!isDungeonRunning">
              探索中止
            </button>
          </div>

          <div v-if="hasPendingChest" class="chest-action">
            <button class="btn btn-special" @click="openPendingChest">
              🎁 宝箱を開く ({{ chestCount }}個保留中)
            </button>
          </div>

          <div class="auto-row">
            <div class="speed-label">AUTO</div>
            <button
              class="btn btn-secondary btn-compact"
              @click="toggleAuto"
              :disabled="!combat || combat.isGameOver()"
            >
              {{ isAutoRunning ? '一時停止' : '再開' }}
            </button>
            <div class="speed-buttons">
              <button
                class="btn btn-secondary btn-compact"
                :class="{ active: battleSpeed === 1 }"
                @click="changeSpeed(1)"
              >
                x1
              </button>
              <button
                class="btn btn-secondary btn-compact"
                :class="{ active: battleSpeed === 2 }"
                @click="changeSpeed(2)"
              >
                x2
              </button>
              <button
                class="btn btn-secondary btn-compact"
                :class="{ active: battleSpeed === 4 }"
                @click="changeSpeed(4)"
              >
                x4
              </button>
            </div>
          </div>

          <div v-if="infoMessages.length" class="info-messages">
            <div v-for="(msg, idx) in infoMessages" :key="idx" class="info-message">
              {{ msg }}
            </div>
          </div>
        </div>
      </div>

      <div class="battle-area">
        <PlayerInfo 
          :player="player" 
          :isRunLocked="isRunLocked"
          @openWeaponManager="showWeaponSelection = true"
          @openStatManager="showStatManager = true"
        />

        <div>
          <CombatLog :logs="combatLogs" />
          <div v-if="combat?.isGameOver()" class="battle-result">
            <div v-if="combat.isPlayerVictory()" class="victory">
              <h2>🎉 勝利！</h2>
              <p>次のレベルに挑戦しましょう</p>
            </div>
            <div v-else class="defeat">
              <h2>💀 敗北...</h2>
              <p>装備を見直して再挑戦しましょう</p>
            </div>
          </div>
        </div>

        <EnemyInfo v-if="enemy" :enemy="enemy" />
      </div>
    </div>

    <div v-if="showWeaponSelection" class="weapon-selection-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>⚙️ 武器の付け替え</h2>
          <div class="gold-display">💰 {{ player.gold }}G</div>
          <button @click="showWeaponSelection = false" class="btn-close">×</button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showWeaponSelection = false">バトルに戻る</button>
        </div>

        <!-- 装備中の武器 -->
        <div class="current-weapons">
          <h3>装備中の武器 ({{ player.weapons.length }}/3)</h3>
          <div v-if="player.weapons.length === 0" class="empty-slot">
            装備武器がありません
          </div>
          <div v-else class="weapon-list">
            <div 
              v-for="weapon in player.weapons"
              :key="weapon.id"
              class="weapon-list-item"
              :style="{ borderColor: getWeaponRarityColor(weapon.rarity) }"
            >
              <div class="weapon-list-info">
                <div class="weapon-list-name">
                  {{ weapon.name }}
                  <span class="weapon-rarity-badge" :style="{ background: getWeaponRarityColor(weapon.rarity) }">{{ weapon.rarity }}</span>
                </div>
                <div class="weapon-list-type">{{ weapon.type }}</div>
                <div class="weapon-description">{{ weapon.description }}</div>
                <!-- 全ステータス表示 -->
                <div class="weapon-list-stats">
                  <Tooltip v-if="weapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                    <span>⚔️{{ weapon.stats.attack }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                    <span>✨{{ weapon.stats.magic }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                    <span>⚡{{ weapon.stats.speed }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                    <span>🎯{{ weapon.stats.critChance }}%</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.critDamage > 0" title="💥 クリティカルダメージ" content="クリティカル時のダメージ増加">
                    <span>💥{{ weapon.stats.critDamage }}%</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                    <span>🔮{{ weapon.stats.statusPower }}</span>
                  </Tooltip>
                </div>
                <!-- タグと効果（Tooltipつき） -->
                <div class="weapon-list-tags-effects">
                  <Tooltip v-for="tag in weapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
                    <span class="mini-tag">{{ tag }}</span>
                  </Tooltip>
                  <Tooltip v-for="effect in weapon.effects" :key="effect.type" :title="effect.type" :content="getStatusDescription(effect.type)">
                    <span class="mini-effect">{{ effect.type }}</span>
                  </Tooltip>
                </div>
              </div>
              <button 
                class="btn btn-danger btn-compact"
                @click.stop="removeWeapon(weapon)"
                :disabled="isRunLocked"
              >
                外す
              </button>
            </div>
          </div>
        </div>

        <!-- 利用可能な武器 -->
        <div class="available-weapons">
          <div class="weapons-header">
            <h3>利用可能な武器 ({{ filteredWeapons.length }})</h3>
            <div class="filter-controls">
              <!-- レア度フィルタ -->
              <select v-model="rarityFilter" class="filter-select">
                <option value="all">全レア度</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
              <!-- タイプフィルタ -->
              <select v-model="typeFilter" class="filter-select">
                <option value="all">全タイプ</option>
                <option value="melee">melee</option>
                <option value="ranged">ranged</option>
                <option value="magic">magic</option>
                <option value="dot">dot</option>
              </select>
              <!-- ソート -->
              <select v-model="sortBy" class="filter-select">
                <option value="name">名前順</option>
                <option value="rarity">レア度順</option>
                <option value="attack">攻撃力順</option>
                <option value="magic">魔法力順</option>
                <option value="speed">速度順</option>
              </select>
            </div>
            
            <!-- タグフィルタ（チップ形式） -->
            <div class="filter-section">
              <div class="filter-section-title">🏷️ タグフィルタ</div>
              <div class="tag-filters">
                <label v-for="tag in availableTags" :key="tag" class="tag-chip">
                  <input type="checkbox" :value="tag" v-model="selectedTags" />
                  <span>{{ tag }}</span>
                </label>
              </div>
            </div>

            <!-- 効果フィルタ（チップ形式） -->
            <div class="filter-section">
              <div class="filter-section-title">✨ 効果フィルタ</div>
              <div class="effect-filters">
                <label v-for="effect in availableEffects" :key="effect" class="effect-chip">
                  <input type="checkbox" :value="effect" v-model="selectedEffects" />
                  <span>{{ effect }}</span>
                </label>
              </div>
            </div>
          </div>
          <div v-if="filteredWeapons.length === 0" class="empty-slot">
            条件に一致する武器がありません
          </div>
          <div v-else class="weapon-list">
            <div 
              v-for="weapon in filteredWeapons"
              :key="weapon.id"
              class="weapon-list-item"
              :style="{ borderColor: getWeaponRarityColor(weapon.rarity) }"
              @click.stop="equipWeapon(weapon)"
              style="cursor: pointer;"
            >
              <div class="weapon-list-info">
                <div class="weapon-list-name">
                  {{ weapon.name }}
                  <span class="weapon-rarity-badge" :style="{ background: getWeaponRarityColor(weapon.rarity) }">{{ weapon.rarity }}</span>
                </div>
                <div class="weapon-list-type">{{ weapon.type }}</div>
                <div class="weapon-description">{{ weapon.description }}</div>
                <!-- 全ステータス表示 -->
                <div class="weapon-list-stats">
                  <Tooltip v-if="weapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                    <span>⚔️{{ weapon.stats.attack }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                    <span>✨{{ weapon.stats.magic }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                    <span>⚡{{ weapon.stats.speed }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                    <span>🎯{{ weapon.stats.critChance }}%</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.critDamage > 0" title="💥 クリティカルダメージ" content="クリティカル時のダメージ増加">
                    <span>💥{{ weapon.stats.critDamage }}%</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                    <span>🔮{{ weapon.stats.statusPower }}</span>
                  </Tooltip>
                </div>
                <!-- タグと効果（Tooltipつき） -->
                <div class="weapon-list-tags-effects">
                  <Tooltip v-for="tag in weapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
                    <span class="mini-tag">#{{ tag }}</span>
                  </Tooltip>
                  <Tooltip v-for="effect in weapon.effects" :key="effect.type" :title="effect.type" :content="getStatusDescription(effect.type)">
                    <span class="mini-effect">{{ effect.type }}</span>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showStatManager" class="loot-modal">
      <div class="loot-content stat-manager-content">
        <div class="modal-header">
          <h2>🧠 ステータス割り振り</h2>
          <button @click="showStatManager = false" class="btn-close">×</button>
        </div>
        <p class="loot-subtitle">残りSP: {{ player.statPoints }}</p>
        
        <div class="stat-sliders">
          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">❤️</span>
              <span class="stat-name">最大HP</span>
              <span class="stat-value">{{ tempStatAlloc.maxHp >= 0 ? '+' : '' }}{{ tempStatAlloc.maxHp * 25 }}</span>
            </div>
            <input 
              type="range" 
              :min="-Math.floor(allocatedStats.maxHp / 25)" 
              :max="player.statPoints"
              v-model.number="tempStatAlloc.maxHp"
              class="stat-slider"
              :disabled="isRunLocked"
              @input="constrainTempAlloc"
            />
            <div class="stat-slider-info">
              現在: {{ player.maxHp }} → {{ player.maxHp + tempStatAlloc.maxHp * 25 }}
            </div>
          </div>

          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">⚔️</span>
              <span class="stat-name">攻撃力</span>
              <span class="stat-value">{{ tempStatAlloc.attack >= 0 ? '+' : '' }}{{ tempStatAlloc.attack * 5 }}</span>
            </div>
            <input 
              type="range" 
              :min="-Math.floor(allocatedStats.attack / 5)" 
              :max="player.statPoints"
              v-model.number="tempStatAlloc.attack"
              class="stat-slider"
              :disabled="isRunLocked"
              @input="constrainTempAlloc"
            />
            <div class="stat-slider-info">
              現在: {{ player.stats.attack }} → {{ player.stats.attack + tempStatAlloc.attack * 5 }}
            </div>
          </div>

          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">🔮</span>
              <span class="stat-name">魔法力</span>
              <span class="stat-value">{{ tempStatAlloc.magic >= 0 ? '+' : '' }}{{ tempStatAlloc.magic * 5 }}</span>
            </div>
            <input 
              type="range" 
              :min="-Math.floor(allocatedStats.magic / 5)" 
              :max="player.statPoints"
              v-model.number="tempStatAlloc.magic"
              class="stat-slider"
              :disabled="isRunLocked"
              @input="constrainTempAlloc"
            />
            <div class="stat-slider-info">
              現在: {{ player.stats.magic }} → {{ player.stats.magic + tempStatAlloc.magic * 5 }}
            </div>
          </div>

          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">🛡️</span>
              <span class="stat-name">防御力</span>
              <span class="stat-value">{{ tempStatAlloc.defense >= 0 ? '+' : '' }}{{ tempStatAlloc.defense * 3 }}</span>
            </div>
            <input 
              type="range" 
              :min="-Math.floor(allocatedStats.defense / 3)" 
              :max="player.statPoints"
              v-model.number="tempStatAlloc.defense"
              class="stat-slider"
              :disabled="isRunLocked"
              @input="constrainTempAlloc"
            />
            <div class="stat-slider-info">
              現在: {{ player.stats.defense }} → {{ player.stats.defense + tempStatAlloc.defense * 3 }}
            </div>
          </div>

          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">✨</span>
              <span class="stat-name">魔法防御</span>
              <span class="stat-value">{{ tempStatAlloc.magicDefense >= 0 ? '+' : '' }}{{ tempStatAlloc.magicDefense * 3 }}</span>
            </div>
            <input 
              type="range" 
              :min="-Math.floor(allocatedStats.magicDefense / 3)" 
              :max="player.statPoints"
              v-model.number="tempStatAlloc.magicDefense"
              class="stat-slider"
              :disabled="isRunLocked"
              @input="constrainTempAlloc"
            />
            <div class="stat-slider-info">
              現在: {{ player.stats.magicDefense }} → {{ player.stats.magicDefense + tempStatAlloc.magicDefense * 3 }}
            </div>
          </div>

          <div class="stat-slider-item">
            <div class="stat-slider-header">
              <span class="stat-icon">⚡</span>
              <span class="stat-name">速度</span>
              <span class="stat-value">{{ tempStatAlloc.speed >= 0 ? '+' : '' }}{{ tempStatAlloc.speed * 2 }}</span>
            </div>
            <input 
              type="range" 
              :min="-Math.floor(allocatedStats.speed / 2)" 
              :max="player.statPoints"
              v-model.number="tempStatAlloc.speed"
              class="stat-slider"
              :disabled="isRunLocked"
              @input="constrainTempAlloc"
            />
            <div class="stat-slider-info">
              現在: {{ player.stats.speed }} → {{ player.stats.speed + tempStatAlloc.speed * 2 }}
            </div>
          </div>
        </div>

        <div class="stat-manager-actions">
          <button class="btn btn-primary" :disabled="totalTempAlloc === 0 || isRunLocked" @click="applyStatAllocation">
            適用 ({{ totalTempAlloc }}SP使用)
          </button>
          <button class="btn btn-secondary" @click="resetTempAllocation">
            リセット
          </button>
          <button class="btn btn-danger" :disabled="isRunLocked" @click="handleResetStats">
            全リセット ({{ calculateResetCost() }}G)
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSettings" class="loot-modal">
      <div class="loot-content">
        <div class="modal-header">
          <h2>⚙️ 設定</h2>
          <button @click="showSettings = false" class="btn-close">×</button>
        </div>

        <div class="settings-section">
          <h3 class="settings-title">💾 セーブデータ管理</h3>
          <div class="settings-buttons">
            <button class="btn btn-primary" @click="downloadSaveData" style="width: 100%;">
              📥 セーブデータをダウンロード
            </button>
            <div class="upload-area">
              <input 
                type="file" 
                ref="fileInput" 
                accept=".json" 
                @change="uploadSaveData" 
                style="display: none;"
              />
              <button class="btn btn-success" @click="$refs.fileInput.click()" style="width: 100%;">
                📤 セーブデータをアップロード
              </button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3 class="settings-title">📊 ログエクスポート</h3>
          <div class="settings-buttons">
            <button 
              class="btn btn-info" 
              @click="exportCombatLog" 
              :disabled="combatLogs.length === 0"
              style="width: 100%;"
            >
              📝 戦闘ログをエクスポート ({{ combatLogs.length }}件)
            </button>
            <button 
              class="btn btn-info" 
              @click="exportDungeonLog" 
              :disabled="dungeonLogs.length === 0"
              style="width: 100%;"
            >
              🏰 ダンジョンログをエクスポート ({{ dungeonLogs.length }}件)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 売却メニューモーダル -->
    <div v-if="showSellMenu" class="loot-modal">
      <div class="loot-content" style="max-height: 80vh; overflow-y: auto;">
        <div class="modal-header">
          <h2>💰 武器を売却</h2>
          <button @click="showSellMenu = false" class="btn-close">×</button>
        </div>
        <p class="loot-subtitle">
          複数の武器を選択して一括売却できます
        </p>
        
        <div v-if="availableWeapons.length === 0" style="text-align: center; padding: 20px; opacity: 0.6;">
          売却可能な武器がありません
        </div>
        <div v-else>
          <div style="margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>
                選択中: {{ selectedSellWeapons.size }} 件
                <span v-if="selectedSellWeapons.size > 0">
                  (合計 {{ [...selectedSellWeapons].reduce((sum, id) => {
                    const w = availableWeapons.find(weapon => weapon.id === id)
                    return sum + ((w as any).sellValue || 10)
                  }, 0) }}G)
                </span>
              </span>
              <button 
                v-if="selectedSellWeapons.size > 0"
                class="btn btn-success"
                @click="sellSelectedWeapons"
              >
                売却実行
              </button>
            </div>
          </div>

          <div class="weapons-grid">
            <div 
              v-for="weapon in availableWeapons"
              :key="weapon.id"
              class="sell-weapon-card"
              :class="{ 'sell-selected': selectedSellWeapons.has(weapon.id), 'sell-disabled': !canSellWeapon(weapon) }"
              :style="{ borderColor: selectedSellWeapons.has(weapon.id) ? '#4CAF50' : getWeaponRarityColor(weapon.rarity) }"
              @click="canSellWeapon(weapon) && toggleSelectWeapon(weapon.id)"
            >
              <input 
                type="checkbox"
                :checked="selectedSellWeapons.has(weapon.id)"
                :disabled="!canSellWeapon(weapon)"
                class="sell-checkbox"
              />
              <div class="sell-weapon-info">
                <div class="sell-weapon-name">
                  {{ weapon.name }}
                  <span class="weapon-rarity-badge" :style="{ background: getWeaponRarityColor(weapon.rarity) }">{{ weapon.rarity }}</span>
                </div>
                <div class="sell-weapon-type">{{ weapon.type }}</div>
                <div class="sell-weapon-desc">{{ weapon.description }}</div>
                
                <div class="sell-weapon-stats">
                  <Tooltip v-if="weapon.stats.attack > 0" title="⚔️ 攻撃力" content="物理ダメージに影響">
                    <span class="sell-stat">⚔️{{ weapon.stats.attack }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.magic > 0" title="✨ 魔法力" content="魔法ダメージに影響">
                    <span class="sell-stat">✨{{ weapon.stats.magic }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.speed > 0" title="⚡ 速度" content="攻撃順序と頻度に影響">
                    <span class="sell-stat">⚡{{ weapon.stats.speed }}</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.critChance > 0" title="🎯 クリティカル率" content="クリティカルヒットの発生確率">
                    <span class="sell-stat">🎯{{ weapon.stats.critChance }}%</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.critDamage > 0" title="💥 クリティカルダメージ" content="クリティカル時のダメージ増加">
                    <span class="sell-stat">💥{{ weapon.stats.critDamage }}%</span>
                  </Tooltip>
                  <Tooltip v-if="weapon.stats.statusPower > 0" title="🔮 状態異常威力" content="状態異常の効果を強化">
                    <span class="sell-stat">🔮{{ weapon.stats.statusPower }}</span>
                  </Tooltip>
                </div>
                
                <div class="sell-weapon-tags">
                  <Tooltip v-for="tag in weapon.tags" :key="tag" :title="tag" :content="getTagDescription(tag)">
                    <span class="sell-tag">#{{ tag }}</span>
                  </Tooltip>
                  <Tooltip v-for="effect in weapon.effects" :key="effect.type" :title="effect.type" :content="getStatusDescription(effect.type)">
                    <span class="sell-effect">{{ effect.type }}</span>
                  </Tooltip>
                </div>
                
                <div class="sell-weapon-value">
                  売値: <strong>{{ (weapon as any).sellValue || 10 }}G</strong>
                </div>
                
                <div v-if="!canSellWeapon(weapon)" class="sell-weapon-disabled">
                  {{ weapon.id === initialWeapon.id ? '初期装備（売却不可）' : '装備中' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary" style="width: 100%; margin-top: 15px;" @click="showSellMenu = false">
          閉じる
        </button>
      </div>
    </div>

    <!-- 装備置き換え選択モーダル -->
    <div v-if="showEquipSelection && selectedWeapon" class="loot-modal">
      <div class="loot-content" style="max-width: 1400px;">
        <div class="modal-header">
          <h2>⚔️ 装備を置き換え</h2>
          <button @click="showEquipSelection = false" class="btn-close">×</button>
        </div>
        <p class="loot-subtitle">
          {{ player.weapons.length < 4 ? '空きスロットまたは' : '' }}置き換える装備をクリックしてください
        </p>
        <div class="replacement-comparison-grid">
          <!-- 既存の武器 -->
          <div 
            v-for="(weapon, index) in player.weapons" 
            :key="weapon.id" 
            class="replacement-comparison-card"
            @click="replaceWeapon(index)"
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
            v-if="player.weapons.length < 4"
            class="replacement-comparison-card empty-slot-card"
            @click="addWeaponToEmptySlot()"
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
        <button class="btn btn-secondary" style="width: 100%; margin-top: 15px;" @click="showEquipSelection = false">
          キャンセル
        </button>
      </div>
    </div>

    <div v-if="showChestModal && chestOptions" class="loot-modal">
      <div class="loot-content">
        <div class="confetti"></div>
        <div class="modal-header">
          <h2>🧰 宝箱がドロップ！</h2>
        </div>
        <p class="loot-subtitle">
          {{ lastLootSource === 'named' ? 'ネームドからの豪華報酬' : 'エリートからの報酬' }} - 好きな武器を選択してください
        </p>
        <div class="weapons-grid">
          <div v-for="weapon in chestOptions" :key="weapon.id" class="loot-option">
            <WeaponCard :weapon="weapon" />
            <button class="btn btn-primary" @click="chooseChestWeapon(weapon)">この武器を拾う</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { Player, Weapon, Dungeon } from '~/types'
import { BASE_WEAPONS } from '~/data/baseWeapons'
import { generateEnchantedWeapon, generateMultipleWeapons } from '~/systems/WeaponGenerationSystem'
import { dungeons } from '~/data/dungeons'
import { StatusEffectSystem } from '~/systems/StatusEffectSystem'
import { TAG_DEFINITIONS } from '~/data/synergies'
import Tooltip from '~/components/Tooltip.vue'
import { useGameOrchestrator } from '~/composables/useGameOrchestrator'
import PlayerInfo from '~/components/PlayerInfo.vue'
import EnemyInfo from '~/components/EnemyInfo.vue'
import CombatLog from '~/components/CombatLog.vue'
import WeaponCard from '~/components/WeaponCard.vue'

// 初期武器を生成
const initialWeapon = generateEnchantedWeapon(BASE_WEAPONS[0], 0, 0) // エンチャントなしの錆びた剣

const player = reactive<Player>({
  name: 'プレイヤー',
  level: 1,
  exp: 0,
  nextLevelExp: 100,
  maxHp: 200,
  currentHp: 200,
  statPoints: 0,
  allocatedStats: {
    maxHp: 0,
    attack: 0,
    magic: 0,
    defense: 0,
    magicDefense: 0,
    speed: 0
  },
  gold: 100, // 初期ゴールド
  weapons: [
    initialWeapon // 生成された初期武器
  ],
  statusEffects: [],
  stats: {
    attack: 15,
    magic: 10,
    defense: 5,
    magicDefense: 4,
    speed: 10
  }
})

// 利用可能な武器リスト（ランダム生成）
const availableWeapons = ref(generateMultipleWeapons(BASE_WEAPONS, 20, 40, 15))

// 武器フィルタ・ソート
const rarityFilter = ref<string>('all')
const typeFilter = ref<string>('all')
const selectedTags = ref<string[]>([])
const selectedEffects = ref<string[]>([])
const sortBy = ref<string>('name')

// 武器装備UI管理
const selectedWeapon = ref<Weapon | null>(null)
const showEquipSelection = ref(false)

const availableTags = computed(() => {
  const allTags = new Set<string>()
  availableWeapons.value.forEach(w => {
    w.tags.forEach(t => allTags.add(t))
  })
  return Array.from(allTags).sort()
})

const availableEffects = computed(() => {
  const allEffects = new Set<string>()
  availableWeapons.value.forEach(w => {
    w.effects.forEach(e => allEffects.add(e.type))
  })
  return Array.from(allEffects).sort()
})

const filteredWeapons = computed(() => {
  let filtered = availableWeapons.value

  // レア度フィルタ
  if (rarityFilter.value !== 'all') {
    filtered = filtered.filter(w => w.rarity === rarityFilter.value)
  }

  // タイプフィルタ
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(w => w.type === typeFilter.value)
  }

  // タグフィルタ
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(w => 
      selectedTags.value.some(tag => w.tags.includes(tag as any))
    )
  }

  // 効果フィルタ
  if (selectedEffects.value.length > 0) {
    filtered = filtered.filter(w => 
      selectedEffects.value.some(effect => w.effects.some(e => e.type === effect))
    )
  }

  // ソート
  filtered = [...filtered]
  if (sortBy.value === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
  } else if (sortBy.value === 'rarity') {
    const rarityOrder: Record<string, number> = { common: 1, rare: 2, epic: 3, legendary: 4 }
    filtered.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])
  } else if (sortBy.value === 'attack') {
    filtered.sort((a, b) => b.stats.attack - a.stats.attack)
  } else if (sortBy.value === 'magic') {
    filtered.sort((a, b) => b.stats.magic - a.stats.magic)
  } else if (sortBy.value === 'speed') {
    filtered.sort((a, b) => b.stats.speed - a.stats.speed)
  }

  return filtered
})

const currentLevel = ref(1)
const selectedDungeonId = ref<string>(dungeons[0]?.id || '')
const selectedDungeon = computed<Dungeon | undefined>(() =>
  dungeons.find(d => d.id === selectedDungeonId.value)
)

const showWeaponSelection = ref(false)
const showStatManager = ref(false)
const showSettings = ref(false)
const showSellMenu = ref(false)
const selectedSellWeapons = ref<Set<string>>(new Set())
const isLoading = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'error' | 'loot' | ''>('')

// ステータス割り振り用の一時変数
const tempStatAlloc = reactive({
  maxHp: 0,
  attack: 0,
  magic: 0,
  defense: 0,
  magicDefense: 0,
  speed: 0
})

const totalTempAlloc = computed(() => {
  return tempStatAlloc.maxHp + tempStatAlloc.attack + tempStatAlloc.magic + 
         tempStatAlloc.defense + tempStatAlloc.magicDefense + tempStatAlloc.speed
})

// 初期ステータス（これより低くできない）
const baseStats = { maxHp: 100, attack: 10, magic: 5, defense: 5, magicDefense: 5, speed: 10 }

// 割り振り済みステータスポイント数を計算
const allocatedStats = computed(() => {
  return {
    maxHp: player.maxHp - baseStats.maxHp,
    attack: player.stats.attack - baseStats.attack,
    magic: player.stats.magic - baseStats.magic,
    defense: player.stats.defense - baseStats.defense,
    magicDefense: player.stats.magicDefense - baseStats.magicDefense,
    speed: player.stats.speed - baseStats.speed
  }
})

// スライダーの合計が利用可能SPを超えないように制約
const constrainTempAlloc = () => {
  // リアルタイムでの制約は複雑なため、適用時にチェック
}

// リセットコストを計算（基本100G + 割り振り済みポイント数 * 10G）
const calculateResetCost = () => {
  const totalAllocated = Math.floor(allocatedStats.value.maxHp / 25) +
                        Math.floor(allocatedStats.value.attack / 5) +
                        Math.floor(allocatedStats.value.magic / 5) +
                        Math.floor(allocatedStats.value.defense / 3) +
                        Math.floor(allocatedStats.value.magicDefense / 3) +
                        Math.floor(allocatedStats.value.speed / 2)
  return totalAllocated > 0 ? 100 + totalAllocated * 10 : 0
}

const resetTempAllocation = () => {
  tempStatAlloc.maxHp = 0
  tempStatAlloc.attack = 0
  tempStatAlloc.magic = 0
  tempStatAlloc.defense = 0
  tempStatAlloc.magicDefense = 0
  tempStatAlloc.speed = 0
}

const applyStatAllocation = () => {
  if (isRunLocked.value) {
    showToast('探索中はステータスを操作できません', 'error')
    return
  }
  
  const total = totalTempAlloc.value
  
  // マイナス値を含む場合はリセット処理
  const hasNegative = tempStatAlloc.maxHp < 0 || tempStatAlloc.attack < 0 || 
                      tempStatAlloc.magic < 0 || tempStatAlloc.defense < 0 || 
                      tempStatAlloc.magicDefense < 0 || tempStatAlloc.speed < 0
  
  if (hasNegative) {
    const resetPoints = -Math.min(tempStatAlloc.maxHp, tempStatAlloc.attack, tempStatAlloc.magic,
                                   tempStatAlloc.defense, tempStatAlloc.magicDefense, tempStatAlloc.speed)
    const cost = resetPoints * 10
    if (player.gold < cost) {
      showToast(`リセットには${cost}Gが必要です`, 'error')
      return
    }
    player.gold -= cost
    showToast(`${resetPoints}ポイントをリセットしました（-${cost}G）`, 'info')
  } else if (total > player.statPoints) {
    showToast('ポイントが不足しています', 'error')
    return
  }

  // HP割り振り
  const hpChange = tempStatAlloc.maxHp
  if (hpChange > 0) {
    for (let i = 0; i < hpChange; i++) {
      allocateMaxHp()
    }
  } else if (hpChange < 0) {
    // 初期値より低くならないようにチェック
    const newValue = player.maxHp + hpChange * 25
    if (newValue < baseStats.maxHp) {
      showToast('HPは初期値より低くできません', 'error')
      return
    }
    player.maxHp = newValue
    player.statPoints += -hpChange
  }
  
  // その他ステータス割り振り
  const stats: Array<'attack' | 'magic' | 'defense' | 'magicDefense' | 'speed'> = 
    ['attack', 'magic', 'defense', 'magicDefense', 'speed']
  const multipliers = { attack: 5, magic: 5, defense: 3, magicDefense: 3, speed: 2 }
  
  stats.forEach(stat => {
    const change = tempStatAlloc[stat]
    if (change > 0) {
      for (let i = 0; i < change; i++) {
        allocateStat(stat)
      }
    } else if (change < 0) {
      // 初期値より低くならないようにチェック
      const newValue = player.stats[stat] + change * multipliers[stat]
      if (newValue < baseStats[stat]) {
        showToast(`${stat}は初期値より低くできません`, 'error')
        return
      }
      player.stats[stat] = newValue
      player.statPoints += -change
    }
  })

  resetTempAllocation()
  if (!hasNegative && total > 0) {
    showToast(`${total}ポイント割り振りました`, 'info')
  }
}

const {
  enemy,
  combat,
  combatLogs,
  showChestModal,
  chestOptions,
  // chestQueue, // 未使用
  lastLootSource,
  hasPendingChest,
  chestCount,
  isDungeonRunning,
  currentStage,
  totalStages,
  currentEvent,
  infoMessages,
  battleSpeed,
  isAutoRunning,
  startDungeonRun,
  proceedNextBattle,
  chooseChestWeapon,
  openPendingChest,
  addToAvailableIfNeeded,
  pruneAvailableWeapons,
  changeSpeed,
  stopAuto,
  startAuto,
  allocateStat,
  allocateMaxHp,
  resetAllocatedStats,
  abandonDungeon
} = useGameOrchestrator(player, availableWeapons, selectedDungeon, currentLevel)

const isRunLocked = computed(() => isDungeonRunning.value && !(combat.value?.isGameOver()))

const fileInput = ref<HTMLInputElement | null>(null)

// セーブデータをJSONファイルとしてダウンロード
function downloadSaveData() {
  try {
    const saveData = {
      version: '1.0',
      timestamp: Date.now(),
      player: player,
      availableWeapons: availableWeapons.value,
      selectedDungeonId: selectedDungeonId.value,
      currentLevel: currentLevel.value
    }
    
    const json = JSON.stringify(saveData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auto-battler-save-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showToast('セーブデータをダウンロードしました', 'info')
  } catch (e) {
    console.error('セーブエラー:', e)
    showToast('セーブに失敗しました', 'error')
  }
}

// JSONファイルからセーブデータをアップロード
async function uploadSaveData(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  try {
    const text = await file.text()
    const saveData = JSON.parse(text)
    
    // データ検証
    if (!saveData.player || !saveData.availableWeapons) {
      throw new Error('無効なセーブデータです')
    }
    
    // データ復元
    Object.assign(player, saveData.player)
    availableWeapons.value = saveData.availableWeapons
    selectedDungeonId.value = saveData.selectedDungeonId || dungeons[0]?.id
    currentLevel.value = saveData.currentLevel || 1
    
    showToast('セーブデータを読み込みました', 'info')
    showSettings.value = false
  } catch (e) {
    console.error('ロードエラー:', e)
    showToast('セーブデータの読み込みに失敗しました', 'error')
  } finally {
    // ファイル選択をリセット
    target.value = ''
  }
}

// 戦闘ログをエクスポート
function exportCombatLog() {
  try {
    const logData = {
      exportDate: new Date().toISOString(),
      playerName: player.name,
      playerLevel: player.level,
      dungeon: selectedDungeon.value?.name || 'Unknown',
      logs: combatLogs.value
    }
    
    const json = JSON.stringify(logData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `combat-log-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showToast('戦闘ログをエクスポートしました', 'info')
  } catch (e) {
    console.error('エクスポートエラー:', e)
    showToast('エクスポートに失敗しました', 'error')
  }
}

// ダンジョンログをエクスポート
function exportDungeonLog() {
  try {
    const logData = {
      exportDate: new Date().toISOString(),
      playerName: player.name,
      playerLevel: player.level,
      dungeon: selectedDungeon.value?.name || 'Unknown',
      totalStages: dungeonLogs.value.length,
      logs: dungeonLogs.value
    }
    
    const json = JSON.stringify(logData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dungeon-log-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showToast('ダンジョンログをエクスポートしました', 'info')
  } catch (e) {
    console.error('エクスポートエラー:', e)
    showToast('エクスポートに失敗しました', 'error')
  }
}

watch(selectedDungeonId, (next) => {
  const dungeon = dungeons.find(d => d.id === next)
  if (dungeon) {
    currentLevel.value = dungeon.levelRange[0]
  }
})

const currentEventLabel = computed(() => {
  if (!isDungeonRunning.value) return '待機'
  if (hasPendingChest.value) return '宝箱'
  if (currentEvent.value === 'chest') return '宝箱'
  if (combat.value?.isGameOver()) return '決着'
  return '戦闘'
})

const addInfoOnce = (msg: string) => {
  if (!infoMessages.value.includes(msg)) {
    infoMessages.value.push(msg)
  }
}

const remindPendingChest = () => {
  if (chestOptions.value?.length) {
    addInfoOnce('宝箱から1つ選んでください')
    return true
  }
  return false
}

const handleStartBattle = () => {
  remindPendingChest()
  startDungeonRun()
}

const handleNextBattle = () => {
  if (remindPendingChest()) return
  proceedNextBattle()
}

const toggleAuto = () => {
  if (!combat.value || combat.value.isGameOver()) return
  isAutoRunning.value ? stopAuto() : startAuto()
}

const handleAbandon = () => {
  if (!isDungeonRunning.value) return
  abandonDungeon()
}

const handleResetStats = () => {
  if (isRunLocked.value) {
    showToast('探索中はリセットできません', 'error')
    return
  }
  const cost = calculateResetCost()
  const res = resetAllocatedStats(cost)
  if (!res.ok) {
    if (res.reason === 'no-allocation') showToast('リセットする割り振りがありません', 'error')
    else if (res.reason === 'no-gold') showToast('ゴールドが不足しています', 'error')
    else showToast('リセットに失敗しました', 'error')
    return
  }
  showToast('ステータスをリセットしました', 'info')
}

function equipWeapon(weapon: Weapon) {
  if (isRunLocked.value) return
  
  // すでに装備されている場合は外す
  const isEquipped = player.weapons.some(w => w.id === weapon.id)
  if (isEquipped) {
    removeWeapon(weapon)
    return
  }
  
  // 常に置き換えUIを表示（空きスロットも含む）
  selectedWeapon.value = weapon
  showEquipSelection.value = true
}

function replaceWeapon(oldIndex: number) {
  if (!selectedWeapon.value) return
  
  const oldWeapon = player.weapons[oldIndex]
  player.weapons[oldIndex] = selectedWeapon.value
  addToAvailableIfNeeded(oldWeapon)
  pruneAvailableWeapons()
  
  showToast(`${oldWeapon.name}を${selectedWeapon.value.name}に置き換えました`, 'info')
  selectedWeapon.value = null
  showEquipSelection.value = false
}

function addWeaponToEmptySlot() {
  if (!selectedWeapon.value) return
  
  player.weapons.push(selectedWeapon.value)
  pruneAvailableWeapons()
  
  showToast(`${selectedWeapon.value.name}を装備しました`, 'info')
  selectedWeapon.value = null
  showEquipSelection.value = false
}

function removeWeapon(weapon: Weapon) {
  if (isRunLocked.value) return
  const index = player.weapons.findIndex(w => w.id === weapon.id)
  if (index !== -1) {
    player.weapons.splice(index, 1)
    addToAvailableIfNeeded(weapon)
    pruneAvailableWeapons()
  }
}

function canSellWeapon(weapon: Weapon): boolean {
  // 初期装備は売却不可
  if (weapon.id === initialWeapon.id) return false
  // 装備中の武器は売却不可
  if (player.weapons.some(w => w.id === weapon.id)) return false
  return true
}

function toggleSelectWeapon(weaponId: string) {
  if (selectedSellWeapons.value.has(weaponId)) {
    selectedSellWeapons.value.delete(weaponId)
  } else {
    selectedSellWeapons.value.add(weaponId)
  }
}

function sellSelectedWeapons() {
  let totalGold = 0
  const weaponsToRemove: string[] = []
  
  availableWeapons.value.forEach(weapon => {
    if (selectedSellWeapons.value.has(weapon.id)) {
      const sellValue = (weapon as any).sellValue || 10
      totalGold += sellValue
      weaponsToRemove.push(weapon.id)
    }
  })
  
  // 武器を削除
  availableWeapons.value = availableWeapons.value.filter(
    w => !weaponsToRemove.includes(w.id)
  )
  
  player.gold += totalGold
  selectedSellWeapons.value.clear()
  showSellMenu.value = false
  
  showToast(`${weaponsToRemove.length}個の武器を${totalGold}Gで売却しました`, 'info')
}

function getWeaponRarityColor(rarity: string) {
  const colors: Record<string, string> = {
    common: '#95a5a6',
    rare: '#3a86ff',
    epic: '#8338ec',
    legendary: '#ffb800'
  }
  return colors[rarity] || '#95a5a6'
}

function getTagDescription(tag: string) {
  return TAG_DEFINITIONS[tag as keyof typeof TAG_DEFINITIONS]?.description || ''
}

function getStatusDescription(type: string) {
  return StatusEffectSystem.getStatusDescription(type as any)
}

function showToast(message: string, type: 'info' | 'error' | 'loot') {
  toastMessage.value = message
  toastType.value = type
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap');

#app {
  max-width: 1400px;
  margin: 0 auto;
  background: #050505;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Orbitron', 'Arial', sans-serif;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: linear-gradient(180deg, rgba(25, 118, 210, 0.15) 0%, rgba(0, 0, 0, 0) 100%);
  border-bottom: 2px solid rgba(66, 165, 245, 0.3);
  padding: 15px 20px;
  margin: -20px -20px 20px -20px;
  border-radius: 0 0 8px 8px;
}

.app-header h1 {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: white;
  text-shadow: 0 0 10px rgba(66, 165, 245, 0.6);
  letter-spacing: 2px;
}

.btn-settings {
  padding: 10px 16px;
  font-size: 14px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(56, 142, 60, 0.2));
  color: white;
  border: 1px solid rgba(76, 175, 80, 0.4);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-settings:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(56, 142, 60, 0.3));
  border-color: rgba(76, 175, 80, 0.6);
  transform: translateY(-1px);
}

.app-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.subtitle {
  font-size: 18px;
  opacity: 0.85;
  color: #a0a0a0;
}

.game-container {
  background: rgba(15, 20, 50, 0.6);
  border-radius: 20px;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(79, 172, 254, 0.2);
}

.dungeon-picker {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.dungeon-info label {
  display: block;
  color: #ecf0f1;
  font-weight: bold;
  margin-bottom: 6px;
}

.dungeon-info select {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
}

.dungeon-desc {
  background: rgba(0, 0, 0, 0.4);
  padding: 12px 14px;
  border-radius: 12px;
  color: #d0d0d0;
  line-height: 1.5;
  border: 1px solid rgba(79, 172, 254, 0.15);
}

.dungeon-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.dungeon-meta {
  font-size: 13px;
  opacity: 0.8;
}

.battle-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.speed-row {
  margin-top: -4px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.speed-label {
  color: #ecf0f1;
  font-weight: bold;
  letter-spacing: 1px;
}

.speed-buttons {
  display: flex;
  gap: 8px;
}

.run-status {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.run-chip {
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #ecf0f1;
  font-weight: bold;
  border: 1px solid rgba(79, 172, 254, 0.2);
}

.stat-alloc {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(79, 172, 254, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.stat-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #ecf0f1;
}

.stat-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-manager-content {
  max-width: 550px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.stat-sliders {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 15px 0;
  overflow-y: auto;
  max-height: 500px;
  padding-right: 8px;
}

/* スクロールバースタイル */
.stat-sliders::-webkit-scrollbar {
  width: 8px;
}

.stat-sliders::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.stat-sliders::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.stat-sliders::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.stat-slider-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-slider-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.stat-icon {
  font-size: 18px;
}

.stat-name {
  flex: 1;
  font-weight: bold;
  font-size: 14px;
}

.stat-value {
  color: #4facfe;
  font-weight: bold;
  font-size: 14px;
}

.stat-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.stat-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.stat-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.6);
}

.stat-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.stat-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.6);
}

.stat-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stat-slider-info {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
}

.stat-manager-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-compact {
  padding: 6px 12px;
  font-size: 13px;
}

.btn.active {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-accent-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3a8eef;
}

.btn-action {
  background: var(--color-accent-primary);
  color: white;
}

.btn-action:hover:not(:disabled) {
  background: #3a8eef;
}

.btn-success {
  background: var(--color-success);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #00b548;
}

.btn-secondary {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: #363942;
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #e63028;
}

.btn-warning {
  background: #FF9800;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #F57C00;
}

.battle-area {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
}

.control-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 900px) {
  .control-grid {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: linear-gradient(135deg, rgba(10, 10, 15, 0.9) 0%, rgba(15, 15, 25, 0.9) 100%);
  border: 1px solid rgba(66, 165, 245, 0.2);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(66, 165, 245, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(66, 165, 245, 0.2);
}

.panel-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-shadow: 0 0 8px rgba(66, 165, 245, 0.4);
}

.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  background: rgba(66, 165, 245, 0.1);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(66, 165, 245, 0.3);
  color: rgba(66, 165, 245, 0.8);
}

.chip.warning {
  background: rgba(255, 184, 0, 0.1);
  color: rgba(255, 184, 0, 0.9);
  border-color: rgba(255, 184, 0, 0.4);
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0;
}

.auto-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.chest-action {
  margin: 12px 0;
}

.btn-special {
  background: var(--color-highlight);
  color: var(--color-bg-primary);
  font-weight: 600;
}

.btn-special:hover:not(:disabled) {
  background: #ffc520;
  transform: translateY(-1px);
}

.section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.battle-result {
  margin-top: 20px;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.victory {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.defeat {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.victory h2, .defeat h2 {
  font-size: 32px;
  margin-bottom: 10px;
}

.weapon-selection-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 40px 20px;
  overflow-y: auto;
}

.weapon-card.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.modal-content {
  background: #2c3e50;
  border-radius: 20px;
  padding: 30px;
  max-width: 1200px;
  width: 100%;
  max-height: none;
  overflow: visible;
  color: white;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(63, 81, 181, 0.1) 100%);
  padding: 16px 20px;
  border-bottom: 2px solid rgba(66, 165, 245, 0.3);
  border-radius: 8px 8px 0 0;
  gap: 15px;
  margin: -30px -30px 20px -30px;
  padding-left: 30px;
  padding-right: 30px;
}

.modal-header h2 {
  font-size: 24px;
  margin: 0;
  color: white;
}

.btn-close {
  background: linear-gradient(135deg, #FF6B6B, #FF5252);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-close:hover {
  background: linear-gradient(135deg, #FF5252, #FF1744);
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 82, 82, 0.4);
}

.current-weapons, .available-weapons {
  margin-bottom: 30px;
}

.current-weapons h3, .available-weapons h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: white;
  text-shadow: 0 0 8px rgba(66, 165, 245, 0.5);
  font-weight: 700;
  letter-spacing: 1px;
}

.empty-slot {
  padding: 40px 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px dashed rgba(66, 165, 245, 0.2);
  border-radius: 10px;
  opacity: 0.6;
  font-size: 14px;
}

.weapons-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.weapons-header h3 {
  margin: 0;
  color: white;
  text-shadow: 0 0 8px rgba(66, 165, 245, 0.5);
  font-weight: 700;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-select {
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  background: rgba(0, 0, 0, 0.7);
  border-color: rgba(255, 255, 255, 0.5);
}

.filter-section {
  margin-top: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.filter-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #f39c12;
  margin-bottom: 8px;
}

.tag-filters,
.effect-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip,
.effect-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.tag-chip:hover,
.effect-chip:hover {
  background: rgba(100, 100, 255, 0.3);
  border-color: rgba(100, 100, 255, 0.5);
  transform: translateY(-1px);
}

.tag-chip input[type="checkbox"],
.effect-chip input[type="checkbox"] {
  cursor: pointer;
  margin: 0;
}

.tag-chip input[type="checkbox"]:checked + span,
.effect-chip input[type="checkbox"]:checked + span {
  color: #4facfe;
  font-weight: 600;
}

.weapon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

/* 武器リストスクロールバー */
.weapon-list::-webkit-scrollbar {
  width: 8px;
}

.weapon-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.weapon-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.weapon-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.weapon-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.4);
  border-left: 4px solid;
  border-radius: 8px;
  transition: all 0.2s;
}

.weapon-list-item:hover {
  background: rgba(0, 0, 0, 0.6);
}

.weapon-list-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.weapon-list-name {
  font-weight: bold;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.weapon-rarity-badge {
  font-size: 9px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
}

.weapon-description {
  font-size: 11px;
  opacity: 0.6;
  font-style: italic;
}

.limit-break-badge {
  font-size: 11px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #1a1a2e;
  white-space: nowrap;
}

.weapon-list-type {
  font-size: 11px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: bold;
}

.weapon-list-stats {
  display: flex;
  gap: 8px;
  font-size: 11px;
  opacity: 0.9;
  flex-wrap: wrap;
}

.weapon-list-stats span {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.weapon-list-tags-effects {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.mini-tag {
  padding: 0;
  background: none;
  border: none;
  font-size: 11px;
  color: #6b9dff;
  cursor: help;
  transition: all 0.2s;
  font-weight: 500;
}

.mini-tag:hover {
  color: #8fb3ff;
  text-shadow: 0 0 8px rgba(107, 157, 255, 0.5);
}

.mini-effect {
  padding: 2px 6px;
  background: rgba(255, 183, 94, 0.3);
  border: 1px solid rgba(255, 183, 94, 0.6);
  border-radius: 4px;
  font-size: 10px;
  color: #ffb75a;
  cursor: help;
  transition: all 0.2s;
}

.mini-effect:hover {
  background: rgba(255, 183, 94, 0.5);
}

.weapons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.sell-weapon-card {
  position: relative;
  padding: 14px;
  background: linear-gradient(135deg, rgba(10, 10, 15, 0.8) 0%, rgba(15, 15, 25, 0.8) 100%);
  border: 2px solid;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.sell-weapon-card.sell-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.sell-weapon-card.sell-selected {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(56, 142, 60, 0.2) 100%);
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.4);
}

.sell-weapon-card:not(.sell-disabled):hover {
  background: linear-gradient(135deg, rgba(15, 15, 20, 0.9) 0%, rgba(20, 20, 30, 0.9) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 165, 245, 0.3);
}

.sell-checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.sell-weapon-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sell-weapon-name {
  font-size: 15px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 6px rgba(66, 165, 245, 0.5);
  margin-bottom: 4px;
}

.sell-weapon-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.sell-weapon-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  line-height: 1.4;
}

.sell-weapon-rarity {
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
}

.sell-weapon-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.sell-stat {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: help;
}

.sell-weapon-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 4px;
}

.sell-tag {
  padding: 0;
  background: none;
  border: none;
  font-size: 11px;
  color: #6b9dff;
  cursor: help;
  font-weight: 500;
}

.sell-effect {
  padding: 3px 7px;
  background: rgba(255, 183, 94, 0.3);
  border: 1px solid rgba(255, 183, 94, 0.6);
  border-radius: 4px;
  font-size: 10px;
  color: #ffb75a;
  cursor: help;
  transition: all 0.2s;
}

.sell-effect:hover {
  background: rgba(255, 183, 94, 0.5);
}

.sell-weapon-value {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.sell-weapon-value strong {
  color: #FFD700;
  font-size: 14px;
}

.sell-weapon-disabled {
  margin-top: 4px;
  font-size: 11px;
  color: #F44336;
  font-weight: bold;
}

.replacement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.replacement-slot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(63, 81, 181, 0.15) 100%);
  border: 2px solid rgba(66, 165, 245, 0.4);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.replacement-slot:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.25) 0%, rgba(63, 81, 181, 0.25) 100%);
  border-color: rgba(66, 165, 245, 0.6);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(66, 165, 245, 0.2);
}

.replacement-slot-content {
  flex: 1;
  min-width: 0;
}

.replacement-weapon-name {
  font-weight: bold;
  font-size: 14px;
  color: white;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.replacement-weapon-type {
  font-size: 11px;
  opacity: 0.7;
  text-transform: uppercase;
}

.replacement-arrow {
  font-size: 20px;
  color: rgba(66, 165, 245, 0.8);
  font-weight: bold;
  flex-shrink: 0;
}

.replacement-new-weapon-name {
  flex: 1;
  font-weight: bold;
  font-size: 14px;
  color: rgba(76, 175, 80, 0.9);
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.replacement-comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.replacement-comparison-card {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: stretch;
  padding: 20px;
  background: linear-gradient(135deg, rgba(15, 15, 20, 0.8) 0%, rgba(20, 20, 30, 0.8) 100%);
  border: 2px solid rgba(66, 165, 245, 0.4);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.replacement-comparison-card:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.2) 0%, rgba(63, 81, 181, 0.2) 100%);
  border-color: rgba(76, 175, 80, 0.6);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(66, 165, 245, 0.3);
}

.comparison-weapon-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comparison-weapon-title {
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  opacity: 0.6;
  letter-spacing: 1px;
}

.comparison-weapon-name {
  font-weight: bold;
  font-size: 16px;
  color: white;
  margin-bottom: 2px;
}

.comparison-weapon-name.highlight {
  color: rgba(76, 175, 80, 0.95);
}

.comparison-weapon-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.comparison-weapon-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
  line-height: 1.4;
}

.comparison-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 10px;
}

.stat-item {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  cursor: help;
}

.stat-item.improved {
  color: rgba(76, 175, 80, 0.95);
  font-weight: bold;
}

.stat-diff {
  margin-left: 4px;
  font-size: 11px;
  color: rgba(76, 175, 80, 0.8);
  font-weight: bold;
}

.comparison-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.comparison-tag {
  padding: 0;
  background: none;
  border: none;
  font-size: 11px;
  color: #6b9dff;
  cursor: help;
  font-weight: 500;
}

.comparison-effect {
  padding: 4px 8px;
  background: rgba(255, 183, 94, 0.3);
  border: 1px solid rgba(255, 183, 94, 0.6);
  border-radius: 4px;
  font-size: 11px;
  color: #ffb75a;
  cursor: help;
  transition: all 0.2s;
}

.comparison-effect:hover {
  background: rgba(255, 183, 94, 0.5);
}

.empty-slot-card {
  opacity: 0.9;
}

.empty-slot-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 200px;
}

.empty-slot-icon {
  font-size: 48px;
  color: rgba(66, 165, 245, 0.4);
}

.empty-slot-text {
  font-size: 18px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.6);
}

.empty-slot-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.comparison-arrow-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.comparison-arrow {
  font-size: 28px;
  font-weight: bold;
  color: rgba(76, 175, 80, 0.8);
}

.comparison-click-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  font-weight: bold;
}

.loot-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
  padding: 20px;
  overflow-y: auto;
}

.loot-content {
  background: linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(15, 15, 25, 0.95) 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 1200px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(66, 165, 245, 0.15);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(66, 165, 245, 0.2);
}

.settings-section {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(66, 165, 245, 0.2);
  border-radius: 10px;
}

.settings-title {
  margin: 0 0 15px 0;
  color: rgba(66, 165, 245, 0.9);
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(66, 165, 245, 0.5);
}

.settings-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-area {
  position: relative;
}

.confetti {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.7) 2px, transparent 0),
    radial-gradient(circle at 80% 10%, rgba(255, 231, 150, 0.9) 3px, transparent 0),
    radial-gradient(circle at 30% 80%, rgba(178, 235, 242, 0.9) 3px, transparent 0),
    radial-gradient(circle at 60% 50%, rgba(236, 179, 255, 0.9) 3px, transparent 0),
    radial-gradient(circle at 90% 70%, rgba(255, 183, 94, 0.9) 3px, transparent 0);
  opacity: 0.5;
  animation: drift 6s linear infinite;
  pointer-events: none;
}

@keyframes drift {
  0% { transform: translateY(-10px) rotate(0deg); }
  50% { transform: translateY(10px) rotate(180deg); }
  100% { transform: translateY(-10px) rotate(360deg); }
}

.loot-subtitle {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(66, 165, 245, 0.1);
  border-left: 3px solid rgba(66, 165, 245, 0.6);
  border-radius: 4px;
  opacity: 0.9;
  font-size: 14px;
}

.loot-option {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.loot-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #2c3e50;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.loot-title {
  font-weight: bold;
  font-size: 16px;
}

.loot-desc {
  font-size: 14px;
  opacity: 0.9;
}

.chest-banner {
  background: linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%);
  margin-top: 12px;
}

.toast {
  position: fixed;
  top: 16px;
  right: 20px;
  max-width: 360px;
  padding: 14px 18px;
  border-radius: 12px;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
  z-index: 1500;
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  animation: toast-pop 0.25s ease;
}

.toast.error {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.toast.loot {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 12px 24px rgba(250, 183, 94, 0.35);
}

.info-messages {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(79, 172, 254, 0.2);
  border-radius: 10px;
  max-height: 180px;
  overflow-y: auto;
}

.info-message {
  background: rgba(255, 255, 255, 0.08);
  padding: 8px 10px;
  border-radius: 8px;
  font-weight: bold;
}

@keyframes toast-pop {
  0% { transform: translateY(10px) scale(0.96); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes toast-fade {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
