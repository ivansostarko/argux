/**
 * ARGUX — Face Recognition Page Tests
 * Run: npx vitest run resources/js/tests/FaceRecognition.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
    mockCaptures, cameras, statusColors, statusIcons,
    allCameras, allMatchedPersons, allOps, keyboardShortcuts,
} from '../mock/faceRecognition';
import type { MatchStatus, ViewTab, FaceCapture } from '../mock/faceRecognition';

describe('FaceRecognition statusColors/Icons', () => {
    it('should cover all 4 match statuses', () => {
        const statuses: MatchStatus[] = ['Confirmed Match', 'Possible Match', 'No Match', 'Pending Review'];
        statuses.forEach(s => {
            expect(statusColors[s]).toMatch(/^#[0-9a-f]{6}$/i);
            expect(statusIcons[s]).toBeTruthy();
        });
    });
});

describe('FaceRecognition cameras', () => {
    it('should have at least 8 cameras', () => {
        expect(cameras.length).toBeGreaterThanOrEqual(8);
    });
    it('IDs should be unique', () => {
        const ids = cameras.map(c => c.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
    it('all should have name and location', () => {
        cameras.forEach(c => {
            expect(c.name).toBeTruthy();
            expect(c.location).toBeTruthy();
        });
    });
});

describe('FaceRecognition mockCaptures', () => {
    it('should have at least 12 captures', () => {
        expect(mockCaptures.length).toBeGreaterThanOrEqual(12);
    });

    it('IDs should be unique', () => {
        const ids = mockCaptures.map(c => c.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all should have required fields', () => {
        mockCaptures.forEach((c: FaceCapture) => {
            expect(c.id).toBeTruthy();
            expect(['Confirmed Match', 'Possible Match', 'No Match', 'Pending Review']).toContain(c.status);
            expect(c.cameraName).toBeTruthy();
            expect(typeof c.lat).toBe('number');
            expect(typeof c.lng).toBe('number');
            expect(c.location).toBeTruthy();
            expect(c.timestamp).toBeTruthy();
            expect(c.timeAgo).toBeTruthy();
            expect(typeof c.confidence).toBe('number');
            expect(c.confidence).toBeGreaterThanOrEqual(0);
            expect(c.confidence).toBeLessThanOrEqual(100);
            expect(typeof c.quality).toBe('number');
            expect(c.tags.length).toBeGreaterThan(0);
        });
    });

    it('confirmed matches should have confidence > 0 and personId', () => {
        const confirmed = mockCaptures.filter(c => c.status === 'Confirmed Match');
        expect(confirmed.length).toBeGreaterThanOrEqual(5);
        confirmed.forEach(c => {
            expect(c.confidence).toBeGreaterThan(0);
            expect(c.personId).not.toBeNull();
            expect(c.personName).toBeTruthy();
        });
    });

    it('possible matches should have confidence > 0', () => {
        const possible = mockCaptures.filter(c => c.status === 'Possible Match');
        expect(possible.length).toBeGreaterThanOrEqual(1);
        possible.forEach(c => {
            expect(c.confidence).toBeGreaterThan(0);
        });
    });

    it('no match / pending should have confidence 0 and no personId', () => {
        const unmatched = mockCaptures.filter(c => c.status === 'No Match' || c.status === 'Pending Review');
        expect(unmatched.length).toBeGreaterThanOrEqual(1);
        unmatched.forEach(c => {
            expect(c.confidence).toBe(0);
            expect(c.personId).toBeNull();
        });
    });

    it('should have captures with disguises', () => {
        const disguised = mockCaptures.filter(c => c.disguise !== 'None');
        expect(disguised.length).toBeGreaterThanOrEqual(2);
    });

    it('should have captures from multiple cameras', () => {
        const uniqueCams = new Set(mockCaptures.map(c => c.cameraName));
        expect(uniqueCams.size).toBeGreaterThanOrEqual(4);
    });

    it('should have captures from multiple persons', () => {
        const uniquePersons = new Set(mockCaptures.filter(c => c.personId).map(c => c.personId));
        expect(uniquePersons.size).toBeGreaterThanOrEqual(4);
    });
});

describe('FaceRecognition derived lists', () => {
    it('allCameras should be sorted', () => {
        for (let i = 1; i < allCameras.length; i++) {
            expect(allCameras[i] >= allCameras[i - 1]).toBe(true);
        }
    });

    it('allMatchedPersons should have unique ids', () => {
        const ids = allMatchedPersons.map(p => p.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('allMatchedPersons should have names', () => {
        allMatchedPersons.forEach(p => {
            expect(p.id).toBeGreaterThan(0);
            expect(p.name).toBeTruthy();
        });
    });

    it('allOps should have at least 1 operation', () => {
        expect(allOps.length).toBeGreaterThanOrEqual(1);
    });

    it('allOps should not have empty strings', () => {
        allOps.forEach(o => expect(o.length).toBeGreaterThan(0));
    });
});

describe('FaceRecognition keyboardShortcuts', () => {
    it('should have at least 6 shortcuts', () => {
        expect(keyboardShortcuts.length).toBeGreaterThanOrEqual(6);
    });

    it('should include Ctrl+Q, F, R, Esc, 1-3', () => {
        const keys = keyboardShortcuts.map(s => s.key);
        ['Ctrl+Q', 'F', 'R', 'Esc', '1', '2', '3'].forEach(k =>
            expect(keys).toContain(k)
        );
    });

    it('all should have key and description', () => {
        keyboardShortcuts.forEach(s => {
            expect(s.key).toBeTruthy();
            expect(s.description).toBeTruthy();
        });
    });
});

describe('FaceRecognition ViewTab type', () => {
    it('should allow all 3 view modes', () => {
        const views: ViewTab[] = ['captures', 'search', 'stats'];
        expect(views.length).toBe(3);
    });
});
