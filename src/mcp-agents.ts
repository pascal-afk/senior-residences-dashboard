/**
 * MCP Architecture: AI Evaluation System
 * 
 * Three-Agent System:
 * 1. Frontend Agent: Receives queries from UI, orchestrates evaluation
 * 2. LLM Agent: Analyzes data and provides reasoning
 * 3. Judge Agent: Validates LLM outputs and provides scores
 */

import OpenAI from 'openai'
import fs from 'fs'
import yaml from 'js-yaml'
import { homedir } from 'os'
import { join } from 'path'

// Load LLM configuration
const configPath = join(homedir(), '.genspark_llm.yaml')
let config = null

if (fs.existsSync(configPath)) {
  const fileContents = fs.readFileSync(configPath, 'utf8')
  config = yaml.load(fileContents)
}

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: config?.openai?.api_key || process.env.OPENAI_API_KEY || process.env.GENSPARK_TOKEN,
  baseURL: config?.openai?.base_url || process.env.OPENAI_BASE_URL,
})

/**
 * LLM Agent: Analyzes residences and provides reasoning
 */
export class LLMAgent {
  constructor() {
    this.model = 'gpt-5'
  }

  /**
   * Evaluate a residence based on criteria
   */
  async evaluate(residence, criteria) {
    const prompt = `Du bist ein Experte für die Bewertung von Seniorenresidenzen.

**Einrichtung:**
- Name: ${residence.name}
- Ort: ${residence.city}, ${residence.country}
- Typ: ${residence.facility_type || 'unbekannt'}
- Kapazität: ${residence.capacity || 'unbekannt'} Plätze
- Betreiber: ${residence.operator || 'unbekannt'} (${residence.operator_type || 'unbekannt'})
- Kontakt: ${residence.phone ? 'Telefon ✓' : 'Telefon ✗'}, ${residence.email ? 'E-Mail ✓' : 'E-Mail ✗'}, ${residence.website ? 'Website ✓' : 'Website ✗'}
- Bewertung: ${residence.rating || 'keine'} (${residence.rating_count || 0} Bewertungen)
- Preis: ${residence.price_min && residence.price_max ? `${residence.price_min}-${residence.price_max} ${residence.price_currency}` : 'unbekannt'}

**Bewertungskriterien:**
${criteria}

**Aufgabe:**
Analysiere diese Einrichtung basierend auf den Kriterien und gib eine strukturierte Bewertung ab.

Antworte im folgenden JSON-Format:
{
  "score": <0-100>,
  "reasoning": "<Detaillierte Begründung>",
  "factors": {
    "digital_readiness": <0-100>,
    "contact_quality": <0-100>,
    "size_fit": <0-100>,
    "location_relevance": <0-100>,
    "operator_profile": <0-100>
  },
  "recommendation": "<Empfehlung: 'high_priority', 'medium_priority', 'low_priority', 'not_suitable'>",
  "next_steps": "<Konkrete Handlungsempfehlungen>"
}`

    try {
      const completion = await client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'Du bist ein KI-Assistent für Sales Intelligence im Gesundheitswesen.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      })

      const response = completion.choices[0].message.content
      
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // Fallback if JSON parsing fails
      return {
        score: 50,
        reasoning: response,
        factors: {},
        recommendation: 'medium_priority',
        next_steps: 'Manuelle Überprüfung erforderlich'
      }
    } catch (error) {
      console.error('LLM Agent Error:', error)
      throw new Error(`LLM evaluation failed: ${error.message}`)
    }
  }

  /**
   * Batch evaluate multiple residences
   */
  async evaluateBatch(residences, criteria, maxConcurrent = 5) {
    const results = []
    
    for (let i = 0; i < residences.length; i += maxConcurrent) {
      const batch = residences.slice(i, i + maxConcurrent)
      const batchResults = await Promise.all(
        batch.map(residence => this.evaluate(residence, criteria))
      )
      results.push(...batchResults)
    }
    
    return results
  }

  /**
   * Answer natural language queries about residences
   */
  async query(residences, question) {
    const residenceSummary = residences.slice(0, 20).map(r => 
      `- ${r.name} (${r.city}, ${r.country}): ${r.facility_type}, ${r.capacity} Plätze, Kontakt: ${r.phone ? 'Tel ✓' : 'Tel ✗'}/${r.email ? 'Email ✓' : 'Email ✗'}/${r.website ? 'Web ✓' : 'Web ✗'}`
    ).join('\n')

    const prompt = `Du hast Zugriff auf ${residences.length} Seniorenresidenzen in Europa.

**Beispiel-Einrichtungen (erste 20):**
${residenceSummary}

**Frage des Benutzers:**
${question}

**Aufgabe:**
Beantworte die Frage basierend auf den verfügbaren Daten. Gib konkrete Empfehlungen und Reasoning.

Antworte im JSON-Format:
{
  "answer": "<Antwort auf die Frage>",
  "matching_criteria": "<Was erfüllt die Kriterien>",
  "recommended_count": <Anzahl empfohlener Einrichtungen>,
  "filter_suggestions": {
    "countries": [<Ländercodes>],
    "min_capacity": <Zahl>,
    "has_email": <true/false>,
    "has_website": <true/false>,
    "min_rating": <Zahl>
  },
  "reasoning": "<Detaillierte Begründung>"
}`

    try {
      const completion = await client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'Du bist ein KI-Assistent für intelligente Datenanalyse von Seniorenresidenzen.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      })

      const response = completion.choices[0].message.content
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      return {
        answer: response,
        reasoning: 'Strukturierte Antwort nicht verfügbar',
        recommended_count: 0,
        filter_suggestions: {}
      }
    } catch (error) {
      console.error('LLM Query Error:', error)
      throw new Error(`Query failed: ${error.message}`)
    }
  }
}

/**
 * Judge Agent: Validates and scores LLM outputs
 */
export class JudgeAgent {
  constructor() {
    this.model = 'gpt-5'
  }

  /**
   * Review and validate LLM evaluation
   */
  async review(residence, llmEvaluation, criteria) {
    const prompt = `Du bist ein kritischer Reviewer, der KI-Bewertungen überprüft und validiert.

**Originaldaten:**
- Name: ${residence.name}
- Kapazität: ${residence.capacity}
- Kontakt: Tel: ${residence.phone ? 'Ja' : 'Nein'}, Email: ${residence.email ? 'Ja' : 'Nein'}, Web: ${residence.website ? 'Ja' : 'Nein'}
- Betreiber: ${residence.operator} (${residence.operator_type})

**Kriterien:**
${criteria}

**LLM Bewertung:**
- Score: ${llmEvaluation.score}
- Reasoning: ${llmEvaluation.reasoning}
- Empfehlung: ${llmEvaluation.recommendation}

**Aufgabe:**
Überprüfe die Bewertung des LLM kritisch:
1. Ist der Score angemessen?
2. Ist das Reasoning logisch und vollständig?
3. Stimmen die Faktoren mit den Daten überein?
4. Ist die Empfehlung passend?

Antworte im JSON-Format:
{
  "validation_passed": <true/false>,
  "confidence": <0-1>,
  "adjusted_score": <0-100>,
  "issues_found": [<Liste von Problemen>],
  "suggestions": "<Verbesserungsvorschläge>",
  "final_verdict": "<approved/needs_review/rejected>"
}`

    try {
      const completion = await client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'Du bist ein kritischer Qualitätsprüfer für KI-Bewertungen.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      })

      const response = completion.choices[0].message.content
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      return {
        validation_passed: true,
        confidence: 0.5,
        adjusted_score: llmEvaluation.score,
        issues_found: [],
        suggestions: response,
        final_verdict: 'needs_review'
      }
    } catch (error) {
      console.error('Judge Agent Error:', error)
      throw new Error(`Judge review failed: ${error.message}`)
    }
  }
}

/**
 * Frontend Agent: Orchestrates the evaluation process
 */
export class FrontendAgent {
  constructor(db) {
    this.db = db
    this.llmAgent = new LLMAgent()
    this.judgeAgent = new JudgeAgent()
  }

  /**
   * Evaluate a single residence
   */
  async evaluateResidence(residenceId, criteria) {
    try {
      // 1. Fetch residence data
      const residence = await this.db.prepare(
        'SELECT * FROM senior_residences WHERE id = ?'
      ).bind(residenceId).first()

      if (!residence) {
        throw new Error('Residence not found')
      }

      // 2. LLM evaluation
      const llmResult = await this.llmAgent.evaluate(residence, criteria)

      // 3. Judge review
      const judgeResult = await this.judgeAgent.review(residence, llmResult, criteria)

      // 4. Save results
      const scoreId = `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await this.db.prepare(`
        INSERT INTO ai_scores (
          id, residence_id, score_type, score, confidence, 
          reasoning, factors, evaluated_by, model_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        scoreId,
        residenceId,
        'digital_readiness',
        judgeResult.adjusted_score || llmResult.score,
        judgeResult.confidence || 0.8,
        llmResult.reasoning,
        JSON.stringify({
          llm_factors: llmResult.factors,
          judge_verdict: judgeResult.final_verdict,
          judge_issues: judgeResult.issues_found
        }),
        'mcp_system',
        'gpt-5'
      ).run()

      // 5. Update residence lead score
      await this.db.prepare(`
        UPDATE senior_residences 
        SET lead_score = ?, 
            lead_stage = ?,
            digital_readiness_score = ?
        WHERE id = ?
      `).bind(
        judgeResult.adjusted_score || llmResult.score,
        this.mapRecommendationToStage(llmResult.recommendation),
        llmResult.factors.digital_readiness || 50,
        residenceId
      ).run()

      return {
        success: true,
        residence_id: residenceId,
        llm_evaluation: llmResult,
        judge_review: judgeResult,
        final_score: judgeResult.adjusted_score || llmResult.score,
        confidence: judgeResult.confidence
      }
    } catch (error) {
      console.error('Frontend Agent Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Batch evaluate multiple residences
   */
  async evaluateBatch(residenceIds, criteria) {
    const results = []
    
    for (const id of residenceIds) {
      const result = await this.evaluateResidence(id, criteria)
      results.push(result)
    }
    
    return results
  }

  /**
   * Intelligent query with LLM analysis
   */
  async intelligentQuery(question, filters = {}) {
    try {
      // 1. Fetch matching residences
      let query = 'SELECT * FROM senior_residences WHERE is_active = 1'
      const params = []

      if (filters.country) {
        query += ' AND country_code = ?'
        params.push(filters.country)
      }

      query += ' LIMIT 100'

      const result = await this.db.prepare(query).bind(...params).all()
      const residences = result.results || []

      // 2. LLM analyzes and answers
      const llmResponse = await this.llmAgent.query(residences, question)

      // 3. Apply suggested filters
      const filtered = this.applyFilterSuggestions(residences, llmResponse.filter_suggestions)

      return {
        success: true,
        query: question,
        answer: llmResponse.answer,
        reasoning: llmResponse.reasoning,
        recommended_count: llmResponse.recommended_count,
        matching_residences: filtered.slice(0, 50),
        total_analyzed: residences.length,
        filter_suggestions: llmResponse.filter_suggestions
      }
    } catch (error) {
      console.error('Intelligent Query Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Helper: Map recommendation to lead stage
   */
  mapRecommendationToStage(recommendation) {
    const mapping = {
      'high_priority': 'hot',
      'medium_priority': 'warm',
      'low_priority': 'cold',
      'not_suitable': 'cold'
    }
    return mapping[recommendation] || 'warm'
  }

  /**
   * Helper: Apply filter suggestions
   */
  applyFilterSuggestions(residences, suggestions) {
    return residences.filter(r => {
      if (suggestions.countries && suggestions.countries.length > 0) {
        if (!suggestions.countries.includes(r.country_code)) return false
      }
      if (suggestions.min_capacity && r.capacity < suggestions.min_capacity) return false
      if (suggestions.has_email && !r.email) return false
      if (suggestions.has_website && !r.website) return false
      if (suggestions.min_rating && (!r.rating || r.rating < suggestions.min_rating)) return false
      return true
    })
  }
}
