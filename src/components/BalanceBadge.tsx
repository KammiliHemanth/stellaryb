interface Props {
  balance: string;
}

export function BalanceBadge({ balance }: Props) {
  const num = parseFloat(balance);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
        num < 1
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      }`}
    >
      {num.toFixed(2)} XLM
    </span>
  );
}
