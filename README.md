# ご縁クラウド（Goen Cloud）

**生前と弔いをつなぐ関係記録SNS**

ご縁クラウドは、人生の「ご縁」を記録・可視化し、死後は自然に追悼モードへ遷移するSNSプラットフォームです。

## 📋 プロジェクト概要

- **生前モード**: 承認制の投稿・足跡機能・ご縁申請で関係を築く
- **弔いモード**: 弔い人が切替後、葬儀・香典の場として機能
- **収益モデル**: トークン課金・弔意投稿（香典代わり）・広告収入

## 🛠️ 技術スタック

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Firebase (Hosting / Firestore / Functions / Storage)
- **認証**: Firebase Auth (Email Link)
- **決済**: Stripe
- **状態管理**: React Query
- **UI**: Framer Motion
- **日付**: Day.js

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/Koheui/GoenCloud-SNS.git
cd GoenCloud-SNS
```

### 2. 依存関係のインストール

```bash
# Frontend
npm install

# Cloud Functions
cd functions
npm install
cd ..
```

### 3. 環境変数の設定

`.env.local` を作成してFirebase設定を追加:

```env
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx
VITE_FIREBASE_APP_ID=xxxxx
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

Functions用の `.env`:

```bash
cd functions
```

`.env` を作成:

```env
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開く

## 📁 プロジェクト構造

```
GoenCloud-SNS/
├── src/
│   ├── components/      # Reactコンポーネント
│   ├── pages/          # ページコンポーネント
│   ├── hooks/          # カスタムフック
│   ├── lib/            # ライブラリ設定（Firebase, Stripe）
│   ├── context/        # React Context
│   ├── types/          # TypeScript型定義
│   ├── App.tsx         # メインアプリ
│   └── main.tsx        # エントリーポイント
├── functions/          # Cloud Functions
│   ├── src/
│   │   └── index.ts    # Stripe Webhook
│   └── package.json
├── public/             # 静的ファイル
├── firebase.json       # Firebase設定
├── firestore.rules     # Firestoreセキュリティルール
├── storage.rules       # Storageセキュリティルール
└── package.json
```

## 🔐 Firestore スキーマ

詳細は [Docs/Goen_Specification_v1.0.1.md](Docs/Goen_Specification_v1.0.1.md) を参照

**主要コレクション**:
- `users/{uid}` - ユーザー情報・トークン残高
- `users/{uid}/tokenTransactions/{txId}` - トークン台帳
- `spaces/{spaceId}` - My Space情報
- `spaces/{spaceId}/relations/{otherUid}` - ご縁（承認関係）
- `posts/{postId}` - 投稿（トップレベル）
- `condolences/{id}` - 香典レコード

## 💰 料金体系

| 機能 | 消費トークン/金額 |
|:--|:--|
| アカウント作成 | 無料（β200トークン付与） |
| My Space作成 | 100トークン |
| 弔いモード切替 | 250トークン |
| 弔意投稿（香典） | ¥1,000/口（手数料15%） |
| トークン購入 | ¥1 = 1トークン |

## 🚢 デプロイ

### Firebaseにデプロイ

```bash
# Functions のビルド
cd functions
npm run build
cd ..

# デプロイ
firebase deploy
```

### 個別デプロイ

```bash
firebase deploy --only hosting  # Frontendのみ
firebase deploy --only functions  # Functionsのみ
firebase deploy --only firestore:rules  # ルールのみ
```

## 📚 ドキュメント

詳細な仕様は以下を参照:
- [仕様書 v1.0.1](Docs/Goen_Specification_v1.0.1.md)

## 📝 ライセンス

ISC

## 🔗 リンク

- [GitHub](https://github.com/Koheui/GoenCloud-SNS)
- 仕様書: [Docs/Goen_Specification_v1.0.1.md](Docs/Goen_Specification_v1.0.1.md)

