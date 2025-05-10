function handleGet({ parameter }) {
  var action = parameter.action || 'unknown';

  try {
    switch (action) {
      case 'ping':
        return jsonResponse({ data: 'pong' })
      default:
        throw new Error(`error_action_not_exists.${action}`);
    }
  } catch (error) {

    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
