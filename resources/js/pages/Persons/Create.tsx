import AppLayout from '../../layouts/AppLayout';
import PersonForm from './PersonForm';

export default function PersonCreate() {
    return <PersonForm mode="create" />;
}
PersonCreate.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
