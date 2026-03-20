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

---

## 🗄️ Datenbank-Schema

### senior_residences Tabelle
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

### Statistiken
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

---

## 🏗️ Technologie-Stack

- **Backend**: Hono (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: HTML + Vanilla JavaScript
- **Styling**: Tailwind CSS (CDN)
- **Karte**: Leaflet.js
- **Icons**: Font Awesome
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages

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

## 📊 Aktuelle Statistiken (Testdaten)

- **Einrichtungen**: 15
- **Länder**: 10 (DE, FR, GB, ES, IT, NL, AT, CH, BE, SE)
- **Durchschnittsbewertung**: 4.42 / 5.0
- **Typen**: 14 verschiedene Einrichtungstypen

---

## 🎯 Roadmap / Nächste Schritte

### Phase 1: Daten ✅
- [x] Datenbank-Schema erstellt
- [x] Testdaten geladen
- [x] Import-Script erstellt

### Phase 2: Dashboard ✅
- [x] Filter-Funktionen
- [x] Karte integriert
- [x] Kontakt-Features
- [x] CSV-Export

### Phase 3: Erweiterungen (Optional)
- [ ] Bulk-E-Mail-Kampagnen
- [ ] Erweiterte Analysen und Reports
- [ ] PDF-Export von Einrichtungsprofilen
- [ ] Admin-Panel für manuelle Datenpflege
- [ ] Automatische Scraper-Integration
- [ ] Bewertungs-Tracking über Zeit

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
