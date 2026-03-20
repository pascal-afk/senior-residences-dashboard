// ===== CONTACT MANAGEMENT SYSTEM =====

// Global state for bulk operations
let selectedResidences = new Set();
let contactTemplates = [];

// Initialize contact management
function initContactManagement() {
    loadContactTemplates();
    loadFollowUpReminders();
}

// ===== CONTACT TEMPLATES =====

// Default contact templates
const DEFAULT_TEMPLATES = [
    {
        id: 'initial_contact',
        name: 'Erstkontakt - Digitale Tools',
        channel: 'email',
        subject: 'Innovative digitale Kommunikationslösungen für Seniorenresidenzen',
        body: `Sehr geehrte Damen und Herren,

wir möchten Ihnen innovative digitale Kommunikationslösungen für Ihre Seniorenresidenz vorstellen.

Unsere Plattform bietet:
- Einfache Kommunikation mit Angehörigen
- Digitale Besucherverwaltung
- Automatische Dokumentation

Hätten Sie Interesse an einem unverbindlichen Gespräch?

Mit freundlichen Grüßen`,
        tags: ['initial', 'digital_tools']
    },
    {
        id: 'follow_up',
        name: 'Follow-Up nach Erstkontakt',
        channel: 'phone',
        notes: 'Nachfassen nach E-Mail vom [DATUM]. Entscheider: [NAME]',
        tags: ['follow_up']
    },
    {
        id: 'meeting_request',
        name: 'Meeting-Anfrage',
        channel: 'email',
        subject: 'Terminvorschlag für Produktdemo',
        body: `Sehr geehrte/r [NAME],

vielen Dank für Ihr Interesse an unseren digitalen Lösungen.

Ich würde gerne einen Termin für eine persönliche Produktdemo vorschlagen:
- Option 1: [DATUM] um [UHRZEIT]
- Option 2: [DATUM] um [UHRZEIT]

Welcher Termin würde Ihnen besser passen?

Mit freundlichen Grüßen`,
        tags: ['meeting', 'demo']
    },
    {
        id: 'quote_send',
        name: 'Angebot versendet',
        channel: 'email',
        subject: 'Ihr Angebot für digitale Kommunikationslösung',
        body: `Sehr geehrte/r [NAME],

wie besprochen sende ich Ihnen hiermit unser Angebot.

Im Anhang finden Sie:
- Detailliertes Produktangebot
- Preisübersicht
- Referenzen

Ich stehe Ihnen gerne für Rückfragen zur Verfügung.

Mit freundlichen Grüßen`,
        tags: ['quote', 'commercial']
    }
];

// Load contact templates
function loadContactTemplates() {
    const stored = localStorage.getItem('contact_templates');
    contactTemplates = stored ? JSON.parse(stored) : DEFAULT_TEMPLATES;
}

// Save contact templates
function saveContactTemplates() {
    localStorage.setItem('contact_templates', JSON.stringify(contactTemplates));
}

// ===== BULK SELECTION =====

// Toggle residence selection
function toggleResidenceSelection(residenceId) {
    const checkbox = document.querySelector(`[data-residence-id="${residenceId}"]`);
    
    if (selectedResidences.has(residenceId)) {
        selectedResidences.delete(residenceId);
        if (checkbox) checkbox.checked = false;
    } else {
        selectedResidences.add(residenceId);
        if (checkbox) checkbox.checked = true;
    }
    
    updateBulkActionBar();
}

// Select all visible residences
function selectAllResidences() {
    const checkboxes = document.querySelectorAll('.residence-checkbox');
    checkboxes.forEach(checkbox => {
        const id = checkbox.dataset.residenceId;
        selectedResidences.add(id);
        checkbox.checked = true;
    });
    updateBulkActionBar();
}

// Deselect all residences
function deselectAllResidences() {
    selectedResidences.clear();
    document.querySelectorAll('.residence-checkbox').forEach(cb => cb.checked = false);
    updateBulkActionBar();
}

// Update bulk action bar
function updateBulkActionBar() {
    const count = selectedResidences.size;
    const bar = document.getElementById('bulk-action-bar');
    
    if (!bar) return;
    
    if (count > 0) {
        bar.classList.remove('hidden');
        bar.querySelector('#selected-count').textContent = count;
    } else {
        bar.classList.add('hidden');
    }
}

// ===== QUICK CONTACT =====

// Quick contact from residence card
async function quickContact(residenceId, contactType) {
    try {
        const residenceRes = await axios.get(`/api/residences/${residenceId}`);
        const residence = residenceRes.data;
        
        // Show quick contact modal
        showQuickContactModal(residence, contactType);
    } catch (error) {
        console.error('Failed to load residence:', error);
        alert('Fehler beim Laden der Einrichtung');
    }
}

// Show quick contact modal
function showQuickContactModal(residence, contactType) {
    const template = contactTemplates.find(t => t.channel === contactType);
    
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick="closeQuickContact(event)">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full" onclick="event.stopPropagation()">
                <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                    <h3 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-${getContactIcon(contactType)} mr-2 text-blue-600"></i>
                        Schnellkontakt: ${residence.name}
                    </h3>
                    <p class="text-sm text-gray-600 mt-1">${residence.city}, ${residence.country}</p>
                </div>
                
                <div class="p-6">
                    <form id="quick-contact-form" onsubmit="submitQuickContact(event, '${residence.id}')">
                        <!-- Contact Type -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Kontakt-Kanal</label>
                            <select name="contact_type" class="form-control" required>
                                <option value="phone" ${contactType === 'phone' ? 'selected' : ''}>📞 Telefon</option>
                                <option value="email" ${contactType === 'email' ? 'selected' : ''}>✉️ E-Mail</option>
                                <option value="post" ${contactType === 'post' ? 'selected' : ''}>📮 Post</option>
                                <option value="meeting" ${contactType === 'meeting' ? 'selected' : ''}>🤝 Meeting</option>
                            </select>
                        </div>
                        
                        <!-- Template Selection -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Vorlage</label>
                            <select id="template-select" onchange="applyContactTemplate()" class="form-control">
                                <option value="">-- Keine Vorlage --</option>
                                ${contactTemplates.map(t => `
                                    <option value="${t.id}" ${template && template.id === t.id ? 'selected' : ''}>
                                        ${t.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <!-- Status -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                            <select name="contact_status" class="form-control" required>
                                <option value="success">✅ Erfolgreich</option>
                                <option value="failed">❌ Fehlgeschlagen</option>
                                <option value="no_response">⏳ Keine Antwort</option>
                                <option value="follow_up_needed">🔔 Wiedervorlage nötig</option>
                            </select>
                        </div>
                        
                        <!-- Outcome -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Ergebnis</label>
                            <select name="outcome" class="form-control">
                                <option value="">-- Bitte wählen --</option>
                                <option value="interested">🎯 Interessiert</option>
                                <option value="not_interested">❌ Kein Interesse</option>
                                <option value="info_sent">📧 Infos versendet</option>
                                <option value="meeting_scheduled">📅 Meeting vereinbart</option>
                                <option value="quote_requested">💰 Angebot angefordert</option>
                                <option value="callback_requested">📞 Rückruf gewünscht</option>
                                <option value="wrong_contact">👤 Falscher Ansprechpartner</option>
                            </select>
                        </div>
                        
                        <!-- Notes -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Notizen</label>
                            <textarea name="notes" rows="4" class="form-control" placeholder="Details zum Kontakt...">${template ? template.body || template.notes || '' : ''}</textarea>
                        </div>
                        
                        <!-- Contacted By -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Kontaktiert von</label>
                            <input type="text" name="contacted_by" class="form-control" placeholder="Ihr Name" required>
                        </div>
                        
                        <!-- Follow-Up Date -->
                        <div class="mb-6">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-calendar-alt mr-1"></i>
                                Follow-Up Datum (optional)
                            </label>
                            <input type="date" name="follow_up_date" class="form-control" min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <!-- Actions -->
                        <div class="flex gap-3">
                            <button type="submit" class="btn btn-primary flex-1">
                                <i class="fas fa-save mr-2"></i>
                                Kontakt speichern
                            </button>
                            <button type="button" onclick="closeQuickContact()" class="btn btn-secondary">
                                <i class="fas fa-times mr-2"></i>
                                Abbrechen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').innerHTML = modalHTML;
}

// Apply contact template
function applyContactTemplate() {
    const select = document.getElementById('template-select');
    const templateId = select.value;
    
    if (!templateId) return;
    
    const template = contactTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const form = document.getElementById('quick-contact-form');
    
    // Apply template values
    if (template.channel) {
        form.querySelector('[name="contact_type"]').value = template.channel;
    }
    
    if (template.body || template.notes) {
        form.querySelector('[name="notes"]').value = template.body || template.notes;
    }
}

// Submit quick contact
async function submitQuickContact(event, residenceId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const contactData = {
        residence_id: residenceId,
        contact_type: formData.get('contact_type'),
        contacted_by: formData.get('contacted_by'),
        contact_status: formData.get('contact_status'),
        outcome: formData.get('outcome'),
        notes: formData.get('notes'),
        follow_up_date: formData.get('follow_up_date') || null
    };
    
    try {
        await axios.post('/api/crm/contact', contactData);
        
        // Success message
        showSuccessToast('Kontakt erfolgreich gespeichert!');
        
        // Close modal
        closeQuickContact();
        
        // Refresh residence details if open
        if (currentResidenceId === residenceId) {
            showResidenceDetails(residenceId);
        }
        
    } catch (error) {
        console.error('Failed to save contact:', error);
        alert('Fehler beim Speichern des Kontakts');
    }
}

// Close quick contact modal
function closeQuickContact(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modal-container').innerHTML = '';
}

// ===== BULK CONTACT =====

// Show bulk contact modal
function showBulkContactModal() {
    if (selectedResidences.size === 0) {
        alert('Bitte wählen Sie mindestens eine Einrichtung aus');
        return;
    }
    
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick="closeBulkContact(event)">
            <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4">
                    <h3 class="text-2xl font-bold">
                        <i class="fas fa-users mr-2"></i>
                        Massen-Kontaktierung
                    </h3>
                    <p class="text-blue-100 mt-1">${selectedResidences.size} Einrichtungen ausgewählt</p>
                </div>
                
                <div class="p-6">
                    <form id="bulk-contact-form" onsubmit="submitBulkContact(event)">
                        <!-- Campaign Info -->
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 class="font-semibold text-blue-900 mb-2">
                                <i class="fas fa-bullhorn mr-2"></i>
                                Kampagnen-Information
                            </h4>
                            <p class="text-sm text-blue-700">
                                Sie kontaktieren ${selectedResidences.size} Einrichtungen gleichzeitig.
                                Alle Kontakte werden mit den gleichen Informationen erfasst.
                            </p>
                        </div>
                        
                        <!-- Contact Type -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Kontakt-Kanal</label>
                            <select name="contact_type" class="form-control" required>
                                <option value="email">✉️ E-Mail</option>
                                <option value="phone">📞 Telefon</option>
                                <option value="post">📮 Post</option>
                            </select>
                        </div>
                        
                        <!-- Template -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Vorlage verwenden</label>
                            <select id="bulk-template-select" onchange="applyBulkTemplate()" class="form-control">
                                <option value="">-- Keine Vorlage --</option>
                                ${contactTemplates.map(t => `
                                    <option value="${t.id}">${t.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <!-- Status -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Standard-Status</label>
                            <select name="contact_status" class="form-control" required>
                                <option value="success">✅ Erfolgreich versendet</option>
                                <option value="pending">⏳ In Bearbeitung</option>
                                <option value="follow_up_needed">🔔 Wiedervorlage geplant</option>
                            </select>
                        </div>
                        
                        <!-- Campaign Name -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Kampagnen-Name</label>
                            <input type="text" name="campaign_name" class="form-control" placeholder="z.B. Q1 2026 - Digitale Tools Deutschland" required>
                        </div>
                        
                        <!-- Notes Template -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Nachricht / Notizen</label>
                            <textarea name="notes" rows="6" class="form-control" placeholder="Standard-Text für alle Kontakte..."></textarea>
                            <p class="text-xs text-gray-500 mt-1">
                                💡 Tipp: Sie können Platzhalter wie [NAME], [STADT], [LAND] verwenden
                            </p>
                        </div>
                        
                        <!-- Contacted By -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Kontaktiert von</label>
                            <input type="text" name="contacted_by" class="form-control" placeholder="Ihr Name" required>
                        </div>
                        
                        <!-- Options -->
                        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                            <h4 class="font-semibold text-gray-800 mb-3">Optionen</h4>
                            
                            <label class="flex items-center mb-2">
                                <input type="checkbox" name="create_campaign" class="mr-2" checked>
                                <span class="text-sm">Als Kampagne speichern</span>
                            </label>
                            
                            <label class="flex items-center mb-2">
                                <input type="checkbox" name="set_lead_stage" class="mr-2">
                                <span class="text-sm">Lead-Stage auf "Warm" setzen</span>
                            </label>
                            
                            <label class="flex items-center">
                                <input type="checkbox" name="schedule_follow_up" class="mr-2">
                                <span class="text-sm">Automatisches Follow-Up in 7 Tagen</span>
                            </label>
                        </div>
                        
                        <!-- Preview -->
                        <div class="mb-6">
                            <button type="button" onclick="previewBulkContact()" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                <i class="fas fa-eye mr-1"></i>
                                Vorschau anzeigen
                            </button>
                        </div>
                        
                        <!-- Actions -->
                        <div class="flex gap-3">
                            <button type="submit" class="btn btn-primary flex-1">
                                <i class="fas fa-paper-plane mr-2"></i>
                                ${selectedResidences.size} Kontakte erstellen
                            </button>
                            <button type="button" onclick="closeBulkContact()" class="btn btn-secondary">
                                <i class="fas fa-times mr-2"></i>
                                Abbrechen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').innerHTML = modalHTML;
}

// Apply bulk template
function applyBulkTemplate() {
    const select = document.getElementById('bulk-template-select');
    const templateId = select.value;
    
    if (!templateId) return;
    
    const template = contactTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const form = document.getElementById('bulk-contact-form');
    
    if (template.channel) {
        form.querySelector('[name="contact_type"]').value = template.channel;
    }
    
    if (template.body || template.notes) {
        form.querySelector('[name="notes"]').value = template.body || template.notes;
    }
    
    if (template.name) {
        form.querySelector('[name="campaign_name"]').value = template.name;
    }
}

// Preview bulk contact
async function previewBulkContact() {
    const residenceIds = Array.from(selectedResidences).slice(0, 3);
    
    try {
        const previews = await Promise.all(
            residenceIds.map(id => axios.get(`/api/residences/${id}`))
        );
        
        const notes = document.getElementById('bulk-contact-form').querySelector('[name="notes"]').value;
        
        let previewHTML = '<div class="space-y-3">';
        
        previews.forEach(res => {
            const residence = res.data;
            const personalizedNotes = notes
                .replace(/\[NAME\]/g, residence.name)
                .replace(/\[STADT\]/g, residence.city)
                .replace(/\[LAND\]/g, residence.country);
            
            previewHTML += `
                <div class="border border-gray-200 rounded-lg p-3">
                    <div class="font-semibold">${residence.name}</div>
                    <div class="text-sm text-gray-600">${residence.city}, ${residence.country}</div>
                    <div class="text-sm mt-2 bg-gray-50 p-2 rounded">${personalizedNotes.substring(0, 100)}...</div>
                </div>
            `;
        });
        
        previewHTML += `<p class="text-sm text-gray-500 mt-2">... und ${selectedResidences.size - 3} weitere</p></div>`;
        
        alert('Vorschau:\n\n' + previews.map(r => r.data.name).join('\n'));
        
    } catch (error) {
        console.error('Preview failed:', error);
    }
}

// Submit bulk contact
async function submitBulkContact(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const bulkData = {
        residence_ids: Array.from(selectedResidences),
        contact_type: formData.get('contact_type'),
        contacted_by: formData.get('contacted_by'),
        contact_status: formData.get('contact_status'),
        notes: formData.get('notes'),
        campaign_name: formData.get('campaign_name'),
        create_campaign: formData.get('create_campaign') === 'on',
        set_lead_stage: formData.get('set_lead_stage') === 'on',
        schedule_follow_up: formData.get('schedule_follow_up') === 'on'
    };
    
    try {
        // Show progress
        showBulkContactProgress(bulkData.residence_ids.length);
        
        // Process contacts
        let successCount = 0;
        let failCount = 0;
        
        for (const residenceId of bulkData.residence_ids) {
            try {
                const residence = await axios.get(`/api/residences/${residenceId}`).then(r => r.data);
                
                // Personalize notes
                const personalizedNotes = bulkData.notes
                    .replace(/\[NAME\]/g, residence.name)
                    .replace(/\[STADT\]/g, residence.city)
                    .replace(/\[LAND\]/g, residence.country);
                
                await axios.post('/api/crm/contact', {
                    residence_id: residenceId,
                    contact_type: bulkData.contact_type,
                    contacted_by: bulkData.contacted_by,
                    contact_status: bulkData.contact_status,
                    notes: personalizedNotes,
                    outcome: 'bulk_campaign'
                });
                
                // Update lead stage if requested
                if (bulkData.set_lead_stage) {
                    await axios.put(`/api/crm/residence/${residenceId}/status`, {
                        lead_stage: 'warm'
                    });
                }
                
                successCount++;
                updateBulkProgress(successCount, bulkData.residence_ids.length);
                
            } catch (error) {
                console.error(`Failed to contact ${residenceId}:`, error);
                failCount++;
            }
        }
        
        // Success message
        closeBulkContactProgress();
        showSuccessToast(`${successCount} Kontakte erfolgreich erstellt!${failCount > 0 ? ` (${failCount} fehlgeschlagen)` : ''}`);
        
        // Clear selection
        deselectAllResidences();
        
        // Close modal
        closeBulkContact();
        
    } catch (error) {
        console.error('Bulk contact failed:', error);
        closeBulkContactProgress();
        alert('Fehler bei der Massen-Kontaktierung');
    }
}

// Show bulk contact progress
function showBulkContactProgress(total) {
    const progressHTML = `
        <div id="bulk-progress-overlay" class="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 class="text-lg font-bold mb-4">Kontakte werden erstellt...</h3>
                <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div id="bulk-progress-bar" class="bg-blue-600 h-4 rounded-full transition-all" style="width: 0%"></div>
                </div>
                <p id="bulk-progress-text" class="text-sm text-gray-600 text-center">0 / ${total}</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', progressHTML);
}

// Update bulk progress
function updateBulkProgress(current, total) {
    const bar = document.getElementById('bulk-progress-bar');
    const text = document.getElementById('bulk-progress-text');
    
    if (bar && text) {
        const percent = (current / total) * 100;
        bar.style.width = `${percent}%`;
        text.textContent = `${current} / ${total}`;
    }
}

// Close bulk contact progress
function closeBulkContactProgress() {
    const overlay = document.getElementById('bulk-progress-overlay');
    if (overlay) overlay.remove();
}

// Close bulk contact modal
function closeBulkContact(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modal-container').innerHTML = '';
}

// ===== FOLLOW-UP REMINDERS =====

// Load follow-up reminders
async function loadFollowUpReminders() {
    try {
        const response = await axios.get('/api/crm/stats');
        const stats = response.data;
        
        if (stats.follow_ups_due > 0) {
            showFollowUpBanner(stats.follow_ups_due);
        }
    } catch (error) {
        console.error('Failed to load follow-ups:', error);
    }
}

// Show follow-up banner
function showFollowUpBanner(count) {
    const banner = `
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <i class="fas fa-bell text-yellow-400 text-xl"></i>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm text-yellow-700">
                        Sie haben <strong>${count} fällige Follow-Ups</strong>
                    </p>
                </div>
                <div class="ml-auto">
                    <button onclick="showFollowUpsList()" class="btn btn-sm bg-yellow-500 text-white hover:bg-yellow-600">
                        <i class="fas fa-list mr-1"></i>
                        Anzeigen
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', banner);
    }
}

// ===== UTILITY FUNCTIONS =====

// Get contact icon
function getContactIcon(type) {
    const icons = {
        phone: 'phone',
        email: 'envelope',
        post: 'mail-bulk',
        meeting: 'handshake'
    };
    return icons[type] || 'address-book';
}

// Show success toast
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[70] animate-fade-in';
    toast.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactManagement);
} else {
    initContactManagement();
}
