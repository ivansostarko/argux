import PageMeta from '../../components/layout/PageMeta';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';

/* ─── Types ─── */
type Severity = 'critical' | 'warning' | 'info';
type NType = 'system' | 'storage' | 'user' | 'security' | 'device' | 'backup';

interface Notification {
    id: number;
    type: NType;
    severity: Severity;
    title: string;
    body: string;
    time: string;
    timestamp: string;
    read: boolean;
    source?: string;
}

/* ─── Mock Data ─── */
const initialNotifications: Notification[] = [
    { id: 1, type: 'security', severity: 'critical', title: 'Failed login attempts detected', body: '7 consecutive failures from IP 185.23.xx.xx targeting operator account m.novak@argux.mil. Account automatically locked for 30 minutes per security policy.', time: '3m ago', timestamp: '2026-03-20T14:57:00Z', read: false, source: 'Auth Service' },
    { id: 2, type: 'storage', severity: 'warning', title: 'Storage threshold exceeded', body: 'MinIO cluster node-03 has reached 91% capacity on the media partition. Automatic cleanup of expired cache will begin in 2 hours.', time: '12m ago', timestamp: '2026-03-20T14:48:00Z', read: false, source: 'Storage Monitor' },
    { id: 3, type: 'device', severity: 'critical', title: 'Device offline — GPS Tracker #0291', body: 'GPS Tracker assigned to Subject Delta-7 has not reported since 14:22 UTC. Last known position: 45.8131°N, 15.9775°E (Sector D-7). Signal lost event triggered.', time: '38m ago', timestamp: '2026-03-20T14:22:00Z', read: false, source: 'Device Manager' },
    { id: 4, type: 'system', severity: 'info', title: 'System update available — v2.1.1', body: 'ARGUX platform patch v2.1.1 is ready for deployment. Includes 3 security fixes, Kafka consumer optimization, and updated NLLB translation model weights.', time: '45m ago', timestamp: '2026-03-20T14:15:00Z', read: false, source: 'Update Service' },
    { id: 5, type: 'user', severity: 'info', title: 'New user registration pending', body: 'Ana Kovač (ana.kovac@agency.gov) has submitted a registration request for the GEOINT division with Secret clearance level. Awaiting admin approval.', time: '1h ago', timestamp: '2026-03-20T13:52:00Z', read: false, source: 'User Management' },
    { id: 6, type: 'security', severity: 'critical', title: 'Certificate expiration warning', body: 'TLS certificate for api.argux.internal expires in 7 days (March 27, 2026). Automatic renewal via ACME has been initiated. Manual intervention may be required if renewal fails.', time: '1h ago', timestamp: '2026-03-20T13:40:00Z', read: true, source: 'Security Monitor' },
    { id: 7, type: 'backup', severity: 'info', title: 'Scheduled backup completed', body: 'Full system backup completed successfully — 847 GB total, AES-256 encrypted, integrity hash verified. Stored to vault-02 cold storage. Next backup scheduled: March 21, 02:00 UTC.', time: '2h ago', timestamp: '2026-03-20T12:30:00Z', read: true, source: 'Backup Service' },
    { id: 8, type: 'device', severity: 'warning', title: 'Camera #14 — degraded video feed', body: 'RTSP stream from surveillance camera #14 (Building C entrance) experiencing packet loss >12%. Video quality reduced to 480p. Technician dispatch recommended.', time: '2h ago', timestamp: '2026-03-20T12:15:00Z', read: true, source: 'Camera Network' },
    { id: 9, type: 'storage', severity: 'warning', title: 'ClickHouse partition nearing retention limit', body: 'Events partition for Q4 2025 contains 148M rows and will exceed retention policy in 5 days. Archival to cold storage will begin automatically.', time: '3h ago', timestamp: '2026-03-20T11:45:00Z', read: true, source: 'Analytics Engine' },
    { id: 10, type: 'system', severity: 'info', title: 'Kafka consumer group rebalanced', body: 'Consumer group argux-events rebalanced across 6 partitions after node-05 health check timeout. All partitions re-assigned, lag recovered within 45 seconds.', time: '3h ago', timestamp: '2026-03-20T11:30:00Z', read: true, source: 'Event Pipeline' },
    { id: 11, type: 'user', severity: 'info', title: 'Operator role updated', body: 'User privileges changed for d.babić@argux.mil: promoted from Analyst to Senior Analyst. New permissions include report export and AI model query access.', time: '4h ago', timestamp: '2026-03-20T10:15:00Z', read: true, source: 'Access Control' },
    { id: 12, type: 'security', severity: 'warning', title: 'Unusual API usage pattern', body: 'REST API endpoint /api/v1/persons received 847 requests in 10 minutes from session operator-0041. Rate limit threshold (500/10m) exceeded. Session flagged for review.', time: '4h ago', timestamp: '2026-03-20T10:00:00Z', read: true, source: 'API Gateway' },
    { id: 13, type: 'backup', severity: 'info', title: 'Incremental backup completed', body: 'Incremental database backup — 12.3 GB delta since last full backup. PostgreSQL WAL segments archived. Restore point created: RP-20260320-0800.', time: '6h ago', timestamp: '2026-03-20T08:00:00Z', read: true, source: 'Backup Service' },
    { id: 14, type: 'device', severity: 'warning', title: 'Low battery — Tracker #0183', body: 'GPS Tracker #0183 (Subject Gamma-2) battery at 11%. Estimated remaining runtime: 4 hours. Last charge event: March 18, 09:00 UTC.', time: '6h ago', timestamp: '2026-03-20T08:15:00Z', read: true, source: 'Device Manager' },
    { id: 15, type: 'system', severity: 'info', title: 'Typesense index rebuilt', body: 'Full-text search index rebuilt for entities collection. 234,891 documents indexed in 2m 14s. Query latency baseline: 8ms (p99).', time: '8h ago', timestamp: '2026-03-20T06:00:00Z', read: true, source: 'Search Service' },
    { id: 16, type: 'security', severity: 'critical', title: 'Audit log integrity check failed', body: 'Cryptographic hash mismatch detected on audit entries 4,481,002–4,481,017. Investigation initiated. Entries quarantined and flagged for forensic review.', time: '10h ago', timestamp: '2026-03-20T04:30:00Z', read: true, source: 'Audit Service' },
    { id: 17, type: 'storage', severity: 'info', title: 'Media cleanup completed', body: 'Automated cleanup removed 23.4 GB of expired cache files and temporary transcription artifacts from processing pipeline.', time: '12h ago', timestamp: '2026-03-20T02:00:00Z', read: true, source: 'Storage Monitor' },
    { id: 18, type: 'backup', severity: 'warning', title: 'Vault-01 replication lag detected', body: 'Cross-site replication to vault-01 is lagging by 47 minutes. Network throughput between sites reduced to 120 Mbps (expected: 500 Mbps). Infrastructure team notified.', time: '14h ago', timestamp: '2026-03-20T00:30:00Z', read: true, source: 'Backup Service' },
    { id: 19, type: 'user', severity: 'info', title: 'Password policy enforcement', body: '3 operator accounts flagged for password age >90 days. Notification emails sent with 7-day compliance deadline. Affected: r.jurić, k.mandić, p.tomić.', time: '18h ago', timestamp: '2026-03-19T20:00:00Z', read: true, source: 'Access Control' },
    { id: 20, type: 'device', severity: 'info', title: 'Camera firmware update applied', body: 'ONVIF firmware v4.2.1 rolled out to 12 surveillance cameras in Sector A. All devices confirmed online and streaming. No downtime recorded.', time: '22h ago', timestamp: '2026-03-19T16:00:00Z', read: true, source: 'Camera Network' },
];

/* ─── Helpers ─── */
const typeColors: Record<NType, string> = {
    system: theme.accent, storage: theme.warning, user: theme.cyan,
    security: theme.danger, device: theme.warning, backup: theme.success,
};

const typeLabels: Record<NType, string> = {
    system: 'System', storage: 'Storage', user: 'User',
    security: 'Security', device: 'Device', backup: 'Backup',
};

const severityConfig: Record<Severity, { label: string; color: string; bg: string }> = {
    critical: { label: 'Critical', color: theme.danger, bg: theme.dangerDim },
    warning: { label: 'Warning', color: theme.warning, bg: theme.warningDim },
    info: { label: 'Info', color: theme.accent, bg: theme.accentDim },
};

type FilterTab = 'all' | 'unread' | 'critical' | 'warning' | 'info';

const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'critical', label: 'Critical' },
    { id: 'warning', label: 'Warning' },
    { id: 'info', label: 'Info' },
];

/* ─── Page ─── */
export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const filtered = notifications.filter(n => {
        if (activeTab === 'unread') return !n.read;
        if (activeTab === 'critical') return n.severity === 'critical';
        if (activeTab === 'warning') return n.severity === 'warning';
        if (activeTab === 'info') return n.severity === 'info';
        return true;
    });

    const counts = {
        all: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        critical: notifications.filter(n => n.severity === 'critical').length,
        warning: notifications.filter(n => n.severity === 'warning').length,
        info: notifications.filter(n => n.severity === 'info').length,
    };

    const toggleRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
                <>
        <PageMeta title="Notifications" section="notifications" />
<div style={{ maxWidth: 960, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Notifications</h1>
                    <p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>
                        {counts.unread} unread of {counts.all} total notifications
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {counts.unread > 0 && (
                        <button onClick={markAllRead} style={{
                            background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}`,
                            borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                            color: theme.textSecondary, fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                            transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = theme.accent; (e.currentTarget as HTMLElement).style.color = theme.text; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = theme.border; (e.currentTarget as HTMLElement).style.color = theme.textSecondary; }}
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,8.5 5.5,12.5 14.5,3.5"/></svg>
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex', gap: 4, marginBottom: 20, borderBottom: `1px solid ${theme.border}`,
                overflowX: 'auto', paddingBottom: 0,
            }}>
                {tabs.map(tab => {
                    const active = activeTab === tab.id;
                    const tabColor = tab.id === 'critical' ? theme.danger : tab.id === 'warning' ? theme.warning : tab.id === 'info' ? theme.accent : undefined;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            background: 'none', border: 'none', borderBottom: `2px solid ${active ? (tabColor || theme.accent) : 'transparent'}`,
                            padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit',
                            color: active ? theme.text : theme.textSecondary,
                            fontSize: 13, fontWeight: active ? 700 : 500, transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                        }}>
                            {tab.label}
                            <span style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                                background: active ? (tabColor ? `${tabColor}20` : theme.accentDim) : 'rgba(255,255,255,0.05)',
                                color: active ? (tabColor || theme.accent) : theme.textDim,
                                transition: 'all 0.15s',
                            }}>
                                {counts[tab.id]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Notification List */}
            <div style={{
                background: 'rgba(10,14,22,0.5)', border: `1px solid ${theme.border}`,
                borderRadius: 12, overflow: 'hidden',
            }}>
                {filtered.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, background: theme.accentDim,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px', border: `1px solid rgba(29,111,239,0.12)`,
                        }}>
                            <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6a4 4 0 018 0c0 4 2 5 2 5H2s2-1 2-5"/><path d="M6.5 13a1.5 1.5 0 003 0"/></svg>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: theme.text, margin: '0 0 4px' }}>No notifications</p>
                        <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0 }}>No {activeTab !== 'all' ? activeTab : ''} notifications to display.</p>
                    </div>
                ) : (
                    filtered.map((n, idx) => {
                        const sev = severityConfig[n.severity];
                        return (
                            <div key={n.id} style={{
                                display: 'flex', gap: 14, padding: '16px 20px',
                                borderBottom: idx < filtered.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                                background: n.read ? 'transparent' : 'rgba(29,111,239,0.03)',
                                cursor: 'pointer', transition: 'background 0.15s',
                            }}
                                onClick={() => toggleRead(n.id)}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                                onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(29,111,239,0.03)')}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                    background: `${typeColors[n.type]}12`,
                                    border: `1px solid ${typeColors[n.type]}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: typeColors[n.type], marginTop: 2,
                                }}>
                                    <TypeIcon type={n.type} />
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{n.title}</span>
                                        {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: theme.accent, flexShrink: 0, boxShadow: `0 0 6px ${theme.accent}` }} />}
                                    </div>
                                    <p style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.55, margin: '0 0 8px' }}>{n.body}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        {/* Severity badge */}
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                                            background: sev.bg, color: sev.color, letterSpacing: '0.06em',
                                            textTransform: 'uppercase' as const, border: `1px solid ${sev.color}20`,
                                        }}>{sev.label}</span>
                                        {/* Type badge */}
                                        <span style={{
                                            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                                            background: 'rgba(255,255,255,0.04)', color: theme.textSecondary,
                                            border: `1px solid ${theme.border}`,
                                        }}>{typeLabels[n.type]}</span>
                                        {/* Source */}
                                        {n.source && (
                                            <span style={{ fontSize: 10, color: theme.textDim }}>
                                                {n.source}
                                            </span>
                                        )}
                                        {/* Time */}
                                        <span style={{ fontSize: 10, color: theme.textDim, marginLeft: 'auto' }}>{n.time}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer stats */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20,
                fontSize: 11, color: theme.textDim, flexWrap: 'wrap',
            }}>
                <span>Showing {filtered.length} of {notifications.length}</span>
                <span>•</span>
                <span style={{ color: theme.danger }}>{counts.critical} critical</span>
                <span style={{ color: theme.warning }}>{counts.warning} warning</span>
                <span style={{ color: theme.accent }}>{counts.info} info</span>
            </div>
        </div>
    </>
    );
}

/* ─── Type Icon Component ─── */
function TypeIcon({ type }: { type: NType }) {
    const icons: Record<NType, React.ReactNode> = {
        system: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M13 8a5 5 0 00-.3-1.7l1.5-1.2-1-1.7-1.8.6A5 5 0 009.7 3L9 1.5H7L6.3 3a5 5 0 00-1.7 1l-1.8-.6-1 1.7 1.5 1.2A5 5 0 003 8a5 5 0 00.3 1.7l-1.5 1.2 1 1.7 1.8-.6c.5.4 1.1.8 1.7 1l.7 1.5h2l.7-1.5c.6-.2 1.2-.6 1.7-1l1.8.6 1-1.7-1.5-1.2A5 5 0 0013 8z"/></svg>,
        storage: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="4" rx="1"/><rect x="2" y="10" width="12" height="4" rx="1"/><circle cx="4.5" cy="4" r="0.5" fill="currentColor"/><circle cx="4.5" cy="12" r="0.5" fill="currentColor"/></svg>,
        user: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>,
        security: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5l5.5 2v4c0 3.5-2.5 6-5.5 7.5-3-1.5-5.5-4-5.5-7.5v-4z"/></svg>,
        device: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="8" height="8" rx="1"/><rect x="6" y="6" width="4" height="4" rx="0.5"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="6" y1="12" x2="6" y2="14"/><line x1="10" y1="12" x2="10" y2="14"/></svg>,
        backup: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v9a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1H8L6.5 3H3a1 1 0 00-1 1z"/><polyline points="6,9 8,11 10,9"/><line x1="8" y1="7" x2="8" y2="11"/></svg>,
    };
    return <>{icons[type]}</>;
}

NotificationsPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
