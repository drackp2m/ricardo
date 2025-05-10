function getUserData({ userUuid }) {
  const user = findUserBy('uuid', userUuid);

  const data = filterUserSensibleData(user);

  return jsonResponse(data);
}
