export function getDateRange(query: { from?: unknown; to?: unknown }) {
  const from = typeof query.from === "string" ? new Date(query.from) : undefined;
  const to = typeof query.to === "string" ? new Date(query.to) : undefined;

  return {
    gte: from && !Number.isNaN(from.getTime()) ? from : undefined,
    lte: to && !Number.isNaN(to.getTime()) ? to : undefined,
  };
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
