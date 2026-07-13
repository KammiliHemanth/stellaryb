const HORIZON_URL = 'https://horizon-testnet.stellar.org';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    const address = event.queryStringParameters?.address || '';

    if (!address) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing address parameter' }),
      };
    }

    const response = await fetch(`${HORIZON_URL}/accounts/${address}`);
    if (!response.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ balance: '0' }),
      };
    }

    const data = await response.json();
    const native = data.balances?.find(
      (b) => b.asset_type === 'native'
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ balance: native?.balance || '0' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
