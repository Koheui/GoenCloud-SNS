import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { sendLoginEmail, signInWithLink, currentUser } = useAuth();
  const navigate = useNavigate();

  // 既にログインしている場合はリダイレクト
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // URLがEmail Link かチェック
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('mode') && urlParams.get('mode') === 'signIn') {
        // メールリンクからアクセスした場合
        await signInWithLink(email);
        setMessage('ログインしました！');
        navigate('/');
      } else {
        // 通常のログインリクエスト
        await sendLoginEmail(email);
        setMessage('ログイン用のメールを送信しました。メール内のリンクをクリックしてください。');
      }
    } catch (error: any) {
      setMessage(`エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>ご縁クラウド</h1>
        <p className="subtitle">メールアドレスでログイン</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? '送信中...' : 'ログインリンクを送信'}
          </button>
          
          {message && (
            <div className={`message ${message.includes('エラー') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </form>

        <p className="footer-text">
          新規登録もこちらから。メールリンクで自動登録されます。
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

