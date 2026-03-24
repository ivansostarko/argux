import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Web Scraper  ·  Open Source Intelligence Crawler
   News portals, court records, sanctions, dark web, gov gazettes
   ═══════════════════════════════════════════════════════════════ */

type SourceCategory = 'News Portal' | 'Court Records' | 'Sanctions List' | 'Dark Web' | 'Government Gazette' | 'Corporate Registry' | 'Maritime & Aviation' | 'Academic & Research';
type ScraperStatus = 'Active' | 'Paused' | 'Error' | 'Scheduled';
type ContentType = 'article' | 'court_filing' | 'sanctions_entry' | 'dark_web_post' | 'gazette_notice' | 'corporate_filing' | 'vessel_record' | 'research_paper';
type Relevance = 'Critical' | 'High' | 'Medium' | 'Low';

interface WebSource {
    id: string; name: string; url: string; category: SourceCategory;
    country: string; countryFlag: string; language: string;
    status: ScraperStatus; health: number; schedule: string;
    lastSync: string; articleCount: number; newArticles: number;
    cssSelector: string; urlPattern: string;
    entityTags: string[]; keywords: string[];
    operationCode: string;
}

interface ScrapedArticle {
    id: string; sourceId: string; sourceName: string; sourceCategory: SourceCategory;
    title: string; excerpt: string; url: string;
    contentType: ContentType; relevance: Relevance;
    personIds: number[]; personNames: string[];
    orgIds: number[]; orgNames: string[];
    country: string; language: string;
    publishedAt: string; scrapedAt: string; timeAgo: string;
    hasMedia: boolean; mediaType: string;
    aiFlagged: boolean; aiReason: string;
    tags: string[];
}

const catConfig: Record<SourceCategory, { icon: string; color: string }> = {
    'News Portal': { icon: '📰', color: '#3b82f6' },
    'Court Records': { icon: '⚖️', color: '#8b5cf6' },
    'Sanctions List': { icon: '🚫', color: '#ef4444' },
    'Dark Web': { icon: '🕸️', color: '#64748b' },
    'Government Gazette': { icon: '🏛️', color: '#06b6d4' },
    'Corporate Registry': { icon: '🏢', color: '#f59e0b' },
    'Maritime & Aviation': { icon: '🚢', color: '#10b981' },
    'Academic & Research': { icon: '🎓', color: '#ec4899' },
};
const statusCol: Record<ScraperStatus, string> = { Active: '#22c55e', Paused: '#6b7280', Error: '#ef4444', Scheduled: '#f59e0b' };
const relColors: Record<Relevance, string> = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#22c55e' };
const contentIcons: Record<ContentType, string> = { article: '📰', court_filing: '⚖️', sanctions_entry: '🚫', dark_web_post: '🕸️', gazette_notice: '🏛️', corporate_filing: '🏢', vessel_record: '🚢', research_paper: '🎓' };

// ═══ 16 WEB SOURCES ═══
const mockSources: WebSource[] = [
    { id: 'ws-01', name: 'Jutarnji List', url: 'https://jutarnji.hr', category: 'News Portal', country: 'Croatia', countryFlag: '🇭🇷', language: 'Croatian', status: 'Active', health: 98, schedule: 'Every 10min', lastSync: '2026-03-24 10:10', articleCount: 4521, newArticles: 8, cssSelector: 'article.post-content', urlPattern: '/vijesti/*', entityTags: ['Horvat', 'Alpha Security', 'Zagreb'], keywords: ['sigurnost', 'luka', 'istraga'], operationCode: 'HAWK' },
    { id: 'ws-02', name: 'Večernji List', url: 'https://vecernji.hr', category: 'News Portal', country: 'Croatia', countryFlag: '🇭🇷', language: 'Croatian', status: 'Active', health: 96, schedule: 'Every 10min', lastSync: '2026-03-24 10:10', articleCount: 3890, newArticles: 5, cssSelector: 'div.article-body', urlPattern: '/vijesti/*', entityTags: ['Croatia', 'Security'], keywords: ['obrana', 'naoružanje', 'policija'], operationCode: 'HAWK' },
    { id: 'ws-03', name: 'Reuters World', url: 'https://reuters.com', category: 'News Portal', country: 'International', countryFlag: '🌍', language: 'English', status: 'Active', health: 100, schedule: 'Every 5min', lastSync: '2026-03-24 10:12', articleCount: 12450, newArticles: 34, cssSelector: 'div.article-body__content', urlPattern: '/world/*', entityTags: ['arms', 'trafficking', 'sanctions'], keywords: ['arms deal', 'sanctions', 'money laundering', 'Adriatic'], operationCode: '' },
    { id: 'ws-04', name: 'Al Jazeera Middle East', url: 'https://aljazeera.com', category: 'News Portal', country: 'Qatar', countryFlag: '🇶🇦', language: 'English', status: 'Active', health: 95, schedule: 'Every 15min', lastSync: '2026-03-24 10:00', articleCount: 8920, newArticles: 12, cssSelector: 'div.wysiwyg', urlPattern: '/news/middleeast/*', entityTags: ['Rashid', 'Gulf', 'Saudi'], keywords: ['Saudi Arabia', 'Dubai', 'arms trade', 'maritime'], operationCode: 'GLACIER' },
    { id: 'ws-05', name: 'Croatian Court Registry (e-Spis)', url: 'https://sudskapraksapublic.vsrh.hr', category: 'Court Records', country: 'Croatia', countryFlag: '🇭🇷', language: 'Croatian', status: 'Active', health: 71, schedule: 'Every 6h', lastSync: '2026-03-24 06:00', articleCount: 891, newArticles: 2, cssSelector: 'div.case-detail', urlPattern: '/search?q=*', entityTags: ['Horvat', 'Babić', 'Alpha Security'], keywords: ['kazneni', 'gospodarski', 'ovrha'], operationCode: 'HAWK' },
    { id: 'ws-06', name: 'INTERPOL Red Notices', url: 'https://interpol.int/en/How-we-work/Notices/Red-Notices', category: 'Sanctions List', country: 'International', countryFlag: '🌍', language: 'English', status: 'Active', health: 100, schedule: 'Every 1h', lastSync: '2026-03-24 10:00', articleCount: 234, newArticles: 0, cssSelector: 'div.wanted-person', urlPattern: '/Red-Notices/*', entityTags: [], keywords: ['trafficking', 'fraud', 'weapons'], operationCode: '' },
    { id: 'ws-07', name: 'EU Sanctions Map', url: 'https://sanctionsmap.eu', category: 'Sanctions List', country: 'EU', countryFlag: '🇪🇺', language: 'English', status: 'Active', health: 100, schedule: 'Every 1h', lastSync: '2026-03-24 10:00', articleCount: 156, newArticles: 0, cssSelector: 'div.entity-detail', urlPattern: '/api/entities/*', entityTags: ['Rashid', 'Al-Rashid'], keywords: ['restrictive measures', 'asset freeze'], operationCode: 'GLACIER' },
    { id: 'ws-08', name: 'Dark Web Forum Monitor', url: 'tor://darkmon.argux.onion', category: 'Dark Web', country: 'Global', countryFlag: '🌍', language: 'Mixed', status: 'Active', health: 58, schedule: 'Every 2h', lastSync: '2026-03-24 08:00', articleCount: 678, newArticles: 3, cssSelector: 'div.post-body', urlPattern: '/forum/*', entityTags: ['arms', 'weapons'], keywords: ['weapons', 'ammunition', 'delivery', 'croatia', 'adriatic', 'encrypted'], operationCode: 'HAWK' },
    { id: 'ws-09', name: 'Dark Web Marketplace Tracker', url: 'tor://markets.argux.onion', category: 'Dark Web', country: 'Global', countryFlag: '🌍', language: 'Mixed', status: 'Error', health: 0, schedule: 'Every 4h', lastSync: '2026-03-22 14:00', articleCount: 234, newArticles: 0, cssSelector: 'div.listing', urlPattern: '/listings/*', entityTags: [], keywords: ['weapons', 'export', 'documents'], operationCode: '' },
    { id: 'ws-10', name: 'Croatian Official Gazette (NN)', url: 'https://narodne-novine.nn.hr', category: 'Government Gazette', country: 'Croatia', countryFlag: '🇭🇷', language: 'Croatian', status: 'Active', health: 99, schedule: 'Daily', lastSync: '2026-03-24 06:00', articleCount: 12340, newArticles: 18, cssSelector: 'div.gazette-content', urlPattern: '/clanci/*', entityTags: ['zakon', 'uredba'], keywords: ['sigurnost', 'obrana', 'izvoz', 'uvoz'], operationCode: '' },
    { id: 'ws-11', name: 'Saudi Gazette', url: 'https://saudigazette.com.sa', category: 'News Portal', country: 'Saudi Arabia', countryFlag: '🇸🇦', language: 'English', status: 'Active', health: 92, schedule: 'Every 30min', lastSync: '2026-03-24 10:00', articleCount: 2340, newArticles: 4, cssSelector: 'div.article-text', urlPattern: '/article/*', entityTags: ['Rashid Holdings', 'Saudi'], keywords: ['investment', 'defense', 'trade'], operationCode: 'GLACIER' },
    { id: 'ws-12', name: 'OpenCorporates Filings', url: 'https://opencorporates.com', category: 'Corporate Registry', country: 'UK', countryFlag: '🇬🇧', language: 'English', status: 'Active', health: 99, schedule: 'Every 4h', lastSync: '2026-03-24 08:00', articleCount: 567, newArticles: 2, cssSelector: 'div.company-detail', urlPattern: '/companies/*', entityTags: ['Rashid Holdings', 'Falcon Trading', 'Alpha Security'], keywords: ['director change', 'new filing', 'dissolution', 'incorporation'], operationCode: '' },
    { id: 'ws-13', name: 'MarineTraffic Incidents', url: 'https://marinetraffic.com', category: 'Maritime & Aviation', country: 'Greece', countryFlag: '🇬🇷', language: 'English', status: 'Active', health: 94, schedule: 'Every 30min', lastSync: '2026-03-24 10:00', articleCount: 890, newArticles: 1, cssSelector: 'div.incident-detail', urlPattern: '/ais/details/*', entityTags: ['Zagreb port', 'Jebel Ali'], keywords: ['unregistered', 'suspicious', 'AIS off'], operationCode: 'HAWK' },
    { id: 'ws-14', name: 'OCCRP Investigations', url: 'https://occrp.org', category: 'News Portal', country: 'International', countryFlag: '🌍', language: 'English', status: 'Active', health: 97, schedule: 'Every 1h', lastSync: '2026-03-24 09:00', articleCount: 1245, newArticles: 1, cssSelector: 'div.investigation-body', urlPattern: '/investigations/*', entityTags: ['corruption', 'money laundering'], keywords: ['shell company', 'offshore', 'arms', 'sanctions evasion'], operationCode: '' },
    { id: 'ws-15', name: 'FlightRadar24 Alerts', url: 'https://flightradar24.com', category: 'Maritime & Aviation', country: 'Sweden', countryFlag: '🇸🇪', language: 'English', status: 'Active', health: 96, schedule: 'Every 10min', lastSync: '2026-03-24 10:10', articleCount: 456, newArticles: 0, cssSelector: '', urlPattern: '/api/flights/*', entityTags: ['private aviation'], keywords: ['private jet', 'charter', 'Riyadh', 'Zagreb', 'Dubai'], operationCode: '' },
    { id: 'ws-16', name: 'Jane\'s Defence Weekly', url: 'https://janes.com', category: 'Academic & Research', country: 'UK', countryFlag: '🇬🇧', language: 'English', status: 'Paused', health: 0, schedule: 'Paused', lastSync: '2026-03-18 08:00', articleCount: 89, newArticles: 0, cssSelector: 'div.article-content', urlPattern: '/defence-news/*', entityTags: ['defense', 'arms trade'], keywords: ['arms export', 'defense contract', 'Adriatic', 'Balkans'], operationCode: '' },
];

// ═══ 20 SCRAPED ARTICLES ═══
const mockArticles: ScrapedArticle[] = [
    { id: 'wa-01', sourceId: 'ws-01', sourceName: 'Jutarnji List', sourceCategory: 'News Portal', title: 'Pojačane sigurnosne mjere u zagrebačkoj luci nakon dojave', excerpt: 'Policija je pojačala prisutnost u području zagrebačke luke nakon anonimne dojave o mogućem nezakonitom prometu. Dodatne kamere postavljene na ulazima.', url: 'https://jutarnji.hr/vijesti/sigurnost-luka-zagreb', contentType: 'article', relevance: 'Critical', personIds: [], personNames: [], orgIds: [], orgNames: [], country: 'Croatia', language: 'Croatian', publishedAt: '2026-03-24 07:30', scrapedAt: '2026-03-24 07:35', timeAgo: '3h', hasMedia: true, mediaType: 'Photo', aiFlagged: true, aiReason: 'CRITICAL: Zagreb port security article coincides with OP HAWK operational window. "Pojačane sigurnosne mjere" (enhanced security) may indicate leaked intelligence or parallel investigation.', tags: ['port', 'security', 'zagreb', 'HAWK-relevant', 'CRITICAL'] },
    { id: 'wa-02', sourceId: 'ws-03', sourceName: 'Reuters', sourceCategory: 'News Portal', title: 'EU tightens arms export controls amid Balkans trafficking concerns', excerpt: 'The European Union has proposed stricter controls on arms exports to Balkans nations following intelligence reports of increased trafficking activity in the Adriatic corridor.', url: 'https://reuters.com/world/europe/eu-arms-balkans', contentType: 'article', relevance: 'High', personIds: [], personNames: [], orgIds: [], orgNames: [], country: 'International', language: 'English', publishedAt: '2026-03-24 06:00', scrapedAt: '2026-03-24 06:05', timeAgo: '4h', hasMedia: false, mediaType: '', aiFlagged: true, aiReason: 'Adriatic corridor arms trafficking — direct relevance to OP HAWK. EU regulatory change may impact operational timeline.', tags: ['arms', 'EU', 'balkans', 'adriatic', 'HAWK-relevant'] },
    { id: 'wa-03', sourceId: 'ws-04', sourceName: 'Al Jazeera', sourceCategory: 'News Portal', title: 'Saudi investment firm expands Mediterranean portfolio with Cyprus acquisitions', excerpt: 'A Riyadh-based investment firm has acquired three properties in Limassol, Cyprus, expanding its presence in the Mediterranean real estate market. The firm has ties to regional defense sector.', url: 'https://aljazeera.com/economy/saudi-cyprus', contentType: 'article', relevance: 'High', personIds: [3], personNames: ['Ahmed Al-Rashid'], orgIds: [2], orgNames: ['Rashid Holdings International'], country: 'Qatar', language: 'English', publishedAt: '2026-03-23 14:00', scrapedAt: '2026-03-23 14:15', timeAgo: '20h', hasMedia: true, mediaType: 'Photo', aiFlagged: true, aiReason: 'Entity match: "Riyadh-based investment firm" + Cyprus + defense matches Rashid Holdings profile. Cross-ref social scraper: Falcon Trading also expanding in Cyprus (sp-15).', tags: ['rashid', 'cyprus', 'investment', 'defense', 'GLACIER-relevant', 'entity-match'] },
    { id: 'wa-04', sourceId: 'ws-05', sourceName: 'e-Spis Court Registry', sourceCategory: 'Court Records', title: 'Prekršajni postupak br. KR-2026-04521: Alpha Security d.o.o.', excerpt: 'Pokrenuti prekršajni postupak protiv Alpha Security Group d.o.o. za kršenje propisa o izvozu sigurnosne opreme. Ročište zakazano za 15.04.2026.', url: 'https://sudskapraksapublic.vsrh.hr/cases/KR-2026-04521', contentType: 'court_filing', relevance: 'Critical', personIds: [1, 12], personNames: ['Marko Horvat', 'Ivan Babić'], orgIds: [1], orgNames: ['Alpha Security Group'], country: 'Croatia', language: 'Croatian', publishedAt: '2026-03-23 09:00', scrapedAt: '2026-03-23 12:00', timeAgo: '22h', hasMedia: false, mediaType: '', aiFlagged: true, aiReason: 'CRITICAL: Court proceeding against Alpha Security Group for export violations. Hearing 2026-04-15. Directors Horvat and Babić named. Direct OP HAWK evidence.', tags: ['court', 'alpha-security', 'export-violation', 'horvat', 'babic', 'CRITICAL', 'HAWK-evidence'] },
    { id: 'wa-05', sourceId: 'ws-07', sourceName: 'EU Sanctions Map', sourceCategory: 'Sanctions List', title: 'CFSP Update: 3 new entries — restrictive measures (March 2026)', excerpt: 'The Council added 3 individuals and 1 entity to the EU sanctions list under CFSP framework. Additions include entities linked to arms proliferation in the MENA region.', url: 'https://sanctionsmap.eu/updates/march-2026', contentType: 'sanctions_entry', relevance: 'High', personIds: [], personNames: [], orgIds: [], orgNames: [], country: 'EU', language: 'English', publishedAt: '2026-03-24 08:00', scrapedAt: '2026-03-24 08:05', timeAgo: '2h', hasMedia: false, mediaType: '', aiFlagged: true, aiReason: 'New EU sanctions for MENA arms proliferation. Cross-check against HAWK/GLACIER target list. No direct match but sector overlap with Rashid Holdings defense activities.', tags: ['sanctions', 'EU', 'CFSP', 'arms', 'MENA'] },
    { id: 'wa-06', sourceId: 'ws-08', sourceName: 'Dark Web Forum', sourceCategory: 'Dark Web', title: '[FORUM] WTS: Military-grade equipment, Adriatic delivery available', excerpt: 'Listing on monitored dark web forum offering military surplus with delivery options through Adriatic ports. Payment: cryptocurrency only. Seller reputation: verified (48 transactions).', url: 'tor://darkforum.onion/post/48291', contentType: 'dark_web_post', relevance: 'Critical', personIds: [], personNames: [], orgIds: [], orgNames: [], country: 'Global', language: 'English', publishedAt: '2026-03-24 02:00', scrapedAt: '2026-03-24 04:00', timeAgo: '6h', hasMedia: false, mediaType: '', aiFlagged: true, aiReason: 'CRITICAL: "Adriatic delivery" matches OP HAWK intelligence. Dark web arms listing with port delivery method. Timing aligns with intercepted "Thursday dock 7" communication.', tags: ['dark-web', 'arms', 'adriatic', 'CRITICAL', 'HAWK-match', 'crypto'] },
    { id: 'wa-07', sourceId: 'ws-12', sourceName: 'OpenCorporates', sourceCategory: 'Corporate Registry', title: 'New company filing: Rashid Mediterranean Holdings Ltd (Cyprus)', excerpt: 'New incorporation in Limassol, Cyprus. Directors: undisclosed nominee service. Registered capital: €10,000. Activity code: 6420 (Holding company activities).', url: 'https://opencorporates.com/companies/cy/rashid-med', contentType: 'corporate_filing', relevance: 'High', personIds: [3], personNames: ['Ahmed Al-Rashid'], orgIds: [2], orgNames: ['Rashid Holdings International'], country: 'UK', language: 'English', publishedAt: '2026-03-23 08:00', scrapedAt: '2026-03-24 08:05', timeAgo: '26h', hasMedia: false, mediaType: '', aiFlagged: true, aiReason: 'New shell company: "Rashid Mediterranean" in Cyprus. Nominee directors = opacity structure. Cross-ref Al Jazeera article (wa-03) and social scraper Falcon Trading Cyprus post (sp-15). Classic layering pattern.', tags: ['shell-company', 'cyprus', 'rashid', 'nominee', 'GLACIER-evidence', 'AML'] },
    { id: 'wa-08', sourceId: 'ws-13', sourceName: 'MarineTraffic', sourceCategory: 'Maritime & Aviation', title: 'Vessel AIS anomaly: unregistered cargo near Zagreb port approach', excerpt: 'Medium cargo vessel detected approaching Zagreb port without AIS transponder signal. Estimated 2,000 DWT. No registered name or flag state in database.', url: 'https://marinetraffic.com/ais/details/anomaly-20260324', contentType: 'vessel_record', relevance: 'Critical', personIds: [], personNames: [], orgIds: [], orgNames: [], country: 'Greece', language: 'English', publishedAt: '2026-03-24 09:50', scrapedAt: '2026-03-24 09:55', timeAgo: '19m', hasMedia: true, mediaType: 'Satellite', aiFlagged: true, aiReason: 'CRITICAL: AIS-dark vessel approaching Zagreb port. Matches camera detection event (ev-21) and OP HAWK 72-hour operational window. Potential delivery vessel.', tags: ['vessel', 'AIS-off', 'unregistered', 'CRITICAL', 'HAWK-match', 'port'] },
    { id: 'wa-09', sourceId: 'ws-14', sourceName: 'OCCRP', sourceCategory: 'News Portal', title: 'Investigation: Shell company networks in Adriatic arms pipeline', excerpt: 'A months-long OCCRP investigation reveals a network of shell companies across Croatia, Cyprus, and the UAE facilitating arms transfers through Adriatic ports.', url: 'https://occrp.org/investigations/adriatic-arms', contentType: 'article', relevance: 'Critical', personIds: [], personNames: [], orgIds: [], orgNames: [], country: 'International', language: 'English', publishedAt: '2026-03-24 05:00', scrapedAt: '2026-03-24 05:05', timeAgo: '5h', hasMedia: true, mediaType: 'Video', aiFlagged: true, aiReason: 'CRITICAL: OCCRP investigation describes exact pattern matching OP HAWK/GLACIER intelligence. Croatia-Cyprus-UAE pipeline mirrors Rashid Holdings + Falcon Trading structure. Potential parallel investigation — coordination with legal recommended.', tags: ['OCCRP', 'investigation', 'shell-companies', 'adriatic', 'arms', 'CRITICAL', 'parallel-intel'] },
    { id: 'wa-10', sourceId: 'ws-10', sourceName: 'Narodne Novine', sourceCategory: 'Government Gazette', title: 'Uredba o kontroli izvoza robe vojne namjene (NN 28/2026)', excerpt: 'Nova uredba koja pojačava kontrolu izvoza robe vojne namjene stupila na snagu. Dodatni zahtjevi za tvrtke u sektoru obrane i sigurnosti.', url: 'https://narodne-novine.nn.hr/clanci/2026028', contentType: 'gazette_notice', relevance: 'Medium', personIds: [], personNames: [], orgIds: [1], orgNames: ['Alpha Security Group'], country: 'Croatia', language: 'Croatian', publishedAt: '2026-03-22 06:00', scrapedAt: '2026-03-22 06:05', timeAgo: '2d', hasMedia: false, mediaType: '', aiFlagged: false, aiReason: '', tags: ['regulation', 'export-control', 'defense', 'official'] },
    { id: 'wa-11', sourceId: 'ws-02', sourceName: 'Večernji List', sourceCategory: 'News Portal', title: 'Alpha Security Group najavljuje novo partnerstvo u obrani', excerpt: 'Zagrebačka tvrtka Alpha Security Group sklopila je partnerstvo s međunarodnim obrambenim konzorcijem za projekt vrijedan 15 milijuna eura u jadranskoj regiji.', url: 'https://vecernji.hr/vijesti/alpha-security-partnerstvo', contentType: 'article', relevance: 'High', personIds: [1], personNames: ['Marko Horvat'], orgIds: [1], orgNames: ['Alpha Security Group'], country: 'Croatia', language: 'Croatian', publishedAt: '2026-03-23 11:00', scrapedAt: '2026-03-23 11:05', timeAgo: '23h', hasMedia: true, mediaType: 'Photo', aiFlagged: true, aiReason: 'ASG €15M defense partnership in Adriatic. Cross-ref LinkedIn announcement (sp-08). Procurement network expansion confirmed from dual sources.', tags: ['alpha-security', 'partnership', 'defense', '15M-EUR', 'dual-source'] },
    { id: 'wa-12', sourceId: 'ws-11', sourceName: 'Saudi Gazette', sourceCategory: 'News Portal', title: 'Rashid Holdings quarterly results show record investment portfolio', excerpt: 'Rashid Holdings International reported Q1 2026 results with portfolio growth of 23%. Significant new investments in Mediterranean real estate and maritime logistics.', url: 'https://saudigazette.com.sa/article/rashid-q1', contentType: 'article', relevance: 'High', personIds: [3], personNames: ['Ahmed Al-Rashid'], orgIds: [2], orgNames: ['Rashid Holdings International'], country: 'Saudi Arabia', language: 'English', publishedAt: '2026-03-24 04:00', scrapedAt: '2026-03-24 04:30', timeAgo: '6h', hasMedia: false, mediaType: '', aiFlagged: true, aiReason: '"Mediterranean real estate" + "maritime logistics" = Cyprus shell company + port infrastructure. Connects to OpenCorporates filing (wa-07) and cargo manifest analysis.', tags: ['rashid', 'quarterly', 'investment', 'maritime', 'GLACIER-relevant'] },
    { id: 'wa-13', sourceId: 'ws-15', sourceName: 'FlightRadar24', sourceCategory: 'Maritime & Aviation', title: 'Private charter: Riyadh → Zagreb (HZ-SKY1), departure 2026-03-25', excerpt: 'Private Gulfstream G650 registered HZ-SKY1 filed flight plan Riyadh to Zagreb, departure 2026-03-25 06:00 UTC. Aircraft linked to Rashid Holdings fleet.', url: 'https://flightradar24.com/data/flights/HZ-SKY1', contentType: 'vessel_record', relevance: 'Critical', personIds: [3], personNames: ['Ahmed Al-Rashid'], orgIds: [2], orgNames: ['Rashid Holdings International'], country: 'Sweden', language: 'English', publishedAt: '2026-03-24 09:00', scrapedAt: '2026-03-24 09:10', timeAgo: '1h', hasMedia: false, mediaType: '', aiFlagged: true, aiReason: 'CRITICAL: Al-Rashid private jet to Zagreb TOMORROW. Arrives within OP HAWK 72h operational window. Cross-ref "Thursday delivery" intelligence (sp-04, audio ev-07). Recommend airport surveillance deployment.', tags: ['flight', 'private-jet', 'rashid', 'zagreb', 'CRITICAL', 'tomorrow', 'HAWK-GLACIER-converge'] },
    { id: 'wa-14', sourceId: 'ws-08', sourceName: 'Dark Web Forum', sourceCategory: 'Dark Web', title: '[ENCRYPTED] Discussion thread: "Adriatic route" — 14 replies', excerpt: 'Encrypted discussion thread on monitored forum referencing "the Adriatic route" with 14 new replies in past 24h. Multiple references to "Thursday window" and "port contact".', url: 'tor://darkforum.onion/thread/encrypted-adriatic', contentType: 'dark_web_post', relevance: 'Critical', personIds: [], personNames: [], orgIds: [], orgNames: [], country: 'Global', language: 'Mixed', publishedAt: '2026-03-24 03:00', scrapedAt: '2026-03-24 04:00', timeAgo: '6h', hasMedia: false, mediaType: '', aiFlagged: true, aiReason: 'CRITICAL: Dark web "Adriatic route" + "Thursday window" + "port contact" — triple keyword convergence with HAWK intelligence. Encrypted thread activity spike suggests operational coordination.', tags: ['dark-web', 'encrypted', 'adriatic', 'thursday', 'CRITICAL', 'convergence'] },
    { id: 'wa-15', sourceId: 'ws-01', sourceName: 'Jutarnji List', sourceCategory: 'News Portal', title: 'Zagrebačka policija traži svjedoke incidenta na Savskoj cesti', excerpt: 'Policija traži svjedoke prometnog incidenta na Savskoj cesti u blizini broja 41. Incident se dogodio u ranim jutarnjim satima.', url: 'https://jutarnji.hr/vijesti/savska-incident', contentType: 'article', relevance: 'Medium', personIds: [], personNames: [], orgIds: [], orgNames: [], country: 'Croatia', language: 'Croatian', publishedAt: '2026-03-24 08:00', scrapedAt: '2026-03-24 08:05', timeAgo: '2h', hasMedia: false, mediaType: '', aiFlagged: true, aiReason: 'Savska cesta 41 = known safe house location. Early morning incident near monitored address. Cross-ref unknown LPR KA-9921-CC at same location (lp-10).', tags: ['savska', 'safe-house', 'incident', 'police'] },
];

const allCategories = Object.keys(catConfig) as SourceCategory[];
const allCountries = [...new Set(mockSources.map(s => s.country))].sort();

type ViewTab = 'articles' | 'sources' | 'critical';

function WebScraperIndex() {
    const [tab, setTab] = useState<ViewTab>('articles');
    const [search, setSearch] = useState('');
    const [catF, setCatF] = useState<SourceCategory | 'all'>('all');
    const [relF, setRelF] = useState<Relevance | 'all'>('all');
    const [countryF, setCountryF] = useState('all');
    const [personF, setPersonF] = useState<number | 'all'>('all');
    const [orgF, setOrgF] = useState<number | 'all'>('all');
    const [flaggedOnly, setFlaggedOnly] = useState(false);
    const [selArticle, setSelArticle] = useState<string | null>(null);

    const article = selArticle ? mockArticles.find(a => a.id === selArticle) : null;
    const allPersons = [...new Set(mockArticles.filter(a => a.personIds.length).flatMap(a => a.personIds.map((id, i) => ({ id, name: a.personNames[i] }))))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number; name: string }[]);
    const allOrgs = [...new Set(mockArticles.filter(a => a.orgIds.length).flatMap(a => a.orgIds.map((id, i) => ({ id, name: a.orgNames[i] }))))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number; name: string }[]);

    const filtered = useMemo(() => mockArticles.filter(a => {
        if (catF !== 'all' && a.sourceCategory !== catF) return false;
        if (relF !== 'all' && a.relevance !== relF) return false;
        if (countryF !== 'all' && a.country !== countryF) return false;
        if (personF !== 'all' && !a.personIds.includes(personF as number)) return false;
        if (orgF !== 'all' && !a.orgIds.includes(orgF as number)) return false;
        if (flaggedOnly && !a.aiFlagged) return false;
        if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.excerpt.toLowerCase().includes(search.toLowerCase()) && !a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
    }), [catF, relF, countryF, personF, orgF, flaggedOnly, search]);

    const criticalArticles = mockArticles.filter(a => a.relevance === 'Critical');
    const stats = { sources: mockSources.length, active: mockSources.filter(s => s.status === 'Active').length, articles: mockArticles.length, critical: criticalArticles.length, flagged: mockArticles.filter(a => a.aiFlagged).length };

    return (<>
        <PageMeta title="Web Scraper" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* LEFT */}
            <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#22c55e10', border: '1px solid #22c55e25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌐</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>WEB SCRAPER</div><div style={{ fontSize: 7, color: theme.textDim }}>OSINT Intelligence Crawler</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 3 }}>
                    {[{ n: stats.sources, l: 'Srcs', c: theme.accent }, { n: stats.active, l: 'Live', c: '#22c55e' }, { n: stats.articles, l: 'Artcl', c: '#3b82f6' }, { n: stats.critical, l: 'Crit', c: '#ef4444' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '3px 0' }}><div style={{ fontSize: 13, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Category */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Source Category</div>
                    <button onClick={() => setCatF('all')} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: catF === 'all' ? `${theme.accent}08` : 'transparent', color: catF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${catF === 'all' ? theme.accent : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}>All Categories</button>
                    {allCategories.map(c => { const cc = catConfig[c]; const cnt = mockArticles.filter(a => a.sourceCategory === c).length; const sc = mockSources.filter(s => s.category === c).length; if (sc === 0) return null; return <button key={c} onClick={() => setCatF(c)} style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: catF === c ? `${cc.color}08` : 'transparent', color: catF === c ? cc.color : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${catF === c ? cc.color : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}><span>{cc.icon}</span><span style={{ flex: 1 }}>{c}</span><span style={{ fontSize: 7, fontFamily: "'JetBrains Mono',monospace" }}>{cnt}</span></button>; })}
                </div>

                {/* Relevance + Country + Person + Org */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Relevance</div><div style={{ display: 'flex', gap: 2 }}>
                        {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map(r => <button key={r} onClick={() => setRelF(r as any)} style={{ flex: 1, padding: '2px', borderRadius: 3, border: `1px solid ${relF === r ? (r === 'all' ? theme.accent : relColors[r as Relevance]) + '40' : theme.border}`, background: relF === r ? `${r === 'all' ? theme.accent : relColors[r as Relevance]}08` : 'transparent', color: relF === r ? (r === 'all' ? theme.accent : relColors[r as Relevance]) : theme.textDim, fontSize: 6, cursor: 'pointer', fontFamily: 'inherit' }}>{r === 'all' ? 'All' : r.slice(0, 4)}</button>)}
                    </div></div>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Country</div><select value={countryF} onChange={e => setCountryF(e.target.value)} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Countries</option>{allCountries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Person</div><select value={personF === 'all' ? 'all' : String(personF)} onChange={e => setPersonF(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Persons</option>{allPersons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Organization</div><select value={orgF === 'all' ? 'all' : String(orgF)} onChange={e => setOrgF(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Organizations</option>{allOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, color: flaggedOnly ? '#ef4444' : theme.textDim, cursor: 'pointer' }}><input type="checkbox" checked={flaggedOnly} onChange={e => setFlaggedOnly(e.target.checked)} style={{ accentColor: '#ef4444' }} />🚩 AI Flagged only</label>
                </div>

                <div style={{ padding: '8px 12px', marginTop: 'auto' }}>
                    {[{ l: '📱 Social Scraper', h: '/scraper' }, { l: '🗄️ Data Sources', h: '/data-sources' }, { l: '📊 Activity', h: '/activity' }, { l: '🎯 Operations', h: '/operations' }].map(lk => <a key={lk.h} href={lk.h} style={{ display: 'block', fontSize: 8, color: theme.textDim, textDecoration: 'none', padding: '2px 0' }}>{lk.l}</a>)}
                </div>
            </div>

            {/* CENTER */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {[{ id: 'articles' as ViewTab, l: '📰 All Articles', n: filtered.length }, { id: 'critical' as ViewTab, l: '🔴 Critical Intel', n: criticalArticles.length }, { id: 'sources' as ViewTab, l: '⚙️ Sources', n: mockSources.length }].map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#22c55e' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 10, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>{t.l} <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: `${tab === t.id ? '#22c55e' : theme.border}20`, color: tab === t.id ? '#22c55e' : theme.textDim }}>{t.n}</span></button>)}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {/* ARTICLES / CRITICAL */}
                    {(tab === 'articles' || tab === 'critical') && <>
                        {(tab === 'critical' ? criticalArticles : filtered).length === 0 && <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 28, opacity: 0.2 }}>🌐</div><div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>No articles match</div></div>}
                        {(tab === 'critical' ? criticalArticles : filtered).map(a => {
                            const cc = catConfig[a.sourceCategory]; const rc = relColors[a.relevance]; const sel = selArticle === a.id;
                            return <div key={a.id} onClick={() => setSelArticle(a.id)} style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', background: sel ? `${cc.color}04` : a.relevance === 'Critical' ? '#ef444404' : 'transparent', borderLeft: `3px solid ${sel ? cc.color : a.relevance === 'Critical' ? '#ef4444' : 'transparent'}`, transition: 'all 0.1s' }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 5, background: `${cc.color}12`, border: `1px solid ${cc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginTop: 2 }}>{cc.icon}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                            <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: `${rc}12`, color: rc }}>{a.relevance}</span>
                                            <span style={{ fontSize: 7, color: cc.color }}>{a.sourceName}</span>
                                            <span style={{ fontSize: 7, color: theme.textDim }}>{a.language}</span>
                                            <span style={{ fontSize: 7, color: theme.textDim, marginLeft: 'auto' }}>{a.timeAgo}</span>
                                        </div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, lineHeight: 1.4, marginBottom: 3 }}>{a.title}</div>
                                        <div style={{ fontSize: 9, color: theme.textSecondary, lineHeight: 1.5, marginBottom: 4 }}>{a.excerpt.length > 150 ? a.excerpt.slice(0, 150) + '…' : a.excerpt}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' as const }}>
                                            {a.personNames.map((n, i) => <a key={i} href={`/persons/${a.personIds[i]}`} onClick={e => e.stopPropagation()} style={{ fontSize: 7, color: theme.accent, textDecoration: 'none' }}>🧑 {n}</a>)}
                                            {a.orgNames.map((n, i) => <a key={i} href={`/organizations/${a.orgIds[i]}`} onClick={e => e.stopPropagation()} style={{ fontSize: 7, color: '#8b5cf6', textDecoration: 'none' }}>🏢 {n}</a>)}
                                            {a.hasMedia && <span style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${theme.border}15`, color: theme.textDim }}>📎 {a.mediaType}</span>}
                                            {a.aiFlagged && <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2, background: '#ef444412', color: '#ef4444' }}>🚩 AI</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>;
                        })}
                    </>}

                    {/* SOURCES */}
                    {tab === 'sources' && <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                        {mockSources.map(s => { const cc = catConfig[s.category]; const sc = statusCol[s.status];
                            return <div key={s.id} style={{ padding: '12px', borderRadius: 8, border: `1px solid ${sc}20`, background: `${sc}03` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 5, background: `${cc.color}12`, border: `1px solid ${cc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{cc.icon}</div>
                                    <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{s.name}</div><div style={{ fontSize: 7, color: theme.textDim }}>{s.countryFlag} {s.country} · {s.language}</div></div>
                                    <div style={{ textAlign: 'right' as const }}><div style={{ fontSize: 7, fontWeight: 700, color: sc }}>{s.status}</div><div style={{ fontSize: 7, color: theme.textDim }}>{s.health > 0 ? `${s.health}%` : '—'}</div></div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginBottom: 4, fontSize: 8, color: theme.textDim }}>
                                    <span>📝 {s.articleCount.toLocaleString()}</span>
                                    {s.newArticles > 0 && <span style={{ color: '#22c55e', fontWeight: 700 }}>+{s.newArticles} new</span>}
                                    <span>⏱️ {s.schedule}</span>
                                </div>
                                {s.keywords.length > 0 && <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const, marginBottom: 4 }}>
                                    {s.keywords.slice(0, 4).map(k => <span key={k} style={{ fontSize: 6, padding: '1px 3px', borderRadius: 2, background: `${theme.border}20`, color: theme.textDim }}>{k}</span>)}
                                    {s.keywords.length > 4 && <span style={{ fontSize: 6, color: theme.textDim }}>+{s.keywords.length - 4}</span>}
                                </div>}
                                <div style={{ fontSize: 7, color: theme.textDim }}>{s.url}</div>
                            </div>;
                        })}
                    </div>}
                </div>

                <div style={{ padding: '3px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>{stats.sources} sources · {stats.articles} articles · {stats.critical} critical · {stats.flagged} AI-flagged</span>
                    <div style={{ flex: 1 }} /><span>NLP Entity Extraction · On-Premise</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>

            {/* RIGHT: Article Detail */}
            {article && (tab === 'articles' || tab === 'critical') && <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 4, background: `${catConfig[article.sourceCategory].color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{catConfig[article.sourceCategory].icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 7, color: catConfig[article.sourceCategory].color, fontWeight: 600 }}>{article.sourceName}</div><div style={{ fontSize: 7, color: theme.textDim }}>{article.sourceCategory}</div></div>
                        <button onClick={() => setSelArticle(null)} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, lineHeight: 1.4 }}>{article.title}</div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                        <span style={{ fontSize: 7, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: `${relColors[article.relevance]}12`, color: relColors[article.relevance] }}>{article.relevance}</span>
                        <span style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: `${theme.border}15`, color: theme.textDim }}>{contentIcons[article.contentType]} {article.contentType.replace('_', ' ')}</span>
                    </div>
                </div>

                {/* Excerpt */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: 9, color: theme.textSecondary, lineHeight: 1.6 }}>{article.excerpt}</div>

                {/* AI Flag */}
                {article.aiFlagged && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, background: '#ef444406' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', marginBottom: 3 }}>🚩 AI Intelligence Assessment</div>
                    <div style={{ fontSize: 8, color: theme.textSecondary, lineHeight: 1.5 }}>{article.aiReason}</div>
                </div>}

                {/* Entities */}
                {(article.personNames.length > 0 || article.orgNames.length > 0) && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>Tagged Entities</div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                        {article.personIds.map((id, i) => <a key={id} href={`/persons/${id}`} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3, background: `${theme.accent}08`, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>🧑 {article.personNames[i]}</a>)}
                        {article.orgIds.map((id, i) => <a key={id} href={`/organizations/${id}`} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 3, background: '#8b5cf608', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>🏢 {article.orgNames[i]}</a>)}
                    </div>
                </div>}

                {/* Metadata */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                    {[
                        { l: 'Source', v: article.sourceName },
                        { l: 'Category', v: article.sourceCategory },
                        { l: 'Country', v: article.country },
                        { l: 'Language', v: article.language },
                        { l: 'Published', v: article.publishedAt },
                        { l: 'Scraped', v: article.scrapedAt },
                        ...(article.hasMedia ? [{ l: 'Media', v: `📎 ${article.mediaType}` }] : []),
                    ].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: theme.text }}>{r.v}</span></div>)}
                </div>

                {/* Tags */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                        {article.tags.map(t => <span key={t} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: t === 'CRITICAL' ? '#ef444415' : t.includes('HAWK') || t.includes('GLACIER') ? `${theme.accent}10` : t.includes('evidence') ? '#8b5cf610' : `${theme.border}20`, color: t === 'CRITICAL' ? '#ef4444' : t.includes('HAWK') || t.includes('GLACIER') ? theme.accent : t.includes('evidence') ? '#8b5cf6' : theme.textSecondary, fontWeight: t === 'CRITICAL' ? 800 : 400 }}>{t}</span>)}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '8px 12px', display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginTop: 'auto' }}>
                    <a href="/activity" style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, textDecoration: 'none', fontSize: 8, fontWeight: 700, textAlign: 'center' as const }}>📊 Activity</a>
                    <a href="/operations" style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8, textAlign: 'center' as const }}>🎯 Ops</a>
                    <a href="/storage" style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8, textAlign: 'center' as const }}>📁 Save</a>
                </div>
            </div>}
        </div>
    </>);
}

WebScraperIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default WebScraperIndex;
