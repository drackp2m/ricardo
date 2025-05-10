function postLogin(request) {
  var userUuid = request.userUuid;

  if (!userUuid) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Missing UUID' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][3] == userUuid) {
      return jsonResponse({ name: data[i][0], surname: data[i][1] });
    }
  }
}
