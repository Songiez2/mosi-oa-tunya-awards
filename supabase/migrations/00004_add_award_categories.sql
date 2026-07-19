-- Add the 25 specific award categories for MOSI-OA-TUNYA SOUTHERN AWARDS 2026

INSERT INTO public.categories (name, description, is_enabled, sort_order) VALUES
  ('Best Local Business Award', 'Recognizing outstanding local businesses in the Southern Province', true, 1),
  ('Best Night Club Award', 'Award for the best nightlife entertainment venue', true, 2),
  ('Best Local Hospitality Award', 'Excellence in hospitality and service', true, 3),
  ('Best Social Media Page Award', 'Most engaging and creative social media presence', true, 4),
  ('Best Influencer Award', 'Recognizing influential content creators', true, 5),
  ('Best Photographer Award', 'Excellence in photography', true, 6),
  ('Best Videographer Award', 'Outstanding video production and editing', true, 7),
  ('Best Event Award', 'Best organized and executed events', true, 8),
  ('Best Model Award', 'Recognition in modeling industry', true, 9),
  ('Best Dancer / Dance Group Award', 'Excellence in dance performance', true, 10),
  ('Best Provincial Male Artist of the Year', 'Top male artist from the province', true, 11),
  ('Best Provincial Female Artist of the Year', 'Top female artist from the province', true, 12),
  ('Best Music Video Award', 'Best music video production', true, 13),
  ('Best Gospel Artist Award', 'Excellence in gospel music', true, 14),
  ('Song of the Year Award', 'Most popular song of the year', true, 15),
  ('Best Music Producer Award', 'Excellence in music production', true, 16),
  ('Best Comedian Award', 'Best comedy performance', true, 17),
  ('Best Provincial Club DJ Award', 'Top club DJ from the province', true, 18),
  ('Best Radio Station Award', 'Best radio station in the region', true, 19),
  ('Best Tour Agency Award', 'Excellence in tourism services', true, 20),
  ('Best Newcomer Male', 'Best new male talent', true, 21),
  ('Best Newcomer Female', 'Best new female talent', true, 22),
  ('Best Band Award', 'Best musical group performance', true, 23),
  ('Best Female Artist Award', 'Top female artist of the year', true, 24),
  ('Best Male Artist Award', 'Top male artist of the year', true, 25)
ON CONFLICT DO NOTHING;
