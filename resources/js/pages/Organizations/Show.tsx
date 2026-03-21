import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { Button, Icons } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { getOrgById, riskColors, type Risk, type Organization } from '../../mock/organizations';

type ShowTab = 'overview' | 'contacts' | 'social' | 'addresses' | 'notes';
const RB = ({risk}:{risk:Risk}) => { const c=riskColors[risk]; return <span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:4,background:`${c}18`,color:c,border:`1px solid ${c}30`,textTransform:'uppercase' as const}}>{risk}</span>; };
const Field = ({label,value,mono}:{label:string;value?:string;mono?:boolean}) => value ? <div style={{marginBottom:14}}><div style={{fontSize:10,fontWeight:600,color:theme.textDim,letterSpacing:'0.08em',textTransform:'uppercase' as const,marginBottom:3}}>{label}</div><div style={{fontSize:13,color:theme.text,fontFamily:mono?"'JetBrains Mono',monospace":'inherit',wordBreak:'break-all' as const}}>{value}</div></div> : null;
const Section = ({title,children}:{title:string;children:React.ReactNode}) => <div style={{marginBottom:24}}><div style={{fontSize:11,fontWeight:700,color:theme.textDim,letterSpacing:'0.12em',textTransform:'uppercase' as const,marginBottom:12,paddingBottom:8,borderBottom:`1px solid ${theme.border}`}}>{title}</div>{children}</div>;

function generateSummary(o: Organization): string {
    const riskNote = o.risk === 'Critical' ? 'CRITICAL risk — immediate investigation priority.' : o.risk === 'High' ? 'HIGH risk — requires close monitoring.' : o.risk === 'Medium' ? 'MEDIUM risk — notable flags present.' : o.risk === 'Low' ? 'LOW risk — minimal concerns.' : 'NO RISK classification.';
    const contactStr = `${o.emails.length} email(s), ${o.phones.length} phone(s) on file.`;
    const addrStr = o.addresses.length > 0 ? `Registered at: ${o.addresses[0].city}, ${o.addresses[0].country}.` : 'No registered address.';
    const personStr = o.linkedPersons.length > 0 ? `Linked persons: ${o.linkedPersons.map(p=>`${p.firstName} ${p.lastName} (${p.role})`).join(', ')}.` : '';
    const noteStr = o.notes.length > 0 ? `${o.notes.length} intelligence note(s). Latest: "${o.notes[0].text.slice(0,80)}${o.notes[0].text.length>80?'…':''}"` : 'No intelligence notes.';
    return `${o.name} is a ${o.industry} entity registered in ${o.country}. Status: ${o.status}. ${riskNote}\n\n${o.ceo ? `CEO: ${o.ceo}. ` : ''}${o.owner ? `Owner: ${o.owner}. ` : ''}${contactStr} ${addrStr} ${o.websites.length > 0 ? `Websites: ${o.websites.map(w=>w.url).join(', ')}.` : ''}\n\n${personStr}${personStr ? '\n\n' : ''}${noteStr}\n\nVAT: ${o.vat || 'N/A'}. Record ID: ${o.uuid}. Created: ${new Date(o.createdAt).toLocaleDateString()}.`;
}

const showTabs: {id:ShowTab;label:string;icon:React.ReactNode}[] = [
    {id:'overview',label:'Overview',icon:Icons.user(14)},{id:'contacts',label:'Contacts',icon:Icons.mail(14)},
    {id:'social',label:'Social',icon:<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="4" cy="8" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><line x1="5.8" y1="7" x2="10.2" y2="5"/><line x1="5.8" y1="9" x2="10.2" y2="11"/></svg>},
    {id:'addresses',label:'Addresses',icon:<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1C5.24 1 3 3.24 3 6c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z"/><circle cx="8" cy="6" r="2"/></svg>},
    {id:'notes',label:'Notes',icon:<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4z"/><polyline points="10,1 10,4 13,4"/></svg>},
];

export default function OrgShow() {
    const toast = useToast();
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const o = getOrgById(Number(id));
    const [tab, setTab] = useState<ShowTab>('overview');
    const [exporting, setExporting] = useState(false);

    if (!o) return <div style={{textAlign:'center',padding:'60px 20px'}}><h2 style={{fontSize:18,fontWeight:700,color:theme.text}}>Organization Not Found</h2><Button variant="secondary" onClick={()=>router.visit('/organizations')} style={{width:'auto',padding:'10px 20px',marginTop:16}}>Back</Button></div>;

    return (<div style={{maxWidth:1000,margin:'0 auto'}}>
        <style>{`@media(max-width:768px){.os-vtabs{display:none!important}.os-htabs{display:flex!important}.os-layout{flex-direction:column!important}.os-header-row{flex-direction:column!important}.os-header-btns{width:100%}.os-header-btns button{flex:1}}`}</style>

        {/* Header */}
        <div style={{background:theme.bgInput,border:`1px solid ${theme.border}`,borderRadius:14,padding:'20px 24px',marginBottom:24}}>
            <div className="os-header-row" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16}}>
                <div style={{display:'flex',alignItems:'center',gap:18,flex:1,minWidth:0}}>
                    <div style={{width:68,height:68,borderRadius:12,overflow:'hidden',background:`linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`,display:'flex',alignItems:'center',justifyContent:'center',border:`3px solid ${theme.border}`,flexShrink:0}}>{o.logo ? <img src={o.logo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:20,fontWeight:700,color:'#fff'}}>{o.name.slice(0,2)}</span>}</div>
                    <div style={{minWidth:0}}>
                        <h1 style={{fontSize:20,fontWeight:700,color:theme.text,margin:'0 0 4px'}}>{o.name}</h1>
                        <div style={{fontSize:12,color:theme.textSecondary,marginBottom:6}}>{o.industry} · {o.country}{o.ceo ? ` · CEO: ${o.ceo}` : ''}</div>
                        <RB risk={o.risk} />
                    </div>
                </div>
                <div className="os-header-btns" style={{display:'flex',gap:6,flexWrap:'wrap',flexShrink:0}}>
                    <Button variant="secondary" onClick={()=>router.visit('/organizations')} style={{width:'auto',padding:'8px 14px',fontSize:11}}>Back</Button>
                    <Button variant="secondary" onClick={()=>router.visit(`/organizations/${o.id}/print`)} style={{width:'auto',padding:'8px 14px',fontSize:11}}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5V1h8v4"/><rect x="2" y="5" width="12" height="6" rx="1"/><path d="M4 11v4h8v-4"/></svg>Print</Button>
                    <Button variant="secondary" onClick={()=>{setExporting(true);setTimeout(()=>{setExporting(false);toast.success('PDF exported',`${o.name}_dossier.pdf`);},1500);}} loading={exporting} style={{width:'auto',padding:'8px 14px',fontSize:11}}>Export PDF</Button>
                    <Button onClick={()=>router.visit(`/organizations/${o.id}/edit`)} style={{width:'auto',padding:'8px 14px',fontSize:11}}>Edit</Button>
                </div>
            </div>
        </div>

        <div className="os-layout" style={{display:'flex',gap:20,alignItems:'flex-start'}}>
            <div className="os-vtabs" style={{width:170,flexShrink:0,position:'sticky',top:80,display:'flex',flexDirection:'column',gap:3}}>
                {showTabs.map(t=>{const a=tab===t.id;return<button key={t.id} onClick={()=>setTab(t.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:8,cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:a?600:400,color:a?theme.accent:theme.textSecondary,background:a?theme.accentDim:'transparent',border:'none',textAlign:'left' as const,width:'100%'}}><span style={{display:'flex',color:a?theme.accent:theme.textDim}}>{t.icon}</span>{t.label}</button>;})}
            </div>
            <div className="os-htabs" style={{display:'none',gap:2,marginBottom:16,borderBottom:`1px solid ${theme.border}`,overflowX:'auto',width:'100%',scrollbarWidth:'none' as const}}>
                {showTabs.map(t=>{const a=tab===t.id;return<button key={t.id} onClick={()=>setTab(t.id)} style={{background:'none',border:'none',borderBottom:`2px solid ${a?theme.accent:'transparent'}`,padding:'8px 14px',cursor:'pointer',fontFamily:'inherit',color:a?theme.text:theme.textSecondary,fontSize:12,fontWeight:a?700:500,whiteSpace:'nowrap' as const,flexShrink:0}}>{t.label}</button>;})}
            </div>

            <div style={{flex:1,minWidth:0,animation:'argux-fadeIn 0.2s ease-out'}}>
                {tab==='overview' && <>
                    <Section title="AI Intelligence Summary">
                        <div style={{background:`linear-gradient(135deg, ${theme.accentDim}, rgba(10,14,22,0.4))`,border:`1px solid ${theme.accent}20`,borderRadius:10,padding:18}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><div style={{width:24,height:24,borderRadius:6,background:theme.accent,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg></div><span style={{fontSize:11,fontWeight:600,color:theme.accent,letterSpacing:'0.06em'}}>GENERATED BY ARGUX AI — {new Date().toLocaleDateString()}</span></div>
                            <p style={{fontSize:13,color:theme.text,lineHeight:1.7,margin:0,whiteSpace:'pre-line' as const}}>{generateSummary(o)}</p>
                        </div>
                    </Section>

                    <Section title="Company Information">
                        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))',gap:0}}>
                            <Field label="Company Name" value={o.name} /><Field label="Country" value={o.country} /><Field label="Industry" value={o.industry} /><Field label="CEO" value={o.ceo} /><Field label="Owner" value={o.owner} /><Field label="VAT" value={o.vat} mono /><Field label="Tax Number" value={o.taxNumber} mono /><Field label="UUID" value={o.uuid} mono /><Field label="Created" value={new Date(o.createdAt).toLocaleDateString()} /><Field label="Updated" value={new Date(o.updatedAt).toLocaleDateString()} />
                        </div>
                    </Section>

                    {o.websites.length > 0 && <Section title={`Websites (${o.websites.length})`}>{o.websites.map(w=><div key={w.id} style={{background:theme.bgInput,border:`1px solid ${theme.border}`,borderRadius:6,padding:'8px 14px',marginBottom:4,fontSize:13,color:theme.accent,wordBreak:'break-all' as const}}>{w.url}</div>)}</Section>}

                    {o.linkedPersons.length > 0 && <Section title={`Linked Persons (${o.linkedPersons.length})`}><div style={{display:'grid',gap:6}}>{o.linkedPersons.map(p=><div key={p.id} onClick={()=>router.visit(`/persons/${p.id}`)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:theme.bgInput,border:`1px solid ${theme.border}`,borderRadius:8,cursor:'pointer',transition:'background 0.15s'}} onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.02)')} onMouseLeave={e=>(e.currentTarget.style.background=theme.bgInput)}><div style={{width:32,height:32,borderRadius:6,background:`linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>{p.firstName[0]}{p.lastName[0]}</div><div><div style={{fontSize:13,fontWeight:600,color:theme.text}}>{p.firstName} {p.lastName}</div><div style={{fontSize:11,color:theme.textSecondary}}>{p.role}</div></div><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round" style={{marginLeft:'auto'}}><path d="M6 3l5 5-5 5"/></svg></div>)}</div></Section>}
                </>}

                {tab==='contacts' && <>
                    <Section title={`Emails (${o.emails.length})`}>{o.emails.length===0 ? <p style={{fontSize:13,color:theme.textDim}}>No emails.</p> : o.emails.map(em=><div key={em.id} style={{background:theme.bgInput,border:`1px solid ${theme.border}`,borderRadius:8,padding:'12px 16px',marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:6}}><span style={{fontSize:13,color:theme.accent,wordBreak:'break-all' as const}}>{em.email}</span><div style={{display:'flex',gap:4,flexWrap:'wrap'}}><span style={{fontSize:9,fontWeight:600,padding:'2px 6px',borderRadius:3,background:'rgba(255,255,255,0.05)',color:theme.textSecondary}}>{em.type}</span><span style={{fontSize:9,fontWeight:600,padding:'2px 6px',borderRadius:3,background:em.status==='Active'?theme.successDim:theme.dangerDim,color:em.status==='Active'?theme.success:theme.danger}}>{em.status}</span>{em.notes&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:3,background:theme.accentDim,color:theme.textDim}}>{em.notes}</span>}</div></div></div>)}</Section>
                    <Section title={`Phones (${o.phones.length})`}>{o.phones.length===0 ? <p style={{fontSize:13,color:theme.textDim}}>No phones.</p> : o.phones.map(ph=><div key={ph.id} style={{background:theme.bgInput,border:`1px solid ${theme.border}`,borderRadius:8,padding:'12px 16px',marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:6}}><span style={{fontSize:14,fontWeight:600,color:theme.text,fontFamily:"'JetBrains Mono',monospace"}}>{ph.number}</span><div style={{display:'flex',gap:4,flexWrap:'wrap'}}><span style={{fontSize:9,fontWeight:600,padding:'2px 6px',borderRadius:3,background:'rgba(255,255,255,0.05)',color:theme.textSecondary}}>{ph.type}</span><span style={{fontSize:9,fontWeight:600,padding:'2px 6px',borderRadius:3,background:ph.status==='Active'?theme.successDim:theme.dangerDim,color:ph.status==='Active'?theme.success:theme.danger}}>{ph.status}</span>{ph.notes&&<span style={{fontSize:9,color:theme.textDim}}>{ph.notes}</span>}</div></div></div>)}</Section>
                </>}

                {tab==='social' && <Section title="Social Media">{o.socials.length===0 ? <p style={{fontSize:13,color:theme.textDim}}>No profiles.</p> : o.socials.map(s=><div key={s.platform} style={{marginBottom:14}}><h4 style={{fontSize:13,fontWeight:600,color:theme.text,marginBottom:6,display:'flex',alignItems:'center',gap:8}}><span style={{width:22,height:22,borderRadius:5,background:theme.accentDim,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:theme.accent}}>{s.platform[0]}</span>{s.platform} ({s.profiles.length})</h4>{s.profiles.map(pr=><div key={pr.id} style={{background:theme.bgInput,border:`1px solid ${theme.border}`,borderRadius:6,padding:'8px 14px',marginBottom:4,fontSize:12,color:theme.accent,wordBreak:'break-all' as const}}>{pr.url}</div>)}</div>)}</Section>}

                {tab==='addresses' && <Section title={`Addresses (${o.addresses.length})`}>{o.addresses.length===0 ? <p style={{fontSize:13,color:theme.textDim}}>No addresses.</p> : o.addresses.map((a,i)=><div key={a.id} style={{background:theme.bgInput,border:`1px solid ${theme.border}`,borderRadius:10,padding:14,marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:theme.textSecondary,marginBottom:6}}>#{i+1}{a.notes?` — ${a.notes}`:''}</div><div style={{fontSize:14,fontWeight:600,color:theme.text}}>{a.address} {a.addressNumber}</div><div style={{fontSize:13,color:theme.textSecondary}}>{a.zipCode} {a.city}, {a.country}</div></div>)}</Section>}

                {tab==='notes' && <Section title={`Notes (${o.notes.length})`}>{o.notes.length===0 ? <p style={{fontSize:13,color:theme.textDim}}>No notes.</p> : o.notes.map(n=><div key={n.id} style={{background:theme.bgInput,border:`1px solid ${theme.border}`,borderRadius:10,padding:14,marginBottom:10}}><p style={{fontSize:13,color:theme.text,lineHeight:1.6,margin:'0 0 8px',whiteSpace:'pre-wrap' as const}}>{n.text}</p><div style={{fontSize:10,color:theme.textDim}}>Created: {new Date(n.createdAt).toLocaleString()} · Updated: {new Date(n.updatedAt).toLocaleString()}</div></div>)}</Section>}
            </div>
        </div>
    </div>);
}

OrgShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
