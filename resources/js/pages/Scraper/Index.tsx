import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockPersons } from '../../mock/persons';
import { mockOrganizations } from '../../mock/organizations';
import { mockScrapers as FALLBACK_SCRAPERS, mockPosts as FALLBACK_POSTS, platformConfig, statusColors, sentimentColors, contentIcons, allPlatforms, allPersonsInScrapers, allOrgsInScrapers, keyboardShortcuts } from '../../mock/scraper';
import type { Platform, Sentiment, ContentType, ViewTab } from '../../mock/scraper';

function getCsrf(): string { return decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''); }
async function apiCall(url: string, method = 'GET', body?: any): Promise<any> {
    try {
        const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': getCsrf() } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        return { ok: res.ok, status: res.status, data: await res.json() };
    } catch { return { ok: false, status: 0, data: {} }; }
}

/* ═══ ARGUX — Social Media Scraper ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="sc-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }
function SkeletonRows({ count = 6 }: { count?: number }) { return <>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'flex-start' }}><Skel w={34} h={34} /><div style={{ flex: 1 }}><Skel w="40%" h={12} /><div style={{ height: 6 }} /><Skel w="85%" h={12} /><div style={{ height: 5 }} /><Skel w="60%" h={10} /></div></div>)}</>; }

function ScraperIndex() {
    const [tab, setTab] = useState<ViewTab>('feed');
    const [search, setSearch] = useState('');
    const [platformF, setPlatformF] = useState<Platform | 'all'>('all');
    const [personF, setPersonF] = useState<number | 'all'>('all');
    const [orgF, setOrgF] = useState<number | 'all'>('all');
    const [sentimentF, setSentimentF] = useState<Sentiment | 'all'>('all');
    const [selPost, setSelPost] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newForm, setNewForm] = useState({ platform: 'Facebook' as Platform, profileUrl: '', profileHandle: '', interval: 'Every 15min', keywords: '', entityType: 'person' as 'person' | 'organization', entityId: '', operationCode: '' });
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    // Data state — API-driven with fallback
    const [mockScrapers, setMockScrapers] = useState(FALLBACK_SCRAPERS);
    const [mockPosts, setMockPosts] = useState(FALLBACK_POSTS);

    useEffect(() => {
        const load = async () => {
            trigger();
            const [scRes, poRes] = await Promise.all([
                apiCall('/mock-api/scraper/scrapers'),
                apiCall('/mock-api/scraper/posts'),
            ]);
            if (scRes.ok && scRes.data.data) setMockScrapers(scRes.data.data);
            if (poRes.ok && poRes.data.data) setMockPosts(poRes.data.data);
            setLoading(false);
        };
        load();
    }, []);

    const post = selPost ? mockPosts.find(p => p.id === selPost) : null;
    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

    const filtered = useMemo(() => mockPosts.filter(p => {
        if (platformF !== 'all' && p.platform !== platformF) return false;
        if (personF !== 'all' && p.personId !== personF) return false;
        if (orgF !== 'all' && p.orgId !== orgF) return false;
        if (sentimentF !== 'all' && p.sentiment !== sentimentF) return false;
        if (search && !p.content.toLowerCase().includes(search.toLowerCase()) && !p.personName.toLowerCase().includes(search.toLowerCase()) && !p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
    }), [platformF, personF, orgF, sentimentF, search]);

    const flaggedPosts = mockPosts.filter(p => p.aiFlagged);
    const stats = { scrapers: mockScrapers.length, active: mockScrapers.filter(s => s.status === 'Active').length, posts: mockPosts.length, flagged: flaggedPosts.length, totalCollected: mockScrapers.reduce((s, sc) => s + sc.totalPosts, 0) };
    const allOps = [...new Set(mockScrapers.map(s => s.operationCode).filter(Boolean))];

    const switchTab = useCallback((t: ViewTab) => { setTab(t); trigger(); }, [trigger]);
    const resetFilters = useCallback(() => { setSearch(''); setPlatformF('all'); setPersonF('all'); setOrgF('all'); setSentimentF('all'); trigger(); }, [trigger]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case '1': switchTab('feed'); break; case '2': switchTab('flagged'); break; case '3': switchTab('scrapers'); break;
                case 'n': case 'N': if (!e.ctrlKey && !e.metaKey) setShowNewModal(true); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 'Escape': setSelPost(null); setShowShortcuts(false); setShowNewModal(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [switchTab, resetFilters]);

    const renderPost = (p: typeof mockPosts[0]) => {
        const pc = platformConfig[p.platform]; const sel = selPost === p.id;
        return <div key={p.id} className="sc-row" onClick={() => setSelPost(p.id)} style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', background: sel ? `${pc.color}06` : p.aiFlagged ? '#ef444404' : 'transparent', borderLeft: `3px solid ${sel ? pc.color : p.aiFlagged ? '#ef4444' : 'transparent'}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 7, background: `${pc.color}15`, border: `1px solid ${pc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{pc.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{p.personName || p.orgName}</span>
                        <span style={{ fontSize: 10, color: theme.textDim }}>{p.profileHandle}</span>
                        <span style={{ fontSize: 10, color: pc.color, fontWeight: 600 }}>{pc.label}</span>
                        <span style={{ fontSize: 10, color: theme.textDim, marginLeft: 'auto' }}>{p.timeAgo}</span>
                    </div>
                    <div style={{ fontSize: 12, color: theme.text, lineHeight: 1.6, marginBottom: 6 }}>{p.content}</div>
                    {p.hasMedia && <div style={{ width: '100%', height: 54, borderRadius: 5, background: `${theme.border}08`, border: `1px solid ${theme.border}`, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 10 }}>{contentIcons[p.contentType]} {p.contentType} attachment</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
                        <div style={{ display: 'flex', gap: 6, fontSize: 9, color: theme.textDim }}>
                            {p.likes > 0 && <span>❤️ {fmt(p.likes)}</span>}{p.shares > 0 && <span>🔄 {fmt(p.shares)}</span>}{p.comments > 0 && <span>💬 {p.comments}</span>}{p.views > 0 && <span>👁️ {fmt(p.views)}</span>}
                        </div>
                        {p.aiFlagged && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#ef444412', color: '#ef4444' }}>🚩 AI</span>}
                        <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, background: `${sentimentColors[p.sentiment]}10`, color: sentimentColors[p.sentiment] }}>{p.sentiment}</span>
                        <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, background: `${theme.border}15`, color: theme.textDim }}>{contentIcons[p.contentType]} {p.contentType}</span>
                    </div>
                </div>
            </div>
        </div>;
    };

    return (<>
        <PageMeta title="Social Scraper" />
        <div className="sc-page" data-testid="scraper-page">

            {/* LEFT */}
            <div className="sc-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#06b6d410', border: '1px solid #06b6d425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📱</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>SCRAPER</div><div style={{ fontSize: 10, color: theme.textDim }}>Social Media OSINT</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="sc-kbd">F</span>
                    </div>
                </div>

                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ n: stats.scrapers, l: 'Scrap', c: theme.accent }, { n: stats.active, l: 'Live', c: '#22c55e' }, { n: stats.posts, l: 'Posts', c: '#3b82f6' }, { n: stats.flagged, l: 'Flag', c: '#ef4444' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}><div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Platform</div>
                    <button onClick={() => { setPlatformF('all'); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: platformF === 'all' ? `${theme.accent}08` : 'transparent', color: platformF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, borderLeft: `2px solid ${platformF === 'all' ? theme.accent : 'transparent'}`, textAlign: 'left' as const, fontWeight: platformF === 'all' ? 700 : 500, marginBottom: 1 }}>All Platforms</button>
                    {allPlatforms.map(p => { const pc = platformConfig[p]; const c = mockPosts.filter(pp => pp.platform === p).length; const sc = mockScrapers.filter(s => s.platform === p).length; if (sc === 0) return null; return <button key={p} onClick={() => { setPlatformF(p); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: platformF === p ? `${pc.color}12` : 'transparent', color: platformF === p ? theme.text : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, borderLeft: `2px solid ${platformF === p ? pc.color : 'transparent'}`, textAlign: 'left' as const, fontWeight: platformF === p ? 600 : 400, marginBottom: 1 }}><span style={{ fontSize: 13 }}>{pc.icon}</span><span style={{ flex: 1 }}>{pc.label}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Person</div><select value={personF === 'all' ? 'all' : String(personF)} onChange={e => { setPersonF(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Persons</option>{allPersonsInScrapers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Organization</div><select value={orgF === 'all' ? 'all' : String(orgF)} onChange={e => { setOrgF(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Organizations</option>{allOrgsInScrapers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Sentiment</div><div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        {(['all', 'flagged', 'negative', 'neutral', 'positive'] as const).map(s => <button key={s} onClick={() => { setSentimentF(s as any); trigger(); }} style={{ padding: '4px 7px', borderRadius: 4, border: `1px solid ${sentimentF === s ? (s === 'all' ? theme.accent : sentimentColors[s as Sentiment]) + '40' : theme.border}`, background: sentimentF === s ? `${s === 'all' ? theme.accent : sentimentColors[s as Sentiment]}08` : 'transparent', color: sentimentF === s ? (s === 'all' ? theme.accent : sentimentColors[s as Sentiment]) : theme.textDim, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{s === 'flagged' ? '🚩 ' : ''}{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
                    </div></div>
                </div>

                <div style={{ padding: '10px 14px' }}>
                    <button onClick={resetFilters} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset <span className="sc-kbd" style={{ marginLeft: 4 }}>R</span></button>
                </div>
            </div>

            {/* CENTER */}
            <div className="sc-center">
                <div className="sc-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <button onClick={() => setShowNewModal(true)} style={{ padding: '7px 12px', borderRadius: 6, border: 'none', background: '#06b6d4', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>+ New</button>
                </div>

                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
                    {[{ id: 'feed' as ViewTab, l: 'Content Feed', icon: '📋', n: filtered.length }, { id: 'flagged' as ViewTab, l: 'AI Flagged', icon: '🚩', n: flaggedPosts.length }, { id: 'scrapers' as ViewTab, l: 'Scrapers', icon: '⚙️', n: mockScrapers.length }].map((t, idx) => <button key={t.id} onClick={() => switchTab(t.id)} style={{ padding: '10px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#06b6d4' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' as const }}>
                        <span>{t.icon}</span><span className="sc-tab-label">{t.l}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: `${tab === t.id ? '#06b6d4' : theme.border}20`, color: tab === t.id ? '#06b6d4' : theme.textDim }}>{t.n}</span>
                        <span className="sc-kbd" style={{ marginLeft: 2 }}>{idx + 1}</span>
                    </button>)}
                    <div style={{ flex: 1 }} />
                    <button onClick={() => setShowNewModal(true)} style={{ margin: '6px 12px', padding: '5px 14px', borderRadius: 6, border: 'none', background: '#06b6d4', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>+ New Scraper <span className="sc-kbd" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>N</span></button>
                </div>

                <div className="sc-scroll">
                    {loading && <SkeletonRows count={8} />}

                    {!loading && (tab === 'feed' || tab === 'flagged') && <>
                        {(tab === 'flagged' ? flaggedPosts : filtered).length === 0 && <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.2 }}>📱</div><div style={{ fontSize: 15, fontWeight: 700, color: theme.textSecondary, marginTop: 6 }}>No posts match</div><button onClick={resetFilters} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button></div>}
                        {(tab === 'flagged' ? flaggedPosts : filtered).map(renderPost)}
                    </>}

                    {!loading && tab === 'scrapers' && <div style={{ padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{mockScrapers.length} Scrapers · {fmt(stats.totalCollected)} collected</div>
                        </div>
                        <div className="sc-scraper-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                            {mockScrapers.map(s => { const pc = platformConfig[s.platform]; const sc = statusColors[s.status];
                                return <div key={s.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${sc}20`, background: `${sc}03` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 7, background: `${pc.color}15`, border: `1px solid ${pc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{pc.icon}</div>
                                        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{s.profileHandle}</div><div style={{ fontSize: 10, color: theme.textDim }}>{pc.label} · {s.personName || s.orgName}</div></div>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: sc, padding: '3px 7px', borderRadius: 4, background: `${sc}12` }}>{s.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 11, color: theme.textDim }}>
                                        <span>📝 {s.totalPosts}</span>{s.newPosts > 0 && <span style={{ color: '#22c55e', fontWeight: 700 }}>+{s.newPosts}</span>}<span>⏱️ {s.interval}</span>
                                    </div>
                                    {s.keywords.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginBottom: 6 }}>{s.keywords.slice(0, 4).map(k => <span key={k} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${theme.border}20`, color: theme.textDim }}>{k}</span>)}</div>}
                                    <div style={{ display: 'flex', gap: 4, fontSize: 10 }}>
                                        {s.personId && <a href={`/persons/${s.personId}`} onClick={e => e.stopPropagation()} style={{ color: theme.accent, textDecoration: 'none' }}>🧑 {s.personName.split(' ')[0]}</a>}
                                        {s.orgId && <a href={`/organizations/${s.orgId}`} onClick={e => e.stopPropagation()} style={{ color: '#8b5cf6', textDecoration: 'none' }}>🏢 {s.orgName.split(' ').slice(0, 2).join(' ')}</a>}
                                        {s.operationCode && <span style={{ color: theme.accent }}>{s.operationCode}</span>}
                                        <span style={{ color: theme.textDim, marginLeft: 'auto' }}>{s.lastRun.slice(5)}</span>
                                    </div>
                                </div>;
                            })}
                        </div>
                    </div>}
                </div>
            </div>

            {/* RIGHT: Detail */}
            {post && (tab === 'feed' || tab === 'flagged') && <div className="sc-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 6, background: `${platformConfig[post.platform].color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{platformConfig[post.platform].icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{post.personName || post.orgName}</div><div style={{ fontSize: 10, color: theme.textDim }}>{post.profileHandle} · {platformConfig[post.platform].label}</div></div>
                        <button onClick={() => setSelPost(null)} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                </div>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 12, color: theme.text, lineHeight: 1.7 }}>{post.content}</div>
                {post.aiFlagged && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, background: '#ef444406' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>🚩 AI Intelligence Flag</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>{post.aiReason}</div>
                </div>}
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 8 }}>
                    {[{ n: post.likes, l: '❤️' }, { n: post.shares, l: '🔄' }, { n: post.comments, l: '💬' }, { n: post.views, l: '👁️' }].filter(s => s.n > 0).map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const }}><div style={{ fontSize: 14, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(s.n)}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                    {[{ l: 'Platform', v: platformConfig[post.platform].label }, { l: 'Type', v: `${contentIcons[post.contentType]} ${post.contentType}` }, { l: 'Sentiment', v: post.sentiment }, { l: 'Time', v: post.timestamp }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 10, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 10, color: r.l === 'Sentiment' ? sentimentColors[post.sentiment] : theme.text, fontWeight: r.l === 'Sentiment' ? 700 : 400 }}>{r.v}</span></div>)}
                </div>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>{post.tags.map(t => <span key={t} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: t === 'CRITICAL' ? '#ef444415' : t.includes('flag') || t.includes('cross-ref') ? '#f59e0b10' : `${theme.border}20`, color: t === 'CRITICAL' ? '#ef4444' : t.includes('flag') || t.includes('cross-ref') ? '#f59e0b' : theme.textSecondary, fontWeight: t === 'CRITICAL' ? 800 : 400 }}>{t}</span>)}</div>
                </div>
                <div style={{ padding: '10px 14px', display: 'flex', gap: 4, marginTop: 'auto' }}>
                    {post.personId && <a href={`/persons/${post.personId}`} style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, textDecoration: 'none', fontSize: 11, fontWeight: 700, textAlign: 'center' as const }}>🧑 Profile</a>}
                    {post.orgId && <a href={`/organizations/${post.orgId}`} style={{ flex: 1, padding: '7px', borderRadius: 5, border: '1px solid #8b5cf630', background: '#8b5cf606', color: '#8b5cf6', textDecoration: 'none', fontSize: 11, fontWeight: 700, textAlign: 'center' as const }}>🏢 Org</a>}
                </div>
            </div>}

            {/* ═══ NEW SCRAPER MODAL ═══ */}
            {showNewModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>📱 New Social Scraper</div>
                        <button onClick={() => setShowNewModal(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Platform *</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                        {allPlatforms.map(p => { const pc = platformConfig[p]; const on = newForm.platform === p; return <button key={p} onClick={() => setNewForm(f => ({ ...f, platform: p }))} style={{ padding: '8px 4px', borderRadius: 6, border: `1px solid ${on ? pc.color + '40' : theme.border}`, background: on ? `${pc.color}10` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const }}><div style={{ fontSize: 18 }}>{pc.icon}</div><div style={{ fontSize: 8, fontWeight: on ? 700 : 500, color: on ? theme.text : theme.textDim, marginTop: 2 }}>{pc.label.split(' ')[0]}</div></button>; })}
                    </div></div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Profile URL *</div><input value={newForm.profileUrl} onChange={e => setNewForm(f => ({ ...f, profileUrl: e.target.value }))} placeholder="https://x.com/username" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Handle</div><input value={newForm.profileHandle} onChange={e => setNewForm(f => ({ ...f, profileHandle: e.target.value }))} placeholder="@username" style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Interval</div><select value={newForm.interval} onChange={e => setNewForm(f => ({ ...f, interval: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{['Every 5min', 'Every 15min', 'Every 30min', 'Every 1h', 'Every 2h', 'Every 4h'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    </div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Keywords (comma-separated)</div><input value={newForm.keywords} onChange={e => setNewForm(f => ({ ...f, keywords: e.target.value }))} placeholder="delivery, port, urgent" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>

                    <div style={{ padding: 14, borderRadius: 10, border: `1px solid #06b6d420`, background: '#06b6d404', marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>🎯 Target Entity</div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                            {([{ id: 'person', l: '🧑 Person' }, { id: 'organization', l: '🏢 Organization' }] as const).map(t => <button key={t.id} onClick={() => setNewForm(f => ({ ...f, entityType: t.id, entityId: '' }))} style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${newForm.entityType === t.id ? '#06b6d440' : theme.border}`, background: newForm.entityType === t.id ? '#06b6d408' : 'transparent', color: newForm.entityType === t.id ? '#06b6d4' : theme.textDim, fontSize: 12, fontWeight: newForm.entityType === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{t.l}</button>)}
                        </div>
                        <select value={newForm.entityId} onChange={e => setNewForm(f => ({ ...f, entityId: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
                            <option value="">— Select {newForm.entityType} —</option>
                            {newForm.entityType === 'person' ? mockPersons.slice(0, 15).map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.risk})</option>) : mockOrganizations.slice(0, 10).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                        {newForm.entityId && <div style={{ marginTop: 8, fontSize: 11, color: theme.textSecondary }}>Posts from this profile will be automatically tagged to the selected {newForm.entityType} and analyzed by AI sentiment engine.</div>}
                    </div>

                    <div style={{ marginBottom: 18 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Operation</div><select value={newForm.operationCode} onChange={e => setNewForm(f => ({ ...f, operationCode: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}><option value="">— No operation —</option>{allOps.map(o => <option key={o} value={o}>OP {o}</option>)}</select></div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowNewModal(false)} style={{ flex: 1, padding: '11px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={() => { setShowNewModal(false); trigger(); }} disabled={!newForm.profileUrl} style={{ flex: 2, padding: '11px', borderRadius: 6, border: 'none', background: newForm.profileUrl ? '#06b6d4' : `${theme.border}30`, color: newForm.profileUrl ? '#fff' : theme.textDim, fontSize: 13, fontWeight: 800, cursor: newForm.profileUrl ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>📱 Create Scraper</button>
                    </div>
                </div>
            </div>}

            {/* Ctrl+Q */}
            {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div>
                        <button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="sc-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

ScraperIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default ScraperIndex;
