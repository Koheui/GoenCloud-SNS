import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpace } from '../hooks/useSpace';
import type { Space } from '../types';
import '../styles/SpacePage.css';

const SpacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSpace, loading } = useSpace();
  const [space, setSpace] = useState<(Space & { id: string }) | null>(null);

  useEffect(() => {
    const fetchSpace = async () => {
      if (id) {
        const spaceData = await getSpace(id);
        setSpace(spaceData);
      }
    };
    fetchSpace();
  }, [id, getSpace]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="container">
        <p>Spaceが見つかりません</p>
        <button onClick={() => navigate('/')}>ホームに戻る</button>
      </div>
    );
  }

  return (
    <div className="space-container">
      <div className="space-header">
        <button onClick={() => navigate('/')} className="back-button">← 戻る</button>
      </div>

      <div className="space-content">
        <div className="space-profile">
          {space.profile && (
            <div>
              <h1>{space.profile.displayName || '名前未設定'}</h1>
              {space.profile.title && <p className="title">{space.profile.title}</p>}
              {space.profile.bio && <p className="bio">{space.profile.bio}</p>}
            </div>
          )}
        </div>

        <div className="space-stats">
          <div className="stat-item">
            <div className="stat-value">{space.stats?.posts || 0}</div>
            <div className="stat-label">投稿</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{space.stats?.relations || 0}</div>
            <div className="stat-label">ご縁</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{space.stats?.footprints || 0}</div>
            <div className="stat-label">足跡</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacePage;

