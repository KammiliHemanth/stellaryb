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
    const start = parseInt(event.queryStringParameters?.start || '1', 10);
    const limit = parseInt(event.queryStringParameters?.limit || '20', 10);

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
      .addOperation(
        contract.call(
          'recent_txs',
          nativeToScVal(start, { type: 'u32' }),
          nativeToScVal(limit, { type: 'u32' })
        )
      )
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(tx);

    if (!rpc.Api.isSimulationSuccess(simulation)) {
      throw new Error(simulation.error || 'Simulation failed');
    }

    const raw = simulation.result?.retval
      ? scValToNative(simulation.result.retval)
      : [];

    const payments = Array.isArray(raw)
      ? raw.map((item) => ({
          id: Number(item.id),
          sender: String(item.sender),
          recipient: String(item.recipient),
          amount: Number(item.amount),
          memo: String(item.memo),
          timestamp: Number(item.timestamp),
        }))
      : [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ payments }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
