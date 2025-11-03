import { useState, useCallback } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { serverTimestamp } from 'firebase/firestore';
import type { Space } from '../types';

export const useSpace = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // My Spaceを作成
  const createSpace = useCallback(async (ownerUid: string, displayName: string) => {
    setLoading(true);
    setError(null);

    try {
      const newSpace: Omit<Space, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'> & { ownerUid: string } = {
        ownerUid,
        mode: 'life',
        profile: {
          displayName,
        },
        stats: {
          posts: 0,
          relations: 0,
          footprints: 0,
        },
      };

      const docRef = await addDoc(collection(db, 'spaces'), {
        ...newSpace,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Spaceを取得
  const getSpace = useCallback(async (spaceId: string) => {
    const docRef = doc(db, 'spaces', spaceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Space;
    }
    return null;
  }, []);

  // ユーザーのSpace一覧を取得
  const getUserSpaces = useCallback(async (ownerUid: string) => {
    const q = query(collection(db, 'spaces'), where('ownerUid', '==', ownerUid));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Space));
  }, []);

  // Spaceを更新
  const updateSpace = useCallback(async (spaceId: string, updates: Partial<Space>) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'spaces', spaceId);
      await updateDoc(docRef, {
        ...updates,
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
    createSpace,
    getSpace,
    getUserSpaces,
    updateSpace,
    loading,
    error,
  };
};

