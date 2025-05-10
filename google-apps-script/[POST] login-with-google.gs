function loginWithGoogle({ clientId, credential }) {
  checkMissingParameters({ clientId, credential });

  const tokenInfo = verifyGoogleToken(credential, clientId);

  const userData = tokenInfo.payload;

  let user = null;

  try {
    user = findUserBy('email', userData.email);


    if (user.google_id === '') {
      updateUser(user.uuid, { google_id: userData.sub, login_method: 'GOOGLE' });
    }
  } catch ({ message }) {
    if (message !== 'error_not_found.user') {
      throw new Error(message);
    }

    user = createUserRecord(userData);

    insertUser(user);
  }

  const { authToken, refreshToken } = createAuthTokens(user.uuid);

  return jsonResponse({ authToken, refreshToken });
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