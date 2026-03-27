/**
 * ARGUX — Admin Knowledge Base Tests
 * Run: npx vitest run resources/js/tests/AdminKB.test.ts
 */
import { describe, it, expect } from 'vitest';
import { categories, articles, keyboardShortcuts } from '../mock/admin-kb';
import type { KbCategory, KbArticle } from '../mock/admin-kb';

describe('KB categories', () => {
    it('should have 7 categories', () => { expect(categories.length).toBe(7); });
    it('IDs should be unique', () => { const ids = categories.map(c => c.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have id, name, icon, color, description', () => {
        categories.forEach((c: KbCategory) => {
            expect(c.id).toBeTruthy(); expect(c.name).toBeTruthy(); expect(c.icon).toBeTruthy();
            expect(c.color).toMatch(/^#[0-9a-f]{6}$/i); expect(c.description).toBeTruthy();
        });
    });
    it('should include expected categories', () => {
        const ids = categories.map(c => c.id);
        ['getting-started', 'map-tracking', 'intelligence', 'devices', 'admin', 'security', 'troubleshooting'].forEach(id =>
            expect(ids).toContain(id)
        );
    });
});

describe('KB articles', () => {
    it('should have at least 15 articles', () => { expect(articles.length).toBeGreaterThanOrEqual(15); });
    it('IDs should be unique', () => { const ids = articles.map(a => a.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        articles.forEach((a: KbArticle) => {
            expect(a.id).toBeTruthy(); expect(a.categoryId).toBeTruthy(); expect(a.title).toBeTruthy();
            expect(a.summary).toBeTruthy(); expect(a.content).toBeTruthy();
            expect(a.author).toBeTruthy(); expect(a.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(typeof a.views).toBe('number'); expect(a.views).toBeGreaterThan(0);
            expect(typeof a.helpful).toBe('number'); expect(typeof a.helpfulTotal).toBe('number');
            expect(a.helpful).toBeLessThanOrEqual(a.helpfulTotal);
            expect(a.readTime).toBeTruthy(); expect(a.tags.length).toBeGreaterThan(0);
        });
    });
    it('all should reference valid categories', () => {
        const catIds = categories.map(c => c.id);
        articles.forEach(a => expect(catIds).toContain(a.categoryId));
    });
    it('every category should have at least 1 article', () => {
        categories.forEach(cat => {
            expect(articles.filter(a => a.categoryId === cat.id).length).toBeGreaterThanOrEqual(1);
        });
    });
    it('should span all 7 categories', () => {
        const usedCats = new Set(articles.map(a => a.categoryId));
        expect(usedCats.size).toBe(7);
    });
    it('content should be substantive (>100 chars)', () => {
        articles.forEach(a => expect(a.content.length).toBeGreaterThan(100));
    });
    it('related articles should reference valid IDs', () => {
        const allIds = new Set(articles.map(a => a.id));
        articles.forEach(a => a.relatedIds.forEach(rid => expect(allIds.has(rid)).toBe(true)));
    });
    it('helpful percentage should be reasonable (>70%)', () => {
        articles.forEach(a => {
            const pct = a.helpful / a.helpfulTotal * 100;
            expect(pct).toBeGreaterThanOrEqual(70);
        });
    });
    it('views should vary (not all the same)', () => {
        const views = articles.map(a => a.views);
        expect(new Set(views).size).toBeGreaterThan(5);
    });
    it('should have articles with multiple tags', () => {
        expect(articles.filter(a => a.tags.length >= 3).length).toBeGreaterThanOrEqual(5);
    });
});

describe('KB keyboardShortcuts', () => {
    it('should have at least 3', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(3); });
    it('should include F, Esc, Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['F', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
});
