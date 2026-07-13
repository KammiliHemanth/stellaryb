import { StellarWalletsKit, Networks, KitEventType } from '@creit.tech/stellar-wallets-kit';
import { initStellarKit } from './stellar.ts';
import type { WalletInfo } from '../types/wallet.ts';
import {
  STELLAR_TESTNET_HORIZON,
  REQUIRED_XLM_BALANCE,
} from '../utils/constants.ts';
import { handleWalletError } from '../utils/helpers.ts';
import { getNetworkName } from '../utils/helpers.ts';

export async function connectWallet(): Promise<WalletInfo> {
  initStellarKit();

  try {
    StellarWalletsKit.setNetwork(Networks.TESTNET);

    const { address } = await StellarWalletsKit.authModal();

    const networkInfo = await StellarWalletsKit.getNetwork();

    if (networkInfo.networkPassphrase !== Networks.TESTNET) {
      throw new Error(
        'Please switch to Stellar Testnet. Current network: ' +
          getNetworkName(networkInfo.networkPassphrase)
      );
    }

    const walletName = StellarWalletsKit.selectedModule?.productName ?? 'Wallet';

    const balance = await fetchBalance(address);

    if (parseFloat(balance) < REQUIRED_XLM_BALANCE) {
      throw new Error(
        `Insufficient XLM balance (${balance} XLM). Need at least ${REQUIRED_XLM_BALANCE} XLM.`
      );
    }

    return {
      address,
      walletName,
      network: getNetworkName(networkInfo.networkPassphrase),
      networkPassphrase: networkInfo.networkPassphrase,
      balance,
    };
  } catch (error) {
    throw new Error(handleWalletError(error));
  }
}

export async function disconnectWallet(): Promise<void> {
  initStellarKit();
  await StellarWalletsKit.disconnect();
}

export async function signTransaction(xdr: string): Promise<string> {
  try {
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
      networkPassphrase: Networks.TESTNET,
    });
    return signedTxXdr;
  } catch (error) {
    throw new Error(handleWalletError(error));
  }
}

export async function fetchBalance(address: string): Promise<string> {
  try {
    const response = await fetch(
      `${STELLAR_TESTNET_HORIZON}/accounts/${address}`
    );
    if (!response.ok) return '0';

    const data = await response.json();
    const nativeBalance = data.balances?.find(
      (b: { asset_type: string }) => b.asset_type === 'native'
    );

    return nativeBalance?.balance || '0';
  } catch {
    return '0';
  }
}

export function subscribeToWalletChanges(
  onAddressChange: (address: string) => void,
  onDisconnect: () => void
): () => void {
  initStellarKit();

  const unsub1 = StellarWalletsKit.on(
    KitEventType.STATE_UPDATED,
    (event) => {
      if (event.payload.address) {
        onAddressChange(event.payload.address);
      }
    }
  );

  const unsub2 = StellarWalletsKit.on(
    KitEventType.DISCONNECT,
    () => {
      onDisconnect();
    }
  );

  return () => {
    unsub1();
    unsub2();
  };
}
