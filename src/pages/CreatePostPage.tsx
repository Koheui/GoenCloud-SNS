import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePost } from '../hooks/usePost';
import { useSpace } from '../hooks/useSpace';
import '../styles/CreatePostPage.css';

const CreatePostPage: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { currentUser } = useAuth();
  const { getSpace } = useSpace();
  const { createPost, loading, error } = usePost();
  const navigate = useNavigate();

  const [postType, setPostType] = useState<'text_short' | 'text_long'>('text_short');
  const [content, setContent] = useState('');
  const [space, setSpace] = useState<any>(null);

  useEffect(() => {
    const fetchSpace = async () => {
      if (spaceId) {
        const spaceData = await getSpace(spaceId);
        setSpace(spaceData);
      }
    };
    fetchSpace();
  }, [spaceId, getSpace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!spaceId || !currentUser || !space) return;

    const maxLength = postType === 'text_short' ? 120 : 800;
    if (content.length > maxLength) {
      alert(`${maxLength}文字以内で入力してください`);
      return;
    }

    try {
      await createPost(spaceId, currentUser.uid, space.mode, postType, content);
      navigate(`/space/${spaceId}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (!space) {
    return <div className="container">読み込み中...</div>;
  }

  const maxLength = postType === 'text_short' ? 120 : 800;

  return (
    <div className="container">
      <div className="create-post-card">
        <h1>投稿を作成</h1>
        <button onClick={() => navigate(`/space/${spaceId}`)} className="close-button">×</button>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>投稿タイプ</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="text_short"
                  checked={postType === 'text_short'}
                  onChange={(e) => setPostType(e.target.value as 'text_short' | 'text_long')}
                />
                短文（120文字、無料）
              </label>
              <label>
                <input
                  type="radio"
                  value="text_long"
                  checked={postType === 'text_long'}
                  onChange={(e) => setPostType(e.target.value as 'text_short' | 'text_long')}
                />
                長文（800文字、有料）
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">内容</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              maxLength={maxLength}
              required
              disabled={loading}
            />
            <div className="char-count">
              {content.length} / {maxLength} 文字
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? '投稿中...' : '投稿する'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;

