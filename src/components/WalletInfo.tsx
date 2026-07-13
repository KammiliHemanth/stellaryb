import { useState } from 'react';
import { NetworkBadge } from './NetworkBadge.tsx';
import { BalanceBadge } from './BalanceBadge.tsx';
import { shortenAddress } from '../utils/formatter.ts';
import type { WalletInfo as WalletInfoType } from '../types/wallet.ts';

interface Props {
  wallet: WalletInfoType;
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function WalletInfo({ wallet }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Connected Wallet
        </h3>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          {wallet.walletName}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-mono text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          {shortenAddress(wallet.address)}
        </code>
        <button
          onClick={handleCopy}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          title={copied ? 'Copied!' : 'Copy address'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <NetworkBadge network={wallet.network} />
        <BalanceBadge balance={wallet.balance} />
      </div>
    </div>
  );
}
