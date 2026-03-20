import { usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import PersonForm from './PersonForm';
import { getPersonById } from '../../mock/persons';
import { theme } from '../../lib/theme';

export default function PersonEdit() {
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const person = getPersonById(Number(id));

    if (!person) return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text, margin: '0 0 8px' }}>Person Not Found</h2>
            <p style={{ fontSize: 13, color: theme.textSecondary }}>The requested person ID ({String(id)}) does not exist in the database.</p>
        </div>
    );

    return <PersonForm mode="edit" person={person} />;
}
PersonEdit.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
