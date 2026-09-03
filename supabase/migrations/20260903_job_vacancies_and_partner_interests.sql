-- Migration: Job Vacancies & Partner Interests Tables

-- 1. Table: job_vacancies
CREATE TABLE IF NOT EXISTS public.job_vacancies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Full-time', -- Full-time, Meio-tempo, Contrato, Projecto
    description TEXT NOT NULL,
    requirements TEXT,
    contact_email_or_link TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, closed, archived
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_job_vacancies_user_id ON public.job_vacancies(user_id);
CREATE INDEX IF NOT EXISTS idx_job_vacancies_status ON public.job_vacancies(status);

-- Enable RLS
ALTER TABLE public.job_vacancies ENABLE ROW LEVEL SECURITY;

-- Policies for job_vacancies
CREATE POLICY "Public read active jobs" ON public.job_vacancies
    FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert job" ON public.job_vacancies
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own job" ON public.job_vacancies
    FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can delete own job" ON public.job_vacancies
    FOR DELETE USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- 2. Table: partner_interests (Manifestação de Interesse - Plano Parceiro)
CREATE TABLE IF NOT EXISTS public.partner_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    province TEXT NOT NULL,
    activity_sector TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente', -- pendente, em_contacto, aprovado, arquivado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.partner_interests ENABLE ROW LEVEL SECURITY;

-- Policies for partner_interests
CREATE POLICY "Everyone can insert partner interest" ON public.partner_interests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all partner interests" ON public.partner_interests
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update partner interests" ON public.partner_interests
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));
