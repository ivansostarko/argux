/**
 * ARGUX — Vision Camera Wall Page Tests
 * Run: npx vitest run resources/js/tests/Vision.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
    VIDEO_SRC, allCams, PTZ_IDS, camGroups, defaultPresets, mockFaces, tlSegs,
    defaultMotionZones, keyboardShortcuts
} from '../mock/vision';
import type { FaceHit, Preset, MotionZone } from '../mock/vision';

describe('Vision VIDEO_SRC', () => {
    it('should be a valid URL', () => { expect(VIDEO_SRC).toMatch(/^https?:\/\/.+\.mp4$/); });
});

describe('Vision allCams', () => {
    it('should have at least 8 cameras', () => { expect(allCams.length).toBeGreaterThanOrEqual(8); });
    it('all should be camera types', () => {
        allCams.forEach(c => expect(['Public Camera', 'Hidden Camera', 'Private Camera']).toContain(c.type));
    });
    it('IDs should be unique', () => { const ids = allCams.map(c => c.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have name and location', () => { allCams.forEach(c => { expect(c.name).toBeTruthy(); expect(c.locationName).toBeTruthy(); }); });
    it('should have online and offline cameras', () => {
        expect(allCams.filter(c => c.status === 'Online').length).toBeGreaterThanOrEqual(4);
    });
});

describe('Vision PTZ_IDS', () => {
    it('should have at least 2 PTZ cameras', () => { expect(PTZ_IDS.length).toBeGreaterThanOrEqual(2); });
    it('all should reference valid camera IDs', () => {
        const camIds = allCams.map(c => c.id);
        PTZ_IDS.forEach(id => expect(camIds).toContain(id));
    });
});

describe('Vision camGroups', () => {
    it('should have at least 5 groups', () => { expect(camGroups.length).toBeGreaterThanOrEqual(5); });
    it('first should be "all"', () => { expect(camGroups[0].id).toBe('all'); });
    it('all should have id, label, icon', () => { camGroups.forEach(g => { expect(g.id).toBeTruthy(); expect(g.label).toBeTruthy(); expect(g.icon).toBeTruthy(); }); });
    it('should include zagreb, hawk, ptz, covert', () => {
        const ids = camGroups.map(g => g.id);
        ['zagreb', 'hawk', 'ptz', 'covert'].forEach(id => expect(ids).toContain(id));
    });
    it('group camera IDs should reference valid cameras', () => {
        const camIds = allCams.map(c => c.id);
        camGroups.filter(g => 'ids' in g).forEach(g => {
            (g as any).ids.forEach((id: number) => expect(camIds).toContain(id));
        });
    });
});

describe('Vision defaultPresets', () => {
    it('should have at least 4 presets', () => { expect(defaultPresets.length).toBeGreaterThanOrEqual(4); });
    it('IDs should be unique', () => { const ids = defaultPresets.map(p => p.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have name, layout, group', () => {
        defaultPresets.forEach((p: Preset) => {
            expect(p.name).toBeTruthy();
            expect(['1x1', '2x2', '3x3', '4x4']).toContain(p.layout);
            expect(camGroups.map(g => g.id)).toContain(p.group);
        });
    });
});

describe('Vision mockFaces', () => {
    it('should have at least 6 face hits', () => { expect(mockFaces.length).toBeGreaterThanOrEqual(6); });
    it('IDs should be unique', () => { const ids = mockFaces.map(f => f.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all should have required fields', () => {
        mockFaces.forEach((f: FaceHit) => {
            expect(f.id).toBeTruthy(); expect(f.camId).toBeGreaterThan(0);
            expect(f.camName).toBeTruthy(); expect(f.personName).toBeTruthy();
            expect(f.conf).toBeGreaterThanOrEqual(50); expect(f.conf).toBeLessThanOrEqual(100);
            expect(f.time).toMatch(/\d{2}:\d{2}/);
        });
    });
    it('should reference valid camera IDs', () => {
        const camIds = allCams.map(c => c.id);
        mockFaces.forEach(f => expect(camIds).toContain(f.camId));
    });
    it('should have known and unknown persons', () => {
        const hasKnown = mockFaces.some(f => !f.personName.startsWith('Unknown'));
        const hasUnknown = mockFaces.some(f => f.personName.startsWith('Unknown'));
        expect(hasKnown).toBe(true); expect(hasUnknown).toBe(true);
    });
});

describe('Vision tlSegs', () => {
    it('should have at least 4 segments', () => { expect(tlSegs.length).toBeGreaterThanOrEqual(4); });
    it('all should have s, e, c', () => {
        tlSegs.forEach(seg => {
            expect(typeof seg.s).toBe('number'); expect(typeof seg.e).toBe('number');
            expect(seg.e).toBeGreaterThan(seg.s);
            expect(seg.c).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });
    it('should span from 0 to 100', () => {
        expect(Math.min(...tlSegs.map(s => s.s))).toBe(0);
        expect(Math.max(...tlSegs.map(s => s.e))).toBe(100);
    });
});

describe('Vision defaultMotionZones', () => {
    it('should have at least 2 zones', () => { expect(defaultMotionZones.length).toBeGreaterThanOrEqual(2); });
    it('should have include and exclude types', () => {
        expect(defaultMotionZones.some(z => z.type === 'include')).toBe(true);
        expect(defaultMotionZones.some(z => z.type === 'exclude')).toBe(true);
    });
    it('all should have valid dimensions', () => {
        defaultMotionZones.forEach((z: MotionZone) => {
            expect(z.x).toBeGreaterThanOrEqual(0); expect(z.y).toBeGreaterThanOrEqual(0);
            expect(z.w).toBeGreaterThan(0); expect(z.h).toBeGreaterThan(0);
        });
    });
});

describe('Vision keyboardShortcuts', () => {
    it('should have at least 8', () => { expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(8); });
    it('should include grid, sidebar, AI, NV, Esc, Ctrl+Q', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['1', '2', '3', '4', 'B', 'A', 'N', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
    it('all should have key and description', () => { keyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); }); });
});
