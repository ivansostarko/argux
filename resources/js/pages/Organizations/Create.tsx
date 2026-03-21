import AppLayout from '../../layouts/AppLayout';
import OrgForm from './OrgForm';
export default function OrgCreate() { return <OrgForm mode="create" />; }
OrgCreate.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
