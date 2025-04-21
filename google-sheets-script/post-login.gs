function postLogin(e) {
  var userUuid = e.parameter.userUuid;

  if (!userUuid) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Missing UUID' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][3] == userUuid) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          name: data[i][0],
          surname: data[i][1],
          uuid: data[i][3]
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify({ success: false, error: 'UUID not found' })
  ).setMimeType(ContentService.MimeType.JSON);
}
