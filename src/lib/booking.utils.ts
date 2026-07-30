export function buildOverlapFilter(start: Date, end: Date) {
  return {
    AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
  };
}
