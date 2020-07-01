const tokenFetcher = require('./src/token-fetcher');

const testGetToken = async () => {
  const token = await tokenFetcher.getToken();
  console.log({ token });
}

testGetToken();