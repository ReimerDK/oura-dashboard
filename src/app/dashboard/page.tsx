import { auth } from "@/lib/auth";
import { OuraClient } from "@/lib/oura/client";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { today, daysAgo, formatDuration, scoreColor } from "@/lib/utils";
import { format, parseISO } from "date-fns";

export default async function DashboardOverview() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const client = new OuraClient(session.user.id);
  const start = daysAgo(13);
  const end = today();

  const [sleep, activity, readiness, spo2] = await Promise.all([
    client.getDailySleep(start, end),
    client.getDailyActivity(start, end),
    client.getDailyReadiness(start, end),
    client.getDailySpO2(start, end),
  ]);

  const latestSleep = sleep.at(-1);
  const latestActivity = activity.at(-1);
  const latestReadiness = readiness.at(-1);
  const latestSpO2 = spo2.at(-1);

  const sleepPeriods = await client.getSleepPeriods(end, end);
  const mainSleep = sleepPeriods.find((s) => s.type === "long_sleep") ?? sleepPeriods[0];

  const hrvData = readiness
    .filter((r) => r.contributors?.hrv_balance !== undefined)
    .map((r) => ({ day: format(parseISO(r.day), "dd/MM"), value: r.contributors!.hrv_balance! }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overblik</h1>
        <p className="text-gray-400 text-sm mt-1">{format(new Date(), "EEEE d. MMMM yyyy")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Parathed"
          score={latestReadiness?.score}
          subtitle={latestReadiness?.day ? format(parseISO(latestReadiness.day), "dd/MM") : undefined}
        />
        <ScoreCard
          title="Søvn"
          score={latestSleep?.score}
          subtitle={mainSleep ? formatDuration(mainSleep.total_sleep_duration ?? 0) : undefined}
        />
        <ScoreCard
          title="Aktivitet"
          score={latestActivity?.score}
          subtitle={latestActivity?.steps ? `${latestActivity.steps.toLocaleString("da")} skridt` : undefined}
        />
        <ScoreCard title="SpO2" subtitle={latestSpO2?.spo2_percentage?.average ? `${latestSpO2.spo2_percentage.average.toFixed(1)}%` : "—"}>
          {latestSpO2?.spo2_percentage?.average && (
            <p className={`text-3xl font-bold tabular-nums ${scoreColor(latestSpO2.spo2_percentage.average)}`}>
              {latestSpO2.spo2_percentage.average.toFixed(1)}%
            </p>
          )}
        </ScoreCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">HRV Balance (14 dage)</h2>
          <TrendLineChart data={hrvData} color="#8b5cf6" domain={[0, 100]} />
        </div>

        <div className="bg-gray-900 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Søvnscore (14 dage)</h2>
          <TrendLineChart
            data={sleep.map((s) => ({ day: format(parseISO(s.day), "dd/MM"), value: s.score ?? 0 }))}
            color="#6366f1"
            domain={[0, 100]}
          />
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Aktivitetsscore (14 dage)</h2>
        <TrendLineChart
          data={activity.map((a) => ({ day: format(parseISO(a.day), "dd/MM"), value: a.score ?? 0 }))}
          color="#10b981"
          domain={[0, 100]}
        />
      </div>
    </div>
  );
}
