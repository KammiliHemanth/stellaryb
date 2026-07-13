import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { STELLAR_TESTNET_PASSPHRASE } from '../utils/constants.ts';

let isInitialized = false;

export function initStellarKit(): void {
  if (isInitialized) return;

  const freighter = new FreighterModule();
  const albedo = new AlbedoModule();
  const xbull = new xBullModule();

  StellarWalletsKit.init({
    modules: [freighter, albedo, xbull],
    network: Networks.TESTNET,
  });

  isInitialized = true;
}

export function getNetworkPassphrase(): string {
  return STELLAR_TESTNET_PASSPHRASE;
}
