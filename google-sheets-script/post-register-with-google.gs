function registerWithGoogle(request) {
  const clientId = request.clientId;
  const credential = request.credential;

  if (!clientId || !credential) {
    throw new Error("error_invalid_request");
  }

  const tokenInfo = verifyGoogleToken(credential, clientId);

  const userData = tokenInfo.payload;

  const userRecord = createUserRecord(userData);

  insertUser(userRecord);

  const jwt = createJWT({ sub: userRecord.uuid });

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: { jwt }
  })).setMimeType(ContentService.MimeType.JSON);
}



function createUserRecord(googleUserData) {
  const now = new Date();
  const uuid = Utilities.getUuid();

  return {
    uuid: uuid,
    name: googleUserData.given_name || '',
    surname: googleUserData.family_name || '',
    nick: '',
    rol: 'EMPLOYEE',
    email: googleUserData.email,
    password: '',
    google_id: googleUserData.sub,
    status: 'PENDING',
    login_method: 'GOOGLE',
    created_at: now,
    updated_at: now,
    last_login: now
  };
}