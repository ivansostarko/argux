import PageMeta from '../../components/layout/PageMeta';
import { usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import PersonForm from './PersonForm';
import { getPersonById } from '../../mock/persons';
import { theme } from '../../lib/theme';
export default function PersonEdit() {
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const person = getPersonById(Number(id));
    if (!person) return <div style={{ textAlign: 'center', padding: '60px 20px' }}><h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Person Not Found</h2><p style={{ fontSize: 13, color: theme.textSecondary }}>ID {String(id)} not found.</p></div>;
    return <><PageMeta title="Edit Person" section="persons" /><PersonForm mode="edit" person={person} /></>;
}
PersonEdit.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
