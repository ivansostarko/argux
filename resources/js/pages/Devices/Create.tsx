import AppLayout from '../../layouts/AppLayout';
import DeviceForm from './DeviceForm';

export default function DevicesCreate() { return <DeviceForm />; }
DevicesCreate.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
