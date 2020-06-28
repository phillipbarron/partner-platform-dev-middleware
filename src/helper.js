const partnerPlatform = require('@bbc/partner-platform-bbclogin-id-token-generator');
const config = require('./config');

const convertTokenToCookie = partnerPlatformHostTokens => Object
  .entries(partnerPlatformHostTokens)
  .map(([hostname, tokens]) => ({
    hostname,
    idToken: {
      name: 'ckns_pp_id',
      value: tokens.idToken,
      domain: hostname.replace(/https?\:\/\//, ''),
    },
    accessToken: {
      name: 'ckns_pp_session',
      value: tokens.accessToken,
      domain: hostname.replace(/https?\:\/\//, ''),
    },
  }));

const fetchToken = async ({hostname}, { username, password, totpKey}) => {
  const env = config.partnerPlatformEnvironment;
  const applicationLoginClientIdEnvironmentKey = `OPTIMO_LOGIN_CLIENT_ID_${env.toUpperCase()}`;
  const applicationLoginClientSecretEnvironmentKey = `OPTIMO_LOGIN_CLIENT_SECRET_${env.toUpperCase()}`;
  const clientId = process.env[applicationLoginClientIdEnvironmentKey];
  const clientSecret = process.env[applicationLoginClientSecretEnvironmentKey];

  try {
    const { id_token, access_token } = await partnerPlatform.createTokens({
      clientId,
      clientSecret,
      caPath: process.env.COSMOS_CA || '/etc/pki/tls/certs/ca-bundle.crt',
      certPath: process.env.COSMOS_CERT || '/etc/pki/tls/certs/client.crt',
      keyPath: process.env.COSMOS_CERT_KEY || '/etc/pki/tls/private/client.key',
      username,
      password,
      totpKey,
      redirectURI: `${hostname}/_ppap/auth/bbclogin`,
      acr_values: `low-${clientId}`,
      environment: 'live',
    });
    return {
      idToken: id_token,
      accessToken: access_token,
    }
  } catch (error) {
    console.log('failed to generate login token', error);
    throw Error(error);
  }
};


exports.generateLoginCookies = async () => {
    const partnerPlatformToken = await fetchToken(
        { hostname: "https://optimo.int.tools.bbc.co.uk" },
        { 
            username: process.env.E2E_TEST_USERNAME,
            password: process.env.E2E_TEST_PASSWORD,
            totpKey:  process.env.E2E_TEST_ONE_TIME_PASSWORD_KEY
        }
    );
    return convertTokenToCookie(partnerPlatformToken);
};
