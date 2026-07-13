import {
  Contract,
  Account,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  xdr,
  rpc,
} from '@stellar/stellar-sdk';
import { STELLAR_TESTNET_PASSPHRASE } from '../utils/constants.ts';

let server: rpc.Server | null = null;

export function getServer(): rpc.Server {
  if (!server) {
    server = new rpc.Server('https://soroban-testnet.stellar.org', {
      allowHttp: false,
    });
  }
  return server;
}

export async function getAccount(address: string): Promise<Account> {
  const srv = getServer();
  const account = await srv.getAccount(address);
  return account;
}

export async function simulateContractCall(
  contractAddress: string,
  method: string,
  args: xdr.ScVal[]
): Promise<rpc.Api.SimulateTransactionResponse> {
  const srv = getServer();
  const sourceAccount = await srv.getAccount(
    'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'
  );

  const contract = new Contract(contractAddress);
  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_TESTNET_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulation = await srv.simulateTransaction(tx);
  return simulation;
}

export async function readContractValue<T>(
  contractAddress: string,
  method: string,
  args: xdr.ScVal[] = []
): Promise<T> {
  const simulation = await simulateContractCall(contractAddress, method, args);

  if (!rpc.Api.isSimulationSuccess(simulation)) {
    throw new Error(`Contract simulation failed: ${String(simulation.error)}`);
  }

  const result = simulation.result;
  if (!result || !result.retval) {
    throw new Error('No result returned from contract simulation');
  }

  return scValToNative(result.retval) as T;
}

export async function submitContractTransaction(
  sourceAddress: string,
  contractAddress: string,
  method: string,
  args: xdr.ScVal[]
): Promise<string> {
  const srv = getServer();
  const account = await srv.getAccount(sourceAddress);

  const contract = new Contract(contractAddress);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_TESTNET_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulateResponse = await srv.simulateTransaction(tx);

  if (!rpc.Api.isSimulationSuccess(simulateResponse)) {
    throw new Error(
      `Simulation failed: ${String(simulateResponse.error)}`
    );
  }

  const footprint = rpc.assembleTransaction(tx, simulateResponse);
  const preparedTx = footprint.build();

  return preparedTx.toXDR();
}

export async function sendTransaction(
  signedXdr: string
): Promise<{ hash: string; status: string }> {
  const srv = getServer();
  const tx = TransactionBuilder.fromXDR(signedXdr, STELLAR_TESTNET_PASSPHRASE);
  const response = await srv.sendTransaction(tx);

  if (response.status === 'PENDING' || response.status === 'DUPLICATE') {
    const hash = response.hash;
    const result = await srv.getTransaction(hash);

    if (result.status === 'NOT_FOUND') {
      return { hash, status: 'PENDING' };
    }

    return { hash, status: result.status };
  }

  const errorMsg = response.errorResult
    ? `Transaction failed (code: ${response.errorResult.result().switch()})`
    : 'Unknown error';

  throw new Error(`Transaction submission failed: ${errorMsg}`);
}

export async function pollTransactionStatus(
  hash: string,
  timeoutMs = 30000
): Promise<rpc.Api.GetTransactionResponse> {
  const srv = getServer();
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const result = await srv.getTransaction(hash);

    if (result.status !== 'NOT_FOUND') {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Transaction timed out');
}
