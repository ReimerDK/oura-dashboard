export const da = {
  locale: "da",
  numberLocale: "da-DK",

  nav: {
    navigation: "Navigation",
    overview: "Overblik",
    sleep: "Søvn",
    activity: "Aktivitet",
    readiness: "Parathed",
    heartRate: "Puls & HRV",
    compare: "Sammenlign",
    settings: "Indstillinger",
    logout: "Log ud",
  },

  settings: {
    heading: "Indstillinger",
    nameLabel: "Visningsnavn",
    namePlaceholder: "Dit navn",
    save: "Gem",
    saved: "Gemt",
    error: "Kunne ikke gemme. Prøv igen.",
  },

  period: {
    week: "Denne uge",
    month: "Denne måned",
    days30: "Seneste 30 dage",
    days90: "Seneste 90 dage",
  },

  common: {
    loading: "Henter data…",
    scoreOver: "Score over valgt periode",
    notEnoughData: "ikke nok data.",
  },

  overview: {
    greetings: {
      lateNight: "Stadig oppe",
      morning: "God morgen",
      afternoon: "God eftermiddag",
      evening: "God aften",
    },
    cards: {
      readiness: "Parathed",
      readinessPoetry: "kroppens parathed til at tage dagen i møde.",
      sleep: "Søvn",
      activity: "Aktivitet",
      // {n} = formatted step count
      stepsToday: "{n} skridt i dag.",
      activityPoetry: "bevægelse vævet ind i timerne.",
      spo2: "SpO2",
      spo2Poetry: "iltmætning i blodet.",
    },
    charts: {
      readinessTitle: "Parathed",
      readinessSub: "Score, 30 dage",
      sleepTitle: "Søvn",
      sleepSub: "Score, 30 dage",
      activityTitle: "Aktivitet",
      activitySub: "Score, 30 dage",
      hrvTitle: "HRV Balance",
      hrvSub: "Bidragsværdi, 30 dage",
    },
  },

  sleep: {
    dateLabel: "Søvn",
    heading: "Nattens",
    headingEm: "hvile.",
    cards: {
      avgScore: "Gns. søvnscore",
      avgScorePoetry: "kvaliteten af nattens søvn, samlet.",
      avgDuration: "Gns. søvnlængde",
      avgEfficiency: "Gns. effektivitet",
      // {n} = percentage
      efficiencyPoetry: "{n}% søvneffektivitet",
    },
    charts: {
      scoreTitle: "Søvnscore",
      scoreSub: "Score over valgt periode",
      stagesTitle: "Søvnstadier per nat",
      stagesSub: "Fordeling af dyb, REM og let søvn",
      efficiencyTitle: "Søvneffektivitet",
      efficiencySub: "Procent af tid i sengen",
      hrvTitle: "HRV under søvn",
      hrvSub: "Gennemsnit i ms",
    },
  },

  activity: {
    dateLabel: "Aktivitet",
    heading: "Bevægelse i",
    headingEm: "hverdagen.",
    cards: {
      avgScore: "Gns. aktivitetsscore",
      avgScorePoetry: "bevægelse vævet ind i timerne.",
      avgSteps: "Gns. skridt",
      // {n} = formatted step count
      stepsPerDay: "{n} skridt per dag.",
      avgCalories: "Gns. aktive kalorier",
      caloriesPoetry: "energi brugt i aktiv bevægelse.",
    },
    charts: {
      stepsTitle: "Skridt per dag",
      stepsSub: "Daglige skridt over valgt periode",
      caloriesTitle: "Aktive kalorier",
      caloriesSub: "Dagligt forbrug",
      scoreTitle: "Aktivitetsscore",
      scoreSub: "Score over periode",
    },
  },

  readiness: {
    dateLabel: "Parathed",
    heading: "Kroppens",
    headingEm: "kapacitet.",
    cards: {
      avgScore: "Gns. paratheds-score",
      avgScorePoetry: "kroppens parathed til at tage dagen i møde.",
    },
    charts: {
      scoreTitle: "Paratheds-score",
      factorsTitle: "Bidragende faktorer",
      selectDay: "Vælg dag:",
      tempTitle: "Kropstemperatur",
      tempSub: "Afvigelse fra din baseline",
    },
  },

  heartRate: {
    dateLabel: "Puls & HRV",
    heading: "Hjertets",
    headingEm: "rytme.",
    cards: {
      avgHrv: "Gns. HRV Balance",
      hrvPoetry: "den rytmiske give-og-tak mellem hjerteslag.",
      avgSpo2: "Gns. SpO2",
      spo2Poetry: "iltmætning i blodet.",
    },
    charts: {
      hrvTitle: "HRV Balance",
      hrvSub: "Bidragsværdi over valgt periode",
      restingHrTitle: "Hvilepuls (bidrag)",
      restingHrSub: "Bidragsværdi fra hvilepuls",
      spo2Title: "Iltmætning SpO2",
      spo2Sub: "Procent, dagligt gennemsnit",
    },
  },

  compare: {
    dateLabel: "Sammenlign",
    heading: "Periode for",
    headingEm: "periode.",
    metricLabels: {
      sleep: "Søvnscore",
      activity: "Aktivitetsscore",
      readiness: "Paratheds-score",
    },
    current: "nu",
    prior: "forrige",
    // {a} = current range, {b} = prior range
    vsLabel: "Periodesammenligning · {a} vs. {b}",
    iftForrige: "ift. forrige",
    // {metric} = metric label (lowercase)
    currentPeriod: "{metric}, aktuel periode.",
    priorPeriod: "{metric}, forrige periode.",
  },
};

export type Translations = typeof da;
