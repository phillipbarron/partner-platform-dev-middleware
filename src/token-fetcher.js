const secretService = require("@bbc/cps-mi6");
const partnerPlatform = require("@bbc/partner-platform-bbclogin-id-token-generator");

const fetchToken = async ({ hostname }, { username, password, totpKey }) => {
  await secretService.exportSecrets("optimo_e2e_tests_secrets");
  const clientId = process.env["OPTIMO_LOGIN_CLIENT_ID_INT"];
  const clientSecret = process.env['OPTIMO_LOGIN_CLIENT_SECRET_INT'];

  try {
    const { id_token } = await partnerPlatform.createTokens({
      clientId,
      clientSecret,
      caPath: process.env.COSMOS_CA || "/etc/pki/tls/certs/ca-bundle.crt",
      certPath: process.env.COSMOS_CERT || "/etc/pki/tls/certs/client.crt",
      keyPath: process.env.COSMOS_CERT_KEY || "/etc/pki/tls/private/client.key",
      username,
      password,
      totpKey,
      redirectURI: `${hostname}/_ppap/auth/bbclogin`,
      acr_values: `low-${clientId}`,
      environment: "live",
    });

    return id_token;
  } catch (error) {
    console.log("failed to generate login token", error);
    throw Error(error);
  }
};

exports.getToken = async () => {
  return await fetchToken(
    { hostname: `https://optimo.int.tools.bbc.co.uk` },
    {
      username: process.env.E2E_TEST_USERNAME,
      password: process.env.E2E_TEST_PASSWORD,
      totpKey: process.env.E2E_TEST_ONE_TIME_PASSWORD_KEY,
    }
  );
};
