# プロジェクト開発指針

## リファクタリング原則

### 1. コンポーネントの分離
- **ページファイル（pages/）には、ビジネスロジックやUI実装を直接書かない**
- 複雑なUIは必ずコンポーネント（components/）に分離する
- モーダルやダイアログなどの独立したUI要素は個別のコンポーネントファイルとして作成

**悪い例:**
```vue
<!-- pages/index.vue -->
<template>
  <div v-if="showModal" class="modal">
    <!-- 100行以上のHTML -->
  </div>
</template>
```

**良い例:**
```vue
<!-- pages/index.vue -->
<template>
  <MyModal :show="showModal" @close="showModal = false" />
</template>

<!-- components/MyModal.vue -->
<template>
  <div v-if="show" class="modal">
    <!-- UIの実装 -->
  </div>
</template>
```

### 2. ロジックの分離
- **ページファイルには状態管理とイベントハンドリングのみを記述**
- ビジネスロジックは必ずcomposables/に分離する
- 1つのcomposableは1つの責務を持つ

**悪い例:**
```vue
<script setup>
// pages/index.vue内に100行以上のロジック
function handleOpenChest() {
  // 複雑な処理...
}
</script>
```

**良い例:**
```vue
<!-- pages/index.vue -->
<script setup>
import { useChestSystem } from '~/composables/useChestSystem'
const { handleOpenChests } = useChestSystem(...)
</script>

<!-- composables/useChestSystem.ts -->
export function useChestSystem(...) {
  const handleOpenChests = () => {
    // 複雑な処理...
  }
  return { handleOpenChests }
}
```

### 3. 重複の排除
- **同じコードを2箇所以上に書かない**
- ユーティリティ関数はutils/に配置
- 型定義はtypes/に配置
- 既にコンポーネントやcomposableがある場合は、必ずそれを使う

### 4. ファイルサイズの管理
- 1つのVueファイルは500行以内を目標とする
- 1000行を超えたら必ず分割を検討
- scriptとtemplateのバランスを保つ

## コード品質チェックリスト

新しいコードを書く前に:
- [ ] 同じ機能のコンポーネントが既に存在しないか確認
- [ ] 同じロジックのcomposableが既に存在しないか確認
- [ ] utilsやtypesに同様の実装がないか確認

コードを書いた後に:
- [ ] コンポーネントは正しくimportして使用されているか
- [ ] composableは正しくimportして使用されているか
- [ ] 不要な古い実装は削除されているか
- [ ] ファイルサイズは適切か
- [ ] 型定義は適切か

## ディレクトリ構成ルール

```
components/     # 再利用可能なUIコンポーネント
├── modals/     # モーダル系コンポーネント（検討中）
└── ...

composables/    # ビジネスロジック・状態管理
├── useChestSystem.ts
├── useWeaponEquip.ts
└── ...

pages/          # ルーティング用ページ（薄く保つ）
└── index.vue   # メインのオーケストレーション

systems/        # ゲームシステム（戦闘、ダメージ計算など）
utils/          # 汎用ユーティリティ関数
types/          # 型定義
data/           # 静的データ・マスターデータ
```

## 命名規則

### コンポーネント
- PascalCase: `ChestModal.vue`, `WeaponCard.vue`
- 責務が明確な名前をつける

### Composables
- `use`プレフィックス + 機能名: `useChestSystem`, `useWeaponEquip`
- 戻り値は明示的な名前をつける

### 関数
- camelCase: `handleOpenChests`, `equipWeapon`
- 動詞から始める: `handle`, `calculate`, `get`, `set`, `update`

## リファクタリング時の注意

1. **一度に多くを変えすぎない**
   - 1つのPRで1つの責務の分離に留める
   - テストしながら段階的に進める

2. **既存の動作を壊さない**
   - リファクタリング後も同じ挙動を保つ
   - エラーが出たら必ず修正してからコミット

3. **依存関係を意識する**
   - composableやコンポーネントの依存関係を明確にする
   - 循環参照を避ける

## AIアシスタントへの指示

このファイルを常に参照し、以下を守ってください:

1. **コンポーネント分離時**
   - UIとロジックを完全に分離する
   - 既存の実装を削除し、新しいコンポーネントを使う
   - 不要なコードは確実に削除する

2. **Composable作成時**
   - 単一責務の原則を守る
   - 必要な依存を明示的にパラメータで受け取る
   - 戻り値の型を明確にする

3. **リファクタリング時**
   - 変更前に既存の実装を確認する
   - 変更後に古い実装が残っていないか確認する
   - エラーチェックを必ず行う

4. **コードレビュー視点**
   - 重複コードがないか
   - 分離すべき部分が残っていないか
   - ファイルサイズは適切か
   - 型安全性は保たれているか
