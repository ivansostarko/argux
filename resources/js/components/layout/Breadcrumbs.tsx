import { router } from '@inertiajs/react';
import { useAppSettings } from '../../layouts/AppLayout';

const routeLabels: Record<string, string> = {
    '': 'Dashboard',
    'map': 'Tactical Map',
    'persons': 'Persons',
    'organizations': 'Organizations',
    'vehicles': 'Vehicles',
    'devices': 'Devices',
    'connections': 'Connections',
    'chat': 'AI Assistant',
    'download': 'Download Client',
    'activity': 'Activity Log',
    'risks': 'Risks Dashboard',
    'reports': 'Reports',
    'jobs': 'Background Jobs',
    'alerts': 'Alert Rules',
    'face-recognition': 'Face Recognition',
    'web-scraper': 'Web Scraper',
    'scraper': 'Social Scraper',
    'data-sources': 'Data Sources',
    'plate-recognition': 'Plate Recognition',
    'surveillance-apps': 'Surveillance Apps',
    'workflows': 'Workflows',
    'operations': 'Operations',
    'notifications': 'Notifications',
    'profile': 'My Profile',
    'create': 'Create',
    'edit': 'Edit',
    'print': 'Print Report',
    'show': 'Detail',
};

function resolveLabel(segment: string, index: number, segments: string[]): string {
    // Known labels
    if (routeLabels[segment]) return routeLabels[segment];
    // Numeric IDs — try to show "Detail #N"
    if (/^\d+$/.test(segment)) return `#${segment}`;
    // Capitalize unknown segments
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function useBreadcrumbs(overrides?: BreadcrumbItem[]): BreadcrumbItem[] {
    if (overrides) return [{ label: 'ARGUX', href: '/' }, ...overrides];

    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    const segments = path.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: 'ARGUX', href: '/' }];

    // Map page has no breadcrumbs (full-screen)
    if (segments[0] === 'map') return [];

    segments.forEach((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const label = resolveLabel(seg, i, segments);
        const isLast = i === segments.length - 1;
        crumbs.push({ label, href: isLast ? undefined : href });
    });

    return crumbs;
}

export default function Breadcrumbs({ items }: { items?: BreadcrumbItem[] }) {
    const { currentTheme: th } = useAppSettings();
    const crumbs = useBreadcrumbs(items);

    if (crumbs.length <= 1) return null;

    return (
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 0 12px', flexWrap: 'wrap' }}>
            {crumbs.map((c, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {i > 0 && <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke={th.textDim} strokeWidth="1.5" strokeLinecap="round"><polyline points="3,1 7,5 3,9"/></svg>}
                        {c.href && !isLast ? (
                            <a href={c.href} onClick={(e) => { e.preventDefault(); router.visit(c.href!); }} style={{ fontSize: 11, color: i === 0 ? th.accent : th.textSecondary, textDecoration: 'none', fontWeight: i === 0 ? 700 : 500, letterSpacing: i === 0 ? '0.06em' : undefined }} onMouseEnter={e => (e.currentTarget.style.color = th.accent)} onMouseLeave={e => (e.currentTarget.style.color = i === 0 ? th.accent : th.textSecondary)}>{c.label}</a>
                        ) : (
                            <span style={{ fontSize: 11, color: isLast ? th.text : th.textDim, fontWeight: isLast ? 600 : 400 }}>{c.label}</span>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
