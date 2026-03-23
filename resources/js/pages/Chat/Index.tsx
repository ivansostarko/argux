import PageMeta from '../../components/layout/PageMeta';
import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { mockConversations, getAIResponse, generateConvId, generateMsgId, type Conversation, type ChatMessage, type ChatAttachment } from '../../mock/chat';
import { nodes as allNodes } from '../../mock/connections';

/* ═══ MULTISELECT — z-index safe ═══ */
function MS({ selected, onChange, options, placeholder }: { selected: string[]; onChange: (v: string[]) => void; options: { id: string; label: string }[]; placeholder: string }) {
    const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
    const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
    const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    const has = selected.length > 0;
    return (<div ref={ref} style={{ position: 'relative', minWidth: 110 }}><button onClick={() => { setOpen(!open); setQ(''); }} style={{ width: '100%', padding: '6px 10px', background: theme.bgInput, color: has ? theme.text : theme.textDim, border: `1px solid ${has ? theme.accent+'60' : theme.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>{has ? `${selected.length} sel.` : placeholder}</span>{has && <span style={{ background: theme.accentDim, color: theme.accent, fontSize: 8, fontWeight: 700, padding: '0 3px', borderRadius: 3, flexShrink: 0 }}>{selected.length}</span>}</button>{open && <div style={{ position: 'absolute', top: '100%', right: 0, width: 240, marginTop: 4, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 8, zIndex: 100, maxHeight: 260, display: 'flex', flexDirection: 'column', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}><div style={{ padding: '6px 8px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 6, alignItems: 'center' }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." autoFocus style={{ flex: 1, padding: '6px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 11, fontFamily: 'inherit', outline: 'none', minWidth: 0 }} />{has && <button onClick={() => onChange([])} style={{ background: theme.dangerDim, border: `1px solid rgba(239,68,68,0.25)`, color: theme.danger, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>Clear</button>}</div><div style={{ overflowY: 'auto', flex: 1, padding: '2px 0' }}>{filtered.map(o => { const c = selected.includes(o.id); return <div key={o.id} onClick={() => toggle(o.id)} style={{ padding: '6px 10px', cursor: 'pointer', fontSize: 11, color: c ? theme.accent : theme.text, display: 'flex', alignItems: 'center', gap: 6 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><div style={{ width: 11, height: 11, borderRadius: 2, border: `1.5px solid ${c ? theme.accent : theme.border}`, background: c ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c && <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>{o.label}</div>; })}{filtered.length === 0 && <div style={{ padding: '12px', fontSize: 11, color: theme.textDim, textAlign: 'center' }}>No results</div>}</div></div>}</div>);
}

function Md({ text }: { text: string }) { const html = text.replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/^\- (.+)$/gm, '<li>$1</li>').replace(/^\d+\. (.+)$/gm, '<li>$1</li>').replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>').replace(/\|(.+)\|/g, (m) => { const c = m.split('|').filter(Boolean).map(x => x.trim()); return `<tr>${c.map(x => x.match(/^-+$/) ? '' : `<td>${x}</td>`).join('')}</tr>`; }).replace(/\n/g, '<br/>'); return <div dangerouslySetInnerHTML={{ __html: html }} />; }

function AttachIcon({ type }: { type: string }) {
    if (type === 'image' || type === 'photo') return <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><circle cx="5.5" cy="5.5" r="1.5"/><path d="M14 10l-3-3-7 7"/></svg>;
    if (type === 'video') return <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="10" height="10" rx="1"/><path d="M11 6l4-2v8l-4-2"/></svg>;
    if (type === 'audio') return <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1v14M4 4v8M12 4v8M1 6v4M15 6v4"/></svg>;
    return <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4z"/><polyline points="10,1 10,4 13,4"/></svg>;
}

const personOpts = allNodes.filter(n => n.type === 'person').map(n => ({ id: n.id, label: n.label }));
const orgOpts = allNodes.filter(n => n.type === 'organization').map(n => ({ id: n.id, label: n.label }));

export default function ChatIndex() {
    const toast = useToast();
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [activeId, setActiveId] = useState<string | null>(mockConversations[0]?.id || null);
    const [search, setSearch] = useState('');
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<ChatAttachment[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [recording, setRecording] = useState(false);
    const [exporting, setExporting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    const activeConv = conversations.find(c => c.id === activeId);
    const filteredConvs = conversations.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));
    const scrollBottom = () => { setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); };

    const handleNewConv = () => { const conv: Conversation = { id: generateConvId(), title: 'New Conversation', personIds: [], orgIds: [], messages: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; setConversations(prev => [conv, ...prev]); setActiveId(conv.id); setSidebarOpen(false); };
    const handleDelete = () => { if (!deleteId) return; setConversations(prev => prev.filter(c => c.id !== deleteId)); if (activeId === deleteId) setActiveId(conversations.find(c => c.id !== deleteId)?.id || null); setDeleteId(null); toast.warning('Conversation deleted'); };

    const handleSend = () => {
        if (!input.trim() && pendingFiles.length === 0) return; if (!activeConv) return;
        const userMsg: ChatMessage = { id: generateMsgId(), role: 'user', content: input.trim(), attachments: [...pendingFiles], timestamp: new Date().toISOString() };
        const title = activeConv.messages.length === 0 ? (input.trim().slice(0, 50) || 'File Upload') : activeConv.title;
        setConversations(prev => prev.map(c => c.id === activeId ? { ...c, title, messages: [...c.messages, userMsg], updatedAt: new Date().toISOString() } : c));
        setInput(''); setPendingFiles([]); scrollBottom();
        setTyping(true);
        setTimeout(() => { const aiMsg: ChatMessage = { id: generateMsgId(), role: 'assistant', content: getAIResponse(), attachments: [], timestamp: new Date().toISOString() }; setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, aiMsg], updatedAt: new Date().toISOString() } : c)); setTyping(false); scrollBottom(); }, 1500 + Math.random() * 1500);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files; if (!files) return;
        Array.from(files).forEach(f => { const ext = f.name.split('.').pop()?.toLowerCase() || ''; let type: ChatAttachment['type'] = 'file'; if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) type = 'image'; if (['mp4','avi','mov','mkv','webm'].includes(ext)) type = 'video'; if (['mp3','wav','ogg','m4a','flac'].includes(ext)) type = 'audio'; if (['heic','raw','cr2','nef'].includes(ext)) type = 'photo'; const size = f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`; setPendingFiles(prev => [...prev, { id: `file-${Date.now()}-${Math.random().toString(36).slice(2,5)}`, name: f.name, type, size }]); });
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
    const handleEntityChange = (field: 'personIds' | 'orgIds', val: string[]) => { if (!activeId) return; setConversations(prev => prev.map(c => c.id === activeId ? { ...c, [field]: val } : c)); };
    useEffect(scrollBottom, [activeId]);

    // Speech to text
    const toggleSpeech = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { toast.error('Not supported', 'Speech recognition not available in this browser.'); return; }
        if (recording) { recognitionRef.current?.stop(); setRecording(false); return; }
        const recognition = new SR();
        recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
        recognition.onresult = (event: any) => { let transcript = ''; for (let i = 0; i < event.results.length; i++) { transcript += event.results[i][0].transcript; } setInput(transcript); };
        recognition.onerror = () => { setRecording(false); toast.error('Speech error', 'Could not process speech.'); };
        recognition.onend = () => { setRecording(false); };
        recognition.start(); recognitionRef.current = recognition; setRecording(true);
        toast.info('Listening...', 'Speak into your microphone.');
    };

    const handleExportPDF = () => { if (!activeConv) return; setExporting(true); setTimeout(() => { setExporting(false); toast.success('PDF exported', `${activeConv.title.slice(0, 30)}_transcript.pdf`); }, 1500); };

    return (
                <>
        <PageMeta title="AI Assistant" section="chat" />
<div className="chat-page">
            {/* Lightbox */}
            {lightboxUrl && <div className="veh-lightbox" onClick={() => setLightboxUrl(null)}><button className="veh-lightbox-close" onClick={() => setLightboxUrl(null)}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button><img src={lightboxUrl} alt="" onClick={e => e.stopPropagation()} style={{ borderRadius: 10 }} /></div>}

            {/* Delete modal */}
            {deleteId && <div onClick={() => setDeleteId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}><div onClick={e => e.stopPropagation()} style={{ background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 14, width: '100%', maxWidth: 380, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'argux-fadeIn 0.2s ease-out' }}><h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, textAlign: 'center', margin: '0 0 8px' }}>Delete Conversation</h3><p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', margin: '0 0 20px' }}>This cannot be undone.</p><div style={{ display: 'flex', gap: 10 }}><Button variant="secondary" onClick={() => setDeleteId(null)} style={{ flex: 1 }}>Cancel</Button><Button variant="danger" onClick={handleDelete} style={{ flex: 1 }}>Delete</Button></div></div></div>}

            {/* Sidebar */}
            <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="chat-sidebar-header">
                    <button onClick={handleNewConv} style={{ width: '100%', padding: '9px 14px', borderRadius: 8, background: theme.accent, color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>New Conversation</button>
                    <div className="chat-sidebar-search"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." /></div>
                </div>
                <div className="chat-sidebar-list">
                    {filteredConvs.length === 0 ? <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: 12, color: theme.textDim }}>No conversations</div> : filteredConvs.map(c => (
                        <div key={c.id} className={`chat-conv-item ${activeId === c.id ? 'active' : ''}`} onClick={() => { setActiveId(c.id); setSidebarOpen(false); }}>
                            <div className="chat-conv-title">{c.title}</div>
                            <div className="chat-conv-meta"><span>{c.messages.length} msg{c.messages.length !== 1 ? 's' : ''}</span><span>·</span><span>{new Date(c.updatedAt).toLocaleDateString()}</span></div>
                            {(c.personIds.length > 0 || c.orgIds.length > 0) && <div className="chat-entity-tags" style={{ marginTop: 4 }}>{c.personIds.slice(0, 2).map(id => { const n = allNodes.find(x => x.id === id); return n ? <span key={id} className="chat-entity-tag" style={{ background: theme.accentDim, color: theme.accent, border: `1px solid ${theme.accent}30` }}>{n.label.split(' ')[0]}</span> : null; })}{c.orgIds.slice(0, 1).map(id => { const n = allNodes.find(x => x.id === id); return n ? <span key={id} className="chat-entity-tag" style={{ background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>{n.label.split(' ')[0]}</span> : null; })}</div>}
                            <button className="chat-conv-delete" onClick={e => { e.stopPropagation(); setDeleteId(c.id); }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main */}
            <div className="chat-main">
                {activeConv ? <>
                    {/* Header — FIXED layout */}
                    <div className="chat-header">
                        <div className="chat-header-left">
                            <button className="chat-mobile-toggle chat-action-btn" onClick={() => setSidebarOpen(true)}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg></button>
                            <div className="chat-header-info"><div className="chat-header-title">{activeConv.title}</div><div className="chat-header-meta">{activeConv.messages.length} messages · {new Date(activeConv.updatedAt).toLocaleString()}</div></div>
                        </div>
                        <div className="chat-header-actions">
                            <div className="chat-header-selects">
                                <MS selected={activeConv.personIds} onChange={v => handleEntityChange('personIds', v)} options={personOpts} placeholder="Persons" />
                                <MS selected={activeConv.orgIds} onChange={v => handleEntityChange('orgIds', v)} options={orgOpts} placeholder="Orgs" />
                            </div>
                            <button className="chat-action-btn" onClick={() => router.visit(`/chat/${activeConv.id}/print`)} title="Print"><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5V1h8v4"/><rect x="2" y="5" width="12" height="6" rx="1"/><path d="M4 11v4h8v-4"/></svg></button>
                            <button className="chat-action-btn" onClick={handleExportPDF} title="Export PDF" style={exporting ? { opacity: 0.5 } : {}}>{exporting ? <svg width="13" height="13" viewBox="0 0 16 16" style={{ animation: 'argux-spin 0.8s linear infinite' }}><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round"/></svg> : <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 14h10"/><path d="M8 2v9"/><path d="M5 8l3 3 3-3"/></svg>}</button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {activeConv.messages.length === 0 && !typing && (
                            <div className="chat-empty">
                                <div style={{ width: 56, height: 56, borderRadius: 14, background: theme.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>ARGUX AI Assistant</div>
                                <div style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', maxWidth: 420 }}>Ask questions about persons, organizations, vehicles, connections, risk assessments, or upload files for analysis. Use the microphone button for speech input.</div>
                            </div>
                        )}
                        {activeConv.messages.map(msg => (
                            <div key={msg.id} className={`chat-msg ${msg.role}`}>
                                <div className="chat-msg-avatar" style={{ background: msg.role === 'user' ? theme.accent : 'linear-gradient(135deg, #1e3a5f, #2d5a27)' }}>{msg.role === 'user' ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg> : <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>}</div>
                                <div className="chat-msg-body">
                                    <div className="chat-msg-bubble">{msg.role === 'assistant' ? <Md text={msg.content} /> : msg.content}</div>
                                    {msg.attachments.length > 0 && <div className="chat-attachments">{msg.attachments.map(a => a.url && (a.type === 'image' || a.type === 'photo') ? <div key={a.id} className="chat-attach-img" onClick={() => setLightboxUrl(a.url!)}><img src={a.url} alt={a.name} /></div> : <div key={a.id} className="chat-attach-chip"><AttachIcon type={a.type} /><span>{a.name}</span><span className="size">({a.size})</span></div>)}</div>}
                                    <div className="chat-msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        ))}
                        {typing && <div className="chat-msg assistant"><div className="chat-msg-avatar" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a27)' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg></div><div className="chat-msg-body"><div className="chat-msg-bubble"><div className="chat-typing"><div className="chat-typing-dot"/><div className="chat-typing-dot"/><div className="chat-typing-dot"/></div></div></div></div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-input-area">
                        <div className="chat-input-row">
                            <div className="chat-input-wrap">
                                {pendingFiles.length > 0 && <div className="chat-pending-files">{pendingFiles.map(f => <div key={f.id} className="chat-pending-file"><AttachIcon type={f.type} /><span>{f.name.length > 20 ? f.name.slice(0, 18) + '…' : f.name}</span><button onClick={() => setPendingFiles(prev => prev.filter(x => x.id !== f.id))}><svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button></div>)}</div>}
                                <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={recording ? 'Listening… speak now' : 'Ask ARGUX AI anything...'} rows={1} />
                                <div className="chat-input-toolbar">
                                    <input ref={fileRef} type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                                    <button className="chat-input-btn" onClick={() => fileRef.current?.click()} title="Attach file"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 8.5l-5.5 5.5a3.5 3.5 0 01-5-5l6-6a2 2 0 013 3l-6 6a.5.5 0 01-1-1l5.5-5.5"/></svg></button>
                                    <button className="chat-input-btn" onClick={() => { fileRef.current?.setAttribute('accept', 'image/*'); fileRef.current?.click(); setTimeout(() => fileRef.current?.removeAttribute('accept'), 100); }} title="Upload image"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><circle cx="5.5" cy="5.5" r="1.5"/><path d="M14 10l-3-3-7 7"/></svg></button>
                                    <button className="chat-input-btn" onClick={() => { fileRef.current?.setAttribute('accept', 'audio/*'); fileRef.current?.click(); setTimeout(() => fileRef.current?.removeAttribute('accept'), 100); }} title="Upload audio"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1v14M4 4v8M12 4v8M1 6v4M15 6v4"/></svg></button>
                                    <button className="chat-input-btn" onClick={() => { fileRef.current?.setAttribute('accept', 'video/*'); fileRef.current?.click(); setTimeout(() => fileRef.current?.removeAttribute('accept'), 100); }} title="Upload video"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="10" height="10" rx="1"/><path d="M11 6l4-2v8l-4-2"/></svg></button>
                                    <div style={{ width: 1, height: 18, background: theme.border, margin: '0 2px' }} />
                                    <button className={`chat-input-btn ${recording ? 'recording' : ''}`} onClick={toggleSpeech} title={recording ? 'Stop recording' : 'Speech to text'}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="1" width="6" height="8" rx="3"/><path d="M3 7a5 5 0 0010 0"/><line x1="8" y1="12" x2="8" y2="15"/><line x1="5" y1="15" x2="11" y2="15"/></svg></button>
                                </div>
                            </div>
                            <button className="chat-send-btn" onClick={handleSend} disabled={typing || (!input.trim() && pendingFiles.length === 0)}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="8" x2="14" y2="8"/><polyline points="9 3 14 8 9 13"/></svg></button>
                        </div>
                    </div>
                </> : (
                    <div className="chat-empty">
                        <div style={{ width: 56, height: 56, borderRadius: 14, background: theme.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>Select a conversation</div>
                        <div style={{ fontSize: 13, color: theme.textSecondary }}>Or start a new one.</div>
                        <button className="chat-mobile-toggle" onClick={() => setSidebarOpen(true)} style={{ padding: '8px 18px', borderRadius: 8, background: theme.accent, color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', marginTop: 8 }}>Open Conversations</button>
                    </div>
                )}
            </div>
        </div>
    </>
    );
}

ChatIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
