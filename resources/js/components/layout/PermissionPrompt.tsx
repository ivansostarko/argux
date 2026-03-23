import { useAppSettings } from '../../layouts/AppLayout';
import type { PermissionItem } from '../../hooks/usePermissions';

const statusColors: Record<string, string> = { granted: '#22c55e', denied: '#ef4444', prompt: '#f59e0b', unsupported: '#6b7280' };
const statusLabels: Record<string, string> = { granted: 'Granted', denied: 'Denied', prompt: 'Required', unsupported: 'N/A' };

export default function PermissionPrompt({ permissions, requesting, onAccept, onDismiss }: { permissions: PermissionItem[]; requesting: boolean; onAccept: () => void; onDismiss: () => void }) {
    const { currentTheme: th } = useAppSettings();
    const promptable = permissions.filter(p => p.status === 'prompt');

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={onDismiss} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'relative', width: 440, maxWidth: '92vw', maxHeight: '90vh', background: th.sidebarBg, border: `1px solid ${th.border}`, borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.7)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${th.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: th.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${th.accent}20` }}>
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={th.accent} strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="7" width="12" height="7" rx="1.5"/><path d="M4 7V5a4 4 0 118 0v2"/></svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: th.text }}>ARGUX Permissions</div>
                            <div style={{ fontSize: 11, color: th.textDim }}>Grant access for full platform functionality</div>
                        </div>
                    </div>
                    <p style={{ fontSize: 11, color: th.textSecondary, lineHeight: 1.5, margin: 0 }}>
                        ARGUX requires browser permissions to enable real-time tracking, surveillance feeds, and alert notifications. All data stays on-premise.
                    </p>
                </div>

                {/* Permission list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
                    {permissions.map(p => {
                        const c = statusColors[p.status];
                        return (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderBottom: `1px solid ${th.border}22` }}>
                                <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{p.icon}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: th.text }}>{p.label}</div>
                                    <div style={{ fontSize: 10, color: th.textDim, lineHeight: 1.4 }}>{p.description}</div>
                                </div>
                                <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${c}15`, color: c, border: `1px solid ${c}25`, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>{statusLabels[p.status]}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 24px', borderTop: `1px solid ${th.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={onAccept} disabled={requesting || promptable.length === 0} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: requesting ? th.border : th.accent, color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: requesting ? 'wait' : 'pointer', opacity: requesting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {requesting && <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'argux-spin 0.6s linear infinite', display: 'inline-block' }} />}
                        {requesting ? 'Requesting...' : `Grant ${promptable.length} Permission${promptable.length !== 1 ? 's' : ''}`}
                    </button>
                    <button onClick={onDismiss} style={{ padding: '10px 20px', borderRadius: 8, border: `1px solid ${th.border}`, background: 'transparent', color: th.textDim, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Skip</button>
                </div>

                <div style={{ padding: '0 24px 12px', fontSize: 9, color: th.textDim, textAlign: 'center' }}>
                    🔒 CLASSIFIED // NOFORN — All permissions can be managed in browser settings
                </div>
            </div>
        </div>
    );
}
