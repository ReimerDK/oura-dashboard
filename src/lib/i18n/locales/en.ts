import type { Translations } from "./da";

export const en: Translations = {
  locale: "en",
  numberLocale: "en-GB",

  nav: {
    navigation: "Navigation",
    overview: "Overview",
    sleep: "Sleep",
    activity: "Activity",
    readiness: "Readiness",
    heartRate: "Heart Rate & HRV",
    compare: "Compare",
    settings: "Settings",
    logout: "Log out",
  },

  settings: {
    heading: "Settings",
    nameLabel: "Display name",
    namePlaceholder: "Your name",
    save: "Save",
    saved: "Saved",
    error: "Could not save. Please try again.",
  },

  period: {
    week: "This week",
    month: "This month",
    days30: "Last 30 days",
    days90: "Last 90 days",
  },

  common: {
    loading: "Loading data…",
    scoreOver: "Score over selected period",
    notEnoughData: "not enough data.",
  },

  overview: {
    greetings: {
      lateNight: "Still up",
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
    cards: {
      readiness: "Readiness",
      readinessPoetry: "your body's readiness to take on the day.",
      sleep: "Sleep",
      activity: "Activity",
      stepsToday: "{n} steps today.",
      activityPoetry: "movement woven through the hours.",
      spo2: "SpO2",
      spo2Poetry: "oxygen saturation in the blood.",
      tempDeviation: "Body temperature",
      tempDeviationPoetry: "deviation from your baseline last night.",
    },
    charts: {
      readinessTitle: "Readiness",
      readinessSub: "Score, 30 days",
      sleepTitle: "Sleep",
      sleepSub: "Score, 30 days",
      activityTitle: "Activity",
      activitySub: "Score, 30 days",
      hrvTitle: "HRV Balance",
      hrvSub: "Contribution, 30 days",
    },
  },

  sleep: {
    dateLabel: "Sleep",
    heading: "The night's",
    headingEm: "rest.",
    cards: {
      avgScore: "Avg. sleep score",
      avgScorePoetry: "the quality of the night's sleep, overall.",
      avgDuration: "Avg. sleep duration",
      avgEfficiency: "Avg. efficiency",
      efficiencyPoetry: "{n}% sleep efficiency",
    },
    charts: {
      scoreTitle: "Sleep score",
      scoreSub: "Score over selected period",
      stagesTitle: "Sleep stages per night",
      stagesSub: "Distribution of deep, REM and light sleep",
      efficiencyTitle: "Sleep efficiency",
      efficiencySub: "Percentage of time in bed",
      hrvTitle: "HRV during sleep",
      hrvSub: "Average in ms",
    },
  },

  activity: {
    dateLabel: "Activity",
    heading: "Movement in",
    headingEm: "everyday life.",
    cards: {
      avgScore: "Avg. activity score",
      avgScorePoetry: "movement woven through the hours.",
      avgSteps: "Avg. steps",
      stepsPerDay: "{n} steps per day.",
      avgCalories: "Avg. active calories",
      caloriesPoetry: "energy spent in active movement.",
    },
    charts: {
      stepsTitle: "Steps per day",
      stepsSub: "Daily steps over selected period",
      caloriesTitle: "Active calories",
      caloriesSub: "Daily expenditure",
      scoreTitle: "Activity score",
      scoreSub: "Score over period",
    },
  },

  readiness: {
    dateLabel: "Readiness",
    heading: "The body's",
    headingEm: "capacity.",
    cards: {
      avgScore: "Avg. readiness score",
      avgScorePoetry: "your body's readiness to take on the day.",
    },
    charts: {
      scoreTitle: "Readiness score",
      factorsTitle: "Contributing factors",
      selectDay: "Select day:",
      tempTitle: "Body temperature",
      tempSub: "Deviation from your baseline",
    },
  },

  heartRate: {
    dateLabel: "Heart Rate & HRV",
    heading: "The heart's",
    headingEm: "rhythm.",
    cards: {
      avgHrv: "Avg. HRV Balance",
      hrvPoetry: "the rhythmic give-and-take between heartbeats.",
      avgSpo2: "Avg. SpO2",
      spo2Poetry: "oxygen saturation in the blood.",
    },
    charts: {
      hrvTitle: "HRV Balance",
      hrvSub: "Contribution over selected period",
      restingHrTitle: "Resting heart rate (contribution)",
      restingHrSub: "Contribution from resting heart rate",
      spo2Title: "SpO2 oxygen saturation",
      spo2Sub: "Percentage, daily average",
    },
  },

  compare: {
    dateLabel: "Compare",
    heading: "Period by",
    headingEm: "period.",
    metricLabels: {
      sleep: "Sleep score",
      activity: "Activity score",
      readiness: "Readiness score",
    },
    current: "now",
    prior: "previous",
    vsLabel: "Period comparison · {a} vs. {b}",
    iftForrige: "vs. previous",
    currentPeriod: "{metric}, current period.",
    priorPeriod: "{metric}, previous period.",
  },
};
