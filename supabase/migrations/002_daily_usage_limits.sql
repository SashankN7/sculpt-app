-- Sculpt App: Daily usage limit columns
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Add daily usage tracking columns for premium/trial limits
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS previews_today INTEGER DEFAULT 0;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS last_preview_date TEXT;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS barber_cards_today INTEGER DEFAULT 0;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS last_barber_card_date TEXT;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS analyses_today INTEGER DEFAULT 0;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS last_analysis_date TEXT;
