function handlePost({ parameter }) {
  var action = parameter.action || '';

  if (action !== 'registerWithGoogle') {
    if (!parameter.jwt) {
        throw new Error(`error_required_parameter.jwt`);
    }

    const { sub } = verifyJWT(parameter.jwt);

    delete parameter.jwt;

    parameter.userUuid = sub;

    const user = findUserBy('uuid', sub);

    if (user.status !== 'ACTIVE') {
        throw new Error(`error_invalid_status.user`);
    }
  }

  try {
    switch (action) {
      case 'registerWithGoogle':
        return registerWithGoogle(parameter);
      case 'login':
        return postLogin(parameter);
      case 'registerEntry':
        return postRegisterEntry(parameter);
      case 'getEntriesBetweenDates':
        return getEntriesBetweenDates(parameter);
      default:
        throw new Error(`error_action_not_exists.${action}`);
    }
  } catch (error) {

    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
