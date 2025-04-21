function handlePost(e) {
  var action = e.parameter.action || '';

  switch (action) {
    case 'login':
      return postLogin(e);
    case 'registerEntry':
      return postRegisterEntry(e);
    default:
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: `Acción "[POST] ${action}" desconocida` })
      ).setMimeType(ContentService.MimeType.JSON);
  }
}
