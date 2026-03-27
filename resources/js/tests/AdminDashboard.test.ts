/**
 * ARGUX — Admin Dashboard Tests
 * Run: npx vitest run resources/js/tests/AdminDashboard.test.ts
 */
import { describe, it, expect } from 'vitest';
import { kpiCards, services, quickActions, recentEvents, storageBreakdown, statusColors, keyboardShortcuts } from '../mock/admin-dashboard';
import type { KpiCard, ServiceHealth, QuickAction, RecentEvent, StorageBreakdown } from '../mock/admin-dashboard';

describe('AdminDashboard kpiCards', () => {
    it('should have 8 KPI cards', () => { expect(kpiCards.length).toBe(8); });
    it('IDs should be unique', () => { const ids = kpiCards.map(k => k.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        kpiCards.forEach((k: KpiCard) => {
            expect(k.id).toBeTruthy(); expect(k.label).toBeTruthy(); expect(k.icon).toBeTruthy();
            expect(k.color).toMatch(/^#[0-9a-f]{6}$/i);
            expect(['up', 'down', 'stable']).toContain(k.trend);
            expect(k.trendValue).toBeTruthy();
            expect(k.sparkline.length).toBeGreaterThanOrEqual(5);
        });
    });
    it('should include users, sessions, uptime, storage, kafka', () => {
        const ids = kpiCards.map(k => k.id);
        ['users', 'sessions', 'uptime', 'storage', 'kafka'].forEach(id => expect(ids).toContain(id));
    });
});

describe('AdminDashboard services', () => {
    it('should have at least 10 services', () => { expect(services.length).toBeGreaterThanOrEqual(10); });
    it('IDs should be unique', () => { const ids = services.map(s => s.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        services.forEach((s: ServiceHealth) => {
            expect(s.id).toBeTruthy(); expect(s.name).toBeTruthy(); expect(s.icon).toBeTruthy();
            expect(['healthy', 'degraded', 'down', 'maintenance']).toContain(s.status);
            expect(s.uptime).toBeTruthy(); expect(s.latency).toBeTruthy();
            expect(s.description).toBeTruthy();
        });
    });
    it('should have mostly healthy services', () => {
        const healthy = services.filter(s => s.status === 'healthy').length;
        expect(healthy).toBeGreaterThanOrEqual(8);
    });
    it('should have some degraded services', () => {
        expect(services.filter(s => s.status === 'degraded').length).toBeGreaterThanOrEqual(1);
    });
    it('should include key infrastructure', () => {
        const names = services.map(s => s.name.toLowerCase());
        expect(names.some(n => n.includes('postgres'))).toBe(true);
        expect(names.some(n => n.includes('redis'))).toBe(true);
        expect(names.some(n => n.includes('kafka'))).toBe(true);
        expect(names.some(n => n.includes('ollama'))).toBe(true);
    });
});

describe('AdminDashboard quickActions', () => {
    it('should have at least 6 actions', () => { expect(quickActions.length).toBeGreaterThanOrEqual(6); });
    it('IDs should be unique', () => { const ids = quickActions.map(a => a.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have label, icon, color, description', () => {
        quickActions.forEach((a: QuickAction) => {
            expect(a.label).toBeTruthy(); expect(a.icon).toBeTruthy();
            expect(a.color).toMatch(/^#[0-9a-f]{6}$/i);
            expect(a.description).toBeTruthy();
        });
    });
    it('should have some dangerous actions with confirmText', () => {
        const dangerous = quickActions.filter(a => a.dangerous);
        expect(dangerous.length).toBeGreaterThanOrEqual(1);
        dangerous.forEach(a => expect(a.confirmText).toBeTruthy());
    });
    it('should include clear cache, restart workers, force sync', () => {
        const labels = quickActions.map(a => a.label.toLowerCase());
        expect(labels.some(l => l.includes('cache'))).toBe(true);
        expect(labels.some(l => l.includes('restart'))).toBe(true);
        expect(labels.some(l => l.includes('sync'))).toBe(true);
    });
});

describe('AdminDashboard recentEvents', () => {
    it('should have at least 8 events', () => { expect(recentEvents.length).toBeGreaterThanOrEqual(8); });
    it('IDs should be unique', () => { const ids = recentEvents.map(e => e.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        recentEvents.forEach((e: RecentEvent) => {
            expect(e.id).toBeTruthy(); expect(e.title).toBeTruthy();
            expect(e.description).toBeTruthy(); expect(e.user).toBeTruthy();
            expect(e.time).toBeTruthy(); expect(e.icon).toBeTruthy();
            expect(e.color).toMatch(/^#[0-9a-f]{6}$/i);
            expect(['login', 'config', 'alert', 'deploy', 'error', 'user', 'sync', 'backup']).toContain(e.type);
        });
    });
    it('should span multiple event types', () => {
        const types = new Set(recentEvents.map(e => e.type));
        expect(types.size).toBeGreaterThanOrEqual(5);
    });
});

describe('AdminDashboard storageBreakdown', () => {
    it('should have at least 5 categories', () => { expect(storageBreakdown.length).toBeGreaterThanOrEqual(5); });
    it('all should have label, size, bytes, color, icon', () => {
        storageBreakdown.forEach((s: StorageBreakdown) => {
            expect(s.label).toBeTruthy(); expect(s.size).toBeTruthy();
            expect(s.bytes).toBeGreaterThan(0);
            expect(s.color).toMatch(/^#[0-9a-f]{6}$/i);
            expect(s.icon).toBeTruthy();
        });
    });
    it('total should be less than 8 TB', () => {
        const total = storageBreakdown.reduce((s, b) => s + b.bytes, 0);
        expect(total).toBeLessThan(8000000000000);
    });
    it('should be sorted by size descending', () => {
        for (let i = 1; i < storageBreakdown.length; i++) {
            expect(storageBreakdown[i - 1].bytes).toBeGreaterThanOrEqual(storageBreakdown[i].bytes);
        }
    });
});

describe('AdminDashboard statusColors', () => {
    it('should have 4 statuses', () => { expect(Object.keys(statusColors).length).toBe(4); });
    it('all should be valid hex colors', () => {
        Object.values(statusColors).forEach(c => expect(c).toMatch(/^#[0-9a-f]{6}$/i));
    });
});

describe('AdminDashboard keyboardShortcuts', () => {
    it('should have at least 3', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(3); });
    it('should include R, Esc, Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['R', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
});
