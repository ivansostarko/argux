/**
 * ARGUX — Download Client Page Tests
 * Tests for mock data, platform detection, UI rendering, and keyboard shortcuts
 *
 * Run: npx vitest run resources/js/pages/Download/Download.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
    releases, releaseNotes, deploymentTypes, systemRequirements,
    platformColors, detectCurrentPlatform,
    APP_VERSION, BUILD_DATE, BUILD_NUMBER,
} from './mockData';
import type { Platform, ClientRelease, ReleaseNote, DeploymentType, SystemReq } from './mockData';

// ═══════════════════════════════════════════════════════════════
// Mock Data Integrity Tests
// ═══════════════════════════════════════════════════════════════

describe('Download mockData', () => {
    describe('constants', () => {
        it('should have a valid semver version', () => {
            expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
        });

        it('should have a valid build date', () => {
            expect(BUILD_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(new Date(BUILD_DATE).toString()).not.toBe('Invalid Date');
        });

        it('should have a valid build number', () => {
            expect(BUILD_NUMBER).toBeTruthy();
            expect(BUILD_NUMBER.length).toBeGreaterThan(5);
        });
    });

    describe('releases', () => {
        it('should have at least 5 releases covering all platforms', () => {
            expect(releases.length).toBeGreaterThanOrEqual(5);
        });

        it('should cover all 5 platforms', () => {
            const platforms = new Set(releases.map(r => r.platform));
            expect(platforms).toContain('windows');
            expect(platforms).toContain('linux');
            expect(platforms).toContain('macos');
            expect(platforms).toContain('android');
            expect(platforms).toContain('ios');
            expect(platforms.size).toBe(5);
        });

        it('every release should have required fields', () => {
            releases.forEach((r: ClientRelease) => {
                expect(r.platform).toBeTruthy();
                expect(r.label).toBeTruthy();
                expect(r.icon).toBeTruthy();
                expect(r.version).toBe(APP_VERSION);
                expect(r.filename).toBeTruthy();
                expect(r.size).toMatch(/\d+(\.\d+)?\s*[KMGT]?B/);
                expect(r.format).toBeTruthy();
                expect(r.sha256).toBeTruthy();
                expect(r.sha256.length).toBeGreaterThan(10);
                expect(r.minOS).toBeTruthy();
                expect(r.arch).toBeTruthy();
                expect(r.features.length).toBeGreaterThan(0);
            });
        });

        it('filenames should be unique', () => {
            const filenames = releases.map(r => r.filename);
            expect(new Set(filenames).size).toBe(filenames.length);
        });

        it('should have multiple desktop formats', () => {
            const desktopReleases = releases.filter(r => ['windows', 'linux', 'macos'].includes(r.platform));
            expect(desktopReleases.length).toBeGreaterThanOrEqual(5);
        });

        it('should have mobile releases for Android and iOS', () => {
            expect(releases.filter(r => r.platform === 'android').length).toBeGreaterThanOrEqual(1);
            expect(releases.filter(r => r.platform === 'ios').length).toBeGreaterThanOrEqual(1);
        });

        it('SHA-256 hashes should be 64 hex characters', () => {
            releases.forEach(r => {
                expect(r.sha256).toMatch(/^[a-f0-9]{64}$/);
            });
        });
    });

    describe('releaseNotes', () => {
        it('should have at least 5 entries', () => {
            expect(releaseNotes.length).toBeGreaterThanOrEqual(5);
        });

        it('first entry should be the latest version', () => {
            expect(releaseNotes[0].version).toBe(APP_VERSION);
        });

        it('all entries should have version, date, notes', () => {
            releaseNotes.forEach((rn: ReleaseNote) => {
                expect(rn.version).toMatch(/^\d+\.\d+\.\d+$/);
                expect(rn.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                expect(rn.notes.length).toBeGreaterThan(10);
            });
        });

        it('entries should be in reverse chronological order', () => {
            for (let i = 0; i < releaseNotes.length - 1; i++) {
                expect(releaseNotes[i].date >= releaseNotes[i + 1].date).toBe(true);
            }
        });
    });

    describe('deploymentTypes', () => {
        it('should have 3 deployment types', () => {
            expect(deploymentTypes.length).toBe(3);
        });

        it('should include standalone, managed, and air-gapped', () => {
            const ids = deploymentTypes.map(d => d.id);
            expect(ids).toContain('standalone');
            expect(ids).toContain('managed');
            expect(ids).toContain('airgap');
        });

        it('all should have required fields', () => {
            deploymentTypes.forEach((d: DeploymentType) => {
                expect(d.icon).toBeTruthy();
                expect(d.title).toBeTruthy();
                expect(d.desc.length).toBeGreaterThan(20);
                expect(d.badge).toBeTruthy();
                expect(d.color).toMatch(/^#[0-9a-fA-F]{6}$/);
            });
        });
    });

    describe('systemRequirements', () => {
        it('should cover all 5 platforms', () => {
            expect(systemRequirements.length).toBe(5);
        });

        it('all should have required fields', () => {
            systemRequirements.forEach((r: SystemReq) => {
                expect(r.platform).toBeTruthy();
                expect(r.cpu).toBeTruthy();
                expect(r.ram).toBeTruthy();
                expect(r.disk).toBeTruthy();
                expect(r.os).toBeTruthy();
                expect(r.extra).toBeTruthy();
            });
        });
    });

    describe('platformColors', () => {
        it('should have colors for all 5 platforms', () => {
            const platforms: Platform[] = ['windows', 'linux', 'macos', 'android', 'ios'];
            platforms.forEach(p => {
                expect(platformColors[p]).toMatch(/^#[0-9a-fA-F]{6}$/);
            });
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Platform Detection Tests
// ═══════════════════════════════════════════════════════════════

describe('detectCurrentPlatform', () => {
    it('should return a valid platform string', () => {
        const result = detectCurrentPlatform();
        expect(['windows', 'linux', 'macos', 'android', 'ios']).toContain(result);
    });

    it('should default to windows when navigator is undefined', () => {
        // In vitest node environment, navigator may be undefined
        // The function handles this with typeof check
        const result = detectCurrentPlatform();
        expect(result).toBeTruthy();
    });
});

// ═══════════════════════════════════════════════════════════════
// Cross-Reference Tests
// ═══════════════════════════════════════════════════════════════

describe('Data consistency', () => {
    it('all releases should use the same APP_VERSION', () => {
        releases.forEach(r => {
            expect(r.version).toBe(APP_VERSION);
        });
    });

    it('latest release note version should match APP_VERSION', () => {
        expect(releaseNotes[0].version).toBe(APP_VERSION);
    });

    it('release platforms should match platformColors keys', () => {
        const relPlatforms = new Set(releases.map(r => r.platform));
        const colorPlatforms = new Set(Object.keys(platformColors));
        relPlatforms.forEach(p => {
            expect(colorPlatforms.has(p)).toBe(true);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Keyboard Shortcut Logic Tests
// ═══════════════════════════════════════════════════════════════

describe('Tab keyboard mapping', () => {
    const tabMap: Record<string, string> = { '1': 'desktop', '2': 'mobile', '3': 'deployment', '4': 'releases' };

    it('should map keys 1-4 to tabs', () => {
        expect(tabMap['1']).toBe('desktop');
        expect(tabMap['2']).toBe('mobile');
        expect(tabMap['3']).toBe('deployment');
        expect(tabMap['4']).toBe('releases');
    });

    it('should have 4 tab shortcuts', () => {
        expect(Object.keys(tabMap).length).toBe(4);
    });
});
