// Global state
let map = null;
let markers = [];
let currentPage = 1;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadStats();
    loadCountries();
    loadFacilityTypes();
});

// Initialize Leaflet map
function initMap() {
    map = L.map('map').setView([50.1109, 8.6821], 5); // Center on Europe
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
}

// Load statistics
async function loadStats() {
    try {
        const response = await axios.get('/api/stats');
        const stats = response.data;
        
        document.getElementById('stat-total').textContent = stats.total.toLocaleString('de-DE');
        document.getElementById('stat-countries').textContent = stats.by_country.length;
        document.getElementById('stat-rating').textContent = stats.average_rating ? stats.average_rating.toFixed(1) : 'N/A';
        document.getElementById('stat-rated').textContent = stats.rated_count.toLocaleString('de-DE');
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Load countries for filter
async function loadCountries() {
    try {
        const response = await axios.get('/api/countries');
        const countries = response.data;
        
        const select = document.getElementById('filter-country');
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = `${country.name} (${country.residence_count})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load countries:', error);
    }
}

// Load facility types for filter
async function loadFacilityTypes() {
    try {
        const response = await axios.get('/api/facility-types');
        const types = response.data;
        
        const select = document.getElementById('filter-type');
        types.forEach(type => {
            if (type.facility_type) {
                const option = document.createElement('option');
                option.value = type.facility_type;
                option.textContent = `${type.facility_type} (${type.count})`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Failed to load facility types:', error);
    }
}

// Search residences
async function searchResidences(page = 1) {
    currentPage = page;
    
    const filters = {
        page,
        limit: 20,
        country: document.getElementById('filter-country').value,
        city: document.getElementById('filter-city').value,
        type: document.getElementById('filter-type').value,
        min_rating: document.getElementById('filter-rating').value,
        min_capacity: document.getElementById('filter-capacity').value,
        search: document.getElementById('filter-search').value
    };
    
    // Remove empty filters
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });
    
    try {
        const response = await axios.get('/api/residences', { params: filters });
        const data = response.data;
        
        displayResults(data.results);
        displayPagination(data.pagination);
        updateMap(data.results);
        
        document.getElementById('results-count').textContent = 
            `(${data.pagination.total} gefunden)`;
    } catch (error) {
        console.error('Search failed:', error);
        document.getElementById('results-container').innerHTML = 
            '<div class="text-red-500 text-center py-8">Fehler beim Laden der Daten</div>';
    }
}

// Display results
function displayResults(results) {
    const container = document.getElementById('results-container');
    
    if (!results || results.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-8">Keine Einrichtungen gefunden</div>';
        return;
    }
    
    container.innerHTML = results.map(residence => `
        <div class="residence-card group">
            <!-- Checkbox for Bulk Selection -->
            <div class="absolute top-4 left-4 z-10">
                <input type="checkbox" 
                       class="residence-checkbox w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                       data-residence-id="${residence.id}"
                       onclick="toggleResidenceSelection('${residence.id}')">
            </div>
            
            <!-- Header -->
            <div class="residence-header">
                <div class="flex-1 pl-8">
                    <h3 class="residence-name">${residence.name}</h3>
                    <div class="residence-address">
                        <i class="fas fa-map-marker-alt text-red-500 mr-1"></i>
                        ${residence.full_address || [residence.city, residence.country].filter(Boolean).join(', ')}
                    </div>
                </div>
                ${residence.rating ? `
                    <div class="rating-badge">
                        <i class="fas fa-star"></i>
                        <span>${residence.rating.toFixed(1)}</span>
                    </div>
                ` : ''}
            </div>
            
            <!-- Info Grid -->
            <div class="info-grid">
                ${residence.facility_type ? `
                    <div class="info-item">
                        <i class="fas fa-building"></i>
                        <span>${residence.facility_type}</span>
                    </div>
                ` : ''}
                ${residence.capacity ? `
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>${residence.capacity} Plätze</span>
                    </div>
                ` : ''}
                ${residence.operator ? `
                    <div class="info-item">
                        <i class="fas fa-briefcase"></i>
                        <span>${residence.operator}</span>
                    </div>
                ` : ''}
                ${residence.price_min && residence.price_max ? `
                    <div class="info-item">
                        <i class="fas fa-euro-sign"></i>
                        <span>${residence.price_min}-${residence.price_max} ${residence.price_currency || 'EUR'}/M</span>
                    </div>
                ` : ''}
            </div>
            
            <!-- Quick Contact Buttons -->
            <div class="contact-buttons">
                ${residence.phone ? `
                    <button onclick="quickContact('${residence.id}', 'phone')" 
                            class="contact-btn phone" title="Schnell anrufen">
                        <i class="fas fa-phone"></i>
                        <span class="hidden sm:inline">Anrufen</span>
                    </button>
                ` : ''}
                ${residence.email ? `
                    <button onclick="quickContact('${residence.id}', 'email')" 
                            class="contact-btn email" title="Schnell E-Mail">
                        <i class="fas fa-envelope"></i>
                        <span class="hidden sm:inline">E-Mail</span>
                    </button>
                ` : ''}
                ${residence.website ? `
                    <a href="${residence.website}" target="_blank" rel="noopener"
                       class="contact-btn website" title="Website besuchen">
                        <i class="fas fa-globe"></i>
                        <span class="hidden sm:inline">Website</span>
                    </a>
                ` : ''}
                ${residence.lat && residence.lon ? `
                    <a href="https://www.google.com/maps?q=${residence.lat},${residence.lon}" target="_blank" rel="noopener"
                       class="contact-btn maps" title="In Google Maps öffnen">
                        <i class="fas fa-map-marked-alt"></i>
                        <span class="hidden sm:inline">Maps</span>
                    </a>
                ` : ''}
                <button onclick="showResidenceDetails('${residence.id}')"
                        class="contact-btn crm" title="CRM Details öffnen">
                    <i class="fas fa-user-tie"></i>
                    CRM Details
                </button>
                    </a>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Display pagination
function displayPagination(pagination) {
    const container = document.getElementById('pagination');
    
    if (pagination.total_pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    const pages = [];
    const maxPages = 7;
    let startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2));
    let endPage = Math.min(pagination.total_pages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    // Previous button
    if (pagination.page > 1) {
        pages.push(`
            <button onclick="searchResidences(${pagination.page - 1})" 
                    class="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <i class="fas fa-chevron-left"></i>
            </button>
        `);
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const active = i === pagination.page;
        pages.push(`
            <button onclick="searchResidences(${i})" 
                    class="px-4 py-2 ${active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 rounded-md hover:bg-blue-50 ${active ? 'hover:bg-blue-700' : ''}">
                ${i}
            </button>
        `);
    }
    
    // Next button
    if (pagination.page < pagination.total_pages) {
        pages.push(`
            <button onclick="searchResidences(${pagination.page + 1})" 
                    class="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <i class="fas fa-chevron-right"></i>
            </button>
        `);
    }
    
    container.innerHTML = pages.join('');
}

// Update map markers
function updateMap(results) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    if (!results || results.length === 0) return;
    
    const bounds = [];
    
    results.forEach(residence => {
        if (residence.lat && residence.lon) {
            const marker = L.marker([residence.lat, residence.lon])
                .bindPopup(`
                    <div class="text-sm">
                        <strong>${residence.name}</strong><br>
                        ${residence.city}, ${residence.country}<br>
                        ${residence.phone ? `📞 ${residence.phone}<br>` : ''}
                        ${residence.capacity ? `👥 ${residence.capacity} Plätze` : ''}
                    </div>
                `)
                .addTo(map);
            
            markers.push(marker);
            bounds.push([residence.lat, residence.lon]);
        }
    });
    
    // Fit map to markers
    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Export to CSV
async function exportCSV() {
    const country = document.getElementById('filter-country').value;
    const url = `/api/export/csv${country ? `?country=${country}` : ''}`;
    
    try {
        window.location.href = url;
    } catch (error) {
        console.error('Export failed:', error);
        alert('Export fehlgeschlagen');
    }
}

// Enter key support for search
document.getElementById('filter-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchResidences();
    }
});
