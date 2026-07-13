import type { PaymentEvent } from '../types/contract.ts';
import { shortenAddress, formatTimestamp } from '../utils/formatter.ts';

interface Props {
  payments: PaymentEvent[];
  isLoading: boolean;
  walletAddress: string | null;
}

export function TransactionFeed({ payments, isLoading, walletAddress }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
          >
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No transactions yet. Connect wallet and send a payment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {payments.map((payment, index) => {
        const isOutgoing =
          walletAddress &&
          payment.sender.toLowerCase() === walletAddress.toLowerCase();

        return (
          <div
            key={`${payment.timestamp}-${payment.id}-${index}`}
            className="rounded-lg border border-gray-100 bg-white p-3 transition-all hover:shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  isOutgoing
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}
              >
                {isOutgoing ? '− Sent' : '+ Received'}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {payment.amount} XLM
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>
                {isOutgoing ? 'To:' : 'From:'}
              </span>
              <code className="font-mono text-gray-600 dark:text-gray-300">
                {shortenAddress(
                  isOutgoing ? payment.recipient : payment.sender,
                  5
                )}
              </code>
            </div>

            {payment.memo && (
              <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                "{payment.memo}"
              </div>
            )}

            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {formatTimestamp(payment.timestamp)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
