import { useState, useEffect, useCallback } from 'react';

export interface PermissionItem {
    id: string;
    label: string;
    description: string;
    icon: string;
    status: 'granted' | 'denied' | 'prompt' | 'unsupported';
}

const STORAGE_KEY = 'argux_permissions_prompted';

export function usePermissions() {
    const [permissions, setPermissions] = useState<PermissionItem[]>([]);
    const [showPrompt, setShowPrompt] = useState(false);
    const [requesting, setRequesting] = useState(false);

    const checkPermissions = useCallback(async () => {
        const items: PermissionItem[] = [];

        // Geolocation
        if ('geolocation' in navigator) {
            try {
                const p = await navigator.permissions.query({ name: 'geolocation' });
                items.push({ id: 'geolocation', label: 'Geolocation', description: 'Access device location for map positioning and tracking', icon: '📍', status: p.state });
            } catch { items.push({ id: 'geolocation', label: 'Geolocation', description: 'Access device location for map positioning and tracking', icon: '📍', status: 'prompt' }); }
        } else {
            items.push({ id: 'geolocation', label: 'Geolocation', description: 'Access device location for map positioning and tracking', icon: '📍', status: 'unsupported' });
        }

        // Notifications
        if ('Notification' in window) {
            const state = Notification.permission === 'default' ? 'prompt' : Notification.permission as 'granted' | 'denied';
            items.push({ id: 'notifications', label: 'Notifications', description: 'Receive real-time alerts for zone breaches, face matches, and events', icon: '🔔', status: state });
        } else {
            items.push({ id: 'notifications', label: 'Notifications', description: 'Receive real-time alerts for zone breaches, face matches, and events', icon: '🔔', status: 'unsupported' });
        }

        // Camera & Microphone
        if ('mediaDevices' in navigator) {
            try {
                const cam = await navigator.permissions.query({ name: 'camera' as PermissionName });
                items.push({ id: 'camera', label: 'Camera / Microphone', description: 'Enable live video feed, photo capture, and audio recording', icon: '🎥', status: cam.state });
            } catch { items.push({ id: 'camera', label: 'Camera / Microphone', description: 'Enable live video feed, photo capture, and audio recording', icon: '🎥', status: 'prompt' }); }
        } else {
            items.push({ id: 'camera', label: 'Camera / Microphone', description: 'Enable live video feed, photo capture, and audio recording', icon: '🎥', status: 'unsupported' });
        }

        // Clipboard
        try {
            const clip = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
            items.push({ id: 'clipboard', label: 'Clipboard', description: 'Read and write clipboard for quick data sharing between modules', icon: '📋', status: clip.state });
        } catch { items.push({ id: 'clipboard', label: 'Clipboard', description: 'Read and write clipboard for quick data sharing between modules', icon: '📋', status: 'prompt' }); }

        // Persistent Storage
        if ('storage' in navigator && 'persist' in navigator.storage) {
            const persisted = await navigator.storage.persisted();
            items.push({ id: 'storage', label: 'Persistent Storage', description: 'Prevent browser from clearing cached map tiles and offline data', icon: '💾', status: persisted ? 'granted' : 'prompt' });
        } else {
            items.push({ id: 'storage', label: 'Persistent Storage', description: 'Prevent browser from clearing cached map tiles and offline data', icon: '💾', status: 'unsupported' });
        }

        // Background Sync
        if ('serviceWorker' in navigator) {
            items.push({ id: 'background-sync', label: 'Background Sync', description: 'Sync tracking data and alerts when connection is restored', icon: '🔄', status: 'prompt' });
        } else {
            items.push({ id: 'background-sync', label: 'Background Sync', description: 'Sync tracking data and alerts when connection is restored', icon: '🔄', status: 'unsupported' });
        }

        setPermissions(items);

        const prompted = localStorage.getItem(STORAGE_KEY);
        const hasPromptable = items.some(p => p.status === 'prompt');
        if (!prompted && hasPromptable) {
            setShowPrompt(true);
        }
    }, []);

    useEffect(() => { checkPermissions(); }, [checkPermissions]);

    const requestAll = useCallback(async () => {
        setRequesting(true);
        try {
            // Geolocation
            if (permissions.find(p => p.id === 'geolocation' && p.status === 'prompt')) {
                try { await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })); } catch {}
            }
            // Notifications
            if (permissions.find(p => p.id === 'notifications' && p.status === 'prompt')) {
                try { await Notification.requestPermission(); } catch {}
            }
            // Camera/Mic
            if (permissions.find(p => p.id === 'camera' && p.status === 'prompt')) {
                try { const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); s.getTracks().forEach(t => t.stop()); } catch {}
            }
            // Clipboard
            if (permissions.find(p => p.id === 'clipboard' && p.status === 'prompt')) {
                try { await navigator.clipboard.readText(); } catch {}
            }
            // Persistent Storage
            if (permissions.find(p => p.id === 'storage' && p.status === 'prompt')) {
                try { await navigator.storage.persist(); } catch {}
            }
        } catch {}
        setRequesting(false);
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setShowPrompt(false);
        await checkPermissions();
    }, [permissions, checkPermissions]);

    const dismissPrompt = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setShowPrompt(false);
    }, []);

    return { permissions, showPrompt, requesting, requestAll, dismissPrompt };
}
