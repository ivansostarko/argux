/**
 * ARGUX — Notifications Mock Data
 * Extracted from original inline page data for API fallback
 */

export type Severity = 'critical' | 'warning' | 'info';
export type NType = 'system' | 'storage' | 'user' | 'security' | 'device' | 'backup';
export type FilterTab = 'all' | 'unread' | 'critical' | 'warning' | 'info';

export interface Notification {
    id: number; type: NType; severity: Severity;
    title: string; body: string; time: string; timestamp: string;
    read: boolean; source?: string;
}
