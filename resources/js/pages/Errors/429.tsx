import ErrorPage from './ErrorPage';

export default function Error429() {
    return (
        <ErrorPage config={{
            code: 429,
            title: 'Rate Limit Exceeded',
            subtitle: 'REQUEST THROTTLED — COOLING DOWN',
            description: 'You have exceeded the maximum number of allowed requests. This security measure protects system integrity. Access will be restored automatically. Please wait before retrying.',
            accentColor: '#eab308',
            secondaryColor: '#f59e0b',
            glitch: false,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
            actions: [
                { label: 'Retry in 60s', href: 'back', primary: true },
                { label: 'Go to Dashboard', href: '/map' },
            ],
        }} />
    );
}
