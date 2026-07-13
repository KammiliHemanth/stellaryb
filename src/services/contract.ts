import { Address, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
import { COUNTER_CONTRACT_ADDRESS, STELLAR_TESTNET_RPC } from '../utils/constants.ts';
import {
  readContractValue,
  submitContractTransaction,
  sendTransaction,
  pollTransactionStatus,
} from './rpc.ts';
import { signTransaction } from './wallet.ts';
import { getApiUrl } from '../utils/api.ts';
import type { PaymentEvent } from '../types/contract.ts';
import type { TransactionStep } from '../types/wallet.ts';

export async function recordPayment(
  walletAddress: string,
  recipient: string,
  amount: number,
  memo: string,
  onStepChange: (step: TransactionStep) => void
): Promise<{ hash: string; txId: number }> {
  onStepChange('WAITING_SIGNATURE');

  const xdr = await submitContractTransaction(
    walletAddress,
    COUNTER_CONTRACT_ADDRESS,
    'record',
    [
      new Address(walletAddress).toScVal(),
      new Address(recipient).toScVal(),
      nativeToScVal(amount, { type: 'u64' }),
      nativeToScVal(memo, { type: 'string' }),
    ]
  );

  onStepChange('SIGNING');

  const signedXdr = await signTransaction(xdr);

  onStepChange('SUBMITTING');

  const { hash } = await sendTransaction(signedXdr);

  onStepChange('PENDING');

  const result = await pollTransactionStatus(hash);

  if (result.status === 'SUCCESS') {
    onStepChange('CONFIRMED');
    const txId = result.returnValue
      ? Number(scValToNative(result.returnValue))
      : 0;
    return { hash, txId };
  }

  onStepChange('FAILED');
  throw new Error('Transaction failed on the network');
}

export async function fetchRecentPayments(
  start: number,
  limit: number
): Promise<PaymentEvent[]> {
  const apiUrl = getApiUrl('/get-recent-txs');

  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}?start=${start}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        return data.payments || [];
      }
    } catch {
      // fallback to direct RPC
    }
  }

  try {
    const raw = await readContractValue<
      Array<Record<string, unknown>>
    >(
      COUNTER_CONTRACT_ADDRESS,
      'recent_txs',
      [
        nativeToScVal(start, { type: 'u32' }),
        nativeToScVal(limit, { type: 'u32' }),
      ]
    );

    if (!Array.isArray(raw)) return [];

    return raw.map((item: Record<string, unknown>) => ({
      id: Number(item.id),
      sender: String(item.sender),
      recipient: String(item.recipient),
      amount: Number(item.amount),
      memo: String(item.memo),
      timestamp: Number(item.timestamp),
    }));
  } catch {
    return [];
  }
}

export async function getTotalTxs(): Promise<number> {
  const apiUrl = getApiUrl('/get-total-txs');

  if (apiUrl) {
    try {
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        return data.total || 0;
      }
    } catch {
      // fallback to direct RPC
    }
  }

  try {
    return await readContractValue<number>(
      COUNTER_CONTRACT_ADDRESS,
      'total_txs',
      []
    );
  } catch {
    return 0;
  }
}
