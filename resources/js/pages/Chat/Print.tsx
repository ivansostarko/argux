import { usePage } from '@inertiajs/react';
import { mockConversations } from '../../mock/chat';
import { nodes as allNodes } from '../../mock/connections';

function Md({ text }: { text: string }) {
    const html = text.replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/^\- (.+)$/gm, '<li>$1</li>').replace(/\|(.+)\|/g, (m) => { const c = m.split('|').filter(Boolean).map(x => x.trim()); return `<tr>${c.map(x => x.match(/^-+$/) ? '' : `<td>${x}</td>`).join('')}</tr>`; }).replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ChatPrint() {
    const { convId } = usePage<{ convId: string; [key: string]: unknown }>().props;
    const conv = mockConversations.find(c => c.id === String(convId));
    if (!conv) return <div className="chat-print-page" style={{ textAlign: 'center', padding: 60 }}><h2>Conversation Not Found</h2></div>;

    const personNames = conv.personIds.map(id => allNodes.find(n => n.id === id)?.label).filter(Boolean);
    const orgNames = conv.orgIds.map(id => allNodes.find(n => n.id === id)?.label).filter(Boolean);

    return (
        <div className="chat-print-page">
            <div className="chat-print-header">
                <div>
                    <div className="chat-print-brand">ARGUX TACTICAL INTELLIGENCE PLATFORM</div>
                    <div className="chat-print-title">{conv.title}</div>
                    <div className="chat-print-meta">AI Assistant Conversation · {conv.messages.length} messages · Created: {new Date(conv.createdAt).toLocaleString()}</div>
                    {(personNames.length > 0 || orgNames.length > 0) && <div className="chat-print-entities">
                        {personNames.map((n, i) => <span key={i} className="chat-print-entity-tag">👤 {n}</span>)}
                        {orgNames.map((n, i) => <span key={i} className="chat-print-entity-tag">🏢 {n}</span>)}
                    </div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="chat-print-meta">CONVERSATION TRANSCRIPT</div>
                    <div className="chat-print-meta">ID: {conv.id}</div>
                    <div className="chat-print-meta">Generated: {new Date().toLocaleString()}</div>
                    <button className="print-btn print-no-print" onClick={() => window.print()} style={{ marginTop: 8, padding: '6px 14px', borderRadius: 6, background: '#1e3a5f', color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Print This Page</button>
                </div>
            </div>

            {conv.messages.map(msg => (
                <div key={msg.id} className="chat-print-msg">
                    <div className="chat-print-msg-header">
                        <span className={`chat-print-msg-role ${msg.role}`}>{msg.role === 'user' ? 'Operator' : 'ARGUX AI'}</span>
                        <span className="chat-print-msg-time">{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="chat-print-msg-content">
                        {msg.role === 'assistant' ? <Md text={msg.content} /> : <p style={{ margin: 0 }}>{msg.content}</p>}
                    </div>
                    {msg.attachments.length > 0 && <div className="chat-print-attach">
                        {msg.attachments.map(a => <span key={a.id} className="chat-print-attach-chip">📎 {a.name} ({a.size})</span>)}
                    </div>}
                </div>
            ))}

            <div className="chat-print-footer">
                <span>ARGUX Surveillance Platform — CLASSIFIED // NOFORN</span>
                <span>Conversation ID: {conv.id} · {new Date().toLocaleString()}</span>
            </div>
        </div>
    );
}
