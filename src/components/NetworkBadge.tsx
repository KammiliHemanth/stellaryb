interface Props {
  network: string;
}

export function NetworkBadge({ network }: Props) {
  const isTestnet = network === 'Testnet';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isTestnet
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isTestnet ? 'bg-green-500' : 'bg-yellow-500'
        }`}
      />
      {network}
    </span>
  );
}
