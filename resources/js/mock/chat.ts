export interface ChatAttachment {
    id: string; name: string; type: 'image' | 'photo' | 'file' | 'audio' | 'video'; size: string; url?: string;
}

export interface ChatMessage {
    id: string; role: 'user' | 'assistant' | 'system';
    content: string; attachments: ChatAttachment[];
    timestamp: string;
}

export interface Conversation {
    id: string; title: string;
    personIds: string[]; orgIds: string[];
    messages: ChatMessage[];
    createdAt: string; updatedAt: string;
}

export const mockConversations: Conversation[] = [
    {
        id: 'conv-1', title: 'Alpha Security Group — Risk Assessment', personIds: ['p-1', 'p-12'], orgIds: ['o-1'],
        messages: [
            { id: 'm1-1', role: 'user', content: 'Provide a comprehensive risk assessment for Alpha Security Group and its key personnel Marko Horvat and Ivan Babić.', attachments: [], timestamp: '2026-03-18T10:00:00Z' },
            { id: 'm1-2', role: 'assistant', content: '## Risk Assessment: Alpha Security Group\n\n**Overall Risk Level: CRITICAL**\n\nAlpha Security Group (ASG), registered in Zagreb, Croatia, presents significant intelligence concerns across multiple vectors:\n\n### Key Personnel\n- **Marko Horvat (CEO)** — Risk: Critical. Subject under active surveillance since 2024. Known financial connections to Rashid Holdings International via Dubai intermediary. Multiple wire transfers flagged by AML systems. Ongoing relationship with Ana Kovačević (Serbian national, High risk).\n- **Ivan Babić (Security Director)** — Risk: High. Former Croatian Police inspector (organized crime unit). Blood relation to Nikola Jovanović. Personal vehicle flagged for suspected weapons transport.\n\n### Financial Indicators\n- Multiple transactions with entities on EU sanctions watchlist\n- Wire transfers through Dubai intermediary (Rashid Holdings connection)\n- Cross-border financial flows inconsistent with declared business activities\n\n### Operational Concerns\n- Cybersecurity firm with access to sensitive government contracts\n- Supply relationship with Dragon Tech Solutions (China, Medium risk)\n- Arms procurement channel suspected through Omar Hassan / Falcon Trading\n\n### Recommendation\nMaintain CRITICAL classification. Escalate financial monitoring. Consider expanding surveillance to include all ASG subsidiary operations.', attachments: [], timestamp: '2026-03-18T10:00:30Z' },
            { id: 'm1-3', role: 'user', content: 'What are the known connections between Horvat and Al-Rashid?', attachments: [], timestamp: '2026-03-18T10:02:00Z' },
            { id: 'm1-4', role: 'assistant', content: '### Horvat ↔ Al-Rashid Connection Analysis\n\n**Connection Type:** Financial Transaction\n**Relationship:** Neutral (transactional)\n**Strength:** 4/5\n**Active Period:** March 2023 — February 2026\n\n**Key Findings:**\n1. Multiple wire transfers detected via Dubai intermediary accounts\n2. Co-location event detected: both subjects present at Hotel Marjan, Split — November 2025\n3. Communication intercepts suggest business relationship extending beyond declared consultancy\n4. Mitchell & Partners LLP (London) serves as legal counsel for both entities\n\n**Financial Trail:**\n- 3 verified transfers totaling approximately $1.2M\n- Routing: Zagreb → Dubai (Rashid Holdings) → Cayman Islands → return to Croatian accounts\n- Pattern consistent with layered money laundering\n\n**Recommendation:** Cross-reference with INTERPOL I-24/7 database. Request Europol SIENA intelligence sharing on Al-Rashid financial network.', attachments: [], timestamp: '2026-03-18T10:02:30Z' },
        ],
        createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-18T10:02:30Z',
    },
    {
        id: 'conv-2', title: 'Mendoza Network — Movement Analysis', personIds: ['p-9', 'p-7'], orgIds: ['o-6', 'o-5'],
        messages: [
            { id: 'm2-1', role: 'user', content: 'Analyze the movement patterns of Carlos Mendoza over the last 6 months. Include co-location events with Omar Hassan.', attachments: [{ id: 'a2-1', name: 'mendoza_gps_log.csv', type: 'file', size: '2.4 MB' }], timestamp: '2026-03-15T14:00:00Z' },
            { id: 'm2-2', role: 'assistant', content: '## Movement Analysis: Carlos Mendoza\n\n**Analysis Period:** September 2025 — March 2026\n\n### Travel Pattern Summary\n- **Primary base:** Bogotá, Colombia (68% of tracked time)\n- **Secondary locations:** Panama City (12%), Dubai (8%), Cairo (7%), Split (5%)\n- **Border crossings:** 23 international border crossings in 6 months\n\n### Co-location with Omar Hassan\n3 verified co-location events detected:\n\n| Date | Location | Duration | Notes |\n|------|----------|----------|-------|\n| 2025-09-14 | Cairo, Egypt | 4 days | Hotel Nile Ritz — adjacent rooms |\n| 2025-11-14 | Split, Croatia | 2 days | Hotel Marjan — also overlaps with Horvat |\n| 2026-01-22 | Dubai, UAE | 3 days | Jebel Ali Free Zone — Gulf Maritime facility |\n\n### Anomalies Detected\n- Unusual nighttime movements in Panama City (03:00-05:00 local, 4 occasions)\n- Encrypted satellite phone usage spikes correlating with border crossings\n- Vehicle rental pattern: never uses same company twice\n\n### Risk Assessment\nMovement patterns strongly suggest cross-border smuggling coordination. The Cairo-Dubai-Split triangle aligns with known Falcon Trading / Gulf Maritime shipping routes.', attachments: [], timestamp: '2026-03-15T14:01:00Z' },
        ],
        createdAt: '2026-03-15T14:00:00Z', updatedAt: '2026-03-15T14:01:00Z',
    },
    {
        id: 'conv-3', title: 'Vehicle Registration — LPR Analysis', personIds: ['p-1'], orgIds: [],
        messages: [
            { id: 'm3-1', role: 'user', content: 'Run LPR analysis on plate ZG-1234-AB. Show all sightings and route patterns.', attachments: [{ id: 'a3-1', name: 'lpr_capture_001.jpg', type: 'image', size: '340 KB', url: 'https://pub-2e7e3882ee034cce979b62fe0ff27780.r2.dev/car_1.jpg' }], timestamp: '2026-03-10T09:00:00Z' },
            { id: 'm3-2', role: 'assistant', content: '## LPR Analysis: ZG-1234-AB\n\n**Vehicle:** BMW X5 M (2024) — Matte Black\n**Registered to:** Marko Horvat\n**Organization:** Alpha Security Group\n**Risk Classification:** Critical\n\n### Sighting Summary (Last 30 days)\n- **Total captures:** 47\n- **Unique locations:** 12\n- **Most frequent:** Zagreb city center (18 captures), Split highway A1 (9 captures)\n\n### Route Patterns\n- Daily commute: Ilica 42 → ASG HQ Savska cesta 120 (08:15 ± 12 min)\n- Weekly: Zagreb → Split route (Fridays, returns Sundays)\n- Anomaly: 3 late-night trips to Zagreb airport cargo terminal (01:00-03:00)\n\n### Associated Vehicles\nOften travels in convoy with:\n- ZG-8888-XX (Mercedes S-Guard, also registered to Horvat, VR10 armor)\n- ZG-5678-CD (Audi A6, registered to Ivan Babić)\n\n### Flagged Events\n- Speed violation: 187 km/h on A1 highway (2026-03-05)\n- Zone breach: entered restricted government district (2026-02-28)', attachments: [], timestamp: '2026-03-10T09:01:00Z' },
        ],
        createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-03-10T09:01:00Z',
    },
    {
        id: 'conv-4', title: 'Petrova Consulting — Background Check', personIds: ['p-4'], orgIds: ['o-8'],
        messages: [
            { id: 'm4-1', role: 'user', content: 'Run a background check on Elena Petrova and Petrova Consulting.', attachments: [], timestamp: '2026-03-01T11:00:00Z' },
            { id: 'm4-2', role: 'assistant', content: '## Background Check: Elena Petrova / Petrova Consulting\n\n**Subject:** Elena Ivanovna Petrova\n**DOB:** 1992-01-30 | **Nationality:** Russian\n**Risk Level:** Medium\n\n### Professional Profile\n- CEO of Petrova Consulting (Moscow, est. 2021)\n- Industry: Consulting\n- Previous: Unknown — gap in employment history 2015-2021\n\n### Intelligence Flags\n- Encrypted Telegram communication with Li Wei (Dragon Tech Solutions, China)\n- University connection with Ana Kovačević (Belgrade)\n- Travel companion overlap with Marko Horvat — Moscow, September 2025\n\n### Financial Status\n- VAT: RU7701234567\n- No sanctions list matches\n- Clean credit history in Russian federation databases\n\n### Assessment\nMEDIUM risk. The 6-year employment gap (2015-2021) warrants investigation. Communication with Chinese tech entities and overlap with Croatian surveillance targets suggests possible intelligence broker role.', attachments: [], timestamp: '2026-03-01T11:01:00Z' },
        ],
        createdAt: '2026-03-01T11:00:00Z', updatedAt: '2026-03-01T11:01:00Z',
    },
    {
        id: 'conv-5', title: 'Gulf Maritime — Vessel Tracking', personIds: [], orgIds: ['o-9', 'o-5'],
        messages: [
            { id: 'm5-1', role: 'user', content: 'What vessels are associated with Gulf Maritime Services and Falcon Trading?', attachments: [{ id: 'a5-1', name: 'ais_data_export.xlsx', type: 'file', size: '5.1 MB' }, { id: 'a5-2', name: 'port_surveillance.mp4', type: 'video', size: '128 MB' }], timestamp: '2026-02-20T08:00:00Z' },
            { id: 'm5-2', role: 'assistant', content: '## Vessel Intelligence: Gulf Maritime Services & Falcon Trading\n\nBased on AIS data analysis and port surveillance:\n\n### Gulf Maritime Fleet (4 vessels)\n1. **MV Arabian Pioneer** — Bulk carrier, Cairo-Dubai route, irregular AIS blackouts\n2. **MV Gulf Horizon** — Container ship, Mediterranean circuit\n3. **MV Desert Wind** — General cargo, Red Sea operations\n4. **Dhow-class vessel (unnamed)** — Small craft, Jebel Ali port movements\n\n### Suspicious Activities\n- MV Arabian Pioneer: 7 AIS blackout events in 6 months (transponder disabled)\n- Repeated rendezvous at sea coordinates 24.5°N, 56.2°E (international waters)\n- Cargo manifests inconsistent with vessel tonnage declarations\n\n### Falcon Trading Connection\n- Shared warehouse at Jebel Ali Free Zone (confirmed)\n- Financial transaction: $2.4M via Panama shell company (August 2024)\n- Omar Hassan observed at Gulf Maritime port facility (Dubai surveillance)', attachments: [], timestamp: '2026-02-20T08:02:00Z' },
        ],
        createdAt: '2026-02-20T08:00:00Z', updatedAt: '2026-02-20T08:02:00Z',
    },
];

const aiResponses = [
    "I've analyzed the data you provided. Based on the intelligence patterns, there are several notable findings that warrant further investigation. The subject's movement patterns show irregular behavior during late-night hours, and financial transactions don't align with their declared income sources. I recommend escalating to a Level 3 investigation.",
    "## Analysis Complete\n\nAfter cross-referencing the available databases, I found **3 significant connections** that were previously unidentified:\n\n1. A shared financial intermediary operating out of Dubai\n2. Overlapping travel schedules on 4 separate occasions\n3. Communication metadata suggesting regular encrypted contact\n\nThese findings suggest a coordinated operational network. Recommend updating the risk classification to **HIGH**.",
    "The uploaded file has been processed. Key findings:\n\n- **14 unique identifiers** extracted from the dataset\n- **3 matches** found against existing persons in the database\n- **2 new entities** identified that should be added to the surveillance roster\n\nI've prepared a detailed breakdown of each match with confidence scores ranging from 78% to 96%. Would you like me to generate a formal intelligence report?",
    "Based on the surveillance imagery analysis:\n\n### Identified Subjects\n- **Subject A:** Positive match (94.2% confidence)\n- **Subject B:** Probable match (78.5% confidence)\n- **Subject C:** No match in database — flagged for manual review\n\n### Environment Assessment\n- Location appears to be a commercial port facility\n- 3 vehicles visible, 2 previously flagged in our system\n- Timestamp analysis suggests this is a recurring meeting pattern\n\nRecommend deploying additional surveillance assets to this location during the identified time window.",
];

export function getAIResponse(): string {
    return aiResponses[Math.floor(Math.random() * aiResponses.length)];
}

export function generateConvId(): string { return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }
export function generateMsgId(): string { return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }
