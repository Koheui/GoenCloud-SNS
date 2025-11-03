# Goen Cloud 開発進捗

## 最終更新: 2025-01-08

---

## ✅ 完了項目

### 1. プロジェクトセットアップ
- [x] Vite + React + TypeScript プロジェクト作成
- [x] Firebase プロジェクト作成（goencloud-v01）
- [x] Firebase SDK 設定（`.env.local`）
- [x] Git リポジトリ連携（GitHub: Koheui/GoenCloud-SNS）
- [x] 基本的なディレクトリ構造構築

### 2. Firebase 設定
- [x] Firestore データベース作成
- [x] Firebase Authentication 有効化（Email Link Login）
- [x] Firestore Rules 設定
- [x] Storage Rules 設定
- [x] Cloud Functions セットアップ
- [x] 必要な複合インデックス作成

### 3. 認証機能
- [x] Email Link Login 実装
- [x] 認証状態管理（AuthContext）
- [x] ログインページ
- [x] ユーザーデータ自動作成
- [x] 初期トークン付与（200トークン）

### 4. ユーザー機能
- [x] ユーザープロフィール表示
- [x] トークン残高表示
- [x] ログアウト機能

### 5. My Space 機能
- [x] Space 作成ページ
- [x] Space 作成時のトークン消費（100トークン）
- [x] Space 詳細表示
- [x] Space 一覧取得
- [x] Space 更新機能（基本）
- [x] Firestore Rules 修正（create権限追加）

### 6. 投稿機能
- [x] 投稿作成ページ（短文・長文対応）
- [x] 投稿データ構造定義
- [x] Firestore への投稿保存
- [x] Space に紐づく投稿一覧表示
- [x] 投稿状態管理（pending → approved）
- [x] Firestore Rules 修正

### 7. フィード機能
- [x] 承認済み投稿のフィード表示
- [x] 複数の Space から投稿を取得
- [x] Firestore インデックス最適化

### 8. エラー修正
- [x] Firestore Rules 構文エラー修正
- [x] ユーザー作成時の undefined 値エラー修正
- [x] Token Transaction の undefined 値エラー修正
- [x] Post 作成時の undefined 値エラー修正
- [x] 権限エラー修正
- [x] setDoc の merge オプション追加

### 9. レスポンシブデザイン
- [x] ログインページ（モバイル対応）
- [x] ホームページ（モバイル対応）
- [x] Space 作成ページ（モバイル対応）
- [x] Space 詳細ページ（モバイル対応）

---

## 🔄 進行中

### 現在の作業
なし（基本機能は完了）

---

## ⏳ 今後の実装予定

### 優先度：高

#### 1. メディアアップロード機能
- [ ] 写真アップロード（6枚まで、WebP圧縮）
- [ ] 動画リンク追加（Vimeo）
- [ ] 音声アップロード（60秒以内、AAC128kbps）
- [ ] Firebase Storage 設定
- [ ] アップロード進捗表示

#### 2. ご縁（Relations）機能
- [ ] ご縁申請機能
- [ ] ご縁承認/拒否機能
- [ ] ご縁リスト表示
- [ ] 両方向の承認管理
- [ ] ミラーデータ同期

#### 3. トークン購入機能
- [ ] Stripe Checkout 統合
- [ ] トークン購入ページ
- [ ] 購入履歴表示
- [ ] 残高自動更新

#### 4. 弔いモード機能
- [ ] 弔い人指定
- [ ] 弔いモード切替（250トークン消費）
- [ ] 弔いモード表示
- [ ] 自動承認フロー

### 優先度：中

#### 5. タイムライン機能
- [ ] 年表データ追加
- [ ] タイムライン表示
- [ ] 時系列ソート

#### 6. 音楽機能
- [ ] お気に入り音楽追加
- [ ] YouTube リンク埋め込み
- [ ] 音楽リスト表示

#### 7. 足跡機能
- [ ] 訪問記録
- [ ] 訪問者リスト表示
- [ ] 訪問回数カウント

#### 8. 弔意投稿（香典）機能
- [ ] 弔意投稿フォーム
- [ ] Stripe 決済統合
- [ ] メッセージ送信
- [ ] 送金履歴表示

### 優先度：低

#### 9. モデレーション機能
- [ ] 自動承認システム
- [ ] 通報機能
- [ ] 投稿非表示機能
- [ ] Cloud Functions トリガー

#### 10. 広告機能
- [ ] Google AdSense 統合
- [ ] 広告枠配置
- [ ] 弔いモード時の広告非表示

#### 11. 検索機能
- [ ] ユーザー検索
- [ ] Space 検索
- [ ] 投稿検索

#### 12. 通知機能
- [ ] リアルタイム通知
- [ ] メール通知
- [ ] プッシュ通知

---

## 📊 技術スタック

### フロントエンド
- **React 18** (Vite + TypeScript)
- **React Router DOM** (クライアントサイドルーティング)
- **Firebase SDK** (認証・Firestore・Storage)
- **CSS3** (レスポンシブデザイン)

### バックエンド
- **Firebase Hosting** (デプロイ)
- **Firestore** (データベース)
- **Firebase Authentication** (認証)
- **Firebase Storage** (ファイルストレージ)
- **Cloud Functions** (サーバーレス処理)

### 支払い
- **Stripe** (決済処理、未実装)

### 開発ツール
- **Git** (バージョン管理)
- **GitHub** (リポジトリ)
- **Vite** (ビルドツール)
- **ESLint** (リンター)
- **Prettier** (フォーマッター)

---

## 🐛 既知の問題

### 現在の問題
なし

### 過去に修正済み
1. Firestore Rules 構文エラー
2. ユーザー作成時の undefined 値
3. Token Transaction の undefined 値
4. Post 作成時の undefined 値
5. 権限エラー（create, update, read）
6. Email Link のリダイレクトループ
7. トークン残高の初期化

---

## 📝 メモ

### Firebase 設定
- **Project ID**: goencloud-v01
- **Region**: (default)
- **Auth Domain**: goencloud-v01.firebaseapp.com

### 環境変数
- `.env.local` に Firebase 設定を保持
- `.gitignore` で保護

### Git ワークフロー
- メインブランチ: `main`
- 直接コミット・プッシュ（早期開発段階）

### Stripe
- **実装状況**: 未実装（後回し）
- **理由**: 基本機能を優先

### モバイル対応
- レスポンシブデザイン実装済み
- CSS メディアクエリ使用
- タッチフレンドリーな UI

---

## 🎯 次のステップ

1. **メディアアップロード機能**を実装
   - Firebase Storage 設定
   - 画像アップロード処理
   - 動画リンク追加
2. **ご縁（Relations）機能**を実装
   - 申請・承認フロー
   - ミラーデータ同期
3. **トークン購入機能**を実装
   - Stripe Checkout 統合
   - 購入履歴管理

---

**最終更新者**: Cursor AI Assistant  
**最終更新日時**: 2025-01-08
