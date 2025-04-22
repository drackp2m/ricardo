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

export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNum;
}