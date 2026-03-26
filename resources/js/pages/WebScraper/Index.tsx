import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockPersons } from '../../mock/persons';
import { mockOrganizations } from '../../mock/organizations';
import { mockSources, mockArticles, catConfig, statusCol, relColors, contentIcons, allCategories, allCountries, allOps, keyboardShortcuts } from '../../mock/webScraper';
import type { SourceCategory, Relevance, ViewTab, ScrapedArticle } from '../../mock/webScraper';

/* ═══ ARGUX — Web Scraper ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="ws-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }
function SkeletonRows({ count = 6 }: { count?: number }) { return <>{Array.from({ length: count }).map((_, i) => <div key={i} style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.border}06`, display: 'flex', gap: 12, alignItems: 'flex-start' }}><Skel w={32} h={32} /><div style={{ flex: 1 }}><Skel w="30%" h={10} /><div style={{ height: 5 }} /><Skel w="75%" h={14} /><div style={{ height: 5 }} /><Skel w="90%" h={10} /><div style={{ height: 5 }} /><Skel w="40%" h={10} /></div></div>)}</>; }

function WebScraperIndex() {
    const [tab, setTab] = useState<ViewTab>('articles');
    const [search, setSearch] = useState('');
    const [catF, setCatF] = useState<SourceCategory | 'all'>('all');
    const [relF, setRelF] = useState<Relevance | 'all'>('all');
    const [countryF, setCountryF] = useState('all');
    const [flaggedOnly, setFlaggedOnly] = useState(false);
    const [selArticle, setSelArticle] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newForm, setNewForm] = useState({ name: '', url: '', category: 'News Portal' as SourceCategory, schedule: 'Every 1h', cssSelector: '', urlPattern: '', keywords: '', entityType: 'person' as 'person' | 'organization', entityId: '' });
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

    const article = selArticle ? mockArticles.find(a => a.id === selArticle) : null;
    const allPersons = [...new Set(mockArticles.filter(a => a.personIds.length).flatMap(a => a.personIds.map((id, i) => ({ id, name: a.personNames[i] }))))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number; name: string }[]);

    const filtered = useMemo(() => mockArticles.filter(a => {
        if (catF !== 'all' && a.sourceCategory !== catF) return false;
        if (relF !== 'all' && a.relevance !== relF) return false;
        if (countryF !== 'all' && a.country !== countryF) return false;
        if (flaggedOnly && !a.aiFlagged) return false;
        if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.excerpt.toLowerCase().includes(search.toLowerCase()) && !a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
    }), [catF, relF, countryF, flaggedOnly, search]);

    const criticalArticles = mockArticles.filter(a => a.relevance === 'Critical');
    const stats = { sources: mockSources.length, active: mockSources.filter(s => s.status === 'Active').length, articles: mockArticles.length, critical: criticalArticles.length, flagged: mockArticles.filter(a => a.aiFlagged).length };

    const switchTab = useCallback((t: ViewTab) => { setTab(t); trigger(); }, [trigger]);
    const resetFilters = useCallback(() => { setSearch(''); setCatF('all'); setRelF('all'); setCountryF('all'); setFlaggedOnly(false); trigger(); }, [trigger]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case '1': switchTab('articles'); break; case '2': switchTab('critical'); break; case '3': switchTab('sources'); break;
                case 'n': case 'N': if (!e.ctrlKey && !e.metaKey) setShowNewModal(true); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetFilters(); break;
                case 'Escape': setSelArticle(null); setShowShortcuts(false); setShowNewModal(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [switchTab, resetFilters]);

    const renderArticle = (a: ScrapedArticle) => {
        const cc = catConfig[a.sourceCategory]; const rc = relColors[a.relevance]; const sel = selArticle === a.id;
        return <div key={a.id} className="ws-row" onClick={() => setSelArticle(a.id)} style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', background: sel ? `${cc.color}04` : a.relevance === 'Critical' ? '#ef444404' : 'transparent', borderLeft: `3px solid ${sel ? cc.color : a.relevance === 'Critical' ? '#ef4444' : 'transparent'}` }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: `${cc.color}12`, border: `1px solid ${cc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, marginTop: 2 }}>{cc.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: `${rc}12`, color: rc }}>{a.relevance}</span>
                        <span style={{ fontSize: 10, color: cc.color }}>{a.sourceName}</span>
                        <span style={{ fontSize: 9, color: theme.textDim }}>{a.language}</span>
                        <span style={{ fontSize: 10, color: theme.textDim, marginLeft: 'auto' }}>{a.timeAgo}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, lineHeight: 1.4, marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5, marginBottom: 5 }}>{a.excerpt.length > 120 ? a.excerpt.slice(0, 120) + '…' : a.excerpt}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' as const }}>
                        {a.personNames.map((n, i) => <a key={i} href={`/persons/${a.personIds[i]}`} onClick={e => e.stopPropagation()} style={{ fontSize: 9, color: theme.accent, textDecoration: 'none' }}>🧑 {n}</a>)}
                        {a.orgNames.map((n, i) => <a key={i} href={`/organizations/${a.orgIds[i]}`} onClick={e => e.stopPropagation()} style={{ fontSize: 9, color: '#8b5cf6', textDecoration: 'none' }}>🏢 {n}</a>)}
                        {a.hasMedia && <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 3, background: `${theme.border}15`, color: theme.textDim }}>📎 {a.mediaType}</span>}
                        {a.aiFlagged && <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: '#ef444412', color: '#ef4444' }}>🚩 AI</span>}
                    </div>
                </div>
            </div>
        </div>;
    };

    return (<>
        <PageMeta title="Web Scraper" />
        <div className="ws-page" data-testid="web-scraper-page">

            {/* LEFT */}
            <div className="ws-left" style={{ borderRight: `1px solid ${theme.border}`, background: theme.bg }}>
                <div style={{ padding: '14px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#22c55e10', border: '1px solid #22c55e25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🌐</div>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>WEB SCRAPER</div><div style={{ fontSize: 10, color: theme.textDim }}>OSINT Crawler</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '9px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                        <span className="ws-kbd">F</span>
                    </div>
                </div>

                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 4 }}>
                    {[{ n: stats.sources, l: 'Srcs', c: theme.accent }, { n: stats.active, l: 'Live', c: '#22c55e' }, { n: stats.articles, l: 'Articles', c: '#3b82f6' }, { n: stats.critical, l: 'Crit', c: '#ef4444' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '4px 0' }}><div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 8, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Category</div>
                    <button onClick={() => { setCatF('all'); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: catF === 'all' ? `${theme.accent}08` : 'transparent', color: catF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, borderLeft: `2px solid ${catF === 'all' ? theme.accent : 'transparent'}`, textAlign: 'left' as const, fontWeight: catF === 'all' ? 700 : 500, marginBottom: 1 }}>All Categories</button>
                    {allCategories.map(c => { const cc = catConfig[c]; const cnt = mockArticles.filter(a => a.sourceCategory === c).length; if (cnt === 0 && mockSources.filter(s => s.category === c).length === 0) return null; return <button key={c} onClick={() => { setCatF(c); trigger(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '5px 10px', border: 'none', borderRadius: 4, background: catF === c ? `${cc.color}08` : 'transparent', color: catF === c ? cc.color : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, borderLeft: `2px solid ${catF === c ? cc.color : 'transparent'}`, textAlign: 'left' as const, fontWeight: catF === c ? 600 : 400, marginBottom: 1 }}><span style={{ fontSize: 13 }}>{cc.icon}</span><span style={{ flex: 1 }}>{c}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{cnt}</span></button>; })}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Relevance</div><div style={{ display: 'flex', gap: 3 }}>
                        {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map(r => <button key={r} onClick={() => { setRelF(r as any); trigger(); }} style={{ flex: 1, padding: '4px', borderRadius: 4, border: `1px solid ${relF === r ? (r === 'all' ? theme.accent : relColors[r as Relevance]) + '40' : theme.border}`, background: relF === r ? `${r === 'all' ? theme.accent : relColors[r as Relevance]}08` : 'transparent', color: relF === r ? (r === 'all' ? theme.accent : relColors[r as Relevance]) : theme.textDim, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{r === 'all' ? 'All' : r.slice(0, 4)}</button>)}
                    </div></div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, marginBottom: 5 }}>Country</div><select value={countryF} onChange={e => { setCountryF(e.target.value); trigger(); }} style={{ width: '100%', padding: '7px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Countries</option>{allCountries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: flaggedOnly ? '#ef4444' : theme.textDim, cursor: 'pointer' }}><input type="checkbox" checked={flaggedOnly} onChange={e => setFlaggedOnly(e.target.checked)} style={{ accentColor: '#ef4444' }} />🚩 AI Flagged only</label>
                </div>

                <div style={{ padding: '10px 14px' }}>
                    <button onClick={resetFilters} style={{ width: '100%', padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset <span className="ws-kbd" style={{ marginLeft: 4 }}>R</span></button>
                </div>
            </div>

            {/* CENTER */}
            <div className="ws-center">
                <div className="ws-mobile-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px', flex: 1, minWidth: 140 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                    <button onClick={() => setShowNewModal(true)} style={{ padding: '7px 12px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>+ New</button>
                </div>

                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
                    {[{ id: 'articles' as ViewTab, l: 'All Articles', icon: '📰', n: filtered.length }, { id: 'critical' as ViewTab, l: 'Critical Intel', icon: '🔴', n: criticalArticles.length }, { id: 'sources' as ViewTab, l: 'Sources', icon: '⚙️', n: mockSources.length }].map((t, idx) => <button key={t.id} onClick={() => switchTab(t.id)} style={{ padding: '10px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#22c55e' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' as const }}>
                        <span>{t.icon}</span><span className="ws-tab-label">{t.l}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: `${tab === t.id ? '#22c55e' : theme.border}20`, color: tab === t.id ? '#22c55e' : theme.textDim }}>{t.n}</span>
                        <span className="ws-kbd" style={{ marginLeft: 2 }}>{idx + 1}</span>
                    </button>)}
                    <div style={{ flex: 1 }} />
                    <button onClick={() => setShowNewModal(true)} style={{ margin: '6px 12px', padding: '5px 14px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>+ New Scraper <span className="ws-kbd" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>N</span></button>
                </div>

                <div className="ws-scroll">
                    {loading && <SkeletonRows count={8} />}

                    {!loading && (tab === 'articles' || tab === 'critical') && <>
                        {(tab === 'critical' ? criticalArticles : filtered).length === 0 && <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.2 }}>🌐</div><div style={{ fontSize: 15, fontWeight: 700, color: theme.textSecondary, marginTop: 6 }}>No articles match</div><button onClick={resetFilters} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 6, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button></div>}
                        {(tab === 'critical' ? criticalArticles : filtered).map(renderArticle)}
                    </>}

                    {!loading && tab === 'sources' && <div className="ws-source-grid" style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                        {mockSources.map(s => { const cc = catConfig[s.category]; const sc = statusCol[s.status];
                            return <div key={s.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${sc}20`, background: `${sc}03` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 6, background: `${cc.color}12`, border: `1px solid ${cc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{cc.icon}</div>
                                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{s.name}</div><div style={{ fontSize: 10, color: theme.textDim }}>{s.countryFlag} {s.country} · {s.language}</div></div>
                                    <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 10, fontWeight: 700, color: sc }}>{s.status}</div><div style={{ fontSize: 9, color: theme.textDim }}>{s.health > 0 ? `${s.health}%` : '—'}</div></div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 11, color: theme.textDim }}>
                                    <span>📝 {s.articleCount.toLocaleString()}</span>
                                    {s.newArticles > 0 && <span style={{ color: '#22c55e', fontWeight: 700 }}>+{s.newArticles} new</span>}
                                    <span>⏱️ {s.schedule}</span>
                                </div>
                                {s.keywords.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginBottom: 5 }}>
                                    {s.keywords.slice(0, 4).map(k => <span key={k} style={{ fontSize: 8, padding: '2px 5px', borderRadius: 3, background: `${theme.border}20`, color: theme.textDim }}>{k}</span>)}
                                </div>}
                                <div style={{ fontSize: 10, color: theme.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{s.url}</div>
                            </div>;
                        })}
                    </div>}
                </div>
            </div>

            {/* RIGHT: Detail */}
            {article && (tab === 'articles' || tab === 'critical') && <div className="ws-right" style={{ borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 5, background: `${catConfig[article.sourceCategory].color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{catConfig[article.sourceCategory].icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: catConfig[article.sourceCategory].color, fontWeight: 600 }}>{article.sourceName}</div><div style={{ fontSize: 9, color: theme.textDim }}>{article.sourceCategory}</div></div>
                        <button onClick={() => setSelArticle(null)} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, lineHeight: 1.4 }}>{article.title}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${relColors[article.relevance]}12`, color: relColors[article.relevance] }}>{article.relevance}</span>
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${theme.border}15`, color: theme.textDim }}>{contentIcons[article.contentType]} {article.contentType.replace('_', ' ')}</span>
                    </div>
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>{article.excerpt}</div>

                {article.aiFlagged && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, background: '#ef444406' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>🚩 AI Assessment</div>
                    <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>{article.aiReason}</div>
                </div>}

                {(article.personNames.length > 0 || article.orgNames.length > 0) && <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, marginBottom: 5 }}>Tagged Entities</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                        {article.personIds.map((id, i) => <a key={id} href={`/persons/${id}`} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: `${theme.accent}08`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>🧑 {article.personNames[i]}</a>)}
                        {article.orgIds.map((id, i) => <a key={id} href={`/organizations/${id}`} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: '#8b5cf608', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>🏢 {article.orgNames[i]}</a>)}
                    </div>
                </div>}

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                    {[{ l: 'Source', v: article.sourceName }, { l: 'Country', v: article.country }, { l: 'Language', v: article.language }, { l: 'Published', v: article.publishedAt }, { l: 'Scraped', v: article.scrapedAt }, ...(article.hasMedia ? [{ l: 'Media', v: `📎 ${article.mediaType}` }] : [])].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 10, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 10, color: theme.text }}>{r.v}</span></div>)}
                </div>

                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>{article.tags.map(t => <span key={t} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: t === 'CRITICAL' ? '#ef444415' : t.includes('HAWK') || t.includes('GLACIER') ? `${theme.accent}10` : `${theme.border}20`, color: t === 'CRITICAL' ? '#ef4444' : t.includes('HAWK') || t.includes('GLACIER') ? theme.accent : theme.textSecondary, fontWeight: t === 'CRITICAL' ? 800 : 400 }}>{t}</span>)}</div>
                </div>

                <div style={{ padding: '10px 14px', display: 'flex', gap: 4, marginTop: 'auto' }}>
                    <a href="/activity" style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, textDecoration: 'none', fontSize: 11, fontWeight: 700, textAlign: 'center' as const }}>📊 Log</a>
                    <a href="/operations" style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 11, textAlign: 'center' as const }}>🎯 Ops</a>
                </div>
            </div>}

            {/* ═══ NEW SCRAPER MODAL ═══ */}
            {showNewModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
                <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>🌐 New Web Scraper</div>
                        <button onClick={() => setShowNewModal(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Source Name *</div><input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Reuters Middle East" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Source URL *</div><input value={newForm.url} onChange={e => setNewForm(f => ({ ...f, url: e.target.value }))} placeholder="https://example.com/news" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Category *</div><select value={newForm.category} onChange={e => setNewForm(f => ({ ...f, category: e.target.value as SourceCategory }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{allCategories.map(c => <option key={c} value={c}>{catConfig[c].icon} {c}</option>)}</select></div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Schedule</div><select value={newForm.schedule} onChange={e => setNewForm(f => ({ ...f, schedule: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>{['Every 5min', 'Every 10min', 'Every 15min', 'Every 30min', 'Every 1h', 'Every 2h', 'Every 4h', 'Every 6h', 'Daily'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>CSS Selector</div><input value={newForm.cssSelector} onChange={e => setNewForm(f => ({ ...f, cssSelector: e.target.value }))} placeholder="div.article-body" style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: "'JetBrains Mono',monospace", outline: 'none' }} /></div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>URL Pattern</div><input value={newForm.urlPattern} onChange={e => setNewForm(f => ({ ...f, urlPattern: e.target.value }))} placeholder="/news/*" style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 12, fontFamily: "'JetBrains Mono',monospace", outline: 'none' }} /></div>
                    </div>

                    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>Keywords (comma-separated)</div><input value={newForm.keywords} onChange={e => setNewForm(f => ({ ...f, keywords: e.target.value }))} placeholder="arms deal, sanctions, delivery" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>

                    <div style={{ padding: '14px', borderRadius: 10, border: `1px solid ${theme.accent}20`, background: `${theme.accent}04`, marginBottom: 18 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>🎯 Target Entity (optional)</div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                            {([{ id: 'person', l: '🧑 Person' }, { id: 'organization', l: '🏢 Organization' }] as const).map(t => <button key={t.id} onClick={() => setNewForm(f => ({ ...f, entityType: t.id, entityId: '' }))} style={{ flex: 1, padding: '7px', borderRadius: 5, border: `1px solid ${newForm.entityType === t.id ? theme.accent + '40' : theme.border}`, background: newForm.entityType === t.id ? `${theme.accent}08` : 'transparent', color: newForm.entityType === t.id ? theme.accent : theme.textDim, fontSize: 12, fontWeight: newForm.entityType === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{t.l}</button>)}
                        </div>
                        <select value={newForm.entityId} onChange={e => setNewForm(f => ({ ...f, entityId: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
                            <option value="">— No target entity —</option>
                            {newForm.entityType === 'person' ? mockPersons.slice(0, 15).map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.risk})</option>) : mockOrganizations.slice(0, 10).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                        {newForm.entityId && <div style={{ marginTop: 8, fontSize: 11, color: theme.textSecondary }}>Articles matching this entity will be automatically tagged and flagged by the AI relevance engine.</div>}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowNewModal(false)} style={{ flex: 1, padding: '11px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={() => { setShowNewModal(false); trigger(); }} disabled={!newForm.name || !newForm.url} style={{ flex: 2, padding: '11px', borderRadius: 6, border: 'none', background: newForm.name && newForm.url ? '#22c55e' : `${theme.border}30`, color: newForm.name && newForm.url ? '#fff' : theme.textDim, fontSize: 13, fontWeight: 800, cursor: newForm.name && newForm.url ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>🌐 Create Web Scraper</button>
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
                    {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="ws-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                    <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
                </div>
            </div>}
        </div>
    </>);
}

WebScraperIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default WebScraperIndex;
