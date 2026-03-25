/**
 * ARGUX — Risks Dashboard Mock Data
 * Risk factors, categories, keyboard shortcuts
 */

export type ViewTab = 'overview' | 'persons' | 'organizations' | 'vehicles' | 'matrix';

export interface RiskFactor {
    id: string; category: string; icon: string; label: string;
    severity: 'critical' | 'high' | 'medium' | 'low'; score: number; detail: string;
}

export const personRiskFactors: Record<number, RiskFactor[]> = {
    1: [
        { id: 'rf1', category: 'connections', icon: '🔗', label: 'High-risk connections', severity: 'critical', score: 95, detail: '5 connections to Critical/High entities (Mendoza, Babić, Al-Rashid, Hassan, Alpha Security)' },
        { id: 'rf2', category: 'zone', icon: '🛡️', label: 'Zone violations', severity: 'critical', score: 92, detail: '3 restricted zone breaches in 7 days. Port Terminal entry 11 times in 14 days.' },
        { id: 'rf3', category: 'behavior', icon: '🧠', label: 'Counter-surveillance', severity: 'high', score: 87, detail: 'Evasive driving (120km/h urban), weekend activity surge, route changes.' },
        { id: 'rf4', category: 'lpr', icon: '🚗', label: 'LPR activity', severity: 'high', score: 82, detail: '31 LPR captures in 30 days. Vehicle ZG-1847-AB at 8 monitored locations.' },
        { id: 'rf5', category: 'colocation', icon: '📍', label: 'Co-location pattern', severity: 'critical', score: 96, detail: '8 co-location events with Mendoza. 6 weekly meetings with Babić at Vukovarska.' },
        { id: 'rf6', category: 'anomaly', icon: '⚠️', label: 'AI anomalies', severity: 'high', score: 85, detail: '3 route deviations, 1 temporal anomaly (weekend surge), 1 speed anomaly detected.' },
    ],
    9: [
        { id: 'rf7', category: 'behavior', icon: '🧠', label: 'Counter-surveillance', severity: 'critical', score: 95, detail: 'U-turns, phone off during transit, extended waits. 3 incidents this week.' },
        { id: 'rf8', category: 'connections', icon: '🔗', label: 'High-risk connections', severity: 'critical', score: 90, detail: 'Direct contact with Horvat (8 meetings), Babić, Hassan.' },
        { id: 'rf9', category: 'comms', icon: '📡', label: 'Comms anomaly', severity: 'critical', score: 93, detail: 'SIM swap detected. New prepaid IMSI. Encrypted messaging activated.' },
        { id: 'rf10', category: 'zone', icon: '🛡️', label: 'Night activity', severity: 'high', score: 88, detail: 'Active 22:00-03:00 on 4 weeknights. Nighttime ops window escalating.' },
        { id: 'rf11', category: 'anomaly', icon: '⚠️', label: 'AI anomalies', severity: 'high', score: 85, detail: 'Counter-surveillance scoring: HIGH. Evasive speed 118km/h recorded.' },
    ],
    12: [
        { id: 'rf12', category: 'connections', icon: '🔗', label: 'Network position', severity: 'high', score: 85, detail: 'Weekly meetings with Horvat. Security Director at Alpha Security Group.' },
        { id: 'rf13', category: 'lpr', icon: '🚗', label: 'Checkpoint avoidance', severity: 'high', score: 90, detail: 'Avoiding 3 fixed LPR cameras. Alternate route used 90% of trips (18/20).' },
        { id: 'rf14', category: 'zone', icon: '🛡️', label: 'Diplomatic zone', severity: 'high', score: 88, detail: 'First-time diplomatic quarter visits. 48 minutes near Embassy Row. New pattern.' },
        { id: 'rf15', category: 'behavior', icon: '🧠', label: 'Loitering detected', severity: 'medium', score: 68, detail: 'Camera AI flagged 22-minute loitering outside Heinzelova building.' },
    ],
    7: [
        { id: 'rf16', category: 'comms', icon: '📡', label: 'Encrypted comms', severity: 'critical', score: 92, detail: 'New encrypted channel. 14 messages in first hour to unknown contact.' },
        { id: 'rf17', category: 'zone', icon: '🛡️', label: 'Storage visits', severity: 'high', score: 83, detail: '4 visits to self-storage in 7 days. 48-hour interval. 16:00-16:20 precision.' },
        { id: 'rf18', category: 'connections', icon: '🔗', label: 'Network coordinator', severity: 'high', score: 80, detail: 'Communication burst pattern before 9/11 meetings. Suspected coordinator role.' },
    ],
    3: [
        { id: 'rf19', category: 'financial', icon: '💰', label: 'AML flags', severity: 'critical', score: 94, detail: 'Over-invoicing on 12 cargo shipments. Trade-based money laundering pattern.' },
        { id: 'rf20', category: 'connections', icon: '🔗', label: 'Financial network', severity: 'critical', score: 91, detail: 'CEO of Rashid Holdings. Direct link to Hassan (Falcon Trading). Shell company structure.' },
        { id: 'rf21', category: 'lpr', icon: '🚗', label: 'Diplomatic vehicle', severity: 'medium', score: 65, detail: 'SA-9012-RH (diplomatic plates) at airport cargo. Armored modification suspected.' },
    ],
};

export const factorCategories = [
    { id: 'connections', label: 'High-Risk Connections', icon: '🔗', color: '#ef4444' },
    { id: 'zone', label: 'Zone Violations', icon: '🛡️', color: '#f97316' },
    { id: 'lpr', label: 'LPR Flags', icon: '🚗', color: '#10b981' },
    { id: 'behavior', label: 'Behavioral Anomalies', icon: '🧠', color: '#8b5cf6' },
    { id: 'comms', label: 'Comms Anomalies', icon: '📡', color: '#3b82f6' },
    { id: 'colocation', label: 'Co-location Patterns', icon: '📍', color: '#ec4899' },
    { id: 'anomaly', label: 'AI Anomalies', icon: '⚠️', color: '#f59e0b' },
    { id: 'financial', label: 'Financial Flags', icon: '💰', color: '#06b6d4' },
];

export const keyboardShortcuts = [
    { key: '1', description: 'Overview tab' },
    { key: '2', description: 'Persons tab' },
    { key: '3', description: 'Organizations tab' },
    { key: '4', description: 'Vehicles tab' },
    { key: '5', description: 'Risk Factors tab' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters' },
    { key: 'Esc', description: 'Close expanded / modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
