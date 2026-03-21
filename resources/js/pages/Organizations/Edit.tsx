import { usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import OrgForm from './OrgForm';
import { getOrgById } from '../../mock/organizations';
import { theme } from '../../lib/theme';
export default function OrgEdit() {
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const org = getOrgById(Number(id));
    if (!org) return <div style={{ textAlign:'center', padding:'60px 20px' }}><h2 style={{ fontSize:18, fontWeight:700, color:theme.text }}>Organization Not Found</h2><p style={{ fontSize:13, color:theme.textSecondary }}>ID {String(id)} not found.</p></div>;
    return <OrgForm mode="edit" org={org} />;
}
OrgEdit.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
