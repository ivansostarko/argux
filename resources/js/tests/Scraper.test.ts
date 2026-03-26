/**
 * ARGUX — Social Scraper Page Tests
 * Run: npx vitest run resources/js/tests/Scraper.test.ts
 */
import { describe, it, expect } from 'vitest';
import { mockScrapers, mockPosts, platformConfig, statusColors, sentimentColors, contentIcons, allPlatforms, allPersonsInScrapers, allOrgsInScrapers, keyboardShortcuts } from '../mock/scraper';
import type { Platform, ScraperStatus, Sentiment, ContentType, ViewTab, Scraper, ScrapedPost } from '../mock/scraper';

describe('Scraper platformConfig', () => {
    it('should have 10 platforms', () => { expect(allPlatforms.length).toBe(10); });
    it('all should have icon, color, label', () => { allPlatforms.forEach(p => { expect(platformConfig[p].icon).toBeTruthy(); expect(platformConfig[p].color).toMatch(/^#[0-9a-fA-F]{6}$/); expect(platformConfig[p].label).toBeTruthy(); }); });
});

describe('Scraper statusColors', () => {
    it('should cover 4 statuses', () => { (['Active', 'Paused', 'Error', 'Queued'] as ScraperStatus[]).forEach(s => expect(statusColors[s]).toMatch(/^#[0-9a-f]{6}$/i)); });
});

describe('Scraper sentimentColors', () => {
    it('should cover 4 sentiments', () => { (['positive', 'negative', 'neutral', 'flagged'] as Sentiment[]).forEach(s => expect(sentimentColors[s]).toMatch(/^#[0-9a-f]{6}$/i)); });
});

describe('Scraper contentIcons', () => {
    it('should have 8 content types', () => { expect(Object.keys(contentIcons).length).toBe(8); });
});

describe('Scraper mockScrapers', () => {
    it('should have at least 10', () => { expect(mockScrapers.length).toBeGreaterThanOrEqual(10); });
    it('IDs should be unique', () => { const ids = mockScrapers.map(s => s.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockScrapers.forEach((s: Scraper) => {
            expect(s.id).toBeTruthy(); expect(allPlatforms).toContain(s.platform);
            expect(s.profileHandle).toBeTruthy(); expect(['Active', 'Paused', 'Error', 'Queued']).toContain(s.status);
            expect(s.interval).toBeTruthy(); expect(typeof s.totalPosts).toBe('number');
            expect(s.personName || s.orgName).toBeTruthy(); // must be linked to something
        });
    });
    it('should have active scrapers', () => { expect(mockScrapers.filter(s => s.status === 'Active').length).toBeGreaterThanOrEqual(5); });
    it('should span multiple platforms', () => { const platforms = new Set(mockScrapers.map(s => s.platform)); expect(platforms.size).toBeGreaterThanOrEqual(4); });
    it('should have person-linked and org-linked scrapers', () => {
        expect(mockScrapers.filter(s => s.personId).length).toBeGreaterThanOrEqual(3);
        expect(mockScrapers.filter(s => s.orgId).length).toBeGreaterThanOrEqual(2);
    });
});

describe('Scraper mockPosts', () => {
    it('should have at least 10', () => { expect(mockPosts.length).toBeGreaterThanOrEqual(10); });
    it('IDs should be unique', () => { const ids = mockPosts.map(p => p.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockPosts.forEach((p: ScrapedPost) => {
            expect(p.id).toBeTruthy(); expect(p.scraperId).toBeTruthy();
            expect(allPlatforms).toContain(p.platform); expect(Object.keys(contentIcons)).toContain(p.contentType);
            expect(p.content).toBeTruthy(); expect(p.profileHandle).toBeTruthy();
            expect(['positive', 'negative', 'neutral', 'flagged']).toContain(p.sentiment);
            expect(typeof p.aiFlagged).toBe('boolean'); expect(p.timestamp).toBeTruthy(); expect(p.timeAgo).toBeTruthy();
            expect(p.tags.length).toBeGreaterThan(0);
        });
    });
    it('should have AI-flagged posts', () => { expect(mockPosts.filter(p => p.aiFlagged).length).toBeGreaterThanOrEqual(3); });
    it('AI-flagged should have aiReason', () => { mockPosts.filter(p => p.aiFlagged).forEach(p => expect(p.aiReason).toBeTruthy()); });
    it('scraperIds should reference existing scrapers', () => { const sids = mockScrapers.map(s => s.id); mockPosts.forEach(p => expect(sids).toContain(p.scraperId)); });
    it('should have posts with media', () => { expect(mockPosts.filter(p => p.hasMedia).length).toBeGreaterThanOrEqual(1); });
    it('should span multiple platforms', () => { const plats = new Set(mockPosts.map(p => p.platform)); expect(plats.size).toBeGreaterThanOrEqual(3); });
});

describe('Scraper derived lists', () => {
    it('allPersonsInScrapers should have unique ids', () => { const ids = allPersonsInScrapers.map(p => p.id); expect(new Set(ids).size).toBe(ids.length); });
    it('allOrgsInScrapers should have unique ids', () => { const ids = allOrgsInScrapers.map(o => o.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have names', () => {
        allPersonsInScrapers.forEach(p => { expect(p.id).toBeGreaterThan(0); expect(p.name).toBeTruthy(); });
        allOrgsInScrapers.forEach(o => { expect(o.id).toBeGreaterThan(0); expect(o.name).toBeTruthy(); });
    });
});

describe('Scraper keyboardShortcuts', () => {
    it('should have at least 7', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(7); });
    it('should include N, Ctrl+Q, F, R, Esc, 1-3', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['N', 'Ctrl+Q', 'F', 'R', 'Esc', '1', '2', '3'].forEach(k => expect(keys).toContain(k));
    });
});
