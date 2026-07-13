import { useWallet } from '../hooks/useWallet.ts';
import { useContract } from '../hooks/useContract.ts';
import { useEventListener } from '../hooks/useEventListener.ts';
import { WalletSelector } from '../components/WalletSelector.tsx';
import { WalletInfo } from '../components/WalletInfo.tsx';
import { SendForm } from '../components/SendForm.tsx';
import { TransactionFeed } from '../components/TransactionFeed.tsx';
import { TransactionStatusCard } from '../components/TransactionStatus.tsx';
import { ErrorBanner } from '../components/ErrorBanner.tsx';
import { COUNTER_CONTRACT_ADDRESS } from '../utils/constants.ts';

export function Home() {
  const {
    isConnected,
    isConnecting,
    wallet,
    error: walletError,
    connect,
    disconnect,
    refreshBalance,
    clearError,
  } = useWallet();

  const {
    payments,
    balance,
    isLoading,
    error: contractError,
    txStep,
    txHash,
    txError,
    send,
    refresh,
    addPayment,
    resetTxState,
  } = useContract(wallet?.address ?? null);

  useEventListener(addPayment);

  const isTxPending = ['WAITING_SIGNATURE', 'SIGNING', 'SUBMITTING', 'PENDING'].includes(txStep);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Stellar Pay
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Send XLM Payments
            </p>
          </div>
          <div className="flex items-center gap-2">
            {COUNTER_CONTRACT_ADDRESS && (
              <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400 sm:inline-block">
                {COUNTER_CONTRACT_ADDRESS.slice(0, 8)}...{COUNTER_CONTRACT_ADDRESS.slice(-4)}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {walletError && (
          <div className="mb-6">
            <ErrorBanner
              message={walletError}
              onDismiss={clearError}
              onRetry={connect}
            />
          </div>
        )}

        {contractError && !isConnected && (
          <div className="mb-6">
            <ErrorBanner message={contractError} />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Wallet
              </h2>

              {isConnected && wallet ? (
                <WalletInfo wallet={wallet} />
              ) : null}

              <div className={isConnected && wallet ? 'mt-4' : ''}>
                <WalletSelector
                  onConnect={connect}
                  onDisconnect={disconnect}
                  isConnected={isConnected}
                  isConnecting={isConnecting}
                />
              </div>
            </div>

            {isConnected && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Send XLM
                </h2>
                <SendForm
                  onSend={send}
                  isTxPending={isTxPending}
                  balance={balance}
                />
                <div className="mt-4">
                  <button
                    onClick={refreshBalance}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    Refresh Balance
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-2">
            {!isConnected ? (
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-gray-400 dark:text-gray-500">
                  Connect a wallet to send payments
                </p>
              </div>
            ) : (
              <>
                <TransactionStatusCard
                  step={txStep}
                  hash={txHash}
                  error={txError}
                  onRetry={txError ? refresh : undefined}
                  onDismiss={resetTxState}
                />

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Transactions
                  </h2>
                  <TransactionFeed
                    payments={payments}
                    isLoading={isLoading}
                    walletAddress={wallet?.address ?? null}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-gray-400 dark:text-gray-500">
          Built with Stellar Soroban • React • TypeScript
        </div>
      </footer>
    </div>
  );
}
