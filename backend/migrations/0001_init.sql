CREATE TABLE IF NOT EXISTS snapshots (
  player_id   TEXT,
  realm_level INTEGER,
  faction_id  TEXT,
  root_id     TEXT,
  turns       INTEGER,
  companions  TEXT,
  skills      TEXT,
  events      TEXT,
  timestamp   INTEGER
);

CREATE TABLE IF NOT EXISTS ai_generated (
  player_id   TEXT,
  type        TEXT,
  value       TEXT,
  context     TEXT,
  realm_level INTEGER,
  timestamp   INTEGER
);
