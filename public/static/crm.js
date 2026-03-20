// ===== CRM FUNCTIONS =====

// Global CRM state
let currentResidenceId = null;

// Show residence details modal
async function showResidenceDetails(residenceId) {
    currentResidenceId = residenceId;
    
    try {
        // Load residence data
        const residenceRes = await axios.get(`/api/residences/${residenceId}`);
        const residence = residenceRes.data;
        
        // Load contact history
        const contactRes = await axios.get(`/api/crm/contact/${residenceId}`);
        const contacts = contactRes.data;
        
        // Load notes
        const notesRes = await axios.get(`/api/crm/notes/${residenceId}`);
        const notes = notesRes.data;
        
        // Load AI scores
        const scoresRes = await axios.get(`/api/crm/ai/scores/${residenceId}`);
        const scores = scoresRes.data;
        
        // Build modal HTML
        const modalHTML = buildResidenceModal(residence, contacts, notes, scores);
        
        // Show modal
        document.getElementById('modal-container').innerHTML = modalHTML;
        document.getElementById('residence-modal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Failed to load residence details:', error);
        alert('Fehler beim Laden der Details');
    }
}

// Build residence detail modal HTML
function buildResidenceModal(residence, contacts, notes, scores) {
    return `
        <div id="residence-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start z-10">
                    <div class="flex-1">
                        <h2 class="text-2xl font-bold text-gray-800">${residence.name}</h2>
                        <p class="text-gray-600 mt-1">
                            <i class="fas fa-map-marker-alt mr-1"></i>
                            ${residence.full_address || [residence.city, residence.country].filter(Boolean).join(', ')}
                        </p>
                    </div>
                    <button onclick="closeResidenceModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <!-- Content -->
                <div class="p-6">
                    <!-- Lead Status Banner -->
                    ${buildLeadStatusBanner(residence)}
                    
                    <!-- Tabs -->
                    <div class="border-b border-gray-200 mb-6">
                        <nav class="-mb-px flex space-x-8">
                            <button onclick="switchTab('overview')" class="crm-tab crm-tab-active" data-tab="overview">
                                <i class="fas fa-info-circle mr-2"></i>Übersicht
                            </button>
                            <button onclick="switchTab('contacts')" class="crm-tab" data-tab="contacts">
                                <i class="fas fa-phone mr-2"></i>Kontakte (${contacts.length})
                            </button>
                            <button onclick="switchTab('notes')" class="crm-tab" data-tab="notes">
                                <i class="fas fa-sticky-note mr-2"></i>Notizen (${notes.length})
                            </button>
                            <button onclick="switchTab('ai')" class="crm-tab" data-tab="ai">
                                <i class="fas fa-brain mr-2"></i>AI-Bewertung (${scores.length})
                            </button>
                        </nav>
                    </div>

                    <!-- Tab Content -->
                    <div id="tab-content">
                        <!-- Overview Tab -->
                        <div id="tab-overview" class="crm-tab-content">
                            ${buildOverviewTab(residence)}
                        </div>

                        <!-- Contacts Tab -->
                        <div id="tab-contacts" class="crm-tab-content hidden">
                            ${buildContactsTab(residence, contacts)}
                        </div>

                        <!-- Notes Tab -->
                        <div id="tab-notes" class="crm-tab-content hidden">
                            ${buildNotesTab(residence, notes)}
                        </div>

                        <!-- AI Tab -->
                        <div id="tab-ai" class="crm-tab-content hidden">
                            ${buildAITab(residence, scores)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Build lead status banner
function buildLeadStatusBanner(residence) {
    const statusColors = {
        'qualified': 'bg-green-100 text-green-800',
        'in_conversation': 'bg-blue-100 text-blue-800',
        'attempted': 'bg-yellow-100 text-yellow-800',
        'never_contacted': 'bg-gray-100 text-gray-800'
    };
    
    const stageColors = {
        'hot': 'bg-red-500',
        'warm': 'bg-orange-500',
        'qualified': 'bg-green-500',
        'cold': 'bg-blue-500'
    };
    
    return `
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div>
                        <span class="text-sm text-gray-600">Status:</span>
                        <span class="ml-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[residence.contact_status] || 'bg-gray-100 text-gray-800'}">
                            ${residence.contact_status || 'Unbekannt'}
                        </span>
                    </div>
                    <div>
                        <span class="text-sm text-gray-600">Lead Stage:</span>
                        <span class="ml-2 px-3 py-1 rounded-full text-sm font-medium text-white ${stageColors[residence.lead_stage] || 'bg-gray-500'}">
                            ${residence.lead_stage || 'cold'}
                        </span>
                    </div>
                    ${residence.lead_score ? `
                        <div>
                            <span class="text-sm text-gray-600">Score:</span>
                            <span class="ml-2 text-2xl font-bold text-purple-600">${residence.lead_score}</span>
                            <span class="text-sm text-gray-500">/100</span>
                        </div>
                    ` : ''}
                </div>
                <button onclick="showUpdateStatusModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <i class="fas fa-edit mr-2"></i>Status ändern
                </button>
            </div>
        </div>
    `;
}

// Build overview tab
function buildOverviewTab(residence) {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Basic Info -->
            <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3 flex items-center">
                    <i class="fas fa-building text-blue-600 mr-2"></i>
                    Grundinformationen
                </h3>
                <dl class="space-y-2">
                    ${residence.facility_type ? `<div><dt class="text-sm text-gray-600">Typ:</dt><dd class="font-medium">${residence.facility_type}</dd></div>` : ''}
                    ${residence.capacity ? `<div><dt class="text-sm text-gray-600">Kapazität:</dt><dd class="font-medium">${residence.capacity} Plätze</dd></div>` : ''}
                    ${residence.operator ? `<div><dt class="text-sm text-gray-600">Betreiber:</dt><dd class="font-medium">${residence.operator}</dd></div>` : ''}
                    ${residence.operator_type ? `<div><dt class="text-sm text-gray-600">Betreibertyp:</dt><dd class="font-medium">${residence.operator_type}</dd></div>` : ''}
                    ${residence.rating ? `<div><dt class="text-sm text-gray-600">Bewertung:</dt><dd class="font-medium">⭐ ${residence.rating} (${residence.rating_count || 0} Bewertungen)</dd></div>` : ''}
                </dl>
            </div>

            <!-- Contact Info -->
            <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3 flex items-center">
                    <i class="fas fa-address-card text-green-600 mr-2"></i>
                    Kontaktdaten
                </h3>
                <dl class="space-y-2">
                    ${residence.phone ? `<div><dt class="text-sm text-gray-600">Telefon:</dt><dd class="font-medium"><a href="tel:${residence.phone}" class="text-blue-600 hover:underline">${residence.phone}</a></dd></div>` : ''}
                    ${residence.email ? `<div><dt class="text-sm text-gray-600">E-Mail:</dt><dd class="font-medium"><a href="mailto:${residence.email}" class="text-blue-600 hover:underline">${residence.email}</a></dd></div>` : ''}
                    ${residence.website ? `<div><dt class="text-sm text-gray-600">Website:</dt><dd class="font-medium"><a href="${residence.website}" target="_blank" class="text-blue-600 hover:underline">${residence.website}</a></dd></div>` : ''}
                    ${residence.decision_maker_name ? `<div><dt class="text-sm text-gray-600">Entscheider:</dt><dd class="font-medium">${residence.decision_maker_name} ${residence.decision_maker_role ? `(${residence.decision_maker_role})` : ''}</dd></div>` : ''}
                </dl>
            </div>

            <!-- Digital Readiness -->
            <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3 flex items-center">
                    <i class="fas fa-laptop text-purple-600 mr-2"></i>
                    Digital Readiness
                </h3>
                <dl class="space-y-2">
                    <div><dt class="text-sm text-gray-600">Website:</dt><dd class="font-medium">${residence.has_website ? '✅ Ja' : '❌ Nein'}</dd></div>
                    <div><dt class="text-sm text-gray-600">E-Mail:</dt><dd class="font-medium">${residence.has_email ? '✅ Ja' : '❌ Nein'}</dd></div>
                    ${residence.digital_readiness_score ? `<div><dt class="text-sm text-gray-600">Readiness Score:</dt><dd class="font-medium text-purple-600 text-xl">${residence.digital_readiness_score}/100</dd></div>` : ''}
                </dl>
            </div>

            <!-- Sales Info -->
            <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3 flex items-center">
                    <i class="fas fa-chart-line text-orange-600 mr-2"></i>
                    Vertriebsinfos
                </h3>
                <dl class="space-y-2">
                    ${residence.sales_assigned_to ? `<div><dt class="text-sm text-gray-600">Zugewiesen:</dt><dd class="font-medium">${residence.sales_assigned_to}</dd></div>` : '<div class="text-gray-500">Noch nicht zugewiesen</div>'}
                    ${residence.last_contact_date ? `<div><dt class="text-sm text-gray-600">Letzter Kontakt:</dt><dd class="font-medium">${new Date(residence.last_contact_date).toLocaleDateString('de-DE')}</dd></div>` : ''}
                    ${residence.next_follow_up_date ? `<div><dt class="text-sm text-gray-600">Nächstes Follow-up:</dt><dd class="font-medium">${new Date(residence.next_follow_up_date).toLocaleDateString('de-DE')}</dd></div>` : ''}
                    <div><dt class="text-sm text-gray-600">Kontaktversuche:</dt><dd class="font-medium">${residence.contact_attempts || 0}</dd></div>
                </dl>
            </div>
        </div>
    `;
}

// Build contacts tab
function buildContactsTab(residence, contacts) {
    const contactTypes = {
        'phone': { icon: 'fa-phone', color: 'blue', label: 'Telefon' },
        'email': { icon: 'fa-envelope', color: 'green', label: 'E-Mail' },
        'post': { icon: 'fa-mail-bulk', color: 'purple', label: 'Post' },
        'meeting': { icon: 'fa-handshake', color: 'orange', label: 'Meeting' },
        'visit': { icon: 'fa-map-marker-alt', color: 'red', label: 'Besuch' }
    };
    
    return `
        <div>
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Kontaktverlauf</h3>
                <button onclick="showAddContactModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <i class="fas fa-plus mr-2"></i>Kontakt hinzufügen
                </button>
            </div>
            
            ${contacts.length > 0 ? `
                <div class="space-y-4">
                    ${contacts.map(contact => {
                        const type = contactTypes[contact.contact_type] || contactTypes['phone'];
                        return `
                            <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div class="flex items-start justify-between">
                                    <div class="flex items-start gap-3 flex-1">
                                        <div class="w-10 h-10 rounded-full bg-${type.color}-100 flex items-center justify-center flex-shrink-0">
                                            <i class="fas ${type.icon} text-${type.color}-600"></i>
                                        </div>
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="font-semibold">${type.label}</span>
                                                <span class="text-sm text-gray-500">${new Date(contact.contact_date).toLocaleString('de-DE')}</span>
                                            </div>
                                            <div class="text-sm text-gray-600 mb-2">
                                                <span class="font-medium">Status:</span> ${contact.status}
                                                ${contact.outcome ? ` | <span class="font-medium">Ergebnis:</span> ${contact.outcome}` : ''}
                                            </div>
                                            ${contact.notes ? `<p class="text-gray-700">${contact.notes}</p>` : ''}
                                            <div class="text-xs text-gray-500 mt-2">
                                                Kontaktiert von: ${contact.contacted_by || 'Unbekannt'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-phone-slash text-4xl mb-3"></i>
                    <p>Noch keine Kontakte erfasst</p>
                </div>
            `}
        </div>
    `;
}

// Build notes tab
function buildNotesTab(residence, notes) {
    return `
        <div>
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Notizen</h3>
                <button onclick="showAddNoteModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <i class="fas fa-plus mr-2"></i>Notiz hinzufügen
                </button>
            </div>
            
            ${notes.length > 0 ? `
                <div class="space-y-4">
                    ${notes.map(note => `
                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-semibold text-yellow-800">${note.note_type || 'Allgemein'}</span>
                                <span class="text-xs text-gray-500">${new Date(note.created_at).toLocaleString('de-DE')}</span>
                            </div>
                            <p class="text-gray-700">${note.content}</p>
                            ${note.created_by ? `<div class="text-xs text-gray-500 mt-2">Erstellt von: ${note.created_by}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-sticky-note text-4xl mb-3"></i>
                    <p>Noch keine Notizen vorhanden</p>
                </div>
            `}
        </div>
    `;
}

// Build AI tab
function buildAITab(residence, scores) {
    return `
        <div>
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">KI-Bewertungen</h3>
                <button onclick="showAIEvaluationModal()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <i class="fas fa-brain mr-2"></i>Neue Bewertung starten
                </button>
            </div>
            
            ${scores.length > 0 ? `
                <div class="space-y-4">
                    ${scores.map(score => `
                        <div class="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                            <div class="flex items-start justify-between mb-3">
                                <div>
                                    <span class="text-sm font-semibold text-purple-800">${score.score_type}</span>
                                    <span class="ml-2 text-xs text-gray-500">${new Date(score.evaluated_at).toLocaleString('de-DE')}</span>
                                </div>
                                <div class="text-right">
                                    <div class="text-3xl font-bold text-purple-600">${score.score}</div>
                                    <div class="text-xs text-gray-500">Confidence: ${(score.confidence * 100).toFixed(0)}%</div>
                                </div>
                            </div>
                            <p class="text-gray-700 text-sm mb-2">${score.reasoning}</p>
                            <div class="text-xs text-gray-500">
                                Bewertet von: ${score.evaluated_by} | Model: ${score.model_version || 'Unknown'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-robot text-4xl mb-3"></i>
                    <p>Noch keine KI-Bewertungen vorhanden</p>
                    <button onclick="showAIEvaluationModal()" class="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                        Erste Bewertung erstellen
                    </button>
                </div>
            `}
        </div>
    `;
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.crm-tab').forEach(tab => {
        tab.classList.remove('crm-tab-active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('crm-tab-active');
    
    // Update tab content
    document.querySelectorAll('.crm-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
}

// Close modal
function closeResidenceModal() {
    document.getElementById('residence-modal').remove();
    currentResidenceId = null;
}

// Show add contact modal
function showAddContactModal() {
    const modal = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" id="add-contact-modal">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 class="text-xl font-bold mb-4">Kontakt hinzufügen</h3>
                <form onsubmit="submitContact(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Kontakttyp</label>
                        <select id="contact-type" class="w-full border rounded-lg px-3 py-2" required>
                            <option value="phone">Telefon</option>
                            <option value="email">E-Mail</option>
                            <option value="post">Post</option>
                            <option value="meeting">Meeting</option>
                            <option value="visit">Besuch</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Status</label>
                        <select id="contact-status" class="w-full border rounded-lg px-3 py-2" required>
                            <option value="success">Erfolgreich</option>
                            <option value="attempted">Versucht</option>
                            <option value="no_answer">Keine Antwort</option>
                            <option value="wrong_number">Falsche Nummer</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Ergebnis</label>
                        <select id="contact-outcome" class="w-full border rounded-lg px-3 py-2">
                            <option value="">Bitte wählen</option>
                            <option value="interested">Interessiert</option>
                            <option value="not_interested">Nicht interessiert</option>
                            <option value="callback_requested">Rückruf gewünscht</option>
                            <option value="info_sent">Infos versendet</option>
                            <option value="demo_scheduled">Demo vereinbart</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Notizen</label>
                        <textarea id="contact-notes" class="w-full border rounded-lg px-3 py-2" rows="3"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Kontaktiert von</label>
                        <input type="text" id="contacted-by" class="w-full border rounded-lg px-3 py-2" placeholder="Dein Name">
                    </div>
                    <div class="flex gap-2 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                            Speichern
                        </button>
                        <button type="button" onclick="document.getElementById('add-contact-modal').remove()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg">
                            Abbrechen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

// Submit contact
async function submitContact(e) {
    e.preventDefault();
    
    const data = {
        residence_id: currentResidenceId,
        contact_type: document.getElementById('contact-type').value,
        status: document.getElementById('contact-status').value,
        outcome: document.getElementById('contact-outcome').value,
        notes: document.getElementById('contact-notes').value,
        contacted_by: document.getElementById('contacted-by').value
    };
    
    try {
        await axios.post('/api/crm/contact', data);
        document.getElementById('add-contact-modal').remove();
        showResidenceDetails(currentResidenceId); // Reload
        alert('Kontakt erfolgreich gespeichert!');
    } catch (error) {
        console.error('Failed to save contact:', error);
        alert('Fehler beim Speichern des Kontakts');
    }
}

// Show add note modal
function showAddNoteModal() {
    const modal = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" id="add-note-modal">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 class="text-xl font-bold mb-4">Notiz hinzufügen</h3>
                <form onsubmit="submitNote(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Typ</label>
                        <select id="note-type" class="w-full border rounded-lg px-3 py-2">
                            <option value="general">Allgemein</option>
                            <option value="important">Wichtig</option>
                            <option value="technical">Technisch</option>
                            <option value="decision_maker">Entscheider</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Notiz</label>
                        <textarea id="note-content" class="w-full border rounded-lg px-3 py-2" rows="4" required></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Erstellt von</label>
                        <input type="text" id="note-created-by" class="w-full border rounded-lg px-3 py-2" placeholder="Dein Name">
                    </div>
                    <div class="flex gap-2 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                            Speichern
                        </button>
                        <button type="button" onclick="document.getElementById('add-note-modal').remove()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg">
                            Abbrechen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

// Submit note
async function submitNote(e) {
    e.preventDefault();
    
    const data = {
        residence_id: currentResidenceId,
        note_type: document.getElementById('note-type').value,
        content: document.getElementById('note-content').value,
        created_by: document.getElementById('note-created-by').value
    };
    
    try {
        await axios.post('/api/crm/notes', data);
        document.getElementById('add-note-modal').remove();
        showResidenceDetails(currentResidenceId); // Reload
        alert('Notiz erfolgreich gespeichert!');
    } catch (error) {
        console.error('Failed to save note:', error);
        alert('Fehler beim Speichern der Notiz');
    }
}

// Show update status modal
function showUpdateStatusModal() {
    const modal = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" id="update-status-modal">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 class="text-xl font-bold mb-4">Status aktualisieren</h3>
                <form onsubmit="submitStatusUpdate(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Kontaktstatus</label>
                        <select id="update-contact-status" class="w-full border rounded-lg px-3 py-2">
                            <option value="never_contacted">Nie kontaktiert</option>
                            <option value="attempted">Versucht</option>
                            <option value="in_conversation">In Konversation</option>
                            <option value="qualified">Qualifiziert</option>
                            <option value="rejected">Abgelehnt</option>
                            <option value="customer">Kunde</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Lead Stage</label>
                        <select id="update-lead-stage" class="w-full border rounded-lg px-3 py-2">
                            <option value="cold">Cold</option>
                            <option value="warm">Warm</option>
                            <option value="hot">Hot</option>
                            <option value="qualified">Qualified</option>
                            <option value="customer">Customer</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Priorität</label>
                        <select id="update-priority" class="w-full border rounded-lg px-3 py-2">
                            <option value="1">1 - Höchste</option>
                            <option value="2">2 - Hoch</option>
                            <option value="3">3 - Mittel</option>
                            <option value="4">4 - Niedrig</option>
                            <option value="5">5 - Niedrigste</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Zugewiesen an</label>
                        <input type="text" id="update-assigned-to" class="w-full border rounded-lg px-3 py-2" placeholder="Name des Mitarbeiters">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Nächstes Follow-up</label>
                        <input type="date" id="update-follow-up" class="w-full border rounded-lg px-3 py-2">
                    </div>
                    <div class="flex gap-2 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                            Aktualisieren
                        </button>
                        <button type="button" onclick="document.getElementById('update-status-modal').remove()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg">
                            Abbrechen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

// Submit status update
async function submitStatusUpdate(e) {
    e.preventDefault();
    
    const data = {
        contact_status: document.getElementById('update-contact-status').value,
        lead_stage: document.getElementById('update-lead-stage').value,
        priority_level: parseInt(document.getElementById('update-priority').value),
        sales_assigned_to: document.getElementById('update-assigned-to').value,
        next_follow_up_date: document.getElementById('update-follow-up').value
    };
    
    try {
        await axios.put(`/api/crm/residence/${currentResidenceId}/status`, data);
        document.getElementById('update-status-modal').remove();
        showResidenceDetails(currentResidenceId); // Reload
        alert('Status erfolgreich aktualisiert!');
    } catch (error) {
        console.error('Failed to update status:', error);
        alert('Fehler beim Aktualisieren des Status');
    }
}

// Show AI evaluation modal
function showAIEvaluationModal() {
    const modal = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" id="ai-evaluation-modal">
            <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                <h3 class="text-xl font-bold mb-4 flex items-center">
                    <i class="fas fa-brain text-purple-600 mr-2"></i>
                    KI-Bewertung starten
                </h3>
                <p class="text-gray-600 mb-4">
                    Die KI wird diese Einrichtung anhand verschiedener Kriterien bewerten und eine Empfehlung abgeben.
                </p>
                <form onsubmit="submitAIEvaluation(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Bewertungskriterien</label>
                        <textarea id="ai-criteria" class="w-full border rounded-lg px-3 py-2" rows="4" placeholder="z.B. Eignung für digitales Kommunikationstool, Budget-Potenzial, Innovationsbereitschaft..." required>Bewerte diese Einrichtung hinsichtlich:
- Eignung für digitales Kommunikationstool
- Budget-Potenzial
- Innovationsbereitschaft
- Entscheider-Zugang</textarea>
                    </div>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                        <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                        <strong>Hinweis:</strong> Die Bewertung kann 10-30 Sekunden dauern.
                    </div>
                    <div class="flex gap-2 pt-4">
                        <button type="submit" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">
                            <i class="fas fa-magic mr-2"></i>Bewertung starten
                        </button>
                        <button type="button" onclick="document.getElementById('ai-evaluation-modal').remove()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg">
                            Abbrechen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

// Submit AI evaluation
async function submitAIEvaluation(e) {
    e.preventDefault();
    
    const criteria = document.getElementById('ai-criteria').value;
    const modal = document.getElementById('ai-evaluation-modal');
    
    // Show loading state
    modal.querySelector('form').innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
            <p class="text-gray-600">KI bewertet die Einrichtung...</p>
            <p class="text-sm text-gray-500 mt-2">Dies kann einen Moment dauern</p>
        </div>
    `;
    
    try {
        const response = await axios.post(`/api/crm/ai/evaluate/${currentResidenceId}`, { criteria });
        
        if (response.data.success) {
            modal.remove();
            showResidenceDetails(currentResidenceId); // Reload
            alert(`Bewertung erfolgreich! Score: ${response.data.final_score}/100`);
        } else {
            throw new Error(response.data.error);
        }
    } catch (error) {
        console.error('AI evaluation failed:', error);
        modal.remove();
        alert('Fehler bei der KI-Bewertung: ' + (error.response?.data?.details || error.message));
    }
}
