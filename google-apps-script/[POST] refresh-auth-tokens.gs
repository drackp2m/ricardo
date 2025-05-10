function refreshAuthTokens({ refreshToken }) {
  checkMissingParameters({ refreshToken })

  const { sub } = verifyJWT(refreshToken);

  const user = findUserBy('uuid', sub);

  if (user.status !== 'ACTIVE') {
    throw new Error(`error_invalid_status.user`);
  }

  const data = createAuthTokens(sub);

  return jsonResponse(data);
}
