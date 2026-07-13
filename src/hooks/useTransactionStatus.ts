import { useState, useCallback } from 'react';
import type { TransactionState, TransactionStep } from '../types/wallet.ts';

const initialState: TransactionState = {
  step: 'IDLE',
  hash: null,
  error: null,
};

export function useTransactionStatus() {
  const [state, setState] = useState<TransactionState>(initialState);

  const setStep = useCallback((step: TransactionStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const setHash = useCallback((hash: string) => {
    setState((prev) => ({ ...prev, hash }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error, step: 'FAILED' }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    setStep,
    setHash,
    setError,
    reset,
  };
}
