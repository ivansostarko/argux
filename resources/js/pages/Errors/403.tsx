import ErrorPage from './ErrorPage';

export default function Error403() {
    return (
        <ErrorPage config={{
            code: 403,
            title: 'Access Denied',
            subtitle: 'AUTHORIZATION REQUIRED — CLEARANCE INSUFFICIENT',
            description: 'You do not have the necessary security clearance to access this resource. This incident has been logged and reported to system administrators.',
            accentColor: '#f59e0b',
            secondaryColor: '#ef4444',
            glitch: false,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1"/></svg>,
            actions: [
                { label: 'Request Access', href: '/map', primary: true },
                { label: 'Go Back', href: 'back' },
            ],
        }} />
    );
}
