-- Add CRM fields to senior_residences table
-- Migration 0003

-- Contact status tracking
ALTER TABLE senior_residences ADD COLUMN last_contact_date TEXT;
ALTER TABLE senior_residences ADD COLUMN last_contact_type TEXT;
ALTER TABLE senior_residences ADD COLUMN contact_status TEXT; -- 'never_contacted', 'attempted', 'in_conversation', 'qualified', 'rejected', 'customer'
ALTER TABLE senior_residences ADD COLUMN contact_attempts INTEGER DEFAULT 0;

-- Lead scoring
ALTER TABLE senior_residences ADD COLUMN lead_score REAL; -- Overall AI-generated score
ALTER TABLE senior_residences ADD COLUMN lead_stage TEXT; -- 'cold', 'warm', 'hot', 'qualified', 'customer'
ALTER TABLE senior_residences ADD COLUMN priority_level INTEGER DEFAULT 3; -- 1=highest, 5=lowest

-- Decision maker info
ALTER TABLE senior_residences ADD COLUMN decision_maker_name TEXT;
ALTER TABLE senior_residences ADD COLUMN decision_maker_role TEXT;
ALTER TABLE senior_residences ADD COLUMN decision_maker_phone TEXT;
ALTER TABLE senior_residences ADD COLUMN decision_maker_email TEXT;

-- Digital readiness
ALTER TABLE senior_residences ADD COLUMN has_website INTEGER DEFAULT 0;
ALTER TABLE senior_residences ADD COLUMN has_email INTEGER DEFAULT 0;
ALTER TABLE senior_residences ADD COLUMN digital_readiness_score REAL; -- AI-scored
ALTER TABLE senior_residences ADD COLUMN tech_adoption_level TEXT; -- 'low', 'medium', 'high'

-- Business potential
ALTER TABLE senior_residences ADD COLUMN estimated_budget TEXT;
ALTER TABLE senior_residences ADD COLUMN contract_value REAL;
ALTER TABLE senior_residences ADD COLUMN annual_revenue_potential REAL;

-- Sales process
ALTER TABLE senior_residences ADD COLUMN sales_assigned_to TEXT;
ALTER TABLE senior_residences ADD COLUMN next_follow_up_date TEXT;
ALTER TABLE senior_residences ADD COLUMN probability_to_close REAL; -- 0-100

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_contact_status ON senior_residences(contact_status);
CREATE INDEX IF NOT EXISTS idx_lead_stage ON senior_residences(lead_stage);
CREATE INDEX IF NOT EXISTS idx_priority_level ON senior_residences(priority_level);
CREATE INDEX IF NOT EXISTS idx_sales_assigned ON senior_residences(sales_assigned_to);
CREATE INDEX IF NOT EXISTS idx_follow_up_date ON senior_residences(next_follow_up_date);
