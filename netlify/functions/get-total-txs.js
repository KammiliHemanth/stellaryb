const {
  Contract,
  Account,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  rpc,
} = require('@stellar/stellar-sdk');

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const CONTRACT_ID = process.env.VITE_CONTRACT_ADDRESS || '';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (!CONTRACT_ID) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Contract ID not configured' }),
    };
  }

  try {
    const server = new rpc.Server(RPC_URL);
    const source = new Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      '0'
    );

    const contract = new Contract(CONTRACT_ID);
    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('total_txs'))
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(tx);

    if (!rpc.Api.isSimulationSuccess(simulation)) {
      throw new Error(simulation.error || 'Simulation failed');
    }

    const total = simulation.result?.retval
      ? Number(scValToNative(simulation.result.retval))
      : 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ total }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
