const TIMELINE_POINTS = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

function shortMonth(date: Date, withYear: boolean) {
  const month = date
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  return withYear ? `${month}/${String(date.getFullYear()).slice(2)}` : month;
}

export function buildTimeline(dates: Date[], days: number, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (days > 0) start.setDate(start.getDate() - days);
  else {
    const earliest = Math.min(...dates.map((date) => date.getTime()));
    if (Number.isFinite(earliest) && earliest < start.getTime())
      start.setTime(earliest);
    else start.setMonth(start.getMonth() - TIMELINE_POINTS);
    start.setHours(0, 0, 0, 0);
  }
  const span = Math.max(now.getTime() - start.getTime(), DAY_MS);
  const step = span / TIMELINE_POINTS;
  const spanDays = span / DAY_MS;
  const counts = Array.from({ length: TIMELINE_POINTS }, () => 0);
  dates.forEach((date) => {
    const offset = date.getTime() - start.getTime();
    if (offset < 0 || date > now) return;
    counts[Math.min(TIMELINE_POINTS - 1, Math.floor(offset / step))] += 1;
  });
  return counts.map((count, index) => {
    const bucketStart = new Date(start.getTime() + step * index);
    return {
      label:
        spanDays <= 120
          ? bucketStart.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            })
          : shortMonth(bucketStart, spanDays > 366),
      count,
    };
  });
}
