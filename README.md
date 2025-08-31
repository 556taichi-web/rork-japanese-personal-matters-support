# AI Personal Training App

20-30代女性向けのAIパーソナルトレーニングアプリです。トレーニング動画や食事内容を分析し、個人に最適化されたアドバイスを提供します。

## 🎯 プロジェクト概要

### 背景
- パーソナルトレーニングは高額だが、気軽にトレーニングに関して助言してくれる存在が欲しいというニーズに対応
- ジムには契約しているが週に一度行くかどうかの人向け
- 痩せたい気持ちはあるがなかなか実行に移せない人をサポート

### 主要機能
- 📊 日々の目標管理（歩数、カロリー消費、水分摂取）
- 🏋️ ワークアウト記録・分析
- 🍎 食事記録・栄養管理
- 💬 AI相談チャット
- 📈 進捗追跡・レポート

## 🚀 セットアップ手順

### 前提条件
- Node.js 18以上
- Bun (推奨) または npm/yarn
- Expo CLI

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd ai-personal-training-app
```

2. 依存関係をインストール
```bash
bun install
# または
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env
# .envファイルを編集して実際の値を設定
```

4. 開発サーバーを起動
```bash
bun run start
# または
npm run start
```

### 利用可能なスクリプト

- `bun run start` - Expo開発サーバーを起動（モバイル + Web）
- `bun run start-web` - Web専用で開発サーバーを起動
- `bun run start-web-dev` - デバッグモードでWeb開発サーバーを起動
- `bun run lint` - ESLintでコードをチェック

## 🏗️ 技術スタック

### フロントエンド
- **React Native** - クロスプラットフォーム開発
- **Expo** - 開発・ビルドツール
- **TypeScript** - 型安全性
- **React Query** - サーバーステート管理
- **Expo Router** - ファイルベースルーティング
- **Lucide React Native** - アイコン

### 状態管理
- **@nkzw/create-context-hook** - ローカル状態管理
- **AsyncStorage** - 永続化ストレージ
- **React Query** - サーバー状態管理

### 分析・監視
- **PostHog** - プロダクト分析
- **Sentry** - エラートラッキング

## 📱 アプリ構成

### タブ構成
1. **ホーム** - ダッシュボード、日々の目標、クイックアクション
2. **記録** - カメラを使った運動・食事記録
3. **AI相談** - AIとのチャット機能
4. **プロフィール** - ユーザー設定、進捗確認

### ディレクトリ構造
```
app/
├── (tabs)/           # タブナビゲーション
│   ├── index.tsx     # ホーム画面
│   ├── camera.tsx    # 記録画面
│   ├── chat.tsx      # AI相談画面
│   └── profile.tsx   # プロフィール画面
├── _layout.tsx       # ルートレイアウト
├── health+api.ts     # ヘルスチェックAPI
└── +not-found.tsx    # 404ページ

constants/
└── colors.ts         # カラーテーマ

assets/
└── images/           # 画像アセット
```

## 🔧 開発ガイドライン

### コーディング規約
- TypeScript strictモードを使用
- React Query のオブジェクトAPIを使用
- StyleSheetを使用してスタイリング
- Lucide React Nativeアイコンを使用
- 適切なエラーハンドリングを実装

### 状態管理パターン
- ローカル状態: `useState`
- 共有状態: `@nkzw/create-context-hook`
- サーバー状態: `React Query`
- 永続化: `AsyncStorage`（プロバイダー経由）

## 🌐 Web互換性

本アプリはReact Native Webに対応しており、モバイルとWebの両方で動作します。
Web非対応のAPIには適切なフォールバックを実装しています。

## 📊 監視・分析

### PostHog
環境変数 `EXPO_PUBLIC_POSTHOG_API_KEY` が設定されていない場合、PostHogは無効化されます。

### Sentry
環境変数 `EXPO_PUBLIC_SENTRY_DSN` が設定されていない場合、Sentryは無効化されます。

## 🚀 デプロイ

### 開発環境
- Expo Goアプリでプレビュー可能
- QRコードでモバイルデバイスからアクセス
- Webブラウザでも動作確認可能

### 本番環境
- EAS Buildを使用してネイティブアプリをビルド
- App Store / Google Play Storeに配布
- Webアプリとしてもデプロイ可能

## 🤝 コントリビューション

1. フィーチャーブランチを作成
2. 変更を実装
3. テストを実行
4. プルリクエストを作成

## 📄 ライセンス

Private - All rights reserved

## 🆘 サポート

問題が発生した場合は、以下を確認してください：

1. 環境変数が正しく設定されているか
2. 依存関係が最新版か
3. Expo CLIが最新版か

---

**健康チェック**: `/health` エンドポイントで API の動作確認が可能です。