-- CRM Extension: Contact Management & AI Scoring
-- Migration 0002

-- Contact History Table
CREATE TABLE IF NOT EXISTS contact_history (
    id TEXT PRIMARY KEY NOT NULL,
    residence_id TEXT NOT NULL,
    contact_type TEXT NOT NULL, -- 'phone', 'email', 'post', 'meeting', 'visit'
    contact_date TEXT NOT NULL,
    contacted_by TEXT,
    status TEXT, -- 'attempted', 'success', 'no_answer', 'wrong_number', 'email_bounced', 'meeting_scheduled'
    outcome TEXT, -- 'interested', 'not_interested', 'callback_requested', 'info_sent', 'demo_scheduled', 'contract_signed'
    notes TEXT,
    follow_up_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (residence_id) REFERENCES senior_residences(id)
);

CREATE INDEX IF NOT EXISTS idx_contact_residence ON contact_history(residence_id);
CREATE INDEX IF NOT EXISTS idx_contact_date ON contact_history(contact_date);
CREATE INDEX IF NOT EXISTS idx_contact_type ON contact_history(contact_type);
CREATE INDEX IF NOT EXISTS idx_contact_outcome ON contact_history(outcome);

-- Residence Notes
CREATE TABLE IF NOT EXISTS residence_notes (
    id TEXT PRIMARY KEY NOT NULL,
    residence_id TEXT NOT NULL,
    note_type TEXT, -- 'general', 'important', 'technical', 'decision_maker'
    content TEXT NOT NULL,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (residence_id) REFERENCES senior_residences(id)
);

CREATE INDEX IF NOT EXISTS idx_notes_residence ON residence_notes(residence_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON residence_notes(note_type);

-- AI Scoring & Classification
CREATE TABLE IF NOT EXISTS ai_scores (
    id TEXT PRIMARY KEY NOT NULL,
    residence_id TEXT NOT NULL,
    score_type TEXT NOT NULL, -- 'digital_readiness', 'budget_fit', 'decision_maker_access', 'innovation_openness'
    score REAL NOT NULL, -- 0-100
    confidence REAL, -- 0-1
    reasoning TEXT, -- AI explanation
    factors TEXT, -- JSON with scoring factors
    evaluated_by TEXT, -- 'llm', 'judge', 'manual'
    evaluated_at TEXT DEFAULT (datetime('now')),
    model_version TEXT,
    FOREIGN KEY (residence_id) REFERENCES senior_residences(id)
);

CREATE INDEX IF NOT EXISTS idx_scores_residence ON ai_scores(residence_id);
CREATE INDEX IF NOT EXISTS idx_scores_type ON ai_scores(score_type);
CREATE INDEX IF NOT EXISTS idx_scores_score ON ai_scores(score);

-- Campaign Management
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    campaign_type TEXT, -- 'email', 'phone', 'post', 'mixed'
    target_criteria TEXT, -- JSON with filter criteria
    status TEXT, -- 'draft', 'active', 'paused', 'completed'
    start_date TEXT,
    end_date TEXT,
    total_targets INTEGER DEFAULT 0,
    contacted INTEGER DEFAULT 0,
    successful INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_campaign_status ON campaigns(status);

-- Campaign Targets (many-to-many)
CREATE TABLE IF NOT EXISTS campaign_targets (
    id TEXT PRIMARY KEY NOT NULL,
    campaign_id TEXT NOT NULL,
    residence_id TEXT NOT NULL,
    status TEXT, -- 'pending', 'contacted', 'success', 'failed', 'skipped'
    contacted_at TEXT,
    outcome TEXT,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (residence_id) REFERENCES senior_residences(id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_targets_campaign ON campaign_targets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_targets_residence ON campaign_targets(residence_id);
CREATE INDEX IF NOT EXISTS idx_campaign_targets_status ON campaign_targets(status);

-- Tags for flexible categorization
CREATE TABLE IF NOT EXISTS residence_tags (
    id TEXT PRIMARY KEY NOT NULL,
    residence_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    category TEXT, -- 'priority', 'segment', 'status', 'custom'
    added_by TEXT,
    added_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (residence_id) REFERENCES senior_residences(id)
);

CREATE INDEX IF NOT EXISTS idx_tags_residence ON residence_tags(residence_id);
CREATE INDEX IF NOT EXISTS idx_tags_tag ON residence_tags(tag);

-- AI Evaluation Tasks Queue
CREATE TABLE IF NOT EXISTS ai_evaluation_queue (
    id TEXT PRIMARY KEY NOT NULL,
    residence_id TEXT,
    query TEXT NOT NULL, -- The question to evaluate
    query_type TEXT, -- 'scoring', 'classification', 'recommendation'
    criteria TEXT, -- JSON with evaluation criteria
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    priority INTEGER DEFAULT 5,
    result TEXT, -- JSON with evaluation result
    llm_response TEXT,
    judge_response TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    started_at TEXT,
    completed_at TEXT,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_eval_queue_status ON ai_evaluation_queue(status);
CREATE INDEX IF NOT EXISTS idx_eval_queue_priority ON ai_evaluation_queue(priority);

-- Add CRM fields to senior_residences
-- (We'll use ALTER TABLE statements)

-- Add custom fields for CRM tracking
-- These will be added via ALTER TABLE in the application
