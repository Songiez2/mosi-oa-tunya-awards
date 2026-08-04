
ALTER TABLE public.nominees ADD COLUMN IF NOT EXISTS is_winner boolean NOT NULL DEFAULT false;

INSERT INTO public.site_settings (key, value) VALUES
  ('quick_links', '["Home:/","Nominees:/nominees","Vote:/vote","Categories:/categories","Sponsors:/sponsors","Gallery:/gallery","News:/news"]'::jsonb),
  ('support_links', '["About:/about","Contact:/contact","FAQ:/faq","Privacy Policy:/privacy"]'::jsonb),
  ('contact_address', '"Livingstone, Southern Province, Zambia"'::jsonb),
  ('registration_fee_label', '"K100"'::jsonb),
  ('registration_whatsapp_message', '"Hello! I have completed my nominee registration form for MOSI-OA TUNYA SOUTHERN AWARDS 2026. Please see my details and I am attaching payment proof now."'::jsonb)
ON CONFLICT (key) DO NOTHING;
