interface Props {
  status: string;
}

const statusColors: Record<string, string> = {
  IDLE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  WAITING_SIGNATURE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  SIGNING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  SUBMITTING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  PENDING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const statusLabels: Record<string, string> = {
  IDLE: 'Idle',
  WAITING_SIGNATURE: 'Waiting for Signature',
  SIGNING: 'Signing',
  SUBMITTING: 'Submitting',
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  FAILED: 'Failed',
};

export function StatusBadge({ status }: Props) {
  const color = statusColors[status] || statusColors.IDLE;
  const label = statusLabels[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${color}`}
    >
      {status === 'PENDING' || status === 'SUBMITTING' || status === 'WAITING_SIGNATURE' || status === 'SIGNING' ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      ) : status === 'CONFIRMED' ? (
        <span>✓</span>
      ) : status === 'FAILED' ? (
        <span>✕</span>
      ) : null}
      {label}
    </span>
  );
}
