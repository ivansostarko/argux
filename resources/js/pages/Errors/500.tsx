import ErrorPage from './ErrorPage';

export default function Error500() {
    return (
        <ErrorPage config={{
            code: 500,
            title: 'System Malfunction',
            subtitle: 'CRITICAL FAILURE — ALL SYSTEMS COMPROMISED',
            description: 'An unexpected error occurred in the core processing unit. Our engineering team has been automatically alerted. All active operations continue on backup systems.',
            accentColor: '#ef4444',
            secondaryColor: '#f97316',
            glitch: true,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
            actions: [
                { label: 'Retry Operation', href: 'back', primary: true },
                { label: 'Go to Dashboard', href: '/map' },
            ],
        }} />
    );
}
