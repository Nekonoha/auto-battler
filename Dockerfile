# Node.js 20を使用
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースをコピー
COPY . .

# Nuxt開発サーバーのポート
EXPOSE 3000

# 開発サーバーを起動（ホストからアクセス可能にする）
CMD ["npm", "run", "dev"]
