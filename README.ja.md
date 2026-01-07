# Traffic Page

Next.js 16 と React 19 で構築されたモダンでカスタマイズ可能なナビゲーションハブ。

## 機能

- **統一ナビゲーションハブ** - すべてのウェブサイトを一箇所で整理・アクセス
- **内部/外部ネットワーク切り替え** - 内部URLと外部URLの切り替え
- **カスタマイズ可能なカテゴリ** - 独自のウェブサイトカテゴリを作成・管理
- **豊富なアイコンサポート** - カスタムカラー対応の Font Awesome アイコン
- **マルチテーマサポート** - ライトモードとダークモード
- **国際化** - i18next による多言語サポート
- **ユーザー認証** - JWT ベースのセキュアな認証システム
- **SQLite データベース** - better-sqlite3 によるローカルデータ保存
- **レスポンシブデザイン** - Tailwind CSS 4 による美しい UI

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **UI ライブラリ**: React 19
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4
- **アイコン**: Font Awesome 7
- **データベース**: better-sqlite3
- **認証**: JWT (jsonwebtoken)
- **国際化**: i18next, react-i18next
- **ロギング**: Winston

## 開始方法

### 前提条件

- Node.js 22+
- npm、yarn または pnpm

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd traffic-page

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 本番環境向けビルド

```bash
# アプリケーションをビルド
npm run build

# 本番サーバーを起動
npm start
```

## Docker デプロイ

```bash
# Docker イメージをビルド
docker build -t traffic-page .

# コンテナを実行
docker run -p 3000:3000 -v $(pwd)/data:/app/data traffic-page
```

## プロジェクト構造

```
traffic-page/
├── src/
│   ├── app/              # Next.js App Router ページと API ルート
│   ├── components/       # React コンポーネント
│   ├── lib/              # ユーティリティライブラリ（認証、DB、ログ、i18n）
│   ├── providers/        # React コンテキストプロバイダー
│   ├── types/            # TypeScript 型定義
│   └── utils/            # ユーティリティ関数
├── public/               # 静的アセット
└── package.json
```

## API ルート

- `POST /api/user/register` - ユーザー登録
- `POST /api/user/login` - ユーザーログイン
- `GET /api/user/userinfo` - ユーザー情報取得
- `GET /api/user/page` - ユーザーナビゲーションページ取得
- `POST /api/user/page` - ユーザーナビゲーションページ保存
- `GET /api/user/checkSystemInit` - システム初期化状態チェック
- `GET/POST /api/systemSetting/generalSetting` - システム設定

## デフォルトカテゴリ

アプリケーションには以下のカテゴリがプリ設定されています：

- クイックアクセス
- 一般ツール
- 開発
- エンターテイメント
- オペレーティングシステム
- ショッピング
- ナレッジ
- ゲーム

## 設定

### 環境変数

ルートディレクトリに `.env` ファイルを作成します：

```env
# データベース
DATABASE_PATH=./data/traffic.db

# JWT シークレット（独自のシークレットを生成してください）
JWT_SECRET=your-secret-key

# アプリケーション
NODE_ENV=production
PORT=3000
```

### データベース初期化

データベースは初回実行時に自動的に初期化され、以下のテーブルが作成されます：

- `t_user` - ユーザーアカウント
- `t_user_page` - ユーザーナビゲーションページ
- `t_system_setting` - システム設定

## ライセンス

本プロジェクトは MIT ライセンスの下でライセンスされています。