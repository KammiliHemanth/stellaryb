import { useState } from 'react';

interface Props {
  onSend: (recipient: string, amount: number, memo: string) => void;
  isTxPending: boolean;
  balance: string;
}

export function SendForm({ onSend, isTxPending, balance }: Props) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Math.floor(parseFloat(amount));
    if (!recipient || amt <= 0) return;
    onSend(recipient.trim(), amt, memo.trim());
    setAmount('');
    setMemo('');
  };

  const isValid =
    recipient.length >= 56 &&
    recipient.startsWith('G') &&
    parseFloat(amount) > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Recipient Address
        </label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="GABCD...1234"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          disabled={isTxPending}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount (XLM)
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.0000001"
            min="0.0000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            disabled={isTxPending}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            XLM
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Balance: {parseFloat(balance).toFixed(2)} XLM
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Memo <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Payment for..."
          maxLength={64}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          disabled={isTxPending}
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || isTxPending}
        className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isTxPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </span>
        ) : (
          'Send XLM'
        )}
      </button>
    </form>
  );
}
