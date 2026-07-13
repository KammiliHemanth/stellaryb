import { LoadingSpinner } from './LoadingSpinner.tsx';

interface Props {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message }: Props) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
