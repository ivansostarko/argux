# Changelog

## 0.25.69 - 2026-03-30

### Implemented — Vessel Tracker (/map → Layers → Vessel Tracker)
Full AIS-based maritime vessel tracking with live API integration, SVG ship markers, detailed popups, type filtering, and a dedicated vessel list panel.

#### How to Activate
- Layers section → toggle **🚢 Vessel Tracker** ON
- Click the arrow button to open the Vessel Tracker panel

#### Data Sources
1. **AISHub API** (free, requires registration at aishub.net): Live AIS vessel positions, speeds, headings, destinations. Set `AISHUB_API_KEY` in `.env` or `credentials.json`.
2. **Mock fallback**: 18 realistic vessels in the Adriatic Sea (Croatian ferries, cargo ships, tankers, fishing boats, military, sailing, tugs, high-speed craft).

#### 18 Mock Vessels (Adriatic Sea)
| Vessel | Type | Flag | Speed | Destination |
|---|---|---|---|---|
| JADROLINIJA MARKO POLO | Passenger | 🇭🇷 HR | 14.2 kn | SPLIT |
| PETAR HEKTOROVIĆ | Passenger | 🇭🇷 HR | 11.8 kn | STARI GRAD |
| MSC LUCIA | Cargo | 🇵🇦 PA | 12.5 kn | PIRAEUS |
| OLYMPIC TRUST | Tanker | 🇱🇷 LR | 10.1 kn | TRIESTE |
| TIRRENIA SHARDEN | Passenger | 🇮🇹 IT | 18.3 kn | ANCONA |
| HAMBURG EXPRESS | Cargo | 🇩🇪 DE | 8.2 kn | PLOCE |
| ADRIATIC JET | High-Speed | 🇵🇦 PA | 28.5 kn | BRAC |
| ...and 11 more (fishing, sailing, military, tug, etc.) |

#### Map Markers (SVG Ship Icons)
- Custom SVG ship shapes with bow pointing in heading direction
- Color-coded by vessel type (green=cargo, red=tanker, blue=passenger, etc.)
- Name label underneath each marker
- Green dot indicator on moving vessels (speed > 0.5 kn)
- Hover: scale up 1.25x with glow shadow
- rAF rendering loop (1 fps update) avoids React re-renders

#### Click Popup (Rich Vessel Card)
- Vessel icon, name, flag emoji, type, MMSI
- 4 telemetry gauges: Speed (kn), Course (°), Heading (°), Draught (m)
- Detail fields: Callsign, IMO, Size (L×W), Status, Destination, ETA, Position
- AIS source badge (LIVE vs Mock)
- Speed color coding: green (>15kn), blue (>5kn), amber (>0.5kn), grey (anchored)

#### Vessel Tracker Panel (5 sections)
1. **Type Filter**: 9 type toggle buttons (Cargo, Tanker, Passenger, Fishing, Military, Sailing, Tug, High-Speed, Other) with counts. All/Clear/Refresh buttons.
2. **Search**: Filter by name, MMSI, callsign, destination, or flag.
3. **Stats Row**: Total vessels, Moving count, Average speed, Active types.
4. **Vessel List**: Scrollable list with icon, name, flag, type, destination, speed, course, length. Click to fly map to vessel. Selected vessel highlighted with colored left border.
5. **Footer**: Vessel count, last update time, data source indicator (AISHub LIVE / Mock AIS Data).

#### Backend
- `GET /mock-api/vessels?south=&north=&west=&east=` — bbox-filtered vessel query
- `app/Http/Controllers/MockApi/VesselController.php` (147 lines)
- AISHub API integration with ship type mapping (IMO codes → our types)
- Navigation status decoder (0=Under way, 1=At anchor, 5=Moored, 7=Fishing, etc.)
- 3-minute server-side cache per bbox area
- Mock fallback when no API key configured

#### 9 Vessel Types
| Type | Color | Icon | Example |
|---|---|---|---|
| Cargo | #22c55e | 🚢 | MSC LUCIA, HAMBURG EXPRESS |
| Tanker | #ef4444 | 🛢️ | OLYMPIC TRUST, NORDIC CARRIER |
| Passenger | #3b82f6 | 🚢 | JADROLINIJA MARKO POLO |
| Fishing | #f59e0b | 🎣 | GDANSK FISHER, MORNAR |
| Military | #6b7280 | ⚓ | JAGOR |
| Sailing | #06b6d4 | ⛵ | LADY SOPHIA, WINDSTAR BREEZE |
| Tug | #8b5cf6 | 🚤 | NEPTUN |
| High-Speed | #ec4899 | 🚀 | ADRIATIC JET |
| Other | #64748b | 🔹 | Unclassified vessels |

#### Auto-Refresh
- Vessel positions refresh every 3 minutes
- Manual refresh via panel button
- Data source status indicator (green dot = live, amber = mock)

#### Files Created/Modified
- `app/Http/Controllers/MockApi/VesselController.php` — NEW (147 lines)
- `resources/js/mock/map.ts` — UPDATED (+85 lines, 18 vessels + types)
- `resources/js/pages/Map/Index.tsx` — UPDATED (vessel state, rendering, panel)
- `resources/css/pages/map.css` — UPDATED (+vessel marker CSS)
- `routes/web.php` — UPDATED (+1 route)

## 0.25.68 - 2026-03-30

### Implemented — Google Street View (/map → Tools)
Interactive Google Street View panorama integrated into the map. Click anywhere on the map to open a Street View panel with full panoramic view, HUD overlay, compass, and navigation controls.

#### How to Use
1. Open **Tools** section → click **Street View** toggle or button
2. Cursor becomes crosshair — click anywhere on the map
3. Street View panel opens with panoramic view of that location
4. Navigate: drag to look around, click arrows to move along streets
5. Use quick-turn buttons (Left 90°, Right 90°, Level) for fast orientation

#### Street View Panel
- **Resizable panel** (default 520px width) or **fullscreen mode** (⛶ button)
- **Google StreetViewPanorama** rendered with full interactivity:
  - Drag to pan/rotate view
  - Click road arrows to walk along streets
  - Zoom in/out
  - Road name labels visible
- **HUD Overlay** (non-interactive, on top of panorama):
  - 🟢 LIVE indicator + GPS coordinates
  - Heading (HDG), Pitch, Zoom telemetry readout
  - Compass rose (N indicator rotates with heading)
  - Google attribution badge
- **Header controls**:
  - 📍 Pick new location (re-enters click-to-select mode)
  - 🎯 Fly map camera to current Street View location
  - ⛶ Toggle fullscreen
  - ✕ Close
- **Footer controls**: ↶ Left 90°, ↷ Right 90°, ⊝ Level (reset pitch to 0°)

#### Map Integration
- **Pegman marker**: Yellow person-icon marker placed on map at Street View location
- Marker follows position as user navigates along streets in the panorama
- **Coverage check**: Uses `StreetViewService.getPanorama()` to verify coverage within 100m radius
- **Reverse geocoding**: Address auto-updates as user moves to new positions
- **No coverage fallback**: Shows "No Street View Available" message with re-pick button

#### Sidebar Button (Tools section)
- Toggle switch (amber) + Street View button
- Shows current address when active, "LIVE" badge
- Click toggle to enter pick mode, click button to re-open panel

#### Google Maps API Setup
Requires Google Maps JavaScript API with Street View enabled. Same API key as 3D Realistic:
- `.env`: `GOOGLE_MAPS_API_KEY=your_key`
- `credentials.json`: `{ "google_maps_key": "your_key" }`

#### Technical
- Reuses existing `loadGoogleMapsAPI()` loader (shared with 3D Realistic mode)
- `StreetViewPanorama` with `addressControl: false`, custom HUD instead
- POV (heading/pitch) and zoom tracked in React state, synced from Google Events
- Position changes trigger reverse geocoding + map marker update
- Panel supports both floating and fullscreen modes
- Escape key closes panel, pick mode, and fullscreen

## 0.25.67 - 2026-03-30

### Upgraded — Realistic 3D Traffic: Road-Following Vehicles

Complete physics and rendering rewrite. Vehicles now **follow road curves precisely**, move at **realistic speeds**, and have **multi-part 3D bodies** (chassis + cabin + windows).

#### Distance-Based Road Following
- Pre-computes **cumulative distance** along each road's coordinate array.
- Vehicles store their position as `distM` (meters traveled), not `progress` (0-1).
- Each frame: `distM += speedMs × dt` — advances by real meters.
- Position found via **binary search** on the cumulative distance array → exact interpolation between two road coordinates.
- Vehicles follow every curve, turn, and bend in the road geometry.

#### Realistic Speeds
- Speed stored as `speedMs` (meters/second), computed from km/h: `speed = kmh / 3.6`
- A car at 50 km/h = 13.9 m/s → traverses a 500m road in 36 seconds (visible, believable).
- Congestion factor: 35-75% of road maxspeed (no TomTom key) or real TomTom current speed.
- Minimum speed 5 km/h (even in heavy congestion, cars still creep).
- Large `dt` gaps (>0.5s) skipped to avoid teleporting after tab-switch.

#### Multi-Part 3D Vehicle Design (4 extrusion layers)
| Layer | What | Example |
|---|---|---|
| `traffic-3d-shadow` | Ground shadow (flat fill, black) | Dark contact patch |
| `traffic-3d-vehicles` | Lower body/chassis | Car body 0.8m, colored |
| `traffic-3d-cabin` | Upper cabin/roof | Car cabin up to 1.5m, slightly darker color |
| `traffic-3d-windows` | Glass strip | Dark glass band around cabin mid-height |

**Cars**: Rectangular chassis (4.5m × 1.8m × 0.8m) + narrower cabin offset toward front (1.5m tall) + dark glass strip.
**Trucks**: Cargo box (rear, full width, tall) + colored cab (front, slightly taller) + cab window strip.
**Buses**: Long body (12m) + full cabin + green-tinted windows.
**Motorcycles**: Small chassis only (2.2m × 0.8m × 0.6m), no cabin.

#### Reduced Density (More Realistic)
| Road | Vehicles/100m | Previously |
|---|---|---|
| Motorway | 6 | was 8 |
| Primary | 4 | was 5 |
| Residential | 1.2 | was 1.5 |

Max 16 vehicles per road segment (was 20).

## 0.25.66 - 2026-03-30

### Upgraded — 3D Traffic Vehicles on Real Streets (OpenStreetMap)

Complete rewrite. Vehicles now drive **only on actual streets** fetched from OpenStreetMap Overpass API. Hundreds of 3D vehicles populate every road in the viewport — motorways, primary roads, residential streets — creating a realistic real-time traffic simulation.

#### Real Road Data from OpenStreetMap
- `GET /mock-api/traffic/roads?south=&north=&west=&east=` — fetches road geometries from Overpass API
- Returns road LineStrings with: highway type, name, lanes, maxspeed, oneway flag
- Queries: motorway, trunk, primary, secondary, tertiary, residential, unclassified
- Viewport clamped to ~8km to avoid huge queries. 10-minute cache per area.
- Falls back to 15 mock segments if Overpass is unreachable.

#### Vehicle Density by Road Type
| Road Type | Vehicles per 100m | Speed | Trucks/Buses |
|---|---|---|---|
| Motorway | 8 | 130 km/h | Yes |
| Trunk | 6 | 90 km/h | Yes |
| Primary | 5 | 60 km/h | Yes |
| Secondary | 4 | 50 km/h | Yes |
| Tertiary | 3 | 40 km/h | Yes |
| Residential | 1.5 | 30 km/h | No trucks/buses |
| Unclassified | 1 | 30 km/h | No trucks/buses |

#### 14 Vehicle Types
Sedans (silver, red, blue, black, white), SUVs (grey, white), Trucks (grey, yellow), Bus (green), Vans (white, blue), Pickup, Motorcycle. Each with correct dimensions and speed modifiers.

#### Live Traffic Speed Integration
- With TomTom API key: samples 20 road midpoints for real current speed
- Vehicle animation speed derived from actual km/h
- Without API key: speeds randomized at 40-90% of road maxspeed (simulates congestion)

#### Auto-Refresh
- Roads re-fetched when map viewport changes (moveend event)
- Vehicles re-spawned on new roads automatically
- TomTom speeds refresh every 2 minutes

#### Network Domain Required
`overpass-api.de` must be in network allowed domains for real road geometry.

## 0.25.65 - 2026-03-30

### Upgraded — True 3D Extruded Traffic Vehicles

Complete rewrite of the traffic particle system. Replaced 2D canvas sprite icons with **real 3D extruded polygons** using MapLibre's `fill-extrusion` layer. Vehicles are now actual 3D boxes with correct real-world dimensions, oriented along streets, moving at physically accurate speeds.

#### 3D Vehicle Rendering
Each vehicle is a **rotated GeoJSON polygon** extruded to its real-world height:
- **Body**: `fill-extrusion` layer — colored 3D box with real dimensions
- **Windows/cabin**: Second `fill-extrusion` layer — darker glass rectangle on top of body, offset toward front
- **Ground shadow**: Flat `fill` layer underneath for depth

#### 10 Vehicle Types with Real Dimensions
| Type | Length | Width | Height | Color | Frequency |
|---|---|---|---|---|---|
| Sedan (silver) | 4.2m | 1.8m | 1.5m | #c8ccd4 | 28% |
| Sedan (red) | 4.2m | 1.8m | 1.5m | #b91c1c | 10% |
| Sedan (blue) | 4.2m | 1.8m | 1.5m | #1d4ed8 | 8% |
| Sedan (black) | 4.2m | 1.8m | 1.5m | #1e293b | 12% |
| SUV | 4.8m | 2.0m | 1.8m | #64748b | 10% |
| Truck | 8.0m | 2.5m | 3.8m | #94a3b8 | 7% (0.7x speed) |
| Bus | 11.0m | 2.5m | 3.2m | #15803d | 3% (0.65x speed) |
| Van | 5.5m | 2.0m | 2.4m | #f1f5f9 | 9% |
| Pickup | 5.2m | 2.0m | 1.9m | #78716c | 6% |
| Motorcycle | 2.0m | 0.7m | 1.1m | #be123c | 7% (1.1x speed) |

#### Street Orientation
Vehicles are oriented along the road using a **rotated rectangle polygon**:
- Heading computed from road segment direction vector (`atan2`)
- Rectangle vertices rotated by heading angle (cos/sin transform)
- Meters converted to degrees: `1m ≈ 0.0000127° lng`, `1m ≈ 0.000009° lat` at lat 45.8°

#### Multi-Lane Positioning
Each vehicle has a random perpendicular offset of ±1.5m to ±3m from the road centerline, computed from the road's normal vector. Creates realistic multi-lane traffic appearance.

#### Physically Accurate Speeds
- Speed derived from **real km/h** (live TomTom or mock data):
  `speedMs = actualSpeed × 1000 / 3600 × vehicleSpeedModifier`
  `progressPerSecond = speedMs / segmentLengthInMeters`
- Segment lengths computed in meters from coordinate distances
- Animation uses real `dt` in seconds (not frame-based)
- 20fps cap (fill-extrusion is heavier than circles)
- Trucks at 0.7x, buses at 0.65x, motorcycles at 1.1x of road speed

#### What It Looks Like in 3D
From the tilted 3D camera:
- Silver/red/blue/black **car boxes** (1.5m tall) flowing along roads
- Taller **white vans** (2.4m) and **grey trucks** (3.8m) moving slower
- **Green buses** (3.2m, longest) crawling in heavy traffic
- Dark **window glass** rectangles on top of each vehicle body
- **Ground shadows** for depth perception
- All vehicles properly oriented parallel to the road direction

## 0.25.64 - 2026-03-30

### Upgraded — 3D Traffic Particle System with Real Vehicles & Live API Data

Replaced abstract circle dots with **8 canvas-rendered vehicle types** and **live TomTom speed data** driving particle velocities.

#### 8 Vehicle Types (canvas-rendered top-down icons)
| Vehicle | Visual | Weight | Speed Modifier |
|---|---|---|---|
| Car (white) | Sedan with windows, headlights, taillights | 30% | 1.0x |
| Car (red) | Red sedan | 12% | 1.0x |
| Car (blue) | Blue sedan | 10% | 1.0x |
| Car (black) | Dark sedan | 15% | 1.0x |
| Truck | Yellow cab + grey cargo container | 8% | 0.75x (slower) |
| Bus | Green with window row | 4% | 0.75x (slower) |
| Van | White delivery van | 10% | 1.0x |
| Motorcycle | Red with rider dot, bright headlight | 11% | 1.15x (faster) |

Each vehicle is rendered as a high-DPI canvas image registered as a MapLibre icon. Vehicles rotate to match road direction (`icon-rotation-alignment: 'map'`, `icon-pitch-alignment: 'map'`).

#### 3 Render Layers
- **Shadow**: Dark circle below each vehicle for ground contact depth
- **Vehicle icon**: Top-down sprite, scales from 0.3x at z12 to 1.8x at z20
- **Headlight glow**: Warm white circle in front of vehicle (visible z14+)

#### Multi-Lane Simulation
Each particle has a random perpendicular lane offset, creating the appearance of vehicles in different lanes on the same road. Offset is computed from the road's normal vector.

#### Live TomTom Speed Data
When TomTom API key is configured:
1. On activation, queries `GET /mock-api/traffic/flow?lat=&lng=` for each road segment's midpoint
2. Returns `currentSpeed` and `freeFlowSpeed` from TomTom Flow Segment API
3. Particle speed is computed from **actual km/h**: `speed = actualSpeed / 5000` (maps real-world speed to animation progress)
4. Traffic level is derived from speed ratio: `currentSpeed / freeFlowSpeed`
5. Refreshes live speeds every 2 minutes

Without API key: falls back to mock speed data from `MOCK_TRAFFIC_SEGMENTS`.

#### Particle Count by Congestion
| Level | Count/Segment | Visual Effect |
|---|---|---|
| Free flow (>80%) | 6 | Sparse, fast-moving |
| Light (60-80%) | 6 | Normal spacing |
| Moderate (40-60%) | 8 | Denser, slower |
| Heavy (20-40%) | 10 | Packed, crawling |
| Standstill (<20%) | 12 | Maximum density, near-stopped |

#### Technical
- Vehicles rendered via `ctx.roundRect()` + `ctx.fillRect()` on off-screen canvas at device pixel ratio
- Registered as MapLibre images (`map.addImage`) — no external SVG/PNG files
- Symbol layer with `icon-ignore-placement: true` for zero collision detection overhead
- 30fps animation cap, ~120 particles total
- Legacy circle layers (`traffic-particles-tail/glow`) cleaned up on activation

## 0.25.63 - 2026-03-30

### Implemented — 3D Traffic Particle System (/map → Layers → Live Traffic + 3D)
Animated car-like particles flowing along road segments when both Live Traffic and any 3D mode are active. Creates a realistic live traffic simulation visible from the 3D perspective.

#### How it activates
- Toggle **🚦 Live Traffic** ON in Layers
- Activate any 3D mode: 3D Buildings, 3D Terrain, 3D Realistic, or 3D Globe
- Particles appear automatically and animate along all 15 road segments

#### Particle System Details
- **~100 particles** across 15 road segments (6 per segment, more on congested roads: 8 for heavy, 10 for standstill).
- **3 render layers** per particle for realistic headlight effect:
  - **Tail glow**: Large (7-12px), dim (15% opacity), blurred — ambient traffic glow
  - **Body**: Medium (3-5px), colored by traffic level, 90% opacity — the "car"
  - **Headlight core**: Small (1.5-2.5px), white, 70% opacity — bright point of light
- All layers scale with zoom level (tiny at z12, visible at z18).

#### Animation
- Particles move along segment LineStrings using linear interpolation.
- **Speed varies by traffic level**:
  | Level | Speed | Visual |
  |---|---|---|
  | Free flow | Fast | Green dots flowing quickly |
  | Light | Medium-fast | Lime dots, slight spacing |
  | Moderate | Medium | Amber dots, closer together |
  | Heavy | Slow | Red dots, bunched up |
  | Standstill | Near-stopped | Dark red dots, barely moving |
- Each particle has slight random speed variation (±30%) for natural feel.
- 30fps animation cap for performance.
- Particles loop continuously (wrap from end to start).

#### Technical
- GeoJSON point source (`traffic-particles-src`) updated every frame via `requestAnimationFrame`.
- Positions computed by interpolating along segment coordinate arrays.
- Heading computed from road direction (for potential future arrow markers).
- Cleanup: all 3 layers + source removed when either Traffic or 3D is deactivated.
- No external dependencies — pure MapLibre GL circle layers.

## 0.25.62 - 2026-03-29

### Upgraded — Live Traffic with TomTom API (/map → Layers)
Traffic layer now uses **TomTom Traffic API** for real-time traffic flow tiles and live incident data. Falls back to mock data when no API key is configured.

#### TomTom Integration (Free Tier — 2,500 requests/day)
- **Traffic Flow tiles**: TomTom raster tiles (`api.tomtom.com/traffic/map/4/tile/flow/relative0`) rendered as a MapLibre raster layer at 80% opacity. Color-coded: green/yellow/orange/red/dark-red for free-flow to standstill.
- **Traffic Incidents tiles**: TomTom incident raster tiles (`api.tomtom.com/traffic/map/4/tile/incidents/s1`) rendered at 70% opacity.
- **Live Incidents API**: TomTom Incident Details v5 (`api.tomtom.com/traffic/services/5/incidentDetails`) fetched for current map viewport. Returns real accidents, construction, closures, hazards, events, police activity.
- **Traffic Flow Segment API**: TomTom Flow Segment Data v4 for point-specific speed data.
- Auto-refreshes incidents every 2 minutes + on map move.
- 2-minute cache for incidents, 1-minute cache for flow segments.

#### Backend
- `app/Http/Controllers/MockApi/TrafficController.php` (209 lines) — Laravel proxy.
- `GET /mock-api/traffic/config` → returns API key + tile URLs (flow + incidents).
- `GET /mock-api/traffic/incidents?south=&north=&west=&east=` → live incidents from TomTom.
- `GET /mock-api/traffic/flow?lat=&lng=` → flow segment data for a point.
- TomTom icon categories mapped to incident types (accident/construction/closure/hazard/police/event).
- Magnitude of delay mapped to severity (minor/moderate/major/critical).

#### API Key Setup
**Option A — `.env`:**
```
TOMTOM_API_KEY=your_key_here
```

**Option B — `credentials.json`:**
```json
{
  "tomtom_api_key": "your_key_here"
}
```

Get free key: `developer.tomtom.com` → Register → Get API Key. Free tier: 2,500 requests/day.

#### What happens with/without API key
| | With TomTom Key | Without Key |
|---|---|---|
| Flow visualization | Real-time raster tiles from TomTom | 15 mock GeoJSON road segments (Zagreb) |
| Incidents | Live from TomTom API (real accidents, construction, etc.) | 6 mock incidents |
| Source indicator | 🟢 TomTom LIVE | 🟡 Mock Data |
| Auto-refresh | Every 2 min + on map move | Static |

#### Panel Updates
- Footer shows **TomTom LIVE** or **Mock Data** with colored indicator.
- 🔄 refresh button for on-demand incident refresh (live mode).
- Incidents tab handles both TomTom ISO timestamps and mock string timestamps.
- Incidents show delay (minutes) and length (km) from TomTom API.

#### Network Domains Required
`api.tomtom.com` must be in network allowed domains for live traffic data.

## 0.25.61 - 2026-03-29

### Implemented — Live Traffic Layer (/map → Layers)
Traffic flow visualization with color-coded road segments, incident markers, congestion index, and 3-tab control panel. Uses OpenStreetMap road geometry with mock traffic data.

#### Map Rendering
- **Traffic flow lines**: 15 road segments rendered as color-coded GeoJSON LineStrings — green (free flow), lime (light), amber (moderate), red (heavy), dark red (standstill). Dark casing for depth. Rounded caps/joins.
- **Incident markers**: 6 incident types with icon badges (💥 accident, 🚧 construction, 🚫 closure, 🎪 event, ⚠️ hazard, 🚔 police). Click for detail popup with description, severity, time, lane info, detour status.
- Sub-layer toggles: 🛣️ Traffic Flow and ⚠️ Incidents can be independently shown/hidden.

#### Traffic Panel — 3 Tabs

**📊 Overview**
- **Congestion gauge**: SVG ring chart showing congestion index percentage (0-100%), color-coded (green/amber/red). Average speed and total delay.
- **Traffic conditions bar**: Stacked horizontal bar chart showing segment count by level (free/light/moderate/heavy/standstill).
- **Level breakdown**: 5 cards with colored indicators and segment counts.
- **Incidents by severity**: 4 KPI cards (Critical/Major/Moderate/Minor).
- **Legend**: Color key with speed percentage ranges.

**⚠️ Incidents**
- List of all active incidents with type icon, title, road name, severity badge, description, time range, lane info, detour availability. Click to fly to location.

**🛣️ Roads**
- All monitored road segments with: colored level bar, road name, flow level, delay in minutes, current speed (km/h), speed-vs-freeflow progress bar. Click to fly to segment midpoint.

#### Mock Data (15 segments, 6 incidents — Zagreb roads)
**Road segments**: Slavonska avenija (E/W), Vukovarska (E/W), Savska cesta (N/S), Ilica (E/W), Heinzelova (N/S), Branimirova (E/W), Držićeva (S), Avenija Dubrovnik, Zeleni most → Kvaternik. Realistic speed/delay values.

**Incidents**: Multi-vehicle collision on Slavonska (major), Road resurfacing on Ilica (moderate), Full closure on Branimirova (critical), Police checkpoint at Zeleni most (minor), Football match traffic at Maksimir (moderate), Debris on Heinzelova (minor).

#### Traffic Level Color Coding
| Level | Color | Speed Range |
|---|---|---|
| Free Flow | Green (#22c55e) | > 80% of free flow |
| Light | Lime (#84cc16) | 60-80% |
| Moderate | Amber (#f59e0b) | 40-60% |
| Heavy | Red (#ef4444) | 20-40% |
| Standstill | Dark Red (#7f1d1d) | < 20% |

#### Note
This uses OpenStreetMap road geometry with simulated traffic data. For real-time traffic, a TomTom or HERE API key can be integrated. The mock data provides a realistic visualization of how live traffic would appear.

## 0.25.60 - 2026-03-29

### Implemented — UAV Drone Operations on Map (/map → Layers)
Full UAV drone operations layer with fleet tracking, mission control, live video stream, AI object detection, geofencing, and telemetry dashboard.

#### Map Rendering
- **Drone markers**: Animated pulsing circles (green glow) with type icon + callsign label. Status indicator dot (green=operational, amber=deployed) with blink animation. Click → detailed popup with telemetry HUD.
- **Flight routes**: Dashed green lines connecting mission waypoints with directional arrows. Active missions only.
- **Geofence polygons**: Semi-transparent green fill with dashed border for mission patrol zones.
- **AI Detection markers**: Small colored circles (red=person, amber=vehicle, gray=other) with confidence % label. Click for detail popup.

#### Drone Popup (on marker click)
- Header: type icon, callsign, model, status badge.
- 4 telemetry KPI cards: Altitude (m), Speed (km/h), Heading (°), Battery (%).
- Status row: Signal %, GPS satellites, Temperature, Wind speed.
- Mode indicator (AUTO/MANUAL/RTL) + Armed/Disarmed status + uptime.
- Footer: total flight hours and flights.

#### UAV Operations Panel — 5 Tabs

**🛩️ Fleet** — Deployed drone list with type icon, callsign, status, model, altitude, speed, battery. Click to fly camera. Summary cards: Total Fleet, Deployed, Active Missions.

**🗺️ Missions** — Mission list with status badge (active/planned/paused/completed/aborted), name, waypoint count, drone assignment, type, schedule. Expandable waypoint list with coordinates, altitude, action type. Click waypoint → fly to location. Mission controls: Launch, Pause, Resume, Abort.

**📹 Video** — Live drone video feed with HUD overlay:
- Mock video from `drone-video.mp4` URL.
- Drone selector buttons for multi-drone switching.
- REC indicator with blink animation + callsign + timestamp.
- Telemetry overlay: ALT, SPD, HDG, BAT at bottom-left.
- Crosshair SVG reticle at center.
- AI Object Detection status indicator (YOLOv8 Active).

**🎯 AI Detections** — Detection summary (Persons, Vehicles, Other) with counts. Detection list with type icon, label, drone ID, timestamp, confidence percentage (color-coded: green >90%, amber >75%, red <75%). Click to fly to detection location.

**📊 Telemetry** — Full telemetry dashboard for selected drone:
- Drone selector bar.
- 4 main KPIs: Altitude, Speed, Heading, Battery.
- Mode indicator (AUTO/MANUAL/RTL) with armed status.
- Extended telemetry: Signal %, GPS Lock, Temperature, Wind, Uptime, Distance from Home.
- Quick command buttons: RTL (Return to Launch), Loiter, Land.

#### Layer Controls
3 sub-layer toggles: Routes (flight paths), Detections (AI markers), Geofence (patrol zones).

#### Mock Data Added to uav.ts
- 4 drone missions (Perimeter Patrol, Zone Surveillance, Building Recon, Night Patrol).
- 8 AI detections (4 persons, 3 vehicles, 1 animal) with confidence scores.
- 4 drone telemetry records with full flight parameters.
- `DRONE_VIDEO_URL` constant for mock video stream.

## 0.25.59 - 2026-03-29

### Implemented — UAV Fleet Management Page (/uav)
Full CRUD page for managing unmanned aerial vehicles — responsive card grid, create/edit form modal (7 sections), detail modal (5 tabs), delete confirmation, search/sort/filter.

#### Page Structure
- **Header**: title, description, "+ Add UAV" button.
- **6 KPI cards**: Total Fleet, Operational, Deployed, Standby, Maintenance, Total Flight Hours. Click KPI to filter by status.
- **Filter bar**: Full-text search (callsign, model, operator, serial, operation), 6 type filter buttons (icons), sort dropdown (callsign/status/hours/battery/lastFlight), asc/desc toggle.
- **Responsive card grid**: `grid-template-columns: repeat(auto-fill, minmax(340px, 1fr))`. Single column on mobile.

#### UAV Cards
- Type icon (colored circle), callsign (bold), status badge, manufacturer + model.
- Edit (✏️) and Delete (🗑️) quick-action buttons with hover effects.
- Type badge + Class badge.
- 3-column stats: Flight Hours, Total Flights, Battery %.
- Operator + Operation assignment line.
- Last flight date.
- 6 capability dots (GPS, RTK, Thermal, LiDAR, NVG, EW) with colored glow for active capabilities.

#### Create/Edit Form Modal (7 sections)
| Section | Fields |
|---|---|
| Identification | Callsign*, Model*, Manufacturer, Serial Number, Type (6 options), Class (5 options), Status (6 options), Firmware |
| Physical Specs | Weight (kg), Max Payload (kg), Wingspan/Diagonal (cm), Endurance (min), Max Speed, Cruise Speed, Max Altitude, Max Range |
| Battery / Power | Battery Type, Capacity (mAh), Voltage (V), Charge Cycles |
| Sensors & Payload | 6 checkboxes (GPS, RTK, Thermal, LiDAR, Night Vision, EW), Camera Resolution, Gimbal Type |
| Communication | Data Link, Frequency, Max Data Rate, Encrypted Link checkbox |
| Assignment | Operator, Operation, Team, Home Base, Acquired date |
| Notes | Multi-line textarea |

#### Detail Modal (5 tabs)
| Tab | Content |
|---|---|
| 📊 Overview | 3 KPI cards (hours, flights, battery), class, serial, firmware, home base, operator/operation/team, last flight, acquired date, notes |
| 📐 Specs | Physical (weight, payload, wingspan), Performance (speeds, altitude, range, endurance), Battery (type, capacity, voltage, cycles, level bar) |
| 🎯 Sensors | 6 capability status indicators (green/gray), camera resolution, gimbal type, sensor package list |
| 📡 Comms | Data link, frequency, encrypted status, video feed, max data rate |
| 📋 History | Total hours, total flights, last flight, last/next maintenance, battery cycles, acquisition date |
- Footer: Edit + Delete buttons.

#### Delete Confirmation
- ⚠️ warning icon, UAV callsign in red, "cannot be undone" warning, Cancel + Remove buttons.

#### 10 Mock UAVs
| # | Callsign | Model | Type | Class | Status |
|---|---|---|---|---|---|
| 1 | HAWK-1 | Bayraktar Mini | Fixed-Wing | Tactical | Operational |
| 2 | SHADOW-3 | DJI Matrice 350 RTK | Quadcopter | Surveillance | Deployed |
| 3 | EAGLE-7 | Wingtra WingtraOne GEN II | VTOL | Reconnaissance | Operational |
| 4 | REAPER-2 | Freefly Alta X | Octocopter | Cargo | Maintenance |
| 5 | GHOST-1 | FLIR Black Hornet 4 | Micro | Reconnaissance | Standby |
| 6 | CONDOR-4 | senseFly eBee X | Fixed-Wing | Surveillance | Operational |
| 7 | PHANTOM-5 | DJI Mavic 3 Enterprise | Quadcopter | Surveillance | Operational |
| 8 | VIPER-2 | Skydio X10 | Quadcopter | Tactical | Standby |
| 9 | RELAY-1 | Inspired Flight IF1200A | Hexacopter | Communication | Operational |
| 10 | RAPTOR-1 | AeroVironment Puma 3 AE | Fixed-Wing | Tactical | Retired |

Each UAV has realistic specs: weight, payload, speeds, altitude, range, endurance, battery details, sensor package, communication parameters, and operational notes.

#### Files Created
- `resources/js/pages/UAV/Index.tsx` (386 lines)
- `resources/js/mock/uav.ts` (225 lines) — types, interfaces, configs, mock data
- `resources/css/pages/uav.css` (12 lines) — grid, card, battery, sensor tag styles
- `resources/js/tests/UAV.test.ts` (176 lines) — mock data integrity tests

#### Wiring
- Route: `GET /uav` → `UAV/Index` (routes/web.php)
- Sidebar: drone icon + "UAV Fleet" added to Subjects section
- CSS: `@import './pages/uav.css'` added to app.css

#### Note
Drone operations on the map (flight planning, tracking, telemetry) will be implemented separately on the /map page.

## 0.25.58 - 2026-03-29

### Implemented — Weather Radar Layer (/map → Layers)
- **Weather Radar** layer with live precipitation radar, current conditions, hourly forecast, 7-day forecast, and 14-day historical weather lookup — powered by Open-Meteo (weather) and RainViewer (radar), both free, no API key.

#### Data Sources (100% Open Source, No API Key)
| Source | Endpoint | Data |
|---|---|---|
| **Open-Meteo** | `api.open-meteo.com/v1/forecast` | Current conditions, hourly forecast (24h), 7-day daily forecast |
| **Open-Meteo Archive** | `archive-api.open-meteo.com/v1/archive` | Historical daily weather (up to years back) |
| **RainViewer** | `api.rainviewer.com/public/weather-maps.json` | Precipitation radar tiles + infrared satellite/cloud tiles |

#### Map Rendering
- **Rain radar overlay**: RainViewer precipitation tiles at 60% opacity, color-coded (green→yellow→red→purple).
- **Cloud/satellite overlay**: RainViewer infrared satellite tiles at 25% opacity, showing cloud cover.
- **Radar animation**: Play/pause button + timeline slider scrubbing through past radar frames + nowcast (future prediction).
- **Weather marker**: Click any point on map → blue 🌡️ marker placed, weather fetched for that location.
- Works on all 2D tiles and 3D modes.

#### Weather Panel — 4 Tabs

**🌡️ Now (Current Conditions)**
- Large weather icon + temperature (°C) + description + feels-like temperature.
- 6 KPI cards: Humidity (%), Wind Speed (km/h), Wind Gusts (km/h), Pressure (hPa), Cloud Cover (%), Precipitation (mm).
- Wind direction compass indicator + surface pressure.

**⏱️ Hourly (Next 24 Hours)**
- Hour-by-hour rows: time, weather icon, temperature, cloud cover bar, precipitation probability %, wind speed.

**📅 7-Day Forecast**
- Daily rows: weather icon, day name, description, max/min temperature, precipitation sum, wind max, UV index (color-coded: green/amber/red).

**📊 History (Last 14 Days)**
- Historical daily data: weather icon, date, max/min temp, precipitation, wind.
- Fetches from Open-Meteo Archive API on demand.
- "Load History" button for on-demand fetch.

#### Panel Controls
- **📍 Select Location**: Click on map to pick any point for weather data.
- **🎯 Map Center**: Quick-fetch weather for current map center.
- **Rain Radar**: Play/pause animation + timeline slider with timestamp display.
- Coordinate display with elevation and timezone.

#### Backend
- `app/Http/Controllers/MockApi/WeatherController.php` (161 lines) — Laravel proxy.
- `GET /mock-api/weather?lat=45.81&lng=15.98` → current + hourly + 7-day forecast.
- `GET /mock-api/weather/history?lat=45.81&lng=15.98&start=2026-03-15&end=2026-03-28` → daily historical data.
- `GET /mock-api/weather/radar` → RainViewer radar frame timestamps + tile host URL.
- Caching: weather 5min, history 1h, radar 2min.
- Hourly data compacted to 24 hours.
- WMO weather code decoder with day/night icons (29 weather conditions).
- Mock weather fallback when API unreachable.

#### WMO Weather Codes Supported
Clear sky, Mainly clear, Partly cloudy, Overcast, Fog, Rime fog, Light/Moderate/Dense drizzle, Slight/Moderate/Heavy rain, Slight/Moderate/Heavy snowfall, Rain showers (slight/moderate/violent), Snow showers, Thunderstorm, Thunderstorm with hail.

#### Note on Network Domains
`api.open-meteo.com`, `archive-api.open-meteo.com`, `api.rainviewer.com`, and `tilecache.rainviewer.com` must be in network allowed domains for live data. Without them, mock weather data is returned.

## 0.25.57 - 2026-03-29

### Enhanced — Route Planner / Directions (/map → Tools)
The routing/directions system was already implemented. This version adds enhancements and documents the full feature set.

#### Added: Reverse Route
- **⇅ Reverse** button in routing panel (visible when 2+ waypoints). Reverses all waypoints, updates labels (Start/End), clears previous result, rebuilds markers.

#### Full Feature Summary (already implemented)

##### How to Use
1. Open **Tools** section in sidebar → click **🧭 Route Planner**
2. Click **+ Add Point** → cursor becomes crosshair
3. Click on map to place start point (A), then destination (B), and optional waypoints
4. Select transport mode: 🚗 Driving, 🚴 Cycling, 🚶 Walking
5. Click **🧭 Calculate Route** → route line appears on map with turn-by-turn directions

##### Map Rendering
- **Route line**: GeoJSON LineString rendered with 3 layers — black casing (8px, 30% opacity), colored main line (5px, profile-colored), white directional arrows (▸ symbols every 80px)
- **Waypoint markers**: Draggable circular pins (28px) — A=green (start), B+=red (end), middle=blue. Drag to reposition → recalculate
- Route line color changes with profile: blue (car), green (bike), amber (foot)

##### Routing Panel
- **Transport mode selector**: 3 buttons (Driving/Cycling/Walking) with profile-specific colors
- **Waypoints list**: Lettered markers (A, B, C...), coordinates, ▲▼ reorder buttons, ✕ remove
- **⇅ Reverse**: Swap start/end + all waypoints
- **Calculate button**: Calls OSRM (or fallback)
- **Route KPI cards**: Distance, Duration, Profile
- **Turn-by-turn directions**: Each step with direction icon (🟢 depart, ↰ left, ↱ right, 🔄 roundabout, ↑ straight), instruction text, distance, duration, street name. Click step → camera flies to that location
- **Arrive indicator**: 🔴 at end of directions
- **Footer**: waypoint count, step count, OSRM Router / Straight-line / Open Source source badge

##### Backend — OSRM (Open Source Routing Machine)
- `app/Http/Controllers/MockApi/RoutingController.php` (194 lines)
- `POST /mock-api/route` with body `{ waypoints: [[lng,lat],...], profile: "car"|"bike"|"foot" }`
- Calls `router.project-osrm.org/route/v1/{profile}/{coords}` with full geometry, steps, annotations
- Turn instruction builder: depart, arrive, turn left/right, new name, merge, ramp, fork, roundabout, exit roundabout, continue, end of road
- 2-minute cache per route
- **Fallback**: Straight-line routing with haversine distance + estimated duration (50/15/5 km/h for car/bike/foot) when OSRM is unreachable

##### Note on Network Domains
`router.project-osrm.org` must be in your network allowed domains for real road routing. Without it, the straight-line fallback provides distance estimates between waypoints.

## 0.25.56 - 2026-03-29

### Implemented — Route Planner / Directions (/map → Tools)
- **Route Planner** in the Tools section. Click to place waypoints on map, calculate routes via OSRM (open source), get turn-by-turn directions. Fully open source, no paid API.

#### How to Use
1. Open **Tools** section in sidebar → click **🧭 Route Planner** toggle or arrow
2. Click **+ Add Point**, then click on the map to place waypoints (A, B, C...)
3. Select transport profile: 🚗 Driving, 🚴 Cycling, 🚶 Walking
4. Click **🧭 Calculate Route** — route line renders on map with directions
5. Click any direction step to fly camera to that location
6. Drag waypoint markers on map to adjust — route auto-clears for recalculation

#### Map Rendering
- **Route line**: 3-layer rendering — black casing (8px, 30% opacity), colored main line (5px, profile color), white directional arrows (▸ symbols spaced along line).
- **Waypoint markers**: Circular pins with letter labels (A=green start, B-Y=blue waypoints, Z=red end), white border, drop shadow, downward triangle pointer. **Draggable** — drag to reposition.
- Route color changes with profile: blue (driving), green (cycling), amber (walking).
- Map auto-fits to route bounds after calculation.

#### Route Panel
- **Profile selector**: 3 buttons — Driving 🚗, Cycling 🚴, Walking 🚶. Switching profile clears previous result.
- **Waypoints list**: Each waypoint shows letter, label (Start/Waypoint N/End), coordinates. Reorder with ▲/▼ buttons. Remove with ✕. Clear All button.
- **Calculate Route** button (requires ≥2 waypoints).
- **Route summary**: 3 KPI cards — Distance, Duration, Profile.
- **Turn-by-turn directions**: Scrollable list with direction icons (🟢 depart, ↰ left, ↱ right, 🔄 roundabout, ⑂ fork, ↑ straight). Each step shows instruction, distance, duration, street name. Click step to fly to location. Red 🔴 arrive marker at end.
- **Footer**: waypoint count, step count, OSRM Router / Straight-line indicator.

#### OSRM Backend (100% Open Source)
- `app/Http/Controllers/MockApi/RoutingController.php` (175 lines) — Laravel proxy to OSRM demo server.
- `POST /mock-api/route` with body `{ waypoints: [[lng,lat],...], profile: "car"|"bike"|"foot" }`.
- Queries `router.project-osrm.org/route/v1/{profile}/{coords}` with full geometry (GeoJSON), steps, and annotations.
- Builds human-readable turn-by-turn instructions from OSRM maneuver data (turn, merge, roundabout, fork, ramp, end of road, new name).
- 2-minute cache per unique route.
- **Fallback**: If OSRM is unreachable, calculates straight-line route with haversine distance and estimated duration based on average speeds (car: 50km/h, bike: 15km/h, foot: 5km/h).

#### Waypoint Interactions
- **Click map** to add waypoints (crosshair cursor during placement mode).
- **Drag markers** on map — position updates, route clears for recalculation.
- **Reorder** via ▲/▼ in panel — updates labels (A, B, C...) and clears route.
- **Remove** individual waypoints via ✕ button.
- **Clear All** removes all waypoints, markers, and route line.

#### Technical
- PanelId 'routing' added.
- Route line: MapLibre GeoJSON source `route-line` with 3 layers (casing, main, arrows).
- Waypoint markers: MapLibre Marker with `draggable: true`, `dragend` event updates state.
- Placement mode: `routePlacing` state toggles map click handler + crosshair cursor.
- Escape handler: routePlacing → showRoutePanel2 → close.
- Tools badge updated to include routing state.
- Note: `router.project-osrm.org` must be in network allowed domains for live routing.

## 0.25.55 - 2026-03-29

### Implemented — Places of Interest Layer (/map → Layers)
- **Places of Interest** layer with 12 POI categories from OpenStreetMap Overpass API.

#### 12 Categories
Hospitals (🏥), Police (🚔), Fire Stations (🚒), Pharmacies (💊), Banks (🏦), ATMs (🏧), Schools (🏫), Gas Stations (⛽), Parking (🅿️), Restaurants (🍽️), Hotels (🏨), Embassies (🏛️).

#### Map Markers
- Circular pin markers (24px colored circle, white border, category letter, downward triangle).
- Hover scale 1.3x. Click opens dark popup with address, phone, hours, operator, website, coordinates.

#### Panel
- 12 category toggle buttons with counts, Select All / Clear All / Refresh.
- Search by name/address/operator. Scrollable place list with fly-to on click.
- Footer: count, Overpass LIVE / Mock Data indicator.

#### Backend
- `app/Http/Controllers/MockApi/OverpassController.php` — queries `overpass-api.de` with map viewport bounds.
- Supports nodes + ways. 5-minute cache. Bounding box clamped. Falls back to 27 mock POIs.
- Auto-refetches on map move (moveend event).

## 0.25.48 - 2026-03-29

### Updated — 3D Realistic Mode with Google Maps API

#### Google Maps API Integration
- Created `app/Http/Controllers/MockApi/GoogleMapsController.php` (135 lines) — Laravel proxy for Google Maps Tiles API.
- `GET /mock-api/google-maps/config` — returns API key status and tile endpoint URLs for satellite/hybrid/roadmap/terrain.
- `POST /mock-api/google-maps/session` — creates a Google Maps session token for authenticated tile access (cached 24h server-side).
- API key read from `.env` (`GOOGLE_MAPS_API_KEY`) or `credentials.json` (`google_maps_key` / `google_maps_api_key`).

#### Credentials Setup
Add Google Maps API key via either method:

**Option A — `.env`:**
```
GOOGLE_MAPS_API_KEY=your_key_here
```

**Option B — `credentials.json` (project root):**
```json
{
  "username": "opensky_user",
  "password": "opensky_pass",
  "google_maps_key": "AIza..."
}
```

#### 3D Realistic Mode Improvements
- **Session-authenticated tiles**: When API key present, creates a Google Maps session token and fetches from `tile.googleapis.com/v1/2dtiles/` for higher resolution satellite imagery (up to zoom 22).
- **Multi-source tiles**: Uses mt1/mt2/mt3 Google tile servers for parallel loading when on free tiles.
- **Raster enhancements**: Added `raster-saturation: 0.1` and `raster-contrast: 0.05` for richer satellite colors.
- **Building shadow layer**: New `realistic-buildings-shadow` layer renders ground shadows (5% extrusion height, 15% opacity black) beneath buildings for depth perception.
- **Improved building colors**: Warmer tones (`#d4d0c8` → `#989490`) interpolated by height to match real satellite imagery better.
- **Camera**: Initial pitch 62° (was 60°), bearing -15° for more cinematic entry, exaggeration 1.2 (was 1.3).
- **Async setup**: Tile URL configuration is now async — fetches config from backend, creates session, then adds sources/layers. No blocking.

#### Sidebar UI
- 3D Realistic tile icon changed to 🌏 (was 🏙️).
- Active mode info bar shows Google Maps API status:
  - Green badge "API ✓" when authenticated session active.
  - Amber badge "Free tiles" when using free mt1.google.com tiles.
- Other 3D modes show standard purple info bar.

#### Cleanup
- Added `realistic-buildings-shadow` layer to cleanup block when switching away from 3D Realistic.

## 0.25.47 - 2026-03-29

### Fixed — Satellite Markers: Interaction + Popup Visibility

#### Marker Fix
- **Root cause**: The old marker used `position:absolute;bottom:0;left:50%;transform:translateX(-50%)` inside a fixed-size wrapper. This caused MapLibre's internal marker container to clip overflow, making hover/click detection unreliable. The `translateX(-50%)` transform combined with `scale()` on hover shifted the transform origin unpredictably.
- **Fix**: Rewrote marker structure using simple flex column layout — no `position:absolute`, no fixed wrapper dimensions, no compound transforms. The entire marker is a natural-flowing `display:flex;flex-direction:column;align-items:center` div. Transform origin set to `bottom center` so scaling expands upward from the globe surface point.
- Click target is now `.sat-hit` class covering the entire marker area (dot + stalk + shadow). Hover applies `scale(1.5)` with z-index 200.

#### Popup Fix
- Popup uses `className: 'tmap-popup'` (the dark themed class with existing CSS).
- Simplified popup offset to `[0, -8]` — no more complex stalkH calculations that broke with the anchor change.
- Popup content uses `tmap-popup-inner` with CSS variables for proper dark theme rendering.
- 3 KPI cards (Altitude, Velocity, Period) at top + 8-field data grid below.

#### CSS Cleanup
- Removed old `.sat-inner` rules, replaced with `.sat-hit` pointer-events.
- Fixed `@keyframes tmap-sat-pulse` — removed `translateX(-50%)` from animation (was causing pulse ring to fly off-center).
- Added `:hover` z-index override on `.maplibregl-marker:has(.tmap-sat-marker)`.

## 0.25.46 - 2026-03-29

### Updated — Satellite Markers: 3D Stalk Visualization

#### 3D Stalk Markers (altitude above globe)
Each satellite now renders as a vertical "stalk" rising from the globe surface. The stalk height is proportional to orbital altitude on a logarithmic scale: LEO (~300 km) produces a 30px stalk, MEO (~20,000 km) ~80px, GEO (~36,000 km) ~110px. At the bottom of the stalk is an elliptical ground shadow showing the sub-satellite point, and at the top sits the 3D satellite body.

#### Category-Specific Satellite Bodies
- **Space Station** (ISS, CSS): Rounded square with solar panel "wings" extending horizontally, intense glow, pulsing ring animation (2s cycle), name label.
- **Navigation** (GPS, GLONASS, Galileo, BeiDou): Radial gradient sphere with antenna spike, amber glow.
- **Starlink**: Flat rectangular bar simulating the flat-panel design, subtle gray glow.
- **Military**: Named label, radial gradient sphere with red glow + solar panel wings.
- **Scientific** (Hubble): Named label, gradient sphere with panel wings, pink glow.
- **Debris**: Small dim dot (5px), no label, minimal glow, short stalk.
- **Other** (Communication, Weather, Earth Obs): Gradient sphere with radial highlight and horizontal solar panel line.

#### Visual Elements Per Marker
- **Satellite body** at stalk top with radial gradient + glow
- **Vertical stalk line** fading from category color to transparent (gradient)
- **Ground shadow** ellipse at stalk base (radial gradient fade)
- **Altitude label** on stalk side (e.g. "420 km" or "36k km")
- **Name label** above body for stations, military, scientific
- **Pulse ring** animation for space stations

#### Popup Redesign
- 3 KPI cards at top: Altitude, Velocity, Period with large monospace numbers.
- Dual-unit display: km + ft for altitude, km/s + mph for speed.
- Orbit type badge next to category badge.
- Status with green/gray color coding.
- 8-field data grid: Inclination, Country, Launch Date, Status, Alt (ft), Speed (mph), Latitude, Longitude.
- Popup offset calculated from stalk height so it appears above the satellite body.

#### CSS
- `@keyframes tmap-sat-pulse` for space station pulsing ring.
- `.tmap-sat-marker` pointer-events and overflow fixes.
- Marker anchor changed from `center` to `bottom` so stalk connects to surface point.

## 0.25.45 - 2026-03-29

### Implemented — Satellite Tracking on 3D Globe (/map)
- **Live satellite tracking** via CelesTrak GP data, rendered on the 3D Globe tile.

#### Sidebar Controls (Tiles → Satellite Tracking)
- 🛰️ Satellite Tracker toggle — auto-activates 3D Globe when enabled.
- Category filter buttons: Space Station, Communication, Navigation, Weather, Earth Observation, Military, Scientific, Starlink, Debris.
- Panel open button to show full satellite list.

#### Map Rendering (Globe only)
- Satellites render as glowing dot markers with category-colored glow effects.
- Space stations (ISS, CSS): 10px dots with double glow + name label above.
- Standard satellites: 6px dots, debris: 4px dots.
- Hover: 2x scale with z-index boost. Click: dark themed popup with full satellite data.
- Orbital animation: positions update every 2s using angular velocity from period + inclination.
- Markers automatically removed when switching away from Globe mode.

#### Satellite Popup (on click)
- Header: category icon, satellite name, NORAD ID, international designator, category badge.
- Data grid: Altitude (km), Velocity (km/s), Inclination (°), Period (min), Orbit type, Country, Launch date, Status, Position, Category.
- Footer: CelesTrak source + orbit type badge.
- Popup follows satellite position as it moves.

#### Satellite Panel
- Category filter buttons with counts.
- Search by name, country, NORAD ID.
- Scrollable satellite list: glowing dot, name, orbit type, altitude, velocity, category badge, NORAD ID. Click to fly camera.
- Footer: object count, last update time, CelesTrak LIVE / Mock Data indicator.

#### CelesTrak API Backend
- `app/Http/Controllers/MockApi/CelesTrakController.php` (159 lines) — Laravel proxy.
- `GET /mock-api/satellites?group=stations&limit=60` → fetches GP JSON from celestrak.org, computes approximate lat/lng/alt from orbital elements (mean motion + epoch + RAAN + inclination), categorizes by name/type, returns JSON.
- 120-second cache to respect rate limits.
- Orbit type classification: LEO/MEO/GEO/HEO/SSO based on altitude, inclination, period.
- Aircraft categorization: space-station, navigation, weather, earth-observation, military, scientific, starlink, communication, debris — by name pattern matching.
- Falls back to 20 mock satellites if API unreachable.

#### 20 Mock Satellites
| Name | Category | Orbit | Alt (km) |
|---|---|---|---|
| ISS (ZARYA) | Space Station | LEO | 420 |
| CSS (TIANHE) | Space Station | LEO | 390 |
| HUBBLE | Scientific | LEO | 540 |
| NOAA 20 | Weather | SSO | 824 |
| GPS IIR-14 | Navigation | MEO | 20,200 |
| GALILEO-FM4 | Navigation | MEO | 23,222 |
| METEOSAT-9 | Weather | GEO | 35,786 |
| COSMOS 2471 | Navigation | MEO | 19,140 |
| STARLINK-1007/8/9 | Starlink | LEO | 550 |
| LANDSAT 9 | Earth Obs | SSO | 705 |
| SENTINEL-1A | Earth Obs | SSO | 693 |
| CRYOSAT 2 | Earth Obs | SSO | 717 |
| EUTELSAT 25B | Communication | GEO | 35,786 |
| BEIDOU-3 M1 | Navigation | MEO | 21,528 |
| USA-326 | Military | SSO | 440 |
| TIANGONG 1 DEB | Debris | LEO | 310 |

#### Technical
- PanelId 'satellites' added to union type.
- Escape handler: showSatPanel → close.
- rAF loop pattern (same as flights): reads from ref, throttled 800ms, no React re-renders.
- Globe rebuild recovery: clears marker map when mapVersionRef changes.
- ~200 lines new code in Map page, 47 lines mock data, 159 lines controller.

## 0.25.44 - 2026-03-29

### Fixed — Live Flights: Marker Interaction + Popup + 3D

#### Bug 1: Markers disappearing on hover/click
- **Root cause**: The rendering `useEffect` depended on `filteredFlights` (a `useMemo`). Every 10s API poll updated `flights` state → `filteredFlights` recalculated (new array ref) → effect re-ran → markers were processed mid-interaction.
- **Fix**: Completely decoupled rendering from React's effect cycle. Flight data is now stored in `filteredFlightsRef` (a mutable ref). Marker positions are updated by a `requestAnimationFrame` loop (throttled to 800ms) that reads from the ref — **no React state change triggers DOM updates**. The effect only runs when `layerFlights` toggles ON/OFF.
- Hover events now on inner `.flight-inner` div with `pointer-events:auto !important`. Scale transform on hover (1.5x) and z-index (200) isolated from MapLibre's marker container.
- `flightSelectedRef` stores current selection in a ref so the rAF loop can read it without being a dependency.

#### Bug 2: White popup background
- **Root cause**: Popup used `className: 'tmap-flight-popup'` which had no CSS. The existing dark popup CSS was on `.tmap-popup`.
- **Fix**: Changed to `className: 'tmap-popup'` — now uses the existing dark theme popup styles (dark background, themed borders, close button).
- Popup content redesigned: uses CSS variables (`var(--ax-text)`, `var(--ax-border)`, etc.) instead of hardcoded white colors. Works correctly across all 10 themes.
- Added route display with animated arrow SVG (departure → arrival).
- Shows altitude in both km and ft, speed in kts and km/h, vertical rate with ↑/↓ arrows.
- Popup follows the aircraft: rAF loop calls `popup.setLngLat()` on every position update so the popup stays attached to the moving marker.

#### Bug 3: Not working on 3D maps
- **Root cause**: When switching to 3D Globe, `rebuildMapForGlobe()` destroys and recreates the MapLibre map instance. Old markers reference the destroyed map.
- **Fix**: Added `flightMapVerRef` that tracks `mapVersionRef.current`. When the version changes (map rebuilt), the marker map is cleared, and the rAF loop automatically recreates all markers on the new map instance in the next frame.

#### CSS additions
- `.tmap-flight-marker` and `.flight-inner`: `pointer-events: auto !important` ensures clicks reach the marker element even when MapLibre's container has overflow clipping.

## 0.25.43 - 2026-03-29

### Updated — Live Flights: Real API + Marker Fix

#### Real OpenSky Network API Integration
- Created `app/Http/Controllers/MockApi/OpenSkyController.php` — Laravel proxy that fetches live ADS-B data from OpenSky Network API.
- Created `config/opensky.php` — configuration for credentials, bounds, cache TTL.
- Added route `GET /mock-api/flights` → proxies to OpenSky with bounding box from map viewport.
- **Credentials setup**: Place `credentials.json` (from opensky-network.org) in project root. Format: `{"username":"...","password":"..."}`. Alternatively set `OPENSKY_USERNAME` and `OPENSKY_PASSWORD` in `.env`.
- Authenticated users get 10s update intervals (vs 30s anonymous). Falls back to mock data if API unreachable.
- Server-side caching (8s TTL) prevents excessive API calls.
- Aircraft categorization: commercial/cargo/private/military/helicopter detected by OpenSky category code + callsign prefix patterns (FDX→cargo, GAF→military, etc.).

#### Marker Click Bug Fixed
- **Root cause**: Every 3s position update destroyed ALL markers and recreated them, which killed any open popup.
- **Fix**: Markers stored in a `Map<icao24, {marker, el, data}>` keyed by ICAO24 hex. Position updates call `marker.setLngLat()` and update SVG rotation — no destruction. Markers are only created/removed when the filtered flight set changes (search/filter).
- Popup click handler reads from `entry.data` (mutable ref to latest flight data) so popup always shows current values even after updates.

#### Panel Enhancements
- Footer shows data source: "OpenSky LIVE" (green dot) or "Mock Data" (amber dot).
- Last update timestamp displayed.
- Sidebar description shows "LIVE" or "Mock" indicator.
- Frontend polls `/mock-api/flights` every 10 seconds with map viewport bounding box.
- If viewport is zoomed out >12° lat or >15° lng, bounds are clamped to prevent overloading.

## 0.25.42 - 2026-03-29

### Implemented — Live Flights Layer (/map → Layers)
- **Live civilian flight tracking** on the tactical map via OpenSky Network ADS-B data (mock). Works on all 2D tiles and 3D Globe/Buildings/Terrain modes.

#### Flight Markers on Map
- SVG airplane icons rotated to match heading, color-coded by category (commercial=blue, cargo=amber, private=green, military=red, helicopter=purple).
- Callsign label above each aircraft (JetBrains Mono, 7px).
- Flight level (FLxxx) label below each aircraft.
- Hover: scale up 1.3x with z-index boost.
- Click: opens detailed popup with all flight data.

#### Flight Popup (on click)
- Header: category icon, callsign, airline/category, country.
- 8-field data grid: Aircraft type, Registration, Altitude (km + FL), Speed (m/s + knots), Heading (degrees), Vertical Rate (m/s), Squawk code, ICAO24 hex.
- Route card: departure ICAO → arrival ICAO with airport names (when available).
- Footer: data source attribution + coordinates.

#### Flights Panel (standalone floating panel)
- Category filter buttons: Commercial (10), Cargo (2), Private (1), Military (1), Helicopter (1) — toggle individually.
- Search: filter by callsign, airline, country, departure, arrival, ICAO24.
- Flight list: each row shows airplane icon (rotated), callsign (monospace), category badge, airline/route info, flight level, speed in knots. Click to fly camera to aircraft.
- Selected flight highlighted with left border accent.
- Footer: flight count, "Updates every 3s", live status indicator, "OpenSky ADS-B" badge.

#### Live Position Updates
- Aircraft positions update every 3 seconds with realistic movement simulation.
- Velocity-based displacement along heading vector with ±20% randomization.
- Heading drift ±1° per update for realism.
- Speed variation ±2.5 m/s per update.

#### 15 Mock Aircraft
| Callsign | Airline | Aircraft | Route | Category |
|---|---|---|---|---|
| DLH1A | Lufthansa | A320-271N | FRA → ZAG | Commercial |
| SWR162 | Swiss Intl | A220-300 | ZRH → ATH | Commercial |
| CTN523 | Croatia Airlines | A319-112 | SPU → ZAG | Commercial |
| RYR4PL | Ryanair | B737-8AS | STN → DBV | Commercial |
| THY6EL | Turkish Airlines | B737-9F2 | IST → VIE | Commercial |
| AFR1842 | Air France | A321-212 | CDG → BEG | Commercial |
| FDX5210 | FedEx | B767-3S2F | MEM → BUD | Cargo |
| CTN701 | Croatia Airlines | DHC-8-402 | ZAG → OSI | Commercial |
| AUA451 | Austrian Airlines | E195 | VIE → DBV | Commercial |
| 9ACRO | — | Cessna 172S | — | Private |
| GAF614 | — | Airbus A400M | — | Military |
| HRZL1 | — | Airbus H145 | — | Helicopter |
| EWG7KD | Eurowings | A320-214 | MXP → OTP | Commercial |
| EIN52Y | Aer Lingus | A320-214 | DUB → SKG | Commercial |
| UPS234 | UPS Airlines | B747-8F | CGN → DXB | Cargo |

#### Technical
- Layer toggle in Layers section with toggle switch + panel open button.
- Standalone floating panel (not shared layer panel) — can coexist with other layers open.
- PanelId 'flights' added to union type.
- `FlightData` interface and `flightCategoryConfig` exported from mock/map.ts.
- Flight markers use MapLibre Marker API with custom HTML elements — works on both 2D flat and 3D globe projection.
- State: layerFlights, showFlightsPanel, flightSearch, flightCategoryFilter, flightSelected, flights.
- Live update interval (3s) starts/stops with layerFlights toggle.
- Cleanup: all markers removed when layer deactivated.

## 0.25.41 - 2026-03-28

### Implemented — Location Analyzer (/map → Intelligence)
- **Location Analyzer** — select a rectangular area on the map and run intelligence analysis to get comprehensive results displayed both on the map and in a floating panel.

#### How to Use
1. Open Intelligence section in sidebar → click **📐 Location Analyzer**
2. Click **Select Area** → cursor becomes crosshair
3. Click and drag on the map to draw a rectangle
4. Click **Analyze** → 2.2s mock analysis runs
5. Results appear in panel + hotspots render on map

#### Map Interaction
- Rectangle drawing: mousedown → drag → mouseup creates selection bounds
- Map panning disabled during drawing, cursor set to crosshair
- GeoJSON rectangle overlay: teal (#14b8a6) dashed border + 12% opacity fill
- Hotspot circles: rendered at detected locations with intensity-based radius (6-18px)
- Clickable hotspots in panel fly camera to location

#### Analysis Panel (8 sections)
1. **Controls**: Select Area / Analyze buttons, drawing status indicator, NW/SE coordinate display
2. **KPI Summary**: 6 cards — Events, Persons, Devices, Alerts, Daily Avg Activity, Risk Score (%)
3. **Top Subjects**: 5 persons with initials avatar, risk badge (Critical/High), event count, last seen, avg dwell time. Clickable to fly to area center.
4. **Event Breakdown**: 6 types with icon, label, progress bar, count — GPS Signal (37%), Camera Capture (23%), LPR Detection (15%), Phone Signal (12%), Face Match (8%), Audio/Video (5%)
5. **Time Distribution**: 6-period bar chart (00-04, 04-08, 08-12, 12-16, 16-20, 20-00) showing peak at 12-16 (31%)
6. **Hotspots**: 3 detected hotspots with intensity score (65-92), event count, clickable fly-to
7. **Zone Activity**: 2 zones (restricted + monitored) with breach count and last breach time
8. **Threat Assessment**: 3 ranked threats — unusual night activity (critical), co-location frequency spike (high), new unregistered device (medium)

#### Technical
- State: showLocAnalyzer, locAnalyzerDrawing, locAnalyzerBounds, locAnalyzerRunning, locAnalyzerResults
- Map layers: loc-analyzer-fill (polygon), loc-analyzer-outline (dashed line), loc-analyzer-hotspot-circles (circle with intensity interpolation)
- Drawing uses mousedown/mousemove/mouseup with dragPan disable/enable
- Escape handler chain updated for locAnalyzerDrawing → showLocAnalyzer
- Dependency array updated with showLocAnalyzer, locAnalyzerDrawing
- Panel uses PanelHeader + PanelResizeGrip pattern consistent with other intelligence panels
- ~170 lines of new code added to Map page

## 0.25.40 - 2026-03-28

### Implemented — Cinema Mode for 3D Globe (/map)
- **Cinema Mode** — full cinematic experience for the 3D Globe tile with professional HUD overlay, auto-rotation, waypoint navigation, and telemetry display.

#### Cinema Mode Controls (Tiles Section)
- Toggle Cinema Mode ON/OFF with animated switch (activates 3D Globe automatically if not already active).
- **Play/Pause** button to freeze or resume globe rotation.
- **Rotation Speed** slider (0.02–0.50 degrees/frame) with live numeric readout.
- **HUD toggle** — show/hide the heads-up display overlay.
- **Auto-Fly toggle** — cycle through waypoints every 12 seconds automatically.
- **6 Waypoints** with fly-to: Zagreb HQ, Port Area Zone Alpha, Eastern Europe Overview, Mediterranean Theater, Middle East SIGINT, Global Full View. Each with custom zoom, pitch, and bearing.

#### Cinema HUD Overlay
- **Top-Left**: CLASSIFIED // NOFORN badge (pulsing red), ARGUX branding with glow effect, current time (UTC offset), full date.
- **Top-Right**: Telemetry readout — LAT, LNG, ZOOM, BRG in monospace with real-time values from map state.
- **Bottom-Left**: Current waypoint name, rotation speed, status (ROTATING/PAUSED), auto-fly indicator.
- **Bottom-Right**: Platform stats — Entities (12,847), Events/Day (134K), Operations (5 Active), Uptime (99.97%).
- **Center-Bottom**: Floating control orbs — Play/Pause, Previous Waypoint, Next Waypoint, Exit Cinema.
- **Visual Effects**: Scanline overlay (subtle CRT effect), corner bracket decorations, pulsing status indicator, backdrop blur on controls.

#### Technical Details
- Cinema Mode state: cinemaMode, cinemaSpeed, cinemaHud, cinemaAutoFly, cinemaPaused, cinemaWaypointIdx.
- Spin speed is dynamically updatable — changing the slider immediately updates rotation velocity.
- Fly-to waypoints temporarily pause spin, then resume after 4.5s transition.
- Auto-Fly cycles through all 6 waypoints with 12s interval, then loops.
- Exiting Cinema Mode cleanly stops all timers and animation frames.
- CSS: cinema-pulse keyframe, scanlines gradient, corner SVG brackets, transition animations.

## 0.25.39 - 2026-03-28

### Implemented — Admin Profile (/admin/profile)
- Full profile page for admin users using AdminLayout with red accent.
- 5 tabs: Personal Data, Password, Security, Settings, Audit Logs.
- Copied logic from /profile with admin-specific styling (red accent, ADMIN badge).
- Personal Data: avatar upload, name, email, phone fields.
- Password: current/new/confirm with 5 strength rules.
- Security: 2FA method (App/SMS/Email), backup codes, active sessions with revoke, login stats.
- Settings: language with flags, timezone, date format, 10 themes grid, 7 fonts grid.
- Audit Logs: searchable paginated log with action badges.

### Updated — Admin Header Menu
- UserDropdown is now context-aware via `isAdmin` prop.
- Admin context: "My Profile" → /admin/profile, "Back to Platform" → /map, Logout → /admin/login.
- User context: unchanged — "My Profile" → /profile, "Download Client", "Settings", Logout → /login.
- AppHeader accepts new optional `isAdmin` prop (in addition to hideClock, hideNotifications).

## 0.25.38 - 2026-03-28

### Updated — Admin Layout
- Removed clock dropdown from admin header.
- Removed notifications dropdown from admin header.
- AppHeader now accepts optional `hideClock` and `hideNotifications` props. Admin layout passes both as true. User layout unchanged (shows both).

## 0.25.37 - 2026-03-28

### Updated — Configuration (/admin/config) — Expanded to 11 Tabs

#### New Tab: Update (🔄)
- Current installation info: version, build, date, environment, Node.js, PHP, Laravel, React, Vite, Tauri versions.
- Available updates with type badges (major/minor/patch/security), change lists, size, Install button.
- Update history with version, type, date, changes summary, size.
- Check for Updates and System Report action buttons.

#### New Tab: Licence (🔑)
- Licence info: key (monospace), type (Enterprise), holder, validity dates, hardware lock ID, support tier, last verified, days remaining.
- Seat usage bar (147/200 used) with color-coded progress.
- 25 licensable modules: each shows icon, name, LICENSED/NOT LICENSED badge, add-on indicator with pricing.
- Verify Licence and Update Licence Key actions.
- Modules include: Tactical Map, Vision, Persons, Organizations, Vehicles, Devices, Operations, Face Recognition (€15k add-on), Plate Recognition (€12k), Social Scraper (€8k), Surveillance Apps (€20k), AI Assistant (€25k), AI Transcription (€18k), Translation (€10k), Air-Gap (€30k), Multi-Site (€50k, not licensed), Satellite Feed (€75k, not licensed).

#### Updated Tab: Backup (💾) — Separated from AI
- Backup schedule: frequency, type (full/incremental/differential), encrypt toggle, verify toggle, include MinIO files toggle.
- Database selection: 5 databases (PostgreSQL+PostGIS 84GB, ClickHouse 320GB, Redis 2.8GB, Typesense 12GB, ChromaDB 4.2GB) with individual enable/disable toggles.
- Run Backup Now and Verify Last Backup action buttons.
- Backup history: 6 records (completed, failed, scheduled) showing type, date, duration, size, databases, file inclusion, encryption, verification status. Failed backups show error reason.
- Restore from backup with confirmation modal warning about data overwrite.

#### Updated Tab: AI Models (🤖) — Separated from Backup
- **9 AI functions** each with multiple assignable models:
  1. **RAG Assistant** (🧠) — LLaMA 3.1 70B (primary), LLaMA 3.1 8B, Mistral 7B
  2. **Audio Transcription** (🎙️) — Faster-Whisper Large-v3 (primary), Faster-Whisper Medium
  3. **Video Analysis** (🎥) — Faster-Whisper Large-v3 (primary), YOLOv8 Object
  4. **Photo Analysis & OCR** (📷) — LLaVA Vision (primary), PaddleOCR v3
  5. **Plate Recognition** (🚗) — YOLOv8 Plate Detect (primary), PaddleOCR v3 Chars
  6. **Face Recognition** (🧑) — InsightFace/ArcFace (primary), RetinaFace Detect
  7. **Translation** (🌐) — Meta NLLB-200
  8. **Summarization** (📝) — LLaMA 3.1 70B
  9. **Anomaly Detection** (🔮) — XGBoost Risk, scikit-learn Pipeline
- Per-function stats: jobs today, total jobs, avg processing time, error rate, GPU usage %, queue depth.
- Per-model: version, GPU memory, active/standby toggle, PRIMARY badge for default model.
- Expandable accordion per function — click to show models and stats.
- Summary KPIs: total functions, active models, GPU allocated, jobs today.

#### New Tab: Storage (🗄️)
- Summary KPIs: total capacity (9.6 TB), used (2.8 TB), available (6.8 TB), usage %.
- 6 storage nodes: PostgreSQL+PostGIS (84/500 GB), ClickHouse (320/1000 GB), MinIO (2.4/8 TB), Redis (2.8/32 GB), Typesense (12/64 GB), ChromaDB (4.2/50 GB). Each with progress bar, version, host:port, connection count, status badge.
- 7 MinIO buckets: surveillance-video (12,840 objects, 1.2 TB), camera-captures (89,200 objects, 480 GB), audio-recordings, documents, photos, database-backups, ai-models. Each with object count and proportional bar.

### Technical
- Tab count expanded from 7 to 11.
- **Mock data** (`resources/js/mock/admin-config.ts`, 255 lines): Complete datasets for all 11 tabs including 6 backup history records, 9 AI functions with 19 models, 6 storage nodes, 7 MinIO buckets, 2 available updates, 4 update history, licence info with 25 modules.
- **Tests** (`resources/js/tests/AdminConfig.test.ts`, 96 lines): 30 tests across 10 describe blocks covering all new tabs.
- Page: 285 lines (was 268).

## 0.25.36 - 2026-03-28

### Implemented — Configuration (/admin/config)
- **7 configuration tabs** with full form controls, toggles, CRUD for clocks/IPs, and live state.

#### Tab 1: General (⚙️)
- **Language & Region**: Language (6), Timezone (12), Date Format (5), Number Format (3).
- **Appearance**: Default Theme (10 themes), Default Font (7 fonts), Classification Level (6), System Name.
- **Header Clocks**: CRUD — add/remove city clocks with timezone selector. 5 defaults (Zagreb, London, New York, Dubai, Tokyo). Add Clock modal with label + timezone. Remove with ✕ button.

#### Tab 2: Security (🔐)
- **Two-Factor Auth**: Default MFA Method (App/SMS/Email dropdown), MFA Enforcement (required/optional/admin-only).
- **Session Management**: Session Timeout (8 options: 15min → Never), Max Concurrent Sessions (number input).
- **Encryption**: Algorithm (AES-256-GCM/CBC, ChaCha20), TLS Version (1.2/1.3), Force HTTPS toggle.
- **Password Policy**: 7 configurable rules — min length, uppercase/lowercase/number/special (toggles), max age, history depth.
- **IP Whitelist**: CRUD — add/remove CIDR ranges. 3 defaults (10.0/8, 192.168/16, 172.16/12). Inline ✕ removal.
- **Audit Logging**: Master toggle, brute force threshold, lockout duration.

#### Tab 3: Notifications (🔔)
- **Global**: Master enable/disable toggle, quiet hours (start/end time pickers), cooldown minutes, min severity for push.
- **Preferences**: 14 notification types (zone breach, face match, LPR, co-location, signal lost, speed, keyword, device offline, sync, report, AI job, user login, backup, system error). Each with icon + toggle.
- **Channels**: 7 delivery channels (In-App, Email, SMS, Webhook, Telegram, Slack, Push). Each with icon, label, toggle, ACTIVE/OFF badge.

#### Tab 4: Developer (🛠️)
- **Environment**: App Environment (5: production→local), Debug Mode (3), Log Level (8: emergency→debug), Log Channel (6), App URL, Filesystem (4).
- **Cache & Queue**: Cache Driver (redis/memcached/file/array), Queue Driver (redis/database/sync/null), Worker count, Job timeout.
- **API & CORS**: Rate limit, CORS origins.
- Non-production warning banner.

#### Tab 5: Map Defaults (🗺️)
- **Default View**: Center Lat/Lng (number inputs), Zoom (1-20), Tile Provider (16 providers).
- **Layers**: 6 toggleable layers (Markers, Heatmap, Tracks, Zones, Network, Clusters).
- **Performance**: Cluster threshold, max markers, trail history, 3D buildings mode.
- Live preview summary of current defaults.

#### Tab 6: Data Retention (📦)
- **Policies**: 6 retention dropdowns — Event Logs, App Logs, Media Files, Chat History, Backups, Audit Trail. Each with hint text. Options: 7 days → Forever.
- **Auto-Purge**: Master toggle for automatic deletion.
- **Storage Estimates**: 6 cards showing estimated consumption per category with current retention.

#### Tab 7: Backup & AI (💾)
- **Backups**: Frequency (6h→Monthly), Type (Full/Incremental/Differential), Encryption toggle, Integrity verification toggle.
- **AI Models**: 9 models (LLaMA 3.1 70B, 8B, Faster-Whisper, InsightFace, NLLB-200, LLaVA, PaddleOCR, YOLOv8, Mistral 7B) with active/standby toggles, GPU memory per model, status badges.
- **RAG Index**: Rebuild schedule (daily/weekly/manual).
- GPU summary: Total active GPU, active count, standby count.

### Technical
- **Mock data** (`resources/js/mock/admin-config.ts`, 111 lines): 6 languages, 12 timezones, 5 date formats, 10 themes, 7 fonts, 5 default clocks, 3 MFA methods, 8 session timeouts, 3 encryption algorithms, 7 password policies, 3 IP ranges, 14 notification types, 7 channels, 5 environments, 3 debug modes, 8 log levels, 6 log channels, 4 filesystems, 16 tile providers, 6 map layers, 10 retention periods, 5 backup frequencies, 3 backup types, 9 AI models.
- **CSS** (`resources/css/pages/admin-config.css`, 22 lines): Tab styles, section cards, form fields, toggle component, grid layouts, responsive.
- **Tests** (`resources/js/tests/AdminConfig.test.ts`, 76 lines): 34 tests across 9 describe blocks.
- **Keyboard shortcuts**: `1-7` tab switch, `S` save, `Esc` close, `Ctrl+Q` modal.
- Page: 268 lines (was 11 placeholder).

## 0.25.35 - 2026-03-27

### Implemented — Statistics (/admin/statistics)
- **6 tab dashboards** with pure SVG charts (zero external dependencies). Tab switching with skeleton transition. Keyboard shortcuts 1-6 for tabs.
- **7 reusable SVG chart components**: BarChart (grouped), LineChart (multi-series), AreaChart (stacked), DonutChart (ring with legend), HBar (horizontal bars), Heatmap (day×hour matrix), data tables.

#### Tab 1: Overview
- 6 KPI cards: Total Events (1.2M), Tracked Entities (12,847), Active Operations (5), AI Jobs (8,432), Storage (2.4 TB), Uptime (99.97%).
- Event Trend line chart (6 months, ascending from 82k to 134k).
- Entity Growth multi-line chart (persons/orgs/vehicles, 6 months).
- Storage Breakdown donut chart (7 categories: Video 1.2TB, Camera 480GB, Audio 220GB, etc.).
- Event Types horizontal bar chart (8 types: GPS 412k, Phone 287k, Camera 198k, LPR 89k, Face 42k, Audio 28k, Video 18k, Web 12k).

#### Tab 2: Activity
- Activity Heatmap (7 days × 24 hours, color-coded Low/Med/High/Peak). Shows peak at weekday mornings 08:00-16:00, quiet weekends.
- Top 8 Subjects by Activity horizontal bar chart (Horvat 4,823 → Tanaka 987).
- Event Type Distribution donut chart (8 types with percentages).

#### Tab 3: Devices
- Devices by Type grouped bar chart (online vs offline: 47 cameras, 34 GPS, 28 phones, 18 LPR, 12 microphones, 8 face cameras).
- Battery Distribution bar chart (6 ranges: 0-20% through N/A).
- Sync Rate line chart (cameras/GPS/phones by hour, all >88%).
- Device Fleet Summary: 6 stat cards with total/online/offline per type.

#### Tab 4: Alerts
- Alert Frequency stacked bar chart (7 days × 3 severities). Friday peak (67 total).
- Severity Distribution donut chart (Critical 19, Warning 71, Info 172).
- Response Time histogram (5 ranges: <5s through >60s, majority 5-15s).
- Top 8 Triggered Rules ranked list with severity badges (Zone Entry 89, Co-location 34, LPR Match 28...).

#### Tab 5: Media & AI
- Upload Volume stacked area chart (5 weeks × 4 types: video/audio/photos/docs, growing trend).
- AI Model Performance: 6 models (Faster-Whisper, LLaVA, NLLB-200, LLaMA 3.1, InsightFace, PaddleOCR) with jobs, avg time, GPU%, queue.
- Face Recognition Match Rate line chart (6 months, improving from 26.3% to 34.6%).

#### Tab 6: Subjects
- Top 10 Persons table (name, risk badge, events, connections, devices). Horvat leads with 4,823 events.
- Top 8 Organizations horizontal bar chart (by connection count, risk-colored).
- Risk Distribution grouped bar chart (persons vs orgs across 5 risk levels).
- New Entities stacked area chart (6 months × persons/orgs/vehicles).

### Technical
- All charts are pure SVG — no Recharts, Chart.js, or D3 dependency. Renders instantly.
- Charts include gridlines, axis labels, legends, tooltips (via `<title>`), and responsive viewBox scaling.
- Tab switching triggers 400ms skeleton transition.
- **Mock data** (`resources/js/mock/admin-statistics.ts`, 143 lines): Comprehensive datasets for all 6 tabs. Realistic values matching platform scale.
- **CSS** (`resources/css/pages/admin-statistics.css`, 22 lines): Tab styles, chart grids (2-col/3-col), KPI row (6-col), responsive breakpoints.
- **Tests** (`resources/js/tests/AdminStatistics.test.ts`, 82 lines): 34 tests across 9 describe blocks covering all data integrity.
- **Keyboard shortcuts**: `1-6` tab switch, `R` refresh, `Esc` close, `Ctrl+Q` shortcuts modal.
- Page: 147 lines (compact due to inline SVG chart components).

## 0.25.34 - 2026-03-27

### Implemented — User Management (/admin/users)
- **Full CRUD** for 15 operator accounts. Create, edit, view detail, suspend/activate, delete.
- **8-column sortable table**: Avatar, Name (+dept+unit), Email, Role badge, Status dot, Last Login, MFA, Actions.
- **5 statuses**: Active (9), Suspended (1), Pending (2), Locked (1), Archived (1). Clickable KPI chips.
- **5 filters**: Status, Role, Department (10), Unit (9), MFA (enrolled/not). Full-text search.
- **Create/Edit modal**: First/last name, email, phone, role (from user roles), department, unit, notes.
- **Detail modal**: Full profile, role/status/MFA/session badges, info grid, notes, edit/suspend/delete.
- **15 mock users** across 5 roles (Senior Operator, Intelligence Analyst, Operator, Viewer, Trainee), 10 departments, 9 units.
- Responsive mobile cards at ≤960px. Pagination 10/page. Keyboard shortcuts.

### Implemented — Role Management (/admin/roles)
- **Full CRUD** for 10 roles (5 admin + 5 user) with interactive permission matrix.
- **32 modules** across 8 sections: Command (3), Subjects (4), Intelligence (5), Analysis (3), Monitoring (4), Tools (4), System (1), Admin (8). Covers all user-facing pages.
- **6 permission types** per module: View, Create, Edit, Delete, Export, Manage.
- **Permission matrix** (interactive in create/edit, read-only in detail): Click individual cells to toggle. Click module row toggle-all. Click section header to toggle entire section. Visual checkmarks with green highlights.
- **Role cards**: Color bar, name, scope (Admin/User), level, system badge, description, permission count, user count, created date. Duplicate/edit/delete actions.
- **Scope filter**: All / Admin Roles (5) / User Roles (5).
- **Duplicate role**: One-click copy with "(Copy)" suffix for quick creation.
- **System roles**: Protected from deletion (🔒 badge). Can still be edited.
- **Create/Edit modal**: Name, scope (admin/user), level (1-10), color picker, description, full interactive permission matrix.
- **Read-only matrix view**: Click any role card to expand permission matrix below.
- **10 mock roles**: Super Admin (all access), Admin (all except admin management), Security Officer (audit+security), Audit Reader (read-only audit), Support Agent (tickets+KB), Senior Operator (full operational), Intelligence Analyst (intel+analysis), Operator (standard), Viewer (read-only), Trainee (minimal).

## 0.25.33 - 2026-03-27

### Implemented — Admin Management (/admin/admins)
- **Full CRUD** for administrator accounts. Create, edit, view detail, suspend/activate, force password reset, delete with confirmation.
- **12 mock admins** across 5 roles, 4 statuses, 8 departments. Each admin: name, email, phone, role, status, MFA method + enrollment, department, last login/IP, login count, created date/by, failed attempts, locked until, active sessions (device/IP/location/time), permissions list, notes.
- **5 admin roles** with level hierarchy: Super Admin (L5), Admin (L4), Security Officer (L3), Audit Reader (L2), Support Agent (L1). Each role shows description in create/edit form.
- **4 statuses**: Active (7), Suspended (1), Pending (2), Locked (1). Clickable KPI chips for quick filtering.
- **8-column sortable table**: Avatar (initials in role color), Name (+department), Email, Role badge, Status dot+label, Last Login (monospace), MFA status, Actions (edit/suspend/delete buttons).
- **Advanced filters** (4 dimensions): Role dropdown (5 roles), Department dropdown (8 depts), MFA (enrolled/not enrolled), plus status KPI chips. Filter count badge. Clear all.
- **Full-text search** across name, email, department.
- **Create Admin modal**: First/last name, email, phone, role selector (with level + description preview), department, notes. Creates with status=pending, mfa=none.
- **Edit Admin modal**: Pre-filled form. Updates in-place with toast.
- **Detail modal**: Full admin profile with avatar, role/status/MFA badges, info grid (phone, last login, last IP, login count, created, failed attempts, locked until), notes, active sessions list (device, IP, location, time, current session indicator), action buttons (edit, reset password, suspend/activate, delete).
- **Delete confirmation modal**: Shows name, email, role, active session count. Irreversible.
- **Status toggle**: Suspend active admins or activate suspended ones. Direct from table or detail modal.
- **Password reset**: Mock toast notification.
- **Responsive**: Table → mobile cards at ≤960px. Filter grid collapses.
- **Skeleton loader**: 8 rows during 600ms.
- **Pagination**: 10 per page, prev/next, ←/→ keyboard.
- **Keyboard shortcuts**: `N` new, `F` search, `R` reset, `←/→` pagination, `Esc` close, `Ctrl+Q` modal.
- **Mock data** (`resources/js/mock/admin-admins.ts`, 72 lines): 12 admins with realistic scenarios (super admin pair, suspended for security review, pending MFA enrollment, locked after brute force, night shift security officer). 5 roles, 4 statuses, 8 departments. Sessions with devices/IPs/locations.
- **CSS** (`resources/css/pages/admin-admins.css`, 14 lines): Skeleton, kbd, table, row hover, KPI chips, mobile cards, filter grid, responsive.
- **Tests** (`resources/js/tests/AdminAdmins.test.ts`, 120 lines): 35 tests across 6 describe blocks — statusConfig (4, fields), roleConfig (5, fields, unique levels), departments (≥6, key depts), mockAdmins (≥10, unique IDs, unique emails, required fields, all 4 statuses, all 5 roles, ≥2 super_admins, majority active, sessions with fields, pending→no MFA, locked→failed attempts, suspended→notes, ≥5 departments, varied login counts, super_admins→all permissions), shortcuts (N/F/R/Esc/Ctrl+Q).
- Page: 328 lines (was 11 placeholder).

## 0.25.32 - 2026-03-27

### Implemented — Audit Log (/admin/audit)
- **30 mock audit entries** forming an immutable SHA-256 hash chain. Each entry: timestamp, user, role, action type, severity, module, target, description, IP address, user agent, session ID, integrity hash, previous hash, optional metadata.
- **20 action types**: login, logout, view, create, update, delete, export, import, config, alert, assign, revoke, search, ai_query, sync, deploy, failed_login, mfa_verify, session_kill, backup.
- **4 severity levels** with KPI chips: Info (12), Success (8), Warning (6), Critical (4). Click to filter.
- **20 modules**: auth, persons, organizations, vehicles, devices, map, operations, alerts, connections, face_recognition, lpr, scraper, ai_assistant, reports, storage, admin, config, data_sources, workflows, system.
- **7-column sortable table**: Timestamp, User (+ role), Action (icon + label), Severity (badge), Module (icon + label), Description (target + text), IP address (suspicious IPs highlighted red). Sortable by timestamp/user/action/severity/module.
- **Advanced filter panel** (6 filters): Action type dropdown (20 options), Module dropdown (20 options), User dropdown (9 users), IP address text input, Date From, Date To. Filter count badge. Clear all button.
- **Entry detail modal**: Full info grid (user, target, IP, user agent, session ID, timestamp), description, metadata table (key-value pairs for config changes, sync stats, AI tokens, etc.), cryptographic integrity verification block (SHA-256 hash + previous hash, green "Integrity Verified" badge).
- **Export buttons**: CSV and PDF (mock with toast notification).
- **Pagination**: 15 entries per page, page numbers, prev/next, ←/→ keyboard navigation.
- **Responsive**: Table → mobile cards at ≤900px. Filter grid 6→2→1 columns.
- **Skeleton loader**: 10 table row skeletons during 600ms.
- **Keyboard shortcuts**: `F` search, `R` reset, `←/→` pagination, `Esc` close, `Ctrl+Q` modal.
- **Mock data highlights**: 9 users (Col. Tomić, Maj. Novak, Cpt. Horvat, Sgt. Matić, Lt. Perić, IT Support, AI Team, Security Team, System). Events: admin login, AI queries, co-location alert, operation phase change, INTERPOL sync, report export, config changes, face recognition search, user creation, backup, LPR alerts, failed SSH intrusion, model deploy, session kill, access revocation.
- **Mock** (`resources/js/mock/admin-audit.ts`, 148 lines): 30 entries, 20 action types, 4 severities, 20 modules, 9 users, integrity hash chain.
- **CSS** (`resources/css/pages/admin-audit.css`, 14 lines): Skeleton, kbd, table wrap, row hover, filter grid, mobile cards, responsive.
- **Tests** (`resources/js/tests/AdminAudit.test.ts`, 110 lines): 27 tests across 7 describe blocks — actionConfig (20 types, fields, core actions), severityConfig (4, fields), moduleConfig (20, core modules), users (≥8, fields, System), mockAuditEntries (≥25, unique IDs, fields, all 4 severities, ≥8 action types, ≥6 modules, ≥5 users, ≥5 IPs, hash chain integrity, metadata ≥8, critical security events, automated system entries, descending timestamps, descriptions >30 chars), shortcuts (F/R/←/→/Esc/Ctrl+Q).
- Page: 251 lines (was 11 placeholder).

## 0.25.31 - 2026-03-27

### Implemented — Support Tickets (/admin/support)
- **Split-panel layout**: Left panel (420px) — ticket list with search, status filter KPI row, sortable list. Right panel — ticket detail with conversation thread and reply.
- **KPI status filters**: All (12), Open (3), In Progress (2), Waiting (2), Resolved (3), Closed (2). Click to filter. Counts update dynamically.
- **12 mock tickets** across 8 categories (bug, feature, access, hardware, network, training, data, security), 4 priorities (critical/high/medium/low), 5 statuses. Each ticket has full conversation thread with user/admin/system messages.
- **Ticket detail panel**: Ticket number, priority badge, category badge, status dropdown (change in-place), subject, reporter info (name, email, assignee, created date), tags, full conversation thread with color-coded messages (blue=user, green=admin, gray=system), reply textarea with Ctrl+Enter to send.
- **New Ticket modal**: Subject, Category (8 options with icons), Priority (4 levels), Description. Creates ticket with auto-generated TKT number, system message, and selects it.
- **Reply functionality**: Type reply, send adds admin message to thread, updates timestamp, shows toast confirmation.
- **Status changes**: Dropdown in detail header. Changes add system message to thread. Resolved/closed tickets auto-set resolvedAt.
- **Search**: Full-text across subject, ticket number, reporter, tags. `F` shortcut.
- **Responsive**: ≤900px panels stack vertically (list 50vh + detail 50vh). KPI row wraps.
- **Skeleton loader**: 8 ticket skeletons during 600ms.
- **Keyboard shortcuts**: `N` new ticket, `F` search, `R` reset, `Esc` close, `Ctrl+Q` shortcuts modal.
- **Sidebar badge**: 3 open tickets matches mock data count.
- **Mock data** (`resources/js/mock/admin-support.ts`, 112 lines): 12 tickets with 35 messages total. Realistic scenarios: GPU crash, camera offline, feature request, onboarding, Kafka lag, graph performance, i18n request, model regression, training session, LPR diacritics, print dark mode, SSH intrusion. 5 statuses, 8 categories, 4 priorities, 8 assignees. Full TypeScript types.
- **CSS** (`resources/css/pages/admin-support.css`, 19 lines): Split panel, scroll, KPI row, ticket hover, message type borders, responsive.
- **Tests** (`resources/js/tests/AdminSupport.test.ts`, 117 lines): 30 tests across 7 describe blocks — statusConfig (5, fields), priorityConfig (4, fields), categoryConfig (8, fields), assignees (≥5, Unassigned), mockTickets (≥10, unique IDs/numbers, fields, all 5 statuses, ≥3 priorities, ≥5 categories, resolved→resolvedAt, message types, conversation threads ≥3 msgs, all 3 message types, critical tickets, open count=3), shortcuts (N/F/Esc/Ctrl+Q).
- Page: 234 lines (was 11 placeholder).

## 0.25.30 - 2026-03-27

### Implemented — Knowledge Base (/admin/kb)
- **7 categories** with color-coded cards: Getting Started, Map & Tracking, Intelligence, Devices & Cameras, Administration, Security & Compliance, Troubleshooting. Each shows article count and description.
- **19 articles** across all categories. Each article has: title, summary, full content (multi-paragraph), author, updated date, view count, helpful percentage, read time, tags, related article links.
- **Search**: Full-text search across title, summary, content, and tags. Keyboard shortcut `F` to focus. Clear button.
- **Category filter**: Click a category card to filter. Active category header with icon, name, description, and filtered count. Clear button to reset.
- **Article detail view**: Full article content, category badge, read time, article info sidebar (author, date, views, helpful %), helpful voting buttons (Yes/No with progress bar), related articles list. Back button.
- **Responsive**: Category grid 4→2→1 columns. Article grid auto-fill (320px min). Article detail 2-col→1-col on ≤1024px.
- **Skeleton loader**: 7 category skeletons + 6 article skeletons during 600ms.
- **Keyboard shortcuts**: `F` search, `Esc` back/close, `Ctrl+Q` shortcuts modal.
- **Read-only**: No add, edit, or delete functionality (as requested).
- **Mock data** (`resources/js/mock/admin-kb.ts`, 100 lines): 7 categories, 19 articles with full content covering all platform features. Articles per category: Getting Started (4), Map & Tracking (4), Intelligence (3), Devices (2), Admin (2), Security (2), Troubleshooting (2).
- **CSS** (`resources/css/pages/admin-kb.css`, 10 lines): Skeleton, kbd, category grid, article grid, detail layout, responsive.
- **Tests** (`resources/js/tests/AdminKB.test.ts`, 69 lines): 17 tests across 3 describe blocks — categories (7, unique IDs, fields, expected IDs), articles (≥15, unique IDs, fields, valid category refs, all categories covered, content >100 chars, valid related refs, helpful >70%, varied views, multi-tag), shortcuts (F/Esc/Ctrl+Q).
- Page: 190 lines (was 11 placeholder).

## 0.25.29 - 2026-03-27

### Implemented — Admin Dashboard (/admin/dashboard)
- **8 KPI cards** with sparkline charts: Total Users (147), Active Sessions (34), System Uptime (99.97%), Storage Used (2.4/8 TB), Kafka Queue (1,247), Tracked Entities (12,847), Active Alerts (23), AI Queue (8). Each card shows trend (up/down/stable), trend value, and 8-point SVG sparkline.
- **12 service health monitors**: PostgreSQL+PostGIS, Redis Cluster, Apache Kafka, ClickHouse, Typesense, MinIO, Ollama (LLaMA 3.1), InsightFace, Faster-Whisper (degraded), Keycloak SSO, Nginx, Camera Network (degraded). Each shows status dot, latency, uptime, CPU%, MEM%.
- **8 quick actions**: Clear Cache, Restart Workers, Force Sync, System Report, Backup Now, Rebuild Index, Purge Logs (dangerous), Kill Sessions (dangerous). Dangerous actions require confirm modal.
- **10 recent activity events**: login, alert, sync, deploy, user registration, config change, backup, error, failed login, sanctions update. Each with icon, title, description, user, time.
- **Storage breakdown**: 7 categories (Video 1.2TB, Camera 480GB, Audio 220GB, Documents 180GB, Photos 160GB, Backups 120GB, AI Models 45GB) with stacked bar chart. 30.2% of 8TB used.
- **Responsive**: KPI grid 4→2→1 columns. Body 2-col→1-col. Actions grid 4→2→2 columns. Services grid responsive.
- **Skeleton loader**: 8 KPI skeletons, 6 service skeletons, 4 action skeletons, 6 activity skeletons, storage skeleton. 700ms.
- **Keyboard shortcuts**: `R` refresh, `Esc` close, `Ctrl+Q` shortcuts modal.
- **Mock data** (`resources/js/mock/admin-dashboard.ts`, 93 lines): kpiCards (8), services (12), quickActions (8), recentEvents (10), storageBreakdown (7), statusColors, keyboardShortcuts (3). Full TypeScript interfaces.
- **CSS** (`resources/css/pages/admin-dashboard.css`, 10 lines): KPI grid, body grid, services grid, actions grid, responsive breakpoints.
- **Tests** (`resources/js/tests/AdminDashboard.test.ts`, 109 lines): 30 tests across 7 describe blocks — kpiCards (8, unique IDs, fields, key KPIs), services (≥10, IDs, fields, mostly healthy, some degraded, key infra), quickActions (≥6, IDs, fields, dangerous with confirmText, includes cache/restart/sync), recentEvents (≥8, IDs, fields, ≥5 types), storageBreakdown (≥5, fields, total <8TB, sorted by size), statusColors (4), shortcuts (R/Esc/Ctrl+Q).
- Page: 196 lines.

## 0.25.28 - 2026-03-27

### Added — Admin Panel Layout & Pages
- **AdminLayout** (`resources/js/layouts/AdminLayout.tsx`): Mirrors AppLayout with red admin accent (`#ef4444`). Uses AdminSidebar, shared AppHeader, Breadcrumbs. CSS variables overridden for admin accent color. TopLoader uses red accent.
- **AdminSidebar** (`resources/js/components/layout/AdminSidebar.tsx`): Full sidebar matching user Sidebar design. Red accent for active items. ADMIN badge next to logo. Collapsible (desktop), slide-in (mobile). "Back to Platform" link at bottom. 4 sections with 9 menu items:
  - **Administration**: Dashboard, Admins, Users, Roles
  - **Analytics**: Statistics, Audit Log
  - **Configuration**: Config
  - **Support**: Support Tickets (badge: 3), Knowledge Base
- **9 Admin placeholder pages** — all empty with icon, title, description, and "under development" placeholder:
  - `/admin/dashboard` → `Admin/Dashboard.tsx` — 📊 Admin Dashboard
  - `/admin/admins` → `Admin/Admins.tsx` — 🛡️ Admin Management
  - `/admin/users` → `Admin/Users.tsx` — 👥 User Management
  - `/admin/roles` → `Admin/Roles.tsx` — 🔑 Role Management
  - `/admin/statistics` → `Admin/Statistics.tsx` — 📈 Statistics
  - `/admin/audit` → `Admin/Audit.tsx` — 📋 Audit Log
  - `/admin/config` → `Admin/Config.tsx` — ⚙️ Configuration
  - `/admin/support` → `Admin/Support.tsx` — 🎫 Support Tickets
  - `/admin/kb` → `Admin/KnowledgeBase.tsx` — 📚 Knowledge Base
- **Routes**: 9 GET routes added under `/admin/*`.
- **Breadcrumbs**: Added admin labels (admin, dashboard, admins, users, roles, statistics, audit, config, support, kb).

## 0.25.27 - 2026-03-27

### Added — Admin Login (/admin/login)
- New admin login page matching user login visual style with red admin accent.
- Red admin badge ("Admin Authentication"), red checkbox, red "Forgot password" link, red submit button.
- Posts to `/admin/login`, validates email+password, redirects to `/admin/2fa`.
- Mock: always succeeds, 800ms delay, stores `pending_admin_2fa` session.
- "Back to operator login" link to `/login`.
- Classification footer: "ADMIN PANEL — RESTRICTED ACCESS".
- Full i18n (en/hr) under `admin_login.*` namespace.

### Added — Admin 2FA (/admin/2fa)
- New admin 2FA page matching user TwoFactor visual style with red admin accent.
- Red admin badge ("Admin 2FA Verification"), red verify button, red resend link.
- 3 methods: Auth App, SMS, Email — same MethodSelector + OtpInput components as user 2FA.
- Posts to `/admin/2fa`, validates 6-digit code. Code `000000` fails, anything else succeeds → redirects to `/admin/dashboard`.
- Resend code via `/admin/2fa/resend` with 30s cooldown.
- "Back to admin login" link.
- Classification footer: "ADMIN PANEL — RESTRICTED ACCESS".
- Full i18n (en/hr) under `admin_2fa.*` namespace.

### Routes added
- `GET /admin/login` → `Admin/Login` (admin.login)
- `POST /admin/login` → validate + redirect to admin.2fa (admin.login.authenticate)
- `GET /admin/2fa` → `Admin/TwoFactor` (admin.2fa)
- `POST /admin/2fa` → validate 2FA code (admin.2fa.verify)
- `POST /admin/2fa/resend` → resend code (admin.2fa.resend)

### Translations added
- `en/auth.json`: `admin_login.*` (11 keys), `admin_2fa.*` (14 keys)
- `hr/auth.json`: `admin_login.*` (11 keys), `admin_2fa.*` (14 keys)

## 0.25.26 - 2026-03-27

### Added — Records / AI Processing (/records)
- **New page**: Full AI processing center showing all media files processed by on-premise AI models.
- **5 AI process types**: Video Transcription (Faster-Whisper), Audio Transcription (Faster-Whisper), Translation (NLLB-200), File Summary (LLaMA 3.1), Photo OCR (LLaVA Vision). Plus manual Document and Evidence types.
- **Responsive table**: 7-column sortable grid (icon, title+source, type, status, priority, entity, date). Sorts by title/type/status/priority/date. Mobile view (≤768px): sidebar hidden, mobile bar with tab/type/search selectors.
- **3-panel layout**: Left sidebar (tabs, type filter, priority filter), center table, right detail panel.
- **Detail panel** (340px): Type badge, status/priority/operation/confidence badges, progress bar for processing items, source info (file, size, duration, AI model, languages, word count, timestamps), linked entity, description, full result with preview quote, tags, download/entity actions.
- **Tabs**: All (15), Processing (2), Completed (10), Failed (1) — with counts.
- **Skeleton loader**: 10 skeleton rows during 700ms.
- **Keyboard shortcuts**: `1` all, `2` processing, `3` completed, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.
- **Breadcrumbs**: Added `'records': 'Records — AI Processing'`.
- **CSS import**: Added `@import './pages/records.css'` to app.css.
- **Mock data** (`resources/js/mock/records.ts`, 143 lines): 15 records across 7 types, 5 statuses (completed/processing/queued/failed/draft), 4 priorities, 5 AI models. Linked to persons (Horvat, Mendoza, Hassan, Babić, Al-Rashid) and orgs (Rashid Holdings, Dragon Tech). Operations: HAWK, GLACIER, PHOENIX, CERBERUS. Includes confidence scores, word counts, processing times, result previews, language pairs.
- **CSS** (`resources/css/pages/records.css`, 20 lines): Already existed — skeleton, kbd, 3-panel layout, responsive.
- **Tests** (`resources/js/tests/Records.test.ts`, 130 lines): 38 tests across 8 describe blocks — typeConfig (7 types, 5 AI types, icon/color/label/aiModel, correct AI models), statusConfig (5 statuses, color+label), priorityConfig (4 priorities, colors), languages (≥10, includes auto/en/hr/ar), entityOptions (≥15, persons+orgs), mockRecords (≥12, unique IDs, required fields, all 5 AI types, ≥4 statuses, ≥3 priorities, completed→results, processing→progress, confidence scores ≥5, entity links ≥8, operation codes, translation languages, audio/video durations, failed→error info), keyboardShortcuts (≥6, 1/2/3/F/R/Esc/Ctrl+Q).
- Page: 263 lines.

## 0.25.25 - 2026-03-26

### Updated — Organizations (/organizations)
- **Responsive mobile**: Already had mobile card view. Replaced `persons-table-wrap`/`persons-mobile-cards` classes with `orgs-table-wrap`/`orgs-mobile-cards`. Desktop table hidden ≤860px, mobile cards shown.
- **Keyboard shortcuts**: `N` add org, `F` toggle filters, `S` focus search, `R` reset all, `←/→` pagination, `Esc` close modal/menu, `Ctrl+Q` shortcuts modal.
- **Mock data**: Added `orgsKeyboardShortcuts` (8 items) to existing `resources/js/mock/organizations.ts` (now 51 lines).
- **CSS** (`resources/css/pages/organizations.css`, 12 lines): New file with orgs-kbd, orgs-table-wrap, orgs-table-row, orgs-mobile-cards/card, ≤860px media query. Added `@import` in app.css.
- **Tests** (`resources/js/tests/Organizations.test.ts`, 109 lines): 26 tests across 6 describe blocks — risks (5 levels, colors), industries (≥30, key industries, includes Other), countries (≥100), mockOrganizations (≥10, unique IDs/UUIDs, required fields, ≥3 risk levels, ≥5 countries, ≥5 industries, CEOs, VATs, websites, linked persons, key orgs Alpha Security + Rashid, valid URLs), getOrgById (found/not found), keyboardShortcuts (≥6, N/F/S/R/Esc/Ctrl+Q).

## 0.25.24 - 2026-03-26

### Updated — Persons (/persons)
- **Responsive mobile**: Already had mobile card view (≤860px). Moved inline `<style>` media query to `persons.css` for clean separation. Desktop table hidden, mobile cards shown on small screens.
- **Keyboard shortcuts**: `N` add person, `F` toggle filters, `S` focus search, `R` reset all, `←/→` pagination, `Esc` close modal/menu, `Ctrl+Q` shortcuts modal.
- **Mock data**: Added `personsKeyboardShortcuts` (8 items) to existing `resources/js/mock/persons.ts` (now 78 lines).
- **CSS**: Added desktop/mobile toggle media query to `resources/css/pages/persons.css` (now 325 lines), replacing inline `<style>` tag.
- **Tests** (`resources/js/tests/Persons.test.ts`, 120 lines): 32 tests across 9 describe blocks — risks (5 levels, colors), statuses (5, colors), genders (3), nationalities (≥100, includes key nations, sorted), countries (≥100), allLanguages (≥50), religions (≥20), mockPersons (≥20, unique IDs/UUIDs, required fields, ≥4 risk levels, ≥3 statuses, ≥10 nationalities, male+female, Critical risk, key subjects Horvat+Mendoza, avatars, valid emails), keyboardShortcuts (≥6, N/F/S/R/Esc/Ctrl+Q).
- Page: 275 lines (was 243, +32 from keyboard handler and shortcuts modal).

## 0.25.23 - 2026-03-26

### Updated — Vision Camera Wall (/vision)
- **Responsive mobile**: Sidebar + right panel hidden ≤768px. Mobile bar (grid selector + group selector + AI toggle).
- **Breadcrumbs fixed**: Added `'vision': 'Vision — Camera Wall'`.
- **Footer removed**: Removed "CLASSIFIED // NOFORN" from sidebar footer.
- **Larger fonts**: All fontSize:5 → 7, fontSize:6 → 8, fontSize:7 → 9 (42 occurrences). Camera HUD labels, sidebar section headers, status chips, search input, camera group/overlay/panel labels all bumped.
- **Skeleton loader**: Grid of skeleton tiles matching current layout (cols × cols) with 16:9 aspect ratio during 800ms.
- **Keyboard shortcuts**: `1/2/3/4` grid layouts, `B` sidebar, `A` AI detections, `I` camera info, `N` night vision, `Esc` exit fullscreen/close, `Ctrl+Q` shortcuts modal.
- **Mock data** (`resources/js/mock/vision.ts`, 69 lines): VIDEO_SRC, allCams (filtered from devices), PTZ_IDS, 6 camGroups, 5 defaultPresets, 8 mockFaces, 6 tlSegs, 2 defaultMotionZones, 10 keyboardShortcuts. 8 interfaces + 2 types exported.
- **CSS** (`resources/css/pages/vision.css`, 18 lines): Rewritten — skeleton, kbd, vis-page/left/center/right layout classes, mobile bar, responsive breakpoints.
- **Tests** (`resources/js/tests/Vision.test.ts`): 30 tests across 9 describe blocks — VIDEO_SRC, allCams (≥8, camera types, IDs, names, online/offline), PTZ_IDS (≥2, valid refs), camGroups (≥5, "all" first, required fields, includes zagreb/hawk/ptz/covert, valid camera refs), defaultPresets (≥4, IDs, name/layout/group valid), mockFaces (≥6, IDs, fields, valid cam refs, known+unknown), tlSegs (≥4, s/e/c, 0-100 span), defaultMotionZones (≥2, include+exclude, valid dims), keyboardShortcuts (≥8, includes grid/sidebar/AI/NV/Esc/Ctrl+Q).

## 0.25.22 - 2026-03-26

### Updated — Tactical Map (/map)
- **Mock data extracted** to `resources/js/mock/map.ts` (160 lines). Moved from `pages/Map/mockData.ts` (kept as re-export shim). Contains: 6 interfaces (AnomalyEvent, PredRiskEntry, PatternEntry, IncidentEvent, CompareMetric, RoutePoint), anomalyTypes (7), patternCategories (6), incidentTypes (10), heatCalPersonInfo (4), MOCK_ANOMALIES (9), MOCK_PREDICTIONS (4), MOCK_PATTERNS (8), MOCK_INCIDENTS (15), MOCK_ROUTES (2 traces), cityCoords (24 cities), keyboardShortcuts (10).
- **CSS**: Already existed at `resources/css/pages/map.css` (226 lines, imported).
- **Larger fonts**: Bumped all fontSize:6 → 8 and fontSize:7 → 9 across entire 6275-line page (156 occurrences total). Bumped sidebar icon SVGs from 11×11 → 13×13 (36 occurrences). All sidebar labels, filter chips, stat values, panel headers, timeline entries, anomaly cards, pattern details, prediction factors, incident metadata now more readable.
- **Tests** (`resources/js/tests/Map.test.ts`, 130 lines): 42 tests across 10 describe blocks:
  - `anomalyTypes` — 7 types, "all" first, colors on non-all
  - `patternCategories` — 6 categories, includes meeting/schedule/location/communication/movement
  - `incidentTypes` — 10 types, all with id/icon/label/color, covers all 10 expected types
  - `heatCalPersonInfo` — 4 persons, key subjects 1/7/9/12
  - `MOCK_ANOMALIES` — ≥8, unique IDs, required fields (type/severity/confidence/coords/recommendation), ≥5 anomaly types, ≥3 persons
  - `MOCK_PREDICTIONS` — ≥4, unique IDs, required fields (risk/factors/nextLocations/threatAssessment/recommendedActions), factor weights+trends, location coordinates+probability
  - `MOCK_PATTERNS` — ≥7, unique IDs, required fields (category/frequency/occurrences/heatmap[7]/details/assessment), ≥4 categories, non-negative heatmap values
  - `MOCK_INCIDENTS` — ≥12, unique IDs, required fields (type/severity/coords/source/metadata), ≥7 incident types, critical ≥3 + high ≥3
  - `MOCK_ROUTES` — ≥2 traces, ≥5 points per route, ≥5 events total, Horvat route ≥15 points
  - `cityCoords` — ≥20 cities, Zagreb coordinates, [lng,lat] tuples, Croatian + foreign cities
  - `keyboardShortcuts` — ≥8, includes S/L/T/M/Esc/Ctrl+Q

## 0.25.21 - 2026-03-26

### Updated — Storage Browser (/storage)
- **Responsive mobile**: Sidebar (folder tree) + detail hidden ≤768px. Mobile bar (search + upload). Column headers hidden. File rows flex-wrap.
- **Breadcrumbs fixed**: Added `'storage': 'Storage Browser'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px tree nodes, 10px file type filters, 12px upload button. Breadcrumb path 11px. Column headers 10px. File names 11px, folder 9px, entity links 10px, type 9px, tags 8px, size 10px. Detail panel name 12px, type 9px, info rows 10px, tags 9px, transcript 11px, actions 11px.
- **Skeleton loader**: 10 skeleton file rows (icon + name + entity + size) during 700ms.
- **Mock data** (`resources/js/mock/storage.ts`, 80 lines): 22 files across 7 persons + 4 orgs. 10 file types with config. buildTree() function. 9 default subfolders per entity. keyboardShortcuts (5).
- **CSS** (`resources/css/pages/storage.css`, 22 lines): Skeleton, kbd, 3-panel, file grid responsive, mobile bar.
- **Tests** (`resources/js/tests/Storage.test.ts`): 26 tests across 4 describe blocks — typeConfig (10 types, icon/color/label, core types), mockFiles (≥20, unique IDs, required fields, ≥6 types, person+org files, transcriptions, duration, pages, resolution, ≥4 entities, size consistency), buildTree (2 roots, person/org children, 9 subfolders, subfolder names), shortcuts.
- **Keyboard shortcuts**: `U` upload, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.20 - 2026-03-26

### Updated — Connections (/connections)
- **Responsive mobile**: Toolbar hidden ≤768px. Mobile bar (Types + New + Reset buttons). Info panel becomes bottom sheet (50vh). Types panel becomes bottom sheet (60vh). Legend hidden. Canvas remains full-width interactive.
- **Breadcrumbs**: Already existed.
- **Connection Types panel**: New slide-in panel (left side, 260px) showing all 7 categories with their types, edge counts per type, and summary stats. Toggle via toolbar button or `T` key.
- **Skeleton loader**: 5 node placeholders + text during 700ms loading.
- **New Connection modal**: Entity A and B selectors (all persons + organizations with 🧑/🏢 icons), connection type (55+ types), relationship (Good/Bad/Neutral/Unknown), strength (1-5 dot selector), notes textarea. Create disabled without both entities.
- **Keyboard shortcuts**: `N` new connection, `T` toggle types panel, `F` focus search, `R` reset all, `Esc` close, `Ctrl+Q` shortcuts modal.
- **Canvas improvements**: Node initials 11-12px (was 10-11), edge labels 9px (was 8), node labels 10-11px (was 9-10), relationship labels 8px (was 7). Right-click node navigates directly to profile.
- **CSS** (`resources/css/pages/connections.css`): Fully rewritten (36 lines, was 226). Skeleton, kbd, types panel, responsive bottom sheets, mobile bar.
- **Tests** (`resources/js/tests/Connections.test.ts`): 30 tests across 8 describe blocks — connectionTypes (≥50, core types), connectionCategories (7 cats, types+colors, all types mapped), getConnectionColor/Category (known types, fallbacks), relationships (4, colors), nodes (≥15, unique IDs, fields, person+org counts), edges (≥25, unique IDs, valid node refs, valid types, valid relationships, strength 1-5, ≥4 categories), shortcuts.
- **Mock data**: Added `keyboardShortcuts` to existing mock (now 147 lines).
- Page reduced from 449 → 276 lines (39% smaller).

## 0.25.19 - 2026-03-26

### Updated — Operations (/operations)
- **Responsive mobile**: Sidebar hidden ≤768px. Mobile bar (operation selector + New). Tab labels hidden (icons only). Risk gauge hidden. Grids single-column. Header extras hidden.
- **Breadcrumbs fixed**: Added `'operations': 'Operations'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search/codename, 10px phase/priority/description, 9px stats. Header 17px codename, 12px subtitle, 10px meta. Stats 20px numbers. Tabs 11px+13px icons. Overview 12px description, 12px checklist, 11px threat. Targets 12px names, 10px details. Resources 11px device/vehicle names. Teams 12px names, 10px members. Zones 12px names, 10px details. Alerts 11px type, 10px description. Timeline 12px labels, 10px dates. Briefing 12px notes+comms.
- **Skeleton loader**: 4 sidebar skeleton items, content area skeleton (4 stat blocks + description + checklist), 700ms.
- **New Operation modal**: Codename (monospace, uppercase, red, required), name (required), description textarea, phase (5 phases as icon grid), priority (4 levels), classification (5 levels: SECRET through CONFIDENTIAL), commander. Create disabled without codename + name.
- **Mock data** (`resources/js/mock/operations.ts`, 142 lines): 5 operations (HAWK Active/Critical, GLACIER Planning/High, PHOENIX Preparation/Medium, CERBERUS Debrief/High, SHADOW Closed/Critical). HAWK has 6 teams, 4 zones, 5 alert rules, 6 timeline events, 7 checklist items. phaseColors/Icons, prioColors, allPhases, tabList (8), keyboardShortcuts (5).
- **CSS** (`resources/css/pages/operations.css`, 23 lines): Skeleton, kbd, 2-panel, grid responsive, mobile bar.
- **Tests** (`resources/js/tests/Operations.test.ts`): 28 tests across 5 describe blocks — phases, priorities, tabList (8), mockOps (IDs/codenames/fields/phases/active/teams/zones/alerts/timeline/checklists/team structure/zone coords/HAWK complexity), shortcuts.
- **Keyboard shortcuts**: `N` new, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.18 - 2026-03-26

### Updated — Workflows (/workflows)
- **Responsive mobile**: Detail panel hidden ≤768px. Mobile bar (search + New). Kanban columns stack vertically. List table head hidden ≤1024px, rows flex-wrap. Template grid single-column. View labels hidden. Header stats hidden.
- **Breadcrumbs fixed**: Added `'workflows': 'Workflows'`.
- **Footer removed**.
- **Larger fonts**: Title 16px, search 12px, status badges 10px. Kanban column headers 12px, card names 12px, triggers/actions 8-9px, stats 9px. List names 12px, meta 9-10px. Template names 13px, descriptions 11px, triggers/actions 9px. Detail panel name 13px, description 10px, stats 15px, triggers 11px, actions 11px, subjects 10px, meta 10px, exec log 10px.
- **Skeleton loader**: Kanban skeleton (5 columns × 2 cards), List skeleton (6 rows), Templates skeleton (4 cards), all 700ms.
- **New Workflow modal**: Name (required), description textarea, priority (4 levels), status (5 columns), operation selector, trigger type (10 types as 5×2 icon grid), action type (8 types as 4×2 icon grid). Create disabled without name.
- **Mock data** (`resources/js/mock/workflows.ts`, 122 lines): 9 workflows (4 Active, 1 Draft, 1 Paused, 1 Completed, 1 Archived) across 3 operations. 6 templates across 5 categories. statusColors/Icons, prioColors, triggerIcons (10), actionIcons (8), kanbanCols (5), allTriggerTypes (10), allActionTypes (8), keyboardShortcuts (8).
- **CSS** (`resources/css/pages/workflows.css`, 26 lines): Skeleton, kbd, kanban/list/template layouts, responsive breakpoints.
- **Tests** (`resources/js/tests/Workflows.test.ts`): 32 tests across 9 describe blocks — statuses, priorities, triggerIcons/allTriggerTypes, actionIcons/allActionTypes, kanbanCols, mockWorkflows (IDs/fields/statuses/operations/active/exec logs/trigger types/action types), templates (IDs/fields/categories), shortcuts.
- **Keyboard shortcuts**: `1` Kanban, `2` List, `3` Templates, `N` new workflow, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.17 - 2026-03-26

### Updated — Surveillance Apps (/surveillance-apps)
- **Responsive mobile**: Sidebar hidden ≤768px. Mobile bar (search + agent selector dropdown). Header IMEI/phone hidden. Stats bar wraps. Tab labels hidden (icons only). Remote grid single-column. Screenshot grid single-column.
- **Breadcrumbs fixed**: Added `'surveillance-apps': 'Surveillance Apps'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px status/platform filters, 16px stats, 12px app names, 9px device info. Header 15px name, 10px device. Stats 15px numbers. Tabs 11px. SMS 12px body, 11px numbers, 10px flags. Calls 12px name, 10px number, 11px duration. Contacts 12px name, 10px phone. Calendar 13px title, 11px details. Notifications 11px. Network 11px. Location 13px/12px. Remote 14px heading, 12px labels, 10px desc.
- **Skeleton loader**: 5 sidebar skeleton items (avatar + text). Empty state skeleton (circle + text).
- **Mock data** (`resources/js/mock/surveillanceApps.ts`, 186 lines): 6 deployed apps (Horvat Full Monitor Active, Mendoza Stealth Suite, Hassan Comms Intercept Active, Babić GPS Tracker Active, Al-Rashid Full Monitor Offline, Petrova Comms Intercept Paused). SMS with CRITICAL flags, calls with recordings, contacts, calendar, notifications, screenshots, photos, network info. 10 remote commands. statusColors/Icons, typeIcons, tabConfig (10 tabs), keyboardShortcuts (10).
- **CSS** (`resources/css/pages/surveillance-apps.css`, 24 lines): Skeleton, kbd, 2-panel, remote grid, screenshot grid, responsive breakpoints, mobile bar.
- **Tests** (`resources/js/tests/SurveillanceApps.test.ts`): 30 tests across 7 describe blocks — statuses, typeIcons, tabConfig (10 tabs), remoteCommands (10), mockApps (IDs/fields/status/platforms/SMS data/calls/contacts/flagged SMS/recorded calls/networkInfo/stats/GPS tracker empty comms), shortcuts.
- **Keyboard shortcuts**: `1` SMS, `2` Calls, `3` Contacts, `4` Calendar, `5` Network, `0` Remote, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.16 - 2026-03-26

### Updated — Plate Recognition (/plate-recognition)
- **Responsive mobile**: Sidebar + detail hidden ≤768px. Mobile bar (search + status select). Table head hidden ≤1024px, rows flex-wrap. Reader/watchlist grids single-column. Tab labels hidden.
- **Breadcrumbs fixed**: Added `'plate-recognition': 'Plate Recognition'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px status/filters, 16px stats. Tabs 13px. Plate numbers 13px, reader names 11px, vehicle/person 10px, status 10px, confidence 9px, speed 10px. Watchlist plates 17px, details 11px. Reader names 13px, details 10px. Detail panel plate 18px/22px, vehicle/owner 10-12px, capture details 10px.
- **Skeleton loader**: 10 skeleton rows (plate + reader + vehicle + status) during 700ms.
- **Mock data** (`resources/js/mock/plateRecognition.ts`, 59 lines): 10 readers, 15 scans (trimmed from 24), statusColors/Icons, allReaders, allPersons, allOrgs, allPlates, keyboardShortcuts (7).
- **CSS** (`resources/css/pages/plate-recognition.css`, 15 lines): Skeleton, kbd, 3-panel, table grid responsive, reader/watchlist grids, mobile bar.
- **Tests** (`resources/js/tests/PlateRecognition.test.ts`): 28 tests across 5 describe blocks — statuses, readers (IDs/fields/online/offline), mockScans (IDs/fields/watchlist/unknown/partial/speed/readerIds/plates), derived lists, shortcuts.
- **Keyboard shortcuts**: `1` Scans, `2` Watchlist, `3` Readers, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.15 - 2026-03-26

### Updated — Data Sources (/data-sources)
- **Responsive mobile**: Sidebar + detail hidden ≤768px. Mobile bar (search + category select + New).
- **Breadcrumbs fixed**: Added `'data-sources': 'Data Sources'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 11-12px category/status filters, 16px stats. Source header 13px country, source name 13px, provider 10px, status 10px, protocol 9px, category badge 9px. Detail panel 13px name, 10px provider/tags, 16px health/error/records, 11px connection details/sync log, notes 11px. Modal 18px heading, 12-13px labels/inputs.
- **Skeleton loader**: 10 skeleton rows (health ring + text + tags + status) during 700ms.
- **New Data Source modal**: Full form with source name, provider, category (6 types as icon grid), protocol (9 options), schedule (8 intervals), endpoint URL, authentication (10 auth methods), country. Create disabled without name + endpoint.
- **Mock data** (`resources/js/mock/dataSources.ts`, 60 lines): 19 sources across 6 categories (Government ×5, Law Enforcement ×3, Financial ×2, OSINT ×2, Technical ×3, Commercial ×4), statusColors/Icons, catColors/Icons, allCategories, allProtocols (9), allCountries, keyboardShortcuts (6).
- **CSS** (`resources/css/pages/data-sources.css`, 20 lines): Skeleton, kbd, 3-panel, responsive.
- **Tests** (`resources/js/tests/DataSources.test.ts`): 26 tests across 6 describe blocks — statuses, categories, protocols, mockDS (IDs/fields/categories/status/countries/syncLog/tags/protocols), allCountries sorted, shortcuts.
- **Keyboard shortcuts**: `N` new source, `F` search, `R` reset, `S` sync all, `Esc` close, `Ctrl+Q` modal.

## 0.25.14 - 2026-03-26

### Updated — Social Scraper (/scraper)
- **Responsive mobile**: Sidebar + detail hidden ≤768px. Mobile bar (search + New). Tab labels hidden. Scraper grid single-column.
- **Breadcrumbs fixed**: Added `'scraper': 'Social Scraper'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px platform list, 16px stats. Tabs 13px. Post names 12px, content 12px, engagement 9px, badges 9px. Scraper cards 13px handle, 11px details, 10px links. Detail panel 12px name/content, 11px AI assessment, 14px engagement, 10px meta. Modal 18px heading, 12-13px labels/inputs.
- **Skeleton loader**: 8 skeleton post rows (icon + header + content + badges) during 700ms.
- **New Social Scraper modal**: Platform selector (10 platforms as 5×2 icon grid), profile URL, handle, interval (6 options), keywords. **Target Entity section**: toggle Person/Organization, select from mockPersons/mockOrganizations, auto-tag description. Operation selector. Create disabled without URL.
- **Mock data** (`resources/js/mock/scraper.ts`, 68 lines): 12 scrapers (trimmed from 18), 12 posts (trimmed from 17), platformConfig (10), statusColors (4), sentimentColors (4), contentIcons (8), allPlatforms, allPersonsInScrapers, allOrgsInScrapers, keyboardShortcuts (8).
- **CSS** (`resources/css/pages/scraper.css`, 22 lines): Skeleton, kbd, 3-panel, scraper grid responsive, mobile bar.
- **Tests** (`resources/js/tests/Scraper.test.ts`): 30 tests across 8 describe blocks — platformConfig (10 platforms), statusColors, sentimentColors, contentIcons, mockScrapers (IDs/fields/active/platforms/entity links), mockPosts (IDs/fields/AI-flagged/scraperIds cross-ref/media/platforms), derived lists, shortcuts.
- **Keyboard shortcuts**: `1` Feed, `2` AI Flagged, `3` Scrapers, `N` new scraper, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.13 - 2026-03-26

### Updated — Web Scraper (/web-scraper)
- **Responsive mobile**: Sidebar + detail hidden ≤768px. Mobile bar (search + New button). Tab labels hidden. Source grid single-column.
- **Breadcrumbs fixed**: Added `'web-scraper': 'Web Scraper'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 11-12px filters, 16px stats. Tabs 13px. Article titles 13px, excerpts 11px, badges 9px, entity links 9px. Source cards 13px name, 11px details, 10px URL. Detail panel 13px title, 12px excerpt, 11px AI assessment, 10px metadata.
- **Skeleton loader**: 8 skeleton article rows (icon + badge + title + excerpt + tags) during 700ms.
- **New Web Scraper modal**: Full form with source name, URL, category (8 types), schedule (9 intervals), CSS selector, URL pattern, keywords. **Target Entity section**: toggle Person/Organization, select from mockPersons/mockOrganizations, auto-tag description. Create button disabled without name+URL.
- **Mock data** (`resources/js/mock/webScraper.ts`, 87 lines): 15 sources (trimmed from 16), 12 articles (trimmed from 15/20), catConfig (8), statusCol (4), relColors (4), contentIcons (8), allCategories, allCountries, allOps, keyboardShortcuts (8).
- **CSS** (`resources/css/pages/web-scraper.css`, 22 lines): Skeleton, kbd, 3-panel, source grid responsive, mobile bar.
- **Tests** (`resources/js/tests/WebScraper.test.ts`): 32 tests across 8 describe blocks — catConfig, statusCol, relColors, contentIcons, mockSources (IDs/fields/status/categories/countries), mockArticles (IDs/fields/critical/AI-flagged/entities/sourceId cross-ref/content types), derived lists, shortcuts.
- **Keyboard shortcuts**: `1` Articles, `2` Critical Intel, `3` Sources, `N` new scraper, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.12 - 2026-03-26

### Updated — Face Recognition (/face-recognition)
- **Responsive mobile**: Sidebar + detail panel hidden ≤768px. Mobile bar (search + status select). Capture grid adapts (minmax 150px). Tab labels hidden (icons + kbd). Stat grid single-column.
- **Breadcrumbs fixed**: Added `'face-recognition': 'Face Recognition'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px status/filters, 16px stats. Tabs 13px. Capture cards: 13px name, 10-11px location/badges/confidence. Face search: 18px heading, 12-14px labels, 13px inputs/buttons. Statistics: 14px headings, 13px person names, 18px camera counts. Detail panel: 13px name, 10px fields, 16px confidence gauge.
- **Skeleton loader**: 8 skeleton capture cards (image area + text) during 700ms.
- **Mock data** (`resources/js/mock/faceRecognition.ts`, 67 lines): 15 captures (10 confirmed, 3 possible, 1 no-match, 2 pending), 9 cameras, statusColors/Icons, allCameras, allMatchedPersons, allOps, keyboardShortcuts (7).
- **CSS** (`resources/css/pages/face-recognition.css`, 22 lines): Skeleton, kbd, 3-panel layout, capture grid responsive, mobile bar, stat grid collapse.
- **Tests** (`resources/js/tests/FaceRecognition.test.ts`): 28 tests across 7 describe blocks — statusColors/Icons, cameras (IDs/fields), mockCaptures (IDs/fields/confirmed/possible/unmatched/disguises/multi-camera/multi-person), derived lists (sorted cameras, unique persons, allOps), shortcuts, ViewTab.
- **Keyboard shortcuts**: `1` Captures, `2` Face Search, `3` Statistics, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.11 - 2026-03-26

### Updated — Alert Rules (/alerts)
- **Responsive mobile**: Sidebar + detail hidden ≤768px. Mobile bar (search + New button). Tab labels hidden (icons + kbd). Stat grid stacks.
- **Breadcrumbs fixed**: Added `'alerts': 'Alert Rules'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px filters, 16px stats. Tabs 13px. Rule names 13px, severity/channel badges 9px, targets 10px, fired count 16px. Feed titles 13px, details 10px. Stats headings 14px, values 18-22px. Detail panel 13px name, 12px description, 18px stats, 11px config/channels/targets, 10px meta.
- **Skeleton loader**: 8 skeleton rows during 700ms.
- **New Alert modal**: Full form with rule name, trigger type selector (9 types as grid), severity dropdown, cooldown input, notification channels (toggle buttons), operation select, dynamic config fields per trigger type. Create button disabled without name. Opens via `N` key or `+ New Alert` button.
- **Mock data** (`resources/js/mock/alerts.ts`, 80 lines): 13 rules (trimmed), 8 events, triggerConfig (9 types), sevColors, allOps, allPersons, keyboardShortcuts (8).
- **CSS** (`resources/css/pages/alerts.css`, 25 lines): Skeleton, kbd, 3-panel layout, responsive.
- **Tests** (`resources/js/tests/Alerts.test.ts`): 24 tests: triggerConfig, sevColors, mockRules (IDs/fields/types/channels/enabled), mockAlertEvents (IDs/fields/ruleId cross-ref/unack), helpers, shortcuts.
- **Keyboard shortcuts**: `1-3` tabs, `N` new alert, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal.

## 0.25.10 - 2026-03-25

### Updated — Background Jobs (/jobs)
- **Responsive mobile**: Sidebar + detail panel hidden ≤768px. Mobile filter bar (search + priority). Worker grid single-column. Tab labels hidden (icons + kbd only).
- **Breadcrumbs fixed**: Added `'jobs': 'Background Jobs'`.
- **Footer removed**.
- **Larger fonts**: Sidebar 16px title, 13px search, 12px type list/filters, 16px stats. Tabs 13px. Job names 13px, status 11px, details 10px, progress 10px. Workers 14px name, 11-12px details. Detail panel 13px name, 10-11px fields. Shortcuts modal 13px descriptions.
- **Skeleton loader**: 8 skeleton rows (icon + title + progress bar + meta) during 700ms.
- **Mock data separated** (`resources/js/mock/jobs.ts`): 20 jobs (trimmed from 30 for clarity), 6 workers, typeConfig (10), statusColors/Icons (6), prioColors (4), allOps, keyboardShortcuts (10).
- **CSS separated** (`resources/css/pages/jobs.css`): Skeleton, kbd, 3-panel layout, responsive ≤1024px/≤768px.
- **Tests** (`resources/js/tests/Jobs.test.ts`): 30 tests across 7 describe blocks — typeConfig, statusColors, prioColors, mockJobs (IDs, fields, types, statuses, priorities, progress, output/errors), mockWorkers (IDs, fields, cpu/mem, active→currentJob), allOps, shortcuts.
- **Keyboard shortcuts**: `1-6` tabs, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal (capture phase).

## 0.25.9 - 2026-03-25

### Updated — Reports Page (/reports)
- **Responsive mobile**: Sidebar hidden ≤768px with inline mobile filter bar. Right detail panel hidden on mobile. Tables collapse to stacked layout ≤1024px. Preview content padding reduced. Stats flex to column.
- **Breadcrumbs fixed**: Added `'reports': 'Reports'` to Breadcrumbs.tsx.
- **Footer removed**: Removed CLASSIFIED // NOFORN status bar.
- **Larger fonts**: Sidebar title 13→16px, search 10→13px, filters 7-9→10-12px, stats 13→16px. Table titles 10→13px, status 8→11px, pages 9→12px, operation 8→11px. Generate form all bumped: headings 14→18px, labels 9→12px, inputs 10→13px, sections 8→11px, button 11→14px. Preview report title 18→20px, AI summary 9→12px, sections 13→15px, stats 16→18px. Detail panel stats 12→14px, info 7→10px, sections 7→9px.
- **Skeleton loader**: 8 skeleton rows during 700ms initial load.
- **Mock data separated** (`resources/js/mock/reports.ts`): 12 reports (10 completed, 1 generating, 1 failed), statusColors/Icons, personSections (18), orgSections (11), allOps, keyboardShortcuts (6). Typed interfaces exported.
- **CSS separated** (`resources/css/pages/reports.css`): Skeleton, kbd, 3-panel layout, table grid, responsive ≤1024px (tables collapse, panels shrink), ≤768px (sidebar/detail hidden, mobile bar, preview padding).
- **Tests** (`resources/js/tests/Reports.test.ts`): 24 tests across 7 describe blocks: statusColors/Icons, sections (counts, required), mockReports (IDs unique, fields, stats, statuses, entity types), allOps, shortcuts, ViewMode.
- **Keyboard shortcuts**: `1` History view, `2` Generate view, `F` search, `R` reset, `Esc` close, `Ctrl+Q` modal (capture phase).

## 0.25.8 - 2026-03-25

### Updated — Risks Dashboard (/risks)
- **Responsive mobile**: Sidebar hidden ≤768px, replaced by inline mobile filter bar (search + risk select). KPIs stack vertically. Threat/factor grids go single-column. Tables collapse to stacked cards on ≤1024px. Tab labels hidden on mobile (icons + kbd only).
- **Breadcrumbs fixed**: Added `'risks': 'Risks Dashboard'` to Breadcrumbs.tsx.
- **Footer removed**: Removed CLASSIFIED // NOFORN status bar.
- **Larger fonts**: KPI totals 16→20px, labels 11→13px, breakdown 14→16px. Tab buttons 10→13px. Sidebar title 13→16px, search 10→13px, filters 9→12px. Persons table names 10→13px, risk labels 8→11px, scores 8→11px, factors 9→10px. Org cards 11→14px name, 8→11px details. Vehicle plates 10→13px. Matrix factors 10→13px label, 8→11px detail, score 16→18px. Threat cards name 12→14px, nationality 8→11px. Factor distribution label 9→12px, stats 8→11px. Expanded factor labels 9→12px, detail 8→11px.
- **Skeleton loader**: KPI skeleton (3 cards with breakdown placeholders) + row skeleton (5 rows with avatar + text) during 700ms initial load.
- **Mock data separated** (`resources/js/mock/risks.ts`): personRiskFactors (21 factors across 5 persons), factorCategories (8), ViewTab type, RiskFactor interface, keyboardShortcuts (9).
- **CSS separated** (`resources/css/pages/risks.css`, 44 lines): Skeleton, kbd, layout, responsive ≤1024px (tables collapse), ≤768px (sidebar hidden, mobile bar shown, grids single-column).
- **Tests** (`resources/js/tests/Risks.test.ts`): 28 tests across 6 describe blocks: factorCategories (8 cats, unique IDs, required fields), personRiskFactors (unique IDs, valid categories, person ID cross-ref, score ranges, critical count), cross-entity (persons/orgs/vehicles risk fields, riskColors coverage), keyboard shortcuts (1-5, F, R, Ctrl+Q), ViewTab type.
- **Keyboard shortcuts**: `1-5` switch tabs, `F` focus search, `R` reset filters, `Esc` close expanded/modal, `Ctrl+Q` shortcuts modal (capture phase).

## 0.25.7 - 2026-03-25

### Updated — Activity Log Page (/activity)
- **Fixed breadcrumbs**: Removed negative margins (`margin: 0 -24px -80px 0`) from `.act-page` layout. Page now uses `border-radius: 10px` container with `border: 1px solid` instead of bleeding to edges. Breadcrumbs are fully visible above the page content.
- **Removed footer**: No footer bar in the page.
- **Larger fonts**: Event title 13→14px, description 11→12px, meta links 10→11px, header count 14→16px, badges 8→10px, sidebar labels 10→12px, search input 12→13px, stat numbers 16→18px, expanded metadata 10→11px, action buttons 10→11px, empty state text 15→16px, load more button 12→13px, icon sizes 16→18px, type icons 14px in sidebar.
- **Skeleton loader**: Enhanced skeleton with badge placeholders, larger icon (38px), multi-line content blocks with realistic proportions. Shows 8 skeleton rows on initial load.
- **Responsive mobile**: Left sidebar hidden on ≤768px. Mobile filter bar appears with search input, severity dropdown, and person dropdown for quick filtering. Event meta stacks vertically on mobile. Keyboard badges hidden on ≤1024px.
- **Mock data already at** `resources/js/mock/activity.ts` — 20 events, 12 types, 5 severities, filter helpers.
- **CSS already at** `resources/css/pages/activity.css` — Rewritten with fixed layout, mobile filter bar, responsive breakpoints. 49 lines.
- **Tests already at** `resources/js/tests/Activity.test.ts` — 237 lines covering events, type configs, severity configs, filter helpers, keyboard shortcuts, cross-references.
- **Keyboard shortcuts**: F (focus search), C (toggle critical), R (reset filters), Esc (close), Ctrl+Q (shortcuts modal). All use capture phase for Ctrl+Q interception.

## 0.25.6 - 2026-03-25

### Updated — Profile Page (/profile)
- **Responsive mobile**: CSS media queries ≤768px — tab bar shows icons only (labels hidden), audit log table stacks to single column with inline labels, session cards stack vertically, theme grid shrinks to 120px min, font grid to 1 column, filter bar stacks, TOTP QR section centers vertically, backup codes grid to 2 columns. Keyboard shortcut badges hidden on ≤1024px.
- **Mock data separated** (`resources/js/mock/profile.ts`): Extracted mockUser, mockSessions (4), mockAuditLog (20), mockIpData (5 IPs), backupCodes (8), languages (5 with RTL), dateFormats (10), timezones (23), actionColors (13 action types), keyboardShortcuts (8). All fully typed with exported interfaces.
- **CSS already at** `resources/css/pages/profile.css` — appended 40 lines of responsive mobile styles and keyboard badge styles. Total 247 lines.
- **React tests** (`resources/js/tests/Profile.test.ts`): 38 test cases across 9 describe blocks — mockUser fields + initials, sessions (unique IDs, one current, IP cross-ref), audit log (chronological order, action colors, IP cross-ref), IP data (key-value match), backup codes (format, uniqueness), languages (RTL check), settings (date formats, timezones), keyboard shortcuts (1-5 + Ctrl+Q), Tab type.
- **Keyboard shortcuts**: `1-5` switch tabs (Personal/Password/Security/Settings/Audit), `Esc` close modal, `Ctrl+Q` toggle shortcuts modal. Event listener uses capture phase for Ctrl+Q interception. Tab buttons show keyboard number badges on desktop.
- **Ctrl+Q modal**: Fixed-position overlay with all 8 shortcuts listed, close ✕ button, backdrop click close, Esc close. Styled consistently with Download page modal.
- **Top loader integration**: Tab switches trigger global top loader via `useTopLoader().trigger()`.

## 0.25.5 - 2026-03-25

### Changed — Global Top Loader on Every Page Navigation
- **Automatic Inertia integration**: TopLoaderProvider now hooks into `router.on('start')` and `router.on('finish')` events. Every page navigation (sidebar clicks, `router.visit()`, form submissions, back/forward) automatically shows the top loader bar — no manual code needed per page.
- **Realistic progress behavior**: On navigation start, bar jumps to 30% then slowly crawls toward 90% (random +2-5% every 300ms). On navigation finish, bar jumps to 100% and fades out. This feels natural regardless of actual load time.
- **Disabled Inertia built-in progress**: Set `progress: false` in `createInertiaApp()` since our TopLoader replaces it entirely with a better visual (gradient bar with shimmer vs. Inertia's solid line).
- **Backward compatible**: `useTopLoader().trigger()` still works for in-page actions (tab switches, button clicks). New `start()` and `finish()` methods exposed for advanced control.
- **Transition tuning**: Initial jump (0→30%) uses fast 0.1s transition. Crawl phase uses slow 0.6s. Completion (→100%) uses 0.2s + 0.4s opacity fade.

### How it works:
```
Click sidebar link → router.on('start') fires → bar appears at 30%
                   → crawls slowly toward 90% while page loads
                   → router.on('finish') fires → bar hits 100% → fades out
```

No code changes needed in any page component. All 27+ pages get the loader automatically.

## 0.25.4 - 2026-03-25

### Updated — Download Client Page (/download)
- **Removed footer bar** (CLASSIFIED // NOFORN status bar at bottom).
- **Fixed Ctrl+Q keyboard shortcut**: Event listener now uses capture phase (`addEventListener('keydown', handler, true)`) and calls both `preventDefault()` and `stopPropagation()` to intercept Ctrl+Q before the browser can close the tab. Modal toggles correctly on repeat press.
- **Removed tabs**: Deploy and Release Notes tabs removed. Only Desktop and Mobile tabs remain.
- **Mobile tab — Android cleaned**: Removed feature labels (Biometric unlock, Push notifications, Offline mode, Background tracking). Removed Google Play, Direct APK buttons. Removed "Also via MDM" text.
- **Mobile tab — iOS cleaned**: Removed feature labels (Face ID / Touch ID, Push notifications, Offline mode, Background location). Removed App Store, TestFlight buttons. Removed "Enterprise dist." text.
- **QR Code lightbox**: Clicking any QR code opens a fullscreen lightbox with enlarged 260px QR code, platform label, and close instructions. Closes on Esc, backdrop click.
- **Removed MDM widget** from mobile tab.
- **Desktop tab — features removed**: Feature label chips removed from desktop release cards.
- **Left sidebar cleaned**: Removed Platforms/Packages/Installs stats row. Removed Shortcuts section. Removed Profile, Dashboard, Jobs links.
- **Tab type updated**: `Tab` type narrowed to `'desktop' | 'mobile'` in mock data.

## 0.25.3 - 2026-03-25

### Changed — Global Top Loader
- **New `TopLoaderProvider`** (`components/ui/TopLoader.tsx`): Global top loader bar rendered at `position: fixed; top: 0; z-index: 9999`. Any page can trigger it via `useTopLoader()` hook. Animated gradient (accent→purple→pink) with shimmer effect. Theme-aware via `accentColor` prop.
- **AppLayout integration**: `TopLoaderProvider` wraps all app content inside `ToastProvider`. Passes current theme accent color.
- **Download page refactored**: Removed per-page `topLoader` state, `topTimer` ref, `triggerLoader` callback, and `dl-loader` JSX. Now uses `const { trigger } = useTopLoader()` — 5 trigger calls converted.
- **Download CSS cleaned**: Removed `.dl-loader`, `.dl-loader-bar`, `.dl-loader-shimmer`, `@keyframes dl-shimmer` (now handled globally).
- **Map page unchanged**: Map's in-container top loader (z-index 60 inside `.tmap-container`) is a map-specific UX element for 60+ map operations — intentionally kept separate from the global page loader.

### Usage for any page:
```tsx
import { useTopLoader } from '@/components/ui/TopLoader';
const { trigger } = useTopLoader();
trigger(); // fires the global loader animation
```

## 0.25.2 - 2026-03-25

### Updated — Download Client Page (/download)
- **Responsive mobile design**: 3 breakpoints — desktop (>1024px, 3-panel), tablet (≤1024px, hides left sidebar), mobile (≤768px, stacked single column). Cards, banners, system requirements table, and QR sections all reflow properly.
- **Larger fonts**: Headings bumped to 14-18px (from 7-13px), body text 10-13px (from 7-10px), sidebar labels 10-11px, tab labels 13px, detail panel 10px. All text now legible on high-DPI and mobile screens.
- **Top loader bar**: Animated gradient bar (accent→purple) with shimmer effect. Triggers on tab switch, download click, and keyboard shortcut actions. 3-phase animation: 30%→70%→100%→fade.
- **Skeleton loader**: Pulsing skeleton cards during 800ms initial load. Matches card layout with avatar, title, tags, and button placeholders.
- **Keyboard shortcuts**: `1`-`4` switch tabs, `D` triggers recommended download, `Esc` closes detail panel, `?` toggles shortcuts overlay dialog. Shortcuts shown in sidebar and as `<kbd>` badges on tab buttons.
- **Separated CSS** (`download.css`): All custom styles extracted — loader animations, skeleton pulse, keyboard hint badges, responsive breakpoints, card hover effects, download button animations. 65 lines.
- **Separated mock data** (`mockData.ts`): All constants, types, releases array, release notes, deployment types, system requirements, platform colors, and detectCurrentPlatform() extracted. 80 lines. Fully typed with exported interfaces.
- **React tests** (`Download.test.ts`): 38 test cases across 9 describe blocks — mock data integrity (constants, releases, release notes, deployment types, system requirements, platform colors), platform detection, data consistency cross-references, keyboard shortcut mapping. Run: `npx vitest run resources/js/pages/Download/Download.test.ts`.
- **Breadcrumbs fixed**: Added `'download': 'Download Client'` to Breadcrumbs route labels. Removed negative top margin from page layout so breadcrumbs are visible above page content.
- **Notification dropdown** max-width capped at `calc(100vw - 20px)` to prevent overflow on mobile.

### Files
- `resources/js/pages/Download/Index.tsx` — refactored page (307 lines, down from 372)
- `resources/js/pages/Download/mockData.ts` — NEW: extracted mock data + types
- `resources/js/pages/Download/download.css` — NEW: extracted custom styles
- `resources/js/pages/Download/Download.test.ts` — NEW: 38 test cases
- `resources/js/components/layout/Breadcrumbs.tsx` — added download label

## 0.25.1 - 2026-03-25

### Fixed — Responsive App Header & Sidebar
- **Single hamburger menu**: Removed duplicate hamburger buttons. On mobile (≤768px), only one hamburger icon appears in the app header. On desktop (>768px), the hamburger is hidden and the sidebar has its own collapse toggle.
- **Profile dropdown responsive**: On desktop shows full button with avatar + "J. Mitchell" + "OPERATOR" text. On mobile shows only the round avatar icon (JM). Click opens the same dropdown menu on both.
- **Clock dropdown responsive**: On desktop shows full button with city name + time. On mobile shows only the clock icon. Click opens the same timezone dropdown on both.
- **Sidebar hidden on mobile by default**: The left sidebar is completely hidden on mobile. It only appears when clicking the hamburger icon in the header. Shows as a slide-over panel with backdrop overlay and close (✕) button.
- **Desktop sidebar unchanged**: Collapse/expand toggle still works as before on desktop. Collapsed mode shows icon-only navigation.
- **Sidebar rendered once per context**: Desktop sidebar and mobile sidebar are separate DOM elements controlled by CSS media queries. No duplicate rendering. Mobile sidebar always renders expanded (260px) with a close button instead of collapse toggle.

## 0.25.0 - 2026-03-25

### Updated — Download Client Page (/download)
- **Complete rebuild** of the Download Client page with 4 tabs, deployment modes, MDM support, release notes, and enhanced QR codes.
- **4 view tabs**: Desktop (7 packages with auto-detect banner), Mobile (2 packages with QR codes + store badges + MDM), Deployment (3 modes + system requirements + integrity verification), Release Notes (version history with timeline).
- **Deployment tab**: 3 deployment modes — Standalone (single workstation), Managed Server (enterprise multi-operator), Air-Gapped (classified, offline). System requirements matrix for all 5 platforms. SHA-256 verification commands (PowerShell + sha256sum).
- **Mobile MDM support**: Microsoft Intune, Jamf Pro, VMware Workspace ONE, MobileIron enterprise deployment.
- **Store badges**: Google Play + Direct APK (Android), App Store + TestFlight (iOS). Enterprise distribution notes.
- **Release Notes tab**: Version timeline v0.24.2→v0.21.0 with dates and summaries. Latest release highlighted with glow dot + LATEST badge.
- **Header profile dropdown**: "Download Client" item with download icon between "My Profile" and "Settings".

## 0.24.2 - 2026-03-25

### Added — Tauri v2 Multi-Platform Native App
- **Tauri v2 integration** for building ARGUX as a native application on 5 platforms: Windows (.msi/.exe), Linux (.deb/.rpm/.AppImage), macOS (.dmg/.app), Android (.apk/.aab), iOS (.ipa).
- **`src-tauri/tauri.conf.json`** — Main configuration: app window (1440×900, min 1024×700), CSP policy for MapLibre + tile providers, bundle targets for all platforms, NSIS installer with English/Croatian, macOS minimum 10.15, Linux deb/rpm/AppImage, iOS/Android settings.
- **`src-tauri/Cargo.toml`** — Rust dependencies: tauri v2 core, 8 cross-platform plugins (shell, notification, clipboard, dialog, process, os, http, opener), 4 desktop-only plugins (single-instance, window-state, updater, global-shortcut). Release profile: LTO, strip symbols, panic=abort.
- **`src-tauri/src/lib.rs`** — Shared app logic: 4 Tauri commands (get_platform_info, set_window_title, toggle_fullscreen, minimize_to_tray), platform-conditional plugin registration, macOS title bar overlay, startup banner, minimum window size enforcement.
- **`src-tauri/src/main.rs`** — Desktop entry point with Windows subsystem flag.
- **`src-tauri/capabilities/default.json`** — Cross-platform permissions: window management, shell open, notifications, clipboard, dialogs, process control, OS info, HTTP, opener.
- **`src-tauri/capabilities/desktop.json`** — Desktop-only permissions: global shortcuts, updater, window state persistence.
- **`src-tauri/icons/icon.svg`** — ARGUX branded app icon with targeting reticle + gradient.
- **`resources/js/lib/tauri.ts`** — Frontend Tauri bridge with graceful browser fallback: platform detection (isTauri/isBrowser/isDesktop/isMobile), tauriInvoke() generic command caller, sendNotification() (falls back to Web Notification API), copyToClipboard() (falls back to navigator.clipboard), openExternal() (system browser in Tauri, new tab in browser), confirmDialog() (native dialog in Tauri, window.confirm in browser), saveFileDialog(), tauriFetch() (bypasses CORS in Tauri), getPlatformInfo().
- **`resources/js/types/tauri.d.ts`** — TypeScript declarations for TAURI_ENV_* variables and window.__TAURI_INTERNALS__.
- **`vite.config.ts`** — Tauri-aware: TAURI_ENV_PLATFORM detection, clearScreen:false, envPrefix includes TAURI_ENV_, modern build targets (es2021/chrome100/safari15), vendor-tauri chunk splitting, mobile dev server host 0.0.0.0, conditional HMR for mobile.
- **`package.json`** — 12 npm scripts: tauri, tauri:dev, tauri:build, platform-specific builds (windows/linux/macos/macos-arm/macos-intel), mobile init/dev/build (android/ios), icon generation. Dependencies: @tauri-apps/api v2, 7 plugin packages. DevDependencies: @tauri-apps/cli v2.
- **`TAURI-SETUP.md`** — Comprehensive build guide: prerequisites per platform, step-by-step build commands, development mode instructions, icon generation, architecture diagram, plugin matrix, CI/CD targets, troubleshooting table.

### Build Commands
```
npm run tauri:dev              # Desktop development
npm run tauri:build            # Build for current platform
npm run tauri:build:windows    # Windows .msi + .exe
npm run tauri:build:linux      # Linux .deb + .rpm + .AppImage
npm run tauri:build:macos      # macOS universal .dmg
npm run tauri:android:dev      # Android development
npm run tauri:android:build    # Android .apk + .aab
npm run tauri:ios:dev          # iOS simulator
npm run tauri:ios:build        # iOS .ipa
```

## 0.24.1 - 2026-03-25

### Added — React Developer Tools Integration
- **React StrictMode** enabled in development builds. Wraps the entire app in `<StrictMode>` to enable: double-rendering checks for side effects, deprecated API warnings, better React DevTools component highlighting and state inspection.
- **Production bypasses StrictMode** — no performance overhead in `npm run build` output.
- **Console DevTools banner** — development mode prints styled ARGUX DevTools message with link to React Developer Tools installation page.
- **Source maps enabled** — `css.devSourcemap: true` for CSS source mapping, `build.sourcemap: 'hidden'` for production profiling. In React DevTools Components tab, clicking `<>` on any component jumps directly to its source file.
- **Fast Refresh preserved** — `@vitejs/plugin-react` fast refresh keeps component state during hot edits, visible in DevTools as preserved state tree.
- **Vite config upgraded** to function mode `defineConfig(({ mode }) => ...)` for environment-aware source map and plugin configuration.
- **Server source maps** — `server.sourcemapIgnoreList: false` ensures all source maps are served to browser DevTools.

### How to use React DevTools with ARGUX:
1. Install the browser extension: [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
2. Run `npm run dev` (development mode enables all DevTools features)
3. Open browser DevTools → "Components" tab to inspect React component tree
4. Open browser DevTools → "Profiler" tab to record and analyze render performance
5. Click any component → see props, state, hooks, and source location
6. For production profiling: `npm run build` generates hidden source maps for the Profiler

## 0.24.0 - 2026-03-25

### Added — Surveillance Apps Page (/apps)
- **Mobile Agent Control Center**: Remote device monitoring for deployed surveillance agents on iOS/Android. 6 deployed agents, 4 agent types, 10 data tabs including SMS, calls, contacts, calendar, notifications, network, location, screenshots, photos, and remote control.
- **4 agent types**: Full Monitor (📱 complete device access), GPS Tracker (📍 location only), Comms Intercept (📡 SMS + calls), Stealth Suite (🕵️ undetectable full monitor).
- **6 deployed agents**: Horvat (Samsung Galaxy S24 Ultra, Full Monitor, Active — 342 SMS, 189 calls, 247 contacts, 2.4GB), Mendoza (Google Pixel 8 Pro, Stealth Suite, Stealth — 567 SMS, VPN detected, new SIM), Hassan (iPhone 15 Pro Max, Comms Intercept, Active — dual SIM, 34% battery), Babić (Samsung Galaxy A54, GPS Tracker, Active — location only, 89% battery), Al-Rashid (iPhone 16 Pro Max, Full Monitor, Offline 16h — Dubai, GLACIER), Petrova (Xiaomi 14 Ultra, Comms Intercept, Paused — Moscow, legal review).
- **10 data tabs**: SMS (flagged messages with AI cross-reference intelligence), Calls (log with REC badge for recorded calls, missed indicators), Contacts (name, phone, email, label, starred), Calendar (events with CRITICAL flags for operational dates), Notifications (app name, title, body from Telegram/Signal/Gmail/WhatsApp/Banking), Network (carrier, network type, cell ID, IP, WiFi SSID/BSSID, DNS, VPN detection, Bluetooth, NFC, IMSI), Location (current GPS + coordinates + map link), Screenshots (grid with app name + timestamp), Photos (gallery with filename, size, GPS location), Remote Control (10 commands).
- **SMS intelligence**: Horvat 6 messages with 3 CRITICAL flagged: "pristanište 7, 22h" (dock 7 Thursday, cross-ref audio + Telegram), "Ruta B bez zaustavljanja" (Route B, cross-ref sp-13), Colombian cross-border "paketi stigli" (packages arrived, 22:45 night). Mendoza 3 messages: Route B confirmation, Hassan storage unit, Spanish Bogotá shipment. Hassan 2 messages: storage unit inbound, "package logistics" to Al-Rashid chain. Al-Rashid 1 inbound from Hassan confirming full command chain.
- **Call log**: Recorded calls marked with 🎙️ REC badge. Horvat→Babić burner (4:12), Horvat→Mendoza Colombia (8:34 night), Al-Rashid→Horvat (12:05). Missed calls shown in red.
- **Contacts analysis**: Horvat 8 contacts including Ivan B. (Babić burner), Carlos M. (Colombia), Ahmed R. (Saudi), Omar H. (Egypt) — all starred. Mendoza contacts use codenames: Hawk, Falcon, Shadow, Bogotá HQ. Hassan contacts: Lobo, The Boss.
- **Calendar intel**: CRITICAL — Horvat "Port Terminal — Dock 7" 2026-03-27 22:00 matches all operational intelligence. Mendoza "Dock 7 — Final" 21:30 (arrive 30min early). Hassan "Storage B — Inspection" 16:00 Thursday. Horvat "Flight to Riyadh" 2026-03-28.
- **Remote control panel**: 10 commands (Force GPS, Front Camera, Rear Camera, Microphone 60s, Screenshot, Network Scan, Clipboard, Silent Ping, Lock Device, Force Data Upload). Commands disabled for Offline/Paused devices with warning banner.
- **Device header**: Avatar with status border, person name, status badge, device model, OS version, agent version, IMEI, MAC address, phone number. Stats bar: SMS count, calls, contacts, photos, screenshots, battery gauge, signal gauge.
- **Left sidebar**: App list with avatar, person name, device model, status icon, battery/signal/SMS/calls quick stats. Filters: Status (Active/Stealth/Paused/Offline), Platform (Android/iOS), search. Stats: deployed, live, down.
- **Cross-linked**: Persons → /persons/:id (Horvat #1, Mendoza #9, Hassan #7, Babić #12, Al-Rashid #3, Petrova #4), Map → /map (GPS location), Devices → /devices, Alerts → /alerts, Storage → /storage. SMS cross-references: audio intercept "delivery dock 7" (ev-07), Telegram "dock 7" (sp-04), "Route B" (sp-13), FlightRadar Al-Rashid jet (wa-13), Hassan storage pattern. Full communication chain visible: Horvat↔Mendoza↔Hassan↔Al-Rashid.

## 0.23.0 - 2026-03-24

### Added — Background Jobs Page (/jobs)
- **Queue & Worker Dashboard**: Full job queue management with 30 mock jobs across 10 types, 6 workers, animated progress bars, and detailed job inspection.
- **6 view tabs**: All Jobs (30), Running (4 with animated progress), Queued (5), Completed (15), Failed (3 failed + 1 cancelled + 2 retrying), Workers (6 worker cards with CPU/memory gauges).
- **10 job types**: Data Sync (🔄), AI Inference (🤖), Report Generation (📊), Bulk Export (📦), Media Processing (🎬), Face Search (🧑), Scraper Run (📱), System Backup (💾), LPR Batch (🚗), Workflow Execution (⚡). Each with icon and color.
- **30 mock jobs** linked to real features: INTERPOL sync (67% running), Horvat movement AI analysis (LLaMA 3.1, 43%), port camera video transcription (Faster-Whisper, 28%), Mendoza face search (InsightFace GPU, 55%), HAWK Weekly Report #5 (queued), Telegram batch scraper (queued), LPR batch A1 Highway (queued), OpenCorporates shell detection (queued), dark web crawl (queued), morning briefing #24 (completed 12.4s), co-location evidence #42 (workflow 1.5s), EU sanctions sync (4.2s), vehicle HAK sync, anomaly detection batch (XGBoost 47s), full backup (42m 2.4TB), social scraper batch (45s), news monitor (8s), port intrusion workflow (2.3s), LPR auto-track workflow (0.8s), audio keyword scan (Faster-Whisper 4.8s), PEP Dow Jones screening, Rashid shell report (22s), activity CSV export, Arabic translation (NLLB-200 13s), HROK credit bureau (failed, connection refused), dark web marketplace (failed, Tor circuit), Li Wei report (failed, insufficient data), bulk photo export (cancelled), Cairo camera reconnect (retrying), court records e-Spis (retrying partial timeout).
- **6 workers**: Alpha (active, CPU 72%), Bravo (active, 45%), Charlie (active, 88%), GPU Delta (active, 34% CPU / 92% memory), Echo (idle), Foxtrot (offline). Cards with status dot, current job, jobs processed count, uptime, CPU/memory progress bars.
- **Animated progress**: Running jobs show progress bars that animate every 3 seconds (+2% tick). Running status has pulsing dot indicator.
- **Left sidebar 5 filters**: Search (job name, entity, tags), Job Type (10 types with counts), Priority (Critical/High/Normal/Low), Operation (HAWK/GLACIER/PHOENIX), stats bar (running/queued/done/failed).
- **Job detail panel**: Type icon + name + label, status/priority/operation badges, animated progress bar with ETA (for running), Input Parameters section (model name, window, subjects, API details), Output section (results, record counts, file paths), Error Log section (red highlight with monospace error text, retry count), metadata (worker, queue, initiator, start/complete/duration, entity), tags, action buttons (Retry for failed, Cancel for running, View Entity link, Activity log).
- **Cross-linked**: Persons → /persons/:id (Horvat, Mendoza, Hassan, Li Wei), Organizations → /organizations/:id (Rashid Holdings), Devices → /devices/:id (Port Terminal Cam, Al-Rashid Residence Mic, Cairo Office), Data Sources → /data-sources (INTERPOL, EU Sanctions, HAK, OpenCorporates, HROK, e-Spis, PEP Dow Jones), Workflows → /workflows (Nightly Sweep, Co-location Evidence, Port Intrusion, LPR Auto-Track), Reports → /reports (briefing #24, weekly #5, shell company), Activity → /activity, Social Scraper → /scraper, Face Recognition → /face-recognition.

## 0.22.1 - 2026-03-24

### Fixed — Map Page WebGL Error Handling
- **Fixed uncaught WebGL context creation error** that crashed the page when GPU acceleration is disabled, browser is sandboxed, or hardware doesn't support WebGL.
- Added **global error handlers** (`window.addEventListener('error')` + `webglcontextcreationerror`) that catch WebGL failures that escape the MapLibre try/catch initialization block.
- Added **WebGL Fallback UI** when WebGL is unavailable: error icon, explanation message, Retry button (page reload), Dashboard link, troubleshooting steps (hardware acceleration, chrome://gpu, driver updates, browser alternatives), and quick navigation links to /activity, /persons, /operations, /vision.
- **Conditional map container rendering**: the `<div ref={mapContainer}>` is no longer rendered when `webglFailed === true`, preventing any secondary WebGL initialization attempts.
- **Minimap gated** on `!webglFailed` to prevent the minimap's separate MapLibre instance from also crashing.
- **Global handler cleanup** added to useEffect return to properly remove event listeners on unmount.

## 0.22.0 - 2026-03-24

### Added — Web Scraper Page (/web-scraper)
- **OSINT Intelligence Crawler**: 16 web sources across 8 categories, 15 scraped articles with AI relevance scoring, entity tagging, and cross-reference intelligence.
- **8 source categories**: News Portal (📰, 6 sources), Court Records (⚖️, 1), Sanctions List (🚫, 2), Dark Web (🕸️, 2), Government Gazette (🏛️, 1), Corporate Registry (🏢, 1), Maritime & Aviation (🚢, 2), Academic & Research (🎓, 1).
- **3 view tabs**: All Articles (filterable article feed with relevance scoring), Critical Intel (7 critical-relevance articles), Sources (16 source cards with health/status/keywords).
- **16 web sources**: Jutarnji List, Večernji List (Croatian news), Reuters World, Al Jazeera ME, OCCRP Investigations (international), e-Spis Court Registry (Croatian courts), INTERPOL Red Notices, EU Sanctions Map, Dark Web Forum Monitor, Dark Web Marketplace (error), Narodne Novine (Croatian gazette), Saudi Gazette, OpenCorporates Filings, MarineTraffic Incidents, FlightRadar24 Alerts, Jane's Defence Weekly (paused). 7 countries: Croatia, International, Qatar, EU, UK, Greece, Sweden, Saudi Arabia.
- **15 mock articles** with intelligence-grade content: Zagreb port security alert (CRITICAL, coincides with HAWK window), EU arms export controls (Balkans trafficking), Saudi investment Cyprus expansion (Rashid Holdings entity match), Alpha Security court proceeding (export violations, Horvat+Babić named), EU sanctions update (MENA arms), dark web Adriatic delivery listing (CRITICAL, Thursday dock 7 match), Rashid Mediterranean shell company filing (Cyprus nominee, layering pattern), unregistered AIS-dark vessel approaching Zagreb port (CRITICAL), OCCRP Adriatic arms pipeline investigation (CRITICAL, parallel intel), Croatian defense export regulation, Alpha Security €15M partnership, Rashid Holdings Q1 results (maritime logistics), Al-Rashid private jet Riyadh→Zagreb TOMORROW (CRITICAL, within 72h window), dark web "Adriatic route" encrypted thread (CRITICAL, triple convergence), Savska safe house incident (police, cross-ref unknown LPR).
- **4 relevance levels**: Critical (7 articles), High (5), Medium (3), Low (0) — color-coded with AI reasoning.
- **AI intelligence flags**: 13/15 articles flagged with detailed cross-reference reasoning connecting to: OP HAWK operational window, intercepted audio ("dock 7"), social scraper posts, LPR captures, IMSI data, GLACIER AML analysis, OpenCorporates shell companies, camera events, safe house surveillance.
- **Left sidebar 8 filters**: Search (title, excerpt, tags), Source Category (8 with counts), Relevance (Critical/High/Medium/Low), Country (7), Person (Horvat, Al-Rashid), Organization (Alpha Security, Rashid Holdings), AI Flagged toggle. Stats bar: sources, live, articles, critical.
- **Article detail panel**: Source icon + name + category, title, relevance + content type badges, full excerpt, AI Intelligence Assessment (red highlighted section with detailed cross-reference reasoning), tagged entities (persons → /persons/:id, organizations → /organizations/:id), metadata (source, category, country, language, published, scraped, media), tags with CRITICAL/HAWK/GLACIER highlighting, action buttons (Activity, Operations, Storage).
- **Source cards**: Category icon, name, country flag + language, status + health, article count + new, schedule, keyword chips, URL.
- **Cross-linked**: Persons → /persons/:id (Horvat, Al-Rashid, Babić), Organizations → /organizations/:id (Alpha Security, Rashid Holdings), Social Scraper → /scraper (cross-ref Falcon Trading Cyprus post, Mendoza dock 7 message), Data Sources → /data-sources (News Monitor, Dark Web Monitor, OpenCorporates, EU Sanctions), Activity → /activity (events cross-referenced), Operations → /operations (HAWK/GLACIER), Storage → /storage, LPR → /plate-recognition (KA-9921-CC cross-ref), Camera events (ev-21 unregistered vessel).

## 0.21.0 - 2026-03-24

### Added — Social Media Scraper Page (/scraper)
- **Social Media OSINT Collection Engine**: 10 platforms, 18 active scrapers, 17 scraped posts with AI sentiment analysis and intelligence flagging. Full content feed with engagement metrics.
- **10 platforms supported**: Facebook (📘), X/Twitter (𝕏), Instagram (📸), TikTok (🎵), YouTube (▶️), LinkedIn (💼), Telegram (✈️), Snapchat (👻), Reddit (🔴), WeChat (💬). Each with branded icon and color.
- **3 view tabs**: Content Feed (filterable post stream with engagement), AI Flagged (posts flagged by NLP sentiment + keyword analysis), Scrapers (18 scraper configuration cards with status/interval/keywords).
- **18 mock scrapers** across 8 persons and 4 organizations: Horvat (Facebook, LinkedIn, Reddit), Kovačević (Instagram), Petrova (TikTok), Mendoza (X, Telegram, Snapchat), Tanaka (YouTube), Babić (Instagram), Hassan (X with error, Telegram), Li Wei (WeChat queued), O'Brien (LinkedIn paused), Alpha Security (LinkedIn, X), Meridian (Facebook paused), Falcon Trading (Facebook, Telegram). Operations: HAWK, PHOENIX.
- **17 mock scraped posts** with rich content: Facebook posts (Horvat port photo GPS-flagged), X posts (Mendoza night activity, SIM swap reference, port retweet), Telegram messages (CRITICAL: "dock 7" keyword match cross-ref with audio, "Route B" evasive language, Hassan storage meeting), Instagram (Kovačević reels, Babić vehicle plate visible), TikTok (Petrova office tour), LinkedIn (Alpha Security defense partnership, Horvat career milestone), Facebook org (Falcon Trading Cyprus expansion shell company flag).
- **AI sentiment analysis**: 4 levels (positive/negative/neutral/flagged) with color coding. 10 posts AI-flagged with detailed intelligence reasoning: port area GPS match, counter-surveillance keywords, audio cross-reference (dock 7), vehicle plate in photo, SIM swap confirmation, storage pattern match, shell company jurisdiction alert.
- **8 content types**: Post (📝), Photo (📷), Video (🎥), Story (⏱️), Reel (🎬), Comment (💬), Share (🔄), Article (📰).
- **Left sidebar 7 filters**: Search (content, person, tags), Platform (10 with post counts), Person (dropdown: Horvat, Kovačević, Petrova, Mendoza, Tanaka, Babić, Hassan), Organization (dropdown: Alpha Security, Mendoza I/E, Falcon Trading, Dragon Tech, Meridian), AI Sentiment (All/Flagged/Negative/Neutral/Positive), Content Type (8 types). Stats bar: scrapers, live, posts, flagged counts.
- **Scraper cards**: Platform icon+color, profile handle, person/org link, status badge (Active/Paused/Error/Queued), total posts, new posts, scrape interval, keyword chips, operation code, last run time, entity links to /persons/:id and /organizations/:id.
- **Post detail panel**: Platform icon + person/org name + handle, full content text, AI intelligence flag section (red highlight with detailed reasoning for flagged posts), engagement metrics (likes/shares/comments/views), metadata (platform, content type, sentiment, timestamp, profile), tags with CRITICAL highlighting, action buttons (Profile, Organization, Activity).
- **Cross-linked**: Persons → /persons/:id (Horvat, Kovačević, Petrova, Mendoza, Tanaka, Babić, Hassan, O'Brien, Li Wei), Organizations → /organizations/:id (Alpha Security, Mendoza I/E, Falcon Trading, Dragon Tech, Meridian), Activity → /activity, Storage → /storage (social media archives). AI flags cross-reference: audio keyword events, IMSI catcher data, GPS tracking patterns, LPR captures, AML financial data.

## 0.20.0 - 2026-03-24

### Added — Face Recognition Page (/face-recognition)
- **InsightFace / ArcFace Intelligence Hub**: Face capture gallery, database search with upload, per-person/camera statistics. 20 mock captures across 7 persons and 11 cameras.
- **3 view tabs**: All Captures (responsive grid of face capture cards), Face Search (upload photo + select known person → simulate GPU-accelerated database scan with results), Statistics (captures per person with confidence dots, captures per camera with device links).
- **20 mock face captures**: 5 Horvat (94% street cam with baseball cap, 91% port with sunglasses, 97% HQ, 96% Frankopanska, 73% Split hotel), 3 Babić (87% Maksimir alone, 92% HQ with Horvat, 78% diplomatic quarter with hat), 1 Kovačević (91% HQ first-in-2-weeks), 2 Al-Rashid (89% airport with bodyguards, 85% Dubai parking), 2 Hassan (82% port, 68% Dubai with keffiyeh), 2 Mendoza (76% night hood+mask, 88% near Savska), 1 Petrova (90% Moscow meeting), 3 unknown/no-match, 2 pending review.
- **Face Search mode**: Drag-and-drop photo upload zone (JPEG/PNG, min 100×100), OR select known person from database dropdown (all 15 persons with risk level). Simulated InsightFace GPU search with progress bar (ONNX Runtime, NVIDIA A100), results shown as confidence cards with camera, location, timestamp, disguise info. Click result → jump to captures tab with detail panel.
- **Capture card grid**: Face photo (avatar or ❓ for unknown), confidence badge (green >85%, amber >70%, red <70%), status overlay (Confirmed/Possible/No Match/Pending), camera label, person name, location, disguise indicator (🎭), operation tag, time ago.
- **Left sidebar 6 filters**: Search (person, camera, location, tags), Match Status (Confirmed 13, Possible 4, No Match 3, Pending 2), Camera Source (11 cameras), Matched Person (7 persons), Operation (HAWK/GLACIER), Min Confidence slider (0-95%).
- **Capture detail panel**: Avatar with status border, confidence gauge (conic-gradient with percentage), capture metadata (camera, location, disguise type, companions, timestamp, quality score, coordinates, operation), tags, action buttons (Profile → /persons/:id, Camera → /devices/:id, Map → /map).
- **Statistics tab**: Per-person breakdown (avatar, name, capture count, avg confidence, individual confidence dots color-coded, profile link). Per-camera breakdown (camera name, location, capture count, device link to /devices/:id).
- **Cross-linked**: Persons → /persons/:id (Horvat #1, Babić #12, Kovačević #2, Al-Rashid #3, Hassan #7, Mendoza #9, Petrova #4), Cameras/Devices → /devices/:id (11 camera devices from mock data), Map → /map, Vision → /vision, Alerts → /alerts (face_match rules ar-03, ar-14), Activity → /activity (face events ev-02, ev-12, ev-24, ev-35), Workflows → /workflows (Face Recognition template), Data Sources → InsightFace/ArcFace ONNX engine.

## 0.19.0 - 2026-03-24

### Added — Plate Recognition Page (/plate-recognition)
- **LPR Intelligence Hub**: Full license plate recognition dashboard with YOLOv8 detection + PaddleOCR v3. 24 mock scans, 10 LPR readers, watchlist management, per-entity filtering.
- **3 view tabs**: All Scans (filterable table of 24 captures), Watchlist (6 tracked plates as cards with risk + vehicle + capture count), Readers (10 LPR reader cards with status, location, camera link, capture count).
- **24 mock LPR scans** across 15 unique plates: 13 watchlist hits (ZG-1234-AB ×5, ZG-5678-CD ×3, SA-9012-RH ×2, SA-3456-RH, BOG-789-ME, EG-4567-FT), 6 matched (registered vehicles), 3 unknown (KA-9921-CC rental near safe house, KA-5511-BB night), 2 partial reads (obscured plates). Linked to 8 persons, 6 organizations, 13 vehicles, 7 cameras.
- **10 LPR readers**: 8 fixed (Vukovarska East, Airport Cargo Gate, A1 Highway Km 78, Savska Safe House, Port Terminal Entry, Ilica/Frankopanska, Rashid Tower Parking Dubai, Split Coastal Road) + 2 mobile units. Status: 8 online, 1 maintenance, 1 offline. Total captures: 106K+.
- **Left sidebar 7 filter dimensions**: Search (plate, person, location, vehicle), Scan Status (Watchlist Hit/Matched/Unknown/Partial Read with counts), LPR Reader (dropdown 10 readers), Person (dropdown: Horvat, Babić, Al-Rashid, Mendoza, Hassan, Müller, Petrova, Al-Zahra), Organization (dropdown: Alpha Security, Rashid Holdings, Falcon Trading, Mendoza I/E, Meridian, Petrova, Gulf Maritime), Plate Number (dropdown all 15 unique plates). Stats bar: total scans, watchlist hits, unknown, readers online.
- **Scan table columns**: Plate (monospace, red if watchlist), Reader/Location, Vehicle (make/model + person link), Status badge, Confidence bar + %, Speed (red if >100km/h), Time (relative + absolute).
- **Watchlist tab**: 6 tracked plates as cards with oversized monospace plate display, risk badge from linked vehicle, vehicle description, person link, capture count, last seen timestamp. Click to filter scans.
- **Readers tab**: 10 reader cards with online/offline/maintenance status dot, location, linked camera (link to /devices/:id), capture count. Click to filter scans by reader.
- **Scan detail panel**: Large plate display on dark background with confidence + camera overlay, Vehicle section (make/model/color + link to /vehicles/:id), Person section (owner name link to /persons/:id + org link to /organizations/:id), Capture Details (reader, location, camera, direction, speed, lane, confidence %, timestamp, coordinates), tags, action buttons (Map, Alert Rules, Camera device link).
- **Cross-linked**: Persons → /persons/:id (Horvat, Babić, Al-Rashid, Mendoza, Hassan, Müller, Petrova, Al-Zahra), Vehicles → /vehicles/:id (real mockVehicles plates), Organizations → /organizations/:id, Devices/Cameras → /devices/:id (cameras #3, #8, #11, #14), Map → /map, Alerts → /alerts (LPR watchlist rules), Activity → /activity (LPR events match). Same plates referenced in Activity Log, Alerts, Workflows, Map live feed.

## 0.18.0 - 2026-03-24

### Added — Reports Page (/reports)
- **Intelligence Report Center**: Full report generation, management, preview, and print/PDF export for persons and organizations.
- **3 views**: Report History (searchable/filterable table of 12 mock reports), Generate New (entity/date/sections selector), Report Preview (full rendered report with print/PDF).
- **Report Generator**: Entity type toggle (Person with 18 sections / Organization with 11 sections), entity dropdown populated from mock data with risk level, date range picker (from/to), section checklist with Select All/None toggle. Generate button with section count.
- **18 person report sections**: AI Summary, Profile & Identity, Contact Information, Known Addresses, Employment History, Education, Vehicles, Known Locations, Connections Graph, Events Timeline, LPR Activity, Face Recognition Matches, Deployed Surveillance, Audio Intercepts, Social Media, Records & Evidence, Risk Assessment, Notes & Annotations.
- **11 organization sections**: AI Summary, Company Profile, Linked Persons, Financial Analysis, Connections Graph, Data Sources, Vehicles, Events Timeline, Records & Evidence, Risk Assessment, Notes.
- **12 mock reports**: Subject profiles (Horvat 34p, Mendoza 22p, Babić 18p, Hassan 15p, Al-Rashid 26p), weekly intelligence (Horvat Week 4 28p), counter-surveillance assessment (Mendoza 12p), organization reports (Alpha Security 42p, Rashid Holdings 38p, Falcon Trading 16p), daily briefing (generating), Li Wei observation (failed). Across HAWK, GLACIER, PHOENIX operations.
- **Report preview**: Full rendered report with classification header, stats cards (events/alerts/connections/LPR/face/files), AI Summary (generated text from Ollama LLaMA 3.1 with RAG), Profile & Identity grid, Company Profile grid, Vehicles table from real mock data, Connections Graph placeholder, Events Timeline placeholder, Risk Assessment with risk gauge, remaining sections as data-linked placeholders, classified footer.
- **Print / PDF export**: Opens print dialog via window.open with styled HTML document. Classification headers and footers included.
- **Report detail panel**: Status badge, classification, stats grid (6 metrics), full metadata (entity, risk, period, generated by/at, pages, size, operation), sections list as chips, entity profile link, View Report / Print / Retry / Storage buttons.
- **Left sidebar filters**: Entity Type (All/Person/Org), Operation (HAWK/GLACIER/PHOENIX), Status (Completed/Generating/Failed), search. Stats bar (total/done/person/org counts).
- **Cross-linked**: Entity profiles (/persons/:id, /organizations/:id), operations (/operations), activity log (/activity), risks (/risks), storage (/storage), workflows (nightly sweep generates reports), real vehicle data from mock entities.

## 0.17.0 - 2026-03-24

### Added — Storage Browser Page (/storage)
- **MinIO File Manager**: Split-panel file browser with entity folder tree (left), sortable file list (center), and file detail/preview panel (right).
- **Folder tree structure**: Two root nodes (Persons/Organizations) with expandable entity folders. Each entity has 9 subfolders: Audio, Video, Photos, Documents, Transcripts, Reports, Evidence, Social Media, Camera Captures. 12 persons + 10 organizations in tree. Click any folder to filter file list. Expand/collapse with arrow indicators.
- **30 mock files** across 8 persons and 3 organizations: Audio intercepts (.wav with transcription), surveillance video (.mp4 with duration/resolution), LPR photos (.jpg), weekly reports (.pdf with page counts), evidence packages (.zip), social media archives (.json), camera captures, transcripts, GPS routes (.gpx), financial analysis (.xlsx), sanctions screening, bank transactions (.csv), face match captures, shell company reports, network graph exports.
- **9 file types**: Audio (🎙️), Video (🎥), Photo (📷), Document (📄), Transcript (📝), Report (📊), Evidence (🔒), Social Media (💬), Camera Capture (📹) — each with icon and color.
- **File list**: Sortable columns (Name, Entity, Type, Tags, Size) with ascending/descending toggle. Entity column links to /persons/:id or /organizations/:id. Tags shown as chips. Size in monospace.
- **Search**: Full-text across filenames, entity names, tags, and transcription text.
- **File type filter**: Quick-toggle chips in sidebar with per-type file counts.
- **Drag-and-drop upload zone**: Expandable upload area with drop target, entity assignment display, browse button. Shows which entity folder files will be assigned to.
- **Path breadcrumb**: Storage → Entity Type → Entity Name navigation with file count and total size.
- **File detail panel**: File icon + name + MIME type, preview area (image placeholder, audio player with progress bar, video player with progress bar), full metadata (size, MIME, entity, folder, path, uploaded by/at, modified, source, duration, resolution, pages), tags as chips, transcription text (for audio files with Faster-Whisper output), Download/Share/Entity link buttons.
- **Cross-linked entities**: Every file linked to /persons/:id (Horvat, Mendoza, Babić, Hassan, Al-Rashid, Kovačević, Li Wei) or /organizations/:id (Alpha Security, Rashid Holdings, Falcon Trading). File sources reference existing features: LPR Reader, InsightFace, Faster-Whisper, IMSI Catcher, GPS Tracker, Camera Network, Social Scraper, Report Generator, Workflow Engine, OpenCorporates, EU Sanctions, Bank Monitor, Connections Graph.

## 0.16.0 - 2026-03-24

### Added — Alert Rules Page (/alerts)
- **Surveillance Alert Engine**: Full alert rule management with 18 rules across 9 trigger types, per-entity targeting, 4 notification channels, and live alert feed.
- **3 view tabs**: Rules (filterable list with inline status), Live Feed (12 recent alert events with acknowledgment state), Statistics (breakdown by trigger type, person, and operation).
- **9 trigger types** from spec: Zone Entry (🛡️), Zone Exit (🚪), Co-location (🔗), Face Match (🧑), Photo/Video (📸), Speed Alert (🏎️), Signal Lost (📵), LPR Match (🚗), Keyword Detection (🔤). Each with icon, color, configurable fields.
- **18 mock alert rules** across 3 operations: HAWK (15 rules: port intrusion, co-location pairs, face at airport, LPR watchlist, signal lost, speed, diplomatic zone, keyword audio, after-hours motion, SIM swap, unknown LPR), GLACIER (2: financial transactions >€50K, Al-Rashid face), PHOENIX (1: Shanghai camera, disabled pending legal auth).
- **12 recent alert events** in live feed: zone breaches, face matches, LPR captures, co-location alerts, keyword detections, speed violations, signal loss, SIM swap — with acknowledged/unacknowledged state and "NEW" indicator.
- **Left sidebar filters**: Trigger Type (9 types with counts), Severity (Critical/Warning/Info), Operation (HAWK/GLACIER/PHOENIX), Target Person (dropdown with all targeted persons), Enabled/Disabled status, text search. Stats bar: total rules, active, unacknowledged, total fired.
- **Rule detail panel**: Trigger type icon + label, severity + enabled badges, description, fired count + cooldown stats, configuration key-value cards (zone/radius/threshold/plates/keywords/confidence etc.), notification channels (In-App 🔔, Email 📧, SMS 💬, Webhook 🔗), target persons linked to /persons/:id, target organizations linked to /organizations/:id, metadata (last fired, created by, operation), Enable/Disable toggle, navigation to /operations and /workflows.
- **Statistics tab**: Alerts by trigger type (cards with rule count + fired count per type), Alert coverage by person (bar chart showing rules and fires per target), By operation (HAWK/GLACIER/PHOENIX comparison).
- **Cross-linked**: Target persons to /persons/:id (Horvat, Mendoza, Babić, Hassan, Al-Rashid, Li Wei), target organizations to /organizations/:id (Alpha Security, Rashid Holdings, Falcon Trading, Dragon Tech), operations to /operations, workflows to /workflows, activity to /activity. Same trigger types used in Map live feed, Workflows engine, and Operations alert rules.

## 0.15.0 - 2026-03-24

### Added — Data Sources Page (/data-sources)
- **Integration Management Hub**: 22 external data sources across 6 categories and 8 countries, with health monitoring, sync controls, and per-country grouping.
- **22 mock data sources**: Government (6: Business Registry, Population Registry, Land Registry, Court Records, Vehicle Registry, Tax Authority), Law Enforcement (3: INTERPOL I-24/7, Europol SIENA, National Police DB), Financial (3: EU Sanctions CFSP, PEP Screening Dow Jones, Bank Transaction Monitor AML), OSINT (3: Social Media Aggregator, News Monitor 500+ sources, Dark Web Monitor), Technical (3: GPS Tracker Fleet MQTT, Camera Network RTSP, IMSI Catcher Array), Commercial (4: OpenCorporates 210M+, Maritime AIS, Aviation Tracker FR24, Credit Bureau).
- **Per-country grouping**: Sources grouped under sticky country headers with flag emoji (🇭🇷 Croatia, 🇪🇺 EU, 🌍 International/Global, 🇬🇧 UK, 🇺🇸 USA, 🇬🇷 Greece, 🇸🇪 Sweden, Multi-country) with per-group status counts.
- **Left sidebar filters**: Category (6 types with icon + count), Status (Connected/Degraded/Paused/Error/Offline), Country (dropdown with counts), text search, stats bar (connected/degraded/error/paused counts), "Sync All Healthy" button, average health display.
- **Source cards**: Health percentage ring (conic-gradient), provider name, category badge with icon, tags (Production/Classified/Real-time/AML/Degraded/Error/Commercial/AI-Enhanced), protocol label, status indicator.
- **Detail panel**: Connection info (protocol, endpoint, auth method, rate limit, encryption at-rest/in-transit, schedule, last/next sync, record count), Data Fields chip list, Linked Modules as clickable navigation chips to relevant pages (/persons, /organizations, /vehicles, /devices, /map, /vision, /alerts, /operations, /risks, /workflows, /face-recognition, /scraper, /chat), notes, Sync Now / Pause / Resume action buttons.
- **Sync Log tab**: Chronological sync history per source with status dot (success green, error red, partial amber), duration, record count, detail description, timestamp.
- **Realistic statuses**: Connected (17 sources, health 88-100%), Degraded (2: Court Records timeout, Dark Web instability), Paused (1: Tax Authority certificate expired), Error (1: Credit Bureau server maintenance), various error rates and sync schedules.
- **Connected to all modules**: Each source links to the modules it feeds — Persons, Organizations, Vehicles, Devices, Map, Vision, Face Recognition, Social Scraper, Web Scraper, AI Assistant, Alerts, Operations, Risks, Workflows, Connections, LPR, Comms.

## 0.14.0 - 2026-03-24

### Added — Risks Dashboard (/risks)
- **Threat Assessment Center**: Cross-entity risk scoring dashboard with 5 tabs, left sidebar filters, and expandable factor breakdowns.
- **5 view tabs**: Overview (KPI cards + top threats + factor distribution), Persons (sortable risk table with expandable factor detail), Organizations (risk-colored cards with linked persons), Vehicles (risk table with owner links), Risk Factors Matrix (all factors sorted by score).
- **Overview tab**: 3 KPI cards (Persons/Orgs/Vehicles) with critical/high/medium counts and stacked risk distribution bars. Top Threat Entities section showing Critical-rated persons with avatar, risk gauge (conic-gradient), and factor chips. Risk Factor Distribution grid showing 8 categories with factor counts and average scores — clickable to jump to matrix.
- **Persons tab**: Table with avatar, name, nationality, risk level, composite risk score bar, top factor chip, and View link. Click to expand and see all risk factors with severity badge, detailed description, and individual score. Factors for 5 key subjects (Horvat: 6 factors, Mendoza: 5, Babić: 4, Hassan: 3, Al-Rashid: 3) totaling 21 risk factors.
- **Organizations tab**: Card grid with industry, country, CEO, linked persons as clickable chips, risk badge. Links to /organizations/:id and /persons/:id.
- **Vehicles tab**: Table with plate (monospace), make/model/year/color, risk level, owner link to /persons/:id, detail link to /vehicles/:id.
- **Risk Factors Matrix tab**: All 21 risk factors across all subjects, sorted by score (0-100), with category icon, severity badge, detailed explanation, and link to subject profile. Filterable by 8 categories.
- **8 risk factor categories**: High-Risk Connections, Zone Violations, LPR Flags, Behavioral Anomalies, Comms Anomalies, Co-location Patterns, AI Anomalies, Financial Flags.
- **Left sidebar**: Risk Level filter (All/Critical/High/Medium/Low/No Risk with entity counts and color-coded bars), Factor Category filter (visible on matrix tab), search, quick links to /map, /activity, /operations, /workflows.
- **Cross-linked**: Persons to /persons/:id, organizations to /organizations/:id, vehicles to /vehicles/:id, map, activity log, operations, workflows. Uses real mock data from all entity modules.

## 0.13.0 - 2026-03-24

### Added — Activity Log Page (/activity)
- **Unified Event Stream**: Full-featured activity log showing all tracked events across the ARGUX platform with 40 realistic mock events spanning 12 event types.
- **Left sidebar filter panel** with 6 filter dimensions: Event Type (12 toggleable chips with counts), Severity (5 levels), Person (dropdown with all subjects), Organization (dropdown), Operation (dropdown: HAWK/GLACIER), and full-text search. All filters update results immediately with pagination reset.
- **12 event types**: Phone, GPS, Camera, LPR, Face Recognition, Audio, Video, Zone (geofence), Alert, System, Workflow, Record — each with icon, color, and count badge.
- **40 mock events** covering: zone breaches, face matches (94% Horvat, 87% Babić, 91% Kovačević), LPR captures (ZG-1847-AB, SA-9012-RH, ZG-5678-CD), co-location alerts (Horvat+Mendoza 3rd in 48h), phone signal events (SIM swap, 6h blackout), GPS anomalies (118km/h urban, storage facility 48h pattern), audio keywords ("delivery" ×3), camera AI detections (loitering, unauthorized vessel), workflow executions, system events (INTERPOL sync, AI inference, backup), evidence records.
- **Expandable event detail**: Click any event row to expand with full description, metadata grid (Zone/Duration/Speed/Confidence etc.), and quick-link buttons to /persons/:id, /organizations/:id, /devices/:id, /operations, /map.
- **Paginated**: 15 events per page with "Load more" button showing remaining count.
- **Stats bar**: Live counts of total events, critical, high, and unique subjects matching current filters.
- **Cross-linked entities**: Every event links to the real mock data — persons (Horvat, Mendoza, Babić, Hassan, Kovačević, Al-Rashid), organizations (Alpha Security, Rashid Holdings, Falcon Trading, Mendoza Import-Export, Gulf Maritime, Petrova Consulting), devices (by ID to /devices/:id), operations (HAWK, GLACIER).
- **Connected to**: Map page (event types match live feed), Operations (same codenames), Workflows (execution events match workflow names), Persons/Orgs/Devices (same IDs), Vision page (same camera device IDs).

## 0.12.0 - 2026-03-24

### Added — Workflows Page (/workflows)
- **Automated Surveillance Workflow Engine**: Kanban board + list + template views for managing trigger→action automation chains.
- **3 view modes**: Kanban (5 columns: Draft/Active/Paused/Completed/Archived), List (sortable table), Templates (pre-built workflow cards).
- **9 mock workflows** linked to real operations (HAWK, GLACIER, PHOENIX, CERBERUS) covering: port intrusion detection, co-location monitoring, counter-surveillance detection, LPR watchlist tracking, financial transaction monitoring, nightly activity sweep, diplomatic surveillance, border crossing alerts, cargo watch.
- **10 trigger types**: Zone Entry, Zone Exit, Co-location, Face Match, LPR Match, Signal Lost, Speed Alert, Keyword Detection, Schedule (cron), Manual.
- **8 action types**: Alert, Assign Team, Escalate, AI Analysis (Ollama/XGBoost), Create Record, Notify, Deploy Device, Generate Report.
- **6 pre-built templates**: Zone Breach Response, Co-location Evidence Capture, Vehicle Tracking Chain, Daily Intelligence Briefing, Signal Loss Response, Face Recognition Alert.
- **Execution log**: Per-workflow run history with status (success/failed/running), duration, trigger description, output summary, timestamps. Running state with pulse animation.
- **Detail panel**: Config tab (triggers with configs, numbered action pipeline, linked persons with /persons/:id links, metadata). Log tab (execution history).
- **Cross-linked**: Workflows tied to Operations (OP HAWK, GLACIER, etc.), linked persons (Horvat, Mendoza, Babić, Hassan, Al-Rashid), with navigation to /operations, /map, /alerts, /persons/:id.
- **Filter/search**: By operation name and text search across workflow names.

## 0.11.0 - 2026-03-24

### Added — Operations Page (/operations)
- **Surveillance Operation Planning Center**: Full-featured operations management page with split-panel layout (operation list + detail view).
- **5 mock operations** with realistic intelligence scenarios: HAWK (Active, arms trafficking), GLACIER (Planning, financial network), PHOENIX (Preparation, tech transfer), CERBERUS (Debrief, border crossing), SHADOW (Closed, diplomatic — redacted).
- **8 detail tabs**: Overview, Targets, Resources, Teams, Zones, Alerts, Timeline, Briefing.
- **Overview tab**: KPI stats cards (events/alerts/hours/intel), operational checklist with team assignments and completion tracking, threat assessment with risk gauge (conic-gradient).
- **Targets tab**: Grid of target persons with avatars, risk badges, nationality — linked to /persons/:id. Target organizations linked to /organizations/:id.
- **Resources tab**: Deployed devices with status and type icons — linked to /devices/:id. Tracked vehicles with plate/make/model — linked to /vehicles/:id.
- **Teams tab**: 6 pre-configured teams (Alpha Ground, Bravo Technical, Charlie SIGINT, Delta Maritime, Echo Air, Fox Rapid Response) with color-coded cards, team leads, member callsigns and roles.
- **Zones tab**: Operation zones (surveillance/restricted/staging/buffer) with coordinates and radius. Linked to Map view.
- **Alerts tab**: Per-operation alert rules with trigger types (Zone Entry, Co-location, LPR Match, Face Match, Signal Lost, Speed, Transaction), severity levels, and enable/disable state.
- **Timeline tab**: Chronological event timeline with connected dot-line visualization, color-coded by type (phase/event/intel/alert).
- **Briefing tab**: SITREP notes, comms channel/frequency display, classification footer.
- **Operation list sidebar**: Filterable by phase (Planning/Preparation/Active/Debrief/Closed) with search, showing codename, priority badge, description preview, and resource counts.
- **Risk gauge**: Conic-gradient circular gauge in operation header showing computed risk level (0-100).
- **Connected features**: Direct links to /persons/:id, /organizations/:id, /devices/:id, /vehicles/:id, /map, /vision from all relevant tabs. Uses real mock data from persons, organizations, devices, vehicles.

## 0.10.2 - 2026-03-24

### Fixed — Vision Page Complete Rewrite
- **WebMediaPlayer limit fix**: Replaced 8-11 simultaneous `<video>` elements with a **single shared `<video>` element** + `<canvas>` per tile architecture. One hidden video plays the source, `requestAnimationFrame` loop paints frames to each camera's canvas. Zero WebMediaPlayer limit issues.
- **Menu reorganized**: Moved all controls from top toolbar to a **collapsible left sidebar** with sections: Camera Groups, Grid Layout, Overlays, Global Controls, Panels. Collapsible via ◀/▶ toggle.
- **Canvas-based rendering**: Each camera tile uses a canvas element registered via `useCallback` ref. The shared RAF loop iterates all registered canvases and draws the video frame with zoom transform and night vision composite.
- All 12 features preserved: PTZ, Motion Zones, Camera Groups, Recording Timeline, Sync Playback, Face Queue, Map View, Bandwidth Monitor, Presets, Waveform, Popup Windows, Per-cam hover controls.

## 0.10.1 - 2026-03-24

### Fixed — Vision Video Playback
- **Video autoplay fix**: Replaced single-shot `play()` with robust event-based recovery. Videos now use `suspend`, `stalled`, `loadeddata`, and `pause` event listeners to retry playback automatically. Added periodic 2-second health check as fallback. Staggered initial play (200-1000ms random delay per tile) prevents browser throttling when loading 8+ simultaneous streams. Separated pause-toggle logic from autoplay logic to avoid dependency conflicts.

## 0.9.0 - 2026-03-24

### Added — Intelligence Panels & Vision Page
- **Anomaly Detection panel** (Alt+3): AI-powered behavioral analysis with 6 anomaly types, 9 mock anomalies, sensitivity slider, deviation bars, baseline vs observed comparison, recommendations. On-premise Ollama LLaMA 3.1.
- **Predictive Risk panel** (Alt+4): ML risk trajectory with conic-gradient risk gauges, predicted locations, threat assessments, numbered recommended actions. XGBoost + scikit-learn.
- **Pattern Detection panel** (Alt+5): Recurring behavioral pattern analysis with 5 categories, weekly heatmap bars, regularity progress bars, involved persons, expanded bar chart.
- **Incident Timeline panel** (Alt+6): Chronological event feed with 10 event types, 15 mock events, visual timeline connectors, severity/type/search filtering, metadata grids.
- **Heat Calendar panel** (Alt+7): GitHub-style 90-day activity grid per person with 13×7 cell grid, month labels, hover tooltips, peak day highlight, legend.
- **Entity Comparison panel** (Alt+8): Side-by-side dual-bar comparison of 12 metrics between two subjects, weekly activity chart, overlap analysis grid.
- **Route Replay panel** (Alt+9): Historical movement animation with VCR transport controls, 0.5×/1×/2×/4× speed, progress scrubber, waypoint event log, speed/bearing/time readout.
- **Geofence alerts** integrated into Live Feed: Zone entry/exit events added as dedicated feed templates.
- **Enhanced map search**: Unified search across 8 categories (persons, orgs, vehicles, devices, saved places, zones, coordinates, geocoding). Category filter chips, grouped results, quick tips.
- **Export/Share modal** (E key): Export map as PNG (canvas download) or PDF (print dialog with metadata). Share workspace URL with encoded viewport state.
- **Keyboard shortcuts overlay** (Ctrl+Q): 27 shortcuts across 4 groups. Input-safe, Esc-priority chain.
- **Panel system upgrades**: Z-index management (click-to-front), snap-to-edge (24px threshold), resize grip (bottom-right), touch drag support, auto-cascade for multi-panel positioning.
- **Vision page** (/vision): Full camera surveillance wall with 11 cameras from mock devices. Features: 1×1/2×2/3×3/4×4 grid layouts, per-camera hover controls (play/pause, mute/unmute, record, night vision, snapshot, fullscreen, volume slider), AI detection overlays with tracking corners, real-time FPS/bitrate/audio stats, live clock, alert badges, status filtering, type filtering, search, detail sidebar with device info + AI detections + alerts + navigation links.
- **Vite chunking**: Manual chunks for maplibre, react, inertia, misc vendors, mock data. Warning limit 1500kB.

### Fixed
- Panel buttons (close/minimize/maximize) not responding: `onMouseDown` on wrapper now skips interactive elements.
- Panel snap-to-edge using wrong dimensions: now reads actual panel element size.
- Multi-panel overlap: auto-cascade positions panels 30px apart.
- TypeScript `as const` assertions added to 175+ lines for CSS literal types.
- `sourceDefs` → `sourceTypes` fix in enhanced search.
- `Record<string, string>` casts on incident metadata objects.
- `bringToFront` optimized to skip re-render when panel already on top.
- Video autoplay: proper play() promise handling with muted-first strategy.
- Breadcrumbs removed from Vision page (full-screen experience like Map).

## 0.8.1 - 2026-03-22

### Added — Map Overlays & Settings
- **World Minimap** (top-right): 140×100px overview map using a second MapLibre GL JS instance with CARTO Dark No-Labels tiles. Non-interactive. Follows main map center and zoom (offset by -6 zoom levels). Crosshair SVG in center. "OVERVIEW" label top-left. Rounded corners with border and shadow. Visible by default, togglable in Settings.
- **Compass widget** (bottom-left): 60px SVG compass rose that rotates based on map bearing in real-time. Features: N/S/E/W cardinal labels, red north needle, white south needle, 8 tick marks (major at 90° intervals), accent-colored center dot, bearing readout in degrees below. Smooth CSS transition on rotation. Visible by default, togglable in Settings.
- **Map Controls** (bottom-right): Vertical button stack with 7 controls:
  - **Zoom In** (+) — `map.zoomIn()` with 300ms animation
  - **Zoom Out** (−) — `map.zoomOut()` with 300ms animation
  - *Divider*
  - **Fullscreen** (expand/collapse icon) — toggles native Fullscreen API on `.tmap-page`. Icon changes between expand/collapse states. Active highlight when fullscreen. Listens to `fullscreenchange` event for external exits (Esc key).
  - *Divider*
  - **Rotate Left** (↺) — rotates bearing -45° with 400ms animation
  - **Reset North** (compass arrow) — resets bearing to 0° with 500ms animation. Active highlight when bearing ≠ 0°.
  - **Rotate Right** (↻) — rotates bearing +45° with 400ms animation
  - All buttons: 32×32px, dark blurred background, border, hover highlight. `MapBtn` component with `active` prop for state highlighting.
- **FPS Counter** (top-right, below minimap): Real-time frames-per-second display using `requestAnimationFrame` loop. Color-coded: green (≥50 FPS), amber (≥30 FPS), red (<30 FPS) with matching dot indicator and tinted background. JetBrains Mono font. **Disabled by default** — enable in Settings. Positioned below minimap when both visible, otherwise top-right corner.
- **Coordinates bar updated**: Now includes bearing (`BRG 0°`) alongside LAT, LNG, Z. Visibility togglable via Settings.

### Changed — Settings Section
- **Settings section** now open by default with 5 toggle switches:
  - **World Minimap** — "Overview map in top-right corner" — default: ON
  - **Compass** — "Bearing indicator in bottom-left" — default: ON
  - **Map Controls** — "Zoom, fullscreen, rotation buttons" — default: ON
  - **Localization** — "Coordinate bar and scale" — default: ON
  - **FPS Counter** — "Frames per second display" — default: OFF
- **Toggle component**: Custom switch with 34×18px track, 14px knob, smooth slide animation, accent color when enabled, label + description text.
- **Removed** built-in MapLibre `NavigationControl` — replaced by custom Map Controls buttons (bottom-right).
- **Map bearing tracking**: Added `map.on('rotate')` listener to update `bearing` state, consumed by Compass widget, Reset North active state, and coordinates bar.
- **Minimap component**: Second MapLibre instance with lifecycle management — creates on mount, updates center/zoom on main map move, removes on unmount.

## 0.8.0 - 2026-03-21

### Added — Tactical Map Module
- **Tactical Map page** (`/map`): Full-screen map interface built on MapLibre GL JS with CARTO Dark basemap tiles. Centered on Zagreb, Croatia (45.8150°N, 15.9819°E) at zoom 13. The map is the application's default landing page (`/` redirects to `/map`).

  **MapLibre GL JS integration:**
  - Loaded dynamically via CDN (`unpkg.com/maplibre-gl@4.7.1`) — no npm dependency required
  - CSS and JS injected in `useEffect` on mount, map initialized after script load
  - CARTO Dark Matter raster tiles (`basemaps.cartocdn.com/dark_all`) for tactical dark aesthetic
  - Built-in controls: NavigationControl (zoom + compass, top-right), ScaleControl (metric, bottom-right), AttributionControl (compact, bottom-right)
  - Cleanup on unmount: `map.remove()` to prevent memory leaks

  **Left sidebar (300px, collapsible on mobile):**
  - **Header**: Tactical Map brand with crosshair icon, recenter button (crosshair icon → flies back to Zagreb)
  - **10 collapsible sections** with icons, chevron toggle, section badges:
    1. **Period** (calendar icon, open by default): Date From / Date To inputs with dark color scheme. Quick presets: 24h, 7d, 30d buttons + Clear. Auto-populates both date fields.
    2. **Subjects** (people icon, open by default): Persons multiselect dropdown (searchable, checkboxes, 15 persons from mock data with nationality sub-text). Selected persons shown as tag chips below dropdown with individual remove buttons. Badge count in section header.
    3. **Sources** (waveform icon): Empty — "No source filters configured."
    4. **Layers** (stack icon): Empty — "No custom layers configured."
    5. **Tiles** (grid icon): Empty — "Tile source selection coming soon."
    6. **Tools** (pencil icon): Empty — "Drawing and measurement tools coming soon."
    7. **Intelligence** (clock icon): Empty — "Intelligence analysis panels coming soon."
    8. **Custom Objects** (pin icon): Empty — "No custom objects placed."
    9. **Saved Places** (marker icon): Empty — "No saved places."
    10. **Settings** (gear icon): Empty — "Map settings coming soon."
  - **SidebarMS component**: Multiselect dropdown optimized for sidebar width — trigger button, searchable panel with checkboxes, Clear button, selected tags below with remove.
  - **Section component**: Collapsible with smooth chevron rotation, optional badge count, hover highlight on header.

  **Map overlays:**
  - **Coordinates bar** (bottom center): LAT, LNG, Z (zoom level) — updates on mouse move and zoom. Mono font, blurred dark background, subtle border.
  - **Loading overlay**: Spinner + "Loading Tactical Map..." / "Initializing MapLibre GL JS" text while map loads.

  **Responsive design:**
  - Desktop: 300px fixed sidebar + flexible map area
  - Mobile (≤768px): Sidebar becomes fixed overlay, slides in from left with box-shadow. Toggle button (hamburger) positioned top-left over map. Backdrop overlay when sidebar open.
  - Full-screen layout: Uses negative margins to negate `ax-app-content` padding (same pattern as `/chat`).

- **Map CSS** (`resources/css/pages/map.css`): Full-height flex layout, sidebar with sections, coordinates overlay, mobile responsive transitions, multiselect panel styles, tag chips, collapsible section animations.

### Routes Changed
- `GET /map` → now renders `Map/Index` (was Dashboard placeholder)

## 0.7.2 - 2026-03-21

### Added — Devices Tab on Person & Organization Show
- **Devices tab on Person Show**: New "Devices" tab (monitor icon) between Vehicles and Connections (tab 7 of 10). Renders `EntityDevices` component filtered to `personId === p.id`. Shows all surveillance devices assigned to that person with full table, search, filters, context menu, actions, delete modal.
- **Devices tab on Organization Show**: Same "Devices" tab (monitor icon) between Vehicles and Connections (tab 7 of 9). Renders `EntityDevices` filtered to `orgId === o.id`.
- **EntityDevices component** (`components/devices/EntityDevices.tsx`): Reusable embedded devices table scoped to a specific person or organization. Full feature parity with `/devices` page:
  - **Empty state**: When no devices assigned — icon, message "No Devices Assigned", entity name, "Assign Device" button → navigates to `/devices/create`.
  - **Header**: Device count + online count, "Assign" button (compact).
  - **Search bar** + collapsible **Filters toggle** button (accent when active, count badge). Filters only show Type and Status multiselect dropdowns (options derived from entity's actual devices — only shows types/statuses that exist). "Clear" link when filters active.
  - **Responsive table** (min-width 650px with horizontal scroll): Columns — Name (clickable → show page), Type (color badge), Status (dot + label), Signal (5-bar indicator + %), Battery (shell graphic or "AC"), Location (truncated), Last Seen (mono timestamp), Actions (3 tooltip buttons: Show/Edit/Delete).
  - **Right-click context menu**: Show Device, Edit Device, Delete Device (red with divider). Click-outside-close.
  - **Delete confirmation modal**: Warning icon, device name bold, Cancel/Delete buttons, toast on confirm.
  - All navigations go to main `/devices/:id` and `/devices/:id/edit` routes.

### Person Show tabs (10 total)
Overview → Contacts → Social → Addresses → Employment → Vehicles → **Devices** → Connections → AI Assistant → Notes

### Organization Show tabs (9 total)
Overview → Contacts → Social → Addresses → Vehicles → **Devices** → Connections → AI Assistant → Notes

## 0.7.1 - 2026-03-21

### Fixed
- **"+ New Device" button**: Replaced large `Button` component with compact styled button — smaller padding (7px 14px), font-size 11px, `flexShrink: 0`, aligned right in header flex row.

### Changed — Devices Index Filters & Table
- **Filter bar redesigned**: Moved into a bordered card with 2 rows of filters + summary row:
  - **Row 1**: Name search (text input), Type (multiselect), Status (multiselect), Signal (multiselect — Excellent/Good/Fair/Weak/None levels)
  - **Row 2**: Location (multiselect — all unique locations), Person (multiselect — all assigned persons), Organization (multiselect — all assigned orgs), Last Seen (date from → date to range pickers)
  - **Summary row**: "X of Y devices · Z filters active" count + "Clear All Filters" button when active
- **All multiselect dropdowns** (MSF component): Searchable, checkboxes with accent color, Clear button (red styled pill), click-outside-close, `min-width: 180px`, `z-index: 80`, shows "(N)" count when active, border highlights accent when selections exist. Empty state "No results" when search yields nothing.
- **Date range filter**: Two date inputs with `colorScheme: dark`, arrow separator, accent border when value set. Filters `lastSeen` inclusive of from/to dates.
- **Table responsive**: `min-width: 900px` on table with horizontal scroll wrapper (`overflowX: auto`, `-webkit-overflow-scrolling: touch`). Sticky header row with `position: sticky; top: 0`.
- **Right-click context menu**: `onContextMenu` on each table row opens a floating menu at cursor position with 3 items:
  - **Show Device** (eye icon) → navigates to `/devices/:id`
  - **Edit Device** (pencil icon) → navigates to `/devices/:id/edit`
  - **Delete Device** (trash icon, red) → opens delete confirmation modal
  - Click-outside-close. Divider before delete. Hover highlights with appropriate colors.
- **Actions column** added as last column (centered header): 3 icon buttons per row with tooltips:
  - **Show Details** (eye icon) — tooltip "Show Details"
  - **Edit Device** (pencil icon) — tooltip "Edit Device"
  - **Delete Device** (trash icon, red) — tooltip "Delete Device"
  - TBtn component: 26×26px, border, hover highlight, danger variant for delete. Tooltip appears above on hover with arrow-less floating label (dark bg, border, 10px font).
- **Delete confirmation modal**: Enhanced with warning icon (red circle + trash), device name in bold, "This action cannot be undone" sub-text, Cancel + Delete Device buttons. Toast "Device deleted" on confirm.
- **Empty state**: Enhanced with "No devices match your filters" message + "Clear Filters" button when filters are active.
- **Row click removed** from entire row (was navigating on any click) — now only Name text is clickable to show details, preventing accidental navigation when using action buttons.

## 0.7.0 - 2026-03-21

### Added — Surveillance Devices Module
- **Devices Index** (`/devices`): Responsive table with 20 mock surveillance devices. Columns: Name (with UUID), Type (color badge), Status (dot + label), Signal (5-bar indicator), Battery (shell graphic + percentage, "AC" for wired), Location, Assigned To (clickable person/org links), Last Seen, Edit button. Search across name/manufacturer/model/serial/assignee. Filter by device type and status dropdowns. Result count. Click row → show detail. KPI summary: total, online, offline, maintenance counts.
- **Devices Create** (`/devices/create`): Full form with 5 sections:
  - **Device Information**: Name (required), Type (required, 5 types), Status, Manufacturer (15 options), Model, Serial Number, Firmware Version
  - **Network & Protocol**: Protocol (12 options), IP Address, MAC Address, Storage Capacity, Encryption toggle
  - **Capabilities** (conditional — cameras/audio only): Resolution, Night Vision checkbox, Motion Detection checkbox
  - **Location**: Location Name, Latitude/Longitude coordinates, Install Date
  - **Assignment** (optional): Person (searchable dropdown, 15 persons), Organization (searchable dropdown, 10 orgs)
  - **Notes**: free-text textarea
- **Devices Edit** (`/devices/:id/edit`): Same form pre-populated from mock device data. Save simulates 1s delay with success toast.
- **Devices Show** (`/devices/:id`): Full device detail page:
  - **Header**: Type emoji icon (📡/🕵️/📹/🔒/🎙️) with color-coded background, device name, type badge, status badge with dot, UUID
  - **Status cards** (4): Signal (5-bar + percentage), Battery (shell graphic + %), Last Seen (timestamp), Installed (date)
  - **Detail grid** (2 columns, responsive): Hardware specs (manufacturer, model, serial, firmware, storage), Network (protocol, IP, MAC, encryption), Capabilities (resolution, night vision, motion detection — conditional), Location (name, coordinates)
  - **Assignment section**: Clickable person/org cards with avatars that navigate to their detail pages
  - **Notes section**: Full-width pre-wrapped text

- **Device types** (5): GPS Tracker (blue 📡), Hidden Camera (red 🕵️), Public Camera (green 📹), Private Camera (amber 🔒), Audio Recorder (purple 🎙️)
- **Device statuses** (5): Online (green), Offline (red), Maintenance (amber), Decommissioned (gray), Standby (cyan)
- **20 mock devices** with realistic data: 5 GPS trackers (vehicles of Horvat, Kovačević, Babić, Hassan, Petrova), 3 hidden cameras (Split hotel, Cairo office, Moscow meeting room), 4 public cameras (Zagreb HQ, street, airport cargo, A1 highway), 4 private cameras (Dubai port, Rashid Holdings parking, ASG server room, Shanghai port), 4 audio recorders (Mendoza car, Al-Rashid residence, Mendoza office, Wei personal). Each with manufacturer/model, serial, firmware, protocol, IP/MAC, coordinates, storage, encryption status, install date, and detailed intel notes.
- **DeviceForm component** (`DeviceForm.tsx`): Shared between Create and Edit. Searchable dropdowns for person/org assignment with "— None —" option. Conditional capabilities section based on device type. Form validation on name + type.
- **Devices CSS** (`devices.css`): Signal bars, battery shell graphic, type badges, status dots, spec cards, detail grid responsive layout, form sections.

### Routes Added
- `GET /devices` → `Devices/Index`
- `GET /devices/create` → `Devices/Create`
- `GET /devices/:id/edit` → `Devices/Edit`
- `GET /devices/:id` → `Devices/Show`

## 0.6.3 - 2026-03-21

### Added — EntityChat: Full Attachment Suite, Export PDF, Print View
- **5 attachment upload buttons** in EntityChat input toolbar (was 2):
  1. **File** (paperclip) — any file type
  2. **Image** (landscape icon) — accepts `image/*` (jpg, png, gif, webp, svg, bmp, tiff)
  3. **Photo** (camera icon) — accepts RAW formats (heic, raw, cr2, nef, arw, dng)
  4. **Audio** (waveform icon) — accepts `audio/*` (mp3, wav, ogg, m4a, flac, aac, wma)
  5. **Video** (camera/film icon) — accepts `video/*` (mp4, avi, mov, mkv, webm, flv, wmv)
  - Each button uses `uploadWithAccept()` helper to set `accept` attribute on hidden file input
  - File type auto-detected from extension with expanded format lists
  - `AttachIcon` component updated with distinct icons for all 5 types including new photo (camera) icon
  - `AttachIcon` now accepts `size` prop for flexible sizing (default 10, pending chips use 8)
- **Export PDF button** in EntityChat header: download icon triggers simulated 1.5s export with spinner animation. Toast "PDF exported" with truncated conversation title filename.
- **Print button** in EntityChat header: printer icon switches to inline print view within the same component (no route navigation needed).
- **Inline print view** renders when `printView` is true:
  - White A4 layout (`chat-print-page` CSS class) with max-width 800px centered
  - Header: ARGUX brand, conversation title, entity name/type, message count, creation date
  - Messages rendered chronologically: role badges (OPERATOR blue / ARGUX AI gray), timestamps, markdown rendering, attachment chips with type-specific emoji (🖼️ image, 📷 photo, 🎬 video, 🎵 audio, 📎 file)
  - Footer: CLASSIFIED // NOFORN + entity context
  - "Back to Chat" button (gray) returns to chat view
  - "Print This Page" button triggers `window.print()` (both hidden via `print-no-print` class)

### Changed
- **EntityChat header** restructured: sidebar toggle + title (flex:1) on left, entity badge + print button + PDF export button on right. All action buttons use consistent `hdrBtn` style with border.
- **Pending file chips**: `AttachIcon` uses `size={8}` for compact display.
- **File type detection**: expanded extension lists — images: +bmp,tiff; photo: +arw,dng; video: +flv,wmv; audio: +aac,wma.

## 0.6.2 - 2026-03-21

### Added
- **AI Assistant tab on Person Show**: New "AI Assistant" tab (9th tab) between Connections and Notes. Contains a full embedded chat interface scoped to the specific person. Conversation sidebar (collapsible, 220px), message area with markdown rendering, file attachments (image/audio/video/file), speech-to-text, typing animation. Pre-initialized with a system message: "AI Assistant context loaded for person: **{Name}**". New conversations auto-title with "{Name} — {first message}". Placeholder shows "Ask about {Name}...".
- **AI Assistant tab on Organization Show**: Same "AI Assistant" tab (8th tab) between Connections and Notes. Full embedded chat scoped to the organization. Context shows "Context: {OrgName} (organization)" in header. Entity type badge shows "ORG".
- **EntityChat component** (`components/chat/EntityChat.tsx`): Reusable chat component accepting `entityName` and `entityType` props. Contains full chat logic extracted from `/chat` page:
  - **Conversation sidebar** (220px, collapsible via toggle button): New conversation button, search filter, conversation list with title/message count/date, delete button (hover-reveal) with confirmation modal.
  - **Message area**: User messages right-aligned (accent blue), assistant messages left-aligned (dark with border). Markdown rendering for AI responses (headings, bold, code, lists, tables). System messages filtered from display. Auto-scroll on new messages. Empty state with entity-specific prompt.
  - **Input area**: Multi-line textarea (Enter to send, Shift+Enter newline), file attachments (paperclip for any file, image icon for images), speech-to-text microphone button with recording state animation, pending file chips with remove button, send button with disabled state.
  - **Speech-to-text**: Web Speech API with continuous recognition, interim results, recording pulse animation. Placeholder changes to "Listening…" when active.
  - **File upload**: Supports image/photo/audio/video/file types with auto-detection from extension. Shows as pending chips above textarea, then as attachment chips on sent messages.
  - **AI responses**: Random responses from mock pool with 1.5–3s delay and typing animation.
  - Fixed height (560px) to fit within the tab content area without affecting page scroll.

## 0.6.1 - 2026-03-21

### Fixed
- **Background broken when writing prompt**: Root cause — `chat-page`, `chat-main`, `chat-messages`, and `chat-input-area` used semi-transparent `rgba()` backgrounds that exposed broken/missing parent background. Fixed by using CSS variable `var(--ax-bg)` for chat-page, chat-main, chat-messages, and `var(--ax-header-bg)` for header and input area. All sections now have solid opaque backgrounds.
- **Persons/Organizations dropdown menu layout broken**: Dropdowns inside the chat header were clipped by the header's `overflow` and low `z-index`. Fixed by: removing implicit overflow, adding `z-index: 20` to `.chat-header`, wrapping selects in `.chat-header-selects` with `z-index: 30`, dropdown panels use `z-index: 100` with absolute positioning and `min-width: 200px` to prevent cramped layout. Header restructured to use `.chat-header-left` (flex, min-width 0) and `.chat-header-actions` (flex-shrink 0) for proper flex behavior.

### Added
- **Speech-to-text**: Microphone button in input toolbar (separated from file buttons by a divider). Uses Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`). Click to start listening — button pulses red with `chatPulse` animation. Continuous recognition with interim results that update the input textarea in real-time. Click again to stop. Toast notification "Listening... Speak into your microphone" on start. Placeholder changes to "Listening… speak now" while recording. Graceful fallback with error toast if browser doesn't support Speech API.
- **Print conversation** (`/chat/:convId/print`): Print icon button in chat header navigates to dedicated print page. Custom white A4 layout with: ARGUX brand header, conversation title, message count, created date, entity tags (person/org). Messages rendered chronologically with role badges (OPERATOR = blue, ARGUX AI = gray), timestamps, markdown rendering in assistant messages, attachment chips. CLASSIFIED // NOFORN footer. "Print This Page" button triggers `window.print()`.
- **Export to PDF**: Download icon button in chat header. Simulated 1.5s export with spinner animation, toast "PDF exported" with filename.
- **Chat CSS print layout classes**: `.chat-print-page`, `.chat-print-header`, `.chat-print-msg`, `.chat-print-msg-role` (user/assistant variants), `.chat-print-msg-content` with markdown table/heading styles, `.chat-print-attach-chip`, `.chat-print-footer`. `@page` rule with A4 margins.

### Changed
- **Header layout restructured**: Split into `.chat-header-left` (title + mobile toggle) and `.chat-header-actions` (entity selects + action buttons). Proper flex behavior prevents overflow. Mobile at 768px stacks vertically.
- **Input toolbar**: Added vertical divider between file upload buttons and microphone. Recording state class `.chat-input-btn.recording` with red color and pulsing box-shadow animation.

### Routes Added
- `GET /chat/:convId/print` → Chat/Print

## 0.6.0 - 2026-03-21

### Added — AI Assistant Chat Module
- **AI Assistant page** (`/chat`): Full-screen ChatGPT-style interface with conversation sidebar, message area, and input bar.
  
  **Conversation Sidebar:**
  - Conversation list with title, message count, date, and entity tag previews (person/org chips)
  - "New Conversation" button creates empty conversation
  - Search filter across conversation titles
  - Delete button (hover-reveal) with confirmation modal
  - Active conversation highlighted with accent border
  - Mobile: slides in from left with overlay backdrop

  **Message Area:**
  - User messages right-aligned with accent background, assistant messages left-aligned with border
  - Avatar icons: user (person silhouette), assistant (clock/analysis icon with gradient)
  - Markdown rendering in assistant messages: `##`/`###` headings, `**bold**`, `` `code` ``, bullet/numbered lists, tables with borders
  - Typing indicator: 3 animated bouncing dots while AI "processes"
  - Auto-scroll to bottom on new messages
  - Empty state: ARGUX AI logo with description prompt
  - Image attachments render as clickable thumbnails (120×80px) with lightbox
  - File/audio/video attachments render as chips with type icon, name, and size

  **Input Area:**
  - Multi-line textarea with Enter to send, Shift+Enter for newline
  - Attachment toolbar: paperclip (any file), image icon (images only), audio waveform (audio only), video camera (video only)
  - Pending files display as removable chips above textarea with type-specific icons
  - Send button disabled during typing animation or when empty
  - Input area border highlights on focus

  **Entity Assignment:**
  - Persons multi-select dropdown (searchable) in chat header — assigns persons to conversation
  - Organizations multi-select dropdown (searchable) in chat header — assigns organizations to conversation
  - Entity tags visible in sidebar conversation items
  - Both populated from connection nodes (15 persons, 10 organizations)

  **Mock AI Responses:**
  - 4 varied response templates: risk assessment, connection analysis, file processing summary, surveillance imagery analysis
  - Simulated 1.5–3s response delay with typing animation
  - Responses include markdown formatting (headings, bold, lists, tables, code)

  **Mock Conversations (5):**
  - "Alpha Security Group — Risk Assessment" — 4 messages, linked to Marko Horvat, Ivan Babić, Alpha Security Group
  - "Mendoza Network — Movement Analysis" — 2 messages with CSV attachment, linked to Carlos Mendoza, Omar Hassan, Mendoza IE, Falcon Trading
  - "Vehicle Registration — LPR Analysis" — 2 messages with image attachment (car_1.jpg), linked to Marko Horvat
  - "Petrova Consulting — Background Check" — 2 messages, linked to Elena Petrova, Petrova Consulting
  - "Gulf Maritime — Vessel Tracking" — 2 messages with Excel + video attachments, linked to Gulf Maritime, Falcon Trading

- **Chat CSS** (`resources/css/pages/chat.css`): Full-height flex layout, sidebar (280px fixed), message bubbles with user/assistant styling, markdown table/heading/code styles, typing animation keyframes, attachment chips/thumbnails, input area with toolbar, entity tags, mobile responsive (sidebar slides in at 768px).

### Routes Changed
- `GET /chat` → now renders `Chat/Index` (was Dashboard placeholder)

## 0.5.3 - 2026-03-21

### Added — Connection CRUD, Graph Interactions, Print Updates
- **Add Connection**: "Add" button in the connections tab toolbar opens a modal form with: Connected Entity (searchable dropdown of all persons + organizations), Connection Type (searchable from 55 types), Relationship (Good/Bad/Neutral/Unknown toggle buttons with color indicators), Strength (1–5 clickable buttons), First Seen / Last Seen (date pickers), Notes (textarea). Saves to local state, rebuilds graph.
- **Edit Connection**: Edit (pencil) button on each connection card opens the same modal pre-populated with existing data. Updates in-place.
- **Delete Connection**: Delete (trash) button on each connection card triggers confirmation modal. Removes from local state and rebuilds graph.
- **Category filters on bubble graph**: Row of filter toggle buttons above the canvas (Family, Personal, Professional, Criminal, Operational, Legal, Unknown). Each with color dot. Toggle on/off filters both the graph and the edge list below. Active filters highlighted with category color border/background.
- **Drag and drop nodes**: Click and drag any node to reposition it within the force simulation. Dragged nodes freeze physics while held. Release resumes simulation. Center entity (larger node) can also be dragged.
- **Zoom controls**: Three button overlay on bottom-right of canvas: + (zoom in 1.2x), − (zoom out 0.8x), FIT (reset to 1x zoom + center pan). Mouse wheel zoom also supported (0.4x–2.5x range). Pan by dragging empty canvas space.
- **Help tooltip**: Top-left canvas overlay showing "Drag nodes · Scroll to zoom · Drag empty to pan".
- **Connection Form Modal** (`ConnectionFormModal`): Full-featured form with searchable selects for entity and connection type, relationship toggle buttons with colored states, strength selector (1–5 numeric buttons), date inputs with dark color scheme, notes textarea. Validates required fields (entity + type).
- **Connections section in Person Print**: Table with columns: Connected Entity (name + type), Type, Category, Relationship, Strength (dots), Period, Notes. Rendered from `allEdges` filtered to `p-{id}`.
- **Connections section in Organization Print**: Same table layout filtered to `o-{id}`.

### Changed
- **ConnectionsBubble component** fully rebuilt: Uses refs for all filter/edge state to prevent blank screen on state changes. Single `useEffect` with `[]` dependency. Graph canvas now supports: drag-and-drop (nodes), panning (empty space), zoom (wheel + buttons), category filtering (toolbar), CRUD (add/edit/delete modals). Edge list cards now include Edit and Delete action buttons alongside type and relationship badges.
- Canvas height increased from 340px to 360px for better visibility.

## 0.5.2 - 2026-03-21

### Added
- **Profile photo lightbox on Person Show**: Clicking the avatar in the header opens a full-screen lightbox overlay (uses shared `veh-lightbox` CSS classes). Close button in top-right. Only appears when person has an avatar. Avatar has hover scale effect (1.05x) and pointer cursor when photo exists.
- **Logo lightbox on Organization Show**: Same lightbox behavior for organization logos. Clicking logo opens full-screen view. Hover scale effect and pointer cursor.
- **Connections tab on Person Show**: New tab (network icon) between Vehicles and Notes. Renders `ConnectionsBubble` component scoped to `p-{id}`. Shows force-directed mini graph (340px height) of the person's direct connections with interactive canvas, plus a scrollable list of all connections below with type badge, relationship badge, strength dots, date range, notes, and click-to-navigate to connected entity.
- **Connections tab on Organization Show**: Same tab and `ConnectionsBubble` component scoped to `o-{id}`. Shows organization's direct connections graph and list.
- **Relationship field** added to `ConnectionEdge` interface: `relationship: Relationship` where `Relationship = 'Good' | 'Bad' | 'Neutral' | 'Unknown'`.
- **Relationship colors**: Good = green `#22c55e`, Bad = red `#ef4444`, Neutral = amber `#f59e0b`, Unknown = gray `#6b7280`.
- **Relationship display** across all connection views:
  - **ConnectionsBubble** (person/org show pages): Colored relationship dot at edge midpoints. Hover shows both connection type and relationship labels. Edge list cards show relationship badge next to type badge.
  - **Connections Index** (`/connections`): Colored relationship dot at edge midpoints on canvas. Hover shows type + relationship labels. Info panel edge items show dual badges (type + relationship) side by side.
- **ConnectionsBubble component** (`components/connections/ConnectionsBubble.tsx`): Reusable mini force-directed graph scoped to a single entity. 340px canvas with physics simulation, hover effects, click-to-navigate to connected entities, relationship dots on edges. Below canvas: full edge list with avatars, type/relationship badges, strength, dates, notes. All cards clickable.
- **35 edges updated** with realistic relationship values: Business partners → Good, Employees → Neutral, Lovers → Good, Criminal connections → mixed (Co-conspirators → Good, Financiers → Bad, Associates → Bad), Family → Good, Classmates/Friends → Good/Neutral, Operational → Unknown, Legal → Neutral.

## 0.5.1 - 2026-03-21

### Fixed
- **Blank screen on node click** in Connections Graph: Root cause was the `useEffect` depending on `[focusedId, search, activeCategories]`, causing full canvas teardown/rebuild on every click. Rewrote to use refs (`focusedRef`, `filterPersonsRef`, `filterOrgsRef`, `activeCatsRef`, `hoveredRef`) for all filter state, with the draw loop reading from refs. The `useEffect` now runs once with empty dependency array `[]`. Node rebuilds triggered via `setTimeout(rebuildNodes, 10)` after state changes. No more flicker or blank screen.

### Changed
- **Replaced search input** with two multi-select dropdowns: Persons (searchable, multi-select from 15 persons) and Organizations (searchable, multi-select from 10 organizations). Selecting entities filters the graph to show only those entities and their direct connections. Both can be used simultaneously.
- **Left-click on node** now properly isolates that entity's connections without blank screen. Click again or click "Show All Connections" to reset.

### Added
- **Right-click context menu** on person/organization nodes: Shows entity name header + "View Profile" button. Navigates to `/persons/:id` or `/organizations/:id`. Menu auto-positions to stay within viewport bounds.
- **Mock profile photos** updated for 5 persons (Marko Horvat, Ana Kovačević, Ahmed Al-Rashid, Elena Petrova, Omar Hassan) with provided photo URL. Info panel shows avatar in header when available.
- **Mock company logos** updated for 4 organizations (Alpha Security Group, Rashid Holdings International, Dragon Tech Solutions, Falcon Trading LLC) with provided logo URL.

## 0.5.0 - 2026-03-21

### Added — Connections Graph Module
- **Connections Graph page** (`/connections`): Full-screen interactive force-directed graph showing relationships between persons and organizations.
  - **Canvas-based rendering** at 60fps with device pixel ratio support for crisp rendering on retina displays.
  - **Force simulation**: Repulsion between nodes, attraction along edges (strength-weighted), center gravity. Continuous physics with velocity damping.
  - **Node types**: Person bubbles (24px radius, dark blue fill) and Organization bubbles (30px radius, slightly lighter). Initials rendered inside. Risk-colored borders (Critical=red, High=orange, etc.). Labels + type badge below each node.
  - **Edge rendering**: Color-coded by connection category. Line thickness based on strength (1–5). Hover highlights connected edges and shows type labels at midpoint. Non-connected edges fade to near-invisible.
  - **Click-to-isolate**: Clicking a node filters the graph to show only that entity and its direct connections. "Show All Connections" reset button appears. Clicking again deselects.
  - **Hover effects**: Node glow ring, edge highlighting, non-connected nodes fade to 20% opacity. Cursor changes to pointer over nodes.
  - **Pan and zoom**: Mouse drag to pan the canvas. Scroll wheel to zoom (0.3x–3x). Zoom centers on mouse position.
  - **Drag nodes**: Click and drag individual nodes to reposition them within the force simulation.
  - **Search**: Text search filters graph to matching entities and their connections. Live filtering as you type.
  - **Category filters**: Toggle visibility by connection category (Family, Personal, Professional, Criminal, Operational, Legal, Unknown). Each with colored dot indicator. Toolbar buttons with active state.
  - **Info panel**: Right-side panel appears on node click showing: entity name, type, nationality/industry, risk badge, "View Profile" link (navigates to `/persons/:id` or `/organizations/:id`), all connections listed with type badge, strength dots (●○), date range, and notes. Click connection names to navigate to that entity.
  - **Legend**: Bottom-left overlay showing active category colors with type counts, plus Person/Organization node indicators.
  - **Stats bar**: Bottom-right showing Nodes count, Edges count, Zoom percentage.

- **Mock connections data** (`resources/js/mock/connections.ts`):
  - **55 connection types** across 7 categories:
    - **Family** (23): Mother, Father, Son, Daughter, Brother, Sister, Uncle, Aunt, Cousin, Nephew, Niece, Grandfather, Grandmother, Godfather, Godmother, Step-Father, Step-Mother, Step-Brother, Step-Sister, In-Law, Guardian, Spouse, Ex-Spouse
    - **Personal** (9): Friend, Best Friend, Acquaintance, Lover, Ex-Lover, Neighbor, Roommate, Classmate, Military Comrade
    - **Professional** (11): Employee, Employer, Business Partner, Business Associate, Investor, Client, Supplier, Contractor, Consultant, Mentor, Protégé
    - **Criminal** (10): Co-Conspirator, Handler, Asset, Informant, Accomplice, Suspect, Associate, Cell Member, Recruiter, Financier
    - **Operational** (7): Co-location, Communication, Financial Transaction, Travel Companion, Shared Vehicle, Shared Property, Shared Device
    - **Legal** (4): Legal Representative, Witness, Defendant, Plaintiff
    - **Unknown** (1): Unknown
  - **35 connection edges** with realistic intelligence data: strength (1–5), notes, first/last seen dates. Covers Alpha Security Group network, Rashid Holdings network, Mendoza network, Petrova/Dragon Tech connections, family relations, co-locations, financial transactions, military comrade links, legal representation.
  - **25 nodes** derived from existing persons (15) and organizations (10) mock data.
  - Category-to-color mapping: Family=amber, Personal=green, Professional=blue, Criminal=red, Operational=purple, Legal=cyan, Unknown=gray.

- **Connections CSS** (`resources/css/pages/connections.css`): Full-height layout, toolbar with filter buttons, canvas wrapper, info panel with glassmorphism, legend overlay, stats bar, reset button. Responsive at 768px and 480px.

### Routes Changed
- `GET /connections` → now renders `Connections/Index` (was Dashboard placeholder)

## 0.4.3 - 2026-03-21

### Added
- **Comprehensive README.md**: Full project overview with tech stack table, implemented features summary, complete route map (21 implemented + 18 planned), project structure tree, documentation index, theming table, mock data summary. Version badges.
- **13 documentation files** in `docs/`:
  - `INSTALLATION.md` — Prerequisites, step-by-step setup, troubleshooting table
  - `ARCHITECTURE.md` — Design principles, data flow diagram, folder structure, state management table, CSS architecture
  - `AUTH.md` — All 4 auth flows documented, mock credentials, session info, Keycloak notes
  - `API.md` — Response format contracts (list/action/error), current endpoints, planned mock API routes
  - `BUILD.md` — Vite config, CSS pipeline (6 import layers), TypeScript setup, asset locations
  - `DATABASE.md` — Mock data strategy, all interfaces listed, reference arrays with counts, color maps, cross-reference documentation
  - `ENVIRONMENT.md` — All env variables with defaults, explicitly lists variables NOT needed
  - `DEPLOYMENT.md` — Production build steps, Nginx config, air-gap deployment notes, classification requirements
  - `DOCKER.md` — docker-compose.yml, Dockerfile, multi-stage production build, Kubernetes notes
  - `GIT.md` — Branch strategy, Conventional Commits with type table, tagging process, PR template
  - `QUEUE.md` — Mock job pattern with code example, simulated operations table, production Kafka target
  - `RELEASE.md` — Semver rules, release checklist, version file locations table
  - `CHANGELOG.md` — Symlink to root CHANGELOG.md

### Changed
- **Vehicle Show page** (`/vehicles/:id`): Replaced hero photo layout with gallery grid using the shared `VehiclePhotos` component. Photos now display as a grid of clickable cards with hover overlay (view/expand), consistent with the Create/Edit photo gallery style. Lightbox with prev/next navigation handled by the component internally. Section header shows photo count. Empty state for vehicles without photos.

## 0.4.2 - 2026-03-21

### Added
- **Vehicle photos** across all vehicle pages:
  - **Vehicle interface**: New `photos: string[]` field added to Vehicle interface.
  - **Mock data**: Car mockup images (`car_1.jpg`, `car_2.jpeg`) assigned to 9 of 18 vehicles. Critical/High risk vehicles tend to have photos.
  - **Show page**: Photo hero section with main image (260px height, hover zoom), thumbnail strip with active state border, full-screen lightbox with prev/next navigation and counter badge. Badge shows "2 PHOTOS" overlay.
  - **Create page**: Vehicle Photos section with editable `VehiclePhotos` component — drag/upload zone, photo gallery grid, delete buttons on hover.
  - **Edit page**: Same editable `VehiclePhotos` component with pre-loaded photos from mock data. Upload and delete functionality.
  - **Index page**: 32x24px photo thumbnail column added to datatable. Shows first photo or a car icon placeholder for vehicles without photos.
- **VehiclePhotos component** (`components/vehicles/VehiclePhotos.tsx`): Reusable gallery with lightbox (prev/next navigation, close button, counter), photo grid with hover overlay (view + delete buttons), upload zone with file picker (multi-file, accepts images). Supports `editable` prop to toggle upload/delete. Toast notifications on upload and delete.
- **Vehicle photos CSS** (`resources/css/pages/vehicles.css`): Photo grid, photo card with aspect-ratio 4/3, hover overlay with action buttons, upload zone with dashed border, lightbox with blur close/nav buttons, hero image with zoom, thumbnail strip, responsive breakpoints.
- **Status dropdown filter** added to Vehicles Index advanced filters (multi-select with Active/Inactive/Deleted/Suspended/Under Review).
- **Status dropdown** added to Vehicle Create form (in Registration section alongside Plate and VIN).

## 0.4.1 - 2026-03-21

### Added
- **Vehicle Edit page** (`/vehicles/:id/edit`): Pre-populated sectioned form with Registration (plate uppercase + VIN + Status dropdown), Ownership (Person searchable + Organization searchable), Vehicle Details (Type/Make/Model/Year/Color/Risk), Notes textarea. Not-found state for invalid IDs. Shows vehicle plate and make/model in header.
- **Vehicle Show page** (`/vehicles/:id`): Two-column responsive layout. Left column: Vehicle Information field grid (plate, VIN, make, model, year, type, color, UUID all displayed), Intelligence Notes card, Record Timestamps. Right column: Ownership section with clickable Person card (navigates to `/persons/:id`) and Organization card (navigates to `/organizations/:id`) with hover effects and arrow icons, Color Profile section with 60px color swatch rendering the actual color hex. Header: plate in styled badge box, make/model/year title, color dot + type subtitle, status + risk badges, Back/Export PDF/Edit buttons.
- **Vehicles tab on Person Show page**: New "Vehicles" tab (car icon) between Employment and Notes. Lists all vehicles where `personId` matches. Each vehicle card shows: plate in styled monospace badge, make + model, type/year/color (with color dot swatch), status + risk badges, organization name if linked, notes. Cards are clickable → navigates to `/vehicles/:id`. Count shown in tab title.
- **Vehicles tab on Organization Show page**: New "Vehicles" tab (car icon) between Addresses and Notes. Lists all vehicles where `orgId` matches. Same card layout as Person Show vehicles tab, but shows person name instead. Cards clickable to vehicle detail page.

### Changed
- Vehicle routes updated to render proper Edit and Show pages (were previously placeholders pointing to Create).

## 0.4.0 - 2026-03-21

### Added — Vehicles Module
- **Vehicles List** (`/vehicles`): Responsive datatable with columns: Registration Plate (bold monospace), Owner (Person name + Organization name stacked), Type, Color (with color dot swatch), Make + Model, Year, Status badge, Risk badge, Actions (Edit/View/Delete with tooltips). Skeleton loader. Right-click context menu. Mobile card layout at 860px breakpoint. Pagination (10/page). Column sorting on Plate, Type, Make, Year, Risk.
- **Advanced Search Filters**: Plate (text input); Person (multi-select, populated from persons list), Organization (multi-select, populated from organizations list), Type (multi-select, 20 vehicle types), Make (multi-select, 33 makes), Color (multi-select, 20 colors with visual swatches in table), Year (multi-select, 2026–1997), Risk (multi-select, 5 levels). Filter counter badge. "Clear all" button.
- **Create Vehicle** (`/vehicles/create`): Sectioned form layout with Registration (plate input with uppercase transform + VIN), Ownership (Person searchable dropdown + Organization searchable dropdown), Vehicle Details (Type, Make, Model, Year, Color — all searchable; Risk dropdown), Notes textarea.
- **Mock data** (`resources/js/mock/vehicles.ts`): 18 vehicles with realistic data across 10 countries. Includes armored vehicles, motorcycles, boats, EVs. Cross-references existing persons and organizations by ID. Reference arrays: 20 vehicle types (Sedan to Commercial), 33 makes (Audi to Volvo), 20 colors (Black to Gunmetal with RGB mapping for dot swatches), 30 years. Color dot component maps color names to hex values.
- **Vehicle types**: Sedan, SUV, Truck, Van, Motorcycle, Sports Car, Pickup, Hatchback, Coupe, Convertible, Minivan, Bus, Armored Vehicle, Boat, Helicopter, Aircraft, ATV, Electric Vehicle, Luxury Vehicle, Commercial Vehicle.
- Delete confirmation modal with vehicle plate in message.

### Routes Added
- `GET /vehicles` → Vehicles/Index
- `GET /vehicles/create` → Vehicles/Create
- `GET /vehicles/:id/edit` → Vehicles/Create (placeholder)
- `GET /vehicles/:id` → Vehicles/Create (placeholder)

## 0.3.2 - 2026-03-21

### Added
- **Generate Summary button** on Person Show page: Blue accent button in the AI Summary header bar. Clicking triggers a 2-second loading animation (shimmer skeleton lines), then regenerates the summary text with an appended re-analysis timestamp and randomized confidence percentage (85–99%). Shows toast on completion. Button shows spinner icon and "Generating..." text while loading, disabled during generation.
- **Generate Summary button** on Organization Show page: Same behavior — loading skeleton, regenerated text with confidence score, toast notification, disabled state during generation.

### Changed
- **Employment tab layout** in Person Create/Edit: Start Date and End Date fields moved to a separate row below Title and Company (was previously all in one grid). New row also includes Country (searchable dropdown with 120+ countries) and City (text input) as separate fields, replacing the single "Location" text input.
- **PersonEmployment interface** updated: `location: string` field replaced with `city: string` and `country: string` fields.
- **Mock employment data** updated: All 8 employment records across 4 persons now use separate `city` and `country` fields instead of combined `location` string.
- **Person Show employment display**: Location line now renders `city, country` from separate fields (joined with comma, filtered for empty values).
- **Person Print employment table**: Updated columns from "Location" to separate "City" and "Country" columns.

## 0.3.1 - 2026-03-21

### Added
- **Employment tab** for Person Create/Edit forms: 6th vertical tab with fields: Job Title (text), Company (searchable dropdown populated from organizations list), Start Date (month picker), End Date (month picker, empty = "Present"), Location (text), Notes (text). Supports multiple employment entries with add/remove.
- **Employment tab** on Person Show page: Displays employment history with title, company name (accent color), location with map pin icon, date range (monospace), "Current" badge for ongoing positions, notes section with border separator.
- **Employment data** in mock persons: 4 persons with realistic employment histories — Marko Horvat (Intelligence Officer at Alpha Security Group + Military Analyst at Croatian Armed Forces), Ahmed Al-Rashid (CEO at Rashid Holdings + Investment Director at Saudi Investment Bank), Omar Hassan (Managing Director at Falcon Trading + Trade Consultant at Egyptian Ministry), Ivan Babić (Security Director at Alpha Security + Police Inspector at Croatian Police).
- **Employment section** in Person Print page: Table with Title, Company, Location, Period, Notes columns.
- **Organization Print page** (`/organizations/:id/print`): Standalone A4 white-background page with ARGUX header, intelligence summary, company information grid, websites table, linked persons table, emails table, phones table, social media table, addresses table, intelligence notes, CLASSIFIED footer. Uses shared `print-*` CSS classes. "Print This Page" button triggers `window.print()`.
- **Print button** on Organization Show page: Navigates to `/organizations/:id/print`. Positioned between Back and Export PDF buttons.
- `PersonEmployment` interface exported from `mock/persons.ts`.

### Routes Added
- `GET /organizations/:id/print` → Organizations/Print

## 0.3.0 - 2026-03-21

### Added — Organizations Module
- **Organizations List** (`/organizations`): Sortable datatable with columns: UUID (click-to-copy), Company Logo, Company Name, Country, CEO, Industry, VAT (truncated), Website (first URL), Risk badge, Actions (Edit/View/Delete with tooltips). Skeleton loader on initial load. Right-click context menu. Responsive mobile card layout at 860px breakpoint. Pagination (10/page).
- **Advanced Search Filters**: UUID, Company Name, CEO (text inputs); Country (multi-select, 120+ countries), Industry (multi-select, 41 industries), Risk (multi-select, 5 levels), Website (multi-select, dynamic from data). Filter counter badge shows active count.
- **Create Organization** (`/organizations/create`): 5-tab form with vertical left tabs (horizontal on mobile):
  - **Basic Info**: Company logo upload, Company Name, VAT, Tax Number, Industry (searchable, 41 options), Risk level, CEO (searchable dropdown from persons list), Owner (searchable from persons list), multiple Websites (add/remove).
  - **Contacts**: Multiple emails (email, type, status, notes), Multiple phones (number, type, status, notes).
  - **Social Media**: Facebook, LinkedIn, Instagram, TikTok, Snapchat, YouTube — each supports multiple profile URLs.
  - **Addresses**: Multiple addresses (street, number, zip, city, country searchable, notes).
  - **Notes**: Add/edit/delete notes with confirmation modal for deletion.
- **Edit Organization** (`/organizations/:id/edit`): Same form pre-populated from mock data.
- **Show Organization** (`/organizations/:id`): Header card with logo, name, industry, country, CEO, risk badge. Vertical tabs: Overview (AI summary, company info fields, websites list, linked persons with click-to-navigate to person detail), Contacts (emails/phones with type/status badges), Social Media, Addresses, Notes. Export PDF button (simulated).
- **Mock data** (`resources/js/mock/organizations.ts`): 10 organizations across 8 countries/10 industries. Each with realistic data: Alpha Security Group (Croatia, Cybersecurity, Critical), Rashid Holdings (Saudi Arabia, Private Equity, Critical), Meridian Logistics (Germany, Low), Dragon Tech (China, IT, Medium), Falcon Trading (Egypt, High), Mendoza Import-Export (Colombia, Critical), Mitchell & Partners (UK, Legal, No Risk), Petrova Consulting (Russia, Medium), Gulf Maritime (UAE, High), Sharma Pharma (India, Low). Industries array: 41 options. Linked persons reference existing person mock data by ID.

### Routes Added
- `GET /organizations` → Organizations/Index
- `GET /organizations/create` → Organizations/Create
- `GET /organizations/:id/edit` → Organizations/Edit
- `GET /organizations/:id` → Organizations/Show

## 0.2.5 - 2026-03-21

### Added
- **7 custom error pages** with animated particle backgrounds, tactical styling, and full responsiveness:
  - **404 Not Found** — Blue particles, search-minus icon, "Target Not Found / SIGNAL LOST — LOCATION UNKNOWN"
  - **403 Forbidden** — Amber particles, lock icon, "Access Denied / AUTHORIZATION REQUIRED — CLEARANCE INSUFFICIENT"
  - **500 Internal Server Error** — Red particles with glitch effect, warning triangle, "System Malfunction / CRITICAL FAILURE — ALL SYSTEMS COMPROMISED"
  - **503 Service Unavailable** — Purple particles, gear icon, "System Maintenance / SCHEDULED DOWNTIME — SYSTEMS UPGRADING"
  - **419 Session Expired** — Orange particles, clock icon, "Session Expired / AUTHENTICATION TOKEN INVALIDATED"
  - **429 Too Many Requests** — Yellow particles, lightning icon, "Rate Limit Exceeded / REQUEST THROTTLED — COOLING DOWN"
  - **408 Request Timeout** — Cyan particles, wifi-off icon, "Connection Timeout / SIGNAL INTERRUPTED — NO RESPONSE FROM TARGET"
- **ErrorParticles component** (`components/auth/ErrorParticles.tsx`) — Configurable particle canvas with: custom accent/secondary color, glitch effect toggle, grid lines, pulsing warning rings, mouse-repulsion physics, scan line, connection lines between particles.
- **ErrorPage layout** (`pages/Errors/ErrorPage.tsx`) — Shared error page template with: animated error code digits (staggered fade-in with blur), pulsing icon container, tactical status bar (error code, live clock, version, classification), configurable action buttons (primary/secondary with navigation), ARGUX logo.
- **Error preview routes** (`/errors/403`, `/errors/404`, etc.) for development testing.
- **Exception handler** in `bootstrap/app.php` — maps HTTP status codes 403/404/408/419/429/500/503 to their Inertia error pages automatically. Falls back to default response for JSON/API requests.
- **Error pages CSS** (`resources/css/pages/errors.css`) — Full-screen layout, animated digit entry, icon pulse keyframes, dot blink animation, responsive breakpoints at 640px and 400px (code shrinks, buttons stack vertically).

### Routes Added
- `GET /errors/403` → Errors/403 (preview)
- `GET /errors/404` → Errors/404 (preview)
- `GET /errors/408` → Errors/408 (preview)
- `GET /errors/419` → Errors/419 (preview)
- `GET /errors/429` → Errors/429 (preview)
- `GET /errors/500` → Errors/500 (preview)
- `GET /errors/503` → Errors/503 (preview)

## 0.2.4 - 2026-03-21

### Changed — CSS Architecture Refactor
Extracted all CSS into a modular file structure. Replaced monolithic inline `<style>` blocks and inline styles with reusable CSS classes backed by CSS custom properties.

**New CSS file structure:**
```
resources/css/
├── app.css              ← Import hub (loads all modules)
├── variables.css        ← CSS custom properties / theme tokens
├── base.css             ← Reset, animations, utility classes
├── components.css       ← Buttons, inputs, badges, modals, dropdowns, toggles, cards, tooltips, context menus, search bars, toasts, section headers
├── layout.css           ← App shell, sidebar, header, vertical tabs, horizontal tabs, responsive breakpoints
└── pages/
    ├── auth.css         ← Login, register, 2FA, forgot password
    ├── persons.css      ← Table, mobile cards, filters, avatar, header card, AI summary, education, field display
    ├── profile.css      ← Audit logs, settings themes/fonts, security toggles, sessions, stat cards, date range, multiselect
    ├── notifications.css← Notification items, tabs, footer
    └── print.css        ← A4 print layout, tables, badges, notes, header/footer, @page rules
```

**Key CSS classes introduced:**
- Layout: `.ax-app-shell`, `.ax-app-main`, `.ax-app-content`, `.ax-sidebar`, `.ax-header`, `.ax-vtabs`, `.ax-htabs`
- Components: `.ax-btn`, `.ax-btn-primary`, `.ax-btn-secondary`, `.ax-btn-danger`, `.ax-btn-sm`, `.ax-btn-icon`, `.ax-input`, `.ax-input-bare`, `.ax-select`, `.ax-textarea`, `.ax-card`, `.ax-badge`, `.ax-skeleton`, `.ax-overlay`, `.ax-modal`, `.ax-dropdown`, `.ax-checkbox`, `.ax-tooltip`, `.ax-context-menu`, `.ax-search-bar`, `.ax-toast`, `.ax-add-btn`, `.ax-remove-btn`, `.ax-empty`, `.ax-section-title`
- Utilities: `.ax-flex`, `.ax-grid-auto`, `.ax-truncate`, `.ax-mono`, `.ax-fade-in`, `.ax-hide-mobile`, `.ax-hide-desktop`, `.ax-gap-*`, `.ax-mb-*`, `.ax-text-*`, `.ax-color-*`
- Persons: `.persons-table`, `.persons-table-cols`, `.persons-table-row`, `.persons-mobile-cards`, `.persons-filters`, `.person-header-card`, `.person-ai-summary`, `.person-edu-card`, `.person-field`
- Profile: `.audit-table`, `.audit-row`, `.settings-theme-grid`, `.session-card`, `.stat-card`, `.multiselect-trigger`
- Print: `.print-page`, `.print-header`, `.print-section`, `.print-table`, `.print-note`, `.print-footer`, `.print-badge`, `.print-summary`

**AppLayout changes:**
- Removed inline `<style>` block with reset/animations/scrollbar (now in `base.css`)
- Kept only dynamic `:root` CSS variable injection for active theme
- Shell uses `.ax-app-shell`, `.ax-app-main`, `.ax-app-content` classes

**Print page rebuilt** to use `.print-*` CSS classes instead of all-inline styles.

## 0.2.3 - 2026-03-21

### Added
- **Education section** in Create/Edit person Basic Info tab: School/College name, Website URL, Country (searchable dropdown, 120+ countries), Degree (searchable dropdown, 33 options from High School to PhD/Military/Police Academy), Start Year, End Year. Supports multiple education entries with add/remove.
- **Education data** in mock persons: 5 persons populated with realistic education (University of Zagreb, Croatian Military Academy, King Saud University, Cairo University, Police Academy Zagreb).
- `PersonEducation` interface and `degrees` array (33 degree types) exported from mock data.
- **AI Intelligence Summary** on Show person Overview tab — auto-generated paragraph covering age, nationality, risk assessment, languages, contacts, addresses, education, notes, and connection warnings. Styled with gradient background and AI icon/timestamp header.
- **Education section** on Show person Overview tab — displays school, degree, year range, country, and website in structured cards.
- **Print page** (`/persons/:id/print`) — standalone white-background, A4-optimized page with all person data organized in clean tables. Includes: ARGUX header with classification, AI summary, personal info grid, languages table, education table, emails table, phones table (with messenger app abbreviations), social media table, addresses table, intelligence notes. "Print This Page" button triggers `window.print()`. Footer with CLASSIFIED // NOFORN classification. CSS `@page` rules for A4 margins. `pageBreakInside: avoid` on sections and notes.
- **UUID filter** in advanced search panel — text input field for filtering by UUID.
- **Filter counter badge** — shows exact number of active filters (e.g., "3") instead of generic "!" indicator. Counts each text filter and each multi-select with selections separately.
- **Gender multi-select** — changed Gender filter from single dropdown to multi-select component (can select Male + Female, Male + Other, etc.).

### Routes Added
- `GET /persons/:id/print` → Persons/Print

### Changed
- Show person Print button now navigates to dedicated print page (`/persons/:id/print`) instead of calling `window.print()` on the current page.
- Filter counter properly counts: 8 text fields (name, nickname, email, phone, uuid, tax, dob-from, dob-to) + 7 multi-selects (gender, nationality, country, language, risk, status, religion).

## 0.2.2 - 2026-03-20

### Added
- **Right-click context menu** on person table rows with 3 items: View details (accent), Edit person (gray), Delete person (red with divider). Menu auto-positions to stay on screen. Closes on click/scroll outside.
- **UUID click-to-copy** — clicking the UUID cell in the table copies the full UUID to clipboard and shows a toast confirmation. Styled with dotted underline and copy cursor.
- **Mobile card layout** for persons list — on screens below 860px, the table is replaced with stacked cards showing avatar, name, nickname, nationality, gender, DOB, email, phone, country, UUID, status/risk badges, and Edit/View/Delete buttons.
- **Note delete confirmation modal** in Create and Edit person forms — deleting a note now opens a confirmation dialog instead of deleting immediately.
- **Print button** on Show person page — triggers `window.print()` with CSS print styles that show only the content area and hide navigation/buttons.
- **Export PDF button** on Show person page — simulated 1.5s export with loading spinner and success toast showing generated filename.

### Changed
- Persons list responsive design: search bar and filter button wrap properly on small screens. Filters grid uses `minWidth: 160px` columns. Pagination wraps.
- Create/Edit person responsive design: vertical tabs collapse to horizontal scrollable tabs below 768px. Form layout switches from side-by-side to stacked via `flex-direction: column`. Social media URL inputs use `minWidth: 0` to prevent overflow.
- Show person responsive design: vertical tabs collapse to horizontal below 768px. Header card avatar/info/buttons stack vertically on mobile. Field grid uses `minWidth: 170px` for auto-fill. All text uses `word-break: break-all` for long UUIDs/URLs.

## 0.2.1 - 2026-03-20

### Added
- Skeleton loader for persons table (8 shimmer rows with avatar, name, and column placeholders).
- Delete confirmation modal with warning icon, person name in message, Cancel/Delete buttons.
- Tooltip component for action buttons (Edit person, View details, Delete person).
- Persons table columns expanded: UUID (truncated), Avatar, Name+gender+DOB, Nickname, Nationality, Country, Email, Phone, Tax Number, Status (Active/Inactive/Deleted/Suspended/Under Review), Risk, Actions.
- Advanced filter fields expanded: Name, Nickname, Email, Phone, Tax Number, Gender, DOB from/to, Nationality (multi-select), Country (multi-select), Language (multi-select), Risk (multi-select), Status (multi-select), Religion (multi-select, 28 religions).
- Vertical left sidebar tabs for Create, Edit, and Show person pages (collapses to horizontal tabs on mobile).
- Person form — Basic Info tab: added Status dropdown, Maiden Name field, Languages section (multiple languages with searchable language dropdown, level dropdown: Native/Fluent/Advanced/Intermediate/Basic/Beginner, notes per language), Religion searchable dropdown (28 options).
- Person form — Contacts tab: added Type dropdown for emails and phones (Private/Business/Secret/Undercover/Government/Temporary), Status dropdown (Active/Inactive/Deleted).
- Person form — Addresses tab: Country field replaced with searchable select dropdown (120+ countries).
- Mock data expanded: Person interface includes uuid, status, maidenName, religion, languages[], contact types/statuses. All 15 persons updated with new fields.

### Changed
- Persons table is now horizontally scrollable on small screens with `minWidth: 900px` inner container.
- Persons table rows are sortable by UUID, Name, Nationality, Country, Status, Risk.
- Show person page now uses vertical left tabs matching the form layout, with status badge alongside risk badge in header.

## 0.2.0 - 2026-03-20

### Added
- Persons module — full CRUD with 15 mock person records featuring realistic intelligence data.
- **Persons List** (`/persons`): Sortable datatable with columns: Avatar, Name (with gender/DOB subtitle), Nickname, Nationality, Email, Phone, Language, Risk (color-coded badge), Actions (Edit/View/Delete). Pagination with page size 10. Column sorting on Name, Nationality, Risk. Responsive table hides columns on smaller screens.
- **Advanced Search Filters**: Collapsible filter panel with: Name, Nickname (text inputs), Email, Phone (text), Gender (dropdown), DOB range (date from/to), Nationality (multi-select with search, 120+ options), Country (multi-select, 120+ options), Language (multi-select, 60+ options), Risk Level (multi-select: No Risk/Low/Medium/High/Critical). All filters combine with AND logic. "Clear all filters" reset button.
- **Create Person** (`/persons/create`): 5-tab form — Basic Info (avatar upload, name fields, DOB calendar, gender, nationality searchable dropdown, risk selector, tax number), Contacts (dynamic email list with notes, dynamic phone list with notes + messenger checkboxes for WhatsApp/WeChat/Telegram/Signal/Viber), Social Media (Facebook/LinkedIn/Instagram/TikTok/Snapchat/YouTube — each supports multiple profile URLs), Addresses (multiple addresses with street/number/zip/city/country/notes), Notes (add/edit/delete text notes with timestamps).
- **Edit Person** (`/persons/:id/edit`): Same 5-tab form pre-populated with existing person data. Loads from mock data by ID.
- **Show Person** (`/persons/:id`): Read-only detail page with header card (avatar, full name, nickname, nationality, gender, DOB, risk badge), 5 tabs: Overview (all personal fields), Contacts (emails with note badges, phones with messenger badges), Social Media (grouped by platform), Addresses (formatted cards), Notes (timestamped cards).
- Mock persons data file (`resources/js/mock/persons.ts`) with 15 diverse records, reference arrays for 120+ nationalities, 120+ countries, 60+ languages, risk levels, shared TypeScript interfaces.
- Shared `PersonForm` component used by both Create and Edit pages.

### Routes Added
- `GET /persons` → Persons/Index
- `GET /persons/create` → Persons/Create
- `GET /persons/:id` → Persons/Show
- `GET /persons/:id/edit` → Persons/Edit

## 0.1.6 - 2026-03-20

### Changed
- Audit Logs date filter: replaced single-date dropdown with date range picker (from/to) using native date inputs. Filters entries between selected dates inclusively.
- Audit Logs action filter: replaced single-select dropdown with multi-select component. Supports selecting multiple actions simultaneously with checkboxes, search within options, selected count badge, and bulk clear.
- Audit Logs IP filter: same multi-select upgrade with searchable checkbox list, count badge, and clear functionality.
- App Themes expanded from 5 to 10 themes with improved color contrast: 7 dark themes (Tactical Dark, Midnight Ops, Stealth Green, Crimson Ops, Desert Storm, Ocean Depth, Phantom Gray) and 3 light themes (Arctic White, Sand Light, Silver Steel). Each theme has distinct sidebar/header/accent/background combinations with proper text contrast ratios. Theme cards now show Dark/Light label and 5 color swatches.

### Added
- `DateRangeFilter` component with two date inputs and arrow separator, styled for dark/light themes with `colorScheme: dark`.
- `MultiSelectFilter` component with searchable dropdown, checkbox items, selected count badge, per-dropdown clear button, and "No results" empty state.

## 0.1.5 - 2026-03-20

### Added
- PWA support: web app manifest, service worker with offline shell caching, mock API response caching, push notifications, badge counts, app shortcuts (Map, Persons, Notifications, AI), share target, background sync for queued actions, periodic badge refresh. SVG icons (192/512). Blade template updated with all PWA meta tags, Apple/Android/Windows support, and SW registration script.
- Font selector in Settings tab: 7 fonts (Geist, IBM Plex Sans, DM Sans, Space Grotesk, Outfit, Sora, Source Code Pro) with live preview cards showing sample text in each font. Selection applies instantly across entire app via context.
- IP info modal in Audit Logs: clicking any IP address opens a modal with mock ipinfo.io data (hostname, city, region, country, coordinates, ISP, organization, ASN, postal, timezone, connection type). Includes skeleton loading state and data source attribution.
- SearchableFilter component: dropdown with built-in search input for filtering large option lists. Used for all three audit log filters (dates, actions, IPs).
- Font context (`currentFont`, `setFontId`) added to AppSettingsContext.

### Changed
- Theme system now propagates to header and sidebar backgrounds via `headerBg` and `sidebarBg` properties on each theme. All 5 themes updated with complete color sets including `accentGlow`, `textDim`, `danger/success/warning/cyan` variants.
- Header Settings menu item now links to `/profile?tab=settings` instead of `/settings`. Profile page reads `?tab=` query param to open correct tab.
- Sidebar and AppHeader now use `useAppSettings()` context for all colors instead of static theme import — fully dynamic theming.
- Audit log filter dropdowns replaced with SearchableFilter component featuring type-ahead search, keyboard navigation, and "No results" empty state.
- All CSS colors now available as CSS custom properties (`--ax-bg`, `--ax-accent`, `--ax-sidebar-bg`, etc.) for potential use in child components.
- Blade template expanded with 8 Google Font families for font selector support.

## 0.1.4 - 2026-03-20

### Added
- Toast notification system (`ToastProvider` + `useToast` hook) with 4 types: success, error, warning, info. Slide-in animation with auto-dismiss, colored left border, click-to-dismiss.
- Profile Settings tab with:
  - Language selector with flags (English 🇬🇧, Croatian 🇭🇷, Russian 🇷🇺, Chinese 🇨🇳, Arabic 🇸🇦). Arabic switches layout to RTL.
  - App Theme selector with 5 visual theme cards (Tactical Dark, Midnight Ops, Arctic White, Desert Storm, Crimson Ops) that apply instantly via context.
  - Timezone dropdown (moved from Personal Data tab).
  - Date format dropdown with 10 formats and live preview.
- Theme context system (`AppSettingsContext`) in AppLayout for global theme and RTL direction state.

### Changed
- All success/error messages across profile tabs now use Toast notifications instead of inline banners.
- Fixed mobile scrolling on /profile and all app pages: added `WebkitOverflowScrolling: touch`, `minHeight: 0`, `paddingBottom: 80px` to main content area. Fixed `body { overflow: hidden }` specificity.
- Audit Logs tab: added individual filter dropdowns for Time (date), Action, and IP alongside the search bar. Added "Clear" button to reset all filters. Table is now fully responsive on mobile with stacked card layout and labeled fields.
- Profile tabs now horizontally scrollable on mobile with hidden scrollbar.
- Removed timezone field from Personal Data tab (moved to Settings).

## 0.1.3 - 2026-03-20

### Added
- Skeleton loader components: `Skeleton`, `SkeletonRow`, `SkeletonCard` with shimmer animation.
- `Toggle` switch component for boolean settings.
- Button press animation (scale 0.97 on mousedown, brightness dim during loading).
- Profile page (/profile) with 4 tabs:
  - **Personal Data**: Avatar upload with edit overlay, first/last name, email, phone, timezone dropdown (23 timezones), save with success toast.
  - **Change Password**: Current/new/confirm password with inline strength checklist, validation, session revocation notice on success.
  - **Security**: 2FA method selector (Auth App/SMS/Email) with QR code display for TOTP, 2FA phone, recovery phone, backup code generator (8 codes), physical key registration, session timeout dropdown, session restoration prevention toggle, active sessions list with trust/revoke actions, 7 security feature toggles (auth logging, device fingerprinting, new device detection, failed login tracking, location tracking, suspicious activity detection, device trust management), statistics cards (total logins, failed attempts, unique devices, active sessions).
  - **Audit Logs**: Searchable data table with 20 mock entries, color-coded action badges, pagination (8 per page), columns: Time, Action, Details, IP. Search filters across action, details, and IP fields.
- `ProfileSkeleton` loading state shown for 800ms on initial tab render.

## 0.1.2 - 2026-03-20

### Changed
- Header notification dropdown: updated mock data to System update, Storage, New User, Security, Device, Backup categories with typed icons. Added "Read all" button in dropdown header.
- Notifications route now renders dedicated Notifications page instead of Dashboard placeholder.

### Added
- Notifications page (/notifications) with filter tabs: All, Unread, Critical, Warning, Info. Includes 20 realistic mock notifications with severity badges, type badges, source labels, timestamps, and unread dot indicators. Click to toggle read/unread. "Mark all as read" bulk action. Empty state. Footer stats.

## 0.1.1 - 2026-03-20

### Changed
- Register page: stacked first/last name vertically, added phone number field.
- Removed footer (StatusBar) from all auth pages (Login, Register, 2FA, Forgot Password).

### Added
- AppLayout with responsive sidebar and header.
- Sidebar navigation with 7 sections: Command, Subjects, Intelligence, Analysis, Monitoring, Tools, System.
- AppHeader with city clock dropdown (Zagreb, Riyadh, Sydney), notification dropdown with mock data, user profile dropdown with My Profile, Settings, and Logout.
- Dashboard/Index placeholder page rendered inside AppLayout.
- All sidebar menu routes wired in web.php.
- Responsive mobile sidebar with hamburger toggle and overlay.

## 0.1.0 - 2026-03-19

### Added
- Project scaffolding: Laravel 13 + Inertia + React + TypeScript + Vite.
- Authentication pages: Login, Register, Two-Factor (Auth App / SMS / Email), Forgot Password (4-step flow).
- Particle background with interactive connected nodes, radar grid, scan line, corner brackets.
- CIA/Palantir-inspired dark tactical design system.
- Reusable UI component library: Input, Button, Card, OtpInput, PasswordStrength, MethodSelector, AlertBox, ProgressSteps, SecurityBadge, CheckItem, Divider.
- AuthLayout with ParticleBackground and StatusBar (live clocks: LOCAL / UTC / DC).
- Full i18n support (English + Croatian) for all auth pages.
- Laravel Form Request validation for all auth forms.
- Shared Inertia props: app config, locale, flash messages.
- SetLocale middleware with session-based locale switching.
- ARGUX hexagonal logo with targeting reticle.
