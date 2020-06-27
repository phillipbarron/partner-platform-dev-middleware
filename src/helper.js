const partnerPlatform = require('@bbc/partner-platform-bbclogin-id-token-generator');
const config = require('./config');
const forEachSerial = require('../helpers/for-each-serial');

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

const fetchTokens = async ({prefix, hostname}, { username, password, totpKey}) => {
  const env = config.partnerPlatformEnvironment;
  const applicationLoginClientIdEnvironmentKey = `${prefix}_LOGIN_CLIENT_ID_${env.toUpperCase()}`;
  const applicationLoginClientSecretEnvironmentKey = `${prefix}_LOGIN_CLIENT_SECRET_${env.toUpperCase()}`;
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

const generateUserTokensMap = async (userCredentials, { isSecondUser = false }) => {
  const isBehindPartnerPlatform = ({hostname}) => hostname.match(/^https:/);
  const hostsToLogin = [
    { name: 'OPTIMO', hostname: isSecondUser ? config.hostnames_secondUserOptimoClient : config.hostnames_optimoClient },
    { name: 'AV', hostname: config.hostnames_AVActivity },
    { name: 'IMAGE', hostname: config.hostnames_imageUploadActivity },
    { name: 'PASSPORT', hostname: config.hostnames_passportControlActivity },
  ].filter(isBehindPartnerPlatform);

  const hostnameToTokensMap = {};
  await forEachSerial(hostsToLogin, async ({ name, hostname}) => {
    /*
     Don't try refactor to make requests in parallel - Partner Platform auth fails with 401 'MFA failed' when it has
     multiple requests in-flight.
     */
    hostnameToTokensMap[hostname] = await fetchTokens({ prefix: name, hostname }, userCredentials)
  });
  return hostnameToTokensMap
};

exports.generateLoginCookies = () => {
  const partnerPlatformHostTokens = JSON.parse(process.env.PARTNER_PLATFORM_TOKENS_USER_1);
  return convertTokenToCookie(partnerPlatformHostTokens);
};

exports.generateLoginCookiesAlternativeUser = () => {
  const partnerPlatformHostTokens = JSON.parse(process.env.PARTNER_PLATFORM_TOKENS_USER_2);
  return convertTokenToCookie(partnerPlatformHostTokens);
};

exports.generateUserLoginTokens = async (userCredentials1, userCredentials2) => {
  process.env.PARTNER_PLATFORM_TOKENS_USER_1 = JSON.stringify(await generateUserTokensMap(userCredentials1, {}));
  process.env.PARTNER_PLATFORM_TOKENS_USER_2 = JSON.stringify(await generateUserTokensMap(userCredentials2, { isSecondUser: true }));
};


