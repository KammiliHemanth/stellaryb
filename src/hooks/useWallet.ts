import { useState, useEffect, useCallback } from 'react';
import {
  connectWallet,
  disconnectWallet,
  fetchBalance,
  subscribeToWalletChanges,
} from '../services/wallet.ts';
import type { WalletState } from '../types/wallet.ts';

const initialState: WalletState = {
  isConnected: false,
  isConnecting: false,
  wallet: null,
  error: null,
};

export function useWallet() {
  const [state, setState] = useState<WalletState>(initialState);

  useEffect(() => {
    const cleanup = subscribeToWalletChanges(
      (address) => {
        setState((prev) => {
          if (prev.wallet && prev.wallet.address !== address) {
            return {
              ...prev,
              wallet: { ...prev.wallet, address },
            };
          }
          return prev;
        });
      },
      () => {
        setState(initialState);
      }
    );

    return cleanup;
  }, []);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const walletInfo = await connectWallet();
      setState({
        isConnected: true,
        isConnecting: false,
        wallet: walletInfo,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: message,
      }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await disconnectWallet();
    } finally {
      setState(initialState);
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!state.wallet) return;

    try {
      const balance = await fetchBalance(state.wallet.address);
      setState((prev) => ({
        ...prev,
        wallet: prev.wallet
          ? { ...prev.wallet, balance }
          : null,
      }));
    } catch {
      // Silently fail on balance refresh
    }
  }, [state.wallet]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    refreshBalance,
    clearError,
  };
}
