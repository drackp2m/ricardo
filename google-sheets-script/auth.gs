function hashPassword(password) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const salt = scriptProperties.getProperty('PASSWORD_SALT');


  const saltedPassword = password + salt;
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    saltedPassword,
    Utilities.Charset.UTF_8
  );

  return hash.map(function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function verifyPassword(password, storedHash) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const salt = scriptProperties.getProperty('PASSWORD_SALT');

  const hash = hashPassword(password, salt);
  return hash === storedHash;
}

function createJWT(payload, issuedAt = 0, expirationHours = 48) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const secretKey = scriptProperties.getProperty('JWT_SECRET_KEY');

  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const now = new Date();
  payload.iat = Math.floor(now.getTime() / 1000) + (issuedAt * 60 * 60);
  payload.exp = Math.floor(now.getTime() / 1000) + (expirationHours * 60 * 60);

  const encodedHeader = Utilities.base64EncodeWebSafe(JSON.stringify(header)).replace(/=+$/, '');
  const encodedPayload = Utilities.base64EncodeWebSafe(JSON.stringify(payload)).replace(/=+$/, '');

  const signatureInput = encodedHeader + "." + encodedPayload;
  const signature = Utilities.computeHmacSha256Signature(signatureInput, secretKey);
  const encodedSignature = Utilities.base64EncodeWebSafe(signature).replace(/=+$/, '');

  return encodedHeader + "." + encodedPayload + "." + encodedSignature;
}

function verifyJWT(token) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const secretKey = scriptProperties.getProperty('JWT_SECRET_KEY');

  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("error_invalid_format.jwt");
  }

  function addPadding(base64) {
    switch (base64.length % 4) {
      case 0: return base64;
      case 2: return base64 + "==";
      case 3: return base64 + "=";
      default: return base64;
    }
  }

  const paddedPayload = addPadding(parts[1]);

  const payload = JSON.parse(Utilities.newBlob(
    Utilities.base64DecodeWebSafe(paddedPayload)).getDataAsString());

  const now = Math.floor(new Date().getTime() / 1000);

  if (payload.exp < now) {
    throw new Error("error_expired.jwt");
  }

  const signatureInput = parts[0] + "." + parts[1];
  const signature = Utilities.computeHmacSha256Signature(signatureInput, secretKey);
  const encodedSignature = Utilities.base64EncodeWebSafe(signature).replace(/=+$/, '');

  if (encodedSignature !== parts[2]) {
    throw new Error("error_invalid_signature.jwt");
  }

  return payload;
}

function createAuthTokens(sub) {
  const authToken = createJWT({ sub }, 0, 0.015);
  const refreshToken = createJWT({ sub }, 0.015, 0.15);

  return { authToken, refreshToken };
}