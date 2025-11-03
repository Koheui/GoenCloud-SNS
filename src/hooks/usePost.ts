import { useState, useCallback } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { serverTimestamp } from 'firebase/firestore';
import type { Post, PostType, PostStatus } from '../types';

export const usePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 投稿を作成
  const createPost = useCallback(async (
    spaceId: string,
    ownerUid: string,
    mode: 'life' | 'tribute',
    type: PostType,
    content?: string,
    mediaUrls?: string[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      // 生前モードでは pending、弔いモードでは approved
      const status: PostStatus = mode === 'life' ? 'pending' : 'approved';

      const newPost: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'> = {
        spaceId,
        ownerUid,
        mode,
        type,
        status,
        content,
        mediaUrls,
        reportCount: 0,
      };

      const postData: any = {
        ...newPost,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      if (status === 'approved') {
        postData.publishedAt = serverTimestamp();
      }
      
      if (!mediaUrls) {
        delete postData.mediaUrls;
      }

      const docRef = await addDoc(collection(db, 'posts'), postData);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Spaceの投稿一覧を取得
  const getPostsBySpace = useCallback(async (spaceId: string, statusFilter?: PostStatus) => {
    let q = query(
      collection(db, 'posts'),
      where('spaceId', '==', spaceId),
      orderBy('createdAt', 'desc')
    );

    if (statusFilter) {
      q = query(
        collection(db, 'posts'),
        where('spaceId', '==', spaceId),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Post));
  }, []);

  // 投稿を承認
  const approvePost = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'posts', postId);
      await updateDoc(docRef, {
        status: 'approved' as PostStatus,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 投稿を削除
  const deletePost = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'posts', postId);
      await updateDoc(docRef, {
        status: 'deleted' as PostStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPost,
    getPostsBySpace,
    approvePost,
    deletePost,
    loading,
    error,
  };
};

