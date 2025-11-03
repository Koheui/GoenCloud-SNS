import { useState, useCallback } from 'react';
import { doc, getDoc, setDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { TokenTransaction } from '../types';

export const useTokens = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // トークンを消費（トランザクションで安全に）
  const consumeTokens = useCallback(async (
    uid: string,
    amount: number,
    source: 'space_create' | 'tribute_enable',
    related?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', uid);
      const txId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User not found');
        }

        const currentBalance = userDoc.data().tokenBalance || 0;
        
        if (currentBalance < amount) {
          throw new Error('Insufficient tokens');
        }

        const newBalance = currentBalance - amount;

        // トークン台帳に記録
        const txRef = doc(db, 'users', uid, 'tokenTransactions', txId);
        const txData: any = {
          type: 'use',
          tokens: -amount,
          source: 'system',
          status: 'committed',
          createdAt: serverTimestamp() as any,
          committedAt: serverTimestamp() as any,
        };
        
        if (related) {
          txData.related = related;
        }

        transaction.set(txRef, txData);
        transaction.update(userRef, {
          tokenBalance: newBalance,
          lastTokenUpdateAt: serverTimestamp(),
        });
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    consumeTokens,
    loading,
    error,
  };
};

