-- Rollback for isolated local-schema.sql laboratory only, inside a guarded transaction.
DROP TABLE cancellation_intents;
DROP TABLE operators;
DROP TABLE bindings;
DROP TABLE environments;
DROP TABLE reservations;
DROP TABLE metadata;
