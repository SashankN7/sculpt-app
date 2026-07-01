-- Sculpt App: Initial database schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ============================================================
-- 1. user_profiles — Stripe subscription management
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'trial', 'premium')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'annual', NULL)),
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON user_profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. user_data — Cloud sync for app state
-- ============================================================
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  analysis_result JSONB,
  recommendations JSONB DEFAULT '[]'::jsonb,
  saved_recommendations JSONB DEFAULT '[]'::jsonb,
  rejected_recommendations JSONB DEFAULT '[]'::jsonb,
  questionnaire_data JSONB DEFAULT '{}'::jsonb,
  last_cut_date TEXT,
  cut_frequency TEXT,
  grooming_streak INTEGER DEFAULT 0,
  last_grooming_tip_date TEXT,
  preview_credits INTEGER DEFAULT 0,
  chat_messages_today INTEGER DEFAULT 0,
  last_chat_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data"
  ON user_data FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. scan_usage — Server-side rate limiting tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS scan_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_usage_user_date
  ON scan_usage(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_scan_usage_ip_date
  ON scan_usage(ip_address, created_at);

ALTER TABLE scan_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on scan_usage"
  ON scan_usage FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. grooming_tips — Retention feature content
-- ============================================================
CREATE TABLE IF NOT EXISTS grooming_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE grooming_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tips"
  ON grooming_tips FOR SELECT
  USING (true);

-- ============================================================
-- 5. Helper functions
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_user_data_updated
  BEFORE UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Cleanup function for old scan_usage rows
CREATE OR REPLACE FUNCTION cleanup_old_scan_usage()
RETURNS void AS $$
BEGIN
  DELETE FROM scan_usage WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. Seed some grooming tips for retention
-- ============================================================
INSERT INTO grooming_tips (category, title, content, icon) VALUES
  ('maintenance', 'The 4-Week Rule', 'Most men''s haircuts start losing their shape after 4 weeks. Book your next appointment before you need one.', 'scissors'),
  ('maintenance', 'Fade Freshness', 'Skin fades need cleanup every 2-3 weeks. Taper fades can stretch to 4-5 weeks before losing their edge.', 'clock'),
  ('styling', 'Less Product is More', 'Start with a dime-sized amount of product. You can always add more, but overloading makes hair look greasy.', 'sparkles'),
  ('styling', 'Pre-Styler Secret', 'A pre-styler (mousse or sea salt spray) before blow drying adds volume without the heavy feel of finishing products.', 'wind'),
  ('styling', 'Matte vs Shine', 'Matte products (clay, paste) give a natural look. Shine products (pomade, gel) give a polished, wet look. Match to your vibe.', 'sun'),
  ('grooming', 'Neckline Maintenance', 'Clean up your neckline between cuts with a trimmer. The neckline defines your haircut more than you think.', 'scissors'),
  ('grooming', 'Wash Less, Style More', 'Washing hair daily strips natural oils. Every 2-3 days is ideal. On off days, a water rinse is enough.', 'droplets'),
  ('products', 'Clay vs Pomade', 'Clay = matte, textured, natural hold. Pomade = shine, slick, structured hold. Choose based on the look you want.', 'layers'),
  ('seasonal', 'Summer Cut Tips', 'Hot weather? Go shorter on the sides with more texture on top. A crop or crew cut keeps you cool and sharp.', 'sun'),
  ('seasonal', 'Winter Hair Care', 'Cold air dries hair out. Use a light conditioner and avoid hot water when washing. Your scalp will thank you.', 'snowflake');
