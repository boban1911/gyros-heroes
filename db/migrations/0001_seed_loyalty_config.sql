-- Seed the singleton loyalty_config row. Idempotent.
INSERT INTO "loyalty_config" ("id", "stamps_required", "reward_description")
VALUES (1, 10, 'Besplatan Hero gyros')
ON CONFLICT ("id") DO NOTHING;
