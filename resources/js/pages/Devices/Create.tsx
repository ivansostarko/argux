import PageMeta from '../../components/layout/PageMeta';
import AppLayout from '../../layouts/AppLayout';
import DeviceForm from './DeviceForm';

export default function DevicesCreate() { return <><PageMeta title="Create Device" section="devices" /><DeviceForm /></>; }
DevicesCreate.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
