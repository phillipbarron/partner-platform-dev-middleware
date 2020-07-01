const tokenFetcher = require('./token-fetcher');

const ppDevAuthMiddleware = async () => {
  let PP_JWT;
  if (process.env.ENVIRONMENT === 'dev') {
    console.log('***************************************** WE ARE IN THE DEV ENVIRONMENT SO FETCHING AND EXPORTING A JSON WEB TOKEN *************************************************');
    PP_JWT = await tokenFetcher.getToken();
  }
  return (req, res, next) => {
    if (process.env.ENVIRONMENT === 'dev') {
      console.log('***************************************** appending dev header *************************************************');
      req.headers.authorization = `Bearer ${PP_JWT}`;
    }
    next();
  };
};

export default ppDevAuthMiddleware;
