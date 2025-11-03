import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Post } from '../types';

export const useFeed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 承認済み投稿のフィードを取得
  const getApprovedPosts = useCallback(async (spaceIds: string[]) => {
    if (spaceIds.length === 0) return [];

    setLoading(true);
    setError(null);

    try {
      // Firestore の where("field", "in", array) は最大30件まで
      const chunkSize = 30;
      const chunks = [];
      
      for (let i = 0; i < spaceIds.length; i += chunkSize) {
        chunks.push(spaceIds.slice(i, i + chunkSize));
      }

      const allPosts: Post[] = [];

      for (const chunk of chunks) {
        const q = query(
          collection(db, 'posts'),
          where('spaceId', 'in', chunk),
          where('status', '==', 'approved'),
          orderBy('publishedAt', 'desc'),
          limit(50)
        );

        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Post));

        allPosts.push(...posts);
      }

      // 公開日時でソート
      return allPosts.sort((a, b) => {
        const aTime = a.publishedAt?.seconds || 0;
        const bTime = b.publishedAt?.seconds || 0;
        return bTime - aTime;
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getApprovedPosts,
    loading,
    error,
  };
};

