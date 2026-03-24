import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Data Sources  ·  Integration Management Hub
   22 external data sources across 6 categories, per-country
   ═══════════════════════════════════════════════════════════════ */

type DSStatus = 'Connected' | 'Degraded' | 'Paused' | 'Error' | 'Offline';
type DSCategory = 'Government' | 'Law Enforcement' | 'Financial' | 'OSINT' | 'Technical' | 'Commercial';
type Protocol = 'REST' | 'SOAP' | 'gRPC' | 'MQTT' | 'ODBC' | 'RTSP' | 'ONVIF' | 'Proprietary' | 'WebSocket';

interface SyncEntry { id: string; ts: string; duration: string; records: number; status: 'success' | 'error' | 'partial'; detail: string; }
interface DataSource {
    id: string; name: string; provider: string; category: DSCategory;
    country: string; countryFlag: string;
    status: DSStatus; health: number;
    protocol: Protocol; endpoint: string; auth: string;
    rateLimit: string; errorRate: number;
    encryptRest: boolean; encryptTransit: boolean;
    schedule: string; lastSync: string; nextSync: string;
    recordCount: string; dataFields: string[];
    linkedModules: string[];
    tags: { label: string; color: string }[];
    syncLog: SyncEntry[];
    notes: string;
}

const statusColors: Record<DSStatus, string> = { Connected: '#22c55e', Degraded: '#f59e0b', Paused: '#6b7280', Error: '#ef4444', Offline: '#64748b' };
const statusIcons: Record<DSStatus, string> = { Connected: '🟢', Degraded: '🟡', Paused: '⏸️', Error: '🔴', Offline: '⚫' };
const catColors: Record<DSCategory, string> = { Government: '#3b82f6', 'Law Enforcement': '#ef4444', Financial: '#f59e0b', OSINT: '#22c55e', Technical: '#8b5cf6', Commercial: '#06b6d4' };
const catIcons: Record<DSCategory, string> = { Government: '🏛️', 'Law Enforcement': '👮', Financial: '💰', OSINT: '🌐', Technical: '📡', Commercial: '🏢' };

// ═══ 22 MOCK DATA SOURCES ═══
const mockDS: DataSource[] = [
    // Government (6)
    { id: 'ds-01', name: 'National Business Registry', provider: 'Croatian Ministry of Justice', category: 'Government', country: 'Croatia', countryFlag: '🇭🇷', status: 'Connected', health: 98, protocol: 'SOAP', endpoint: 'https://sudreg.pravosudje.hr/api/v2', auth: 'Certificate + API Key', rateLimit: '100 req/min', errorRate: 0.3, encryptRest: true, encryptTransit: true, schedule: 'Every 6h', lastSync: '2026-03-24 08:00', nextSync: '2026-03-24 14:00', recordCount: '842,156', dataFields: ['Company Name', 'OIB/VAT', 'Directors', 'Shareholders', 'Registration Date', 'Activity Code', 'Capital'], linkedModules: ['Organizations', 'Persons', 'Connections'], tags: [{ label: 'Production', color: '#22c55e' }, { label: 'GDPR', color: '#3b82f6' }], syncLog: [{ id: 'sl1', ts: '2026-03-24 08:00', duration: '2m 34s', records: 127, status: 'success', detail: '127 records updated. 3 new companies flagged.' }, { id: 'sl2', ts: '2026-03-24 02:00', duration: '2m 18s', records: 84, status: 'success', detail: '84 records. No new flags.' }], notes: 'Primary source for Croatian corporate intelligence. Covers all registered entities.' },
    { id: 'ds-02', name: 'Population Registry', provider: 'Croatian Ministry of Interior', category: 'Government', country: 'Croatia', countryFlag: '🇭🇷', status: 'Connected', health: 100, protocol: 'REST', endpoint: 'https://mup.gov.hr/api/population/v1', auth: 'Certificate + OAuth2', rateLimit: '50 req/min', errorRate: 0.1, encryptRest: true, encryptTransit: true, schedule: 'Every 12h', lastSync: '2026-03-24 06:00', nextSync: '2026-03-24 18:00', recordCount: '4,105,267', dataFields: ['OIB', 'Full Name', 'DOB', 'Address', 'Citizenship', 'Photo', 'Family'], linkedModules: ['Persons'], tags: [{ label: 'Classified', color: '#ef4444' }, { label: 'Production', color: '#22c55e' }], syncLog: [{ id: 'sl3', ts: '2026-03-24 06:00', duration: '8m 12s', records: 0, status: 'success', detail: 'Incremental check. No changes for watched subjects.' }], notes: 'Restricted access. Requires ministerial authorization.' },
    { id: 'ds-03', name: 'Land Registry (Gruntovnica)', provider: 'Croatian Courts', category: 'Government', country: 'Croatia', countryFlag: '🇭🇷', status: 'Connected', health: 92, protocol: 'SOAP', endpoint: 'https://e-izvadak.pravosudje.hr/ws', auth: 'Certificate', rateLimit: '30 req/min', errorRate: 1.2, encryptRest: true, encryptTransit: true, schedule: 'Daily', lastSync: '2026-03-24 04:00', nextSync: '2026-03-25 04:00', recordCount: '2,891,042', dataFields: ['Property ID', 'Owner', 'Address', 'Area', 'Encumbrances', 'Transfer History'], linkedModules: ['Persons', 'Organizations'], tags: [{ label: 'Production', color: '#22c55e' }], syncLog: [{ id: 'sl4', ts: '2026-03-24 04:00', duration: '5m 44s', records: 12, status: 'success', detail: '12 property transfers involving monitored entities.' }], notes: 'Useful for tracing asset movements.' },
    { id: 'ds-04', name: 'Court Records (e-Spis)', provider: 'Croatian Judiciary', category: 'Government', country: 'Croatia', countryFlag: '🇭🇷', status: 'Degraded', health: 71, protocol: 'SOAP', endpoint: 'https://sudskapraksapublic.vsrh.hr/ws', auth: 'Certificate', rateLimit: '20 req/min', errorRate: 4.8, encryptRest: true, encryptTransit: true, schedule: 'Every 12h', lastSync: '2026-03-24 00:00', nextSync: '2026-03-24 12:00', recordCount: '1,245,891', dataFields: ['Case Number', 'Court', 'Parties', 'Verdict', 'Date', 'Category'], linkedModules: ['Persons', 'Organizations'], tags: [{ label: 'Production', color: '#22c55e' }, { label: 'Degraded', color: '#f59e0b' }], syncLog: [{ id: 'sl5', ts: '2026-03-24 00:00', duration: '12m 05s', records: 34, status: 'partial', detail: '34/52 records synced. Timeout on civil cases endpoint.' }], notes: 'Intermittent timeouts on civil cases API. Criminal records stable.' },
    { id: 'ds-05', name: 'Vehicle Registry (HAK)', provider: 'Croatian Automobile Club', category: 'Government', country: 'Croatia', countryFlag: '🇭🇷', status: 'Connected', health: 96, protocol: 'REST', endpoint: 'https://hak.hr/api/vehicles/v3', auth: 'API Key', rateLimit: '200 req/min', errorRate: 0.5, encryptRest: true, encryptTransit: true, schedule: 'Every 4h', lastSync: '2026-03-24 08:30', nextSync: '2026-03-24 12:30', recordCount: '1,923,445', dataFields: ['Plate', 'VIN', 'Owner', 'Make/Model', 'Year', 'Color', 'Insurance', 'MOT'], linkedModules: ['Vehicles', 'Persons', 'LPR'], tags: [{ label: 'Production', color: '#22c55e' }, { label: 'Real-time', color: '#8b5cf6' }], syncLog: [{ id: 'sl6', ts: '2026-03-24 08:30', duration: '1m 12s', records: 56, status: 'success', detail: '56 plate changes. ZG-1847-AB insurance renewed.' }], notes: 'High-frequency sync for LPR cross-referencing.' },
    { id: 'ds-06', name: 'Tax Authority (Porezna)', provider: 'Croatian Tax Administration', category: 'Government', country: 'Croatia', countryFlag: '🇭🇷', status: 'Paused', health: 0, protocol: 'SOAP', endpoint: 'https://porezna.gov.hr/ws/v1', auth: 'Certificate + mTLS', rateLimit: '10 req/min', errorRate: 0, encryptRest: true, encryptTransit: true, schedule: 'Paused', lastSync: '2026-03-15 06:00', nextSync: '—', recordCount: '3,201,988', dataFields: ['OIB', 'Tax Status', 'Declarations', 'Liabilities', 'Assets'], linkedModules: ['Persons', 'Organizations'], tags: [{ label: 'Classified', color: '#ef4444' }, { label: 'Paused', color: '#6b7280' }], syncLog: [{ id: 'sl7', ts: '2026-03-15 06:00', duration: '15m 30s', records: 0, status: 'error', detail: 'Certificate expired. Awaiting renewal from MoF.' }], notes: 'Paused due to certificate expiry. Renewal in progress.' },

    // Law Enforcement (3)
    { id: 'ds-07', name: 'INTERPOL I-24/7', provider: 'INTERPOL Lyon', category: 'Law Enforcement', country: 'International', countryFlag: '🌍', status: 'Connected', health: 100, protocol: 'Proprietary', endpoint: 'I-24/7 Secure Gateway', auth: 'Certificate + Biometric', rateLimit: 'Unlimited', errorRate: 0, encryptRest: true, encryptTransit: true, schedule: 'Real-time', lastSync: '2026-03-24 04:00', nextSync: 'Continuous', recordCount: '102,345', dataFields: ['Red Notice', 'Yellow Notice', 'Stolen Vehicles', 'Stolen Documents', 'Wanted Persons', 'Fingerprints'], linkedModules: ['Persons', 'Vehicles', 'Face Recognition'], tags: [{ label: 'Classified', color: '#ef4444' }, { label: 'Real-time', color: '#8b5cf6' }, { label: 'Production', color: '#22c55e' }], syncLog: [{ id: 'sl8', ts: '2026-03-24 04:00', duration: '0.8s', records: 3, status: 'success', detail: '3 new Red Notices. 0 matches to HAWK subjects.' }], notes: 'Tier 1 classified. Biometric authentication required.' },
    { id: 'ds-08', name: 'Europol SIENA', provider: 'Europol The Hague', category: 'Law Enforcement', country: 'EU', countryFlag: '🇪🇺', status: 'Connected', health: 99, protocol: 'Proprietary', endpoint: 'SIENA Encrypted Channel', auth: 'Certificate + MFA', rateLimit: 'Unlimited', errorRate: 0.1, encryptRest: true, encryptTransit: true, schedule: 'Real-time', lastSync: '2026-03-24 09:15', nextSync: 'Continuous', recordCount: '58,912', dataFields: ['Intelligence Exchange', 'Operational Messages', 'Joint Investigation', 'Cross-border Cases'], linkedModules: ['Persons', 'Organizations', 'Operations'], tags: [{ label: 'Classified', color: '#ef4444' }, { label: 'Real-time', color: '#8b5cf6' }], syncLog: [{ id: 'sl9', ts: '2026-03-24 09:15', duration: '0.3s', records: 1, status: 'success', detail: 'Intelligence exchange: Mendoza travel alert forwarded.' }], notes: 'Secure Europol messaging for cross-border intelligence.' },
    { id: 'ds-09', name: 'National Police Database', provider: 'Croatian Police HQ', category: 'Law Enforcement', country: 'Croatia', countryFlag: '🇭🇷', status: 'Connected', health: 97, protocol: 'REST', endpoint: 'https://policija.gov.hr/api/npd/v2', auth: 'Certificate + Biometric', rateLimit: '500 req/min', errorRate: 0.4, encryptRest: true, encryptTransit: true, schedule: 'Real-time', lastSync: '2026-03-24 10:05', nextSync: 'Continuous', recordCount: '8,456,123', dataFields: ['Criminal Records', 'Warrants', 'Arrests', 'Fingerprints', 'DNA', 'Firearms Registry'], linkedModules: ['Persons', 'Vehicles', 'Face Recognition', 'Alerts'], tags: [{ label: 'Classified', color: '#ef4444' }, { label: 'Real-time', color: '#8b5cf6' }, { label: 'Production', color: '#22c55e' }], syncLog: [{ id: 'sl10', ts: '2026-03-24 10:05', duration: '0.1s', records: 0, status: 'success', detail: 'Real-time check. No new warrants for watched subjects.' }], notes: 'Primary domestic law enforcement database. Full criminal history access.' },

    // Financial (3)
    { id: 'ds-10', name: 'EU Sanctions List (CFSP)', provider: 'European Council', category: 'Financial', country: 'EU', countryFlag: '🇪🇺', status: 'Connected', health: 100, protocol: 'REST', endpoint: 'https://webgate.ec.europa.eu/fsd/fsf/api', auth: 'API Key', rateLimit: '60 req/min', errorRate: 0, encryptRest: true, encryptTransit: true, schedule: 'Every 1h', lastSync: '2026-03-24 10:00', nextSync: '2026-03-24 11:00', recordCount: '12,847', dataFields: ['Sanctioned Entity', 'Type', 'Nationality', 'DOB', 'Aliases', 'Passport', 'Reason'], linkedModules: ['Persons', 'Organizations', 'Risks'], tags: [{ label: 'Production', color: '#22c55e' }, { label: 'Real-time', color: '#8b5cf6' }], syncLog: [{ id: 'sl11', ts: '2026-03-24 10:00', duration: '4.2s', records: 0, status: 'success', detail: 'No new entries matching watched entities.' }], notes: 'Hourly sync for sanctions compliance. Zero tolerance for misses.' },
    { id: 'ds-11', name: 'PEP Screening (Dow Jones)', provider: 'Dow Jones Risk & Compliance', category: 'Financial', country: 'USA', countryFlag: '🇺🇸', status: 'Connected', health: 95, protocol: 'REST', endpoint: 'https://api.dowjones.com/risk/v2', auth: 'OAuth2 + API Key', rateLimit: '120 req/min', errorRate: 0.8, encryptRest: true, encryptTransit: true, schedule: 'Every 2h', lastSync: '2026-03-24 08:00', nextSync: '2026-03-24 10:00', recordCount: '4,200,000+', dataFields: ['PEP Status', 'SOE', 'Adverse Media', 'Sanctions', 'Relatives', 'Associates'], linkedModules: ['Persons', 'Organizations', 'Risks'], tags: [{ label: 'Production', color: '#22c55e' }, { label: 'Commercial', color: '#06b6d4' }], syncLog: [{ id: 'sl12', ts: '2026-03-24 08:00', duration: '12.5s', records: 2, status: 'success', detail: '2 PEP status changes for Al-Rashid associates.' }], notes: 'Premium screening. Covers 4.2M+ PEP/SOE profiles globally.' },
    { id: 'ds-12', name: 'Bank Transaction Monitor', provider: 'Croatian National Bank / FINA', category: 'Financial', country: 'Croatia', countryFlag: '🇭🇷', status: 'Connected', health: 94, protocol: 'WebSocket', endpoint: 'wss://fina.hr/aml/stream', auth: 'Certificate + mTLS', rateLimit: 'Real-time stream', errorRate: 1.1, encryptRest: true, encryptTransit: true, schedule: 'Real-time', lastSync: '2026-03-24 10:12', nextSync: 'Continuous', recordCount: 'Streaming', dataFields: ['Transaction ID', 'Amount', 'Currency', 'Sender', 'Receiver', 'Bank', 'Flags'], linkedModules: ['Persons', 'Organizations', 'Risks', 'Alerts', 'Workflows'], tags: [{ label: 'Classified', color: '#ef4444' }, { label: 'Real-time', color: '#8b5cf6' }, { label: 'AML', color: '#f59e0b' }], syncLog: [{ id: 'sl13', ts: '2026-03-24 10:12', duration: '—', records: 14, status: 'success', detail: 'Stream active. 14 flagged transactions in last hour. 0 threshold breaches.' }], notes: 'Real-time AML stream. Triggers OP GLACIER workflow on threshold breach (>€50K).' },

    // OSINT (3)
    { id: 'ds-13', name: 'Social Media Aggregator', provider: 'ARGUX OSINT Engine', category: 'OSINT', country: 'Global', countryFlag: '🌍', status: 'Connected', health: 88, protocol: 'gRPC', endpoint: 'grpc://osint.argux.local:9090', auth: 'mTLS', rateLimit: '1000 req/min', errorRate: 2.1, encryptRest: true, encryptTransit: true, schedule: 'Every 15min', lastSync: '2026-03-24 10:00', nextSync: '2026-03-24 10:15', recordCount: '2,456,789', dataFields: ['Platform', 'Username', 'Post Content', 'Engagement', 'Sentiment', 'Location', 'Connections'], linkedModules: ['Persons', 'Social Scraper', 'AI Assistant'], tags: [{ label: 'Production', color: '#22c55e' }, { label: 'AI-Enhanced', color: '#a855f7' }], syncLog: [{ id: 'sl14', ts: '2026-03-24 10:00', duration: '45s', records: 234, status: 'success', detail: '234 new posts. 3 flagged by AI sentiment analysis.' }], notes: 'Covers Facebook, X, Instagram, TikTok, LinkedIn, Telegram. AI-powered sentiment.' },
    { id: 'ds-14', name: 'News Monitor (500+ sources)', provider: 'ARGUX Media Engine', category: 'OSINT', country: 'Global', countryFlag: '🌍', status: 'Connected', health: 91, protocol: 'REST', endpoint: 'https://news.argux.local/api/v2', auth: 'API Key', rateLimit: '500 req/min', errorRate: 1.5, encryptRest: true, encryptTransit: true, schedule: 'Every 5min', lastSync: '2026-03-24 10:10', nextSync: '2026-03-24 10:15', recordCount: '8,912,456', dataFields: ['Headline', 'Source', 'Date', 'Entities', 'Sentiment', 'Relevance Score'], linkedModules: ['Persons', 'Organizations', 'Web Scraper'], tags: [{ label: 'Production', color: '#22c55e' }, { label: 'Real-time', color: '#8b5cf6' }], syncLog: [{ id: 'sl15', ts: '2026-03-24 10:10', duration: '8s', records: 42, status: 'success', detail: '42 articles. 1 relevant: Rashid Holdings quarterly report mention.' }], notes: '500+ global news sources. NLP entity extraction and relevance scoring.' },
    { id: 'ds-15', name: 'Dark Web Monitor', provider: 'ARGUX Dark Intelligence', category: 'OSINT', country: 'Global', countryFlag: '🌍', status: 'Degraded', health: 62, protocol: 'Proprietary', endpoint: 'tor://darkmon.argux.onion', auth: 'Key Pair + OTP', rateLimit: '10 req/min', errorRate: 8.5, encryptRest: true, encryptTransit: true, schedule: 'Every 1h', lastSync: '2026-03-24 09:00', nextSync: '2026-03-24 10:00', recordCount: '456,123', dataFields: ['Forum', 'Post', 'Author', 'Keywords', 'Threat Level', 'Linked Entities'], linkedModules: ['Persons', 'Organizations', 'Risks'], tags: [{ label: 'Classified', color: '#ef4444' }, { label: 'Degraded', color: '#f59e0b' }], syncLog: [{ id: 'sl16', ts: '2026-03-24 09:00', duration: '2m 15s', records: 8, status: 'partial', detail: '8/15 forums crawled. 7 unreachable. 0 new mentions of watched entities.' }], notes: 'Tor-based monitoring. High error rate due to dark web instability.' },

    // Technical (3)
    { id: 'ds-16', name: 'GPS Tracker Fleet', provider: 'ARGUX Device Network', category: 'Technical', country: 'Croatia', countryFlag: '🇭🇷', status: 'Connected', health: 97, protocol: 'MQTT', endpoint: 'mqtt://gps.argux.local:1883', auth: 'Certificate + Client ID', rateLimit: 'Unlimited', errorRate: 0.5, encryptRest: true, encryptTransit: true, schedule: 'Real-time (2s)', lastSync: '2026-03-24 10:14', nextSync: 'Continuous', recordCount: 'Streaming', dataFields: ['Device ID', 'Lat', 'Lng', 'Speed', 'Bearing', 'Battery', 'Signal'], linkedModules: ['Devices', 'Map', 'Persons', 'Vehicles', 'Alerts'], tags: [{ label: 'Production', color: '#22c55e' }, { label: 'Real-time', color: '#8b5cf6' }], syncLog: [{ id: 'sl17', ts: '2026-03-24 10:14', duration: '—', records: 0, status: 'success', detail: 'Stream active. 8 trackers online. 2s interval.' }], notes: '8 active GPS trackers. MQTT pub/sub. 2-second position updates.' },
    { id: 'ds-17', name: 'Camera Network (RTSP/ONVIF)', provider: 'ARGUX Vision', category: 'Technical', country: 'Multi-country', countryFlag: '🌍', status: 'Connected', health: 89, protocol: 'RTSP', endpoint: 'rtsp://vision.argux.local', auth: 'Certificate + IP Whitelist', rateLimit: 'Unlimited', errorRate: 2.0, encryptRest: true, encryptTransit: true, schedule: 'Real-time', lastSync: '2026-03-24 10:14', nextSync: 'Continuous', recordCount: '11 cameras', dataFields: ['Camera ID', 'Resolution', 'FPS', 'Status', 'Location', 'Night Vision', 'Motion'], linkedModules: ['Vision', 'Devices', 'Face Recognition', 'Map'], tags: [{ label: 'Production', color: '#22c55e' }, { label: 'Real-time', color: '#8b5cf6' }], syncLog: [{ id: 'sl18', ts: '2026-03-24 10:14', duration: '—', records: 0, status: 'success', detail: '8 cameras streaming. 1 offline (Cairo). 1 maintenance (Moscow). 1 standby (Shanghai).' }], notes: '11 cameras across 5 countries. RTSP + ONVIF protocols. AI face/vehicle detection.' },
    { id: 'ds-18', name: 'IMSI Catcher Array', provider: 'ARGUX SIGINT', category: 'Technical', country: 'Croatia', countryFlag: '🇭🇷', status: 'Connected', health: 93, protocol: 'Proprietary', endpoint: 'sigint://imsi.argux.local:4443', auth: 'Hardware Token + Biometric', rateLimit: 'Unlimited', errorRate: 1.2, encryptRest: true, encryptTransit: true, schedule: 'Real-time', lastSync: '2026-03-24 10:12', nextSync: 'Continuous', recordCount: 'Streaming', dataFields: ['IMSI', 'IMEI', 'Cell ID', 'Signal', 'Location', 'Call Log', 'SMS Metadata'], linkedModules: ['Devices', 'Persons', 'Alerts', 'Comms'], tags: [{ label: 'Classified', color: '#ef4444' }, { label: 'Real-time', color: '#8b5cf6' }], syncLog: [{ id: 'sl19', ts: '2026-03-24 10:12', duration: '—', records: 0, status: 'success', detail: 'Active. SIM swap detected: Mendoza new IMSI 21901***7733.' }], notes: 'Classified SIGINT capability. Requires judicial authorization per target.' },

    // Commercial (4)
    { id: 'ds-19', name: 'OpenCorporates', provider: 'OpenCorporates Ltd', category: 'Commercial', country: 'UK', countryFlag: '🇬🇧', status: 'Connected', health: 99, protocol: 'REST', endpoint: 'https://api.opencorporates.com/v0.4', auth: 'API Key', rateLimit: '1000 req/min', errorRate: 0.2, encryptRest: false, encryptTransit: true, schedule: 'Every 4h', lastSync: '2026-03-24 08:00', nextSync: '2026-03-24 12:00', recordCount: '210,000,000+', dataFields: ['Company Name', 'Jurisdiction', 'Status', 'Officers', 'Filings', 'Industry'], linkedModules: ['Organizations', 'Connections'], tags: [{ label: 'Production', color: '#22c55e' }, { label: 'Commercial', color: '#06b6d4' }], syncLog: [{ id: 'sl20', ts: '2026-03-24 08:00', duration: '22s', records: 18, status: 'success', detail: '18 records for Rashid Holdings subsidiaries. 2 new shell companies detected.' }], notes: '210M+ corporate records globally. Shell company detection workflow.' },
    { id: 'ds-20', name: 'Maritime AIS', provider: 'MarineTraffic', category: 'Commercial', country: 'Greece', countryFlag: '🇬🇷', status: 'Connected', health: 94, protocol: 'WebSocket', endpoint: 'wss://ais.marinetraffic.com/stream', auth: 'API Key + OAuth2', rateLimit: '200 req/min', errorRate: 0.9, encryptRest: false, encryptTransit: true, schedule: 'Real-time', lastSync: '2026-03-24 10:14', nextSync: 'Continuous', recordCount: 'Streaming', dataFields: ['MMSI', 'Vessel Name', 'Type', 'Position', 'Speed', 'Destination', 'ETA'], linkedModules: ['Map', 'Operations', 'Alerts'], tags: [{ label: 'Production', color: '#22c55e' }, { label: 'Real-time', color: '#8b5cf6' }], syncLog: [{ id: 'sl21', ts: '2026-03-24 10:14', duration: '—', records: 0, status: 'success', detail: 'Stream active. Monitoring 12 vessels near Zagreb port + Dubai dock.' }], notes: 'AIS vessel tracking for OP HAWK maritime component. Unregistered vessel alerts.' },
    { id: 'ds-21', name: 'Aviation Tracker', provider: 'FlightRadar24', category: 'Commercial', country: 'Sweden', countryFlag: '🇸🇪', status: 'Connected', health: 96, protocol: 'REST', endpoint: 'https://fr24api.flightradar24.com/v1', auth: 'API Key', rateLimit: '100 req/min', errorRate: 0.6, encryptRest: false, encryptTransit: true, schedule: 'Every 5min', lastSync: '2026-03-24 10:10', nextSync: '2026-03-24 10:15', recordCount: '1,200,000+', dataFields: ['Flight Number', 'Aircraft', 'Route', 'Position', 'Altitude', 'Speed', 'Registration'], linkedModules: ['Map', 'Persons', 'Operations'], tags: [{ label: 'Production', color: '#22c55e' }], syncLog: [{ id: 'sl22', ts: '2026-03-24 10:10', duration: '3.1s', records: 4, status: 'success', detail: '4 flights to/from Zagreb. No watched entity flight plans detected.' }], notes: 'Monitoring private aviation movements for HAWK and GLACIER targets.' },
    { id: 'ds-22', name: 'Credit Bureau', provider: 'HROK (Croatian Registry)', category: 'Commercial', country: 'Croatia', countryFlag: '🇭🇷', status: 'Error', health: 0, protocol: 'SOAP', endpoint: 'https://hrok.hr/ws/credit/v1', auth: 'Certificate + API Key', rateLimit: '30 req/min', errorRate: 100, encryptRest: true, encryptTransit: true, schedule: 'Every 24h', lastSync: '2026-03-22 06:00', nextSync: '—', recordCount: '3,456,789', dataFields: ['OIB', 'Credit Score', 'Active Loans', 'Payment History', 'Defaults', 'Inquiries'], linkedModules: ['Persons', 'Organizations', 'Risks'], tags: [{ label: 'Error', color: '#ef4444' }], syncLog: [{ id: 'sl23', ts: '2026-03-22 06:00', duration: '30s', records: 0, status: 'error', detail: 'Connection refused. Server maintenance (HROK announced 48h downtime).' }], notes: 'ERROR: HROK server maintenance. Expected recovery: 2026-03-25.' },
];

const allCountries = [...new Set(mockDS.map(d => d.country))].sort();
const allCategories: DSCategory[] = ['Government', 'Law Enforcement', 'Financial', 'OSINT', 'Technical', 'Commercial'];

function DataSourcesIndex() {
    const [search, setSearch] = useState('');
    const [catF, setCatF] = useState<DSCategory | 'all'>('all');
    const [statusF, setStatusF] = useState<DSStatus | 'all'>('all');
    const [countryF, setCountryF] = useState<string>('all');
    const [selDS, setSelDS] = useState<string | null>(null);
    const [detailTab, setDetailTab] = useState<'info' | 'synclog'>('info');

    const ds = selDS ? mockDS.find(d => d.id === selDS) : null;

    const filtered = useMemo(() => mockDS.filter(d => {
        if (catF !== 'all' && d.category !== catF) return false;
        if (statusF !== 'all' && d.status !== statusF) return false;
        if (countryF !== 'all' && d.country !== countryF) return false;
        if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.provider.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [catF, statusF, countryF, search]);

    // Group by country
    const grouped = useMemo(() => {
        const m: Record<string, DataSource[]> = {};
        filtered.forEach(d => { if (!m[d.country]) m[d.country] = []; m[d.country].push(d); });
        return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered]);

    const stats = { total: mockDS.length, connected: mockDS.filter(d => d.status === 'Connected').length, degraded: mockDS.filter(d => d.status === 'Degraded').length, error: mockDS.filter(d => d.status === 'Error' || d.status === 'Offline').length, paused: mockDS.filter(d => d.status === 'Paused').length, avgHealth: Math.round(mockDS.filter(d => d.health > 0).reduce((s, d) => s + d.health, 0) / mockDS.filter(d => d.health > 0).length) };

    return (<>
        <PageMeta title="Data Sources" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* LEFT: Filters */}
            <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#06b6d410', border: '1px solid #06b6d425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🗄️</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>DATA SOURCES</div><div style={{ fontSize: 7, color: theme.textDim }}>Integration Hub · {stats.total} sources</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sources..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                {/* Stats */}
                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                    {[{ l: 'Conn', n: stats.connected, c: '#22c55e' }, { l: 'Degr', n: stats.degraded, c: '#f59e0b' }, { l: 'Err', n: stats.error, c: '#ef4444' }, { l: 'Paus', n: stats.paused, c: '#6b7280' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '3px 0' }}><div style={{ fontSize: 13, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Category */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Category</div>
                    <button onClick={() => setCatF('all')} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: catF === 'all' ? `${theme.accent}08` : 'transparent', color: catF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${catF === 'all' ? theme.accent : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}>All ({mockDS.length})</button>
                    {allCategories.map(c => { const count = mockDS.filter(d => d.category === c).length; return <button key={c} onClick={() => setCatF(c)} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: catF === c ? `${catColors[c]}08` : 'transparent', color: catF === c ? catColors[c] : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${catF === c ? catColors[c] : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}><span>{catIcons[c]}</span><span style={{ flex: 1 }}>{c}</span><span style={{ fontSize: 7, fontFamily: "'JetBrains Mono',monospace" }}>{count}</span></button>; })}
                </div>

                {/* Status */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Status</div>
                    <button onClick={() => setStatusF('all')} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: statusF === 'all' ? `${theme.accent}08` : 'transparent', color: statusF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${statusF === 'all' ? theme.accent : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}>All</button>
                    {(['Connected', 'Degraded', 'Paused', 'Error', 'Offline'] as DSStatus[]).map(s => { const count = mockDS.filter(d => d.status === s).length; if (count === 0) return null; return <button key={s} onClick={() => setStatusF(s)} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: statusF === s ? `${statusColors[s]}08` : 'transparent', color: statusF === s ? statusColors[s] : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${statusF === s ? statusColors[s] : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}>{statusIcons[s]} {s} <span style={{ marginLeft: 'auto', fontSize: 7, fontFamily: "'JetBrains Mono',monospace" }}>{count}</span></button>; })}
                </div>

                {/* Country */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Country</div>
                    <select value={countryF} onChange={e => setCountryF(e.target.value)} style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: `1px solid ${countryF !== 'all' ? '#06b6d440' : theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                        <option value="all">All Countries</option>
                        {allCountries.map(c => <option key={c} value={c}>{c} ({mockDS.filter(d => d.country === c).length})</option>)}
                    </select>
                </div>

                {/* Sync All */}
                <div style={{ padding: '8px 12px', marginTop: 'auto' }}>
                    <button style={{ width: '100%', padding: '6px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Sync All Healthy</button>
                    <div style={{ fontSize: 7, color: theme.textDim, marginTop: 4, textAlign: 'center' as const }}>Avg Health: <span style={{ color: stats.avgHealth > 90 ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>{stats.avgHealth}%</span></div>
                </div>
            </div>

            {/* CENTER: Source List (grouped by country) */}
            <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', minWidth: 0 }}>
                {grouped.length === 0 && <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 28, opacity: 0.2, marginBottom: 6 }}>🗄️</div><div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary }}>No sources match</div></div>}

                {grouped.map(([country, sources]) => {
                    const flag = sources[0]?.countryFlag || '🌍';
                    return <div key={country}>
                        {/* Country header */}
                        <div style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, background: `${theme.border}08`, position: 'sticky' as const, top: 0, zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14 }}>{flag}</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: theme.text, letterSpacing: '0.03em' }}>{country}</span>
                            <span style={{ fontSize: 8, color: theme.textDim }}>({sources.length} source{sources.length !== 1 ? 's' : ''})</span>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                                {['Connected', 'Degraded', 'Error'].map(s => { const c = sources.filter(d => d.status === s).length; return c > 0 ? <span key={s} style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: `${statusColors[s as DSStatus]}12`, color: statusColors[s as DSStatus] }}>{c} {s.slice(0, 4)}</span> : null; })}
                            </div>
                        </div>

                        {/* Source rows */}
                        {sources.map(d => {
                            const sel = selDS === d.id;
                            const sc = statusColors[d.status]; const cc = catColors[d.category];
                            return <div key={d.id} onClick={() => { setSelDS(d.id); setDetailTab('info'); }} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: sel ? `${cc}04` : 'transparent', borderLeft: `3px solid ${sel ? cc : 'transparent'}`, transition: 'all 0.1s' }}>
                                {/* Health ring */}
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `conic-gradient(${sc} ${d.health * 3.6}deg, ${theme.border}20 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: sc, fontFamily: "'JetBrains Mono',monospace" }}>{d.health > 0 ? d.health : '—'}</div>
                                </div>
                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{d.name}</span>
                                    </div>
                                    <div style={{ fontSize: 8, color: theme.textDim }}>{d.provider}</div>
                                </div>
                                {/* Tags */}
                                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const, justifyContent: 'flex-end', maxWidth: 200 }}>
                                    <span style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${cc}12`, color: cc, fontWeight: 600 }}>{catIcons[d.category]} {d.category}</span>
                                    {d.tags.slice(0, 2).map(t => <span key={t.label} style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${t.color}12`, color: t.color, fontWeight: 600 }}>{t.label}</span>)}
                                </div>
                                {/* Status */}
                                <div style={{ textAlign: 'right' as const, flexShrink: 0, width: 65 }}>
                                    <div style={{ fontSize: 8, fontWeight: 700, color: sc }}>{statusIcons[d.status]} {d.status}</div>
                                    <div style={{ fontSize: 7, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{d.protocol}</div>
                                </div>
                            </div>;
                        })}
                    </div>;
                })}

                {/* Bottom */}
                <div style={{ padding: '4px 16px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>{filtered.length}/{mockDS.length} sources · {allCountries.length} countries · {stats.connected} connected</span>
                    <div style={{ flex: 1 }} /><span>On-Premise · Air-Gap Ready</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>

            {/* RIGHT: Detail Panel */}
            {ds && <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                {/* Header */}
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${catColors[ds.category]}12`, border: `1px solid ${catColors[ds.category]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{catIcons[ds.category]}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{ds.name}</div><div style={{ fontSize: 7, color: theme.textDim }}>{ds.provider}</div></div>
                        <button onClick={() => setSelDS(null)} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: `${statusColors[ds.status]}12`, color: statusColors[ds.status] }}>{statusIcons[ds.status]} {ds.status}</span>
                        {ds.tags.map(t => <span key={t.label} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${t.color}12`, color: t.color }}>{t.label}</span>)}
                    </div>
                </div>

                {/* Health + quick stats */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' as const }}><div style={{ width: 40, height: 40, borderRadius: '50%', background: `conic-gradient(${statusColors[ds.status]} ${ds.health * 3.6}deg, ${theme.border}20 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: theme.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: statusColors[ds.status], fontFamily: "'JetBrains Mono',monospace" }}>{ds.health || '—'}</div></div><div style={{ fontSize: 6, color: theme.textDim, marginTop: 2 }}>Health</div></div>
                    <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: 13, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{ds.errorRate}%</div><div style={{ fontSize: 6, color: theme.textDim }}>Error Rate</div></div>
                    <div style={{ textAlign: 'center' as const }}><div style={{ fontSize: 13, fontWeight: 800, color: theme.accent, fontFamily: "'JetBrains Mono',monospace" }}>{ds.recordCount.includes('Streaming') ? '∞' : ds.recordCount.split(',')[0] + (ds.recordCount.includes(',') ? 'K+' : '')}</div><div style={{ fontSize: 6, color: theme.textDim }}>Records</div></div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {[{ id: 'info' as const, l: '⚙️ Connection' }, { id: 'synclog' as const, l: '📜 Sync Log' }].map(t => <button key={t.id} onClick={() => setDetailTab(t.id)} style={{ flex: 1, padding: '6px', border: 'none', borderBottom: `2px solid ${detailTab === t.id ? catColors[ds.category] : 'transparent'}`, background: 'transparent', color: detailTab === t.id ? theme.text : theme.textDim, fontSize: 9, fontWeight: detailTab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{t.l}</button>)}
                </div>

                {detailTab === 'info' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {/* Connection details */}
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                        {[
                            { l: 'Protocol', v: ds.protocol },
                            { l: 'Endpoint', v: ds.endpoint },
                            { l: 'Auth', v: ds.auth },
                            { l: 'Rate Limit', v: ds.rateLimit },
                            { l: 'Country', v: `${ds.countryFlag} ${ds.country}` },
                            { l: 'Schedule', v: ds.schedule },
                            { l: 'Last Sync', v: ds.lastSync },
                            { l: 'Next Sync', v: ds.nextSync },
                            { l: 'Records', v: ds.recordCount },
                            { l: 'Encrypt Rest', v: ds.encryptRest ? '✅ AES-256' : '❌ No' },
                            { l: 'Encrypt Transit', v: ds.encryptTransit ? '✅ TLS 1.3' : '❌ No' },
                        ].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><span style={{ fontSize: 8, color: theme.textDim, flexShrink: 0 }}>{r.l}</span><span style={{ fontSize: 8, color: theme.text, textAlign: 'right' as const, wordBreak: 'break-all' }}>{r.v}</span></div>)}
                    </div>

                    {/* Data fields */}
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Data Fields ({ds.dataFields.length})</div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                            {ds.dataFields.map(f => <span key={f} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${theme.border}30`, color: theme.textSecondary }}>{f}</span>)}
                        </div>
                    </div>

                    {/* Linked modules */}
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Linked Modules ({ds.linkedModules.length})</div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                            {ds.linkedModules.map(m => { const routes: Record<string, string> = { Persons: '/persons', Organizations: '/organizations', Vehicles: '/vehicles', Devices: '/devices', Map: '/map', Vision: '/vision', Alerts: '/alerts', Operations: '/operations', Risks: '/risks', Workflows: '/workflows', 'Face Recognition': '/face-recognition', 'Social Scraper': '/scraper', 'Web Scraper': '/web-scraper', 'AI Assistant': '/chat' }; const href = routes[m]; return <a key={m} href={href || '#'} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${theme.accent}08`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>{m}</a>; })}
                        </div>
                    </div>

                    {/* Notes */}
                    {ds.notes && <div style={{ padding: '8px 12px' }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Notes</div>
                        <div style={{ fontSize: 8, color: theme.textSecondary, lineHeight: 1.5 }}>{ds.notes}</div>
                    </div>}

                    {/* Actions */}
                    <div style={{ padding: '8px 12px', display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        <button style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Sync Now</button>
                        {ds.status !== 'Paused' && <button style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 8, cursor: 'pointer', fontFamily: 'inherit' }}>⏸️ Pause</button>}
                        {ds.status === 'Paused' && <button style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid #22c55e30`, background: '#22c55e06', color: '#22c55e', fontSize: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>▶️ Resume</button>}
                    </div>
                </div>}

                {detailTab === 'synclog' && <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {ds.syncLog.length === 0 && <div style={{ padding: 20, textAlign: 'center' as const, color: theme.textDim, fontSize: 9 }}>No sync history</div>}
                    {ds.syncLog.map(e => {
                        const ec = e.status === 'success' ? '#22c55e' : e.status === 'error' ? '#ef4444' : '#f59e0b';
                        return <div key={e.id} style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}06` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: ec }} />
                                <span style={{ fontSize: 8, fontWeight: 700, color: ec, textTransform: 'uppercase' as const }}>{e.status}</span>
                                <span style={{ fontSize: 7, color: theme.textDim, marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace" }}>{e.duration}</span>
                            </div>
                            <div style={{ fontSize: 8, color: theme.textSecondary, lineHeight: 1.4, marginBottom: 2 }}>{e.detail}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: theme.textDim }}>
                                <span>{e.ts}</span>
                                {e.records > 0 && <span>{e.records} records</span>}
                            </div>
                        </div>;
                    })}
                </div>}
            </div>}
        </div>
    </>);
}

DataSourcesIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default DataSourcesIndex;
