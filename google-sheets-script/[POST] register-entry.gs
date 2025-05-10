function postRegisterEntry({ userUuid, date, entryTime, exitTime }) {
  checkMissingParameters({ date, entryTime, exitTime })

  const { nick } = findUserBy('uuid', userUuid);

  if (nick === undefined) {
    throw new Error(`error_not_found.user`);
  }

  var dateObj = new Date(date);

  if (isNaN(dateObj)) {
    throw new Error(`error_invalid_format.date`);
  }

  var year = dateObj.getFullYear();
  var month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  var day = dateObj.getDate();

  var sheet = ensureUserMonthSheet(year, month, nick);

  insertInOut(sheet, day, entryTime, exitTime);

  return jsonResponse();
}