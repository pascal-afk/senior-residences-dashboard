-- Test Data for Development
-- Sample senior residences from different European countries

INSERT OR IGNORE INTO senior_residences (
    id, name, facility_type, street, house_number, city, postal_code, 
    country, country_code, full_address, lat, lon, phone, email, website,
    capacity, operator, operator_type, rating, rating_count, 
    price_min, price_max, price_currency, is_active, source
) VALUES

-- Germany
('de-001', 'Seniorenresidenz Am Stadtpark', 'nursing_home', 'Parkstraße', '15', 'München', '80339', 
 'Deutschland', 'DE', 'Parkstraße 15, 80339 München', 48.1351, 11.5820, '+49 89 12345678', 'info@residenz-muenchen.de', 'https://residenz-muenchen.de',
 120, 'ProSenior GmbH', 'private', 4.5, 89, 3200, 4500, 'EUR', 1, 'manual'),

('de-002', 'Pflegeheim Sonnenblick', 'assisted_living', 'Hauptstraße', '42', 'Berlin', '10115',
 'Deutschland', 'DE', 'Hauptstraße 42, 10115 Berlin', 52.5200, 13.4050, '+49 30 98765432', 'kontakt@sonnenblick-berlin.de', 'https://sonnenblick.de',
 80, 'Caritas Berlin', 'non_profit', 4.2, 65, 2800, 3900, 'EUR', 1, 'manual'),

('de-003', 'Seniorenwohnpark Hamburg', 'retirement_home', 'Alsterweg', '8', 'Hamburg', '20099',
 'Deutschland', 'DE', 'Alsterweg 8, 20099 Hamburg', 53.5511, 9.9937, '+49 40 55667788', 'info@wohnpark-hh.de', 'https://wohnpark-hamburg.de',
 150, 'AWO Hamburg', 'non_profit', 4.7, 142, 3500, 5200, 'EUR', 1, 'manual'),

-- France
('fr-001', 'Résidence Les Jardins', 'ehpad', 'Rue de la Paix', '25', 'Paris', '75001',
 'Frankreich', 'FR', '25 Rue de la Paix, 75001 Paris', 48.8566, 2.3522, '+33 1 42123456', 'contact@jardins-paris.fr', 'https://jardins-paris.fr',
 95, 'Korian France', 'private', 4.3, 78, 3800, 5500, 'EUR', 1, 'manual'),

('fr-002', 'Maison de Retraite Soleil', 'maison_de_retraite', 'Avenue Victor Hugo', '12', 'Lyon', '69001',
 'Frankreich', 'FR', '12 Avenue Victor Hugo, 69001 Lyon', 45.7640, 4.8357, '+33 4 78234567', 'info@soleil-lyon.fr', 'https://soleil-lyon.fr',
 75, 'Orpea Lyon', 'private', 4.1, 56, 3200, 4800, 'EUR', 1, 'manual'),

-- UK
('uk-001', 'Sunshine Care Home', 'care_home', 'High Street', '100', 'London', 'SW1A 1AA',
 'Großbritannien', 'GB', '100 High Street, London SW1A 1AA', 51.5074, -0.1278, '+44 20 71234567', 'info@sunshine-london.co.uk', 'https://sunshine-care.co.uk',
 110, 'HC-One Ltd', 'private', 4.6, 103, 3500, 5800, 'GBP', 1, 'cqc'),

('uk-002', 'Oakwood Nursing Home', 'nursing_home', 'Church Road', '45', 'Manchester', 'M1 1AD',
 'Großbritannien', 'GB', '45 Church Road, Manchester M1 1AD', 53.4808, -2.2426, '+44 161 2345678', 'contact@oakwood-mcr.co.uk', 'https://oakwood.co.uk',
 85, 'Four Seasons Health Care', 'private', 4.4, 92, 3200, 5200, 'GBP', 1, 'cqc'),

-- Spain
('es-001', 'Residencia Bella Vista', 'residencia_mayores', 'Calle Mayor', '33', 'Madrid', '28001',
 'Spanien', 'ES', 'Calle Mayor 33, 28001 Madrid', 40.4168, -3.7038, '+34 91 1234567', 'info@bellavista-madrid.es', 'https://bellavista.es',
 100, 'DomusVi España', 'private', 4.2, 71, 2500, 4200, 'EUR', 1, 'manual'),

('es-002', 'Centro Geriátrico Sol', 'centro_geriatrico', 'Avenida de la Constitución', '18', 'Barcelona', '08001',
 'Spanien', 'ES', 'Av. de la Constitución 18, 08001 Barcelona', 41.3851, 2.1734, '+34 93 9876543', 'contacto@sol-bcn.es', 'https://sol-barcelona.es',
 90, 'Amavir Barcelona', 'private', 4.5, 88, 2800, 4500, 'EUR', 1, 'manual'),

-- Italy
('it-001', 'Casa di Riposo Villa Serena', 'casa_di_riposo', 'Via Roma', '50', 'Roma', '00100',
 'Italien', 'IT', 'Via Roma 50, 00100 Roma', 41.9028, 12.4964, '+39 06 12345678', 'info@villaserena-roma.it', 'https://villaserena.it',
 70, 'KOS Group', 'private', 4.3, 64, 2400, 3800, 'EUR', 1, 'manual'),

-- Netherlands
('nl-001', 'Woonzorgcentrum De Horizon', 'woonzorgcentrum', 'Hoofdstraat', '88', 'Amsterdam', '1012 AB',
 'Niederlande', 'NL', 'Hoofdstraat 88, 1012 AB Amsterdam', 52.3676, 4.9041, '+31 20 1234567', 'info@dehorizon.nl', 'https://dehorizon.nl',
 95, 'Zorggroep Amsterdam', 'non_profit', 4.6, 97, 3000, 4500, 'EUR', 1, 'manual'),

-- Austria
('at-001', 'Seniorenheim Alpenblick', 'seniorenheim', 'Bergstraße', '22', 'Wien', '1010',
 'Österreich', 'AT', 'Bergstraße 22, 1010 Wien', 48.2082, 16.3738, '+43 1 5551234', 'kontakt@alpenblick.at', 'https://alpenblick.at',
 85, 'Caritas Wien', 'non_profit', 4.4, 76, 2900, 4200, 'EUR', 1, 'manual'),

-- Switzerland
('ch-001', 'Altersheim Sonnenhof', 'altersheim', 'Bahnhofstrasse', '15', 'Zürich', '8001',
 'Schweiz', 'CH', 'Bahnhofstrasse 15, 8001 Zürich', 47.3769, 8.5417, '+41 44 1234567', 'info@sonnenhof.ch', 'https://sonnenhof.ch',
 65, 'Stadt Zürich', 'public', 4.7, 89, 5500, 7500, 'CHF', 1, 'manual'),

-- Belgium
('be-001', 'Rusthuis De Meiboom', 'rusthuis', 'Kerkstraat', '30', 'Antwerpen', '2000',
 'Belgien', 'BE', 'Kerkstraat 30, 2000 Antwerpen', 51.2194, 4.4025, '+32 3 2345678', 'info@demeiboom.be', 'https://demeiboom.be',
 75, 'Senior Living Group', 'private', 4.3, 68, 2700, 4000, 'EUR', 1, 'manual'),

-- Sweden
('se-001', 'Äldreboende Solhöjden', 'aldreboende', 'Storgatan', '42', 'Stockholm', '111 22',
 'Schweden', 'SE', 'Storgatan 42, 111 22 Stockholm', 59.3293, 18.0686, '+46 8 12345678', 'info@solhojden.se', 'https://solhojden.se',
 80, 'Stockholms Stad', 'public', 4.5, 92, 35000, 55000, 'SEK', 1, 'manual');

-- Update country statistics
UPDATE countries SET total_residences = (
    SELECT COUNT(*) FROM senior_residences WHERE country_code = countries.code
);
