import PageMeta from '../../components/layout/PageMeta';
import { usePage } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import { getDeviceById } from '../../mock/devices';
import DeviceForm from './DeviceForm';
import { Button } from '../../components/ui';
import { router } from '@inertiajs/react';
import { theme } from '../../lib/theme';

export default function DevicesEdit() {
    const { id } = usePage<{ id: number; [key: string]: unknown }>().props;
    const device = getDeviceById(Number(id));
    if (!device) return <div style={{ textAlign: 'center', padding: 60 }}><h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Device Not Found</h2><Button variant="secondary" onClick={() => router.visit('/devices')} style={{ width: 'auto', padding: '10px 20px', marginTop: 16 }}>Back</Button></div>;
    return <><PageMeta title="Edit Device" section="devices" /><DeviceForm device={device} isEdit /></>;
}
DevicesEdit.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
