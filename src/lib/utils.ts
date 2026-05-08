import { format, subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function today(): string {
  return toDateString(new Date());
}

export function daysAgo(n: number): string {
  return toDateString(subDays(new Date(), n));
}

export type PeriodPreset = "week" | "month" | "30days" | "90days";

export function getPeriod(preset: PeriodPreset): { start: string; end: string } {
  const now = new Date();
  switch (preset) {
    case "week":
      return { start: toDateString(startOfWeek(now, { weekStartsOn: 1 })), end: toDateString(endOfWeek(now, { weekStartsOn: 1 })) };
    case "month":
      return { start: toDateString(startOfMonth(now)), end: toDateString(endOfMonth(now)) };
    case "30days":
      return { start: daysAgo(29), end: today() };
    case "90days":
      return { start: daysAgo(89), end: today() };
  }
}

export function getPriorPeriod(preset: PeriodPreset): { start: string; end: string } {
  const now = new Date();
  switch (preset) {
    case "week": {
      const lastWeek = subDays(now, 7);
      return { start: toDateString(startOfWeek(lastWeek, { weekStartsOn: 1 })), end: toDateString(endOfWeek(lastWeek, { weekStartsOn: 1 })) };
    }
    case "month": {
      const lastMonth = subMonths(now, 1);
      return { start: toDateString(startOfMonth(lastMonth)), end: toDateString(endOfMonth(lastMonth)) };
    }
    case "30days":
      return { start: daysAgo(59), end: daysAgo(30) };
    case "90days":
      return { start: daysAgo(179), end: daysAgo(90) };
  }
}


export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
