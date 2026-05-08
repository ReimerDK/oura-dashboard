export interface OuraPagedResponse<T> {
  data: T[];
  next_token?: string;
}

export interface DailySleep {
  id: string;
  day: string;
  score?: number;
  contributors?: {
    deep_sleep?: number;
    efficiency?: number;
    latency?: number;
    rem_sleep?: number;
    restfulness?: number;
    timing?: number;
    total_sleep?: number;
  };
}

export interface SleepPeriod {
  id: string;
  average_breath?: number;
  average_heart_rate?: number;
  average_hrv?: number;
  awake_time?: number;
  bedtime_end: string;
  bedtime_start: string;
  day: string;
  deep_sleep_duration?: number;
  efficiency?: number;
  heart_rate?: { interval: number; items: (number | null)[]; timestamp: string };
  hrv?: { interval: number; items: (number | null)[]; timestamp: string };
  light_sleep_duration?: number;
  low_battery_alert?: boolean;
  lowest_heart_rate?: number;
  movement_30_sec?: string;
  period_id?: number;
  readiness?: { contributors: Record<string, number>; score: number; temperature_deviation?: number };
  readiness_score_delta?: number;
  rem_sleep_duration?: number;
  restless_periods?: number;
  sleep_phase_5_min?: string;
  sleep_score_delta?: number;
  sleep_algorithm_version?: string;
  time_in_bed?: number;
  total_sleep_duration?: number;
  type?: string;
}

export interface DailyActivity {
  id: string;
  day: string;
  score?: number;
  active_calories?: number;
  average_met_minutes?: number;
  contributors?: {
    meet_daily_targets?: number;
    move_every_hour?: number;
    recovery_time?: number;
    stay_active?: number;
    training_frequency?: number;
    training_volume?: number;
  };
  equivalent_walking_distance?: number;
  high_activity_met_minutes?: number;
  high_activity_time?: number;
  inactivity_alerts?: number;
  low_activity_met_minutes?: number;
  low_activity_time?: number;
  medium_activity_met_minutes?: number;
  medium_activity_time?: number;
  meters_to_target?: number;
  non_wear_time?: number;
  resting_time?: number;
  sedentary_met_minutes?: number;
  sedentary_time?: number;
  steps?: number;
  target_calories?: number;
  target_meters?: number;
  total_calories?: number;
}

export interface DailyReadiness {
  id: string;
  day: string;
  score?: number;
  temperature_deviation?: number;
  temperature_trend_deviation?: number;
  contributors?: {
    activity_balance?: number;
    body_temperature?: number;
    hrv_balance?: number;
    previous_day_activity?: number;
    previous_night?: number;
    recovery_index?: number;
    resting_heart_rate?: number;
    sleep_balance?: number;
  };
}

export interface HeartRateSample {
  bpm: number;
  source: string;
  timestamp: string;
}

export interface DailySpO2 {
  id: string;
  day: string;
  spo2_percentage?: {
    average?: number;
  };
}

export interface Workout {
  id: string;
  activity: string;
  average_heart_rate?: number;
  average_mets?: number;
  calories?: number;
  day: string;
  distance?: number;
  end_datetime: string;
  intensity?: string;
  label?: string;
  source?: string;
  start_datetime: string;
}
