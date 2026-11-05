-- Local SQLite laboratory only. Not a Supabase migration.
CREATE TABLE metadata (name TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE reservations (id TEXT PRIMARY KEY, body TEXT NOT NULL CHECK(json_valid(body)), revision INTEGER NOT NULL DEFAULT 0);
CREATE TABLE environments (id TEXT PRIMARY KEY, platform TEXT NOT NULL, origin TEXT NOT NULL);
CREATE TABLE bindings (environment TEXT NOT NULL, coach TEXT NOT NULL, account TEXT NOT NULL, PRIMARY KEY(environment,coach));
CREATE TABLE operators (token_hash TEXT PRIMARY KEY, environment TEXT NOT NULL, modes TEXT NOT NULL CHECK(json_valid(modes)), targets TEXT NOT NULL CHECK(json_valid(targets)), expires_at INTEGER NOT NULL, enabled INTEGER NOT NULL DEFAULT 1);
CREATE TABLE cancellation_intents (reservation_id TEXT PRIMARY KEY, body TEXT NOT NULL CHECK(json_valid(body)));
