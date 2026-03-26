/**
 * ARGUX — Persons Page Tests
 * Run: npx vitest run resources/js/tests/Persons.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
    mockPersons, risks, riskColors, statusColors, genders, nationalities, countries,
    allLanguages, religions, statuses, personsKeyboardShortcuts
} from '../mock/persons';
import type { Risk, Status } from '../mock/persons';

describe('Persons risks', () => {
    it('should have 5 risk levels', () => { expect(risks.length).toBe(5); });
    it('should include No Risk, Low, Medium, High, Critical', () => {
        ['No Risk', 'Low', 'Medium', 'High', 'Critical'].forEach(r => expect(risks).toContain(r));
    });
    it('all should have colors', () => { risks.forEach(r => expect(riskColors[r]).toMatch(/^#[0-9a-f]{6}$/i)); });
});

describe('Persons statuses', () => {
    it('should have 5 statuses', () => { expect(statuses.length).toBe(5); });
    it('should include Active, Inactive, Deleted, Suspended, Under Review', () => {
        ['Active', 'Inactive', 'Deleted', 'Suspended', 'Under Review'].forEach(s => expect(statuses).toContain(s));
    });
    it('all should have colors', () => { statuses.forEach(s => expect(statusColors[s]).toMatch(/^#[0-9a-f]{6}$/i)); });
});

describe('Persons genders', () => {
    it('should have 3 genders', () => { expect(genders.length).toBe(3); });
    it('should include Male, Female, Other', () => { ['Male', 'Female', 'Other'].forEach(g => expect(genders).toContain(g)); });
});

describe('Persons nationalities', () => {
    it('should have at least 100 nationalities', () => { expect(nationalities.length).toBeGreaterThanOrEqual(100); });
    it('should include Croatian, American, German, Chinese, Russian', () => {
        ['Croatian', 'American', 'German', 'Chinese', 'Russian'].forEach(n => expect(nationalities).toContain(n));
    });
    it('should be alphabetically sorted', () => {
        for (let i = 1; i < nationalities.length; i++) {
            expect(nationalities[i].localeCompare(nationalities[i - 1])).toBeGreaterThanOrEqual(0);
        }
    });
});

describe('Persons countries', () => {
    it('should have at least 100 countries', () => { expect(countries.length).toBeGreaterThanOrEqual(100); });
    it('should include Croatia, United States, Germany, China', () => {
        ['Croatia', 'United States', 'Germany', 'China'].forEach(c => expect(countries).toContain(c));
    });
});

describe('Persons allLanguages', () => {
    it('should have at least 50 languages', () => { expect(allLanguages.length).toBeGreaterThanOrEqual(50); });
    it('should include English, Croatian, Arabic, Chinese (Mandarin)', () => {
        ['English', 'Croatian', 'Arabic', 'Chinese (Mandarin)'].forEach(l => expect(allLanguages).toContain(l));
    });
});

describe('Persons religions', () => {
    it('should have at least 20 religions', () => { expect(religions.length).toBeGreaterThanOrEqual(20); });
    it('should include Islam — Sunni, Christianity — Catholic, Judaism, None', () => {
        ['Islam — Sunni', 'Christianity — Catholic', 'Judaism', 'None'].forEach(r => expect(religions).toContain(r));
    });
});

describe('Persons mockPersons', () => {
    it('should have at least 20 persons', () => { expect(mockPersons.length).toBeGreaterThanOrEqual(20); });
    it('IDs should be unique', () => { const ids = mockPersons.map(p => p.id); expect(new Set(ids).size).toBe(ids.length); });
    it('UUIDs should be unique', () => { const uuids = mockPersons.map(p => p.uuid); expect(new Set(uuids).size).toBe(uuids.length); });
    it('all should have required fields', () => {
        mockPersons.forEach(p => {
            expect(p.id).toBeGreaterThan(0);
            expect(p.uuid).toMatch(/^[0-9a-f-]+$/i);
            expect(p.firstName).toBeTruthy();
            expect(p.lastName).toBeTruthy();
            expect(p.email).toContain('@');
            expect(p.phone).toBeTruthy();
            expect(p.nationality).toBeTruthy();
            expect(p.country).toBeTruthy();
            expect(p.gender).toBeTruthy();
            expect(p.dob).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(risks as readonly string[]).toContain(p.risk);
            expect(statuses as readonly string[]).toContain(p.status);
        });
    });
    it('should span multiple risk levels', () => {
        const riskSet = new Set(mockPersons.map(p => p.risk));
        expect(riskSet.size).toBeGreaterThanOrEqual(4);
    });
    it('should span multiple statuses', () => {
        const statusSet = new Set(mockPersons.map(p => p.status));
        expect(statusSet.size).toBeGreaterThanOrEqual(3);
    });
    it('should span multiple nationalities', () => {
        const natSet = new Set(mockPersons.map(p => p.nationality));
        expect(natSet.size).toBeGreaterThanOrEqual(10);
    });
    it('should have both male and female persons', () => {
        expect(mockPersons.filter(p => p.gender === 'Male').length).toBeGreaterThanOrEqual(5);
        expect(mockPersons.filter(p => p.gender === 'Female').length).toBeGreaterThanOrEqual(3);
    });
    it('should have Critical risk persons', () => {
        expect(mockPersons.filter(p => p.risk === 'Critical').length).toBeGreaterThanOrEqual(2);
    });
    it('key subjects should exist', () => {
        const horvat = mockPersons.find(p => p.lastName === 'Horvat' && p.firstName === 'Marko');
        expect(horvat).toBeTruthy();
        expect(horvat!.risk).toBe('Critical');
        const mendoza = mockPersons.find(p => p.lastName === 'Mendoza');
        expect(mendoza).toBeTruthy();
        expect(mendoza!.risk).toBe('Critical');
    });
    it('should have persons with avatars', () => {
        expect(mockPersons.filter(p => p.avatar).length).toBeGreaterThanOrEqual(5);
    });
    it('emails should be valid format', () => {
        mockPersons.forEach(p => {
            expect(p.email).toMatch(/.+@.+\..+/);
        });
    });
});

describe('Persons keyboardShortcuts', () => {
    it('should have at least 6', () => { expect(personsKeyboardShortcuts.length).toBeGreaterThanOrEqual(6); });
    it('should include N, F, S, R, Esc, Ctrl+Q', () => {
        const keys = personsKeyboardShortcuts.map(s => s.key);
        ['N', 'F', 'S', 'R', 'Esc', 'Ctrl+Q'].forEach(k => expect(keys).toContain(k));
    });
    it('all should have key and description', () => {
        personsKeyboardShortcuts.forEach(s => { expect(s.key).toBeTruthy(); expect(s.description).toBeTruthy(); });
    });
});
