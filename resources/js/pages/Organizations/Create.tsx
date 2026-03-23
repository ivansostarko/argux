import PageMeta from '../../components/layout/PageMeta';
import AppLayout from '../../layouts/AppLayout';
import OrgForm from './OrgForm';
export default function OrgCreate() { return <><PageMeta title="Create Organization" section="organizations" /><OrgForm mode="create" /></>; }
OrgCreate.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
