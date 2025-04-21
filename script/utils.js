export const getWeekDays = (weekOffset = 0, toTodayOnly = false) => {
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1 - weekOffset * 7);

  let lastDay;

  if (weekOffset === 0 && toTodayOnly) {
    lastDay = new Date(today);
  } else {
    lastDay = new Date(monday);
    lastDay.setDate(monday.getDate() + 6);
  }
  
  const format = (date) =>
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0');

  const firstDayStr = format(monday);
  const lastDayStr = format(lastDay);

  return {
    from: firstDayStr,
    to: lastDayStr,
  }
};
