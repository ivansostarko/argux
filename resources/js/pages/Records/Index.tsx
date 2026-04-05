import PageMeta from '../../components/layout/PageMeta';
import AppLayout from '../../layouts/AppLayout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { useToast } from '../../components/ui/Toast';
import { mockRecords as FALLBACK, typeConfig, custodyActionConfig, availablePersons, availableOrgs, keyboardShortcuts } from '../../mock/records';
import type { RecordType, EvidenceRecord as RecordItem } from '../../mock/records';

function getCsrf(): string { return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''); }
async function apiCall(url: string, method = 'GET', body?: any): Promise<any> {
    try {
        const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        return { ok: res.ok, status: res.status, data: await res.json() };
    } catch { return { ok: false, status: 0, data: { message: 'Network error.' } }; }
}

function Skel({ w, h }: { w: string | number; h: number }) { return <div style={{ width: typeof w === 'number' ? w : w, height: h, background: `linear-gradient(90deg, ${theme.bgInput} 25%, ${theme.border}20 50%, ${theme.bgInput} 75%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 6 }} />; }

export default function RecordsIndex() {
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
    const [search, setSearch] = useState('');
    const [typeF, setTypeF] = useState<RecordType | ''>('');
    const [selId, setSelId] = useState<string | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();
    const toast = useToast();

    const [nTitle, setNTitle] = useState(''); const [nType, setNType] = useState<RecordType>('document');
    const [nDesc, setNDesc] = useState(''); const [creating, setCreating] = useState(false);

    const fetchRecords = useCallback(async () => {
        setLoading(true); trigger();
        const params = new URLSearchParams();
        if (typeF) params.set('type', typeF);
        if (search) params.set('search', search);
        const { ok, data } = await apiCall(`/mock-api/records?${params}`);
        if (ok && data.data) { setRecords(data.data); if (data.type_counts) setTypeCounts(data.type_counts); }
        else setRecords(FALLBACK as RecordItem[]);
        setLoading(false);
    }, [typeF, search, trigger]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const sel = selId ? records.find(r => r.id === selId) : null;

    const handleCreate = async () => {
        if (!nTitle.trim() || !nDesc.trim()) return;
        setCreating(true);
        const { ok, data } = await apiCall('/mock-api/records', 'POST', { title: nTitle.trim(), type: nType, description: nDesc.trim() });
        setCreating(false);
        if (ok && data.data) { setRecords(prev => [data.data as RecordItem, ...prev]); setShowNew(false); setNTitle(''); setNDesc(''); toast.success('Record created', data.message); }
        else toast.error('Error', data.errors?.title?.[0] || data.message || 'Failed.');
    };
    const handleDelete = async (id: string) => {
        const { ok, data } = await apiCall(`/mock-api/records/${id}`, 'DELETE');
        if (ok) { toast.info('Deleted', data.message); setRecords(prev => prev.filter(r => r.id !== id)); if (selId === id) setSelId(null); }
        else toast.error('Error', data.message);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); setShowShortcuts(p => !p); return; }
            switch (e.key) { case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break; case 'n': case 'N': setShowNew(true); break; case 'Escape': if (showNew) setShowNew(false); else if (selId) setSelId(null); else setShowShortcuts(false); break; }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [selId, showNew]);

    const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' };

    return (<><PageMeta title="Records" /><div data-testid="records-page">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' as const, gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🗂️</div>
                <div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Records & Evidence</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{records.length} records · Chain of custody tracking</p></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowNew(true)} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ New Record</button>
                <button onClick={() => setShowShortcuts(true)} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>⌨️</button>
            </div>
        </div>

        {/* Type filter chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' as const }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200, ...inp, padding: 0, paddingLeft: 12 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records, transcripts..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit' }} />
            </div>
            {(Object.keys(typeConfig) as RecordType[]).map(t => { const c = typeConfig[t]; const active = typeF === t; return (
                <button key={t} onClick={() => setTypeF(active ? '' : t)} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${active ? c.color : theme.border}`, background: active ? `${c.color}10` : 'transparent', color: active ? c.color : theme.textSecondary, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: active ? 700 : 400 }}>{c.icon} {c.label} ({typeCounts[t] || 0})</button>
            ); })}
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 380px' : '1fr', gap: 16 }}>
            {/* Card grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
                {loading ? Array.from({ length: 6 }).map((_, i) => <Skel key={i} w="100%" h={120} />) :
                 records.length === 0 ? <div style={{ padding: 50, textAlign: 'center' as const, gridColumn: '1 / -1' }}><div style={{ fontSize: 36, opacity: 0.15 }}>🗂️</div><div style={{ fontSize: 14, fontWeight: 600, color: theme.textSecondary, marginTop: 8 }}>No records found</div></div> :
                 records.map(r => { const tc = typeConfig[r.type]; const active = selId === r.id; return (
                    <div key={r.id} onClick={() => setSelId(active ? null : r.id)} style={{ padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${active ? tc.color : theme.border}`, background: active ? `${tc.color}05` : theme.bgCard, cursor: 'pointer', transition: 'all 0.15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{tc.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{r.title}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${tc.color}12`, color: tc.color, border: `1px solid ${tc.color}25`, flexShrink: 0 }}>{tc.label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{r.description}</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginBottom: 6 }}>
                            {[...r.assignedPersons, ...r.assignedOrgs].map(e => <span key={`${e.type}-${e.id}`} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: `${theme.border}15`, color: theme.textSecondary }}>{e.type === 'person' ? '👤' : '🏢'} {e.name}</span>)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: theme.textDim }}>
                            <span>{r.createdBy} · {r.createdAt}</span>
                            <span>{r.custody.length} custody entries</span>
                        </div>
                    </div>
                ); })}
            </div>

            {/* Detail panel */}
            {sel && (() => { const tc = typeConfig[sel.type]; return (
                <div style={{ background: theme.bgCard, borderRadius: 12, border: `1px solid ${theme.border}`, padding: 20, alignSelf: 'start', position: 'sticky' as const, top: 80 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{tc.icon} Record Detail</span>
                        <button onClick={() => setSelId(null)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 8, lineHeight: 1.4 }}>{sel.title}</div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: `${tc.color}12`, color: tc.color, border: `1px solid ${tc.color}25` }}>{tc.label}</span>
                        {sel.fileSize && <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, background: `${theme.border}15`, color: theme.textDim }}>{sel.fileSize}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6, marginBottom: 16 }}>{sel.description}</div>

                    {sel.transcript && <><div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Transcript</div><div style={{ background: 'rgba(139,92,246,0.06)', borderRadius: 8, padding: 12, border: '1px solid rgba(139,92,246,0.15)', fontSize: 12, color: theme.text, lineHeight: 1.6, fontStyle: 'italic' as const, marginBottom: 16 }}>{sel.transcript}</div></>}

                    {(sel.assignedPersons.length > 0 || sel.assignedOrgs.length > 0) && <><div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Assigned Entities</div><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginBottom: 16 }}>{[...sel.assignedPersons, ...sel.assignedOrgs].map(e => <span key={`${e.type}-${e.id}`} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: `${theme.border}15`, color: theme.textSecondary }}>{e.type === 'person' ? '👤' : '🏢'} {e.name}</span>)}</div></>}

                    <div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Chain of Custody ({sel.custody.length})</div>
                    <div style={{ marginBottom: 16 }}>{sel.custody.map((c, i) => { const ac = custodyActionConfig[c.action]; return (
                        <div key={c.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < sel.custody.length - 1 ? `1px solid ${theme.border}08` : 'none', fontSize: 11 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${ac.color}12`, color: ac.color, border: `1px solid ${ac.color}25`, alignSelf: 'flex-start', flexShrink: 0 }}>{ac.label}</span>
                            <div style={{ flex: 1 }}><div style={{ color: theme.text, fontWeight: 500 }}>{c.details}</div><div style={{ color: theme.textDim, marginTop: 2 }}>{c.user} · {c.timestamp}</div></div>
                        </div>
                    ); })}</div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleDelete(sel.id)} style={{ flex: 1, padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Delete</button>
                    </div>
                </div>
            ); })()}
        </div>

        {/* New Record Modal */}
        {showNew && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>🗂️ New Record</div>
                    <button onClick={() => setShowNew(false)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6 }}>Title</label><input value={nTitle} onChange={e => setNTitle(e.target.value)} placeholder="Record title..." style={inp} /></div>
                <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6 }}>Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>{(Object.keys(typeConfig) as RecordType[]).map(t => { const c = typeConfig[t]; return <button key={t} onClick={() => setNType(t)} style={{ padding: '8px', borderRadius: 6, border: `1.5px solid ${nType === t ? c.color : theme.border}`, background: nType === t ? `${c.color}08` : 'transparent', color: nType === t ? c.color : theme.textSecondary, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: nType === t ? 700 : 400 }}>{c.icon} {c.label}</button>; })}</div>
                </div>
                <div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6 }}>Description</label><textarea value={nDesc} onChange={e => setNDesc(e.target.value)} placeholder="Evidence description..." rows={4} style={{ ...inp, resize: 'vertical' as const }} /></div>
                <button onClick={handleCreate} disabled={!nTitle.trim() || !nDesc.trim() || creating} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: nTitle.trim() && nDesc.trim() && !creating ? '#3b82f6' : theme.border, color: '#fff', fontSize: 14, fontWeight: 700, cursor: nTitle.trim() && nDesc.trim() && !creating ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: nTitle.trim() && nDesc.trim() && !creating ? 1 : 0.4 }}>{creating ? '⏳ Creating...' : '🗂️ Create Record'}</button>
            </div>
        </div>}

        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>{keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${theme.border}08` }}><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 54, height: 22, padding: '0 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'rgba(128,128,128,0.06)', color: theme.textDim, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{s.key}</span><span style={{ fontSize: 12, color: theme.textSecondary }}>{s.description}</span></div>)}</div></div>}
    </div></>);
}
RecordsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
