function getUserData(request) {
  try {
    const data = findUserBy('uuid', request.userUuid);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, data })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
