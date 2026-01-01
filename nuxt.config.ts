// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // TypeScriptの設定
  typescript: {
    strict: true,
    typeCheck: false  // 開発時の型チェックを無効化（ビルド時のみ）
  },

  // 開発サーバーの設定
  devServer: {
    host: 'localhost',
    port: 3002 // ローカルアクセス用に3002へ固定
  },

  // Docker環境でのファイル監視（ホットリロード）を安定させるためポーリングを有効化
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 150
      }
    }
  },

  // CSSの設定
  css: [],

  // アプリケーションの設定
  app: {
    head: {
      title: 'テキストベース・オートバトラー',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ハクスラ × オートバトル × 状態異常コンボ' }
      ]
    }
  },

  // コンポーネントの自動インポート
  components: true,

  compatibilityDate: '2024-01-01'
})
