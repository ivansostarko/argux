import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockPersons } from '../../mock/persons';
import { mockOrganizations } from '../../mock/organizations';
import { mockFiles, buildTree, typeConfig, keyboardShortcuts } from '../../mock/storage';
import type { FileType, FolderNode } from '../../mock/storage';

/* ═══ ARGUX — Storage Browser ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="sto-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }
function SkeletonRows({ count = 8 }: { count?: number }) { return <>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'center' }}><Skel w={26} h={26} /><div style={{ flex: 1 }}><Skel w="60%" h={12} /><div style={{ height: 5 }} /><Skel w="35%" h={10} /></div><Skel w={60} h={12} /><Skel w={50} h={12} /></div>)}</>; }

function StorageIndex() {
    const [search, setSearch] = useState('');
    const [typeF, setTypeF] = useState<FileType | 'all'>('all');
    const [entityF, setEntityF] = useState('all');
    const [selFile, setSelFile] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['persons', 'orgs']));
    const [sortCol, setSortCol] = useState<'name' | 'size' | 'date' | 'type'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [showUpload, setShowUpload] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

    const tree = useMemo(buildTree, []);
    const file = selFile ? mockFiles.find(f => f.id === selFile) : null;

    const toggleExpand = (id: string) => setExpanded(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

    const filtered = useMemo(() => {
        let files = mockFiles;
        if (entityF !== 'all') {
            if (entityF === 'persons') files = files.filter(f => f.entityType === 'person');
            else if (entityF === 'orgs') files = files.filter(f => f.entityType === 'org');
            else if (entityF.startsWith('p-')) files = files.filter(f => f.entityType === 'person' && f.entityId === parseInt(entityF.slice(2)));
            else if (entityF.startsWith('o-')) files = files.filter(f => f.entityType === 'org' && f.entityId === parseInt(entityF.slice(2)));
        }
        if (typeF !== 'all') files = files.filter(f => f.type === typeF);
        if (search) files = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.entityName.toLowerCase().includes(search.toLowerCase()) || f.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) || (f.transcription?.toLowerCase().includes(search.toLowerCase())));
        return [...files].sort((a, b) => { const m = sortDir === 'asc' ? 1 : -1;
            if (sortCol === 'name') return a.name.localeCompare(b.name) * m;
            if (sortCol === 'size') return (a.sizeBytes - b.sizeBytes) * m;
            if (sortCol === 'type') return a.type.localeCompare(b.type) * m;
            return a.uploadedAt.localeCompare(b.uploadedAt) * m;
        });
    }, [entityF, typeF, search, sortCol, sortDir]);

    const totalSize = useMemo(() => { const b = filtered.reduce((s, f) => s + f.sizeBytes, 0); return b > 1e9 ? `${(b / 1e9).toFixed(1)} GB` : `${(b / 1e6).toFixed(1)} MB`; }, [filtered]);
    const toggleSort = (col: typeof sortCol) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('desc'); } };
    const SortIcon = ({ col }: { col: typeof sortCol }) => sortCol === col ? <span style={{ fontSize: 8, marginLeft: 2 }}>{sortDir === 'asc' ? '▲' : '▼'}</span> : null;

    const resetAll = useCallback(() => { setSearch(''); setTypeF('all'); setEntityF('all'); trigger(); }, [trigger]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case 'u': case 'U': if (!e.ctrlKey && !e.metaKey) setShowUpload(p => !p); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetAll(); break;
                case 'Escape': setSelFile(null); setShowShortcuts(false); setShowUpload(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [resetAll]);

    const TreeNode = ({ node, depth }: { node: FolderNode; depth: number }) => {
        const isExp = expanded.has(node.id); const isSel = entityF === node.id; const hasKids = node.children.length > 0;
        const fileCount = mockFiles.filter(f => { if (node.id === 'persons') return f.entityType === 'person'; if (node.id === 'orgs') return f.entityType === 'org'; if (node.entityType === 'person') return f.entityType === 'person' && f.entityId === node.entityId; if (node.entityType === 'org') return f.entityType === 'org' && f.entityId === node.entityId; return false; }).length;
        return <>{/* node */}<div onClick={() => { setEntityF(node.id); if (hasKids) toggleExpand(node.id); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: `4px 8px 4px ${10 + depth * 14}px`, cursor: 'pointer', borderRadius: 4, background: isSel ? `${theme.accent}08` : 'transparent', borderLeft: `2px solid ${isSel ? theme.accent : 'transparent'}`, fontSize: 12, color: isSel ? theme.text : theme.textDim }}>
            {hasKids && <span style={{ fontSize: 8, width: 10, textAlign: 'center' as const, color: theme.textDim, flexShrink: 0 }}>{isExp ? '▼' : '▶'}</span>}
            {!hasKids && <span style={{ width: 10, flexShrink: 0 }} />}
            <span style={{ fontSize: 12 }}>{node.icon}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, fontWeight: isSel ? 700 : 500 }}>{node.name}</span>
            {fileCount > 0 && <span style={{ fontSize: 9, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{fileCount}</span>}
        </div>{isExp && node.children.map(c => <TreeNode key={c.id} node={c} depth={depth + 1} />)}</>;
    };

    return (<>
        <PageMeta title="Storage Browser" />
        <div className="sto-page" data-testid="storage-page">

            {/* LEFT */}
            <div className="sto-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f59e0b10', border: '1px solid #f59e0b25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📁</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>STORAGE</div><div style={{ fontSize: 10, color: theme.textDim }}>MinIO File Manager</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="sto-kbd">F</span>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', padding: '4px 0' }}>
                    <div onClick={() => { setEntityF('all'); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px 5px 10px', cursor: 'pointer', borderRadius: 4, background: entityF === 'all' ? `${theme.accent}08` : 'transparent', borderLeft: `2px solid ${entityF === 'all' ? theme.accent : 'transparent'}`, fontSize: 12, color: entityF === 'all' ? theme.text : theme.textDim, fontWeight: entityF === 'all' ? 700 : 500, marginBottom: 2 }}>
                        <span style={{ fontSize: 12 }}>🗄️</span><span>All Files</span><span style={{ marginLeft: 'auto', fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{mockFiles.length}</span>
                    </div>
                    {tree.map(node => <TreeNode key={node.id} node={node} depth={0} />)}
                </div>

                <div style={{ padding: '8px 12px', borderTop: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>File Type</div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        <button onClick={() => { setTypeF('all'); trigger(); }} style={{ padding: '3px 6px', borderRadius: 3, border: `1px solid ${typeF === 'all' ? theme.accent + '40' : theme.border}`, background: typeF === 'all' ? `${theme.accent}08` : 'transparent', color: typeF === 'all' ? theme.accent : theme.textDim, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
                        {(Object.keys(typeConfig) as FileType[]).filter(t => t !== 'folder').map(t => { const tc = typeConfig[t]; const c = mockFiles.filter(f => f.type === t).length; if (c === 0) return null; return <button key={t} onClick={() => { setTypeF(t); trigger(); }} style={{ padding: '3px 6px', borderRadius: 3, border: `1px solid ${typeF === t ? tc.color + '40' : theme.border}`, background: typeF === t ? `${tc.color}08` : 'transparent', color: typeF === t ? tc.color : theme.textDim, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit' }}>{tc.icon} {c}</button>; })}
                    </div>
                </div>

                <div style={{ padding: '8px 12px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    <button onClick={() => setShowUpload(!showUpload)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>📤 Upload <span className="sto-kbd" style={{ marginLeft: 4 }}>U</span></button>
                    <button onClick={resetAll} style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
                </div>
                <div style={{ padding: '4px 12px', fontSize: 10, color: theme.textDim, borderTop: `1px solid ${theme.border}` }}>{mockFiles.length} files · {totalSize}</div>
            </div>

            {/* CENTER */}
            <div className="sto-center">
                <div className="sto-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <button onClick={() => setShowUpload(!showUpload)} style={{ padding: '7px 12px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>📤</button>
                </div>

                {showUpload && <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); setShowUpload(false); }} style={{ padding: 18, borderBottom: `1px solid ${theme.border}`, background: dragOver ? `${theme.accent}08` : theme.bgCard, textAlign: 'center' as const, flexShrink: 0 }}>
                    <div style={{ padding: 24, borderRadius: 10, border: `2px dashed ${dragOver ? theme.accent : theme.border}`, background: dragOver ? `${theme.accent}04` : 'transparent' }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>📤</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>Drop files here or click to browse</div>
                        <div style={{ fontSize: 11, color: theme.textDim, marginTop: 3 }}>Supports: Audio, Video, Photos, Documents, Evidence</div>
                        <button style={{ marginTop: 10, padding: '7px 20px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}08`, color: theme.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Browse Files</button>
                    </div>
                </div>}

                <div style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: theme.textDim, flexShrink: 0, background: theme.bg }}>
                    <span onClick={() => { setEntityF('all'); trigger(); }} style={{ cursor: 'pointer', color: theme.accent }}>🗄️ Storage</span>
                    {entityF !== 'all' && <><span>/</span><span style={{ color: theme.text, fontWeight: 600 }}>{entityF === 'persons' ? '👥 Persons' : entityF === 'orgs' ? '🏢 Organizations' : entityF.startsWith('p-') ? `🧑 ${mockPersons.find(p => p.id === parseInt(entityF.split('-')[1]))?.firstName || ''}` : entityF.startsWith('o-') ? `🏢 ${mockOrganizations.find(o => o.id === parseInt(entityF.split('-')[1]))?.name?.slice(0, 20) || ''}` : entityF}</span></>}
                    <span style={{ marginLeft: 'auto' }}><span style={{ fontWeight: 700, color: theme.accent, fontFamily: "'JetBrains Mono',monospace" }}>{filtered.length}</span> files · {totalSize}</span>
                </div>

                <div className="sto-col-head" style={{ padding: '6px 16px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', flexShrink: 0, background: theme.bg, gap: 6, cursor: 'pointer', userSelect: 'none' as const }}>
                    <span></span><span onClick={() => toggleSort('name')}>Name <SortIcon col="name" /></span><span>Entity</span><span onClick={() => toggleSort('type')}>Type <SortIcon col="type" /></span><span>Tags</span><span onClick={() => toggleSort('size')} style={{ textAlign: 'right' as const }}>Size <SortIcon col="size" /></span>
                </div>

                <div className="sto-scroll">
                    {loading && <SkeletonRows count={10} />}

                    {!loading && filtered.length === 0 && <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.2 }}>📁</div><div style={{ fontSize: 15, fontWeight: 700, color: theme.textSecondary, marginTop: 6 }}>No files found</div><button onClick={resetAll} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button></div>}

                    {!loading && filtered.map(f => { const tc = typeConfig[f.type]; const sel = selFile === f.id;
                        return <div key={f.id} className="sto-file-grid sto-row" onClick={() => setSelFile(f.id)} style={{ padding: '8px 16px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', alignItems: 'center', gap: 6, background: sel ? `${tc.color}04` : 'transparent', borderLeft: `3px solid ${sel ? tc.color : 'transparent'}` }}>
                            <div style={{ width: 26, height: 26, borderRadius: 5, background: `${tc.color}12`, border: `1px solid ${tc.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{tc.icon}</div>
                            <div style={{ minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{f.name}</div><div style={{ fontSize: 9, color: theme.textDim }}>{f.folder} · {f.uploadedAt.slice(5)}</div></div>
                            <div><a href={`/${f.entityType === 'person' ? 'persons' : 'organizations'}/${f.entityId}`} onClick={e => e.stopPropagation()} style={{ fontSize: 10, color: theme.accent, textDecoration: 'none' }}>{f.entityType === 'person' ? '🧑' : '🏢'} {f.entityName.split(' ').slice(0, 2).join(' ')}</a></div>
                            <span style={{ fontSize: 9, fontWeight: 600, color: tc.color }}>{tc.label}</span>
                            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const, overflow: 'hidden', maxHeight: 18 }}>{f.tags.slice(0, 2).map(t => <span key={t} style={{ fontSize: 8, padding: '1px 4px', borderRadius: 2, background: `${theme.border}20`, color: theme.textDim }}>{t}</span>)}{f.tags.length > 2 && <span style={{ fontSize: 8, color: theme.textDim }}>+{f.tags.length - 2}</span>}</div>
                            <div style={{ textAlign: 'right' as const, fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{f.size}</div>
                        </div>;
                    })}
                </div>
            </div>

            {/* RIGHT: Detail */}
            {file && <div className="sto-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${typeConfig[file.type].color}12`, border: `1px solid ${typeConfig[file.type].color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{typeConfig[file.type].icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{file.name}</div><div style={{ fontSize: 9, color: typeConfig[file.type].color, fontWeight: 600 }}>{typeConfig[file.type].label} · {file.mimeType}</div></div>
                        <button onClick={() => setSelFile(null)} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                </div>

                {(file.type === 'audio') && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${theme.accent}30`, background: `${theme.accent}08`, color: theme.accent, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: `${theme.border}30` }}><div style={{ width: '35%', height: '100%', borderRadius: 3, background: theme.accent }} /></div>
                    <span style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{file.duration}</span>
                </div>}
                {(file.type === 'video' || (file.type === 'camera' && file.mimeType.startsWith('video'))) && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, background: '#0a0e16' }}>
                    <div style={{ width: '100%', height: 100, borderRadius: 6, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}><div style={{ flex: 1, height: 4, borderRadius: 2, background: `${theme.border}30` }}><div style={{ width: '20%', height: '100%', borderRadius: 2, background: '#3b82f6' }} /></div><span style={{ fontSize: 9, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{file.duration}</span></div>
                </div>}
                {(file.type === 'photo' || file.type === 'camera') && file.mimeType.startsWith('image') && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, background: '#0a0e16', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', height: 100, borderRadius: 6, background: `${typeConfig[file.type].color}08`, border: `1px solid ${typeConfig[file.type].color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 11 }}>🖼️ Preview</div>
                </div>}

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                    {[{ l: 'Size', v: file.size }, { l: 'MIME', v: file.mimeType }, { l: 'Entity', v: `${file.entityType === 'person' ? '🧑' : '🏢'} ${file.entityName}` }, { l: 'Folder', v: file.folder }, { l: 'Path', v: file.path }, { l: 'Uploaded', v: `${file.uploadedAt} by ${file.uploadedBy}` }, { l: 'Source', v: file.source || '—' }, ...(file.duration ? [{ l: 'Duration', v: file.duration }] : []), ...(file.resolution ? [{ l: 'Resolution', v: file.resolution }] : []), ...(file.pages ? [{ l: 'Pages', v: `${file.pages}` }] : [])].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 10, color: theme.textDim, flexShrink: 0 }}>{r.l}</span><span style={{ fontSize: 10, color: theme.text, textAlign: 'right' as const, wordBreak: 'break-all' as const }}>{r.v}</span></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 4 }}>Tags</div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>{file.tags.map(t => <span key={t} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${theme.border}20`, color: theme.textSecondary }}>{t}</span>)}</div>
                </div>

                {file.transcription && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' as const, marginBottom: 4 }}>📝 Transcript</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5, fontStyle: 'italic' }}>"{file.transcription}"</div>
                </div>}

                <div style={{ padding: '10px 14px', display: 'flex', gap: 4, marginTop: 'auto' }}>
                    <button style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>⬇️ Download</button>
                    <a href={`/${file.entityType === 'person' ? 'persons' : 'organizations'}/${file.entityId}`} style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 11, textAlign: 'center' as const }}>🧑 Entity</a>
                </div>
            </div>}

            {/* Ctrl+Q */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="sto-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

StorageIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default StorageIndex;
