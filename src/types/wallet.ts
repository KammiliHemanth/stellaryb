export interface WalletInfo {
  address: string;
  walletName: string;
  network: string;
  networkPassphrase: string;
  balance: string;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  wallet: WalletInfo | null;
  error: string | null;
}

export type TransactionStep =
  | 'IDLE'
  | 'WAITING_SIGNATURE'
  | 'SIGNING'
  | 'SUBMITTING'
  | 'PENDING'
  | 'CONFIRMED'
  | 'FAILED';

export interface TransactionState {
  step: TransactionStep;
  hash: string | null;
  error: string | null;
}
