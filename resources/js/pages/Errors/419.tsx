import ErrorPage from './ErrorPage';

export default function Error419() {
    return (
        <ErrorPage config={{
            code: 419,
            title: 'Session Expired',
            subtitle: 'AUTHENTICATION TOKEN INVALIDATED',
            description: 'Your secure session has expired due to inactivity or a CSRF token mismatch. Please re-authenticate to continue. All unsaved changes may be lost.',
            accentColor: '#f97316',
            secondaryColor: '#eab308',
            glitch: false,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            actions: [
                { label: 'Re-authenticate', href: '/login', primary: true },
                { label: 'Go Back', href: 'back' },
            ],
        }} />
    );
}
