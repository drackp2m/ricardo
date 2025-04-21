function handleGet(e) {
  var action = e.parameter.action || '';

  switch (action) {
    case 'ping':
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: 'pong' })
      ).setMimeType(ContentService.MimeType.JSON);
    default:
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: `Acción "[GET] ${action}" desconocida` })
      ).setMimeType(ContentService.MimeType.JSON);
  }
}
