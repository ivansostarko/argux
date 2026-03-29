/**
 * ARGUX — UAV Fleet Management Page Tests
 * Tests for mock data integrity, type/status/class configs, and data consistency
 *
 * Run: npx vitest run resources/js/tests/UAV.test.ts
 */
import { describe, it, expect } from 'vitest';
import {
    mockUAVs, uavStatusConfig, uavTypeConfig, uavClassConfig,
    type UAV, type UAVStatus, type UAVType, type UAVClass,
} from '../mock/uav';

// ═══════════════════════════════════════════════════════════════
// Status Config Tests
// ═══════════════════════════════════════════════════════════════

describe('UAV uavStatusConfig', () => {
    const statuses = Object.keys(uavStatusConfig) as UAVStatus[];

    it('should have 6 statuses', () => {
        expect(statuses.length).toBe(6);
    });

    it('should include all required statuses', () => {
        const required: UAVStatus[] = ['operational', 'standby', 'deployed', 'maintenance', 'lost', 'retired'];
        required.forEach(s => {
            expect(uavStatusConfig[s]).toBeDefined();
        });
    });

    it('all statuses should have label, color, and icon', () => {
        statuses.forEach(s => {
            expect(uavStatusConfig[s].label).toBeTruthy();
            expect(uavStatusConfig[s].color).toMatch(/^#[0-9a-f]{6}$/i);
            expect(uavStatusConfig[s].icon).toBeTruthy();
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Type Config Tests
// ═══════════════════════════════════════════════════════════════

describe('UAV uavTypeConfig', () => {
    const types = Object.keys(uavTypeConfig) as UAVType[];

    it('should have 6 UAV types', () => {
        expect(types.length).toBe(6);
    });

    it('should include all required types', () => {
        const required: UAVType[] = ['fixed-wing', 'quadcopter', 'hexacopter', 'octocopter', 'vtol', 'micro'];
        required.forEach(t => {
            expect(uavTypeConfig[t]).toBeDefined();
        });
    });

    it('all types should have label, color, and icon', () => {
        types.forEach(t => {
            expect(uavTypeConfig[t].label).toBeTruthy();
            expect(uavTypeConfig[t].color).toMatch(/^#[0-9a-f]{6}$/i);
            expect(uavTypeConfig[t].icon).toBeTruthy();
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Class Config Tests
// ═══════════════════════════════════════════════════════════════

describe('UAV uavClassConfig', () => {
    const classes = Object.keys(uavClassConfig) as UAVClass[];

    it('should have 5 UAV classes', () => {
        expect(classes.length).toBe(5);
    });

    it('should include all required classes', () => {
        const required: UAVClass[] = ['tactical', 'reconnaissance', 'surveillance', 'cargo', 'communication'];
        required.forEach(c => {
            expect(uavClassConfig[c]).toBeDefined();
        });
    });

    it('all classes should have label and color', () => {
        classes.forEach(c => {
            expect(uavClassConfig[c].label).toBeTruthy();
            expect(uavClassConfig[c].color).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// Mock UAV Data Tests
// ═══════════════════════════════════════════════════════════════

describe('UAV mockUAVs', () => {
    it('should have 10 UAVs', () => {
        expect(mockUAVs.length).toBe(10);
    });

    it('all UAVs should have required fields', () => {
        mockUAVs.forEach((u: UAV) => {
            expect(u.id).toBeGreaterThan(0);
            expect(u.callsign).toBeTruthy();
            expect(u.model).toBeTruthy();
            expect(u.manufacturer).toBeTruthy();
            expect(u.serialNumber).toBeTruthy();
            expect(u.type).toBeTruthy();
            expect(u.uavClass).toBeTruthy();
            expect(u.status).toBeTruthy();
            expect(typeof u.weight).toBe('number');
            expect(typeof u.maxSpeed).toBe('number');
            expect(typeof u.endurance).toBe('number');
            expect(typeof u.batteryLevel).toBe('number');
            expect(typeof u.totalFlightHours).toBe('number');
            expect(typeof u.totalFlights).toBe('number');
        });
    });

    it('UAV IDs should be unique', () => {
        const ids = mockUAVs.map(u => u.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('callsigns should be unique', () => {
        const cs = mockUAVs.map(u => u.callsign);
        expect(new Set(cs).size).toBe(cs.length);
    });

    it('all types should be valid', () => {
        const validTypes = Object.keys(uavTypeConfig);
        mockUAVs.forEach(u => {
            expect(validTypes).toContain(u.type);
        });
    });

    it('all statuses should be valid', () => {
        const validStatuses = Object.keys(uavStatusConfig);
        mockUAVs.forEach(u => {
            expect(validStatuses).toContain(u.status);
        });
    });

    it('all classes should be valid', () => {
        const validClasses = Object.keys(uavClassConfig);
        mockUAVs.forEach(u => {
            expect(validClasses).toContain(u.uavClass);
        });
    });

    it('battery levels should be 0-100', () => {
        mockUAVs.forEach(u => {
            expect(u.batteryLevel).toBeGreaterThanOrEqual(0);
            expect(u.batteryLevel).toBeLessThanOrEqual(100);
        });
    });

    it('should have UAVs across multiple types', () => {
        const uniqueTypes = new Set(mockUAVs.map(u => u.type));
        expect(uniqueTypes.size).toBeGreaterThanOrEqual(5);
    });

    it('should have UAVs across multiple statuses', () => {
        const uniqueStatuses = new Set(mockUAVs.map(u => u.status));
        expect(uniqueStatuses.size).toBeGreaterThanOrEqual(4);
    });

    it('should have UAVs with sensors', () => {
        const withSensors = mockUAVs.filter(u => u.sensors.length > 0);
        expect(withSensors.length).toBeGreaterThanOrEqual(8);
    });

    it('should have at least one UAV with each sensor capability', () => {
        expect(mockUAVs.some(u => u.hasGPS)).toBe(true);
        expect(mockUAVs.some(u => u.hasRTK)).toBe(true);
        expect(mockUAVs.some(u => u.hasThermal)).toBe(true);
        expect(mockUAVs.some(u => u.hasLiDAR)).toBe(true);
        expect(mockUAVs.some(u => u.hasNightVision)).toBe(true);
        expect(mockUAVs.some(u => u.hasEW)).toBe(true);
    });

    it('should have both assigned and unassigned UAVs', () => {
        const assigned = mockUAVs.filter(u => u.assignedOperator);
        const unassigned = mockUAVs.filter(u => !u.assignedOperator);
        expect(assigned.length).toBeGreaterThanOrEqual(3);
        expect(unassigned.length).toBeGreaterThanOrEqual(1);
    });

    it('all UAVs should have notes', () => {
        mockUAVs.forEach(u => {
            expect(u.notes).toBeTruthy();
        });
    });
});
