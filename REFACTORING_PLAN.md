# 🔧 オートバトラー リファクタリング計画

**作成日:** 2024年
**目的:** コードベースの簡素化、保守性向上、サーバレス化対応
**推定工数:** 3-4時間

---

## 📋 優先順位一覧

| 優先度 | タイプ | 説明 | ファイル |
|---------|--------|------|---------|
| 🔴 **最優先** | アーキテクチャ | サーバ依存の削除 (localStorage移行) | server/, nuxt.config.ts |
| 🟠 **高** | リファクタリング | monolithic composable の分解 | useGameOrchestrator.ts (441行) |
| 🟠 **高** | 重複削除 | UI コンポーネント共有化 | PlayerInfo.vue, EnemyInfo.vue, ChestModal.vue |
| 🟡 **中** | コード品質 | 不要コード削除 | useLootSystem.ts, pages/index.vue |
| 🟡 **中** | 型安全 | 型定義の改善 | types/index.ts, components/ |

---

## 🔴 **フェーズ 1: サーバ依存の削除（最優先）**

### 現状の問題

- **ファイル:** `server/api/load.get.ts`, `server/api/save.post.ts`, `server/utils/saveManager.ts`
- **問題:** Nitro サーバ必須で、スタンドアロン化・サーバレス化が不可能
- **影響:** ローカルストレージベースのセーブが機能しない

### 実装計画

#### 1.1 localStorage 永続化層の作成

**ファイル:** `composables/usePersistence.ts` (新規)

```typescript
/**
 * localStorage ベースの永続化層
 * - プロフィール保存
 * - 複数セーブスロット対応
 * - 自動セーブ機能
 */
export function usePersistence() {
  const STORAGE_PREFIX = 'autobattler-'
  
  // GameState インターフェースに対応したセーブ
  const save = (profileId: string, state: GameState) => {
    const key = `${STORAGE_PREFIX}${profileId}`
    localStorage.setItem(key, JSON.stringify(state))
    localStorage.setItem(`${key}-timestamp`, Date.now().toString())
  }
  
  const load = (profileId: string): GameState | null => {
    const key = `${STORAGE_PREFIX}${profileId}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }
  
  const list = (): Array<{ id: string; timestamp: number; name: string }> => {
    // 全プロフィール列挙
  }
  
  const delete = (profileId: string) => {
    const key = `${STORAGE_PREFIX}${profileId}`
    localStorage.removeItem(key)
    localStorage.removeItem(`${key}-timestamp`)
  }
  
  return { save, load, list, delete }
}
```

#### 1.2 page/index.vue での使用更新

```typescript
// Before: saveManager.loadProfile() サーバ呼び出し
// After: usePersistence().load() ローカル使用
const { save, load } = usePersistence()

const handleLoadEntry = (profileId: string) => {
  const state = load(profileId)
  if (state) {
    Object.assign(player, state.player)
    availableWeapons.value = state.availableWeapons
  }
}
```

#### 1.3 server/ ディレクトリの削除

- `server/api/load.get.ts` - 削除
- `server/api/save.post.ts` - 削除  
- `server/utils/saveManager.ts` - 削除
- `server/utils/db.ts` - 削除

#### 1.4 nuxt.config.ts の更新

```typescript
// サーバ機能を無効化
export default defineNuxtConfig({
  ssr: false,  // クライアント側レンダリングのみ
  // nitro 設定を削除または最小化
})
```

#### 1.5 package.json の更新

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate"
    // "postinstall": "nuxt prepare" は不要になる可能性
  }
}
```

### 成果物

- ✅ サーバ依存削除
- ✅ localStorage ベースの永続化
- ✅ スタンドアロン配布可能

---

## 🟠 **フェーズ 2: useGameOrchestrator の分解（高優先度）**

### 現状の問題

**ファイル:** `composables/useGameOrchestrator.ts` (441行)

- **責務が混在:**
  - ダンジョン進行ロジック
  - オートラン制御
  - ゲーム状態初期化
  - ステータス割り当て管理
  
- **テスト困難:** 複数の責務が絡み合い、単体テストが不可能
- **保守困難:** 修正箇所の影響範囲が大きい

### 分解計画

#### 2.1 `useDungeonFlow.ts` (新規) - ダンジョン進行管理

責務:
- ステージ管理 (currentStage, totalStages)
- ダンジョン選択・実行
- 敵生成
- 勝敗処理

```typescript
export function useDungeonFlow(
  player: Player,
  selectedDungeon: ComputedRef<Dungeon | undefined>,
  currentLevel: Ref<number>
) {
  const currentStage = ref(0)
  const totalStages = 10
  
  const startStageBattle = (opts?: { forcedTier?: EnemyTier }) => {
    // 敵生成 + 戦闘開始
  }
  
  const startNextStage = () => {
    // currentStage += 1
  }
  
  return { currentStage, totalStages, startStageBattle, startNextStage }
}
```

#### 2.2 `useAutoRun.ts` (新規) - オートラン制御

責務:
- オートラン開始・停止
- 戦闘速度制御
- ターン自動実行

```typescript
export function useAutoRun(
  combat: Ref<CombatSystem | null>,
  onTurnComplete: () => void
) {
  const isAutoRunning = ref(false)
  const battleSpeed = ref<BattleSpeed>(1)
  
  const startAuto = () => {
    // setInterval でターン自動実行
  }
  
  const stopAuto = () => {
    // clearInterval
  }
  
  const changeSpeed = (speed: BattleSpeed) => {
    battleSpeed.value = speed
    // 既に実行中なら間隔変更
  }
  
  return { isAutoRunning, battleSpeed, startAuto, stopAuto, changeSpeed }
}
```

#### 2.3 `useGameConfig.ts` (新規) - ゲーム設定管理

責務:
- プレイヤー初期化
- ステータス割り当てロジック
- ダンジョンアンロック管理

```typescript
export function useGameConfig(player: Player) {
  const ensureAllocations = () => {
    if (!player.allocatedStats) {
      player.allocatedStats = { /* 初期値 */ }
    }
    return player.allocatedStats
  }
  
  const allocateStat = (stat: keyof PlayerStats) => {
    // ステータスポイント消費ロジック
  }
  
  const resetAllocatedStats = (cost: number) => {
    // 割り当てリセット
  }
  
  return { ensureAllocations, allocateStat, resetAllocatedStats }
}
```

#### 2.4 `useGameOrchestrator.ts` (修正) - 統合オーケストレータ

責務:
- 上記３つのコンポーザブルの統合
- 戦利品・経験値処理の呼び出し調整
- ゲーム全体フロー

```typescript
export function useGameOrchestrator(
  player: Player,
  availableWeapons: Ref<any[]>,
  selectedDungeon: ComputedRef<Dungeon | undefined>,
  currentLevel: Ref<number>
) {
  const dungeonFlow = useDungeonFlow(player, selectedDungeon, currentLevel)
  const autoRun = useAutoRun(combat, () => { /* victory処理 */ })
  const gameConfig = useGameConfig(player)
  
  // 統合インターフェース
  return {
    ...dungeonFlow,
    ...autoRun,
    ...gameConfig,
    // その他の必要なメソッド
  }
}
```

### 成果物

- ✅ 単一責務の原則に従ったコンポーザブル
- ✅ 各々のテストが容易
- ✅ コードの再利用性向上

---

## 🟠 **フェーズ 3: UI コンポーネント共有化（高優先度）**

### 現状の問題

**複数の場所で重複する武器表示ロジック:**
- `PlayerInfo.vue` - 装備中の武器表示
- `WeaponSelectionModal.vue` - 利用可能な武器リスト
- `ChestModal.vue` - 宝箱ドロップ表示

**重複する統計計算:**
- `PlayerInfo.vue` - プレイヤーステータス表示
- `EnemyInfo.vue` - 敵ステータス表示

### 実装計画

#### 3.1 `WeaponCard.vue` (新規) - 再利用可能な武器カード

```vue
<!-- components/WeaponCard.vue -->
<template>
  <div class="weapon-card" :class="`rarity-${weapon.rarity}`">
    <h3>{{ weapon.name }}</h3>
    <div class="stats">
      <div>攻撃: {{ weapon.stats.attack }}</div>
      <div>魔法: {{ weapon.stats.magic }}</div>
      <!-- 他のステータス -->
    </div>
    <div class="tags" v-if="weapon.tags.length">
      <span v-for="tag in weapon.tags" :key="tag" class="tag">{{ tag }}</span>
    </div>
    <div class="effects" v-if="weapon.effects.length">
      <!-- エフェクト表示 -->
    </div>
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  weapon: Weapon
  selectable?: boolean
  removable?: boolean
}>()
</script>
```

#### 3.2 `useStatDisplay.ts` (新規) - 統計計算共有

```typescript
export function useStatDisplay(entity: Player | Enemy) {
  const displayStats = computed(() => {
    // 共通のステータス計算ロジック
    return {
      attackDisplay: calculateAttack(entity),
      defenseDisplay: calculateDefense(entity),
      // ...
    }
  })
  
  const statusEffectsList = computed(() => {
    return entity.statusEffects.map(se => ({
      name: STATUS_EFFECT_NAMES[se.type],
      remaining: se.duration
    }))
  })
  
  const synergyBonuses = computed(() => {
    if (entity.type === 'player') {
      return calculateSynergyBonuses(entity)
    }
    return null
  })
  
  return { displayStats, statusEffectsList, synergyBonuses }
}
```

#### 3.3 各コンポーネントの更新

**PlayerInfo.vue:**
```vue
<script setup>
const { displayStats, statusEffectsList, synergyBonuses } = useStatDisplay(player)
</script>

<template>
  <WeaponCard
    v-for="weapon in player.weapons"
    :key="weapon.id"
    :weapon="weapon"
  />
</template>
```

**ChestModal.vue:**
```vue
<script setup>
// chestDropCards を WeaponCard で表示
</script>

<template>
  <WeaponCard
    v-for="card in chestDropCards"
    :key="card.id"
    :weapon="card"
  >
    <template #actions>
      <button @click="selectLoot(card)">獲得</button>
    </template>
  </WeaponCard>
</template>
```

### 成果物

- ✅ 武器表示ロジックの一元化
- ✅ ステータス計算の統一
- ✅ メンテナンス効率化

---

## 🟡 **フェーズ 4: 不要コード削除（中優先度）**

### 4.1 未使用インポートの削除

#### `useLootSystem.ts`

```typescript
// Line 3: 削除対象
// import { getRandomBaseWeapon } from '~/data/baseWeapons'
//          ^^^^^^^^^^^^^^^^^^^^ - 実際には使われていない

// 用途: 実際に使われているのは getBaseWeaponsByRarity() のみ
```

**修正:**
```typescript
import { BASE_WEAPONS, getBaseWeaponsByRarity } from '~/data/baseWeapons'
```

#### `pages/index.vue`

```typescript
// Line 318: resetTempAllocation - 削除
const {
  // ...
  // resetTempAllocation,  // ← 削除
  // ...
} = useStatAllocation(...)
```

### 4.2 @ts-nocheck の除去

#### `server/utils/saveManager.ts`

```typescript
// @ts-nocheck ← ファイル削除により不要
```

**理由:** ファイル自体を削除するため不要

#### `systems/WeaponGenerationSystem.ts`

WeaponEffect 型が定義されていないため @ts-nocheck が使用されている可能性

**修正:** types/index.ts で WeaponEffect を正確に定義

### 4.3 使用されていない関数/変数の確認

```bash
# 検索対象
- currentEventLabel (DungeonPanel へのプロップ) - 確認
- debugEnemyPresets - 実装確認
- presetWeapons - 実装確認
```

---

## 🟡 **フェーズ 5: 型定義の改善（中優先度）**

### 5.1 WeaponEffect 型の確認・修正

**ファイル:** `types/index.ts`

現在の状態を確認後、以下を実装：

```typescript
// 既存（行 約45-55）を確認
export interface WeaponEffect {
  type: StatusEffectType
  chance: number        // 付与確率（0-100）
  duration: number      // 効果時間
  intensity?: number    // 効果の強度
}
```

### 5.2 GameState インターフェースの更新

**ファイル:** `types/index.ts`

```typescript
export interface GameState {
  player: Player
  availableWeapons: Weapon[]
  selectedDungeonId: string
  currentLevel: number
  timestamp: number
  version: string  // セーブデータバージョン管理
}
```

### 5.3 Component Props の型改善

**例:** `WeaponSelectionModal.vue`

```typescript
// Before
defineProps<{
  show: boolean
  player: any  // ← 改善対象
  filteredWeapons: any[]  // ← 改善対象
}>()

// After
defineProps<{
  show: boolean
  player: Player
  filteredWeapons: Weapon[]
}>()
```

---

## 📊 リファクタリング影響範囲

| モジュール | 影響度 | 対応方法 |
|-----------|--------|---------|
| `server/` | 🔴 削除 | localStorage 移行 |
| `useGameOrchestrator` | 🟠 大幅修正 | 3つに分解 |
| `PlayerInfo.vue` | 🟡 小修正 | useStatDisplay 導入 |
| `EnemyInfo.vue` | 🟡 小修正 | useStatDisplay 導入 |
| `ChestModal.vue` | 🟡 中修正 | WeaponCard 導入 |
| `types/index.ts` | 🟡 補完 | 型定義追加 |

---

## ✅ 検証チェックリスト

### フェーズ 1 完了後

- [ ] localStorage にセーブデータが保存される
- [ ] セーブロード機能が正常に動作
- [ ] サーバ依存がない状態で実行可能

### フェーズ 2 完了後

- [ ] useGameOrchestrator が 150行以下に短縮
- [ ] 各新規コンポーザブルのテストが容易
- [ ] インターフェースが pages/index.vue で統一

### フェーズ 3 完了後

- [ ] WeaponCard が複数の場所で再利用されている
- [ ] stat 計算が統一されている
- [ ] UI の見た目に変化なし

### フェーズ 4 完了後

- [ ] 未使用インポートが削除
- [ ] すべてのファイルが @ts-nocheck なしで動作
- [ ] lint エラーなし

### フェーズ 5 完了後

- [ ] すべての props が厳密に型付けされている
- [ ] WeaponEffect が正確に定義されている
- [ ] TypeScript strict mode でエラーなし

---

## 📈 期待される効果

| 項目 | 現状 | 改善後 |
|------|------|--------|
| ファイル行数 | ~5,000 | ~4,200 |
| 複雑度（Cyclomatic）| 高 | 中 |
| テスト可能性 | 低 | 高 |
| サーバ依存 | ⚠️ あり | ✅ なし |
| コード重複 | 中 | 低 |
| 保守性 | 低 | 高 |

---

## 🚀 次のステップ

1. **チェックイン:** リファクタリング開始前にコミット
2. **段階的実行:** フェーズを順番に実行
3. **テスト:** 各フェーズ完了後に動作確認
4. **ドキュメント:** アーキテクチャ決定記録（ADR）を作成
5. **デプロイ:** リファクタリング完了後にビルド・デプロイ

---

## 📝 参考資料

- **Single Responsibility Principle:** 各コンポーザブルは単一の責務を持つ
- **Composable Pattern:** Vue 3 の Composition API ベストプラクティス
- **localStorage API:** MDN Web Docs
- **TypeScript strict mode:** コンパイラ設定の厳密性向上
