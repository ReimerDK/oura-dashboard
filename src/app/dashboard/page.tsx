import { auth } from "@/lib/auth";
import { OuraClient } from "@/lib/oura/client";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { today, daysAgo, formatDuration } from "@/lib/utils";
import { getLocale, getTranslations, interpolate } from "@/lib/i18n";
import { format, parseISO } from "date-fns";
import { da as dateFnsDa, enGB } from "date-fns/locale";

const dateFnsLocales = { da: dateFnsDa, en: enGB };

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

  const [locale, t] = await Promise.all([getLocale(), getTranslations()]);
  const dfLocale = dateFnsLocales[locale];

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

  const firstName = session.user.name?.split(" ")[0] ?? (locale === "da" ? "der" : "there");

  function sparkRange(days: { day: string }[]): string | undefined {
    if (days.length < 2) return undefined;
    return `${format(parseISO(days[0].day), "d. MMM", { locale: dfLocale })} – ${format(parseISO(days.at(-1)!.day), "d. MMM yyyy", { locale: dfLocale })}`;
  }

  const o = t.overview;
  const greetings = o.greetings;
  const h = new Date().getHours();
  const greeting = h < 5 ? greetings.lateNight : h < 12 ? greetings.morning : h < 18 ? greetings.afternoon : greetings.evening;

  return (
    <div>
      <div className="dash-head lift-in">
        <div>
          <div className="date-label">{format(new Date(), "EEEE d. MMMM yyyy", { locale: dfLocale }).toUpperCase()}</div>
          <h1 className="greeting">
            {greeting}, <em>{firstName}.</em>
          </h1>
        </div>
      </div>

      <div className="metric-grid lift-in-2">
        <ScoreCard
          title={o.cards.readiness}
          score={latestReadiness?.score}
          poetry={o.cards.readinessPoetry}
          color="var(--accent)"
          sparkData={readinessScores.filter((v): v is number => v !== undefined)}
          delta={delta7(readinessScores)}
          dateRange={sparkRange(readiness)}
          href="/dashboard/readiness"
        />
        <ScoreCard
          title={o.cards.sleep}
          score={latestSleep?.score}
          poetry={mainSleep ? formatDuration(mainSleep.total_sleep_duration ?? 0) : t.sleep.cards.avgScorePoetry}
          color="#3F5BAA"
          sparkData={sleepScores.filter((v): v is number => v !== undefined)}
          delta={delta7(sleepScores)}
          dateRange={sparkRange(sleep)}
          href="/dashboard/sleep"
        />
        <ScoreCard
          title={o.cards.activity}
          score={latestActivity?.score}
          poetry={latestActivity?.steps ? interpolate(o.cards.stepsToday, { n: latestActivity.steps.toLocaleString(t.numberLocale) }) : o.cards.activityPoetry}
          color="#B5704A"
          sparkData={activityScores.filter((v): v is number => v !== undefined)}
          delta={delta7(activityScores)}
          dateRange={sparkRange(activity)}
          href="/dashboard/activity"
        />
        <ScoreCard
          title={o.cards.spo2}
          poetry={o.cards.spo2Poetry}
          color="#7A5AB5"
          unit="%"
          sparkData={spo2.map((s) => s.spo2_percentage?.average).filter((v): v is number => v !== undefined)}
          dateRange={sparkRange(spo2)}
          href="/dashboard/heart-rate"
        >
          {latestSpO2?.spo2_percentage?.average && (
            <div className="card-value">
              {latestSpO2.spo2_percentage.average.toFixed(1)}
              <span className="card-unit">%</span>
            </div>
          )}
        </ScoreCard>
      </div>

      <div className="compare-grid lift-in-3">
        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="chart-toolbar">
            <div>
              <h3 className="chart-title">{o.charts.readinessTitle}</h3>
              <div className="chart-sub">{o.charts.readinessSub}</div>
            </div>
          </div>
          <TrendLineChart data={chartData.readiness} color="var(--accent)" domain={[0, 100]} />
        </div>
        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="chart-toolbar">
            <div>
              <h3 className="chart-title">{o.charts.sleepTitle}</h3>
              <div className="chart-sub">{o.charts.sleepSub}</div>
            </div>
          </div>
          <TrendLineChart data={chartData.sleep} color="#3F5BAA" domain={[0, 100]} />
        </div>
      </div>

      <div className="compare-grid lift-in-4">
        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="chart-toolbar">
            <div>
              <h3 className="chart-title">{o.charts.activityTitle}</h3>
              <div className="chart-sub">{o.charts.activitySub}</div>
            </div>
          </div>
          <TrendLineChart data={chartData.activity} color="#B5704A" domain={[0, 100]} />
        </div>
        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="chart-toolbar">
            <div>
              <h3 className="chart-title">{o.charts.hrvTitle}</h3>
              <div className="chart-sub">{o.charts.hrvSub}</div>
            </div>
          </div>
          <TrendLineChart data={chartData.hrv} color="#7A5AB5" domain={[0, 100]} />
        </div>
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}
