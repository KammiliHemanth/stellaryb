export function shortenAddress(address: string, chars = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTimestamp(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export function formatBalance(balance: string): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';
  return num.toFixed(2);
}

export function truncateEventAddress(address: string): string {
  return shortenAddress(address, 4);
}
