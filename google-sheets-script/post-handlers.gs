function handlePost({ parameter }) {
  const action = parameter.action || 'unknown';

  const notNeedTokenActions = ['registerWithGoogle', 'refreshAuthTokens'];

  try {
    if (notNeedTokenActions.includes(action) === false) {
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
      case 'registerWithGoogle':
        return registerWithGoogle(parameter);
      case 'login':
        return postLogin(parameter);
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
