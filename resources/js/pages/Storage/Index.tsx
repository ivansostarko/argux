import PageMeta from '../../components/layout/PageMeta';
import AppLayout from '../../layouts/AppLayout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { useToast } from '../../components/ui/Toast';
import { mockFiles as FALLBACK, entities as FALLBACK_E, fileTypeConfig, keyboardShortcuts } from '../../mock/storage';
import type { FileType, StorageFile, StorageEntity } from '../../mock/storage';

/**
 * ARGUX Storage Browser — split-panel file manager via mock REST API.
 */

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

export default function StorageIndex() {
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [tree, setTree] = useState<{ persons: StorageEntity[]; organizations: StorageEntity[] }>({ persons: [], organizations: [] });
    const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
    const [totalSize, setTotalSize] = useState('');
    const [search, setSearch] = useState('');
    const [selEntity, setSelEntity] = useState<number | null>(null);
    const [selType, setSelType] = useState<FileType | ''>('');
    const [selFile, setSelFile] = useState<string | null>(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [expandPersons, setExpandPersons] = useState(true);
    const [expandOrgs, setExpandOrgs] = useState(true);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();
    const toast = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true); trigger();
        const params = new URLSearchParams();
        if (selEntity) params.set('entity_id', String(selEntity));
        if (selType) params.set('file_type', selType);
        if (search) params.set('search', search);
        const [treeRes, filesRes] = await Promise.all([apiCall('/mock-api/storage/tree'), apiCall(`/mock-api/storage/files?${params}`)]);
        if (treeRes.ok) setTree({ persons: treeRes.data.persons || [], organizations: treeRes.data.organizations || [] });
        else setTree({ persons: FALLBACK_E.filter(e => e.type === 'person'), organizations: FALLBACK_E.filter(e => e.type === 'organization') });
        if (filesRes.ok && filesRes.data.data) { setFiles(filesRes.data.data); setTypeCounts(filesRes.data.type_counts || {}); setTotalSize(filesRes.data.meta?.total_size || ''); }
        else { setFiles(FALLBACK as StorageFile[]); }
        setLoading(false);
    }, [selEntity, selType, search, trigger]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const file = selFile ? files.find(f => f.id === selFile) : null;
    const selEntityObj = selEntity ? [...tree.persons, ...tree.organizations].find(e => e.id === selEntity) : null;

    const handleDownload = async (id: string) => {
        const { ok, data } = await apiCall(`/mock-api/storage/files/${id}/download`);
        if (ok) toast.success('Download', `${data.file} (${data.size})`);
        else toast.error('Error', data.message);
    };
    const handleDelete = async (id: string) => {
        const { ok, data } = await apiCall(`/mock-api/storage/files/${id}`, 'DELETE');
        if (ok) { toast.info('Deleted', data.message); setFiles(prev => prev.filter(f => f.id !== id)); if (selFile === id) setSelFile(null); }
        else toast.error('Error', data.message);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); setShowShortcuts(p => !p); return; }
            switch (e.key) { case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break; case 'Escape': if (selFile) setSelFile(null); else setShowShortcuts(false); break; }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [selFile]);

    const TreeSection = ({ title, icon, items, expanded, toggle }: { title: string; icon: string; items: StorageEntity[]; expanded: boolean; toggle: () => void }) => (
        <div style={{ marginBottom: 8 }}>
            <button onClick={toggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 6, border: 'none', background: 'transparent', color: theme.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                <span style={{ fontSize: 10, color: theme.textDim, transition: 'transform 0.15s', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</span>{icon} {title} <span style={{ fontSize: 10, color: theme.textDim, marginLeft: 'auto' }}>{items.length}</span>
            </button>
            {expanded && items.map(e => (
                <button key={e.id} onClick={() => { setSelEntity(selEntity === e.id ? null : e.id); setSelFile(null); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, padding: '6px 10px 6px 28px', borderRadius: 5, border: 'none', background: selEntity === e.id ? `${theme.accent}12` : 'transparent', color: selEntity === e.id ? theme.accent : theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{e.name}</span>
                    <span style={{ fontSize: 10, color: theme.textDim, flexShrink: 0 }}>{e.fileCount}</span>
                </button>
            ))}
        </div>
    );

    return (<><PageMeta title="Storage Browser" /><div data-testid="storage-page" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, minHeight: 600 }}>
        {/* Left: Entity Tree */}
        <div style={{ background: theme.bgCard, borderRadius: 12, border: `1px solid ${theme.border}`, padding: 14, alignSelf: 'start', position: 'sticky' as const, top: 80 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>🗄️ Storage <span style={{ fontSize: 10, color: theme.textDim, fontWeight: 400 }}>{totalSize}</span></div>
            <button onClick={() => { setSelEntity(null); setSelFile(null); }} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: 'none', background: !selEntity ? `${theme.accent}12` : 'transparent', color: !selEntity ? theme.accent : theme.textSecondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8, textAlign: 'left' as const }}>📁 All Files</button>
            <TreeSection title="Persons" icon="👤" items={tree.persons} expanded={expandPersons} toggle={() => setExpandPersons(p => !p)} />
            <TreeSection title="Organizations" icon="🏢" items={tree.organizations} expanded={expandOrgs} toggle={() => setExpandOrgs(p => !p)} />
        </div>

        {/* Right: File List */}
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' as const, gap: 10 }}>
                <div><h1 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>{selEntityObj ? selEntityObj.name : 'All Files'}</h1><p style={{ fontSize: 12, color: theme.textSecondary, margin: 0 }}>{files.length} files{selEntityObj ? ` · ${selEntityObj.totalSize}` : totalSize ? ` · ${totalSize}` : ''}</p></div>
                <button onClick={() => setShowShortcuts(true)} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>⌨️</button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' as const }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 180, padding: '0 12px', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                    <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit' }} />
                </div>
                {(Object.keys(fileTypeConfig) as FileType[]).map(t => { const c = fileTypeConfig[t]; const active = selType === t; return (
                    <button key={t} onClick={() => setSelType(active ? '' : t)} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${active ? c.color : theme.border}`, background: active ? `${c.color}10` : 'transparent', color: active ? c.color : theme.textSecondary, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: active ? 700 : 400 }}>{c.icon} {c.label} ({typeCounts[t] || 0})</button>
                ); })}
            </div>

            {/* File table */}
            {loading ? Array.from({ length: 6 }).map((_, i) => <Skel key={i} w="100%" h={48} />) :
             files.length === 0 ? <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.15 }}>📁</div><div style={{ fontSize: 14, fontWeight: 600, color: theme.textSecondary, marginTop: 8 }}>No files found</div></div> :
             <div style={{ background: theme.bgCard, borderRadius: 10, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 140px 60px', padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                    <span>Name</span><span>Type</span><span>Size</span><span>Uploaded</span><span></span>
                </div>
                {files.map((f, idx) => { const tc = fileTypeConfig[f.fileType]; const active = selFile === f.id; return (
                    <div key={f.id} onClick={() => setSelFile(active ? null : f.id)} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 140px 60px', padding: '10px 14px', alignItems: 'center', borderBottom: idx < files.length - 1 ? `1px solid ${theme.border}08` : 'none', cursor: 'pointer', background: active ? `${tc.color}06` : 'transparent', transition: 'background 0.1s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <span style={{ fontSize: 14, flexShrink: 0 }}>{tc.icon}</span>
                            <div style={{ minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{f.name}</div><div style={{ fontSize: 10, color: theme.textDim }}>{f.entityName}</div></div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: tc.color }}>{tc.label}</span>
                        <span style={{ fontSize: 11, color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{f.size}</span>
                        <span style={{ fontSize: 11, color: theme.textDim }}>{f.uploadedAt}</span>
                        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleDownload(f.id)} title="Download" style={{ width: 24, height: 24, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📥</button>
                            <button onClick={() => handleDelete(f.id)} title="Delete" style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>
                        </div>
                    </div>
                ); })}
            </div>}

            {/* File detail */}
            {file && (() => { const tc = fileTypeConfig[file.fileType]; return (
                <div style={{ marginTop: 16, background: theme.bgCard, borderRadius: 12, border: `1px solid ${theme.border}`, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{tc.icon} File Detail</span>
                        <button onClick={() => setSelFile(null)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 12 }}>{file.name}</div>
                    <div style={{ fontSize: 11, marginBottom: 16 }}>
                        {[['Entity', file.entityName], ['Type', tc.label], ['Size', file.size], ['MIME', file.mimeType], ['Uploaded By', file.uploadedBy], ['Date', file.uploadedAt]].map(([k, v]) => (
                            <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${theme.border}08` }}>
                                <span style={{ color: theme.textDim }}>{k}</span><span style={{ color: theme.text, fontWeight: 500, fontSize: 11 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                    {Object.keys(file.metadata).length > 0 && <><div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Metadata</div><div style={{ background: theme.bgInput, borderRadius: 8, padding: 10, marginBottom: 12, border: `1px solid ${theme.border}` }}>{Object.entries(file.metadata).map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 }}><span style={{ color: theme.textDim }}>{k}</span><span style={{ color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace" }}>{v}</span></div>)}</div></>}
                    {file.transcript && <><div style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Transcript</div><div style={{ background: 'rgba(139,92,246,0.06)', borderRadius: 8, padding: 12, border: '1px solid rgba(139,92,246,0.15)', fontSize: 12, color: theme.text, lineHeight: 1.6, fontStyle: 'italic' as const, marginBottom: 12 }}>{file.transcript}</div></>}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleDownload(file.id)} style={{ flex: 1, padding: '8px 14px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>📥 Download</button>
                        <button onClick={() => handleDelete(file.id)} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Delete</button>
                    </div>
                </div>
            ); })()}
        </div>

        {/* Shortcuts modal */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}><div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>{keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${theme.border}08` }}><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 54, height: 22, padding: '0 7px', borderRadius: 4, border: `1px solid ${theme.border}`, background: 'rgba(128,128,128,0.06)', color: theme.textDim, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{s.key}</span><span style={{ fontSize: 12, color: theme.textSecondary }}>{s.description}</span></div>)}</div></div>}
    </div></>);
}
StorageIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
