import PageMeta from '../../components/layout/PageMeta';
import AdminLayout from '../../layouts/AdminLayout';
import { useState, useEffect, useMemo, useRef } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { categories, articles, keyboardShortcuts } from '../../mock/admin-kb';

/* ═══ ARGUX — Knowledge Base ═══ */

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="kb-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }

export default function AdminKnowledgeBase() {
    const [search, setSearch] = useState('');
    const [catF, setCatF] = useState<string | null>(null);
    const [selArticle, setSelArticle] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { trigger } = useTopLoader();

    useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

    const filtered = useMemo(() => {
        let arts = articles;
        if (catF) arts = arts.filter(a => a.categoryId === catF);
        if (search) { const q = search.toLowerCase(); arts = arts.filter(a => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q)) || a.content.toLowerCase().includes(q)); }
        return arts;
    }, [catF, search]);

    const article = selArticle ? articles.find(a => a.id === selArticle) : null;
    const articleCat = article ? categories.find(c => c.id === article.categoryId) : null;
    const relatedArticles = article ? article.relatedIds.map(id => articles.find(a => a.id === id)).filter(Boolean) : [];

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'Escape': if (selArticle) setSelArticle(null); else setShowShortcuts(false); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [selArticle]);

    // ═══ ARTICLE DETAIL VIEW ═══
    if (article && articleCat) return (<><PageMeta title={`KB — ${article.title}`} /><div data-testid="admin-kb-page">
        {/* Back bar */}
        <button onClick={() => setSelArticle(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="8" x2="4" y2="8"/><polyline points="7,4 3,8 7,12"/></svg>Back to Knowledge Base
        </button>

        <div className="kb-article-detail">
            {/* Content */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: `${articleCat.color}12`, color: articleCat.color, border: `1px solid ${articleCat.color}25` }}>{articleCat.icon} {articleCat.name}</span>
                    <span style={{ fontSize: 10, color: theme.textDim }}>{article.readTime} read</span>
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 10px', lineHeight: 1.3 }}>{article.title}</h1>
                <p style={{ fontSize: 13, color: theme.textSecondary, margin: '0 0 20px', lineHeight: 1.6 }}>{article.summary}</p>
                <div style={{ padding: '20px 24px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.bgCard }}>
                    {article.content.split('\n\n').map((para, i) => <p key={i} style={{ fontSize: 14, color: theme.text, lineHeight: 1.8, margin: i === 0 ? 0 : '16px 0 0', whiteSpace: 'pre-wrap' as const }}>{para}</p>)}
                </div>
                {/* Tags */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginTop: 16 }}>
                    {article.tags.map(t => <span key={t} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 4, background: `${theme.border}15`, color: theme.textSecondary }}>{t}</span>)}
                </div>
            </div>

            {/* Sidebar */}
            <div>
                {/* Meta */}
                <div style={{ borderRadius: 10, border: `1px solid ${theme.border}`, padding: 16, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Article Info</div>
                    {[{ l: 'Author', v: article.author }, { l: 'Updated', v: article.updatedAt }, { l: 'Views', v: article.views.toLocaleString() }, { l: 'Read time', v: article.readTime }, { l: 'Helpful', v: `${article.helpful}/${article.helpfulTotal} (${Math.round(article.helpful / article.helpfulTotal * 100)}%)` }].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${theme.border}06` }}><span style={{ fontSize: 11, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 11, color: theme.text, fontWeight: 600 }}>{r.v}</span></div>)}
                </div>

                {/* Helpful bar */}
                <div style={{ borderRadius: 10, border: `1px solid ${theme.border}`, padding: 16, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 8 }}>Was this helpful?</div>
                    <div style={{ height: 6, borderRadius: 3, background: `${theme.border}20`, overflow: 'hidden', marginBottom: 8 }}>
                        <div style={{ width: `${article.helpful / article.helpfulTotal * 100}%`, height: '100%', background: '#22c55e', borderRadius: 3 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ flex: 1, padding: '8px', borderRadius: 6, border: `1px solid #22c55e30`, background: '#22c55e08', color: '#22c55e', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>👍 Yes</button>
                        <button style={{ flex: 1, padding: '8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>👎 No</button>
                    </div>
                </div>

                {/* Related */}
                {relatedArticles.length > 0 && <div style={{ borderRadius: 10, border: `1px solid ${theme.border}`, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Related Articles</div>
                    {relatedArticles.map(ra => { if (!ra) return null; const rc = categories.find(c => c.id === ra.categoryId);
                        return <div key={ra.id} onClick={() => { setSelArticle(ra.id); window.scrollTo(0, 0); }} style={{ padding: '8px 10px', borderRadius: 6, border: `1px solid ${theme.border}`, marginBottom: 6, cursor: 'pointer', transition: 'border-color 0.15s' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: theme.text, marginBottom: 2 }}>{ra.title}</div>
                            <div style={{ fontSize: 9, color: rc?.color || theme.textDim }}>{rc?.icon} {rc?.name} · {ra.readTime}</div>
                        </div>;
                    })}
                </div>}
            </div>
        </div>
    </div></>);

    // ═══ LIST VIEW ═══
    return (<><PageMeta title="Knowledge Base" /><div data-testid="admin-kb-page">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📚</div>
                <div><h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Knowledge Base</h1><p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{articles.length} articles across {categories.length} categories</p></div>
            </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 8, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 14px' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles, topics, tags..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '11px 0', color: theme.text, fontSize: 14, fontFamily: 'inherit', minWidth: 0 }} />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', fontSize: 12, padding: 4 }}>✕</button>}
                <span className="kb-kbd">F</span>
            </div>
            {catF && <button onClick={() => { setCatF(null); trigger(); }} style={{ padding: '0 14px', borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>✕ Clear category</button>}
        </div>

        {/* Categories */}
        {!catF && !search && <>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Browse by Category</div>
            {loading ? <div className="kb-cats-grid">{Array.from({ length: 7 }).map((_, i) => <Skel key={i} w="100%" h={80} />)}</div> :
            <div className="kb-cats-grid" style={{ marginBottom: 24 }}>
                {categories.map(cat => { const count = articles.filter(a => a.categoryId === cat.id).length;
                    return <div key={cat.id} className="kb-cat-card" onClick={() => { setCatF(cat.id); trigger(); }} style={{ padding: '16px', borderRadius: 10, border: `1px solid ${cat.color}20`, background: `${cat.color}04`, cursor: 'pointer', transition: 'all 0.15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${cat.color}12`, border: `1px solid ${cat.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{cat.icon}</div>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{cat.name}</div><div style={{ fontSize: 10, color: theme.textDim }}>{count} article{count !== 1 ? 's' : ''}</div></div>
                        </div>
                        <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5 }}>{cat.description}</div>
                    </div>;
                })}
            </div>}
            </>
        }

        {/* Active category header */}
        {catF && (() => { const cat = categories.find(c => c.id === catF); if (!cat) return null;
            return <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 16px', borderRadius: 10, border: `1px solid ${cat.color}20`, background: `${cat.color}04` }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${cat.color}12`, border: `1px solid ${cat.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{cat.icon}</div>
                <div><div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{cat.name}</div><div style={{ fontSize: 12, color: theme.textSecondary }}>{cat.description}</div></div>
                <span style={{ marginLeft: 'auto', fontSize: 20, fontWeight: 800, color: cat.color, fontFamily: "'JetBrains Mono',monospace" }}>{filtered.length}</span>
            </div>;
        })()}

        {/* Articles */}
        <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>
            {search ? `Search results (${filtered.length})` : catF ? 'Articles' : 'All Articles'}
        </div>

        {loading ? <div className="kb-articles-grid">{Array.from({ length: 6 }).map((_, i) => <Skel key={i} w="100%" h={120} />)}</div> :
        filtered.length === 0 ? <div style={{ padding: 50, textAlign: 'center' as const }}><div style={{ fontSize: 36, opacity: 0.15 }}>📚</div><div style={{ fontSize: 15, fontWeight: 600, color: theme.textSecondary, marginTop: 8 }}>No articles found</div><div style={{ fontSize: 12, color: theme.textDim, marginTop: 4 }}>Try different search terms or browse categories</div></div> :
        <div className="kb-articles-grid">
            {filtered.map(a => { const cat = categories.find(c => c.id === a.categoryId);
                return <div key={a.id} className="kb-article-card" onClick={() => { setSelArticle(a.id); trigger(); }} style={{ padding: '16px', borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bgCard, cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', flexDirection: 'column' as const }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: `${cat?.color || theme.accent}10`, color: cat?.color || theme.accent }}>{cat?.icon} {cat?.name}</span>
                        <span style={{ fontSize: 9, color: theme.textDim, marginLeft: 'auto' }}>{a.readTime}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 6, lineHeight: 1.3 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.5, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any }}>{a.summary}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 10, color: theme.textDim }}>
                        <span>👁 {a.views.toLocaleString()}</span>
                        <span>👍 {Math.round(a.helpful / a.helpfulTotal * 100)}%</span>
                        <span style={{ marginLeft: 'auto' }}>{a.updatedAt}</span>
                    </div>
                </div>;
            })}
        </div>}

        {/* Ctrl+Q */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="kb-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
            </div>
        </div>}
    </div></>);
}
AdminKnowledgeBase.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
