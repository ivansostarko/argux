import PageMeta from '../../components/layout/PageMeta';
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { getVehicleById, riskColors, statusColors, type Risk, type Status } from '../../mock/vehicles';
import VehiclePhotos from '../../components/vehicles/VehiclePhotos';

const RB = ({ risk }: { risk: Risk }) => { const c = riskColors[risk]; return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${c}18`, color: c, border: `1px solid ${c}30`, textTransform: 'uppercase' as const }}>{risk}</span>; };
const SB = ({ status }: { status: Status }) => { const c = statusColors[status]; return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${c}18`, color: c, border: `1px solid ${c}30` }}>{status}</span>; };
const Field = ({ label, value, mono, accent }: { label: string; value?: string; mono?: boolean; accent?: boolean }) => value ? <div style={{ marginBottom: 16 }}><div style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 3 }}>{label}</div><div style={{ fontSize: 13, color: accent ? theme.accent : theme.text, fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', wordBreak: 'break-all' as const }}>{value}</div></div> : null;
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => <div style={{ marginBottom: 24 }}><div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${theme.border}` }}>{title}</div>{children}</div>;

const colorMap: Record<string, string> = { 'Black': '#111', 'White': '#f5f5f5', 'Silver': '#c0c0c0', 'Gray': '#808080', 'Red': '#dc2626', 'Blue': '#3b82f6', 'Dark Blue': '#1e40af', 'Green': '#22c55e', 'Dark Green': '#166534', 'Brown': '#92400e', 'Beige': '#d2b48c', 'Yellow': '#eab308', 'Orange': '#f97316', 'Gold': '#d4a017', 'Burgundy': '#800020', 'Olive': '#808000', 'Matte Black': '#1a1a1a', 'Pearl White': '#f0ece2', 'Champagne': '#f7e7ce', 'Gunmetal': '#2a3439', 'British Racing Green': '#004225' };

export default function VehicleShow() {
    const toast = useToast();
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const v = getVehicleById(Number(id));
    const [exporting, setExporting] = useState(false);

    if (!v) return <div style={{ textAlign: 'center', padding: '60px 20px' }}><h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Vehicle Not Found</h2><Button variant="secondary" onClick={() => router.visit('/vehicles')} style={{ width: 'auto', padding: '10px 20px', marginTop: 16 }}>Back</Button></div>;

    return (
                <>
        <PageMeta title="Vehicle Detail" section="vehicles" />
<div style={{ maxWidth: 900, margin: '0 auto' }}>
            <style>{`@media(max-width:768px){.vh-header-row{flex-direction:column!important}.vh-header-btns{width:100%}.vh-header-btns button{flex:1}}`}</style>

            {/* Header */}
            <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
                <div className="vh-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, minWidth: 0 }}>
                        {/* Plate badge */}
                        <div style={{ background: theme.bg, border: `2px solid ${theme.accent}40`, borderRadius: 10, padding: '12px 20px', flexShrink: 0, textAlign: 'center' as const }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: '0.05em' }}>{v.plate}</div>
                            <div style={{ fontSize: 10, color: theme.textDim, marginTop: 2 }}>{v.make} {v.model}</div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>{v.make} {v.model} ({v.year})</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: theme.textSecondary }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: colorMap[v.color] || '#666', border: '1px solid rgba(255,255,255,0.15)', display: 'inline-block' }} />{v.color}</span>
                                <span style={{ fontSize: 12, color: theme.textSecondary }}>· {v.type}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><SB status={v.status} /><RB risk={v.risk} /></div>
                        </div>
                    </div>
                    <div className="vh-header-btns" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                        <Button variant="secondary" onClick={() => router.visit('/vehicles')} style={{ width: 'auto', padding: '8px 14px', fontSize: 11 }}>Back</Button>
                        <Button variant="secondary" onClick={() => { setExporting(true); setTimeout(() => { setExporting(false); toast.success('PDF exported', `${v.plate}_report.pdf`); }, 1500); }} loading={exporting} style={{ width: 'auto', padding: '8px 14px', fontSize: 11 }}>Export PDF</Button>
                        <Button onClick={() => router.visit(`/vehicles/${v.id}/edit`)} style={{ width: 'auto', padding: '8px 14px', fontSize: 11 }}>Edit</Button>
                    </div>
                </div>
            </div>

            {/* Photo Gallery */}
            <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: theme.text, margin: 0 }}>Vehicle Photos ({v.photos.length})</h3>
                </div>
                <VehiclePhotos photos={v.photos} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
                {/* Left: Vehicle Details */}
                <div>
                    <Section title="Vehicle Information">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                            <Field label="Registration Plate" value={v.plate} mono />
                            <Field label="VIN" value={v.vin} mono />
                            <Field label="Make" value={v.make} />
                            <Field label="Model" value={v.model} />
                            <Field label="Year" value={v.year} mono />
                            <Field label="Type" value={v.type} />
                            <Field label="Color" value={v.color} />
                            <Field label="UUID" value={v.uuid} mono />
                        </div>
                    </Section>

                    {v.notes && <Section title="Intelligence Notes">
                        <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 14, fontSize: 13, color: theme.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>{v.notes}</div>
                    </Section>}

                    <Section title="Record Timestamps">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                            <Field label="Created" value={new Date(v.createdAt).toLocaleString()} />
                            <Field label="Last Updated" value={new Date(v.updatedAt).toLocaleString()} />
                        </div>
                    </Section>
                </div>

                {/* Right: Ownership */}
                <div>
                    <Section title="Ownership">
                        {v.personName && (
                            <div onClick={() => v.personId && router.visit(`/persons/${v.personId}`)} style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 16, marginBottom: 10, cursor: v.personId ? 'pointer' : 'default', transition: 'background 0.15s' }} onMouseEnter={e => v.personId && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={e => (e.currentTarget.style.background = theme.bg)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3" /><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /></svg></div>
                                    <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{v.personName}</div><div style={{ fontSize: 11, color: theme.textSecondary }}>Registered Person</div></div>
                                    {v.personId && <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><path d="M6 3l5 5-5 5" /></svg>}
                                </div>
                            </div>
                        )}
                        {v.orgName && (
                            <div onClick={() => v.orgId && router.visit(`/organizations/${v.orgId}`)} style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 16, marginBottom: 10, cursor: v.orgId ? 'pointer' : 'default', transition: 'background 0.15s' }} onMouseEnter={e => v.orgId && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={e => (e.currentTarget.style.background = theme.bg)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="11" rx="1" /><line x1="6" y1="3" x2="6" y2="14" /><line x1="10" y1="3" x2="10" y2="14" /><line x1="2" y1="7" x2="14" y2="7" /><line x1="2" y1="11" x2="14" y2="11" /></svg></div>
                                    <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{v.orgName}</div><div style={{ fontSize: 11, color: theme.textSecondary }}>Registered Organization</div></div>
                                    {v.orgId && <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><path d="M6 3l5 5-5 5" /></svg>}
                                </div>
                            </div>
                        )}
                        {!v.personName && !v.orgName && <p style={{ fontSize: 13, color: theme.textDim }}>No registered owner.</p>}
                    </Section>

                    {/* Color swatch visual */}
                    <Section title="Color Profile">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 60, height: 60, borderRadius: 10, background: colorMap[v.color] || '#666', border: `2px solid ${theme.border}` }} />
                            <div><div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{v.color}</div><div style={{ fontSize: 11, color: theme.textDim }}>{colorMap[v.color] || 'Custom'}</div></div>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    </>
    );
}
VehicleShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
