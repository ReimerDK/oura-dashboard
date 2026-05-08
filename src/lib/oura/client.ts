import { prisma } from "@/lib/prisma";
import type {
  DailyActivity,
  DailyReadiness,
  DailySleep,
  DailySpO2,
  HeartRateSample,
  OuraPagedResponse,
  SleepPeriod,
  Workout,
} from "./types";

const BASE_URL = "https://api.ouraring.com/v2/usercollection";

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const refreshLocks = new Map<string, Promise<string>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data as T;
  return null;
}

function setCached(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export class OuraClient {
  private userId: string;
  private accessToken: string | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const account = await prisma.account.findFirst({
      where: { userId: this.userId, provider: "oura" },
    });

    if (!account?.access_token) throw new Error("No Oura token for user");

    const fiveMinutes = 5 * 60;
    if (account.expires_at && account.expires_at < Date.now() / 1000 + fiveMinutes) {
      return this.refreshToken(account.refresh_token!);
    }

    this.accessToken = account.access_token!;
    return this.accessToken;
  }

  private async refreshToken(refreshToken: string): Promise<string> {
    // Deduplicate concurrent refresh calls for the same user
    const existing = refreshLocks.get(this.userId);
    if (existing) return existing;

    const promise = (async () => {
      const res = await fetch("https://api.ouraring.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.OURA_CLIENT_ID!,
          client_secret: process.env.OURA_CLIENT_SECRET!,
        }),
      });

      if (!res.ok) throw new Error("Failed to refresh Oura token");

      const data = await res.json();

      await prisma.account.updateMany({
        where: { userId: this.userId, provider: "oura" },
        data: {
          access_token: data.access_token,
          refresh_token: data.refresh_token ?? refreshToken,
          expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
        },
      });

      this.accessToken = data.access_token;
      return this.accessToken!;
    })();

    refreshLocks.set(this.userId, promise);
    try {
      return await promise;
    } finally {
      refreshLocks.delete(this.userId);
    }
  }

  private async fetchAll<T>(endpoint: string, params: Record<string, string>, retried = false): Promise<T[]> {
    const token = await this.getToken();
    const results: T[] = [];
    let nextToken: string | undefined;

    do {
      const searchParams = new URLSearchParams({ ...params, ...(nextToken ? { next_token: nextToken } : {}) });
      const url = `${BASE_URL}/${endpoint}?${searchParams}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        if (retried) throw new Error("Oura token invalid after refresh");
        const account = await prisma.account.findFirst({
          where: { userId: this.userId, provider: "oura" },
        });
        if (!account?.refresh_token) throw new Error("Unauthorized and no refresh token");
        this.accessToken = null;
        await this.refreshToken(account.refresh_token);
        return this.fetchAll<T>(endpoint, params, true);
      }

      if (!res.ok) throw new Error(`Oura API error: ${res.status} ${endpoint}`);

      const json: OuraPagedResponse<T> = await res.json();
      results.push(...json.data);
      nextToken = json.next_token;
    } while (nextToken);

    return results;
  }

  private cacheKey(method: string, start: string, end: string) {
    return `${this.userId}:${method}:${start}:${end}`;
  }

  private isToday(end: string) {
    return end >= new Date().toISOString().slice(0, 10);
  }

  private ttl(end: string) {
    return this.isToday(end) ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000;
  }

  async getDailySleep(startDate: string, endDate: string): Promise<DailySleep[]> {
    const key = this.cacheKey("daily_sleep", startDate, endDate);
    const cached = getCached<DailySleep[]>(key);
    if (cached) return cached;
    const data = await this.fetchAll<DailySleep>("daily_sleep", { start_date: startDate, end_date: endDate });
    setCached(key, data, this.ttl(endDate));
    return data;
  }

  async getSleepPeriods(startDate: string, endDate: string): Promise<SleepPeriod[]> {
    const key = this.cacheKey("sleep", startDate, endDate);
    const cached = getCached<SleepPeriod[]>(key);
    if (cached) return cached;
    const data = await this.fetchAll<SleepPeriod>("sleep", { start_date: startDate, end_date: endDate });
    setCached(key, data, this.ttl(endDate));
    return data;
  }

  async getDailyActivity(startDate: string, endDate: string): Promise<DailyActivity[]> {
    const key = this.cacheKey("daily_activity", startDate, endDate);
    const cached = getCached<DailyActivity[]>(key);
    if (cached) return cached;
    const data = await this.fetchAll<DailyActivity>("daily_activity", { start_date: startDate, end_date: endDate });
    setCached(key, data, this.ttl(endDate));
    return data;
  }

  async getDailyReadiness(startDate: string, endDate: string): Promise<DailyReadiness[]> {
    const key = this.cacheKey("daily_readiness", startDate, endDate);
    const cached = getCached<DailyReadiness[]>(key);
    if (cached) return cached;
    const data = await this.fetchAll<DailyReadiness>("daily_readiness", { start_date: startDate, end_date: endDate });
    setCached(key, data, this.ttl(endDate));
    return data;
  }

  async getHeartRate(startDatetime: string, endDatetime: string): Promise<HeartRateSample[]> {
    const key = this.cacheKey("heartrate", startDatetime, endDatetime);
    const cached = getCached<HeartRateSample[]>(key);
    if (cached) return cached;
    const data = await this.fetchAll<HeartRateSample>("heartrate", { start_datetime: startDatetime, end_datetime: endDatetime });
    setCached(key, data, this.ttl(endDatetime.slice(0, 10)));
    return data;
  }

  async getDailySpO2(startDate: string, endDate: string): Promise<DailySpO2[]> {
    const key = this.cacheKey("daily_spo2", startDate, endDate);
    const cached = getCached<DailySpO2[]>(key);
    if (cached) return cached;
    const data = await this.fetchAll<DailySpO2>("daily_spo2", { start_date: startDate, end_date: endDate });
    setCached(key, data, this.ttl(endDate));
    return data;
  }

  async getWorkouts(startDate: string, endDate: string): Promise<Workout[]> {
    const key = this.cacheKey("workout", startDate, endDate);
    const cached = getCached<Workout[]>(key);
    if (cached) return cached;
    const data = await this.fetchAll<Workout>("workout", { start_date: startDate, end_date: endDate });
    setCached(key, data, this.ttl(endDate));
    return data;
  }
}
