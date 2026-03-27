import PageMeta from '../../components/layout/PageMeta';
import AdminLayout from '../../layouts/AdminLayout';
import { theme } from '../../lib/theme';
const title = 'Statistics'; const icon = '📈'; const desc = 'System-wide analytics, activity trends, and usage metrics.';
export default function AdminStatistics() {
    return (<><PageMeta title={title} /><div data-testid="admin-statistics-page">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}><div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div><div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>{title}</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{desc}</p></div></div>
        <div style={{ padding: '60px 24px', textAlign: 'center' as const, borderRadius: 12, border: `1px dashed ${theme.border}`, background: `${theme.border}06` }}><div style={{ fontSize: 48, opacity: 0.15, marginBottom: 12 }}>{icon}</div><div style={{ fontSize: 16, fontWeight: 600, color: theme.textSecondary, marginBottom: 6 }}>{title}</div><div style={{ fontSize: 12, color: theme.textDim }}>This page is under development.</div></div>
    </div></>);
}
AdminStatistics.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
