import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFeed } from '../hooks/useFeed';
import type { Post, ApprovedSpace } from '../types';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  const { currentUser, userData, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { getApprovedPosts, loading: feedLoading } = useFeed();
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);

  // ご縁フィードを取得
  useEffect(() => {
    const fetchFeed = async () => {
      if (currentUser) {
        // approvedSpaces から承認済みのSpace一覧を取得
        const approvedSpacesRef = collection(db, 'users', currentUser.uid, 'approvedSpaces');
        const approvedSpacesSnapshot = await getDocs(approvedSpacesRef);
        const spaceIds = approvedSpacesSnapshot.docs.map(doc => doc.id);

        if (spaceIds.length > 0) {
          const posts = await getApprovedPosts(spaceIds);
          setFeedPosts(posts);
        }
      }
    };
    fetchFeed();
  }, [currentUser, getApprovedPosts]);

  const isLoading = loading || feedLoading;

  if (isLoading) {
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
        <div className="section">
          <h2>ご縁フィード</h2>
          {feedPosts.length === 0 ? (
            <div className="empty-feed">
              <p>承認済みのご縁からの投稿がありません</p>
            </div>
          ) : (
            <div className="feed-grid">
              {feedPosts.map((post) => (
                <div key={post.id} className="feed-post-card">
                  <p className="post-content">{post.content}</p>
                  <span className="post-type">{post.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <h2>My Space</h2>
            <p>自分のSpaceを作成・管理</p>
            <button onClick={() => navigate('/create-space')} className="feature-button">Spaceを作成</button>
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

