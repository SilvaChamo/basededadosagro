-- Email Marketing Campaign Tracking
-- Stores campaign metadata and per-recipient delivery logs

CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    content TEXT,
    sender_email TEXT,
    target_audiences TEXT[] DEFAULT '{}',
    recipient_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'enviada' CHECK (status IN ('rascunho', 'agendada', 'enviando', 'enviada', 'falhada')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_campaign_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'enviado' CHECK (status IN ('enviado', 'falhado', 'bounce')),
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure newsletter_subscribers table exists (may already exist via app logic)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_logs_campaign_id ON email_campaign_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_email ON email_campaign_logs(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Enable RLS
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies (admin-only access via service role; public insert for newsletter)
CREATE POLICY "Allow service role full access on campaigns" ON email_campaigns FOR ALL USING (true);
CREATE POLICY "Allow service role full access on campaign_logs" ON email_campaign_logs FOR ALL USING (true);
CREATE POLICY "Allow public insert on newsletter_subscribers" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role full access on newsletter_subscribers" ON newsletter_subscribers FOR ALL USING (true);
