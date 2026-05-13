INSERT INTO schools (id, udise_code, name, district, state)
VALUES
  ('00000000-0000-0000-0000-000000000001', '29010100101', 'Govt Primary School A', 'Bengaluru Urban', 'Karnataka')
ON CONFLICT DO NOTHING;
