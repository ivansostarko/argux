import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';
import { useTopLoader } from '../../components/ui/TopLoader';
import { mockPersons } from '../../mock/persons';
import { mockDevices, deviceTypeIcons } from '../../mock/devices';
import { mockOrganizations } from '../../mock/organizations';
import { mockVehicles } from '../../mock/vehicles';
import { mockOps as INITIAL_OPS, phaseColors, phaseIcons, prioColors, allPhases, tabList, keyboardShortcuts } from '../../mock/operations';
import type { Phase, Priority, DetailTab, Operation, Team, TeamMember, OpZone, AlertRule, Checklist } from '../../mock/operations';

/* ═══ ARGUX — Operations (Full CRUD) ═══ */
function Skel({ w, h }: { w: string | number; h: number }) { return <div className="op-skeleton" style={{ width: typeof w === 'number' ? w : w, height: h }} />; }
function Modal({ title, icon, onClose, children, width = 520 }: { title: string; icon: string; onClose: () => void; children: React.ReactNode; width?: number }) {
    return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{ background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: width, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>{icon} {title}</div>
                <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>{children}
        </div></div>;
}
const FL = ({ children }: { children: React.ReactNode }) => <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 5 }}>{children}</div>;
const FI = (p: any) => <input {...p} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', ...(p.style||{}) }} />;
const FS = (p: any) => <select {...p} style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', ...(p.style||{}) }}>{p.children}</select>;
const FT = (p: any) => <textarea {...p} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const, ...(p.style||{}) }} />;
const BtnP = ({ children, onClick, disabled, color = '#ef4444' }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; color?: string }) => <button onClick={onClick} disabled={disabled} style={{ flex: 2, padding: '11px', borderRadius: 6, border: 'none', background: disabled ? `${theme.border}30` : color, color: disabled ? theme.textDim : '#fff', fontSize: 13, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>{children}</button>;
const BtnC = ({ onClick }: { onClick: () => void }) => <button onClick={onClick} style={{ flex: 1, padding: '11px', borderRadius: 6, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>;
const IBtn = ({ onClick, title, children, color = theme.textDim }: { onClick: () => void; title: string; children: React.ReactNode; color?: string }) => <button onClick={onClick} title={title} style={{ width: 24, height: 24, borderRadius: 4, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 11, padding: 0, flexShrink: 0 }}>{children}</button>;
const AddB = ({ label, onClick }: { label: string; onClick: () => void }) => <button onClick={onClick} style={{ padding: '6px 12px', borderRadius: 6, border: `1px dashed ${theme.border}`, background: 'transparent', color: theme.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ {label}</button>;

function OperationsIndex() {
    const [ops, setOps] = useState<Operation[]>(() => [...INITIAL_OPS]);
    const [selOp, setSelOp] = useState<string>(INITIAL_OPS[0].id);
    const [tab, setTab] = useState<DetailTab>('overview');
    const [phaseF, setPhaseF] = useState<Phase|'all'>('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPhaseModal, setShowPhaseModal] = useState(false);
    const [modal, setModal] = useState<{type:string;data?:any}|null>(null);
    const [newForm, setNewForm] = useState({codename:'',name:'',description:'',phase:'Planning' as Phase,priority:'High' as Priority,classification:'SECRET',commander:''});
    const [aiGen, setAiGen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const {trigger} = useTopLoader();
    const uid = useRef(100);
    const nid = () => `gen-${++uid.current}`;

    useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
    const op = ops.find(o => o.id === selOp) || ops[0];
    const filtered = useMemo(() => ops.filter(o => { if (phaseF !== 'all' && o.phase !== phaseF) return false; if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.codename.toLowerCase().includes(search.toLowerCase())) return false; return true; }), [phaseF, search, ops]);
    const targets = op.targetPersonIds.map(id => mockPersons.find(p => p.id === id)).filter(Boolean);
    const targetOrgs = op.targetOrgIds.map(id => mockOrganizations.find(o => o.id === id)).filter(Boolean);
    const devices = op.deployedDeviceIds.map(id => mockDevices.find(d => d.id === id)).filter(Boolean);
    const vehicles = op.trackedVehicleIds.map(id => mockVehicles.find(v => v.id === id)).filter(Boolean);
    const upOp = useCallback((fn: (o: Operation) => Operation) => { setOps(prev => prev.map(o => o.id === selOp ? fn({...o}) : o)); }, [selOp]);
    const resetF = useCallback(() => { setSearch(''); setPhaseF('all'); trigger(); }, [trigger]);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement).tagName) && e.key !== 'Escape') return;
            if ((e.ctrlKey||e.metaKey)&&(e.key==='q'||e.key==='Q')){e.preventDefault();e.stopPropagation();setShowShortcuts(p=>!p);return;}
            switch(e.key){case 'n':case 'N':if(!e.ctrlKey&&!e.metaKey)setShowNewModal(true);break;case 'f':case 'F':if(!e.ctrlKey&&!e.metaKey){e.preventDefault();searchRef.current?.focus();}break;case 'r':case 'R':if(!e.ctrlKey&&!e.metaKey)resetF();break;case 'Escape':setShowShortcuts(false);setShowNewModal(false);setShowEditModal(false);setShowDeleteConfirm(false);setShowPhaseModal(false);setModal(null);break;}
        };
        window.addEventListener('keydown', h, true); return () => window.removeEventListener('keydown', h, true);
    }, [resetF]);

    const SB = ({c,n,l}:{c:string;n:number|string;l:string}) => <div style={{padding:'8px 12px',borderRadius:8,background:`${c}08`,border:`1px solid ${c}20`,flex:1,minWidth:80}}><div style={{fontSize:20,fontWeight:800,color:c,fontFamily:"'JetBrains Mono',monospace"}}>{n}</div><div style={{fontSize:9,color:theme.textDim,marginTop:2}}>{l}</div></div>;

    const handleCreate = () => {
        const id=nid();
        const o:Operation={id,codename:newForm.codename,name:`Operation ${newForm.codename} — ${newForm.name}`,description:newForm.description,phase:newForm.phase,priority:newForm.priority,classification:newForm.classification,commander:newForm.commander,startDate:new Date().toISOString().slice(0,10),endDate:'',targetPersonIds:[],targetOrgIds:[],deployedDeviceIds:[],trackedVehicleIds:[],teams:[],zones:[],alertRules:[],timeline:[{id:nid(),date:new Date().toISOString().slice(0,10),label:'Operation initiated',type:'phase',color:'#3b82f6'}],checklist:[],briefingNotes:'',commsChannel:`${newForm.codename}-NET`,commsFreq:'TBD',riskLevel:0,threatAssessment:'',stats:{events:0,alerts:0,hoursActive:0,intel:0}};
        setOps(prev=>[o,...prev]);setSelOp(id);setTab('overview');setShowNewModal(false);setNewForm({codename:'',name:'',description:'',phase:'Planning',priority:'High',classification:'SECRET',commander:''});trigger();
    };
    const handleDelete = () => { setOps(prev=>prev.filter(o=>o.id!==selOp)); setSelOp(ops.find(o=>o.id!==selOp)?.id||''); setShowDeleteConfirm(false);trigger(); };
    const handlePhase = (p:Phase) => { upOp(o=>{o.phase=p;o.timeline=[...o.timeline,{id:nid(),date:new Date().toISOString().slice(0,10),label:`Phase changed to ${p}`,type:'phase',color:phaseColors[p]}];if(p==='Closed'&&!o.endDate)o.endDate=new Date().toISOString().slice(0,10);return o;});setShowPhaseModal(false);trigger(); };
    const genAI = () => { setAiGen(true); setTimeout(()=>{const b=`SITREP ${new Date().toISOString().slice(0,10)}: Operation ${op.codename} — ${op.phase} Phase\n\nTARGETS: ${op.targetPersonIds.length} persons, ${op.targetOrgIds.length} organizations.\nDEPLOYED: ${op.deployedDeviceIds.length} devices, ${op.trackedVehicleIds.length} vehicles.\nTEAMS: ${op.teams.length} assigned.\nZONES: ${op.zones.length} monitored.\nALERTS: ${op.alertRules.filter(a=>a.enabled).length} active rules.\n\nRISK: ${op.riskLevel}/100\n${op.threatAssessment?`ASSESSMENT: ${op.threatAssessment}`:''}\n\nROE: Observe and document. No engagement without Commander auth.\n\n— ARGUX AI`;upOp(o=>({...o,briefingNotes:b}));setAiGen(false);trigger();},2000); };

    return (<>
        <PageMeta title={`Operations — ${op.codename}`} />
        <div className="op-page" data-testid="operations-page">
            {/* LEFT SIDEBAR */}
            <div className="op-left" style={{borderRight:`1px solid ${theme.border}`,background:theme.bg}}>
                <div style={{padding:'14px',borderBottom:`1px solid ${theme.border}`}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                        <div style={{width:34,height:34,borderRadius:8,background:'#ef444410',border:'1px solid #ef444425',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>🎯</div>
                        <div><div style={{fontSize:16,fontWeight:800,color:theme.text}}>OPERATIONS</div><div style={{fontSize:10,color:theme.textDim}}>{ops.length} operations</div></div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6,background:theme.bgInput,border:`1px solid ${theme.border}`,borderRadius:6,padding:'0 10px',marginBottom:8}}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input ref={searchRef} id="op-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{background:'transparent',border:'none',outline:'none',padding:'9px 0',color:theme.text,fontSize:13,fontFamily:'inherit',flex:1,minWidth:0}} />
                    </div>
                    <div style={{display:'flex',gap:3,flexWrap:'wrap' as const}}>
                        {(['all',...allPhases] as (Phase|'all')[]).map(p=><button key={p} onClick={()=>{setPhaseF(p);trigger();}} style={{padding:'4px 8px',borderRadius:4,border:`1px solid ${phaseF===p?(p==='all'?theme.accent:phaseColors[p as Phase])+'40':theme.border}`,background:phaseF===p?`${p==='all'?theme.accent:phaseColors[p as Phase]}08`:'transparent',color:phaseF===p?(p==='all'?theme.accent:phaseColors[p as Phase]):theme.textDim,fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{p==='all'?'All':p}</button>)}
                    </div>
                </div>
                <div style={{flex:1,overflowY:'auto',scrollbarWidth:'thin'}}>
                    {loading && [0,1,2,3].map(i=><div key={i} style={{padding:'12px 14px',borderBottom:`1px solid ${theme.border}06`}}><Skel w="40%" h={14}/><div style={{height:5}}/><Skel w="80%" h={12}/></div>)}
                    {!loading && filtered.map(o=>{const pc=phaseColors[o.phase];const sel=o.id===selOp;
                        return <div key={o.id} className="op-card" onClick={()=>{setSelOp(o.id);setTab('overview');trigger();}} style={{padding:'12px 14px',borderBottom:`1px solid ${theme.border}06`,cursor:'pointer',borderLeft:`3px solid ${sel?pc:'transparent'}`,background:sel?`${pc}06`:'transparent'}}>
                            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
                                <span style={{fontSize:9,fontWeight:800,padding:'2px 6px',borderRadius:4,background:`${pc}15`,color:pc}}>{o.phase.toUpperCase()}</span>
                                <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:3,background:`${prioColors[o.priority]}12`,color:prioColors[o.priority]}}>{o.priority}</span>
                                <span style={{fontSize:9,color:theme.textDim,marginLeft:'auto'}}>{o.startDate}</span>
                            </div>
                            <div style={{fontSize:13,fontWeight:700,color:pc,fontFamily:"'JetBrains Mono',monospace",marginBottom:3}}>{o.codename}</div>
                            <div style={{fontSize:10,color:theme.textDim,lineHeight:1.4,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as any}}>{o.description.slice(0,100)}</div>
                            <div style={{display:'flex',gap:8,marginTop:5,fontSize:9,color:theme.textDim}}><span>🎯{o.targetPersonIds.length}</span><span>📡{o.deployedDeviceIds.length}</span><span>👥{o.teams.length}</span></div>
                        </div>;})}
                </div>
                <div style={{padding:'10px 14px',borderTop:`1px solid ${theme.border}`,display:'flex',gap:6}}>
                    <button onClick={()=>setShowNewModal(true)} style={{flex:1,padding:'8px',borderRadius:6,border:'none',background:'#ef4444',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>+ New</button>
                    <button onClick={resetF} style={{padding:'8px 12px',borderRadius:6,border:`1px solid ${theme.border}`,background:'transparent',color:theme.textDim,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Reset</button>
                </div>
            </div>
            {/* CENTER */}
            <div className="op-center">
                <div className="op-mobile-bar"><select value={selOp} onChange={e=>{setSelOp(e.target.value);setTab('overview');trigger();}} style={{flex:1,padding:'8px',borderRadius:6,border:`1px solid ${theme.border}`,background:theme.bgInput,color:theme.text,fontSize:12,fontFamily:'inherit'}}>{ops.map(o=><option key={o.id} value={o.id}>{o.codename} — {o.phase}</option>)}</select></div>
                {/* Header */}
                <div style={{padding:'12px 18px',borderBottom:`1px solid ${theme.border}`,display:'flex',alignItems:'center',gap:12,flexShrink:0,flexWrap:'wrap' as const}}>
                    <div style={{width:40,height:40,borderRadius:10,background:`${phaseColors[op.phase]}10`,border:`1.5px solid ${phaseColors[op.phase]}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{phaseIcons[op.phase]}</div>
                    <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:17,fontWeight:800,color:theme.text}}><span style={{color:phaseColors[op.phase],fontFamily:"'JetBrains Mono',monospace"}}>{op.codename}</span><span style={{fontWeight:400,color:theme.textDim,fontSize:12,marginLeft:8}}>{op.name.replace(`Operation ${op.codename} — `,'')}</span></div>
                        <div style={{fontSize:10,color:theme.textDim,marginTop:3,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap' as const}}>
                            <button onClick={()=>setShowPhaseModal(true)} style={{fontWeight:700,color:phaseColors[op.phase],background:`${phaseColors[op.phase]}08`,border:`1px solid ${phaseColors[op.phase]}30`,borderRadius:4,padding:'2px 8px',cursor:'pointer',fontFamily:'inherit',fontSize:10}}>{op.phase} ▾</button>
                            <span>Cmdr: {op.commander}</span><span>{op.startDate}{op.endDate?` → ${op.endDate}`:' → ongoing'}</span>
                        </div>
                    </div>
                    <div style={{display:'flex',gap:4}}><IBtn onClick={()=>setShowEditModal(true)} title="Edit">✏️</IBtn><IBtn onClick={()=>setShowDeleteConfirm(true)} title="Delete" color="#ef4444">🗑️</IBtn></div>
                    {op.riskLevel > 0 && <div className="op-header-extra" style={{textAlign:'center' as const}}><div style={{width:44,height:44,borderRadius:'50%',background:`conic-gradient(${op.riskLevel>70?'#ef4444':op.riskLevel>40?'#f59e0b':'#22c55e'} ${op.riskLevel*3.6}deg, ${theme.border}30 0deg)`,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:34,height:34,borderRadius:'50%',background:theme.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:op.riskLevel>70?'#ef4444':op.riskLevel>40?'#f59e0b':'#22c55e',fontFamily:"'JetBrains Mono',monospace"}}>{op.riskLevel}</div></div><div style={{fontSize:8,color:theme.textDim,marginTop:2}}>RISK</div></div>}
                </div>
                {/* Tabs */}
                <div style={{padding:'0 18px',borderBottom:`1px solid ${theme.border}`,display:'flex',gap:0,flexShrink:0,overflowX:'auto',scrollbarWidth:'none' as const}}>
                    {tabList.map(t=><button key={t.id} onClick={()=>{setTab(t.id);trigger();}} style={{padding:'9px 12px',border:'none',borderBottom:`2px solid ${tab===t.id?phaseColors[op.phase]:'transparent'}`,background:'transparent',color:tab===t.id?theme.text:theme.textDim,fontSize:11,fontWeight:tab===t.id?700:500,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap' as const}}><span style={{fontSize:13}}>{t.icon}</span><span className="op-tab-label">{t.label}</span></button>)}
                </div>
                <div className="op-scroll">
                    {loading && <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>{[0,1,2,3].map(i=><Skel key={i} w="24%" h={80}/>)}<Skel w="100%" h={100}/></div>}
                    {/* ═══ OVERVIEW ═══ */}
                    {!loading && tab==='overview' && <>
                        <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap' as const}}><SB c="#3b82f6" n={op.stats.events} l="Events"/><SB c="#ef4444" n={op.stats.alerts} l="Alerts"/><SB c="#22c55e" n={`${op.stats.hoursActive}h`} l="Active"/><SB c="#a855f7" n={op.stats.intel} l="Intel"/></div>
                        <div style={{marginBottom:14,padding:'12px 14px',borderRadius:8,background:`${theme.border}08`,border:`1px solid ${theme.border}`}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:11,fontWeight:700,color:theme.textDim}}>📝 Description</span><IBtn onClick={()=>setModal({type:'desc',data:op.description})} title="Edit">✏️</IBtn></div>
                            <div style={{fontSize:12,color:theme.textSecondary,lineHeight:1.7}}>{op.description||<span style={{color:theme.textDim,fontStyle:'italic'}}>No description</span>}</div>
                        </div>
                        <div style={{marginBottom:14}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}><div style={{fontSize:12,fontWeight:700,color:theme.text}}>📋 Checklist ({op.checklist.filter(c=>c.done).length}/{op.checklist.length})</div><AddB label="Add" onClick={()=>setModal({type:'ck-add'})}/></div>
                            {op.checklist.length>0&&<div style={{borderRadius:8,border:`1px solid ${theme.border}`,overflow:'hidden'}}>
                                {op.checklist.map(c=><div key={c.id} style={{padding:'8px 12px',borderBottom:`1px solid ${theme.border}06`,display:'flex',alignItems:'center',gap:10,fontSize:11}}>
                                    <div onClick={()=>upOp(o=>({...o,checklist:o.checklist.map(x=>x.id===c.id?{...x,done:!x.done}:x)}))} style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${c.done?'#22c55e':theme.border}`,background:c.done?'#22c55e15':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#22c55e',flexShrink:0,cursor:'pointer'}}>{c.done?'✓':''}</div>
                                    <span style={{color:c.done?theme.textDim:theme.text,textDecoration:c.done?'line-through':'none',flex:1}}>{c.label}</span>
                                    <span style={{fontSize:9,padding:'2px 6px',borderRadius:3,background:`${theme.border}30`,color:theme.textDim}}>{c.assignee}</span>
                                    <IBtn onClick={()=>setModal({type:'ck-edit',data:c})} title="Edit">✏️</IBtn>
                                    <IBtn onClick={()=>upOp(o=>({...o,checklist:o.checklist.filter(x=>x.id!==c.id)}))} title="Remove" color="#ef4444">✕</IBtn>
                                </div>)}
                            </div>}
                        </div>
                        <div style={{padding:'12px 14px',borderRadius:8,background:op.riskLevel>70?'#ef444404':'#f59e0b04',border:`1px solid ${op.riskLevel>70?'#ef4444':'#f59e0b'}15`}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:11,fontWeight:700,color:op.riskLevel>70?'#ef4444':'#f59e0b'}}>⚠️ Threat Assessment</span><IBtn onClick={()=>setModal({type:'threat',data:{text:op.threatAssessment,level:op.riskLevel}})} title="Edit">✏️</IBtn></div>
                            <div style={{fontSize:11,color:theme.textSecondary,lineHeight:1.6}}>{op.threatAssessment||<span style={{fontStyle:'italic',color:theme.textDim}}>No assessment</span>}</div>
                        </div>
                    </>}
                    {/* ═══ TARGETS ═══ */}
                    {!loading && tab==='targets' && <>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><div style={{fontSize:12,fontWeight:700,color:theme.text}}>🎯 Persons ({targets.length})</div><AddB label="Add Person" onClick={()=>setModal({type:'add-person'})}/></div>
                        <div className="op-grid-2" style={{marginBottom:14}}>{targets.map(p=>{if(!p)return null;const rc=prioColors[(p.risk as Priority)||'Medium'];return <div key={p.id} style={{padding:12,borderRadius:8,border:`1px solid ${theme.border}`,display:'flex',gap:10,alignItems:'center'}}>
                            <img src={p.avatar||undefined} alt="" style={{width:36,height:36,borderRadius:8,objectFit:'cover' as const,border:`1.5px solid ${rc}40`}}/>
                            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:theme.text}}>{p.firstName} {p.lastName}</div><div style={{fontSize:10,color:theme.textDim}}>{p.nationality} · <span style={{color:rc,fontWeight:600}}>{p.risk}</span></div></div>
                            <IBtn onClick={()=>upOp(o=>({...o,targetPersonIds:o.targetPersonIds.filter(id=>id!==p.id)}))} title="Remove" color="#ef4444">✕</IBtn>
                        </div>;})}</div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><div style={{fontSize:12,fontWeight:700,color:theme.text}}>🏢 Organizations ({targetOrgs.length})</div><AddB label="Add Org" onClick={()=>setModal({type:'add-org'})}/></div>
                        <div className="op-grid-2">{targetOrgs.map(o=>{if(!o)return null;return <div key={o.id} style={{padding:12,borderRadius:8,border:`1px solid ${theme.border}`,display:'flex',gap:10,alignItems:'center'}}>
                            <div style={{width:36,height:36,borderRadius:8,background:`${theme.accent}10`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🏢</div>
                            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:theme.text}}>{o.name}</div><div style={{fontSize:10,color:theme.textDim}}>{o.country}</div></div>
                            <IBtn onClick={()=>upOp(o2=>({...o2,targetOrgIds:o2.targetOrgIds.filter(id=>id!==o.id)}))} title="Remove" color="#ef4444">✕</IBtn>
                        </div>;})}</div>
                    </>}
                    {/* ═══ RESOURCES ═══ */}
                    {!loading && tab==='resources' && <>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}><div style={{fontSize:12,fontWeight:700,color:theme.text}}>📡 Devices ({devices.length})</div><AddB label="Add Device" onClick={()=>setModal({type:'add-device'})}/></div>
                        {devices.length>0&&<div style={{borderRadius:8,border:`1px solid ${theme.border}`,overflow:'hidden',marginBottom:14}}>{devices.map(d=>{if(!d)return null;return <div key={d.id} style={{padding:'10px 12px',borderBottom:`1px solid ${theme.border}06`,display:'flex',alignItems:'center',gap:10}}>
                            <span style={{fontSize:16}}>{deviceTypeIcons[d.type as keyof typeof deviceTypeIcons]||'📡'}</span>
                            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:theme.text}}>{d.name}</div><div style={{fontSize:9,color:theme.textDim}}>{d.type}</div></div>
                            <span style={{fontSize:9,fontWeight:700,color:d.status==='Online'?'#22c55e':'#ef4444'}}>{d.status}</span>
                            <IBtn onClick={()=>upOp(o=>({...o,deployedDeviceIds:o.deployedDeviceIds.filter(id=>id!==d.id)}))} title="Remove" color="#ef4444">✕</IBtn>
                        </div>;})}</div>}
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}><div style={{fontSize:12,fontWeight:700,color:theme.text}}>🚗 Vehicles ({vehicles.length})</div><AddB label="Add Vehicle" onClick={()=>setModal({type:'add-vehicle'})}/></div>
                        {vehicles.length>0&&<div style={{borderRadius:8,border:`1px solid ${theme.border}`,overflow:'hidden'}}>{vehicles.map(v=>{if(!v)return null;return <div key={v.id} style={{padding:'10px 12px',borderBottom:`1px solid ${theme.border}06`,display:'flex',alignItems:'center',gap:10}}>
                            <span style={{fontSize:16}}>🚗</span><div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:theme.text}}>{v.plate} — {v.make} {v.model}</div></div>
                            <IBtn onClick={()=>upOp(o=>({...o,trackedVehicleIds:o.trackedVehicleIds.filter(id=>id!==v.id)}))} title="Remove" color="#ef4444">✕</IBtn>
                        </div>;})}</div>}
                    </>}
                    {/* ═══ TEAMS ═══ */}
                    {!loading && tab==='teams' && <>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><div style={{fontSize:12,fontWeight:700,color:theme.text}}>👥 Teams ({op.teams.length})</div><AddB label="Add Team" onClick={()=>setModal({type:'team-add'})}/></div>
                        <div className="op-grid-2">{op.teams.map(t=><div key={t.id} style={{padding:14,borderRadius:10,border:`1px solid ${t.color}20`,background:`${t.color}04`}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                                <div style={{width:32,height:32,borderRadius:8,background:`${t.color}15`,border:`1px solid ${t.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{t.icon}</div>
                                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:theme.text}}>{t.name}</div><div style={{fontSize:10,color:theme.textDim}}>Lead: {t.lead}</div></div>
                                <IBtn onClick={()=>setModal({type:'team-edit',data:t})} title="Edit">✏️</IBtn>
                                <IBtn onClick={()=>upOp(o=>({...o,teams:o.teams.filter(x=>x.id!==t.id)}))} title="Remove" color="#ef4444">✕</IBtn>
                            </div>
                            {t.members.map(m=>{const p=mockPersons.find(pp=>pp.id===m.personId);return <div key={m.personId} style={{display:'flex',alignItems:'center',gap:6,padding:'3px 0',fontSize:10}}>
                                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,padding:'2px 5px',borderRadius:3,background:`${t.color}15`,color:t.color,fontWeight:700}}>{m.callsign}</span>
                                <span style={{color:theme.text,flex:1}}>{p?`${p.firstName} ${p.lastName}`:`#${m.personId}`}</span>
                                <span style={{color:theme.textDim}}>{m.role}</span>
                                <IBtn onClick={()=>upOp(o=>({...o,teams:o.teams.map(tt=>tt.id===t.id?{...tt,members:tt.members.filter(x=>x.personId!==m.personId)}:tt)}))} title="Remove" color="#ef4444">✕</IBtn>
                            </div>;})}
                            <button onClick={()=>setModal({type:'team-member',data:t})} style={{marginTop:6,padding:'4px 8px',borderRadius:4,border:`1px dashed ${t.color}30`,background:'transparent',color:t.color,fontSize:9,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>+ Add Member</button>
                        </div>)}{op.teams.length===0&&<div style={{gridColumn:'1/-1',padding:40,textAlign:'center' as const,color:theme.textDim}}>No teams</div>}</div>
                    </>}
                    {/* ═══ ZONES ═══ */}
                    {!loading && tab==='zones' && <>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><div style={{fontSize:12,fontWeight:700,color:theme.text}}>🗺️ Zones ({op.zones.length})</div><AddB label="Add Zone" onClick={()=>setModal({type:'zone-add'})}/></div>
                        <div className="op-grid-2">{op.zones.map(z=>{const ztc=z.type==='restricted'?'#ef4444':z.type==='staging'?'#f59e0b':z.type==='buffer'?'#06b6d4':'#22c55e';
                            return <div key={z.id} style={{padding:14,borderRadius:10,border:`1px solid ${ztc}20`,background:`${ztc}04`}}>
                                <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:6}}><div style={{width:10,height:10,borderRadius:3,background:ztc}}/><span style={{fontSize:12,fontWeight:700,color:theme.text,flex:1}}>{z.name}</span>
                                    <IBtn onClick={()=>setModal({type:'zone-edit',data:z})} title="Edit">✏️</IBtn>
                                    <IBtn onClick={()=>upOp(o=>({...o,zones:o.zones.filter(x=>x.id!==z.id)}))} title="Remove" color="#ef4444">✕</IBtn>
                                </div>
                                <div style={{fontSize:10,color:theme.textDim}}>Type: <span style={{color:ztc,fontWeight:600}}>{z.type}</span> · {z.lat.toFixed(3)}, {z.lng.toFixed(3)} · {z.radius}m</div>
                            </div>;})}{op.zones.length===0&&<div style={{gridColumn:'1/-1',padding:40,textAlign:'center' as const,color:theme.textDim}}>No zones</div>}</div>
                    </>}
                    {/* ═══ ALERTS ═══ */}
                    {!loading && tab==='alerts' && <>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><div style={{fontSize:12,fontWeight:700,color:theme.text}}>🚨 Alerts ({op.alertRules.length})</div><AddB label="Add Alert" onClick={()=>setModal({type:'alert-add'})}/></div>
                        {op.alertRules.length>0?<div style={{borderRadius:8,border:`1px solid ${theme.border}`,overflow:'hidden'}}>{op.alertRules.map(a=>{const ac=a.severity==='critical'?'#ef4444':a.severity==='high'?'#f97316':'#f59e0b';
                            return <div key={a.id} style={{padding:'10px 14px',borderBottom:`1px solid ${theme.border}06`,display:'flex',alignItems:'center',gap:10,opacity:a.enabled?1:0.4}}>
                                <div onClick={()=>upOp(o=>({...o,alertRules:o.alertRules.map(x=>x.id===a.id?{...x,enabled:!x.enabled}:x)}))} style={{width:8,height:8,borderRadius:'50%',background:a.enabled?ac:theme.textDim,cursor:'pointer'}}/>
                                <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:theme.text}}>{a.type}</div><div style={{fontSize:10,color:theme.textDim}}>{a.description}</div></div>
                                <span style={{fontSize:9,fontWeight:700,color:ac,padding:'2px 6px',borderRadius:3,background:`${ac}10`}}>{a.severity}</span>
                                <IBtn onClick={()=>setModal({type:'alert-edit',data:a})} title="Edit">✏️</IBtn>
                                <IBtn onClick={()=>upOp(o=>({...o,alertRules:o.alertRules.filter(x=>x.id!==a.id)}))} title="Remove" color="#ef4444">✕</IBtn>
                            </div>;})}</div>:<div style={{padding:40,textAlign:'center' as const,color:theme.textDim}}>No alerts</div>}
                    </>}
                    {/* ═══ TIMELINE ═══ */}
                    {!loading && tab==='timeline' && <div style={{paddingLeft:16}}>{op.timeline.map((e,i)=><div key={e.id} style={{display:'flex',gap:14,position:'relative' as const,paddingBottom:18}}>
                        {i<op.timeline.length-1&&<div style={{position:'absolute' as const,left:6,top:16,bottom:-2,width:2,background:`${e.color}30`}}/>}
                        <div style={{width:14,height:14,borderRadius:'50%',background:`${e.color}20`,border:`2px solid ${e.color}`,flexShrink:0,marginTop:2,zIndex:1}}/>
                        <div><div style={{fontSize:10,fontWeight:700,color:e.color,fontFamily:"'JetBrains Mono',monospace"}}>{e.date}</div><div style={{fontSize:12,color:theme.text,marginTop:3}}>{e.label}</div><span style={{fontSize:9,padding:'2px 6px',borderRadius:3,background:`${e.color}10`,color:e.color,fontWeight:600}}>{e.type}</span></div>
                    </div>)}{op.timeline.length===0&&<div style={{padding:40,textAlign:'center' as const,color:theme.textDim}}>No timeline</div>}</div>}
                    {/* ═══ BRIEFING ═══ */}
                    {!loading && tab==='briefing' && <>
                        <div style={{display:'flex',gap:8,marginBottom:14}}>{[{l:'Comms',v:op.commsChannel},{l:'Frequency',v:op.commsFreq}].map(r=><div key={r.l} style={{flex:1,padding:'12px 14px',borderRadius:8,border:`1px solid ${theme.border}`}}><div style={{fontSize:10,color:theme.textDim,marginBottom:3}}>{r.l}</div><div style={{fontSize:12,fontWeight:700,color:theme.text,fontFamily:"'JetBrains Mono',monospace"}}>{r.v}</div></div>)}</div>
                        <div style={{padding:'14px 16px',borderRadius:8,background:`${theme.border}08`,border:`1px solid ${theme.border}`,marginBottom:10}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                                <div style={{fontSize:11,fontWeight:700,color:theme.text}}>📝 Briefing Notes</div>
                                <div style={{display:'flex',gap:4}}><IBtn onClick={()=>setModal({type:'briefing-edit',data:op.briefingNotes})} title="Edit">✏️</IBtn><IBtn onClick={()=>upOp(o=>({...o,briefingNotes:''}))} title="Clear" color="#ef4444">✕</IBtn></div>
                            </div>
                            <div style={{fontSize:12,color:theme.textSecondary,lineHeight:1.7,whiteSpace:'pre-wrap' as const}}>{op.briefingNotes||<span style={{fontStyle:'italic',color:theme.textDim}}>No briefing</span>}</div>
                        </div>
                        <button onClick={genAI} disabled={aiGen} style={{width:'100%',padding:'10px',borderRadius:6,border:`1px solid ${aiGen?theme.border:'#a855f7'}30`,background:aiGen?`${theme.border}10`:'#a855f708',color:aiGen?theme.textDim:'#a855f7',fontSize:12,fontWeight:700,cursor:aiGen?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                            {aiGen?<><div className="op-skeleton" style={{width:14,height:14,borderRadius:'50%'}}/> Generating...</>:<>🤖 Generate AI Briefing</>}
                        </button>
                    </>}
                </div>
            </div>
            {/* ═══ MODALS ═══ */}
            {showNewModal&&<Modal title="New Operation" icon="🎯" onClose={()=>setShowNewModal(false)}>
                <div style={{display:'flex',gap:10,marginBottom:14}}><div style={{flex:1}}><FL>Codename *</FL><FI value={newForm.codename} onChange={(e:any)=>setNewForm(f=>({...f,codename:e.target.value.toUpperCase()}))} placeholder="TEMPEST" style={{color:'#ef4444',fontFamily:"'JetBrains Mono',monospace",fontWeight:800}}/></div><div style={{flex:2}}><FL>Name *</FL><FI value={newForm.name} onChange={(e:any)=>setNewForm(f=>({...f,name:e.target.value}))} placeholder="Maritime Intercept"/></div></div>
                <div style={{marginBottom:14}}><FL>Description</FL><FT value={newForm.description} onChange={(e:any)=>setNewForm(f=>({...f,description:e.target.value}))} rows={3}/></div>
                <div style={{display:'flex',gap:10,marginBottom:14}}><div style={{flex:1}}><FL>Priority</FL><FS value={newForm.priority} onChange={(e:any)=>setNewForm(f=>({...f,priority:e.target.value}))}>{['Critical','High','Medium','Low'].map(p=><option key={p}>{p}</option>)}</FS></div><div style={{flex:1}}><FL>Classification</FL><FS value={newForm.classification} onChange={(e:any)=>setNewForm(f=>({...f,classification:e.target.value}))}>{['SECRET','TOP SECRET','TOP SECRET // NOFORN','CONFIDENTIAL'].map(c=><option key={c}>{c}</option>)}</FS></div></div>
                <div style={{marginBottom:18}}><FL>Commander</FL><FI value={newForm.commander} onChange={(e:any)=>setNewForm(f=>({...f,commander:e.target.value}))} placeholder="Col. Tomić"/></div>
                <div style={{display:'flex',gap:8}}><BtnC onClick={()=>setShowNewModal(false)}/><BtnP onClick={handleCreate} disabled={!newForm.codename||!newForm.name}>🎯 Create</BtnP></div>
            </Modal>}
            {showEditModal&&<Modal title="Edit Operation" icon="✏️" onClose={()=>setShowEditModal(false)}>
                <div style={{display:'flex',gap:10,marginBottom:14}}><div style={{flex:1}}><FL>Codename</FL><FI value={op.codename} onChange={(e:any)=>upOp(o=>({...o,codename:e.target.value.toUpperCase()}))} style={{color:'#ef4444',fontFamily:"'JetBrains Mono',monospace",fontWeight:800}}/></div><div style={{flex:2}}><FL>Name</FL><FI value={op.name} onChange={(e:any)=>upOp(o=>({...o,name:e.target.value}))}/></div></div>
                <div style={{display:'flex',gap:10,marginBottom:14}}><div style={{flex:1}}><FL>Priority</FL><FS value={op.priority} onChange={(e:any)=>upOp(o=>({...o,priority:e.target.value}))}>{['Critical','High','Medium','Low'].map(p=><option key={p}>{p}</option>)}</FS></div><div style={{flex:1}}><FL>Classification</FL><FS value={op.classification} onChange={(e:any)=>upOp(o=>({...o,classification:e.target.value}))}>{['SECRET','TOP SECRET','TOP SECRET // NOFORN','CONFIDENTIAL'].map(c=><option key={c}>{c}</option>)}</FS></div></div>
                <div style={{display:'flex',gap:10,marginBottom:14}}><div style={{flex:1}}><FL>Commander</FL><FI value={op.commander} onChange={(e:any)=>upOp(o=>({...o,commander:e.target.value}))}/></div></div>
                <div style={{display:'flex',gap:10,marginBottom:18}}><div style={{flex:1}}><FL>Comms</FL><FI value={op.commsChannel} onChange={(e:any)=>upOp(o=>({...o,commsChannel:e.target.value}))}/></div><div style={{flex:1}}><FL>Freq</FL><FI value={op.commsFreq} onChange={(e:any)=>upOp(o=>({...o,commsFreq:e.target.value}))}/></div></div>
                <div style={{display:'flex',gap:8}}><BtnC onClick={()=>setShowEditModal(false)}/><BtnP onClick={()=>{setShowEditModal(false);trigger();}} color="#3b82f6">💾 Save</BtnP></div>
            </Modal>}
            {showDeleteConfirm&&<Modal title="Delete Operation" icon="🗑️" onClose={()=>setShowDeleteConfirm(false)} width={400}>
                <div style={{fontSize:13,color:theme.textSecondary,lineHeight:1.7,marginBottom:18}}>Delete <strong style={{color:'#ef4444'}}>{op.codename}</strong>? This cannot be undone.</div>
                <div style={{display:'flex',gap:8}}><BtnC onClick={()=>setShowDeleteConfirm(false)}/><BtnP onClick={handleDelete}>🗑️ Delete</BtnP></div>
            </Modal>}
            {showPhaseModal&&<Modal title="Change Status" icon="🔄" onClose={()=>setShowPhaseModal(false)} width={420}>
                <div style={{fontSize:11,color:theme.textDim,marginBottom:14}}>Current: <strong style={{color:phaseColors[op.phase]}}>{op.phase}</strong></div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:18}}>{allPhases.map(p=>{const on=op.phase===p;return <button key={p} onClick={()=>handlePhase(p)} style={{padding:'12px 4px',borderRadius:8,border:`2px solid ${on?phaseColors[p]:theme.border}`,background:on?`${phaseColors[p]}10`:'transparent',cursor:'pointer',fontFamily:'inherit',textAlign:'center' as const}}><div style={{fontSize:22}}>{phaseIcons[p]}</div><div style={{fontSize:10,fontWeight:700,color:on?phaseColors[p]:theme.textDim,marginTop:4}}>{p}</div></button>;})}</div>
            </Modal>}
            {modal?.type==='desc'&&<Modal title="Edit Description" icon="📝" onClose={()=>setModal(null)}><FT id="md-desc" defaultValue={modal.data} rows={5}/><div style={{display:'flex',gap:8,marginTop:14}}><BtnC onClick={()=>setModal(null)}/><BtnP onClick={()=>{upOp(o=>({...o,description:(document.getElementById('md-desc') as HTMLTextAreaElement)?.value||''}));setModal(null);trigger();}} color="#3b82f6">💾 Save</BtnP></div></Modal>}
            {modal?.type==='threat'&&<Modal title="Threat Assessment" icon="⚠️" onClose={()=>setModal(null)}><div style={{marginBottom:14}}><FL>Risk Level (0-100)</FL><FI id="md-rl" type="number" min={0} max={100} defaultValue={modal.data?.level}/></div><div style={{marginBottom:14}}><FL>Assessment</FL><FT id="md-ta" defaultValue={modal.data?.text} rows={4}/></div><div style={{display:'flex',gap:8}}><BtnC onClick={()=>setModal(null)}/><BtnP onClick={()=>{upOp(o=>({...o,riskLevel:parseInt((document.getElementById('md-rl') as HTMLInputElement)?.value)||0,threatAssessment:(document.getElementById('md-ta') as HTMLTextAreaElement)?.value||''}));setModal(null);trigger();}} color="#f59e0b">⚠️ Save</BtnP></div></Modal>}
            {(modal?.type==='ck-add'||modal?.type==='ck-edit')&&(()=>{const isE=modal.type==='ck-edit';const d=modal.data as Checklist|undefined;return <Modal title={isE?'Edit Item':'Add Item'} icon="📋" onClose={()=>setModal(null)} width={420}><div style={{marginBottom:14}}><FL>Task</FL><FI id="md-ckl" defaultValue={d?.label||''} placeholder="Deploy GPS trackers"/></div><div style={{marginBottom:18}}><FL>Assignee</FL><FI id="md-cka" defaultValue={d?.assignee||''} placeholder="Bravo"/></div><div style={{display:'flex',gap:8}}><BtnC onClick={()=>setModal(null)}/><BtnP onClick={()=>{const l=(document.getElementById('md-ckl') as HTMLInputElement)?.value||'';const a=(document.getElementById('md-cka') as HTMLInputElement)?.value||'';if(!l)return;if(isE&&d)upOp(o=>({...o,checklist:o.checklist.map(c=>c.id===d.id?{...c,label:l,assignee:a}:c)}));else upOp(o=>({...o,checklist:[...o.checklist,{id:nid(),label:l,assignee:a,done:false}]}));setModal(null);trigger();}} color="#22c55e">{isE?'💾 Save':'+ Add'}</BtnP></div></Modal>;})()}
            {modal?.type==='add-person'&&<Modal title="Add Person" icon="🎯" onClose={()=>setModal(null)} width={420}><div style={{maxHeight:300,overflowY:'auto',borderRadius:8,border:`1px solid ${theme.border}`}}>{mockPersons.filter(p=>!op.targetPersonIds.includes(p.id)).map(p=><div key={p.id} onClick={()=>{upOp(o=>({...o,targetPersonIds:[...o.targetPersonIds,p.id]}));setModal(null);trigger();}} style={{padding:'8px 12px',borderBottom:`1px solid ${theme.border}06`,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><img src={p.avatar||undefined} alt="" style={{width:28,height:28,borderRadius:6,objectFit:'cover' as const}}/><span style={{fontSize:12,color:theme.text,fontWeight:600}}>{p.firstName} {p.lastName}</span><span style={{fontSize:9,color:prioColors[(p.risk as Priority)||'Medium'],marginLeft:'auto'}}>{p.risk}</span></div>)}</div></Modal>}
            {modal?.type==='add-org'&&<Modal title="Add Organization" icon="🏢" onClose={()=>setModal(null)} width={420}><div style={{maxHeight:300,overflowY:'auto',borderRadius:8,border:`1px solid ${theme.border}`}}>{mockOrganizations.filter(o=>!op.targetOrgIds.includes(o.id)).map(o=><div key={o.id} onClick={()=>{upOp(o2=>({...o2,targetOrgIds:[...o2.targetOrgIds,o.id]}));setModal(null);trigger();}} style={{padding:'8px 12px',borderBottom:`1px solid ${theme.border}06`,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><span style={{fontSize:16}}>🏢</span><span style={{fontSize:12,color:theme.text,fontWeight:600}}>{o.name}</span><span style={{fontSize:9,color:theme.textDim,marginLeft:'auto'}}>{o.country}</span></div>)}</div></Modal>}
            {modal?.type==='add-device'&&<Modal title="Add Device" icon="📡" onClose={()=>setModal(null)} width={420}><div style={{maxHeight:300,overflowY:'auto',borderRadius:8,border:`1px solid ${theme.border}`}}>{mockDevices.filter(d=>!op.deployedDeviceIds.includes(d.id)).map(d=><div key={d.id} onClick={()=>{upOp(o=>({...o,deployedDeviceIds:[...o.deployedDeviceIds,d.id]}));setModal(null);trigger();}} style={{padding:'8px 12px',borderBottom:`1px solid ${theme.border}06`,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><span style={{fontSize:14}}>{deviceTypeIcons[d.type as keyof typeof deviceTypeIcons]||'📡'}</span><span style={{fontSize:12,color:theme.text,fontWeight:600}}>{d.name}</span><span style={{fontSize:9,color:theme.textDim,marginLeft:'auto'}}>{d.type}</span></div>)}</div></Modal>}
            {modal?.type==='add-vehicle'&&<Modal title="Add Vehicle" icon="🚗" onClose={()=>setModal(null)} width={420}><div style={{maxHeight:300,overflowY:'auto',borderRadius:8,border:`1px solid ${theme.border}`}}>{mockVehicles.filter(v=>!op.trackedVehicleIds.includes(v.id)).map(v=><div key={v.id} onClick={()=>{upOp(o=>({...o,trackedVehicleIds:[...o.trackedVehicleIds,v.id]}));setModal(null);trigger();}} style={{padding:'8px 12px',borderBottom:`1px solid ${theme.border}06`,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><span style={{fontSize:14}}>🚗</span><span style={{fontSize:12,color:theme.text,fontWeight:600}}>{v.plate} — {v.make} {v.model}</span></div>)}</div></Modal>}
            {(modal?.type==='zone-add'||modal?.type==='zone-edit')&&(()=>{const isE=modal.type==='zone-edit';const d=modal.data as OpZone|undefined;return <Modal title={isE?'Edit Zone':'Add Zone'} icon="🗺️" onClose={()=>setModal(null)} width={420}><div style={{marginBottom:14}}><FL>Name</FL><FI id="md-zn" defaultValue={d?.name||''} placeholder="Port Perimeter"/></div><div style={{display:'flex',gap:10,marginBottom:14}}><div style={{flex:1}}><FL>Type</FL><FS id="md-zt" defaultValue={d?.type||'surveillance'}><option value="surveillance">Surveillance</option><option value="restricted">Restricted</option><option value="staging">Staging</option><option value="buffer">Buffer</option></FS></div><div style={{flex:1}}><FL>Radius (m)</FL><FI id="md-zr" type="number" defaultValue={d?.radius||200}/></div></div><div style={{display:'flex',gap:10,marginBottom:18}}><div style={{flex:1}}><FL>Lat</FL><FI id="md-zla" type="number" step="0.001" defaultValue={d?.lat||45.813}/></div><div style={{flex:1}}><FL>Lng</FL><FI id="md-zlo" type="number" step="0.001" defaultValue={d?.lng||15.977}/></div></div><div style={{display:'flex',gap:8}}><BtnC onClick={()=>setModal(null)}/><BtnP onClick={()=>{const n=(document.getElementById('md-zn') as HTMLInputElement)?.value||'';if(!n)return;const z:OpZone={id:isE?d!.id:nid(),name:n,type:(document.getElementById('md-zt') as HTMLSelectElement)?.value as any,lat:parseFloat((document.getElementById('md-zla') as HTMLInputElement)?.value)||45.813,lng:parseFloat((document.getElementById('md-zlo') as HTMLInputElement)?.value)||15.977,radius:parseInt((document.getElementById('md-zr') as HTMLInputElement)?.value)||200};if(isE)upOp(o=>({...o,zones:o.zones.map(x=>x.id===d!.id?z:x)}));else upOp(o=>({...o,zones:[...o.zones,z]}));setModal(null);trigger();}} color="#22c55e">{isE?'💾 Save':'+ Add'}</BtnP></div></Modal>;})()}
            {(modal?.type==='alert-add'||modal?.type==='alert-edit')&&(()=>{const isE=modal.type==='alert-edit';const d=modal.data as AlertRule|undefined;return <Modal title={isE?'Edit Alert':'Add Alert'} icon="🚨" onClose={()=>setModal(null)} width={420}><div style={{marginBottom:14}}><FL>Type</FL><FS id="md-at" defaultValue={d?.type||'Zone Entry'}><option>Zone Entry</option><option>Zone Exit</option><option>Co-location</option><option>Face Match</option><option>LPR Match</option><option>Signal Lost</option><option>Speed Alert</option></FS></div><div style={{marginBottom:14}}><FL>Description</FL><FI id="md-ad" defaultValue={d?.description||''} placeholder="Target enters zone"/></div><div style={{marginBottom:18}}><FL>Severity</FL><FS id="md-as" defaultValue={d?.severity||'high'}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option></FS></div><div style={{display:'flex',gap:8}}><BtnC onClick={()=>setModal(null)}/><BtnP onClick={()=>{const desc=(document.getElementById('md-ad') as HTMLInputElement)?.value||'';if(!desc)return;const r:AlertRule={id:isE?d!.id:nid(),type:(document.getElementById('md-at') as HTMLSelectElement)?.value||'Zone Entry',description:desc,severity:(document.getElementById('md-as') as HTMLSelectElement)?.value as any,enabled:isE?d!.enabled:true};if(isE)upOp(o=>({...o,alertRules:o.alertRules.map(a=>a.id===d!.id?r:a)}));else upOp(o=>({...o,alertRules:[...o.alertRules,r]}));setModal(null);trigger();}} color="#ef4444">{isE?'💾 Save':'+ Add'}</BtnP></div></Modal>;})()}
            {(modal?.type==='team-add'||modal?.type==='team-edit')&&(()=>{const isE=modal.type==='team-edit';const d=modal.data as Team|undefined;return <Modal title={isE?'Edit Team':'Add Team'} icon="👥" onClose={()=>setModal(null)} width={460}><div style={{marginBottom:14}}><FL>Name</FL><FI id="md-tn" defaultValue={d?.name||''} placeholder="Alpha — Ground Surveillance"/></div><div style={{marginBottom:18}}><FL>Lead</FL><FI id="md-tl" defaultValue={d?.lead||''} placeholder="Cpt. Horvat"/></div><div style={{display:'flex',gap:8}}><BtnC onClick={()=>setModal(null)}/><BtnP onClick={()=>{const n=(document.getElementById('md-tn') as HTMLInputElement)?.value||'';if(!n)return;const l=(document.getElementById('md-tl') as HTMLInputElement)?.value||'';const t:Team={id:isE?d!.id:nid(),name:n,icon:d?.icon||'🏃',color:d?.color||'#3b82f6',lead:l,members:isE?d!.members:[]};if(isE)upOp(o=>({...o,teams:o.teams.map(x=>x.id===d!.id?t:x)}));else upOp(o=>({...o,teams:[...o.teams,t]}));setModal(null);trigger();}} color="#3b82f6">{isE?'💾 Save':'+ Add'}</BtnP></div></Modal>;})()}
            {modal?.type==='team-member'&&(()=>{const t=modal.data as Team;return <Modal title={`Add to ${t.name}`} icon="👤" onClose={()=>setModal(null)} width={420}><div style={{maxHeight:260,overflowY:'auto',borderRadius:8,border:`1px solid ${theme.border}`}}>{mockPersons.filter(p=>!t.members.find(m=>m.personId===p.id)).map(p=><div key={p.id} onClick={()=>{upOp(o=>({...o,teams:o.teams.map(tt=>tt.id===t.id?{...tt,members:[...tt.members,{personId:p.id,role:'Operative',callsign:`${t.name.charAt(0)}-${p.id}`}]}:tt)}));setModal(null);trigger();}} style={{padding:'8px 12px',borderBottom:`1px solid ${theme.border}06`,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><img src={p.avatar||undefined} alt="" style={{width:24,height:24,borderRadius:5,objectFit:'cover' as const}}/><span style={{fontSize:12,color:theme.text}}>{p.firstName} {p.lastName}</span></div>)}</div></Modal>;})()}
            {modal?.type==='briefing-edit'&&<Modal title="Edit Briefing" icon="📝" onClose={()=>setModal(null)}><FT id="md-brief" defaultValue={modal.data||''} rows={10} placeholder="Briefing notes..."/><div style={{display:'flex',gap:8,marginTop:14}}><BtnC onClick={()=>setModal(null)}/><BtnP onClick={()=>{upOp(o=>({...o,briefingNotes:(document.getElementById('md-brief') as HTMLTextAreaElement)?.value||''}));setModal(null);trigger();}} color="#3b82f6">💾 Save</BtnP></div></Modal>}
            {showShortcuts&&<Modal title="Shortcuts" icon="⌨️" onClose={()=>setShowShortcuts(false)} width={340}>{keyboardShortcuts.map(s=><div key={s.key} style={{display:'flex',alignItems:'center',gap:14,padding:'9px 0',borderBottom:`1px solid ${theme.border}08`}}><span className="op-kbd" style={{minWidth:56,textAlign:'center' as const,fontSize:11,height:22,padding:'0 8px'}}>{s.key}</span><span style={{fontSize:13,color:theme.textSecondary}}>{s.description}</span></div>)}</Modal>}
        </div>
    </>);
}
OperationsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default OperationsIndex;
