interface Props {
  onConnect: () => void;
  onDisconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
}

export function WalletSelector({
  onConnect,
  onDisconnect,
  isConnected,
  isConnecting,
}: Props) {
  if (isConnected) {
    return (
      <button
        onClick={onDisconnect}
        className="w-full rounded-xl border-2 border-red-200 bg-red-50 px-6 py-3 font-medium text-red-600 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
      >
        Disconnect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isConnecting ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Connecting...
        </span>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}
