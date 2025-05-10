function register({ name, surname, email, passowrd }) {
  checkMissingParameters({ name, surname, email, passowrd })
  
  try {
    findUserBy('email', userData.email);
    
    throw new Error('error_already_exists.email');
  } catch (error) {
    if (error.message !== 'error_not_found.user') {
      throw error;
    }
  }
  
  const now = new Date().toISOString();
  
  const newUser = {
    uuid: Utilities.getUuid(),
    name,
    surname,
    nick: '',
    rol: 'EMPLOYEE',
    email: email,
    password: hashPassword(password),
    google_id: '',
    status: 'VALIDATING',
    login_method: 'PASSWORD',
    created_at: now,
    updated_at: now,
    last_login: now,
  };
  
  insertUser(newUser);

  code = generateRandomCode();

  sendMailjetEmail(email, `${name} ${surname}`, code);

  const tokens = createAuthTokens(newUser.uuid);
  
  return jsonResponse(tokens)
}