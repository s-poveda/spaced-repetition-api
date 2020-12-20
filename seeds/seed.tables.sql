BEGIN;
-- NOTE: IMPORTANT: the system hosting this db MUST be using UTF8 encoding
-- for windows users: Enable "Beta: Use UTF8 encoding for global language support" in advanced Region settings
SET client_encoding TO 'UTF8';

TRUNCATE
  "word",
  "language",
  "user";

INSERT INTO "user" ("id", "username", "name", "password")
VALUES
  (
    1,
    'admin',
    'Dunder Mifflin Admin',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'Japanese', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "next")
VALUES
  (1, 1, '練習する', 'to practice', 2),
  (2, 1, 'こんにちは', 'hello', 3),
  (3, 1, '家', 'house', 4),
  (4, 1, '開発者', 'developer', 5),
  (5, 1, '散歩する', 'to take a walk', 6),
  (6, 1, '凄い', 'amazing', 7),
  (7, 1, '犬', 'dog', 8),
  (8, 1, '猫', 'cat', null);

UPDATE "language" SET head = 1 WHERE id = 1;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

COMMIT;
