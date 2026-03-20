import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import crm from './crm-api'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Mount CRM & AI routes
app.route('/api/crm', crm)

// ===== API ROUTES =====

// Get statistics overview
app.get('/api/stats', async (c) => {
  const { DB } = c.env

  try {
    // Total residences
    const totalResult = await DB.prepare('SELECT COUNT(*) as total FROM senior_residences WHERE is_active = 1').first()
    const total = totalResult?.total || 0

    // By country
    const countryStats = await DB.prepare(`
      SELECT country_code, country, COUNT(*) as count
      FROM senior_residences
      WHERE is_active = 1
      GROUP BY country_code, country
      ORDER BY count DESC
      LIMIT 20
    `).all()

    // By facility type
    const typeStats = await DB.prepare(`
      SELECT facility_type, COUNT(*) as count
      FROM senior_residences
      WHERE is_active = 1 AND facility_type IS NOT NULL
      GROUP BY facility_type
      ORDER BY count DESC
    `).all()

    // Average rating
    const ratingResult = await DB.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as rated_count
      FROM senior_residences
      WHERE is_active = 1 AND rating IS NOT NULL
    `).first()

    return c.json({
      total,
      by_country: countryStats.results,
      by_type: typeStats.results,
      average_rating: ratingResult?.avg_rating || 0,
      rated_count: ratingResult?.rated_count || 0
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch statistics' }, 500)
  }
})

// Get all countries
app.get('/api/countries', async (c) => {
  const { DB } = c.env

  try {
    const result = await DB.prepare(`
      SELECT c.*, COUNT(sr.id) as residence_count
      FROM countries c
      LEFT JOIN senior_residences sr ON c.code = sr.country_code AND sr.is_active = 1
      GROUP BY c.code
      ORDER BY c.priority, residence_count DESC
    `).all()

    return c.json(result.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch countries' }, 500)
  }
})

// Search residences with filters
app.get('/api/residences', async (c) => {
  const { DB } = c.env

  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit

  const country = c.req.query('country')
  const city = c.req.query('city')
  const type = c.req.query('type')
  const minRating = c.req.query('min_rating')
  const minCapacity = c.req.query('min_capacity')
  const maxPrice = c.req.query('max_price')
  const search = c.req.query('search')

  let query = `SELECT * FROM senior_residences WHERE is_active = 1`
  const params: any[] = []

  if (country) {
    query += ` AND country_code = ?`
    params.push(country)
  }

  if (city) {
    query += ` AND city LIKE ?`
    params.push(`%${city}%`)
  }

  if (type) {
    query += ` AND facility_type = ?`
    params.push(type)
  }

  if (minRating) {
    query += ` AND rating >= ?`
    params.push(parseFloat(minRating))
  }

  if (minCapacity) {
    query += ` AND capacity >= ?`
    params.push(parseInt(minCapacity))
  }

  if (maxPrice) {
    query += ` AND price_max <= ?`
    params.push(parseFloat(maxPrice))
  }

  if (search) {
    query += ` AND (name LIKE ? OR city LIKE ? OR full_address LIKE ?)`
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  query += ` ORDER BY country_code, city, name LIMIT ? OFFSET ?`
  params.push(limit, offset)

  try {
    const results = await DB.prepare(query).bind(...params).all()
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM senior_residences WHERE is_active = 1`
    if (country) countQuery += ` AND country_code = ?`
    if (city) countQuery += ` AND city LIKE ?`
    if (type) countQuery += ` AND facility_type = ?`
    if (minRating) countQuery += ` AND rating >= ?`
    if (minCapacity) countQuery += ` AND capacity >= ?`
    if (maxPrice) countQuery += ` AND price_max <= ?`
    if (search) countQuery += ` AND (name LIKE ? OR city LIKE ? OR full_address LIKE ?)`

    const countParams = params.slice(0, -2) // Remove limit and offset
    const countResult = await DB.prepare(countQuery).bind(...countParams).first()
    const total = countResult?.total || 0

    return c.json({
      results: results.results,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return c.json({ error: 'Failed to search residences' }, 500)
  }
})

// Get single residence by ID
app.get('/api/residences/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')

  try {
    const result = await DB.prepare('SELECT * FROM senior_residences WHERE id = ?').bind(id).first()

    if (!result) {
      return c.json({ error: 'Residence not found' }, 404)
    }

    return c.json(result)
  } catch (error) {
    return c.json({ error: 'Failed to fetch residence' }, 500)
  }
})

// Get facility types
app.get('/api/facility-types', async (c) => {
  const { DB } = c.env

  try {
    const result = await DB.prepare(`
      SELECT DISTINCT facility_type, COUNT(*) as count
      FROM senior_residences
      WHERE is_active = 1 AND facility_type IS NOT NULL
      GROUP BY facility_type
      ORDER BY count DESC
    `).all()

    return c.json(result.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch facility types' }, 500)
  }
})

// Export to CSV
app.get('/api/export/csv', async (c) => {
  const { DB } = c.env
  const country = c.req.query('country')

  let query = `SELECT * FROM senior_residences WHERE is_active = 1`
  const params: any[] = []

  if (country) {
    query += ` AND country_code = ?`
    params.push(country)
  }

  query += ` LIMIT 1000` // Limit for export

  try {
    const results = await DB.prepare(query).bind(...params).all()
    
    if (!results.results || results.results.length === 0) {
      return c.text('No data to export', 404)
    }

    // Build CSV
    const rows: any[] = results.results
    const headers = Object.keys(rows[0]).join(';')
    const csv = [headers, ...rows.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(';') ? `"${val}"` : val
      ).join(';')
    )].join('\n')

    return c.text(csv, 200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="residences_${country || 'all'}_${new Date().toISOString().split('T')[0]}.csv"`
    })
  } catch (error) {
    return c.json({ error: 'Failed to export data' }, 500)
  }
})

// ===== FRONTEND =====

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Senior Residences Europe - Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            #map { height: 400px; width: 100%; border-radius: 0.5rem; }
            
            .stat-card { 
                @apply rounded-xl shadow-lg p-6 transition-all duration-300;
            }
            .stat-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            
            /* Animations */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .fade-in {
                animation: fadeIn 0.5s ease-out;
            }
            
            /* Custom scrollbar */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            ::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="header-gradient text-white shadow-lg">
            <div class="container mx-auto px-4 py-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-display font-bold flex items-center gap-3">
                            <i class="fas fa-hospital"></i>
                            Senior Residences Europe
                        </h1>
                        <p class="text-emerald-100 mt-2 font-sans">Europas umfassendste Datenbank für Seniorenresidenzen + CRM + AI</p>
                    </div>
                    <button onclick="showIntelligentSearch()" class="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-2xl transition-all transform hover:scale-105 flex items-center gap-2 border border-white border-opacity-30 shadow-lg">
                        <i class="fas fa-magic"></i>
                        <span class="font-display">KI-Suche</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Bulk Action Bar (Hidden by default) -->
        <div id="bulk-action-bar" class="hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl z-40 border-t-4 border-blue-400">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <i class="fas fa-check-double text-2xl"></i>
                        <div>
                            <div class="font-bold text-lg">
                                <span id="selected-count">0</span> Einrichtungen ausgewählt
                            </div>
                            <div class="text-sm text-blue-100">Nutzen Sie Bulk-Aktionen für schnelleres Arbeiten</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <button onclick="showBulkContactModal()" class="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-6 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 border border-white border-opacity-30">
                            <i class="fas fa-paper-plane mr-2"></i>
                            Massen-Kontakt
                        </button>
                        <button onclick="selectAllResidences()" class="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-4 py-2.5 rounded-lg font-semibold transition-all border border-white border-opacity-30">
                            <i class="fas fa-check-square mr-2"></i>
                            Alle
                        </button>
                        <button onclick="deselectAllResidences()" class="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-4 py-2.5 rounded-lg font-semibold transition-all border border-white border-opacity-30">
                            <i class="fas fa-times mr-2"></i>
                            Abwählen
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Overview -->
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-feed-item" id="stats-container">
                <div class="stat-card">
                    <div class="stat-icon emerald">
                        <i class="fas fa-hospital"></i>
                    </div>
                    <div class="stat-value" id="stat-total">-</div>
                    <div class="stat-label">Einrichtungen</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <i class="fas fa-globe-europe"></i>
                    </div>
                    <div class="stat-value" id="stat-countries">-</div>
                    <div class="stat-label">Länder Abgedeckt</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon amber">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="stat-value" id="stat-rating">-</div>
                    <div class="stat-label">Ø Bewertung / 5.0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple">
                        <i class="fas fa-certificate"></i>
                    </div>
                    <div class="stat-value" id="stat-rated">-</div>
                    <div class="stat-label">Bewertet</div>
                </div>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-filter text-blue-600"></i>
                    Filter
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Land</label>
                        <select id="filter-country" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            <option value="">Alle Länder</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
                        <input type="text" id="filter-city" placeholder="z.B. München" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                        <select id="filter-type" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                            <option value="">Alle Typen</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Min. Bewertung</label>
                        <input type="number" id="filter-rating" min="0" max="5" step="0.1" placeholder="z.B. 4.0" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Min. Kapazität</label>
                        <input type="number" id="filter-capacity" min="0" placeholder="z.B. 50" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="flex items-end">
                        <button onclick="searchResidences()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                            <i class="fas fa-search mr-2"></i>Suchen
                        </button>
                    </div>
                </div>
                
                <!-- Search Bar -->
                <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Freitext-Suche</label>
                    <div class="flex gap-2">
                        <input type="text" id="filter-search" placeholder="Name, Stadt oder Adresse durchsuchen..." class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                        <button onclick="exportCSV()" class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                            <i class="fas fa-download mr-2"></i>CSV Export
                        </button>
                    </div>
                </div>
            </div>

            <!-- Map -->
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-map-marked-alt text-blue-600"></i>
                    Karte
                </h2>
                <div id="map" class="rounded-lg"></div>
            </div>

            <!-- Results -->
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-list text-blue-600"></i>
                    Ergebnisse
                    <span id="results-count" class="text-sm font-normal text-gray-500 ml-2"></span>
                </h2>
                <div id="results-container" class="space-y-4">
                    <div class="text-center text-gray-500 py-8">
                        <i class="fas fa-search text-4xl mb-2"></i>
                        <p>Nutze die Filter, um Einrichtungen zu finden</p>
                    </div>
                </div>
                
                <!-- Pagination -->
                <div id="pagination" class="mt-6 flex justify-center gap-2"></div>
            </div>
        </div>

        <!-- Modal Container for CRM -->
        <div id="modal-container"></div>

        <!-- Custom Styles for CRM -->
        <style>
            .crm-tab {
                padding: 0.75rem 1rem;
                border-bottom: 2px solid transparent;
                color: #6B7280;
                transition: all 0.2s;
                cursor: pointer;
                background: none;
                border-left: none;
                border-right: none;
                border-top: none;
            }
            .crm-tab:hover {
                color: #3B82F6;
                border-bottom-color: #BFDBFE;
            }
            .crm-tab-active {
                color: #3B82F6;
                border-bottom-color: #3B82F6;
                font-weight: 600;
            }
        </style>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script src="/static/contact-management.js"></script>
        <script src="/static/crm.js"></script>
    </body>
    </html>
  `)
})

export default app
