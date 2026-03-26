/**
 * ARGUX — Vision Camera Wall Mock Data
 * Camera groups, presets, face hits, timeline segments, shortcuts
 */
import { mockDevices, type Device } from './devices';

export const VIDEO_SRC = 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/rtl_direkt.mp4';
export const allCams: Device[] = mockDevices.filter(d => d.type === 'Public Camera' || d.type === 'Hidden Camera' || d.type === 'Private Camera');
export const PTZ_IDS = [5, 17, 19];

export interface AiBox { id: string; type: 'face' | 'person' | 'vehicle' | 'lpr'; label: string; conf: number; x: number; y: number; w: number; h: number; color: string; personName?: string; }
export interface CamAlert { id: string; sev: 'critical' | 'high' | 'medium'; title: string; time: string; icon: string; }
export interface CamState { dets: AiBox[]; rec: boolean; nv: boolean; paused: boolean; muted: boolean; vol: number; audioLv: number; fps: number; bitrate: string; bw: number; alerts: CamAlert[]; zoom: number; playbackRate: number; }
export interface FaceHit { id: string; camId: number; camName: string; conf: number; personName: string; time: string; }
export interface MotionZone { id: string; camId: number; type: 'include' | 'exclude'; x: number; y: number; w: number; h: number; }
export interface Preset { id: string; name: string; layout: string; group: string; }
export type Grid = '1x1' | '2x2' | '3x3' | '4x4';
export type SidePanel = 'detail' | 'faces' | 'bandwidth' | 'presets' | 'ptz' | 'timeline' | 'motionZones' | null;

export const camGroups = [
    { id: 'all', label: 'All Cameras', icon: '🔍' },
    { id: 'zagreb', label: 'Zagreb', icon: '🏙️', ids: [1, 8, 14, 17] },
    { id: 'intl', label: 'International', icon: '🌍', ids: [3, 5, 7, 11, 12, 18, 19] },
    { id: 'hawk', label: 'OP HAWK', icon: '🦅', ids: [1, 5, 8, 14, 18] },
    { id: 'ptz', label: 'PTZ', icon: '🎛️', ids: PTZ_IDS },
    { id: 'covert', label: 'Covert', icon: '🕵️', ids: [3, 7, 12] },
];

export const defaultPresets: Preset[] = [
    { id: 'p1', name: 'Zagreb Only', layout: '2x2', group: 'zagreb' },
    { id: 'p2', name: 'Port Surveillance', layout: '2x2', group: 'intl' },
    { id: 'p3', name: 'Operation HAWK', layout: '3x3', group: 'hawk' },
    { id: 'p4', name: 'All 4×4', layout: '4x4', group: 'all' },
    { id: 'p5', name: 'Covert Ops', layout: '2x2', group: 'covert' },
];

export const mockFaces: FaceHit[] = [
    { id: 'fh1', camId: 1, camName: 'Zagreb HQ', conf: 94, personName: 'Marko Horvat', time: '10:12' },
    { id: 'fh2', camId: 8, camName: 'Street A1', conf: 87, personName: 'Ivan Babić', time: '10:08' },
    { id: 'fh3', camId: 14, camName: 'Airport', conf: 91, personName: 'Unknown #247', time: '10:05' },
    { id: 'fh4', camId: 5, camName: 'Dubai Port', conf: 78, personName: 'Omar Hassan', time: '09:58' },
    { id: 'fh5', camId: 18, camName: 'A1 Highway', conf: 82, personName: 'Carlos Mendoza', time: '09:52' },
    { id: 'fh6', camId: 1, camName: 'Zagreb HQ', conf: 96, personName: 'Ana Kovačević', time: '09:45' },
    { id: 'fh7', camId: 11, camName: 'Rashid Parking', conf: 73, personName: 'Unknown #312', time: '09:38' },
    { id: 'fh8', camId: 8, camName: 'Street A1', conf: 88, personName: 'Marko Horvat', time: '09:30' },
];

export const tlSegs = [
    { s: 0, e: 15, c: '#22c55e' }, { s: 20, e: 45, c: '#22c55e' }, { s: 45, e: 50, c: '#ef4444' },
    { s: 50, e: 70, c: '#22c55e' }, { s: 70, e: 75, c: '#f59e0b' }, { s: 75, e: 100, c: '#22c55e' },
];

export const defaultMotionZones: MotionZone[] = [
    { id: 'mz1', camId: 1, type: 'include', x: 10, y: 20, w: 40, h: 50 },
    { id: 'mz2', camId: 8, type: 'exclude', x: 60, y: 60, w: 30, h: 30 },
];

export const keyboardShortcuts = [
    { key: '1', description: '1×1 grid' },
    { key: '2', description: '2×2 grid' },
    { key: '3', description: '3×3 grid' },
    { key: '4', description: '4×4 grid' },
    { key: 'B', description: 'Toggle sidebar' },
    { key: 'A', description: 'Toggle AI detections' },
    { key: 'I', description: 'Toggle camera info' },
    { key: 'N', description: 'Toggle night vision' },
    { key: 'Esc', description: 'Exit fullscreen / close' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
