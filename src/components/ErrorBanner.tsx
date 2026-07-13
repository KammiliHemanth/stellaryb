interface Props {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: Props) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-red-500">⚠</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-600 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Try again
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
