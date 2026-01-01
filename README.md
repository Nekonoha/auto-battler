# テキストベース・オートバトラー

## 🚀 起動方法（Docker）

### 開発サーバーの起動
```bash
docker-compose up
```

ブラウザで http://localhost:3002 にアクセス

### コンテナの停止
```bash
docker-compose down
```

### コンテナの再ビルド
```bash
docker-compose up --build
```

## 📁 プロジェクト構造（Nuxt 3）
```
auto-battler/
├── pages/
│   └── index.vue         # メインページ
├── components/
│   ├── PlayerInfo.vue    # プレイヤー情報表示
│   ├── EnemyInfo.vue     # 敵情報表示
│   ├── CombatLog.vue     # 戦闘ログ表示
│   └── WeaponCard.vue    # 武器カード表示
├── types/
│   └── index.ts          # 型定義
├── systems/
│   ├── WeaponSystem.ts   # 武器システム
│   ├── StatusEffectSystem.ts # 状態異常システム
│   └── CombatSystem.ts   # 戦闘システム
├── data/
│   └── weapons.ts        # 武器データベース
├── app.vue               # ルートコンポーネント
├── nuxt.config.ts        # Nuxt設定
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🎮 ゲーム概要
- オートバトル方式のテキストベースRPG
- 複数の武器を装備してビルドを組む
- 状態異常を活用した戦略的な戦闘
- ハクスラ要素による高いリプレイ性
