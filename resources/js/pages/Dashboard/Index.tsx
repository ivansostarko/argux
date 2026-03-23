import PageMeta from '../../components/layout/PageMeta';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';

export default function Index() {
    return (
        <>
        <PageMeta title="Dashboard" description="ARGUX operational overview and system status" section="dashboard" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 64, height: 64, borderRadius: 16, background: theme.accentDim,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', border: `1px solid rgba(29,111,239,0.15)`,
                }}>
                    <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="1,3 6,1 10,3 15,1 15,13 10,15 6,13 1,15" />
                        <line x1="6" y1="1" x2="6" y2="13" /><line x1="10" y1="3" x2="10" y2="15" />
                    </svg>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text, margin: '0 0 8px' }}>Tactical Map</h2>
                <p style={{ fontSize: 13, color: theme.textSecondary, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                    The operational map interface will be rendered here. This page is currently a placeholder.
                </p>
            </div>
        </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
