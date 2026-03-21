import ErrorPage from './ErrorPage';

export default function Error404() {
    return (
        <ErrorPage config={{
            code: 404,
            title: 'Target Not Found',
            subtitle: 'SIGNAL LOST — LOCATION UNKNOWN',
            description: 'The resource you are looking for has been moved, deleted, or never existed. Our surveillance systems have no record of this location.',
            accentColor: '#3b82f6',
            secondaryColor: '#06b6d4',
            glitch: false,
            icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
        }} />
    );
}
