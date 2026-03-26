/**
 * ARGUX — Web Scraper Page Tests
 * Run: npx vitest run resources/js/tests/WebScraper.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
    mockSources, mockArticles, catConfig, statusCol, relColors, contentIcons,
    allCategories, allCountries, allOps, keyboardShortcuts,
} from '../mock/webScraper';
import type { SourceCategory, ScraperStatus, Relevance, ContentType, ViewTab, WebSource, ScrapedArticle } from '../mock/webScraper';

describe('WebScraper catConfig', () => {
    it('should have 8 categories', () => { expect(allCategories.length).toBe(8); });
    it('all should have icon and color', () => { allCategories.forEach(c => { expect(catConfig[c].icon).toBeTruthy(); expect(catConfig[c].color).toMatch(/^#[0-9a-f]{6}$/i); }); });
});

describe('WebScraper statusCol', () => {
    it('should cover all 4 statuses', () => {
        (['Active', 'Paused', 'Error', 'Scheduled'] as ScraperStatus[]).forEach(s => expect(statusCol[s]).toMatch(/^#[0-9a-f]{6}$/i));
    });
});

describe('WebScraper relColors', () => {
    it('should cover all 4 relevance levels', () => {
        (['Critical', 'High', 'Medium', 'Low'] as Relevance[]).forEach(r => expect(relColors[r]).toMatch(/^#[0-9a-f]{6}$/i));
    });
});

describe('WebScraper contentIcons', () => {
    it('should have 8 content types', () => { expect(Object.keys(contentIcons).length).toBe(8); });
    it('all should have icons', () => {
        (Object.keys(contentIcons) as ContentType[]).forEach(ct => expect(contentIcons[ct]).toBeTruthy());
    });
});

describe('WebScraper mockSources', () => {
    it('should have at least 12 sources', () => { expect(mockSources.length).toBeGreaterThanOrEqual(12); });
    it('IDs should be unique', () => { const ids = mockSources.map(s => s.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockSources.forEach((s: WebSource) => {
            expect(s.id).toBeTruthy(); expect(s.name).toBeTruthy(); expect(s.url).toBeTruthy();
            expect(allCategories).toContain(s.category);
            expect(s.country).toBeTruthy(); expect(s.language).toBeTruthy();
            expect(['Active', 'Paused', 'Error', 'Scheduled']).toContain(s.status);
            expect(typeof s.health).toBe('number'); expect(s.health).toBeGreaterThanOrEqual(0); expect(s.health).toBeLessThanOrEqual(100);
            expect(s.schedule).toBeTruthy();
            expect(typeof s.articleCount).toBe('number');
        });
    });
    it('should have active sources', () => { expect(mockSources.filter(s => s.status === 'Active').length).toBeGreaterThanOrEqual(8); });
    it('should have error or paused sources', () => { expect(mockSources.filter(s => s.status === 'Error' || s.status === 'Paused').length).toBeGreaterThanOrEqual(1); });
    it('should span multiple categories', () => { const cats = new Set(mockSources.map(s => s.category)); expect(cats.size).toBeGreaterThanOrEqual(5); });
    it('should span multiple countries', () => { const countries = new Set(mockSources.map(s => s.country)); expect(countries.size).toBeGreaterThanOrEqual(4); });
});

describe('WebScraper mockArticles', () => {
    it('should have at least 10 articles', () => { expect(mockArticles.length).toBeGreaterThanOrEqual(10); });
    it('IDs should be unique', () => { const ids = mockArticles.map(a => a.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockArticles.forEach((a: ScrapedArticle) => {
            expect(a.id).toBeTruthy(); expect(a.sourceId).toBeTruthy(); expect(a.sourceName).toBeTruthy();
            expect(a.title).toBeTruthy(); expect(a.excerpt).toBeTruthy();
            expect(['Critical', 'High', 'Medium', 'Low']).toContain(a.relevance);
            expect(a.country).toBeTruthy(); expect(a.language).toBeTruthy();
            expect(a.publishedAt).toBeTruthy(); expect(a.scrapedAt).toBeTruthy(); expect(a.timeAgo).toBeTruthy();
            expect(typeof a.aiFlagged).toBe('boolean');
            expect(a.tags.length).toBeGreaterThan(0);
        });
    });
    it('should have critical articles', () => { expect(mockArticles.filter(a => a.relevance === 'Critical').length).toBeGreaterThanOrEqual(3); });
    it('should have AI-flagged articles', () => { expect(mockArticles.filter(a => a.aiFlagged).length).toBeGreaterThanOrEqual(5); });
    it('AI-flagged should have aiReason', () => { mockArticles.filter(a => a.aiFlagged).forEach(a => expect(a.aiReason).toBeTruthy()); });
    it('should have articles with entity tags', () => { expect(mockArticles.filter(a => a.personIds.length > 0 || a.orgIds.length > 0).length).toBeGreaterThanOrEqual(3); });
    it('personIds and personNames should match in length', () => { mockArticles.forEach(a => expect(a.personIds.length).toBe(a.personNames.length)); });
    it('orgIds and orgNames should match in length', () => { mockArticles.forEach(a => expect(a.orgIds.length).toBe(a.orgNames.length)); });
    it('sourceIds should reference existing sources', () => { const srcIds = mockSources.map(s => s.id); mockArticles.forEach(a => expect(srcIds).toContain(a.sourceId)); });
    it('should span multiple content types', () => { const types = new Set(mockArticles.map(a => a.contentType)); expect(types.size).toBeGreaterThanOrEqual(4); });
});

describe('WebScraper derived lists', () => {
    it('allCategories should have 8 items', () => { expect(allCategories.length).toBe(8); });
    it('allCountries should be sorted', () => { for (let i = 1; i < allCountries.length; i++) expect(allCountries[i] >= allCountries[i - 1]).toBe(true); });
    it('allOps should have at least 1', () => { expect(allOps.length).toBeGreaterThanOrEqual(1); });
});

describe('WebScraper keyboardShortcuts', () => {
    it('should have at least 7 shortcuts', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(7); });
    it('should include Ctrl+Q, N, F, R, Esc, 1-3', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['Ctrl+Q', 'N', 'F', 'R', 'Esc', '1', '2', '3'].forEach(k => expect(keys).toContain(k));
    });
    it('all should have key and description', () => { keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); }); });
});
