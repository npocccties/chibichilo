-- Insert default `Tag`
INSERT INTO
  "Tag" ("id", "color", "label")
VALUES
  (1, '#2980B9', E'\u306a\u308b\u307b\u3069'),
  (2, '#C0392B', E'\u96e3\u3057\u3044'),
  (3, '#27AE60', E'\u3042\u3068\u3067\u898b\u308b'),
  (4, '#F39C12', E'\u91cd\u8981')
ON CONFLICT DO NOTHING;
