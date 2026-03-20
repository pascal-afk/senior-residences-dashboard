/**
 * CRM & AI API Routes
 * Handles contact management, AI evaluations, and intelligent queries
 */

import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

// Lazy import for MCP agents to avoid initialization errors
async function getFrontendAgent(DB: D1Database) {
  const { FrontendAgent } = await import('./mcp-agents')
  return new FrontendAgent(DB)
}

const crm = new Hono<{ Bindings: Bindings }>()

// ===== CRM ROUTES =====

// Add contact record
crm.post('/contact', async (c) => {
  const { DB } = c.env
  const { residence_id, contact_type, status, outcome, notes, contacted_by, follow_up_date } = await c.req.json()

  try {
    const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const contact_date = new Date().toISOString()

    await DB.prepare(`
      INSERT INTO contact_history (
        id, residence_id, contact_type, contact_date, 
        contacted_by, status, outcome, notes, follow_up_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, residence_id, contact_type, contact_date,
      contacted_by, status, outcome, notes, follow_up_date
    ).run()

    // Update residence
    await DB.prepare(`
      UPDATE senior_residences
      SET last_contact_date = ?,
          last_contact_type = ?,
          contact_status = ?,
          contact_attempts = contact_attempts + 1
      WHERE id = ?
    `).bind(contact_date, contact_type, status, residence_id).run()

    return c.json({ success: true, contact_id: id })
  } catch (error) {
    return c.json({ error: 'Failed to add contact' }, 500)
  }
})

// Get contact history for a residence
crm.get('/contact/:residence_id', async (c) => {
  const { DB } = c.env
  const residence_id = c.req.param('residence_id')

  try {
    const result = await DB.prepare(`
      SELECT * FROM contact_history
      WHERE residence_id = ?
      ORDER BY contact_date DESC
    `).bind(residence_id).all()

    return c.json(result.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch contact history' }, 500)
  }
})

// Add note
crm.post('/notes', async (c) => {
  const { DB } = c.env
  const { residence_id, note_type, content, created_by } = await c.req.json()

  try {
    const id = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await DB.prepare(`
      INSERT INTO residence_notes (id, residence_id, note_type, content, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, residence_id, note_type, content, created_by).run()

    return c.json({ success: true, note_id: id })
  } catch (error) {
    return c.json({ error: 'Failed to add note' }, 500)
  }
})

// Get notes for a residence
crm.get('/notes/:residence_id', async (c) => {
  const { DB } = c.env
  const residence_id = c.req.param('residence_id')

  try {
    const result = await DB.prepare(`
      SELECT * FROM residence_notes
      WHERE residence_id = ?
      ORDER BY created_at DESC
    `).bind(residence_id).all()

    return c.json(result.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch notes' }, 500)
  }
})

// Update residence CRM status
crm.put('/residence/:id/status', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const {
    contact_status,
    lead_stage,
    priority_level,
    sales_assigned_to,
    next_follow_up_date
  } = await c.req.json()

  try {
    await DB.prepare(`
      UPDATE senior_residences
      SET contact_status = ?,
          lead_stage = ?,
          priority_level = ?,
          sales_assigned_to = ?,
          next_follow_up_date = ?
      WHERE id = ?
    `).bind(
      contact_status, lead_stage, priority_level,
      sales_assigned_to, next_follow_up_date, id
    ).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update status' }, 500)
  }
})

// Get CRM dashboard stats
crm.get('/stats', async (c) => {
  const { DB } = c.env

  try {
    // Contact status distribution
    const statusStats = await DB.prepare(`
      SELECT contact_status, COUNT(*) as count
      FROM senior_residences
      WHERE is_active = 1 AND contact_status IS NOT NULL
      GROUP BY contact_status
    `).all()

    // Lead stage distribution
    const stageStats = await DB.prepare(`
      SELECT lead_stage, COUNT(*) as count
      FROM senior_residences
      WHERE is_active = 1 AND lead_stage IS NOT NULL
      GROUP BY lead_stage
    `).all()

    // Recent contacts
    const recentContacts = await DB.prepare(`
      SELECT COUNT(*) as count
      FROM contact_history
      WHERE contact_date >= datetime('now', '-7 days')
    `).first()

    // Follow-ups due
    const followUpsDue = await DB.prepare(`
      SELECT COUNT(*) as count
      FROM senior_residences
      WHERE next_follow_up_date <= date('now')
      AND next_follow_up_date IS NOT NULL
      AND is_active = 1
    `).first()

    return c.json({
      contact_status: statusStats.results,
      lead_stages: stageStats.results,
      recent_contacts_7d: recentContacts?.count || 0,
      follow_ups_due: followUpsDue?.count || 0
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch CRM stats' }, 500)
  }
})

// ===== AI EVALUATION ROUTES =====

// Evaluate single residence
crm.post('/ai/evaluate/:residence_id', async (c) => {
  const { DB } = c.env
  const residence_id = c.req.param('residence_id')
  const { criteria } = await c.req.json()

  try {
    const agent = await getFrontendAgent(DB)
    const result = await agent.evaluateResidence(residence_id, criteria)

    return c.json(result)
  } catch (error) {
    return c.json({ error: 'Evaluation failed', details: error.message }, 500)
  }
})

// Batch evaluate residences
crm.post('/ai/evaluate-batch', async (c) => {
  const { DB } = c.env
  const { residence_ids, criteria } = await c.req.json()

  try {
    const agent = await getFrontendAgent(DB)
    const results = await agent.evaluateBatch(residence_ids, criteria)

    return c.json({ results, total: results.length })
  } catch (error) {
    return c.json({ error: 'Batch evaluation failed', details: error.message }, 500)
  }
})

// Intelligent query with AI
crm.post('/ai/query', async (c) => {
  const { DB } = c.env
  const { question, filters } = await c.req.json()

  try {
    const agent = await getFrontendAgent(DB)
    const result = await agent.intelligentQuery(question, filters || {})

    return c.json(result)
  } catch (error) {
    return c.json({ error: 'Query failed', details: error.message }, 500)
  }
})

// Get AI scores for a residence
crm.get('/ai/scores/:residence_id', async (c) => {
  const { DB } = c.env
  const residence_id = c.req.param('residence_id')

  try {
    const result = await DB.prepare(`
      SELECT * FROM ai_scores
      WHERE residence_id = ?
      ORDER BY evaluated_at DESC
      LIMIT 10
    `).bind(residence_id).all()

    return c.json(result.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch scores' }, 500)
  }
})

// Auto-evaluate residences matching criteria
crm.post('/ai/auto-evaluate', async (c) => {
  const { DB } = c.env
  const { filters, criteria, limit } = await c.req.json()

  try {
    // Build query based on filters
    let query = 'SELECT id FROM senior_residences WHERE is_active = 1'
    const params = []

    if (filters.country) {
      query += ' AND country_code = ?'
      params.push(filters.country)
    }
    if (filters.has_email) {
      query += ' AND email IS NOT NULL'
    }
    if (filters.has_website) {
      query += ' AND website IS NOT NULL'
    }
    if (filters.min_capacity) {
      query += ' AND capacity >= ?'
      params.push(filters.min_capacity)
    }

    query += ` LIMIT ${limit || 50}`

    const result = await DB.prepare(query).bind(...params).all()
    const residence_ids = result.results.map(r => r.id)

    // Start batch evaluation
    const agent = await getFrontendAgent(DB)
    const evaluations = await agent.evaluateBatch(residence_ids, criteria)

    return c.json({
      success: true,
      evaluated: evaluations.length,
      results: evaluations
    })
  } catch (error) {
    return c.json({ error: 'Auto-evaluation failed', details: error.message }, 500)
  }
})

// ===== CAMPAIGN ROUTES =====

// Create campaign
crm.post('/campaigns', async (c) => {
  const { DB } = c.env
  const { name, campaign_type, target_criteria, created_by } = await c.req.json()

  try {
    const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await DB.prepare(`
      INSERT INTO campaigns (
        id, name, campaign_type, target_criteria, 
        status, created_by, start_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, name, campaign_type, JSON.stringify(target_criteria),
      'draft', created_by, new Date().toISOString()
    ).run()

    return c.json({ success: true, campaign_id: id })
  } catch (error) {
    return c.json({ error: 'Failed to create campaign' }, 500)
  }
})

// Get all campaigns
crm.get('/campaigns', async (c) => {
  const { DB } = c.env

  try {
    const result = await DB.prepare(`
      SELECT * FROM campaigns
      ORDER BY created_at DESC
    `).all()

    return c.json(result.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch campaigns' }, 500)
  }
})

// Add targets to campaign
crm.post('/campaigns/:campaign_id/targets', async (c) => {
  const { DB } = c.env
  const campaign_id = c.req.param('campaign_id')
  const { residence_ids } = await c.req.json()

  try {
    for (const residence_id of residence_ids) {
      const id = `target_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await DB.prepare(`
        INSERT INTO campaign_targets (id, campaign_id, residence_id, status)
        VALUES (?, ?, ?, ?)
      `).bind(id, campaign_id, residence_id, 'pending').run()
    }

    // Update campaign total_targets
    await DB.prepare(`
      UPDATE campaigns
      SET total_targets = (
        SELECT COUNT(*) FROM campaign_targets WHERE campaign_id = ?
      )
      WHERE id = ?
    `).bind(campaign_id, campaign_id).run()

    return c.json({ success: true, added: residence_ids.length })
  } catch (error) {
    return c.json({ error: 'Failed to add targets' }, 500)
  }
})

export default crm
