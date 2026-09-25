-- SQL schema for IIAM module (Cloud SQL PostgreSQL)

CREATE SCHEMA IF NOT EXISTS iiam;
CREATE TABLE IF NOT EXISTS iiam.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    nuit VARCHAR(50) NOT NULL UNIQUE,
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS iiam.variety_followup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variety_name VARCHAR(255) NOT NULL,
    launch_date DATE NOT NULL,
    status VARCHAR(100) NOT NULL,
    notes TEXT,
    company_id UUID REFERENCES iiam.companies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast look‑ups
CREATE INDEX IF NOT EXISTS idx_variety_company ON iiam.variety_followup (company_id);
CREATE INDEX IF NOT EXISTS idx_variety_name ON iiam.variety_followup (variety_name);
