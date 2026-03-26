/**
 * ARGUX — Face Recognition Mock Data
 * 20 captures, 11 cameras, status/match configs, shortcuts
 */
import type { Risk } from './persons';

export type MatchStatus = 'Confirmed Match' | 'Possible Match' | 'No Match' | 'Pending Review';
export type ViewTab = 'captures' | 'search' | 'stats';

export interface FaceCapture {
    id: string; captureUrl: string;
    personId: number | null; personName: string; personAvatar: string; personRisk: Risk;
    confidence: number; status: MatchStatus;
    cameraId: number | null; cameraName: string;
    lat: number; lng: number; location: string;
    timestamp: string; timeAgo: string; operationCode: string;
    disguise: string; companions: string; quality: number; tags: string[];
}

export const statusColors: Record<MatchStatus, string> = { 'Confirmed Match': '#22c55e', 'Possible Match': '#f59e0b', 'No Match': '#6b7280', 'Pending Review': '#8b5cf6' };
export const statusIcons: Record<MatchStatus, string> = { 'Confirmed Match': '✅', 'Possible Match': '🟡', 'No Match': '❌', 'Pending Review': '🔍' };

export const cameras = [
    { id: 1, name: 'Zagreb HQ Entrance', location: 'Savska cesta 120, Zagreb' },
    { id: 3, name: 'Split Hotel Marjan Lobby', location: 'Hotel Marjan, Split' },
    { id: 5, name: 'Dubai Port Camera', location: 'Jebel Ali Port, Dubai' },
    { id: 8, name: 'Zagreb Street Cam A1', location: 'Ilica / Frankopanska, Zagreb' },
    { id: 11, name: 'Rashid Holdings Parking', location: 'Dubai, UAE' },
    { id: 14, name: 'Zagreb Airport Cargo', location: 'Zagreb Airport' },
    { id: 15, name: 'Maksimir Park Cam', location: 'Maksimir Park, Zagreb' },
    { id: 16, name: 'Port Terminal Cam', location: 'Port Terminal, Zagreb' },
    { id: 17, name: 'Diplomatic Quarter Cam', location: 'Embassy Row, Zagreb' },
];

const av = 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/photo.jpg';

export const mockCaptures: FaceCapture[] = [
    { id: 'fc-01', captureUrl: '', personId: 1, personName: 'Marko Horvat', personAvatar: av, personRisk: 'Critical', confidence: 94, status: 'Confirmed Match', cameraId: 8, cameraName: 'Zagreb Street Cam A1', lat: 45.813, lng: 15.977, location: 'Trg bana Jelačića, Zagreb', timestamp: '2026-03-24 09:48:33', timeAgo: '26m', operationCode: 'HAWK', disguise: 'Baseball cap', companions: 'Alone', quality: 92, tags: ['HAWK', 'priority', 'disguise'] },
    { id: 'fc-02', captureUrl: '', personId: 1, personName: 'Marko Horvat', personAvatar: av, personRisk: 'Critical', confidence: 91, status: 'Confirmed Match', cameraId: 16, cameraName: 'Port Terminal Cam', lat: 45.818, lng: 15.992, location: 'Port Terminal, Zagreb', timestamp: '2026-03-24 06:42:15', timeAgo: '3h', operationCode: 'HAWK', disguise: 'Sunglasses', companions: 'With 1 unknown male', quality: 88, tags: ['HAWK', 'port'] },
    { id: 'fc-03', captureUrl: '', personId: 1, personName: 'Marko Horvat', personAvatar: av, personRisk: 'Critical', confidence: 97, status: 'Confirmed Match', cameraId: 1, cameraName: 'Zagreb HQ Entrance', lat: 45.815, lng: 15.982, location: 'Savska cesta 120, Zagreb', timestamp: '2026-03-23 17:30:00', timeAgo: '17h', operationCode: 'HAWK', disguise: 'None', companions: 'With Babić', quality: 96, tags: ['HAWK', 'HQ'] },
    { id: 'fc-04', captureUrl: '', personId: 12, personName: 'Ivan Babić', personAvatar: av, personRisk: 'High', confidence: 87, status: 'Confirmed Match', cameraId: 15, cameraName: 'Maksimir Park Cam', lat: 45.820, lng: 15.960, location: 'Maksimir Park, Zagreb', timestamp: '2026-03-24 08:12:50', timeAgo: '2h', operationCode: 'HAWK', disguise: 'None', companions: 'Alone', quality: 85, tags: ['HAWK'] },
    { id: 'fc-05', captureUrl: '', personId: 12, personName: 'Ivan Babić', personAvatar: av, personRisk: 'High', confidence: 78, status: 'Possible Match', cameraId: 17, cameraName: 'Diplomatic Quarter Cam', lat: 45.813, lng: 15.977, location: 'Embassy Row, Zagreb', timestamp: '2026-03-23 14:22:00', timeAgo: '20h', operationCode: 'HAWK', disguise: 'Hat + Scarf', companions: 'Alone', quality: 62, tags: ['HAWK', 'diplomatic', 'disguise'] },
    { id: 'fc-06', captureUrl: '', personId: 2, personName: 'Ana Kovačević', personAvatar: av, personRisk: 'High', confidence: 91, status: 'Confirmed Match', cameraId: 1, cameraName: 'Zagreb HQ Entrance', lat: 45.815, lng: 15.982, location: 'Savska cesta 120, Zagreb', timestamp: '2026-03-24 08:05:15', timeAgo: '2h', operationCode: '', disguise: 'None', companions: 'Alone', quality: 93, tags: ['associate'] },
    { id: 'fc-07', captureUrl: '', personId: 3, personName: 'Ahmed Al-Rashid', personAvatar: av, personRisk: 'Critical', confidence: 89, status: 'Confirmed Match', cameraId: 14, cameraName: 'Zagreb Airport Cargo', lat: 45.743, lng: 16.069, location: 'Airport Cargo, Zagreb', timestamp: '2026-03-24 07:25:00', timeAgo: '3h', operationCode: 'GLACIER', disguise: 'None', companions: 'With bodyguards', quality: 90, tags: ['GLACIER', 'airport'] },
    { id: 'fc-08', captureUrl: '', personId: 7, personName: 'Omar Hassan', personAvatar: av, personRisk: 'High', confidence: 82, status: 'Confirmed Match', cameraId: 16, cameraName: 'Port Terminal Cam', lat: 45.818, lng: 15.992, location: 'Port Terminal, Zagreb', timestamp: '2026-03-23 16:05:00', timeAgo: '18h', operationCode: 'HAWK', disguise: 'None', companions: 'Alone', quality: 80, tags: ['HAWK', 'port'] },
    { id: 'fc-09', captureUrl: '', personId: 7, personName: 'Omar Hassan', personAvatar: av, personRisk: 'High', confidence: 68, status: 'Possible Match', cameraId: 5, cameraName: 'Dubai Port Camera', lat: 25.044, lng: 55.085, location: 'Jebel Ali Port, Dubai', timestamp: '2026-03-22 14:30:00', timeAgo: '2d', operationCode: 'HAWK', disguise: 'Keffiyeh', companions: '3 unknown', quality: 55, tags: ['HAWK', 'dubai', 'disguise'] },
    { id: 'fc-10', captureUrl: '', personId: 9, personName: 'Carlos Mendoza', personAvatar: av, personRisk: 'Critical', confidence: 76, status: 'Possible Match', cameraId: 8, cameraName: 'Zagreb Street Cam A1', lat: 45.813, lng: 15.978, location: 'Ilica, Zagreb', timestamp: '2026-03-24 01:30:00', timeAgo: '9h', operationCode: 'HAWK', disguise: 'Hood + Mask', companions: 'Alone', quality: 48, tags: ['HAWK', 'night', 'heavy-disguise'] },
    { id: 'fc-11', captureUrl: '', personId: 9, personName: 'Carlos Mendoza', personAvatar: av, personRisk: 'Critical', confidence: 88, status: 'Confirmed Match', cameraId: 1, cameraName: 'Zagreb HQ Entrance', lat: 45.815, lng: 15.982, location: 'Near Savska cesta', timestamp: '2026-03-24 09:14:00', timeAgo: '1h', operationCode: 'HAWK', disguise: 'None', companions: 'Alone', quality: 91, tags: ['HAWK'] },
    { id: 'fc-12', captureUrl: '', personId: null, personName: '', personAvatar: '', personRisk: 'No Risk', confidence: 0, status: 'No Match', cameraId: 14, cameraName: 'Zagreb Airport Cargo', lat: 45.743, lng: 16.069, location: 'Airport Cargo, Zagreb', timestamp: '2026-03-24 07:15:45', timeAgo: '3h', operationCode: '', disguise: 'None', companions: 'Alone', quality: 82, tags: ['unknown', 'airport'] },
    { id: 'fc-13', captureUrl: '', personId: null, personName: '', personAvatar: '', personRisk: 'No Risk', confidence: 0, status: 'Pending Review', cameraId: 5, cameraName: 'Dubai Port Camera', lat: 25.044, lng: 55.085, location: 'Jebel Ali Port, Dubai', timestamp: '2026-03-24 09:55:00', timeAgo: '19m', operationCode: '', disguise: 'None', companions: 'On vessel deck', quality: 71, tags: ['unregistered-vessel', 'manual-review'] },
    { id: 'fc-14', captureUrl: '', personId: 1, personName: 'Marko Horvat', personAvatar: av, personRisk: 'Critical', confidence: 96, status: 'Confirmed Match', cameraId: 8, cameraName: 'Zagreb Street Cam A1', lat: 45.813, lng: 15.978, location: 'Frankopanska, Zagreb', timestamp: '2026-03-23 08:15:00', timeAgo: '26h', operationCode: 'HAWK', disguise: 'None', companions: 'Alone', quality: 95, tags: ['HAWK'] },
    { id: 'fc-15', captureUrl: '', personId: null, personName: '', personAvatar: '', personRisk: 'No Risk', confidence: 0, status: 'Pending Review', cameraId: 1, cameraName: 'Zagreb HQ Entrance', lat: 45.815, lng: 15.982, location: 'Savska cesta 120', timestamp: '2026-03-24 02:30:00', timeAgo: '8h', operationCode: '', disguise: 'None', companions: 'Alone', quality: 78, tags: ['after-hours', 'manual-review'] },
];

export const allCameras = [...new Set(mockCaptures.map(c => c.cameraName))].sort();
export const allMatchedPersons = [...new Set(mockCaptures.filter(c => c.personId).map(c => ({ id: c.personId!, name: c.personName })))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number; name: string }[]);
export const allOps = [...new Set(mockCaptures.map(c => c.operationCode).filter(Boolean))];

export const keyboardShortcuts = [
    { key: '1', description: 'Captures tab' },
    { key: '2', description: 'Face Search tab' },
    { key: '3', description: 'Statistics tab' },
    { key: 'F', description: 'Focus search' },
    { key: 'R', description: 'Reset filters' },
    { key: 'Esc', description: 'Close detail / modal' },
    { key: 'Ctrl+Q', description: 'Keyboard shortcuts' },
];
