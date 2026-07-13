export interface PaymentEvent {
  id: number;
  sender: string;
  recipient: string;
  amount: number;
  memo: string;
  timestamp: number;
}

export interface ContractState {
  payments: PaymentEvent[];
  totalTxs: number;
  isLoading: boolean;
  error: string | null;
}
