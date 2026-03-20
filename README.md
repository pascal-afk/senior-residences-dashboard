# 🏥 Senior Residences Europe - Dashboard

> **Interaktives Dashboard zur Verwaltung und Erkundung von Seniorenresidenzen in ganz Europa**

Vollständig funktionales Web-Dashboard mit Filter, Karte, Kontaktfunktionen und CSV-Export für alle europäischen Seniorenresidenzen.

---

## 🌐 Live Dashboard

**Entwicklungs-URL:** https://3000-i7oohedn9owxneyn75xb4-ad490db5.sandbox.novita.ai

---

## ✨ Features

### 📊 Statistik-Dashboard
- **Echtzeit-Übersicht**: Gesamtzahl, Länder, Durchschnittsbewertung
- **Länderstatistiken**: Verteilung nach Ländern
- **Typ-Statistiken**: Verteilung nach Einrichtungstypen
- **Live-Daten**: 1.867 echte Seniorenresidenzen aus 16 Ländern

### 🔍 Erweiterte Suchfilter
- **Land**: Filtern nach europäischem Land
- **Stadt**: Stadtsuche
- **Einrichtungstyp**: Pflegeheim, Altersheim, etc.
- **Minimale Bewertung**: Qualitätsfilter
- **Minimale Kapazität**: Größenfilter
- **Freitext-Suche**: Name, Stadt oder Adresse

### 🗺️ Interaktive Karte
- **Leaflet-Integration**: OpenStreetMap-basiert
- **Marker**: Alle gefilterten Einrichtungen auf der Karte
- **Popup-Details**: Name, Adresse, Kontakt
- **Auto-Zoom**: Automatische Anpassung an Suchergebnisse

### 📞 Kontaktierungs-Features
- **Telefon**: Direkt anrufbare Links
- **E-Mail**: Mailto-Links
- **Website**: Externe Links zu Websites
- **Google Maps**: Navigation zu Einrichtungen

### 💾 Export-Funktionen
- **CSV-Export**: Gefilterte Daten exportieren
- **Länder-spezifisch**: Export für einzelne Länder
- **Excel-kompatibel**: Semikolon-getrennt, UTF-8-BOM

### 🤖 CRM & AI-System (NEU!)

#### MCP-Architektur (Multi-Agent System)
Unser fortschrittliches 3-Agenten-System für intelligente Datenanalyse:

**LLMAgent** - Intelligente Analyse
- Bewertet Einrichtungen automatisch
- Analysiert digitale Bereitschaft
- Erstellt Lead-Scores (0-100 Punkte)
- Gibt strategische Empfehlungen

**JudgeAgent** - Qualitätskontrolle
- Validiert AI-Bewertungen
- Prüft Plausibilität der Scores
- Erkennt Dateninkonsistenzen
- Sichert Qualitätsstandards

**FrontendAgent** - Orchestrierung
- Koordiniert AI-Workflows
- Verwaltet Anfragen ans LLM
- Präsentiert Ergebnisse benutzerfreundlich
- Lazy-Loading für Performance

#### CRM-Funktionen
**Kontakt-Tracking**
- Detaillierte Kontakt-Historie
- Mehrere Kontakt-Kanäle (Telefon, E-Mail, Post, Meeting)
- Status-Tracking (Erfolgreich, Fehlgeschlagen, Wiedervorlage)
- Automatische Timestamps

**Lead-Management**
- Lead-Scoring (0-100 Punkte)
- Lead-Stages (Cold, Warm, Hot, Qualified)
- Priority-Levels (1-4)
- Wahrscheinlichkeitsangaben

**Notizen & Tags**
- Kategorisierte Notizen (General, Technical, Commercial, Follow-up)
- Freie Tag-Vergabe
- Volltext-Suche in Notizen

**Kampagnen-Management**
- Multi-Channel-Kampagnen (E-Mail, Telefon, Post)
- Target-Listen mit Status-Tracking
- Automatische Erfolgs-Metriken
- Kampagnen-ROI-Analysen

**AI-Scores & Bewertungen**
- Digital Readiness Score (0-100)
- Tech Adoption Level (beginner, intermediate, advanced)
- Budget-Einschätzungen
- Entscheider-Identifikation

#### Intelligente Suche
**Natural Language Queries**
- Natürlichsprachige Anfragen ans System
- Beispiel: "Welche deutschen Residenzen mit >100 Betten sind technisch bereit für digitale Tools?"
- AI-gestützte Filterung und Ranking
- Automatische Ergebnis-Aufbereitung

**AI-Reasoning**
- Detaillierte Begründungen für Empfehlungen
- Strategische Insights
- Risiko-Analysen
- Marktpotential-Bewertungen

### 🎨 Design & UX (NEU!)
- **Moderne UI**: Gradients, Glassmorphism, Animationen
- **Professionelle Farbpalette**: Medical/Healthcare Theme
- **Smooth Transitions**: 300ms Animationen überall
- **Responsive Design**: Mobile-first Ansatz
- **Custom Scrollbars**: Branded Design-Elemente
- **Interactive Elements**: Hover-Effects, Card-Lifts
- **Loading States**: Skeleton-Screens und Spinner

---

## 🗄️ Datenbank-Schema

### senior_residences Tabelle (Hauptdaten)
```sql
- id (TEXT PRIMARY KEY)
- name, name_local, facility_type
- Adresse: street, house_number, city, postal_code, region, country, country_code
- Geolocation: lat, lon, geo_accuracy
- Kontakt: phone, phone_2, fax, email, website
- Kapazität: capacity, beds
- Betreiber: operator, operator_type, founded_year
- Services: specializations, opening_hours, is_24h
- Bewertung: rating, rating_count, rating_source
- Regulierung: license_number, accreditation, quality_score
- Preise: price_min, price_max, price_currency
- Zusätzlich: amenities, languages, tags, image_url
- Metadaten: source, scraped_at, is_active, is_verified

-- CRM-Felder (NEU)
- Kontakt: last_contact_date, last_contact_type, contact_status, contact_attempts
- Lead-Scoring: lead_score (0-100), lead_stage, priority_level
- Entscheider: decision_maker_name, decision_maker_role, decision_maker_phone, decision_maker_email
- Digital Readiness: has_website, has_email, digital_readiness_score (0-100), tech_adoption_level
- Business: estimated_budget, contract_value, annual_revenue_potential
- Sales: sales_assigned_to, next_follow_up_date, probability_to_close
```

### contact_history Tabelle
```sql
- id (TEXT PRIMARY KEY)
- residence_id (FOREIGN KEY)
- contact_date, contact_type (phone, email, post, meeting)
- contacted_by, contact_status (success, failed, no_response, follow_up_needed)
- outcome, notes, follow_up_date
- created_at, updated_at
```

### residence_notes Tabelle
```sql
- id (TEXT PRIMARY KEY)
- residence_id (FOREIGN KEY)
- note_text, category (general, technical, commercial, follow_up)
- created_by, created_at
```

### ai_scores Tabelle
```sql
- id (TEXT PRIMARY KEY)
- residence_id (FOREIGN KEY)
- score_type, score_value (0-100), reasoning
- model_version, created_at
```

### campaigns Tabelle
```sql
- id (TEXT PRIMARY KEY)
- name, description, campaign_type (email, phone, post, multi)
- start_date, end_date, status
- target_countries, target_criteria (JSON)
- created_at, updated_at
```

### campaign_targets Tabelle
```sql
- id (TEXT PRIMARY KEY)
- campaign_id, residence_id (FOREIGN KEYs)
- status (pending, contacted, responded, converted, rejected)
- contacted_at, response_at, notes
```

### residence_tags Tabelle
```sql
- id (TEXT PRIMARY KEY)
- residence_id (FOREIGN KEY)
- tag_name, created_at
```

### ai_evaluation_queue Tabelle
```sql
- id (TEXT PRIMARY KEY)
- residence_id (FOREIGN KEY)
- status (pending, processing, completed, failed)
- priority, requested_at, completed_at
- error_message
```

### Unterstützte Länder
29 europäische Länder:
- 🇩🇪 Deutschland, 🇫🇷 Frankreich, 🇬🇧 Großbritannien, 🇮🇹 Italien, 🇪🇸 Spanien
- 🇳🇱 Niederlande, 🇧🇪 Belgien, 🇨🇭 Schweiz, 🇦🇹 Österreich
- 🇸🇪 Schweden, 🇳🇴 Norwegen, 🇩🇰 Dänemark, 🇫🇮 Finnland
- 🇵🇱 Polen, 🇨🇿 Tschechien, 🇭🇺 Ungarn, 🇷🇴 Rumänien, 🇵🇹 Portugal
- und weitere...

---

## 🚀 Installation & Entwicklung

### Voraussetzungen
- Node.js 18+
- npm oder yarn
- Wrangler CLI

### Schnellstart

```bash
# Repository klonen
git clone https://github.com/pascal-afk/senior-residences-dashboard.git
cd senior-residences-dashboard

# Dependencies installieren
npm install

# Datenbank initialisieren (lokal)
npm run db:migrate:local
npm run db:seed

# Build
npm run build

# Development Server starten
npm run dev:sandbox
```

**Dashboard läuft auf:** http://localhost:3000

---

## 📦 Verfügbare NPM Scripts

```bash
npm run dev              # Vite Dev Server
npm run dev:sandbox      # Wrangler Pages Dev (mit D1)
npm run build            # Projekt builden
npm run deploy           # Deploy zu Cloudflare Pages

# Datenbank
npm run db:migrate:local # Migrations lokal ausführen
npm run db:seed          # Testdaten laden
npm run db:reset         # Datenbank zurücksetzen und neu initialisieren
npm run db:console       # SQL Console öffnen

# Utilities
npm run clean-port       # Port 3000 freigeben
npm run test             # Service testen
```

---

## 📥 Daten Importieren

### Aus Scraper-Datenbank importieren

```bash
# Python Import-Script verwenden
python3 import_scraper_data.py /path/to/senior_residences.db --format sql

# Generierte SQL-Datei importieren
wrangler d1 execute senior-residences-eu --local --file=import_data.sql
```

### Manuelle SQL-Imports

```bash
# SQL-Datei importieren
wrangler d1 execute senior-residences-eu --local --file=your_data.sql

# Direkte SQL-Befehle
wrangler d1 execute senior-residences-eu --local --command="SELECT COUNT(*) FROM senior_residences"
```

---

## 🔌 API Endpoints

### Basis-Statistiken
```
GET /api/stats
Response: { total, by_country, by_type, average_rating, rated_count }
```

### Länder
```
GET /api/countries
Response: [{ code, name, name_local, residence_count }]
```

### Einrichtungen Suchen
```
GET /api/residences?country=DE&city=München&type=nursing_home&min_rating=4.0&page=1&limit=20
Response: { results: [...], pagination: {...} }
```

### Einzelne Einrichtung
```
GET /api/residences/:id
Response: { id, name, ... }
```

### Einrichtungstypen
```
GET /api/facility-types
Response: [{ facility_type, count }]
```

### CSV Export
```
GET /api/export/csv?country=DE
Response: CSV-Datei Download
```

### CRM-Endpoints (NEU!)

#### Kontakt-Verwaltung
```
POST /api/crm/contact
Body: { residence_id, contact_type, contacted_by, contact_status, outcome, notes }
Response: { success: true, contact_id }

GET /api/crm/contact/:residence_id
Response: [{ id, contact_date, contact_type, status, outcome, notes }]
```

#### Notizen
```
POST /api/crm/notes
Body: { residence_id, note_text, category, created_by }
Response: { success: true, note_id }

GET /api/crm/notes/:residence_id
Response: [{ id, note_text, category, created_by, created_at }]
```

#### Status-Updates
```
PUT /api/crm/residence/:id/status
Body: { contact_status, lead_stage, lead_score, priority_level, sales_assigned_to, next_follow_up_date }
Response: { success: true }
```

#### CRM-Statistiken
```
GET /api/crm/stats
Response: {
  contact_status: { never_contacted: 12, attempted: 1, in_conversation: 1, qualified: 1 },
  lead_stages: { cold: 11, warm: 2, hot: 1, qualified: 1 },
  recent_contacts_7d: 3,
  follow_ups_due: 0
}
```

#### AI-Endpoints
```
POST /api/crm/ai/evaluate/:residence_id
Response: { score, reasoning, recommendations, model: "LLM", judged_by: "Judge", confidence }

POST /api/crm/ai/evaluate-batch
Body: { residence_ids: ["id1", "id2", ...] }
Response: { results: [...], total, successful, failed }

POST /api/crm/ai/query
Body: { query: "Welche deutschen Residenzen mit >100 Betten sind digital bereit?" }
Response: { answer, reasoning, matches: [...], filters_applied }

GET /api/crm/ai/scores/:residence_id
Response: [{ score_type, score_value, reasoning, created_at }]

POST /api/crm/ai/auto-evaluate
Body: { filters: { country: "DE", min_capacity: 100 }, max_count: 50 }
Response: { evaluated_count, avg_score, distribution }
```

#### Kampagnen
```
POST /api/crm/campaigns
Body: { name, description, campaign_type, target_countries, target_criteria }
Response: { success: true, campaign_id }

GET /api/crm/campaigns
Response: [{ id, name, status, start_date, target_count, contacted_count }]

POST /api/crm/campaigns/:id/targets
Body: { residence_ids: [...] }
Response: { success: true, added_count }
```

---

## 🏗️ Technologie-Stack

### Backend
- **Framework**: Hono (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **AI/LLM**: GenSpark LLM (GPT-5 via Proxy)
- **MCP Architecture**: 3-Agent-System (LLM, Judge, Frontend)
- **API**: RESTful + JSON

### Frontend
- **Base**: HTML5 + Vanilla JavaScript
- **Styling**: Tailwind CSS (CDN) + Custom CSS
- **Map**: Leaflet.js + OpenStreetMap
- **Icons**: Font Awesome 6
- **HTTP**: Axios
- **Charts**: Chart.js (optional)

### Build & Deploy
- **Build Tool**: Vite 6
- **Bundler**: ESBuild (via Vite)
- **TypeScript**: 5.x
- **Deployment**: Cloudflare Pages
- **CLI**: Wrangler 4.x
- **Process Manager**: PM2 (Development)

### DevOps
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (geplant)
- **Monitoring**: Cloudflare Analytics
- **Backup**: ProjectBackup Tool

---

## 🔗 Integration mit Scraper

Dieses Dashboard ist designed, um mit dem [Senior Vibe Scraper](https://github.com/pascal-afk/project-senior-vibe-scrapper) zu arbeiten:

1. **Scraper läuft** und sammelt Daten → SQLite Datenbank
2. **Import-Script** konvertiert SQLite → D1-kompatibles SQL
3. **Dashboard** liest aus D1 und zeigt die Daten an

---

## 🚀 Deployment zu Cloudflare Pages

### Produktions-Datenbank erstellen

```bash
# D1 Datenbank in Cloudflare erstellen
wrangler d1 create senior-residences-eu

# Database ID in wrangler.jsonc eintragen
# Migrations ausführen
wrangler d1 migrations apply senior-residences-eu

# Daten importieren
wrangler d1 execute senior-residences-eu --file=import_data.sql
```

### Pages Projekt erstellen

```bash
# Projekt bauen
npm run build

# Cloudflare Pages Projekt erstellen
wrangler pages project create senior-residences-dashboard --production-branch main

# Deployen
npm run deploy
```

---

## 📊 Aktuelle Statistiken (Live-Daten)

- **Einrichtungen**: 1.867 echte Seniorenresidenzen
- **Länder**: 16 (DE, FR, GB, ES, IT, NL, AT, CH, BE, SE, SK, LI und weitere)
- **Durchschnittsbewertung**: In Entwicklung
- **Typen**: 20+ verschiedene Einrichtungstypen
- **Datenquellen**: OpenStreetMap, CQC UK, FINESS Frankreich

---

## 🎯 Roadmap / Nächste Schritte

### Phase 1: Daten ✅
- [x] Datenbank-Schema erstellt (11 Tabellen)
- [x] 1.867 echte Einrichtungen importiert
- [x] 16 europäische Länder abgedeckt
- [x] Import-Script erstellt

### Phase 2: Dashboard ✅
- [x] Filter-Funktionen
- [x] Karte integriert
- [x] Kontakt-Features
- [x] CSV-Export
- [x] Modernes, professionelles Design
- [x] Responsive Layout
- [x] Animationen & Transitions

### Phase 3: CRM & AI-System ✅
- [x] MCP-Architektur (3 Agenten)
- [x] Kontakt-Tracking
- [x] Lead-Scoring
- [x] Notizen-System
- [x] AI-Bewertungen
- [x] Kampagnen-Management
- [x] Intelligente Suche (Natural Language)

### Phase 4: Erweiterungen (In Planung)
- [ ] **Email-Integration**
  - Massenversand für Kampagnen
  - Template-System
  - Tracking & Analytics

- [ ] **Erweiterte Analytics**
  - Dashboard für Conversion-Rates
  - Lead-Pipeline-Visualisierung
  - ROI-Tracking pro Kampagne

- [ ] **Automatisierung**
  - Automatische Lead-Bewertung bei Import
  - Follow-Up-Reminder-System
  - Workflow-Automation

- [ ] **Bulk-Aktionen**
  - Batch-Status-Updates
  - Massenexport mit Filtern
  - Bulk-Tagging

- [ ] **API-Erweiterungen**
  - Webhook-System
  - GraphQL-Alternative
  - Rate-Limiting

- [ ] **Mobile App**
  - React Native App
  - Offline-Modus
  - Push-Notifications

### Phase 5: Production-Ready (Offen)
- [ ] Cloudflare Pages Deployment
- [ ] Produktions-D1-Datenbank
- [ ] Custom Domain
- [ ] SSL-Zertifikat
- [ ] Monitoring & Alerting
- [ ] Backup-Strategie
- [ ] Load-Testing

---

## 📝 Lizenz

MIT License

---

## 👨‍💻 Autor

Pascal Raluecht

- **Scraper**: https://github.com/pascal-afk/project-senior-vibe-scrapper
- **Dashboard**: https://github.com/pascal-afk/senior-residences-dashboard

---

**Entwickelt mit ❤️ für die Seniorenpflege-Branche in Europa**
