import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSpace } from '../hooks/useSpace';
import { useTokens } from '../hooks/useTokens';
import '../styles/CreateSpacePage.css';

const CreateSpacePage: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const { createSpace, loading: spaceLoading, error: spaceError } = useSpace();
  const { consumeTokens, loading: tokenLoading } = useTokens();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState('');

  const loading = spaceLoading || tokenLoading;

  if (!currentUser || !userData) {
    return (
      <div className="container">
        <p>ログインが必要です</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!displayName.trim()) {
      setFormError('表示名を入力してください');
      return;
    }

    if (userData.tokenBalance < 100) {
      setFormError('トークンが不足しています（100トークン必要）');
      return;
    }

    try {
      // 1. トークンを消費
      await consumeTokens(currentUser.uid, 100, 'space_create');
      
      // 2. Spaceを作成
      const spaceId = await createSpace(currentUser.uid, displayName);
      navigate(`/space/${spaceId}`);
    } catch (err: any) {
      setFormError(err.message || 'Spaceの作成に失敗しました');
    }
  };

  return (
    <div className="container">
      <div className="create-space-card">
        <h1>My Spaceを作成</h1>
        <p className="description">
          ご縁クラウドで自分のSpaceを作成して、ご縁を記録しましょう。
        </p>

        <div className="cost-info">
          <span className="cost-label">必要トークン:</span>
          <span className="cost-value">100トークン</span>
          <span className="cost-label">現在の残高:</span>
          <span className="cost-value">{userData.tokenBalance}トークン</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">表示名</label>
            <input
              id="displayName"
              type="text"
              placeholder="あなたの表示名"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {(formError || error) && (
            <div className="error-message">
              {formError || error}
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? '作成中...' : 'Spaceを作成'}
          </button>
        </form>

        <button onClick={() => navigate('/')} className="cancel-button">
          キャンセル
        </button>
      </div>
    </div>
  );
};

export default CreateSpacePage;

