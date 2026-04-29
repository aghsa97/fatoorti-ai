-- Create demo user for hackathon demo
-- This inserts directly into auth.users so the FK constraint is satisfied

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo@fatoorti.ai',
  crypt('demo-password-not-for-production', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"سارة الحارثي"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- The profile will be auto-created by the trigger from the initial migration
-- But insert it explicitly in case the trigger already fired
INSERT INTO profiles (id, full_name, business_name, vat_number, country, default_currency, bank_details)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'سارة الحارثي',
  'تصميم وهوية بصرية',
  '310987654300003',
  'SA',
  'SAR',
  '{"bank_name":"البنك الأهلي","iban":"SA44 2000 0001 2345 6789 1234","account_holder":"سارة الحارثي"}'
) ON CONFLICT (id) DO NOTHING;
