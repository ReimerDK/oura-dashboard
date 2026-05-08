import { auth } from "@/lib/auth";
import { OuraClient } from "@/lib/oura/client";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { today, daysAgo, formatDuration } from "@/lib/utils";
import { format, parseISO } from "date-fns";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Stadig oppe";
  if (h < 12) return "God morgen";
  if (h < 18) return "God eftermiddag";
  return "God aften";
}

function delta7(scores: (number | undefined)[]) {
  const vals = scores.filter((v): v is number => v !== undefined);
  if (vals.length < 8) return undefined;
  const last = vals.at(-1)!;
  const slice = vals.slice(-8, -1);
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  return Math.round(last - mean);
}

export default async function DashboardOverview() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const client = new OuraClient(session.user.id);
  const start = daysAgo(29);
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

  const readinessScores = readiness.map((r) => r.score);
  const sleepScores = sleep.map((s) => s.score);
  const activityScores = activity.map((a) => a.score);

  const chartData = {
    readiness: readiness.map((r) => ({ day: format(parseISO(r.day), "dd/MM"), value: r.score ?? 0 })),
    sleep: sleep.map((s) => ({ day: format(parseISO(s.day), "dd/MM"), value: s.score ?? 0 })),
    activity: activity.map((a) => ({ day: format(parseISO(a.day), "dd/MM"), value: a.score ?? 0 })),
    hrv: readiness
      .filter((r) => r.contributors?.hrv_balance !== undefined)
      .map((r) => ({ day: format(parseISO(r.day), "dd/MM"), value: r.contributors!.hrv_balance! })),
  };

  const firstName = session.user.name?.split(" ")[0] ?? "der";

  return (
    <div>
      <div className="dash-head lift-in">
        <div>
          <div className="date-label">{format(new Date(), "EEEE d. MMMM yyyy").toUpperCase()}</div>
          <h1 className="greeting">
            {timeGreeting()}, <em>{firstName}.</em>
          </h1>
        </div>
      </div>

      <div className="metric-grid lift-in-2">
        <ScoreCard
          title="Parathed"
          score={latestReadiness?.score}
          poetry="kroppens parathed til at tage dagen i møde."
          color="var(--accent)"
          sparkData={readinessScores.filter((v): v is number => v !== undefined)}
          delta={delta7(readinessScores)}
        />
        <ScoreCard
          title="Søvn"
          score={latestSleep?.score}
          poetry={mainSleep ? formatDuration(mainSleep.total_sleep_duration ?? 0) : "kvaliteten af nattens søvn."}
          color="#3F5BAA"
          sparkData={sleepScores.filter((v): v is number => v !== undefined)}
          delta={delta7(sleepScores)}
        />
        <ScoreCard
          title="Aktivitet"
          score={latestActivity?.score}
          poetry={latestActivity?.steps ? `${latestActivity.steps.toLocaleString("da")} skridt i dag.` : "bevægelse vævet ind i timerne."}
          color="#B5704A"
          sparkData={activityScores.filter((v): v is number => v !== undefined)}
          delta={delta7(activityScores)}
        />
        <ScoreCard
          title="SpO2"
          poetry="iltmætning i blodet."
          color="#7A5AB5"
          unit="%"
          sparkData={spo2.map((s) => s.spo2_percentage?.average).filter((v): v is number => v !== undefined)}
        >
          {latestSpO2?.spo2_percentage?.average && (
            <div className="card-value">
              {latestSpO2.spo2_percentage.average.toFixed(1)}
              <span className="card-unit">%</span>
            </div>
          )}
        </ScoreCard>
      </div>

      <div className="chart-card lift-in-3">
        <div className="chart-toolbar">
          <div>
            <h3 className="chart-title">Parathed & Søvn</h3>
            <div className="chart-sub">Seneste 30 dage</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <TrendLineChart data={chartData.readiness} color="var(--accent)" domain={[0, 100]} />
          <TrendLineChart data={chartData.sleep} color="#3F5BAA" domain={[0, 100]} />
        </div>
      </div>

      <div className="compare-grid lift-in-4">
        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="chart-toolbar">
            <div>
              <h3 className="chart-title">Aktivitet</h3>
              <div className="chart-sub">Score, 30 dage</div>
            </div>
          </div>
          <TrendLineChart data={chartData.activity} color="#B5704A" domain={[0, 100]} />
        </div>
        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="chart-toolbar">
            <div>
              <h3 className="chart-title">HRV Balance</h3>
              <div className="chart-sub">Bidragsværdi, 30 dage</div>
            </div>
          </div>
          <TrendLineChart data={chartData.hrv} color="#7A5AB5" domain={[0, 100]} />
        </div>
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}
