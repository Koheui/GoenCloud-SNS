import { useState, useCallback } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { serverTimestamp } from 'firebase/firestore';
import type { Relation, ApprovedSpace } from '../types';

export const useRelations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ご縁申請を作成
  const requestRelation = useCallback(async (spaceId: string, requesterUid: string) => {
    setLoading(true);
    setError(null);

    try {
      const relationRef = doc(db, 'spaces', spaceId, 'relations', requesterUid);
      
      const relationData: Omit<Relation, 'updatedAt'> = {
        status: 'requested',
        requesterUid,
        approverUid: '',
        labels: [],
        updatedAt: serverTimestamp() as any,
      };

      await addDoc(collection(db, 'spaces', spaceId, 'relations'), relationData);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ご縁を承認（Functions側で処理推奨）
  const approveRelation = useCallback(async (spaceId: string, otherUid: string, approverUid: string, labels: string[] = []) => {
    setLoading(true);
    setError(null);

    try {
      // 1. relations を更新
      const relationRef = doc(db, 'spaces', spaceId, 'relations', otherUid);
      await updateDoc(relationRef, {
        status: 'approved',
        approverUid,
        labels,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. ミラーを作成
      const spaceSnapshot = await getDoc(doc(db, 'spaces', spaceId));
      const ownerUid = spaceSnapshot.data()?.ownerId;

      const approvedSpaceRef = doc(db, 'users', otherUid, 'approvedSpaces', spaceId);
      const approvedSpaceData: ApprovedSpace = {
        approvedAt: serverTimestamp() as any,
        labels,
        ownerUid,
      };
      await addDoc(collection(db, 'users', otherUid, 'approvedSpaces'), approvedSpaceData);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    requestRelation,
    approveRelation,
    loading,
    error,
  };
};

