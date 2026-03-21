import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui';
import { useToast } from '../ui/Toast';
import { theme } from '../../lib/theme';
import { getAIResponse, generateConvId, generateMsgId, type Conversation, type ChatMessage, type ChatAttachment } from '../../mock/chat';

function Md({ text }: { text: string }) { const html = text.replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/^\- (.+)$/gm, '<li>$1</li>').replace(/^\d+\. (.+)$/gm, '<li>$1</li>').replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>').replace(/\|(.+)\|/g, (m) => { const c = m.split('|').filter(Boolean).map(x => x.trim()); return `<tr>${c.map(x => x.match(/^-+$/) ? '' : `<td>${x}</td>`).join('')}</tr>`; }).replace(/\n/g, '<br/>'); return <div dangerouslySetInnerHTML={{ __html: html }} />; }

function AttachIcon({ type }: { type: string }) {
    if (type === 'image' || type === 'photo') return <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><circle cx="5.5" cy="5.5" r="1.5"/><path d="M14 10l-3-3-7 7"/></svg>;
    if (type === 'video') return <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="10" height="10" rx="1"/><path d="M11 6l4-2v8l-4-2"/></svg>;
    if (type === 'audio') return <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1v14M4 4v8M12 4v8M1 6v4M15 6v4"/></svg>;
    return <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4z"/><polyline points="10,1 10,4 13,4"/></svg>;
}

interface Props {
    entityName: string;
    entityType: 'person' | 'organization';
}

export default function EntityChat({ entityName, entityType }: Props) {
    const toast = useToast();
    const [conversations, setConversations] = useState<Conversation[]>([
        { id: generateConvId(), title: `${entityName} — General Analysis`, personIds: [], orgIds: [], messages: [
            { id: generateMsgId(), role: 'system', content: `AI Assistant context loaded for ${entityType}: **${entityName}**. All queries will be analyzed in context of this entity.`, attachments: [], timestamp: new Date(Date.now() - 86400000).toISOString() },
        ], createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
    ]);
    const [activeId, setActiveId] = useState(conversations[0].id);
    const [search, setSearch] = useState('');
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<ChatAttachment[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [recording, setRecording] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    const activeConv = conversations.find(c => c.id === activeId);
    const filteredConvs = conversations.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));
    const scrollBottom = () => { setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); };

    const handleNewConv = () => { const conv: Conversation = { id: generateConvId(), title: `${entityName} — New Query`, personIds: [], orgIds: [], messages: [{ id: generateMsgId(), role: 'system', content: `AI context: ${entityType} **${entityName}**`, attachments: [], timestamp: new Date().toISOString() }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; setConversations(prev => [conv, ...prev]); setActiveId(conv.id); };
    const handleDelete = () => { if (!deleteId) return; setConversations(prev => prev.filter(c => c.id !== deleteId)); if (activeId === deleteId) setActiveId(conversations.find(c => c.id !== deleteId)?.id || ''); setDeleteId(null); toast.warning('Conversation deleted'); };

    const handleSend = () => {
        if (!input.trim() && pendingFiles.length === 0) return; if (!activeConv) return;
        const userMsg: ChatMessage = { id: generateMsgId(), role: 'user', content: input.trim(), attachments: [...pendingFiles], timestamp: new Date().toISOString() };
        const userMsgs = activeConv.messages.filter(m => m.role === 'user');
        const title = userMsgs.length === 0 ? `${entityName} — ${input.trim().slice(0, 40)}` : activeConv.title;
        setConversations(prev => prev.map(c => c.id === activeId ? { ...c, title, messages: [...c.messages, userMsg], updatedAt: new Date().toISOString() } : c));
        setInput(''); setPendingFiles([]); scrollBottom();
        setTyping(true);
        setTimeout(() => { const aiMsg: ChatMessage = { id: generateMsgId(), role: 'assistant', content: getAIResponse(), attachments: [], timestamp: new Date().toISOString() }; setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, aiMsg], updatedAt: new Date().toISOString() } : c)); setTyping(false); scrollBottom(); }, 1500 + Math.random() * 1500);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files; if (!files) return;
        Array.from(files).forEach(f => { const ext = f.name.split('.').pop()?.toLowerCase() || ''; let type: ChatAttachment['type'] = 'file'; if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) type = 'image'; if (['mp4','avi','mov','mkv','webm'].includes(ext)) type = 'video'; if (['mp3','wav','ogg','m4a','flac'].includes(ext)) type = 'audio'; const size = f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`; setPendingFiles(prev => [...prev, { id: `file-${Date.now()}-${Math.random().toString(36).slice(2,5)}`, name: f.name, type, size }]); });
        if (fileRef.current) fileRef.current.value = '';
    };
    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
    useEffect(scrollBottom, [activeId]);

    const toggleSpeech = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { toast.error('Not supported', 'Speech recognition not available.'); return; }
        if (recording) { recognitionRef.current?.stop(); setRecording(false); return; }
        const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = 'en-US';
        r.onresult = (ev: any) => { let t = ''; for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript; setInput(t); };
        r.onerror = () => { setRecording(false); }; r.onend = () => { setRecording(false); };
        r.start(); recognitionRef.current = r; setRecording(true); toast.info('Listening...', 'Speak now.');
    };

    const icoStyle: React.CSSProperties = { width: 28, height: 28, borderRadius: 5, border: 'none', background: 'transparent', color: theme.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s' };

    return (
        <div style={{ display: 'flex', border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', height: 560, background: theme.bg }}>
            {/* Delete modal */}
            {deleteId && <div onClick={() => setDeleteId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}><div onClick={e => e.stopPropagation()} style={{ background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 14, width: '100%', maxWidth: 360, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'argux-fadeIn 0.2s ease-out' }}><h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, textAlign: 'center', margin: '0 0 8px' }}>Delete Conversation</h3><p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', margin: '0 0 20px' }}>This cannot be undone.</p><div style={{ display: 'flex', gap: 10 }}><Button variant="secondary" onClick={() => setDeleteId(null)} style={{ flex: 1 }}>Cancel</Button><Button variant="danger" onClick={handleDelete} style={{ flex: 1 }}>Delete</Button></div></div></div>}

            {/* Sidebar */}
            {showSidebar && <div style={{ width: 220, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', background: theme.bgInput, flexShrink: 0 }}>
                <div style={{ padding: '10px 10px 8px' }}>
                    <button onClick={handleNewConv} style={{ width: '100%', padding: '7px 12px', borderRadius: 6, background: theme.accent, color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 8 }}><svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>New</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 8px' }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '6px 0', color: theme.text, fontSize: 11, fontFamily: 'inherit', flex: 1, minWidth: 0 }} /></div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '2px 6px', scrollbarWidth: 'thin' as const }}>
                    {filteredConvs.map(c => (
                        <div key={c.id} onClick={() => setActiveId(c.id)} style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 2, transition: 'background 0.1s', background: activeId === c.id ? theme.accentDim : 'transparent', border: `1px solid ${activeId === c.id ? theme.accent + '30' : 'transparent'}`, position: 'relative' }} onMouseEnter={e => activeId !== c.id && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={e => activeId !== c.id && (e.currentTarget.style.background = 'transparent')}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, paddingRight: 20 }}>{c.title}</div>
                            <div style={{ fontSize: 9, color: theme.textDim, marginTop: 2 }}>{c.messages.filter(m => m.role !== 'system').length} msgs · {new Date(c.updatedAt).toLocaleDateString()}</div>
                            <button onClick={e => { e.stopPropagation(); setDeleteId(c.id); }} style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 3, background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }} onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = theme.danger; }} onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.color = theme.textDim; }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3,5 13,5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 5v8a1 1 0 01-1 1H5a1 1 0 01-1-1V5"/></svg></button>
                        </div>
                    ))}
                </div>
            </div>}

            {/* Chat */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Header */}
                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.bgInput, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <button onClick={() => setShowSidebar(!showSidebar)} style={icoStyle} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="10" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg></button>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{activeConv?.title || 'Select a conversation'}</div>
                            <div style={{ fontSize: 9, color: theme.textDim }}>Context: {entityName} ({entityType})</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: theme.accentDim, color: theme.accent, border: `1px solid ${theme.accent}30` }}>{entityType === 'person' ? 'PERSON' : 'ORG'}</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="chat-messages" style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {activeConv && activeConv.messages.filter(m => m.role !== 'system').length === 0 && !typing && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: theme.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>AI Assistant — {entityName}</div>
                            <div style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', maxWidth: 360 }}>Ask about risk assessment, connections, activity, vehicles, or upload files for analysis in context of this {entityType}.</div>
                        </div>
                    )}
                    {activeConv?.messages.filter(m => m.role !== 'system').map(msg => (
                        <div key={msg.id} className={`chat-msg ${msg.role}`}>
                            <div className="chat-msg-avatar" style={{ background: msg.role === 'user' ? theme.accent : 'linear-gradient(135deg, #1e3a5f, #2d5a27)' }}>{msg.role === 'user' ? <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg> : <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>}</div>
                            <div className="chat-msg-body">
                                <div className="chat-msg-bubble" style={{ fontSize: 12 }}>{msg.role === 'assistant' ? <Md text={msg.content} /> : msg.content}</div>
                                {msg.attachments.length > 0 && <div className="chat-attachments">{msg.attachments.map(a => <div key={a.id} className="chat-attach-chip"><AttachIcon type={a.type} /><span>{a.name}</span><span className="size">({a.size})</span></div>)}</div>}
                                <div className="chat-msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                    ))}
                    {typing && <div className="chat-msg assistant"><div className="chat-msg-avatar" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a27)' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg></div><div className="chat-msg-body"><div className="chat-msg-bubble"><div className="chat-typing"><div className="chat-typing-dot"/><div className="chat-typing-dot"/><div className="chat-typing-dot"/></div></div></div></div>}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '10px 14px', borderTop: `1px solid ${theme.border}`, background: theme.bgInput, flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, transition: 'border-color 0.15s' }}>
                            {pendingFiles.length > 0 && <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{pendingFiles.map(f => <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px', borderRadius: 4, background: theme.accentDim, border: `1px solid ${theme.accent}30`, fontSize: 9, color: theme.accent }}><AttachIcon type={f.type} />{f.name.length > 15 ? f.name.slice(0, 13) + '…' : f.name}<button onClick={() => setPendingFiles(prev => prev.filter(x => x.id !== f.id))} style={{ background: 'none', border: 'none', color: theme.danger, cursor: 'pointer', display: 'flex', padding: 0 }}><svg width="7" height="7" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button></div>)}</div>}
                            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={recording ? 'Listening…' : `Ask about ${entityName}...`} rows={1} style={{ background: 'transparent', border: 'none', outline: 'none', color: theme.text, fontSize: 12, fontFamily: 'inherit', resize: 'none', minHeight: 20, maxHeight: 100, lineHeight: 1.5, width: '100%' }} />
                            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <input ref={fileRef} type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                                <button style={icoStyle} onClick={() => fileRef.current?.click()} title="Attach" onMouseEnter={e => (e.currentTarget.style.color = theme.textSecondary)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 8.5l-5.5 5.5a3.5 3.5 0 01-5-5l6-6a2 2 0 013 3l-6 6a.5.5 0 01-1-1l5.5-5.5"/></svg></button>
                                <button style={icoStyle} onClick={() => { fileRef.current?.setAttribute('accept', 'image/*'); fileRef.current?.click(); setTimeout(() => fileRef.current?.removeAttribute('accept'), 100); }} title="Image" onMouseEnter={e => (e.currentTarget.style.color = theme.textSecondary)} onMouseLeave={e => (e.currentTarget.style.color = theme.textDim)}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><circle cx="5.5" cy="5.5" r="1.5"/><path d="M14 10l-3-3-7 7"/></svg></button>
                                <div style={{ width: 1, height: 14, background: theme.border, margin: '0 1px' }} />
                                <button style={{ ...icoStyle, ...(recording ? { color: theme.danger, background: 'rgba(239,68,68,0.1)' } : {}) }} onClick={toggleSpeech} title={recording ? 'Stop' : 'Speech to text'} className={recording ? 'chat-input-btn recording' : ''} onMouseEnter={e => !recording && (e.currentTarget.style.color = theme.textSecondary)} onMouseLeave={e => !recording && (e.currentTarget.style.color = theme.textDim)}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="1" width="6" height="8" rx="3"/><path d="M3 7a5 5 0 0010 0"/><line x1="8" y1="12" x2="8" y2="15"/><line x1="5" y1="15" x2="11" y2="15"/></svg></button>
                            </div>
                        </div>
                        <button onClick={handleSend} disabled={typing || (!input.trim() && pendingFiles.length === 0)} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: theme.accent, color: '#fff', cursor: typing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (typing || (!input.trim() && pendingFiles.length === 0)) ? 0.4 : 1 }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="8" x2="14" y2="8"/><polyline points="9 3 14 8 9 13"/></svg></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
