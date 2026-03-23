import PageMeta from '../../components/layout/PageMeta';
import AppLayout from '../../layouts/AppLayout';
import PersonForm from './PersonForm';
export default function PersonCreate() { return <><PageMeta title="Create Person" section="persons" /><PersonForm mode="create" /></>; }
PersonCreate.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
