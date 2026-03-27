import PageMeta from '../../components/layout/PageMeta';
import AdminLayout from '../../layouts/AdminLayout';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { useToast } from '../../components/ui/Toast';
import { mockTickets, statusConfig, priorityConfig, categoryConfig, assignees, keyboardShortcuts } from '../../mock/admin-support';
import type { TicketStatus, TicketPriority, TicketCategory, Ticket } from '../../mock/admin-support';

function Skel({ w, h }: { w: string | number; h: number }) { return <div className="sup-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }

export default function AdminSupport() {
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState(mockTickets);
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState<TicketStatus | 'all'>('all');
    const [selId, setSelId] = useState<string | null>(null);
    const [reply, setReply] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const replyRef = useRef<HTMLTextAreaElement>(null);
    const { trigger } = useTopLoader();
    const toast = useToast();

    // New ticket form
    const [nSubject, setNSubject] = useState('');
    const [nDesc, setNDesc] = useState('');
    const [nCat, setNCat] = useState<TicketCategory>('bug');
    const [nPrio, setNPrio] = useState<TicketPriority>('medium');

    useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

    const sel = selId ? tickets.find(t => t.id === selId) : null;

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: tickets.length };
        (Object.keys(statusConfig) as TicketStatus[]).forEach(s => { c[s] = tickets.filter(t => t.status === s).length; });
        return c;
    }, [tickets]);

    const filtered = useMemo(() => {
        let tks = tickets;
        if (statusF !== 'all') tks = tks.filter(t => t.status === statusF);
        if (search) { const q = search.toLowerCase(); tks = tks.filter(t => t.subject.toLowerCase().includes(q) || t.number.toLowerCase().includes(q) || t.reporter.toLowerCase().includes(q) || t.tags.some(tg => tg.toLowerCase().includes(q))); }
        return tks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }, [tickets, statusF, search]);

    const resetAll = useCallback(() => { setSearch(''); setStatusF('all'); trigger(); }, [trigger]);

    const handleReply = () => {
        if (!reply.trim() || !sel) return;
        const updated = tickets.map(t => t.id === sel.id ? { ...t, messages: [...t.messages, { id: `m-${Date.now()}`, type: 'admin' as const, author: 'Col. Tomić', authorRole: 'System Admin', content: reply.trim(), timestamp: new Date().toLocaleString('sv-SE', { hour12: false }).replace(',', '') }], updatedAt: new Date().toLocaleString('sv-SE', { hour12: false }).replace(',', '') } : t);
        setTickets(updated);
        setReply('');
        toast.success('Reply sent', `Response added to ${sel.number}`);
    };

    const handleNewTicket = () => {
        if (!nSubject.trim() || !nDesc.trim()) return;
        const num = `TKT-${String(tickets.length + 1).padStart(3, '0')}`;
        const now = new Date().toLocaleString('sv-SE', { hour12: false }).replace(',', '');
        const newT: Ticket = { id: `t-${Date.now()}`, number: num, subject: nSubject.trim(), description: nDesc.trim(), status: 'open', priority: nPrio, category: nCat, reporter: 'Col. Tomić', reporterEmail: 'tomic@argux.mil', assignee: 'Unassigned', createdAt: now, updatedAt: now, tags: [categoryConfig[nCat].label.toLowerCase()],
            messages: [{ id: `m-${Date.now()}`, type: 'user', author: 'Col. Tomić', authorRole: 'System Admin', content: nDesc.trim(), timestamp: now }, { id: `m-${Date.now() + 1}`, type: 'system', author: 'System', content: `Ticket ${num} created. Priority: ${priorityConfig[nPrio].label}. Awaiting assignment.`, timestamp: now }] };
        setTickets([newT, ...tickets]);
        setShowNew(false); setNSubject(''); setNDesc(''); setNCat('bug'); setNPrio('medium');
        setSelId(newT.id);
        toast.success('Ticket created', `${num} — ${nSubject.trim()}`);
        trigger();
    };

    const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
        const now = new Date().toLocaleString('sv-SE', { hour12: false }).replace(',', '');
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus, updatedAt: now, ...(newStatus === 'resolved' || newStatus === 'closed' ? { resolvedAt: now } : {}), messages: [...t.messages, { id: `m-${Date.now()}`, type: 'system' as const, author: 'System', content: `Status changed to ${statusConfig[newStatus].label}.`, timestamp: now }] } : t));
        toast.info('Status updated', `Ticket moved to ${statusConfig[newStatus].label}`);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) { e.preventDefault(); e.stopPropagation(); setShowShortcuts(prev => !prev); return; }
            switch (e.key) {
                case 'n': case 'N': if (!e.ctrlKey && !e.metaKey) setShowNew(true); break;
                case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); } break;
                case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetAll(); break;
                case 'Escape': if (showNew) setShowNew(false); else if (showShortcuts) setShowShortcuts(false); else setSelId(null); break;
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [resetAll, showNew, showShortcuts]);

    const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' };

    return (<><PageMeta title="Support Tickets" /><div className="sup-page" data-testid="admin-support-page">

        {/* LEFT: Ticket List */}
        <div className="sup-list">
            {/* Header */}
            <div style={{ padding: '14px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>🎫</span>
                        <div><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Support Tickets</div><div style={{ fontSize: 10, color: theme.textDim }}>{tickets.length} total · {counts.open || 0} open</div></div>
                    </div>
                    <button onClick={() => setShowNew(true)} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>+ New</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 10px' }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                    <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', color: theme.text, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                </div>
            </div>

            {/* KPI row */}
            <div className="sup-kpi-row">
                {([['all', 'All', theme.text] as const, ...Object.entries(statusConfig).map(([k, v]) => [k, v.label, v.color] as const)]).map(([key, label, color]) => {
                    const on = statusF === key;
                    return <button key={key} onClick={() => { setStatusF(key as any); trigger(); }} style={{ padding: '4px 10px', borderRadius: 5, border: `1px solid ${on ? color + '40' : theme.border}`, background: on ? `${color}08` : 'transparent', color: on ? color : theme.textDim, fontSize: 10, fontWeight: on ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        {label}<span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{counts[key] || 0}</span>
                    </button>;
                })}
            </div>

            {/* Ticket list */}
            <div className="sup-scroll">
                {loading ? Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}06` }}><Skel w="70%" h={14} /><div style={{ height: 6 }} /><Skel w="45%" h={10} /></div>) :
                filtered.length === 0 ? <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 32, opacity: 0.15 }}>🎫</div><div style={{ fontSize: 13, fontWeight: 600, color: theme.textSecondary, marginTop: 6 }}>No tickets found</div><button onClick={resetAll} style={{ marginTop: 8, padding: '6px 14px', borderRadius: 5, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button></div> :
                filtered.map(t => { const sc = statusConfig[t.status]; const pc = priorityConfig[t.priority]; const on = selId === t.id;
                    return <div key={t.id} className="sup-ticket" onClick={() => setSelId(t.id)} style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', borderLeft: `3px solid ${on ? sc.color : 'transparent'}`, background: on ? `${sc.color}04` : 'transparent', transition: 'background 0.1s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: sc.color, fontFamily: "'JetBrains Mono',monospace" }}>{t.number}</span>
                            <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: `${pc.color}12`, color: pc.color, textTransform: 'uppercase' as const }}>{t.priority}</span>
                            <span style={{ fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: `${sc.color}12`, color: sc.color }}>{sc.label}</span>
                            <span style={{ marginLeft: 'auto', fontSize: 9, color: theme.textDim }}>{t.messages.length} 💬</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, marginBottom: 3 }}>{t.subject}</div>
                        <div style={{ display: 'flex', gap: 6, fontSize: 10, color: theme.textDim }}>
                            <span>{categoryConfig[t.category].icon} {categoryConfig[t.category].label}</span>
                            <span>· {t.reporter}</span>
                            <span style={{ marginLeft: 'auto' }}>{t.updatedAt.slice(5, 16)}</span>
                        </div>
                    </div>;
                })}
            </div>
        </div>

        {/* RIGHT: Detail */}
        <div className="sup-detail">
            {!sel ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as const, gap: 8 }}>
                <div style={{ fontSize: 48, opacity: 0.1 }}>🎫</div>
                <div style={{ fontSize: 14, color: theme.textDim }}>Select a ticket to view details</div>
                <div style={{ fontSize: 11, color: theme.textDim }}>or press <span className="sup-kbd">N</span> to create new</div>
            </div> : <>
                {/* Ticket header */}
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: statusConfig[sel.status].color, fontFamily: "'JetBrains Mono',monospace" }}>{sel.number}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${priorityConfig[sel.priority].color}12`, color: priorityConfig[sel.priority].color, border: `1px solid ${priorityConfig[sel.priority].color}25`, textTransform: 'uppercase' as const }}>{sel.priority}</span>
                        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: `${theme.border}15`, color: theme.textSecondary }}>{categoryConfig[sel.category].icon} {categoryConfig[sel.category].label}</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                            <select value={sel.status} onChange={e => handleStatusChange(sel.id, e.target.value as TicketStatus)} style={{ padding: '4px 8px', borderRadius: 4, border: `1px solid ${statusConfig[sel.status].color}30`, background: `${statusConfig[sel.status].color}08`, color: statusConfig[sel.status].color, fontSize: 10, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                                {(Object.keys(statusConfig) as TicketStatus[]).map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                            </select>
                            <button onClick={() => setSelId(null)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>
                    </div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: theme.text, margin: '0 0 6px', lineHeight: 1.3 }}>{sel.subject}</h2>
                    <div style={{ display: 'flex', gap: 12, fontSize: 10, color: theme.textDim, flexWrap: 'wrap' }}>
                        <span>👤 {sel.reporter}</span><span>📧 {sel.reporterEmail}</span><span>🔧 {sel.assignee}</span><span>📅 {sel.createdAt}</span>
                    </div>
                    {sel.tags.length > 0 && <div style={{ display: 'flex', gap: 3, marginTop: 8, flexWrap: 'wrap' as const }}>{sel.tags.map(t => <span key={t} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${theme.border}15`, color: theme.textSecondary }}>{t}</span>)}</div>}
                </div>

                {/* Messages */}
                <div className="sup-scroll" style={{ padding: '16px 20px' }}>
                    {sel.messages.map(msg => {
                        const cls = `sup-msg-${msg.type}`;
                        const colors: Record<string, string> = { user: '#3b82f6', admin: '#22c55e', system: theme.textDim };
                        return <div key={msg.id} className={cls} style={{ padding: '12px 14px', marginBottom: 10, borderRadius: 8, background: msg.type === 'system' ? `${theme.border}08` : theme.bgCard, border: `1px solid ${theme.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: colors[msg.type] }}>{msg.author}</span>
                                {msg.authorRole && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: `${colors[msg.type]}10`, color: colors[msg.type] }}>{msg.authorRole}</span>}
                                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 3, background: `${colors[msg.type]}08`, color: colors[msg.type], textTransform: 'uppercase' as const }}>{msg.type}</span>
                                <span style={{ marginLeft: 'auto', fontSize: 9, color: theme.textDim }}>{msg.timestamp}</span>
                            </div>
                            <div style={{ fontSize: 12, color: msg.type === 'system' ? theme.textDim : theme.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' as const }}>{msg.content}</div>
                        </div>;
                    })}
                </div>

                {/* Reply */}
                {sel.status !== 'closed' && <div style={{ padding: '12px 20px', borderTop: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <textarea ref={replyRef} value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." rows={3} style={{ ...inp, resize: 'vertical' as const, marginBottom: 8 }} onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply(); }} />
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 9, color: theme.textDim, alignSelf: 'center', marginRight: 'auto' }}>Ctrl+Enter to send</span>
                        <button onClick={handleReply} disabled={!reply.trim()} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: reply.trim() ? '#ef4444' : theme.border, color: '#fff', fontSize: 12, fontWeight: 700, cursor: reply.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: reply.trim() ? 1 : 0.4 }}>Send Reply</button>
                    </div>
                </div>}
            </>}
        </div>

        {/* New Ticket Modal */}
        {showNew && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>🎫 New Support Ticket</div>
                    <button onClick={() => setShowNew(false)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                    <div><label style={{ fontSize: 11, fontWeight: 600, color: theme.textDim, display: 'block', marginBottom: 4 }}>Subject *</label><input value={nSubject} onChange={e => setNSubject(e.target.value)} placeholder="Brief description of the issue" style={inp} autoFocus /></div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 600, color: theme.textDim, display: 'block', marginBottom: 4 }}>Category</label><select value={nCat} onChange={e => setNCat(e.target.value as TicketCategory)} style={inp}>{(Object.entries(categoryConfig) as [TicketCategory, { label: string; icon: string }][]).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div>
                        <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 600, color: theme.textDim, display: 'block', marginBottom: 4 }}>Priority</label><select value={nPrio} onChange={e => setNPrio(e.target.value as TicketPriority)} style={inp}>{(Object.entries(priorityConfig) as [TicketPriority, { label: string; color: string }][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                    </div>
                    <div><label style={{ fontSize: 11, fontWeight: 600, color: theme.textDim, display: 'block', marginBottom: 4 }}>Description *</label><textarea value={nDesc} onChange={e => setNDesc(e.target.value)} placeholder="Detailed description of the problem, steps to reproduce, expected behavior..." rows={5} style={{ ...inp, resize: 'vertical' as const }} /></div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={handleNewTicket} disabled={!nSubject.trim() || !nDesc.trim()} style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: nSubject.trim() && nDesc.trim() ? '#ef4444' : theme.border, color: '#fff', fontSize: 13, fontWeight: 700, cursor: nSubject.trim() && nDesc.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: nSubject.trim() && nDesc.trim() ? 1 : 0.4 }}>Create Ticket</button>
                    </div>
                </div>
            </div>
        </div>}

        {/* Ctrl+Q */}
        {showShortcuts && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}>
            <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>⌨️ Keyboard Shortcuts</div><button onClick={() => setShowShortcuts(false)} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
                {keyboardShortcuts.map(s => <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0', borderBottom: `1px solid ${theme.border}08` }}><span className="sup-kbd" style={{ minWidth: 56, textAlign: 'center' as const, fontSize: 11, height: 22, padding: '0 8px' }}>{s.key}</span><span style={{ fontSize: 13, color: theme.textSecondary }}>{s.description}</span></div>)}
                <div style={{ marginTop: 16, fontSize: 11, color: theme.textDim, textAlign: 'center' as const }}>Press <strong>Esc</strong> or <strong>Ctrl+Q</strong> to close</div>
            </div>
        </div>}
    </div></>);
}
AdminSupport.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
