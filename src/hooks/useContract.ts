import { useState, useEffect, useCallback, useRef } from 'react';
import {
  recordPayment,
  fetchRecentPayments,
  getTotalTxs,
} from '../services/contract.ts';
import { fetchBalance } from '../services/wallet.ts';
import { COUNTER_CONTRACT_ADDRESS, REFRESH_INTERVAL_MS } from '../utils/constants.ts';
import type { PaymentEvent, ContractState } from '../types/contract.ts';
import type { TransactionStep } from '../types/wallet.ts';

const initialState: ContractState = {
  payments: [],
  totalTxs: 0,
  isLoading: true,
  error: null,
};

export function useContract(walletAddress: string | null) {
  const [state, setState] = useState<ContractState>(initialState);
  const [txStep, setTxStep] = useState<TransactionStep>('IDLE');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialLoadDone = useRef(false);

  const refreshData = useCallback(async (forceFetch: boolean = false) => {
    if (!COUNTER_CONTRACT_ADDRESS) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Contract address not configured. Set VITE_CONTRACT_ADDRESS in .env',
      }));
      return;
    }

    try {
      const [total, bal] = await Promise.all([
        getTotalTxs(),
        walletAddress ? fetchBalance(walletAddress) : Promise.resolve('0'),
      ]);

      setBalance(bal);

      let recent = forceFetch || initialLoadDone.current
        ? await fetchRecentPayments(Math.max(1, total), 20)
        : [];

      initialLoadDone.current = true;

      setState((prev) => ({
        ...prev,
        totalTxs: total,
        payments: total > 0 && recent.length > 0
          ? recent
          : prev.payments,
        isLoading: false,
        error: null,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [walletAddress]);

  useEffect(() => {
    refreshData(true);

    intervalRef.current = setInterval(() => refreshData(false), REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshData]);

  const addPayment = useCallback((payment: PaymentEvent) => {
    setState((prev) => ({
      ...prev,
      totalTxs: Math.max(prev.totalTxs, payment.id),
      payments: [payment, ...prev.payments].slice(0, 50),
    }));
  }, []);

  const send = useCallback(
    async (recipient: string, amount: number, memo: string) => {
      if (!walletAddress) return;

      setTxError(null);
      setTxHash(null);

      try {
        const { hash } = await recordPayment(
          walletAddress,
          recipient,
          amount,
          memo,
          setTxStep
        );
        setTxHash(hash);
        await refreshData(true);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Transaction failed';
        setTxError(message);
        setTxStep('FAILED');
      }
    },
    [walletAddress, refreshData]
  );

  const resetTxState = useCallback(() => {
    setTxStep('IDLE');
    setTxHash(null);
    setTxError(null);
  }, []);

  return {
    payments: state.payments,
    totalTxs: state.totalTxs,
    balance,
    isLoading: state.isLoading,
    error: state.error,
    txStep,
    txHash,
    txError,
    send,
    refresh: () => refreshData(true),
    addPayment,
    resetTxState,
  };
}
