// ═══ UAV / DRONE MANAGEMENT ═══

export type UAVStatus = 'operational' | 'standby' | 'maintenance' | 'deployed' | 'lost' | 'retired';
export type UAVType = 'fixed-wing' | 'quadcopter' | 'hexacopter' | 'octocopter' | 'vtol' | 'micro';
export type UAVClass = 'tactical' | 'reconnaissance' | 'surveillance' | 'cargo' | 'communication';

export interface UAV {
    id: number;
    callsign: string;
    model: string;
    manufacturer: string;
    type: UAVType;
    uavClass: UAVClass;
    serialNumber: string;
    status: UAVStatus;
    firmware: string;
    // Physical
    weight: number;       // kg
    maxPayload: number;   // kg
    wingspan: number;     // cm (or diagonal for multirotors)
    // Performance
    maxSpeed: number;     // km/h
    cruiseSpeed: number;  // km/h
    maxAltitude: number;  // m
    maxRange: number;     // km
    endurance: number;    // min
    // Battery/Power
    batteryType: string;
    batteryCapacity: number; // mAh
    batteryLevel: number;    // %
    batteryVoltage: number;  // V
    chargeCycles: number;
    // Sensors / Payload
    sensors: string[];
    hasGPS: boolean;
    hasRTK: boolean;
    hasThermal: boolean;
    hasLiDAR: boolean;
    hasNightVision: boolean;
    hasEW: boolean; // electronic warfare
    cameraResolution?: string;
    gimbalType?: string;
    // Communication
    dataLink: string;
    frequency: string;
    encryptedLink: boolean;
    videoFeed: boolean;
    maxDataRate: string;
    // Assignment
    assignedOperator?: string;
    assignedOperation?: string;
    assignedTeam?: string;
    homeBase: string;
    // Tracking
    lat: number | null;
    lng: number | null;
    lastFlightDate: string;
    totalFlightHours: number;
    totalFlights: number;
    lastMaintenance: string;
    nextMaintenance: string;
    // Metadata
    acquired: string;
    notes: string;
    photo: string;
}

export const uavStatusConfig: Record<UAVStatus, { label: string; color: string; icon: string }> = {
    operational: { label: 'Operational', color: '#22c55e', icon: '✅' },
    standby:     { label: 'Standby',     color: '#3b82f6', icon: '💤' },
    deployed:    { label: 'Deployed',    color: '#f59e0b', icon: '🛫' },
    maintenance: { label: 'Maintenance', color: '#8b5cf6', icon: '🔧' },
    lost:        { label: 'Lost',        color: '#ef4444', icon: '❌' },
    retired:     { label: 'Retired',     color: '#6b7280', icon: '🗄️' },
};

export const uavTypeConfig: Record<UAVType, { label: string; color: string; icon: string }> = {
    'fixed-wing': { label: 'Fixed-Wing',  color: '#3b82f6', icon: '✈️' },
    quadcopter:   { label: 'Quadcopter',   color: '#22c55e', icon: '🚁' },
    hexacopter:   { label: 'Hexacopter',   color: '#f59e0b', icon: '🚁' },
    octocopter:   { label: 'Octocopter',   color: '#8b5cf6', icon: '🚁' },
    vtol:         { label: 'VTOL',         color: '#06b6d4', icon: '🔄' },
    micro:        { label: 'Micro/Nano',   color: '#ec4899', icon: '🪰' },
};

export const uavClassConfig: Record<UAVClass, { label: string; color: string }> = {
    tactical:       { label: 'Tactical',       color: '#ef4444' },
    reconnaissance: { label: 'Reconnaissance', color: '#3b82f6' },
    surveillance:   { label: 'Surveillance',   color: '#f59e0b' },
    cargo:          { label: 'Cargo',          color: '#22c55e' },
    communication:  { label: 'Communication',  color: '#8b5cf6' },
};

export const mockUAVs: UAV[] = [
    {
        id: 1, callsign: 'HAWK-1', model: 'Bayraktar Mini', manufacturer: 'Baykar', type: 'fixed-wing', uavClass: 'tactical',
        serialNumber: 'BK-2024-00147', status: 'operational', firmware: 'v4.2.1',
        weight: 5.0, maxPayload: 1.5, wingspan: 200, maxSpeed: 120, cruiseSpeed: 70, maxAltitude: 5000, maxRange: 35, endurance: 120,
        batteryType: 'Li-Ion 6S', batteryCapacity: 22000, batteryLevel: 94, batteryVoltage: 22.2, chargeCycles: 78,
        sensors: ['EO/IR Camera', 'GPS', 'Barometer', 'IMU', 'Magnetometer'], hasGPS: true, hasRTK: true, hasThermal: true, hasLiDAR: false, hasNightVision: true, hasEW: false,
        cameraResolution: '4K 30fps', gimbalType: '3-axis stabilized',
        dataLink: 'Encrypted C2', frequency: '2.4 GHz / 5.8 GHz', encryptedLink: true, videoFeed: true, maxDataRate: '50 Mbps',
        assignedOperator: 'Cpt. Kovač', assignedOperation: 'HAWK', assignedTeam: 'Alpha',
        homeBase: 'Zagreb HQ', lat: 45.8131, lng: 15.9775, lastFlightDate: '2026-03-28',
        totalFlightHours: 342.5, totalFlights: 187, lastMaintenance: '2026-03-15', nextMaintenance: '2026-04-15',
        acquired: '2024-06-12', notes: 'Primary tactical reconnaissance platform. Upgraded EO/IR payload Q1 2026.', photo: '',
    },
    {
        id: 2, callsign: 'SHADOW-3', model: 'DJI Matrice 350 RTK', manufacturer: 'DJI', type: 'quadcopter', uavClass: 'surveillance',
        serialNumber: 'DJI-M350-HR-0023', status: 'deployed', firmware: 'v08.01.0205',
        weight: 6.47, maxPayload: 2.7, wingspan: 80, maxSpeed: 79, cruiseSpeed: 46, maxAltitude: 7000, maxRange: 20, endurance: 55,
        batteryType: 'TB65 Li-Po', batteryCapacity: 5880, batteryLevel: 67, batteryVoltage: 52.8, chargeCycles: 142,
        sensors: ['Zenmuse H20T', 'GPS/RTK', 'ADS-B Receiver', 'D-RTK 2 Base'], hasGPS: true, hasRTK: true, hasThermal: true, hasLiDAR: false, hasNightVision: false, hasEW: false,
        cameraResolution: '20MP + Thermal 640×512', gimbalType: '3-axis mechanical',
        dataLink: 'OcuSync Enterprise', frequency: '2.4 GHz / 5.8 GHz', encryptedLink: true, videoFeed: true, maxDataRate: '45 Mbps',
        assignedOperator: 'Sgt. Babić', assignedOperation: 'SHADOW', assignedTeam: 'Bravo',
        homeBase: 'Field Station Bravo', lat: 45.7922, lng: 15.9456, lastFlightDate: '2026-03-29',
        totalFlightHours: 567.2, totalFlights: 412, lastMaintenance: '2026-03-20', nextMaintenance: '2026-04-20',
        acquired: '2023-11-08', notes: 'Currently deployed on Operation SHADOW. Thermal payload for night surveillance.', photo: '',
    },
    {
        id: 3, callsign: 'EAGLE-7', model: 'Wingtra WingtraOne GEN II', manufacturer: 'Wingtra', type: 'vtol', uavClass: 'reconnaissance',
        serialNumber: 'WNG-GEN2-0087', status: 'operational', firmware: 'v3.8.0',
        weight: 4.7, maxPayload: 0.8, wingspan: 125, maxSpeed: 110, cruiseSpeed: 61, maxAltitude: 5500, maxRange: 40, endurance: 59,
        batteryType: 'Smart LiPo 6S', batteryCapacity: 18000, batteryLevel: 100, batteryVoltage: 22.8, chargeCycles: 45,
        sensors: ['Sony RX1R II 42MP', 'PPK GNSS', 'MicaSense RedEdge-P'], hasGPS: true, hasRTK: true, hasThermal: false, hasLiDAR: false, hasNightVision: false, hasEW: false,
        cameraResolution: '42MP Full-Frame', gimbalType: 'Fixed nadir mount',
        dataLink: 'WingtraLink', frequency: '2.4 GHz', encryptedLink: false, videoFeed: false, maxDataRate: '15 Mbps',
        assignedOperator: 'Lt. Marić', assignedOperation: undefined, assignedTeam: 'Mapping Unit',
        homeBase: 'Zagreb HQ', lat: null, lng: null, lastFlightDate: '2026-03-25',
        totalFlightHours: 89.3, totalFlights: 62, lastMaintenance: '2026-03-10', nextMaintenance: '2026-05-10',
        acquired: '2025-02-20', notes: 'High-resolution mapping surveys. Multispectral payload for agricultural analysis.', photo: '',
    },
    {
        id: 4, callsign: 'REAPER-2', model: 'Freefly Alta X', manufacturer: 'Freefly Systems', type: 'octocopter', uavClass: 'cargo',
        serialNumber: 'FFY-ALTAX-0019', status: 'maintenance', firmware: 'v2.5.3',
        weight: 9.9, maxPayload: 15.9, wingspan: 130, maxSpeed: 56, cruiseSpeed: 38, maxAltitude: 3000, maxRange: 8, endurance: 30,
        batteryType: 'Smart Battery 12S', batteryCapacity: 28000, batteryLevel: 0, batteryVoltage: 44.4, chargeCycles: 210,
        sensors: ['GPS', 'Barometer', 'Obstacle Avoidance'], hasGPS: true, hasRTK: false, hasThermal: false, hasLiDAR: false, hasNightVision: false, hasEW: false,
        cameraResolution: 'N/A (cargo config)', gimbalType: 'Payload mount',
        dataLink: 'Standard RC', frequency: '2.4 GHz', encryptedLink: false, videoFeed: false, maxDataRate: '5 Mbps',
        assignedOperator: undefined, assignedOperation: undefined, assignedTeam: 'Logistics',
        homeBase: 'Warehouse Delta', lat: null, lng: null, lastFlightDate: '2026-03-12',
        totalFlightHours: 412.7, totalFlights: 345, lastMaintenance: '2026-03-28', nextMaintenance: '2026-04-28',
        acquired: '2022-09-15', notes: 'Heavy-lift platform. Currently in maintenance — motor 6 replacement. Expected return: 2026-04-02.', photo: '',
    },
    {
        id: 5, callsign: 'GHOST-1', model: 'FLIR Black Hornet 4', manufacturer: 'Teledyne FLIR', type: 'micro', uavClass: 'reconnaissance',
        serialNumber: 'BH4-PRS-0312', status: 'standby', firmware: 'v6.0.1',
        weight: 0.033, maxPayload: 0, wingspan: 12, maxSpeed: 21, cruiseSpeed: 16, maxAltitude: 300, maxRange: 2, endurance: 25,
        batteryType: 'Custom LiPo', batteryCapacity: 350, batteryLevel: 100, batteryVoltage: 3.7, chargeCycles: 22,
        sensors: ['EO Camera', 'Thermal Camera', 'GPS'], hasGPS: true, hasRTK: false, hasThermal: true, hasLiDAR: false, hasNightVision: true, hasEW: false,
        cameraResolution: '1600×1200 EO + 160×120 Thermal', gimbalType: 'Body-fixed',
        dataLink: 'Digital encrypted', frequency: '2.4 GHz', encryptedLink: true, videoFeed: true, maxDataRate: '8 Mbps',
        assignedOperator: 'Sgt. Horvat', assignedOperation: undefined, assignedTeam: 'Alpha',
        homeBase: 'Zagreb HQ', lat: null, lng: null, lastFlightDate: '2026-03-22',
        totalFlightHours: 14.2, totalFlights: 38, lastMaintenance: '2026-02-28', nextMaintenance: '2026-05-28',
        acquired: '2025-08-10', notes: 'Personal reconnaissance nano-drone. Near-silent operation. Fits in palm.', photo: '',
    },
    {
        id: 6, callsign: 'CONDOR-4', model: 'senseFly eBee X', manufacturer: 'AgEagle (senseFly)', type: 'fixed-wing', uavClass: 'surveillance',
        serialNumber: 'EBEEX-2025-0044', status: 'operational', firmware: 'v7.2.4',
        weight: 1.6, maxPayload: 0.5, wingspan: 116, maxSpeed: 110, cruiseSpeed: 57, maxAltitude: 4500, maxRange: 50, endurance: 90,
        batteryType: '4S LiPo', batteryCapacity: 8000, batteryLevel: 82, batteryVoltage: 14.8, chargeCycles: 95,
        sensors: ['senseFly Aeria X', 'SODA 3D', 'RTK/PPK Module'], hasGPS: true, hasRTK: true, hasThermal: false, hasLiDAR: false, hasNightVision: false, hasEW: false,
        cameraResolution: '24MP APS-C', gimbalType: 'Fixed oblique mount',
        dataLink: 'eMotion', frequency: '2.4 GHz', encryptedLink: false, videoFeed: false, maxDataRate: '10 Mbps',
        assignedOperator: 'Op. Tomić', assignedOperation: 'PHOENIX', assignedTeam: 'Recon',
        homeBase: 'Field Station Alpha', lat: 45.8350, lng: 16.0120, lastFlightDate: '2026-03-27',
        totalFlightHours: 234.8, totalFlights: 198, lastMaintenance: '2026-03-01', nextMaintenance: '2026-06-01',
        acquired: '2025-04-01', notes: 'Long-range mapping and surveillance platform. Excellent endurance in high winds.', photo: '',
    },
    {
        id: 7, callsign: 'PHANTOM-5', model: 'DJI Mavic 3 Enterprise', manufacturer: 'DJI', type: 'quadcopter', uavClass: 'surveillance',
        serialNumber: 'DJI-M3E-HR-0078', status: 'operational', firmware: 'v01.01.0600',
        weight: 0.92, maxPayload: 0, wingspan: 38, maxSpeed: 75, cruiseSpeed: 47, maxAltitude: 6000, maxRange: 15, endurance: 45,
        batteryType: 'Intelligent Flight Battery', batteryCapacity: 5000, batteryLevel: 55, batteryVoltage: 17.6, chargeCycles: 167,
        sensors: ['Hasselblad L2D-20c', 'Tele Camera 56x Zoom', 'ADS-B', 'APAS 5.0'], hasGPS: true, hasRTK: false, hasThermal: false, hasLiDAR: false, hasNightVision: false, hasEW: false,
        cameraResolution: '20MP 4/3 CMOS + 12MP Tele', gimbalType: '3-axis mechanical',
        dataLink: 'OcuSync 3 Enterprise', frequency: '2.4 GHz / 5.8 GHz', encryptedLink: true, videoFeed: true, maxDataRate: '30 Mbps',
        assignedOperator: 'Sgt. Novak', assignedOperation: undefined, assignedTeam: 'Charlie',
        homeBase: 'Zagreb HQ', lat: 45.8150, lng: 15.9800, lastFlightDate: '2026-03-29',
        totalFlightHours: 421.6, totalFlights: 523, lastMaintenance: '2026-03-18', nextMaintenance: '2026-04-18',
        acquired: '2023-03-22', notes: 'Workhorse surveillance drone. 56x hybrid zoom for long-range identification.', photo: '',
    },
    {
        id: 8, callsign: 'VIPER-2', model: 'Skydio X10', manufacturer: 'Skydio', type: 'quadcopter', uavClass: 'tactical',
        serialNumber: 'SKD-X10D-0056', status: 'standby', firmware: 'v10.3.2',
        weight: 2.35, maxPayload: 0.35, wingspan: 52, maxSpeed: 65, cruiseSpeed: 40, maxAltitude: 6000, maxRange: 12, endurance: 35,
        batteryType: 'Intelligent Battery', batteryCapacity: 7260, batteryLevel: 100, batteryVoltage: 22.2, chargeCycles: 34,
        sensors: ['NightSense', 'EO Camera', 'Thermal Camera', 'AI Navigation', 'LiDAR Scanner'], hasGPS: true, hasRTK: true, hasThermal: true, hasLiDAR: true, hasNightVision: true, hasEW: false,
        cameraResolution: '48MP + Thermal 320×256', gimbalType: '3-axis stabilized',
        dataLink: 'Skydio Link', frequency: '5.1-5.8 GHz', encryptedLink: true, videoFeed: true, maxDataRate: '40 Mbps',
        assignedOperator: 'Lt. Jurić', assignedOperation: undefined, assignedTeam: 'Alpha',
        homeBase: 'Zagreb HQ', lat: null, lng: null, lastFlightDate: '2026-03-26',
        totalFlightHours: 52.8, totalFlights: 67, lastMaintenance: '2026-03-20', nextMaintenance: '2026-06-20',
        acquired: '2025-11-15', notes: 'AI-powered autonomous flight. Full obstacle avoidance. LiDAR + thermal package.', photo: '',
    },
    {
        id: 9, callsign: 'RELAY-1', model: 'Inspired Flight IF1200A', manufacturer: 'Inspired Flight', type: 'hexacopter', uavClass: 'communication',
        serialNumber: 'IF-1200A-0008', status: 'operational', firmware: 'v3.1.0',
        weight: 11.3, maxPayload: 5.4, wingspan: 120, maxSpeed: 50, cruiseSpeed: 35, maxAltitude: 4000, maxRange: 10, endurance: 40,
        batteryType: '12S Li-Ion', batteryCapacity: 32000, batteryLevel: 78, batteryVoltage: 44.4, chargeCycles: 88,
        sensors: ['GPS', 'Barometer', 'Compass'], hasGPS: true, hasRTK: false, hasThermal: false, hasLiDAR: false, hasNightVision: false, hasEW: true,
        cameraResolution: 'N/A', gimbalType: 'N/A',
        dataLink: 'Mesh Relay', frequency: '900 MHz / 2.4 GHz / 5.8 GHz', encryptedLink: true, videoFeed: false, maxDataRate: '100 Mbps mesh',
        assignedOperator: 'Cpl. Mandić', assignedOperation: 'CERBERUS', assignedTeam: 'Comms',
        homeBase: 'Field Station Charlie', lat: 45.8250, lng: 15.9600, lastFlightDate: '2026-03-27',
        totalFlightHours: 178.4, totalFlights: 112, lastMaintenance: '2026-03-05', nextMaintenance: '2026-04-05',
        acquired: '2024-01-20', notes: 'Communications relay platform. Extends mesh network coverage by 15km radius. EW payload available.', photo: '',
    },
    {
        id: 10, callsign: 'RAPTOR-1', model: 'AeroVironment Puma 3 AE', manufacturer: 'AeroVironment', type: 'fixed-wing', uavClass: 'tactical',
        serialNumber: 'AV-PUMA3-0231', status: 'retired', firmware: 'v5.7.8',
        weight: 6.3, maxPayload: 1.4, wingspan: 280, maxSpeed: 83, cruiseSpeed: 50, maxAltitude: 4500, maxRange: 60, endurance: 150,
        batteryType: '6S LiPo', batteryCapacity: 25000, batteryLevel: 0, batteryVoltage: 0, chargeCycles: 487,
        sensors: ['Mantis i45 EO/IR', 'GPS', 'ADS-B'], hasGPS: true, hasRTK: false, hasThermal: true, hasLiDAR: false, hasNightVision: true, hasEW: false,
        cameraResolution: 'EO/IR dual-sensor', gimbalType: '2-axis stabilized',
        dataLink: 'DDL', frequency: '1.3-2.5 GHz', encryptedLink: true, videoFeed: true, maxDataRate: '20 Mbps',
        assignedOperator: undefined, assignedOperation: undefined, assignedTeam: undefined,
        homeBase: 'Storage', lat: null, lng: null, lastFlightDate: '2025-12-14',
        totalFlightHours: 1247.3, totalFlights: 892, lastMaintenance: '2025-12-01', nextMaintenance: 'N/A',
        acquired: '2021-03-10', notes: 'Retired after 1247 flight hours. Battery degradation beyond 80%. Preserved for training reference.', photo: '',
    },
];
