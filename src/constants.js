export const DATA_BASES = {
  USERS: "users",
  SESSIONS: "sessions",
  SETTINGS: "settings",
};

export const PROJECT_NAME = "psy-marathon-bot";

export const ADMIN_PATH = "/admin";

export const SETTINGS_MODELS_ENUM = {
  SCENARIO: "scenario",
  ALIASES: "aliases",
  REMINDERS: "reminders",
};

export const DEFAULT_SETTING_MODELS = [
  { _id: SETTINGS_MODELS_ENUM.SCENARIO },
  { _id: SETTINGS_MODELS_ENUM.ALIASES, next_id: 0, list: [] },
  { _id: SETTINGS_MODELS_ENUM.REMINDERS, list: [] },
];
