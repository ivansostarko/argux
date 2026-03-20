import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button, Icons } from '../../components/ui';
import { theme } from '../../lib/theme';
import { mockPersons, risks, riskColors, genders, nationalities, countries, allLanguages, type Risk } from '../../mock/persons';

/* ═══ MULTI-SELECT ═══ */
function MS({ selected, onChange, options, placeholder }: { selected: string[]; onChange: (v: string[]) => void; options: string[]; placeholder: string }) {
    const [open, setOpen] = useState(false); const [search, setSearch] = useState(''); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
    const toggle = (o: string) => onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o]);
    const has = selected.length > 0;
    return (
        <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: 140 }}>
            <button onClick={() => { setOpen(!open); setSearch(''); }} style={{ width: '100%', padding: '8px 10px', background: theme.bgInput, color: has ? theme.text : theme.textDim, border: `1px solid ${has ? theme.accent+'60' : theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{has ? `${selected.length} selected` : placeholder}</span>
                {has && <span style={{ background: theme.accentDim, color: theme.accent, fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4, flexShrink: 0 }}>{selected.length}</span>}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}><polyline points="2,4 5,7 8,4"/></svg>
            </button>
            {open && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 8, zIndex: 50, maxHeight: 240, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                <div style={{ padding: '6px 8px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 6 }}>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." autoFocus style={{ flex: 1, padding: '6px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
                    {has && <button onClick={() => onChange([])} style={{ background: 'none', border: 'none', color: theme.danger, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '0 4px' }}>Clear</button>}
                </div>
                <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
                    {filtered.slice(0, 100).map(o => { const c = selected.includes(o); return (
                        <div key={o} onClick={() => toggle(o)} style={{ padding: '6px 10px', cursor: 'pointer', fontSize: 12, color: c ? theme.accent : theme.text, display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${c ? theme.accent : theme.border}`, background: c ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c && <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>{o}
                        </div>
                    ); })}
                    {filtered.length === 0 && <div style={{ padding: '12px 10px', fontSize: 12, color: theme.textDim, textAlign: 'center' }}>No results</div>}
                </div>
            </div>}
        </div>
    );
}

/* ═══ RISK BADGE ═══ */
function RiskBadge({ risk }: { risk: Risk }) {
    const c = riskColors[risk] || '#6b7280';
    return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: `${c}18`, color: c, border: `1px solid ${c}30`, whiteSpace: 'nowrap' as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{risk}</span>;
}

/* ═══ MAIN PAGE ═══ */
export default function PersonsIndex() {
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [sortCol, setSortCol] = useState<string>('lastName');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const perPage = 10;

    // Advanced filters
    const [fNationality, setFNationality] = useState<string[]>([]);
    const [fCountry, setFCountry] = useState<string[]>([]);
    const [fGender, setFGender] = useState('');
    const [fRisk, setFRisk] = useState<string[]>([]);
    const [fLanguage, setFLanguage] = useState<string[]>([]);
    const [fDobFrom, setFDobFrom] = useState('');
    const [fDobTo, setFDobTo] = useState('');
    const [fEmail, setFEmail] = useState('');
    const [fPhone, setFPhone] = useState('');
    const [fName, setFName] = useState('');
    const [fNickname, setFNickname] = useState('');

    const hasAdvanced = fNationality.length > 0 || fCountry.length > 0 || fGender || fRisk.length > 0 || fLanguage.length > 0 || fDobFrom || fDobTo || fEmail || fPhone || fName || fNickname;

    const filtered = mockPersons.filter(p => {
        const q = search.toLowerCase();
        const matchSearch = !q || `${p.firstName} ${p.lastName} ${p.nickname} ${p.email} ${p.phone}`.toLowerCase().includes(q);
        const matchName = !fName || `${p.firstName} ${p.lastName}`.toLowerCase().includes(fName.toLowerCase());
        const matchNick = !fNickname || p.nickname.toLowerCase().includes(fNickname.toLowerCase());
        const matchNat = fNationality.length === 0 || fNationality.includes(p.nationality);
        const matchCountry = fCountry.length === 0 || fCountry.includes(p.country);
        const matchGender = !fGender || p.gender === fGender;
        const matchRisk = fRisk.length === 0 || fRisk.includes(p.risk);
        const matchLang = fLanguage.length === 0 || fLanguage.includes(p.language);
        const matchDob = (!fDobFrom || p.dob >= fDobFrom) && (!fDobTo || p.dob <= fDobTo);
        const matchEmail = !fEmail || p.email.toLowerCase().includes(fEmail.toLowerCase());
        const matchPhone = !fPhone || p.phone.includes(fPhone);
        return matchSearch && matchName && matchNick && matchNat && matchCountry && matchGender && matchRisk && matchLang && matchDob && matchEmail && matchPhone;
    }).sort((a, b) => {
        const av = (a as any)[sortCol] || ''; const bv = (b as any)[sortCol] || '';
        const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    const toggleSort = (col: string) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } };
    const SortIcon = ({ col }: { col: string }) => sortCol === col ? <span style={{ fontSize: 10, marginLeft: 4 }}>{sortDir === 'asc' ? '▲' : '▼'}</span> : null;
    const clearAll = () => { setFNationality([]); setFCountry([]); setFGender(''); setFRisk([]); setFLanguage([]); setFDobFrom(''); setFDobTo(''); setFEmail(''); setFPhone(''); setFName(''); setFNickname(''); setSearch(''); setPage(1); };

    const inputStyle: React.CSSProperties = { padding: '8px 10px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 12, fontFamily: 'inherit', outline: 'none', width: '100%' };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Persons</h1>
                    <p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>{filtered.length} subjects in database</p>
                </div>
                <Button onClick={() => router.visit('/persons/create')} style={{ width: 'auto', padding: '10px 20px' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>
                    Add Person
                </Button>
            </div>

            {/* Search + filter toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0 14px' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email, phone..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '10px 0', color: theme.text, fontSize: 13, fontFamily: 'inherit' }} />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? theme.accentDim : 'rgba(255,255,255,0.03)', border: `1px solid ${showFilters ? theme.accent : theme.border}`, borderRadius: 8, padding: '0 14px', cursor: 'pointer', color: showFilters ? theme.accent : theme.textSecondary, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="6" y1="12" x2="10" y2="12"/></svg>
                    Filters
                    {hasAdvanced && <span style={{ background: theme.accent, color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10 }}>!</span>}
                </button>
            </div>

            {/* Advanced filters panel */}
            {showFilters && (
                <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 16, marginBottom: 16, animation: 'argux-fadeIn 0.2s ease-out' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                        <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 4, display: 'block' }}>Name</label><input value={fName} onChange={e => { setFName(e.target.value); setPage(1); }} placeholder="First or last name" style={inputStyle} /></div>
                        <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 4, display: 'block' }}>Nickname</label><input value={fNickname} onChange={e => { setFNickname(e.target.value); setPage(1); }} placeholder="Nickname" style={inputStyle} /></div>
                        <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 4, display: 'block' }}>Email</label><input value={fEmail} onChange={e => { setFEmail(e.target.value); setPage(1); }} placeholder="Email address" style={inputStyle} /></div>
                        <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 4, display: 'block' }}>Phone</label><input value={fPhone} onChange={e => { setFPhone(e.target.value); setPage(1); }} placeholder="Phone number" style={inputStyle} /></div>
                        <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 4, display: 'block' }}>Gender</label><select value={fGender} onChange={e => { setFGender(e.target.value); setPage(1); }} style={{ ...inputStyle, cursor: 'pointer' }}><option value="">All</option>{genders.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                        <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 4, display: 'block' }}>DOB From</label><input type="date" value={fDobFrom} onChange={e => { setFDobFrom(e.target.value); setPage(1); }} style={{ ...inputStyle, colorScheme: 'dark' as any }} /></div>
                        <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 4, display: 'block' }}>DOB To</label><input type="date" value={fDobTo} onChange={e => { setFDobTo(e.target.value); setPage(1); }} style={{ ...inputStyle, colorScheme: 'dark' as any }} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        <MS selected={fNationality} onChange={v => { setFNationality(v); setPage(1); }} options={nationalities} placeholder="Nationality" />
                        <MS selected={fCountry} onChange={v => { setFCountry(v); setPage(1); }} options={countries} placeholder="Country" />
                        <MS selected={fLanguage} onChange={v => { setFLanguage(v); setPage(1); }} options={allLanguages} placeholder="Language" />
                        <MS selected={fRisk} onChange={v => { setFRisk(v); setPage(1); }} options={[...risks]} placeholder="Risk Level" />
                    </div>
                    {hasAdvanced && <div style={{ marginTop: 12 }}><button onClick={clearAll} style={{ background: theme.dangerDim, border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, padding: '6px 14px', fontSize: 11, color: theme.danger, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Clear all filters</button></div>}
                </div>
            )}

            {/* Table */}
            <div style={{ background: 'rgba(10,14,22,0.5)', border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <style>{`
                    .persons-row { display: grid; grid-template-columns: 48px 1fr 100px 100px 160px 140px 100px 80px 100px; padding: 10px 16px; align-items: center; gap: 8; }
                    @media(max-width:1024px) { .persons-row { grid-template-columns: 48px 1fr 100px 140px 80px 100px; } .ph-nick,.ph-nat,.ph-lang { display: none !important; } }
                    @media(max-width:768px) { .persons-row { grid-template-columns: 40px 1fr 80px 80px; } .ph-nick,.ph-nat,.ph-email,.ph-phone,.ph-lang { display: none !important; } }
                `}</style>
                {/* Header */}
                <div className="persons-row" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                    <span></span>
                    <span onClick={() => toggleSort('lastName')} style={{ cursor: 'pointer' }}>Name<SortIcon col="lastName" /></span>
                    <span className="ph-nick">Nickname</span>
                    <span className="ph-nat" onClick={() => toggleSort('nationality')} style={{ cursor: 'pointer' }}>Nationality<SortIcon col="nationality" /></span>
                    <span className="ph-email">Email</span>
                    <span className="ph-phone">Phone</span>
                    <span className="ph-lang">Language</span>
                    <span onClick={() => toggleSort('risk')} style={{ cursor: 'pointer' }}>Risk<SortIcon col="risk" /></span>
                    <span>Actions</span>
                </div>
                {paginated.length === 0 ? (
                    <div style={{ padding: '48px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 4 }}>No persons found</div>
                        <div style={{ fontSize: 12, color: theme.textSecondary }}>Try adjusting your search or filters.</div>
                    </div>
                ) : paginated.map((p, idx) => (
                    <div key={p.id} className="persons-row" style={{ borderBottom: idx < paginated.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', fontSize: 12, transition: 'background 0.1s', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => router.visit(`/persons/${p.id}`)}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {p.avatar ? <img src={p.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{p.firstName[0]}{p.lastName[0]}</span>}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.firstName} {p.lastName}</div>
                            <div style={{ fontSize: 11, color: theme.textDim }}>{p.gender} · {p.dob}</div>
                        </div>
                        <span className="ph-nick" style={{ color: p.nickname ? theme.textSecondary : theme.textDim, fontStyle: p.nickname ? 'normal' : 'italic' }}>{p.nickname || '—'}</span>
                        <span className="ph-nat" style={{ color: theme.textSecondary }}>{p.nationality}</span>
                        <span className="ph-email" style={{ color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{p.email}</span>
                        <span className="ph-phone" style={{ color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{p.phone}</span>
                        <span className="ph-lang" style={{ color: theme.textSecondary }}>{p.language}</span>
                        <span><RiskBadge risk={p.risk} /></span>
                        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => router.visit(`/persons/${p.id}/edit`)} title="Edit" style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.textSecondary, display: 'flex' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg></button>
                            <button onClick={() => router.visit(`/persons/${p.id}`)} title="View" style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.accent, display: 'flex' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg></button>
                            <button title="Delete" style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 4, cursor: 'pointer', color: theme.danger, display: 'flex' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 12, color: theme.textSecondary }}>Page {page} of {totalPages} ({filtered.length} results)</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page===1?'not-allowed':'pointer', color: page===1?theme.textDim:theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page===1?0.4:1 }}>Prev</button>
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                            const p = page <= 3 ? i + 1 : Math.min(page - 2 + i, totalPages - 4 + i + 1);
                            if (p < 1 || p > totalPages) return null;
                            return <button key={p} onClick={() => setPage(p)} style={{ background: page===p?theme.accentDim:'none', border: `1px solid ${page===p?theme.accent:theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: page===p?theme.accent:theme.textSecondary, fontSize: 12, fontWeight: page===p?700:400, fontFamily: 'inherit' }}>{p}</button>;
                        })}
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page===totalPages} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 10px', cursor: page===totalPages?'not-allowed':'pointer', color: page===totalPages?theme.textDim:theme.textSecondary, fontSize: 12, fontFamily: 'inherit', opacity: page===totalPages?0.4:1 }}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}

PersonsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
