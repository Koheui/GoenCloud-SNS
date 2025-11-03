# ご縁クラウド Specification v1.0.1（完全版・Cursor対応）

## 0. 概要

**ご縁クラウド（Goen Cloud）**は、「生前モード」と「弔いモード」を切り替えて利用できる SNS 兼オンライン追悼プラットフォームです。  
本仕様書は Firebase + React（Vite） + Stripe をベースに、Cursor/Replit 環境での実装を前提に記述しています。

**主目的**：人の “ご縁” を記録・可視化し、死後は自動的に追悼モードへ遷移

**主収益源**：
- トークン課金（内部通貨）
- 弔意投稿（香典代わり）
- 広告表示（Google AdSense + スポンサー登録）

**運用環境**：Firebase Hosting / Firestore / Functions / Storage / Stripe / Vercel 不使用

---

## 1. 開発構成とディレクトリ設計

```
/root
├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ hooks/
│  ├─ lib/firebase.ts
│  ├─ lib/stripe.ts
│  ├─ context/AuthContext.tsx
│  ├─ types/
│  └─ App.tsx
├─ functions/
│  ├─ src/
│  │  ├─ index.ts (Webhook + Utility)
│  │  └─ firestoreTriggers.ts (モデレーション等)
│  └─ package.json
├─ public/
├─ firebase.json
├─ firestore.rules
├─ storage.rules
└─ package.json
```

---

## 2. 依存パッケージ

**Frontend（Vite + React + TypeScript）**

```bash
npm install react-router-dom firebase stripe @stripe/stripe-js framer-motion dayjs react-query
npm install -D typescript vite eslint prettier
```

**Backend（Cloud Functions）**

```bash
npm install firebase-admin firebase-functions stripe
```

---

## 3. Firebase構成とAPIキー設定

### .env.local

```
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx
VITE_FIREBASE_APP_ID=xxxxx
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

### .env（functions 用）

```
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 4. Firestore スキーマ（最終決定）

| パス | 説明 |
|:--|:--|
| `users/{uid}` | 氏名・メール・プロフィール・tokenBalance・betaGrantedAt・lastTokenUpdateAt |
| `users/{uid}/tokenTransactions/{txId}` | type/tokens/jpy/source/stripeEventId/status/createdAt |
| `users/{uid}/approvedSpaces/{spaceId}` | ご縁ミラー：approvedAt/labels/ownerUid |
| `spaces/{spaceId}` | ownerUid/stewardUid/mode/profile/career/motto/stats（全て埋め込み） |
| `spaces/{spaceId}/relations/{otherUid}` | ご縁状態：status/requesterUid/approverUid/labels/approvedAt |
| `spaces/{spaceId}/timeline/{itemId}` | 年表データ：年月・タイトル・説明・orderKey |
| `spaces/{spaceId}/music/{trackId}` | お気に入り音楽：タイトル・アーティスト・YouTubeリンク |
| `spaces/{spaceId}/footprints/{visitorUid}` | 足跡：name/lastVisitedAt/visitCount |
| `posts/{postId}` | 投稿（トップレベル）。spaceId/ownerUid/mode/type/status/publishedAt/mediaUrls |
| `condolences/{id}` | 香典：spaceId/donorUid/amount/fee/net/status/createdAt/message |

---

## 5. 投稿・モデレーション仕様

### 投稿状態

| 状態 | 意味 |
|:--|:--|
| `draft` | 下書き |
| `pending` | 生前承認待ち |
| `approved` | 公開済み |
| `rejected` | 否認（24時間後削除） |
| `hidden` | 通報3件で自動非表示 |
| `deleted` | 物理削除 |

### 投稿ルール

- **生前モード**：本人承認制
- **弔いモード**：即時公開
- 通報3件で非表示（Functionsが status → "hidden"）
- 本人・弔い人が復帰可能（status → "approved"）

### 投稿制限

| タイプ | 条件 |
|:--|:--|
| テキスト短文 | 無料・120文字以内 |
| 長文 | 有料・800文字以内 |
| 写真 | 6枚まで・WebP圧縮（300〜500KB） |
| 動画 | 2分以内（Vimeoリンク） |
| 音声 | 60秒以内・AAC128kbps |

---

## 6. トークン構造（内部通貨）

- **基本単位**：1トークン ≒ ¥38
- **初期付与**：200トークン

**残高**：`users/{uid}.tokenBalance: number`

**台帳**：`users/{uid}/tokenTransactions/{txId}` = {
  type: "purchase" | "use" | "earn_from_condolence",
  tokens: number,
  jpy: number,
  source: "stripe" | "system",
  stripeEventId: string,
  related: string | null,
  status: "committed" | "pending",
  createdAt: timestamp,
  committedAt: timestamp
}

**冪等性担保**：stripeEventId が既存ならスキップ。

---

## 7. ご縁（Relations）

**双方承認制**

正データ：`spaces/{spaceId}/relations/{otherUid}`

ミラー：`users/{uid}/approvedSpaces/{spaceId}`

```
{
  status: "requested" | "approved" | "rejected" | "revoked" | "blocked",
  requesterUid: string,
  approverUid: string,
  labels: string[],
  approvedAt: timestamp,
  updatedAt: timestamp
}
```

---

## 8. 弔意投稿（香典）

**トップコレクション**：`condolences/{id}`

```
{
  spaceId: string,
  donorUid: string | null,
  amount: number, // ¥1,000単位
  fee: number, // 15%
  net: number, // amount - fee
  status: "pending" | "succeeded" | "refunded" | "failed",
  message: string,
  name: string,
  email: string,
  stripePaymentIntentId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**返金**：Stripe Dashboard or Cloud Functions 経由で可能。Webhook（charge.refunded）により自動反映。

---

## 9. 弔いモード切替フロー

1. 生前に弔い人（`stewardUid`）を指定
2. 弔い人が**250トークン消費**で切替
3. `spaces/{spaceId}.mode` を `"tribute"` に変更
4. `switchedAt` と `switchedBy` を記録

---

## 10. firestore.rules（最終）

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    match /users/{uid} {
      allow read, update: if request.auth.uid == uid;
      match /tokenTransactions/{txId} {
        allow read: if request.auth.uid == uid || request.auth.token.admin == true;
        allow write: if false;
      }
      match /approvedSpaces/{spaceId} {
        allow read: if request.auth.uid == uid;
      }
    }

    match /spaces/{spaceId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.ownerId;
      match /relations/{otherUid} {
        allow read, create, update, delete: if request.auth != null;
      }
      match /footprints/{visitorUid} {
        allow read: if true;
        allow create, update: if request.auth.uid == visitorUid;
      }
      match /timeline/{itemId}, /music/{trackId} {
        allow read: if true;
        allow write: if request.auth.uid == get(/databases/$(db)/documents/spaces/$(spaceId)).data.ownerId;
      }
    }

    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.ownerUid;
    }

    match /condolences/{id} {
      allow read: if true;
      allow create: if false; // Functions 経由のみ
    }
  }
}
```

---

## 11. Cloud Functions（Stripe連携）

```ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15" });

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  try {
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const kind = session.metadata.kind;

      if (kind === "token") {
        const uid = session.metadata.userId;
        const tokens = Number(session.metadata.tokens || 0);
        const eventId = event.id;
        const txRef = db.doc(`users/${uid}/tokenTransactions/${eventId}`);
        const userRef = db.doc(`users/${uid}`);

        await db.runTransaction(async (t) => {
          if ((await t.get(txRef)).exists) return;
          const bal = (await t.get(userRef)).data()?.tokenBalance || 0;
          t.set(txRef, {
            type: "purchase",
            tokens,
            source: "stripe",
            stripeEventId: eventId,
            status: "committed",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          t.update(userRef, { tokenBalance: bal + tokens, lastTokenUpdateAt: admin.firestore.FieldValue.serverTimestamp() });
        });
      }

      if (kind === "condolence") {
        const { spaceId, donorUid } = session.metadata;
        const amount = session.amount_total / 100;
        const fee = Math.round(amount * 0.15);
        const net = amount - fee;

        await db.doc(`condolences/${event.id}`).set({
          spaceId,
          donorUid: donorUid ?? null,
          amount,
          fee,
          net,
          status: "succeeded",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }
    }

    if (event.type === "charge.refunded") {
      const refund = event.data.object as any;
      await db.doc(`condolences/${refund.id}`).set({
        status: "refunded",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

---

## 12. 実装順序（Cursor向け）

1️⃣ **Firebase プロジェクト作成**（Firestore, Hosting, Functions 有効化）  
2️⃣ **Vite + React セットアップ** → `.env.local` 設定  
3️⃣ **Firebase SDK 設定**（`lib/firebase.ts`）  
4️⃣ **Routing**：
   - `/home`（ご縁フィード）
   - `/space/:id`（My Space）
   - `/post/:id`
   - `/tribute/:id`
5️⃣ **認証**（Email Link Login）  
6️⃣ **トークン購入**（Stripe Checkout）実装  
7️⃣ **Firestore CRUD**（MySpace・Relations・Posts）  
8️⃣ **Functions StripeWebhook デプロイ**  
9️⃣ **広告**（Google AdSense埋め込み）  
🔟 **βテスト** → 弔いモード切替・香典送信

---

## 補足：ビジネスモデル

| 機能 | 消費トークン / 金額 | 備考 |
|:--|:--|:--|
| アカウント作成 | 無料（β200トークン付与） | 誰でも登録可 |
| My Space作成 | 100トークン | 約¥3,800相当 |
| 弔いモード切替 | 250トークン | 約¥10,000相当（弔い人） |
| 弔意投稿（香典） | ¥1,000/口 | Stripe決済（手数料15%） |
| トークン購入 | 任意 | Stripe決済（¥1=1トークン） |

**広告収入**：Google広告＋スポンサー登録。プロフィール下・フィード間に表示（弔い時は非表示）

---

**Specification v1.0.1（最終更新：2025年）**
