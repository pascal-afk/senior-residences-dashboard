-- CRM Test Data
-- Sample contact history, notes, and initial scores

-- Update existing residences with CRM fields
UPDATE senior_residences SET
    contact_status = 'never_contacted',
    lead_stage = 'cold',
    priority_level = 3,
    digital_readiness_score = 
        CASE 
            WHEN email IS NOT NULL AND website IS NOT NULL THEN 75
            WHEN email IS NOT NULL OR website IS NOT NULL THEN 50
            ELSE 25
        END,
    has_website = CASE WHEN website IS NOT NULL THEN 1 ELSE 0 END,
    has_email = CASE WHEN email IS NOT NULL THEN 1 ELSE 0 END
WHERE contact_status IS NULL;

-- Add some contact history for a few residences
INSERT INTO contact_history (id, residence_id, contact_type, contact_date, contacted_by, status, outcome, notes) VALUES
('ch001', 'de-001', 'phone', datetime('now', '-5 days'), 'Max Mustermann', 'success', 'interested', 'Sehr interessiert an digitalem Kommunikationstool. Entscheider möchte Angebot.'),
('ch002', 'de-001', 'email', datetime('now', '-10 days'), 'Max Mustermann', 'success', 'info_sent', 'Erste Infos per E-Mail versendet'),
('ch003', 'fr-001', 'phone', datetime('now', '-3 days'), 'Marie Schmidt', 'success', 'callback_requested', 'Direktor nicht erreichbar, Rückruf erbeten'),
('ch004', 'uk-001', 'email', datetime('now', '-7 days'), 'John Smith', 'success', 'demo_scheduled', 'Demo für nächste Woche vereinbart'),
('ch005', 'de-002', 'phone', datetime('now', '-2 days'), 'Max Mustermann', 'no_answer', 'attempted', 'Niemand erreichbar'),
('ch006', 'es-001', 'post', datetime('now', '-15 days'), 'Marie Schmidt', 'success', 'info_sent', 'Informationsmaterial per Post versendet');

-- Add notes
INSERT INTO residence_notes (id, residence_id, note_type, content, created_by) VALUES
('note001', 'de-001', 'decision_maker', 'Ansprechpartner: Dr. Schmidt, Geschäftsführer, sehr technikaffin', 'Max Mustermann'),
('note002', 'de-001', 'important', 'Budget für Digitalisierung: 50.000€ pro Jahr verfügbar', 'Max Mustermann'),
('note003', 'fr-001', 'general', 'Französischsprachige Dokumentation erforderlich', 'Marie Schmidt'),
('note004', 'uk-001', 'technical', 'Nutzen bereits ein CRM-System (Salesforce), Integration möglich?', 'John Smith'),
('note005', 'de-002', 'important', 'Großes Interesse an Bewohner-Kommunikation', 'Max Mustermann');

-- Add AI scores for high-potential residences
INSERT INTO ai_scores (id, residence_id, score_type, score, confidence, reasoning, factors, evaluated_by) VALUES
('score001', 'de-001', 'digital_readiness', 85, 0.9, 
 'Einrichtung verfügt über vollständige digitale Infrastruktur (Website, E-Mail). Großer Betreiber mit hoher Innovationsbereitschaft. Sehr gute Bewertung deutet auf professionelles Management hin.',
 '{"digital_infrastructure": 90, "operator_size": 85, "innovation_potential": 80, "budget_potential": 85}',
 'llm_agent'),

('score002', 'uk-001', 'digital_readiness', 90, 0.95,
 'Exzellente digitale Präsenz und sehr hohe Bewertung. Großer privater Betreiber mit nachweislicher Technikaffinität. Idealer Kandidat für digitale Tools.',
 '{"digital_infrastructure": 95, "operator_size": 90, "innovation_potential": 90, "budget_potential": 85}',
 'llm_agent'),

('score003', 'fr-001', 'digital_readiness', 75, 0.85,
 'Gute digitale Basis vorhanden. Größerer Betreiber mit solider Bewertung. Französischer Markt interessant für Expansion.',
 '{"digital_infrastructure": 80, "operator_size": 75, "innovation_potential": 70, "budget_potential": 75}',
 'llm_agent'),

('score004', 'de-003', 'digital_readiness', 80, 0.88,
 'Sehr große Einrichtung (150 Plätze) mit exzellenter Bewertung. Non-Profit Betreiber oft innovativ bei sozialen Tools.',
 '{"digital_infrastructure": 85, "operator_size": 90, "innovation_potential": 75, "budget_potential": 70}',
 'llm_agent');

-- Update residences with lead scores and stages
UPDATE senior_residences SET
    lead_score = 85,
    lead_stage = 'hot',
    priority_level = 1,
    last_contact_date = datetime('now', '-5 days'),
    last_contact_type = 'phone',
    contact_status = 'in_conversation',
    next_follow_up_date = date('now', '+3 days'),
    sales_assigned_to = 'Max Mustermann'
WHERE id = 'de-001';

UPDATE senior_residences SET
    lead_score = 90,
    lead_stage = 'qualified',
    priority_level = 1,
    last_contact_date = datetime('now', '-7 days'),
    last_contact_type = 'email',
    contact_status = 'qualified',
    next_follow_up_date = date('now', '+1 day'),
    sales_assigned_to = 'John Smith'
WHERE id = 'uk-001';

UPDATE senior_residences SET
    lead_score = 75,
    lead_stage = 'warm',
    priority_level = 2,
    last_contact_date = datetime('now', '-3 days'),
    last_contact_type = 'phone',
    contact_status = 'attempted',
    next_follow_up_date = date('now', '+5 days'),
    sales_assigned_to = 'Marie Schmidt'
WHERE id = 'fr-001';

UPDATE senior_residences SET
    lead_score = 80,
    lead_stage = 'warm',
    priority_level = 2,
    digital_readiness_score = 85,
    contact_status = 'never_contacted',
    priority_level = 1
WHERE id = 'de-003';

-- Add tags
INSERT INTO residence_tags (id, residence_id, tag, category) VALUES
('tag001', 'de-001', 'high_priority', 'priority'),
('tag002', 'de-001', 'tech_savvy', 'segment'),
('tag003', 'de-001', 'budget_approved', 'status'),
('tag004', 'uk-001', 'demo_requested', 'status'),
('tag005', 'uk-001', 'high_priority', 'priority'),
('tag006', 'fr-001', 'international', 'segment'),
('tag007', 'de-003', 'large_capacity', 'segment');

-- Create a sample campaign
INSERT INTO campaigns (id, name, campaign_type, target_criteria, status, total_targets, created_by) VALUES
('camp001', 'Q1 2026 - Digitale Tools Deutschland', 'email', 
 '{"countries": ["DE"], "min_capacity": 80, "has_email": true, "digital_readiness": 70}',
 'active', 3, 'Max Mustermann');

-- Add campaign targets
INSERT INTO campaign_targets (id, campaign_id, residence_id, status) VALUES
('ct001', 'camp001', 'de-001', 'contacted'),
('ct002', 'camp001', 'de-002', 'pending'),
('ct003', 'camp001', 'de-003', 'pending');

-- Update campaign target that was contacted
UPDATE campaign_targets SET
    contacted_at = datetime('now', '-5 days'),
    outcome = 'interested',
    status = 'success'
WHERE id = 'ct001';

UPDATE campaigns SET
    contacted = 1,
    successful = 1
WHERE id = 'camp001';
