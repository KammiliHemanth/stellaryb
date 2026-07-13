import { StatusBadge } from './StatusBadge.tsx';
import { copyToClipboard } from '../utils/helpers.ts';
import { STELLAR_EXPERT_URL } from '../utils/constants.ts';
import type { TransactionStep } from '../types/wallet.ts';

interface Props {
  step: TransactionStep;
  hash: string | null;
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function TransactionStatusCard({
  step,
  hash,
  error,
  onRetry,
  onDismiss,
}: Props) {
  if (step === 'IDLE' && !hash && !error) return null;

  const handleCopyHash = async () => {
    if (hash) await copyToClipboard(hash);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Transaction Status
        </h3>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <StatusBadge status={step} />
      </div>

      {hash && (
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {hash}
          </code>
          <button
            onClick={handleCopyHash}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            📋
          </button>
          <a
            href={`${STELLAR_EXPERT_URL}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400"
          >
            View ↗
          </a>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-600 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
