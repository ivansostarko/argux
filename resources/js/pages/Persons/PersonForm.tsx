import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Input, Button, Icons } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { theme } from '../../lib/theme';
import { risks, riskColors, genders, nationalities, countries, allLanguages, generateId, type Person, type PersonEmail, type PersonPhone, type PersonAddress, type PersonNote, type Risk } from '../../mock/persons';

/* ═══ HELPERS ═══ */
const Label = ({ children }: { children: string }) => <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.textSecondary, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{children}</label>;
const SelectField = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) => <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>{placeholder && <option value="">{placeholder}</option>}{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
const SearchSelect = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) => {
    const [open, setOpen] = useState(false); const [search, setSearch] = useState('');
    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
    return <div style={{ position: 'relative' }}>
        <button onClick={() => { setOpen(!open); setSearch(''); }} style={{ width: '100%', padding: '10px 14px', background: theme.bgInput, color: value ? theme.text : theme.textDim, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, display: 'flex', justifyContent: 'space-between' }}><span>{value || placeholder}</span><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4"/></svg></button>
        {open && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#0d1220', border: `1px solid ${theme.border}`, borderRadius: 8, zIndex: 50, maxHeight: 220, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '6px 8px', borderBottom: `1px solid ${theme.border}` }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." autoFocus style={{ width: '100%', padding: '6px 8px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} /></div>
            <div style={{ overflowY: 'auto', flex: 1 }}>{filtered.slice(0, 80).map(o => <div key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ padding: '7px 10px', cursor: 'pointer', fontSize: 13, color: value === o ? theme.accent : theme.text }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{o}</div>)}</div>
        </div>}
    </div>;
};
const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px dashed ${theme.border}`, borderRadius: 8, padding: '10px 16px', cursor: 'pointer', color: theme.accent, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', width: '100%', justifyContent: 'center', transition: 'all 0.15s' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>{label}</button>;
const RemoveBtn = ({ onClick }: { onClick: () => void }) => <button onClick={onClick} style={{ background: theme.dangerDim, border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: theme.danger, display: 'flex', fontSize: 10, fontWeight: 600, fontFamily: 'inherit', alignItems: 'center', gap: 4 }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>Remove</button>;
const Card = ({ children }: { children: React.ReactNode }) => <div style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>{children}</div>;

type FormTab = 'basic' | 'contacts' | 'social' | 'address' | 'notes';

interface PersonFormProps { person?: Person; mode: 'create' | 'edit'; }

export default function PersonForm({ person, mode }: PersonFormProps) {
    const toast = useToast();
    const [tab, setTab] = useState<FormTab>('basic');
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(person?.avatar || null);

    // Basic
    const [firstName, setFirstName] = useState(person?.firstName || '');
    const [lastName, setLastName] = useState(person?.lastName || '');
    const [middleName, setMiddleName] = useState(person?.middleName || '');
    const [nickname, setNickname] = useState(person?.nickname || '');
    const [dob, setDob] = useState(person?.dob || '');
    const [gender, setGender] = useState(person?.gender || '');
    const [nationality, setNationality] = useState(person?.nationality || '');
    const [risk, setRisk] = useState<string>(person?.risk || '');
    const [taxNumber, setTaxNumber] = useState(person?.taxNumber || '');

    // Contacts
    const [emails, setEmails] = useState<PersonEmail[]>(person?.emails || []);
    const [phones, setPhones] = useState<PersonPhone[]>(person?.phones || []);

    // Social
    const platforms = ['Facebook', 'LinkedIn', 'Instagram', 'TikTok', 'Snapchat', 'YouTube'];
    const [socials, setSocials] = useState<Record<string, { id: string; url: string }[]>>(
        Object.fromEntries(platforms.map(p => [p, person?.socials.find(s => s.platform === p)?.profiles || []]))
    );

    // Addresses
    const [addresses, setAddresses] = useState<PersonAddress[]>(person?.addresses || []);

    // Notes
    const [notes, setNotes] = useState<PersonNote[]>(person?.notes || []);
    const [newNote, setNewNote] = useState('');
    const [editingNote, setEditingNote] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setAvatar(r.result as string); r.readAsDataURL(f); } };

    const handleSave = () => {
        if (!firstName || !lastName) { toast.error('Validation error', 'First name and last name are required.'); return; }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success(mode === 'create' ? 'Person created' : 'Person updated', `${firstName} ${lastName} has been ${mode === 'create' ? 'added to' : 'updated in'} the database.`);
            if (mode === 'create') router.visit('/persons');
        }, 1200);
    };

    const tabs: { id: FormTab; label: string }[] = [
        { id: 'basic', label: 'Basic Info' }, { id: 'contacts', label: 'Contacts' },
        { id: 'social', label: 'Social Media' }, { id: 'address', label: 'Addresses' }, { id: 'notes', label: 'Notes' },
    ];

    return (
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>{mode === 'create' ? 'Add New Person' : `Edit: ${person?.firstName} ${person?.lastName}`}</h1>
                    <p style={{ fontSize: 13, color: theme.textSecondary, margin: 0 }}>Fill in subject information across all tabs.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" onClick={() => router.visit('/persons')} style={{ width: 'auto', padding: '10px 20px' }}>Cancel</Button>
                    <Button onClick={handleSave} loading={loading} style={{ width: 'auto', padding: '10px 24px' }}>{mode === 'create' ? 'Create Person' : 'Save Changes'}</Button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: `1px solid ${theme.border}`, overflowX: 'auto', scrollbarWidth: 'none' as const }}>
                {tabs.map(t => { const active = tab === t.id; return <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${active ? theme.accent : 'transparent'}`, padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', color: active ? theme.text : theme.textSecondary, fontSize: 13, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{t.label}</button>; })}
            </div>

            {/* TAB: Basic Info */}
            {tab === 'basic' && (
                <div style={{ animation: 'argux-fadeIn 0.2s ease-out' }}>
                    {/* Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: avatar ? 'transparent' : `linear-gradient(135deg, ${theme.accent}, ${theme.accent}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${theme.border}` }}>
                                {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{firstName?.[0] || '?'}{lastName?.[0] || '?'}</span>}
                            </div>
                            <label style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `2px solid ${theme.bg}` }}>
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 2l2 2-8 8H4v-2z"/></svg>
                                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                            </label>
                        </div>
                        <div style={{ fontSize: 12, color: theme.textSecondary }}>Upload a profile photo.<br/>JPG, PNG, max 5MB.</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 0, columnGap: 16 }}>
                        <Input label="First Name *" value={firstName} onChange={e => setFirstName(e.target.value)} icon={Icons.user()} placeholder="First name" />
                        <Input label="Last Name *" value={lastName} onChange={e => setLastName(e.target.value)} icon={Icons.user()} placeholder="Last name" />
                        <Input label="Middle Name" value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="Middle name" />
                        <Input label="Nickname" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Alias or callsign" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
                        <div><Label>Date of Birth</Label><input type="date" value={dob} onChange={e => setDob(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' as any }} /></div>
                        <div><Label>Gender</Label><SelectField value={gender} onChange={setGender} options={genders.map(g => ({ value: g, label: g }))} placeholder="Select gender" /></div>
                        <div><Label>Nationality</Label><SearchSelect value={nationality} onChange={setNationality} options={nationalities} placeholder="Select nationality" /></div>
                        <div><Label>Risk Level</Label><SelectField value={risk} onChange={setRisk} options={risks.map(r => ({ value: r, label: r }))} placeholder="Select risk" /></div>
                    </div>
                    <Input label="Tax Number" value={taxNumber} onChange={e => setTaxNumber(e.target.value)} placeholder="Tax identification number" />
                </div>
            )}

            {/* TAB: Contacts */}
            {tab === 'contacts' && (
                <div style={{ animation: 'argux-fadeIn 0.2s ease-out' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 12 }}>Email Addresses</h3>
                    {emails.map((em, i) => (
                        <Card key={em.id}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 200 }}><input value={em.email} onChange={e => { const n = [...emails]; n[i] = { ...n[i], email: e.target.value }; setEmails(n); }} placeholder="email@example.com" style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                                <div style={{ flex: 1, minWidth: 150 }}><input value={em.notes} onChange={e => { const n = [...emails]; n[i] = { ...n[i], notes: e.target.value }; setEmails(n); }} placeholder="Notes (e.g. Primary, Work)" style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                                <RemoveBtn onClick={() => setEmails(emails.filter((_, j) => j !== i))} />
                            </div>
                        </Card>
                    ))}
                    <AddBtn onClick={() => setEmails([...emails, { id: generateId(), email: '', notes: '' }])} label="Add Email" />

                    <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.text, margin: '24px 0 12px' }}>Phone Numbers</h3>
                    {phones.map((ph, i) => (
                        <Card key={ph.id}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 10 }}>
                                <div style={{ flex: 1, minWidth: 200 }}><input value={ph.number} onChange={e => { const n = [...phones]; n[i] = { ...n[i], number: e.target.value }; setPhones(n); }} placeholder="+1 234 567 8900" style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: 'none' }} /></div>
                                <div style={{ flex: 1, minWidth: 150 }}><input value={ph.notes} onChange={e => { const n = [...phones]; n[i] = { ...n[i], notes: e.target.value }; setPhones(n); }} placeholder="Notes" style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                                <RemoveBtn onClick={() => setPhones(phones.filter((_, j) => j !== i))} />
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {(['WhatsApp', 'WeChat', 'Telegram', 'Signal', 'Viber'] as const).map(app => {
                                    const key = `is${app}` as keyof PersonPhone;
                                    const checked = ph[key] as boolean;
                                    return <label key={app} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: checked ? theme.accent : theme.textDim }}>
                                        <div onClick={() => { const n = [...phones]; (n[i] as any)[key] = !checked; setPhones(n); }} style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${checked ? theme.accent : theme.border}`, background: checked ? theme.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{checked && <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polyline points="2,5 4.5,7.5 8,3"/></svg>}</div>
                                        {app}
                                    </label>;
                                })}
                            </div>
                        </Card>
                    ))}
                    <AddBtn onClick={() => setPhones([...phones, { id: generateId(), number: '', notes: '', isWhatsApp: false, isWeChat: false, isTelegram: false, isSignal: false, isViber: false }])} label="Add Phone Number" />
                </div>
            )}

            {/* TAB: Social Media */}
            {tab === 'social' && (
                <div style={{ animation: 'argux-fadeIn 0.2s ease-out' }}>
                    {platforms.map(platform => (
                        <div key={platform} style={{ marginBottom: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 24, height: 24, borderRadius: 6, background: theme.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                                    {platform[0]}
                                </span>
                                {platform}
                            </h3>
                            {(socials[platform] || []).map((profile, i) => (
                                <div key={profile.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <input value={profile.url} onChange={e => { const n = { ...socials }; n[platform] = [...n[platform]]; n[platform][i] = { ...n[platform][i], url: e.target.value }; setSocials(n); }} placeholder={`https://${platform.toLowerCase()}.com/username`} style={{ flex: 1, padding: '8px 12px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                                    <RemoveBtn onClick={() => { const n = { ...socials }; n[platform] = n[platform].filter((_, j) => j !== i); setSocials(n); }} />
                                </div>
                            ))}
                            <AddBtn onClick={() => { const n = { ...socials }; n[platform] = [...(n[platform] || []), { id: generateId(), url: '' }]; setSocials(n); }} label={`Add ${platform} Profile`} />
                        </div>
                    ))}
                </div>
            )}

            {/* TAB: Addresses */}
            {tab === 'address' && (
                <div style={{ animation: 'argux-fadeIn 0.2s ease-out' }}>
                    {addresses.map((addr, i) => (
                        <Card key={addr.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary }}>Address #{i + 1}</span>
                                <RemoveBtn onClick={() => setAddresses(addresses.filter((_, j) => j !== i))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                                {[['address','Street','Address'],['addressNumber','Number','No.'],['zipCode','Zip Code','Zip'],['city','City','City'],['country','Country','Country']].map(([key, label, ph]) => (
                                    <div key={key}><Label>{label}</Label><input value={(addr as any)[key]} onChange={e => { const n = [...addresses]; (n[i] as any)[key] = e.target.value; setAddresses(n); }} placeholder={ph} style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                                ))}
                            </div>
                            <div style={{ marginTop: 10 }}><Label>Notes</Label><input value={addr.notes} onChange={e => { const n = [...addresses]; n[i] = { ...n[i], notes: e.target.value }; setAddresses(n); }} placeholder="e.g. Home, Office, Safe house" style={{ width: '100%', padding: '8px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div>
                        </Card>
                    ))}
                    <AddBtn onClick={() => setAddresses([...addresses, { id: generateId(), address: '', addressNumber: '', zipCode: '', city: '', country: '', notes: '' }])} label="Add Address" />
                </div>
            )}

            {/* TAB: Notes */}
            {tab === 'notes' && (
                <div style={{ animation: 'argux-fadeIn 0.2s ease-out' }}>
                    <div style={{ marginBottom: 20 }}>
                        <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a new note about this person..." rows={3} style={{ width: '100%', padding: '12px 14px', background: theme.bgInput, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
                        <Button onClick={() => { if (newNote.trim()) { setNotes([{ id: generateId(), text: newNote.trim(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...notes]); setNewNote(''); toast.success('Note added'); } }} disabled={!newNote.trim()} style={{ width: 'auto', padding: '8px 20px', marginTop: 8 }}>Add Note</Button>
                    </div>
                    {notes.length === 0 ? (
                        <div style={{ padding: '40px 16px', textAlign: 'center', color: theme.textSecondary, fontSize: 13 }}>No notes yet. Add one above.</div>
                    ) : notes.map((note, i) => (
                        <Card key={note.id}>
                            {editingNote === note.id ? (
                                <>
                                    <textarea value={note.text} onChange={e => { const n = [...notes]; n[i] = { ...n[i], text: e.target.value, updatedAt: new Date().toISOString() }; setNotes(n); }} rows={3} style={{ width: '100%', padding: '10px 12px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', marginBottom: 8 }} />
                                    <Button onClick={() => { setEditingNote(null); toast.success('Note updated'); }} style={{ width: 'auto', padding: '6px 16px', fontSize: 11 }}>Save</Button>
                                </>
                            ) : (
                                <>
                                    <p style={{ fontSize: 13, color: theme.text, lineHeight: 1.6, margin: '0 0 8px', whiteSpace: 'pre-wrap' as const }}>{note.text}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 10, color: theme.textDim }}>{new Date(note.updatedAt).toLocaleString()}</span>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => setEditingNote(note.id)} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 4, padding: '4px 10px', fontSize: 10, color: theme.textSecondary, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Edit</button>
                                            <button onClick={() => { setNotes(notes.filter((_, j) => j !== i)); toast.warning('Note deleted'); }} style={{ background: theme.dangerDim, border: '1px solid rgba(239,68,68,0.25)', borderRadius: 4, padding: '4px 10px', fontSize: 10, color: theme.danger, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Delete</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
