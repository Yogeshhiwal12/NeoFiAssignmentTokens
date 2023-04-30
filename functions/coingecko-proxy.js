const axios = require("axios");

exports.handler = async function (event, context) {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: event.queryStringParameters,
    });
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("Failed to fetch CoinGecko data:", error);
    return {
      statusCode: error.response.status || 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
