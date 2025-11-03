import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  const { currentUser, userData, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="home-container">
        <div className="welcome-card">
          <h1>ご縁クラウドへようこそ</h1>
          <p>人生の「ご縁」を記録し、死後は自然に弔いへつながります。</p>
          <button onClick={() => navigate('/login')} className="login-button">
            ログイン / 新規登録
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="header">
        <h1>ご縁クラウド</h1>
        <div className="user-info">
          <span>{userData?.displayName || userData?.email}</span>
          <span className="token-balance">残高: {userData?.tokenBalance || 0}トークン</span>
          <button onClick={signOut} className="logout-button">
            ログアウト
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="feature-grid">
          <div className="feature-card">
            <h2>ご縁フィード</h2>
            <p>承認済みのご縁の更新一覧</p>
            <button className="feature-button">フィードを見る</button>
          </div>

          <div className="feature-card">
            <h2>My Space</h2>
            <p>自分のSpaceを作成・管理</p>
            <button className="feature-button">Spaceを作成</button>
          </div>

          <div className="feature-card">
            <h2>投稿</h2>
            <p>思い出を投稿・共有</p>
            <button className="feature-button">投稿する</button>
          </div>

          <div className="feature-card">
            <h2>トークン購入</h2>
            <p>追加のトークンを購入</p>
            <button className="feature-button">購入する</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;

