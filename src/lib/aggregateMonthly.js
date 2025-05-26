import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

/**
 * Aggregates an array of news objects by month (YYYY-MM) based on their "Publish Date".
 *
 * @param {Array} newsData - Array of news documents, each with a "Publish Date" field.
 * @returns {Array<{ label: string, value: number }>} Aggregated monthly data.
 */
export function aggregateMonthly(newsData = []) {
  const monthCounts = {};

  for (const item of newsData) {
    const rawDate = item["Publish Date"];
    if (!rawDate) continue;

    const parsed = dayjs(rawDate, [
      "ddd, D MMM YYYY HH:mm:ss Z",
      "ddd, DD MMM YYYY HH:mm:ss Z",
      "YYYY-MM-DD",
      "MMM D, YYYY",
      "D MMM YYYY",
      dayjs.ISO_8601,
    ]);

    if (!parsed.isValid()) continue;

    const monthLabel = parsed.format("YYYY-MM");

    monthCounts[monthLabel] = (monthCounts[monthLabel] || 0) + 1;
  }

  return Object.keys(monthCounts)
    .sort()
    .map((label) => ({
      label,
      value: monthCounts[label],
    }));
}
