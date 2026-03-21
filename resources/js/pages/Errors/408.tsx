import ErrorPage from './ErrorPage';

export default function Error408() {
    return (
        <ErrorPage config={{
            code: 408,
            title: 'Connection Timeout',
            subtitle: 'SIGNAL INTERRUPTED — NO RESPONSE FROM TARGET',
            description: 'The server did not receive a complete request within the allocated time window. This may indicate network instability or heavy system load. Check your connection and retry.',
            accentColor: '#06b6d4',
            secondaryColor: '#3b82f6',
            glitch: false,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/><path d="M5 12.55a10.94 10.94 0 015.17-2.39"/><path d="M10.71 5.05A16 16 0 0122.56 9"/><path d="M1.42 9a15.91 15.91 0 014.7-2.88"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
            actions: [
                { label: 'Retry Connection', href: 'back', primary: true },
                { label: 'Go to Dashboard', href: '/map' },
            ],
        }} />
    );
}
