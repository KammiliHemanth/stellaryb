export function isTestnetNetwork(networkPassphrase: string): boolean {
  return networkPassphrase === 'Test SDF Network ; September 2015';
}

export function getNetworkName(networkPassphrase: string): string {
  switch (networkPassphrase) {
    case 'Test SDF Network ; September 2015':
      return 'Testnet';
    case 'Public Global Stellar Network ; September 2015':
      return 'Mainnet';
    default:
      return 'Unknown';
  }
}

export function handleWalletError(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('not installed') || message.includes('not found')) {
    return 'Wallet not detected. Please install the selected wallet.';
  }

  if (message.includes('cancelled') || message.includes('cancel') || message.includes('rejected')) {
    return 'Connection cancelled by user.';
  }

  if (message.includes('timeout') || message.includes('timed out')) {
    return 'Transaction timed out. Please try again.';
  }

  if (message.includes('insufficient') || message.includes('low balance')) {
    return 'Insufficient XLM balance. Need at least 1 XLM.';
  }

  return message;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
