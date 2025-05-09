function refreshAuthTokens(request) {

  if (!request.refreshToken) {
    throw new Error(`error_required_parameter.refreshToken`);
  }

  const { sub } = verifyJWT(request.refreshToken);

  const user = findUserBy('uuid', sub);

  if (user.status !== 'ACTIVE') {
    throw new Error(`error_invalid_status.user`);
  }

  const { authToken, refreshToken } = createAuthTokens(sub);

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, data: { authToken, refreshToken } })
  ).setMimeType(ContentService.MimeType.JSON);
}
