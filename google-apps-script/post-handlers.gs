function handlePost({ parameter }) {
  const action = parameter.action || 'unknown';

  const notNeededTokenActions = ['register', 'login', 'loginWithGoogle', 'refreshAuthTokens'];

  try {
    if (notNeededTokenActions.includes(action) === false) {
      if (!parameter.authToken) {
        throw new Error(`error_required_parameter.authToken`);
      }

      const { sub } = verifyJWT(parameter.authToken);

      delete parameter.authToken;

      parameter.userUuid = sub;

      const user = findUserBy('uuid', sub);

      if (user.status !== 'ACTIVE') {
        throw new Error(`error_invalid_status.user`);
      }
    }

    switch (action) {
      case 'register':
        return register(parameter);
      case 'login':
        return postLogin(parameter);
      case 'loginWithGoogle':
        return loginWithGoogle(parameter);
      case 'refreshAuthTokens':
        return refreshAuthTokens(parameter);
      case 'getUserData':
        return getUserData(parameter);
      case 'registerEntry':
        return postRegisterEntry(parameter);
      case 'getEntriesBetweenDates':
        return getEntriesBetweenDates(parameter);
      default:
        throw new Error(`error_action_not_exists.${action}`);
    }
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
