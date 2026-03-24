import PageMeta from '../../components/layout/PageMeta';
import { useState, useMemo } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { theme } from '../../lib/theme';

/* ═══════════════════════════════════════════════════════════════
   ARGUX — Social Media Scraper  ·  OSINT Collection Engine
   10 platforms, per-entity scraping, AI sentiment, content feed
   ═══════════════════════════════════════════════════════════════ */

type Platform = 'Facebook' | 'X' | 'Instagram' | 'TikTok' | 'YouTube' | 'LinkedIn' | 'Telegram' | 'Snapchat' | 'Reddit' | 'WeChat';
type ScraperStatus = 'Active' | 'Paused' | 'Error' | 'Queued';
type ContentType = 'post' | 'photo' | 'video' | 'story' | 'reel' | 'comment' | 'share' | 'article';
type Sentiment = 'positive' | 'negative' | 'neutral' | 'flagged';

interface Scraper {
    id: string; platform: Platform; profileUrl: string; profileHandle: string;
    personId: number | null; personName: string;
    orgId: number | null; orgName: string;
    status: ScraperStatus; interval: string;
    lastRun: string; totalPosts: number; newPosts: number;
    keywords: string[]; operationCode: string;
}

interface ScrapedPost {
    id: string; scraperId: string; platform: Platform; contentType: ContentType;
    personId: number | null; personName: string;
    orgId: number | null; orgName: string;
    profileHandle: string; content: string;
    likes: number; shares: number; comments: number; views: number;
    sentiment: Sentiment; aiFlagged: boolean; aiReason: string;
    mediaUrl: string; hasMedia: boolean;
    timestamp: string; timeAgo: string;
    tags: string[];
}

const platformConfig: Record<Platform, { icon: string; color: string; label: string }> = {
    Facebook: { icon: '📘', color: '#1877F2', label: 'Facebook' },
    X: { icon: '𝕏', color: '#000000', label: 'X (Twitter)' },
    Instagram: { icon: '📸', color: '#E4405F', label: 'Instagram' },
    TikTok: { icon: '🎵', color: '#010101', label: 'TikTok' },
    YouTube: { icon: '▶️', color: '#FF0000', label: 'YouTube' },
    LinkedIn: { icon: '💼', color: '#0A66C2', label: 'LinkedIn' },
    Telegram: { icon: '✈️', color: '#26A5E4', label: 'Telegram' },
    Snapchat: { icon: '👻', color: '#FFFC00', label: 'Snapchat' },
    Reddit: { icon: '🔴', color: '#FF4500', label: 'Reddit' },
    WeChat: { icon: '💬', color: '#07C160', label: 'WeChat' },
};
const statusColors: Record<ScraperStatus, string> = { Active: '#22c55e', Paused: '#6b7280', Error: '#ef4444', Queued: '#f59e0b' };
const sentimentColors: Record<Sentiment, string> = { positive: '#22c55e', negative: '#ef4444', neutral: '#6b7280', flagged: '#f59e0b' };
const contentIcons: Record<ContentType, string> = { post: '📝', photo: '📷', video: '🎥', story: '⏱️', reel: '🎬', comment: '💬', share: '🔄', article: '📰' };

// ═══ MOCK SCRAPERS (18) ═══
const mockScrapers: Scraper[] = [
    { id: 'sc-01', platform: 'Facebook', profileUrl: 'https://facebook.com/marko.horvat', profileHandle: '@marko.horvat', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', status: 'Active', interval: 'Every 15min', lastRun: '2026-03-24 10:00', totalPosts: 342, newPosts: 3, keywords: ['delivery', 'port', 'cargo', 'meeting'], operationCode: 'HAWK' },
    { id: 'sc-02', platform: 'LinkedIn', profileUrl: 'https://linkedin.com/in/markohorvat', profileHandle: 'markohorvat', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', status: 'Active', interval: 'Every 1h', lastRun: '2026-03-24 09:00', totalPosts: 89, newPosts: 0, keywords: ['security', 'defense', 'contract'], operationCode: 'HAWK' },
    { id: 'sc-03', platform: 'Instagram', profileUrl: 'https://instagram.com/ana.kov', profileHandle: '@ana.kov', personId: 2, personName: 'Ana Kovačević', orgId: null, orgName: '', status: 'Active', interval: 'Every 30min', lastRun: '2026-03-24 10:05', totalPosts: 567, newPosts: 2, keywords: ['travel', 'zagreb', 'belgrade'], operationCode: '' },
    { id: 'sc-04', platform: 'TikTok', profileUrl: 'https://tiktok.com/@elena_p', profileHandle: '@elena_p', personId: 4, personName: 'Elena Petrova', orgId: null, orgName: '', status: 'Active', interval: 'Every 30min', lastRun: '2026-03-24 10:10', totalPosts: 234, newPosts: 1, keywords: ['moscow', 'business', 'consulting'], operationCode: '' },
    { id: 'sc-05', platform: 'X', profileUrl: 'https://x.com/mendoza_carlos', profileHandle: '@mendoza_carlos', personId: 9, personName: 'Carlos Mendoza', orgId: null, orgName: '', status: 'Active', interval: 'Every 15min', lastRun: '2026-03-24 10:00', totalPosts: 1247, newPosts: 5, keywords: ['import', 'export', 'shipment', 'bogota'], operationCode: 'HAWK' },
    { id: 'sc-06', platform: 'Telegram', profileUrl: 'https://t.me/mendoza_group', profileHandle: 'mendoza_group', personId: 9, personName: 'Carlos Mendoza', orgId: 6, orgName: 'Mendoza Import-Export SA', status: 'Active', interval: 'Every 5min', lastRun: '2026-03-24 10:12', totalPosts: 2891, newPosts: 12, keywords: ['delivery', 'tonight', 'package', 'urgent'], operationCode: 'HAWK' },
    { id: 'sc-07', platform: 'YouTube', profileUrl: 'https://youtube.com/@yukitanaka', profileHandle: '@yukitanaka', personId: 6, personName: 'Yuki Tanaka', orgId: null, orgName: '', status: 'Active', interval: 'Every 2h', lastRun: '2026-03-24 08:00', totalPosts: 45, newPosts: 0, keywords: [], operationCode: '' },
    { id: 'sc-08', platform: 'LinkedIn', profileUrl: 'https://linkedin.com/company/alpha-security-group', profileHandle: 'alpha-security-group', personId: null, personName: '', orgId: 1, orgName: 'Alpha Security Group', status: 'Active', interval: 'Every 1h', lastRun: '2026-03-24 09:30', totalPosts: 156, newPosts: 1, keywords: ['contract', 'defense', 'security', 'recruitment'], operationCode: 'HAWK' },
    { id: 'sc-09', platform: 'Facebook', profileUrl: 'https://facebook.com/meridianlogistics', profileHandle: '@meridianlogistics', personId: null, personName: '', orgId: 3, orgName: 'Meridian Logistics GmbH', status: 'Paused', interval: 'Every 2h', lastRun: '2026-03-20 14:00', totalPosts: 78, newPosts: 0, keywords: ['logistics', 'supply chain'], operationCode: '' },
    { id: 'sc-10', platform: 'Instagram', profileUrl: 'https://instagram.com/babic_ivan', profileHandle: '@babic_ivan', personId: 12, personName: 'Ivan Babić', orgId: null, orgName: '', status: 'Active', interval: 'Every 30min', lastRun: '2026-03-24 09:45', totalPosts: 189, newPosts: 1, keywords: ['gym', 'zagreb', 'car'], operationCode: 'HAWK' },
    { id: 'sc-11', platform: 'X', profileUrl: 'https://x.com/hassan_omar_eg', profileHandle: '@hassan_omar_eg', personId: 7, personName: 'Omar Hassan', orgId: null, orgName: '', status: 'Error', interval: 'Every 15min', lastRun: '2026-03-23 22:00', totalPosts: 456, newPosts: 0, keywords: ['trade', 'cairo', 'port'], operationCode: 'HAWK' },
    { id: 'sc-12', platform: 'Snapchat', profileUrl: '', profileHandle: '@mendoza.c', personId: 9, personName: 'Carlos Mendoza', orgId: null, orgName: '', status: 'Active', interval: 'Every 1h', lastRun: '2026-03-24 09:00', totalPosts: 0, newPosts: 0, keywords: ['location'], operationCode: 'HAWK' },
    { id: 'sc-13', platform: 'Reddit', profileUrl: 'https://reddit.com/u/hawk_watcher', profileHandle: 'u/hawk_watcher', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', status: 'Active', interval: 'Every 2h', lastRun: '2026-03-24 08:00', totalPosts: 34, newPosts: 0, keywords: ['arms', 'defense', 'procurement'], operationCode: 'HAWK' },
    { id: 'sc-14', platform: 'WeChat', profileUrl: '', profileHandle: 'liwei_dts', personId: 10, personName: 'Li Wei', orgId: 4, orgName: 'Dragon Tech Solutions', status: 'Queued', interval: 'Every 1h', lastRun: '—', totalPosts: 0, newPosts: 0, keywords: ['tech', 'shanghai', 'export'], operationCode: 'PHOENIX' },
    { id: 'sc-15', platform: 'LinkedIn', profileUrl: 'https://linkedin.com/in/jobrien', profileHandle: 'jobrien', personId: 5, personName: "James O'Brien", orgId: null, orgName: '', status: 'Paused', interval: 'Every 4h', lastRun: '2026-03-15 10:00', totalPosts: 12, newPosts: 0, keywords: [], operationCode: '' },
    { id: 'sc-16', platform: 'Facebook', profileUrl: 'https://facebook.com/falcontrading', profileHandle: '@falcontrading', personId: null, personName: '', orgId: 5, orgName: 'Falcon Trading LLC', status: 'Active', interval: 'Every 1h', lastRun: '2026-03-24 09:30', totalPosts: 67, newPosts: 0, keywords: ['trade', 'cargo', 'dubai'], operationCode: 'HAWK' },
    { id: 'sc-17', platform: 'Telegram', profileUrl: 'https://t.me/falcon_ops', profileHandle: 'falcon_ops', personId: 7, personName: 'Omar Hassan', orgId: 5, orgName: 'Falcon Trading LLC', status: 'Active', interval: 'Every 5min', lastRun: '2026-03-24 10:12', totalPosts: 1456, newPosts: 8, keywords: ['shipment', 'urgent', 'warehouse', 'tonight'], operationCode: 'HAWK' },
    { id: 'sc-18', platform: 'X', profileUrl: 'https://x.com/asg_official', profileHandle: '@asg_official', personId: null, personName: '', orgId: 1, orgName: 'Alpha Security Group', status: 'Active', interval: 'Every 30min', lastRun: '2026-03-24 10:00', totalPosts: 234, newPosts: 2, keywords: ['security', 'defense', 'contract'], operationCode: 'HAWK' },
];

// ═══ MOCK POSTS (25 scraped content items) ═══
const mockPosts: ScrapedPost[] = [
    { id: 'sp-01', scraperId: 'sc-01', platform: 'Facebook', contentType: 'post', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', profileHandle: '@marko.horvat', content: 'Great meeting with the team today. New projects ahead. 💪🇭🇷', likes: 42, shares: 3, comments: 8, views: 0, sentiment: 'positive', aiFlagged: false, aiReason: '', mediaUrl: '', hasMedia: false, timestamp: '2026-03-24 08:30', timeAgo: '2h', tags: ['team', 'projects'] },
    { id: 'sp-02', scraperId: 'sc-01', platform: 'Facebook', contentType: 'photo', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', profileHandle: '@marko.horvat', content: 'Evening at the waterfront. [Photo: Zagreb port area at sunset]', likes: 89, shares: 12, comments: 15, views: 0, sentiment: 'flagged', aiFlagged: true, aiReason: 'Location matches monitored Port Terminal zone. Photo metadata contains GPS near restricted area.', mediaUrl: '', hasMedia: true, timestamp: '2026-03-23 19:45', timeAgo: '14h', tags: ['photo', 'port', 'location-flagged', 'GPS-match'] },
    { id: 'sp-03', scraperId: 'sc-05', platform: 'X', contentType: 'post', personId: 9, personName: 'Carlos Mendoza', orgId: null, orgName: '', profileHandle: '@mendoza_carlos', content: 'Business never sleeps. Zagreb is full of opportunities. 🌙', likes: 23, shares: 5, comments: 2, views: 1450, sentiment: 'flagged', aiFlagged: true, aiReason: 'Night activity reference. Keywords: "never sleeps" matches counter-surveillance pattern. Posted at 02:15 local time.', mediaUrl: '', hasMedia: false, timestamp: '2026-03-24 02:15', timeAgo: '8h', tags: ['night', 'zagreb', 'keyword-flag', 'counter-surv'] },
    { id: 'sp-04', scraperId: 'sc-06', platform: 'Telegram', contentType: 'post', personId: 9, personName: 'Carlos Mendoza', orgId: 6, orgName: 'Mendoza Import-Export SA', profileHandle: 'mendoza_group', content: 'Package ready for Thursday. Confirm dock 7 availability. 📦', likes: 0, shares: 0, comments: 4, views: 0, sentiment: 'flagged', aiFlagged: true, aiReason: 'CRITICAL: Keywords "package", "Thursday", "dock 7" match intercepted audio. Cross-reference with audio keyword event ev-07.', mediaUrl: '', hasMedia: false, timestamp: '2026-03-24 09:30', timeAgo: '44m', tags: ['CRITICAL', 'keyword-match', 'dock-7', 'cross-ref-audio'] },
    { id: 'sp-05', scraperId: 'sc-03', platform: 'Instagram', contentType: 'reel', personId: 2, personName: 'Ana Kovačević', orgId: null, orgName: '', profileHandle: '@ana.kov', content: 'Belgrade nights ✨ [Reel: nightclub scene, 15s]', likes: 234, shares: 18, comments: 42, views: 4500, sentiment: 'positive', aiFlagged: false, aiReason: '', mediaUrl: '', hasMedia: true, timestamp: '2026-03-23 23:30', timeAgo: '11h', tags: ['reel', 'belgrade', 'nightlife'] },
    { id: 'sp-06', scraperId: 'sc-04', platform: 'TikTok', contentType: 'video', personId: 4, personName: 'Elena Petrova', orgId: null, orgName: '', profileHandle: '@elena_p', content: 'Moscow office tour 🏢 Day in the life of a consultant [Video: 45s office walkthrough]', likes: 1200, shares: 89, comments: 156, views: 28000, sentiment: 'neutral', aiFlagged: false, aiReason: '', mediaUrl: '', hasMedia: true, timestamp: '2026-03-24 07:00', timeAgo: '3h', tags: ['video', 'moscow', 'office'] },
    { id: 'sp-07', scraperId: 'sc-10', platform: 'Instagram', contentType: 'photo', personId: 12, personName: 'Ivan Babić', orgId: null, orgName: '', profileHandle: '@babic_ivan', content: 'New wheels 🚗💨 [Photo: Audi A6 in parking garage]', likes: 156, shares: 4, comments: 22, views: 0, sentiment: 'flagged', aiFlagged: true, aiReason: 'Vehicle ZG-5678-CD visible in photo. Matches watchlisted plate. Parking location metadata near Savska safe house.', mediaUrl: '', hasMedia: true, timestamp: '2026-03-24 09:00', timeAgo: '1h', tags: ['photo', 'vehicle', 'plate-visible', 'safe-house-proximity'] },
    { id: 'sp-08', scraperId: 'sc-08', platform: 'LinkedIn', contentType: 'article', personId: null, personName: '', orgId: 1, orgName: 'Alpha Security Group', profileHandle: 'alpha-security-group', content: 'Alpha Security Group is proud to announce a new partnership with defense industry leaders for advanced security solutions in the Adriatic region.', likes: 45, shares: 12, comments: 8, views: 2300, sentiment: 'neutral', aiFlagged: true, aiReason: 'Keywords: "defense", "Adriatic". New partnership announcement may indicate expansion of procurement network.', mediaUrl: '', hasMedia: false, timestamp: '2026-03-24 09:00', timeAgo: '1h', tags: ['article', 'defense', 'partnership', 'keyword-flag'] },
    { id: 'sp-09', scraperId: 'sc-18', platform: 'X', contentType: 'post', personId: null, personName: '', orgId: 1, orgName: 'Alpha Security Group', profileHandle: '@asg_official', content: 'Our team at the Zagreb Security Forum 2026. Shaping the future of defense. #SecurityForum #Zagreb', likes: 67, shares: 23, comments: 5, views: 3400, sentiment: 'positive', aiFlagged: false, aiReason: '', mediaUrl: '', hasMedia: true, timestamp: '2026-03-24 10:00', timeAgo: '14m', tags: ['event', 'forum', 'public'] },
    { id: 'sp-10', scraperId: 'sc-17', platform: 'Telegram', contentType: 'post', personId: 7, personName: 'Omar Hassan', orgId: 5, orgName: 'Falcon Trading LLC', profileHandle: 'falcon_ops', content: 'Warehouse inspection complete. Everything in order for next week. 🏭✅', likes: 0, shares: 0, comments: 2, views: 0, sentiment: 'flagged', aiFlagged: true, aiReason: 'Keywords: "warehouse", "next week". Consistent with storage facility visit pattern (4 visits in 7 days).', mediaUrl: '', hasMedia: false, timestamp: '2026-03-24 08:45', timeAgo: '1h', tags: ['warehouse', 'keyword-flag', 'storage-pattern'] },
    { id: 'sp-11', scraperId: 'sc-05', platform: 'X', contentType: 'post', personId: 9, personName: 'Carlos Mendoza', orgId: null, orgName: '', profileHandle: '@mendoza_carlos', content: 'RT @shipping_news: Major port expansion planned for Zagreb docks. Infrastructure investment expected.', likes: 8, shares: 34, comments: 0, views: 890, sentiment: 'neutral', aiFlagged: true, aiReason: 'Retweet about Zagreb port infrastructure. Subject monitoring port developments matches operational pattern.', mediaUrl: '', hasMedia: false, timestamp: '2026-03-24 07:30', timeAgo: '3h', tags: ['retweet', 'port', 'infrastructure'] },
    { id: 'sp-12', scraperId: 'sc-02', platform: 'LinkedIn', contentType: 'post', personId: 1, personName: 'Marko Horvat', orgId: null, orgName: '', profileHandle: 'markohorvat', content: 'Proud to celebrate 15 years in the security industry. From military service to leading Alpha Security Group. The journey continues.', likes: 312, shares: 45, comments: 67, views: 8900, sentiment: 'positive', aiFlagged: false, aiReason: '', mediaUrl: '', hasMedia: false, timestamp: '2026-03-22 10:00', timeAgo: '2d', tags: ['career', 'milestone', 'public'] },
    { id: 'sp-13', scraperId: 'sc-06', platform: 'Telegram', contentType: 'post', personId: 9, personName: 'Carlos Mendoza', orgId: 6, orgName: 'Mendoza Import-Export SA', profileHandle: 'mendoza_group', content: 'Driver confirmed. Route B. No stops. 🚛', likes: 0, shares: 0, comments: 1, views: 0, sentiment: 'flagged', aiFlagged: true, aiReason: 'CRITICAL: Operational language. "Route B" suggests alternate/evasive route. "No stops" indicates urgency. Cross-ref with GPS speed anomaly.', mediaUrl: '', hasMedia: false, timestamp: '2026-03-24 01:15', timeAgo: '9h', tags: ['CRITICAL', 'operational', 'route', 'night', 'evasive'] },
    { id: 'sp-14', scraperId: 'sc-03', platform: 'Instagram', contentType: 'story', personId: 2, personName: 'Ana Kovačević', orgId: null, orgName: '', profileHandle: '@ana.kov', content: '[Story: Coffee at Zagreb Esplanade hotel — 24h expiry]', likes: 0, shares: 0, comments: 0, views: 345, sentiment: 'neutral', aiFlagged: false, aiReason: '', mediaUrl: '', hasMedia: true, timestamp: '2026-03-24 09:15', timeAgo: '59m', tags: ['story', 'zagreb', 'hotel'] },
    { id: 'sp-15', scraperId: 'sc-16', platform: 'Facebook', contentType: 'post', personId: null, personName: '', orgId: 5, orgName: 'Falcon Trading LLC', profileHandle: '@falcontrading', content: 'Falcon Trading expanding operations in the Mediterranean. New office opening in Limassol, Cyprus. 🏛️', likes: 23, shares: 5, comments: 3, views: 0, sentiment: 'flagged', aiFlagged: true, aiReason: 'Cyprus expansion: Known shell company jurisdiction. Financial intel should cross-ref with GLACIER AML data.', mediaUrl: '', hasMedia: false, timestamp: '2026-03-23 14:00', timeAgo: '20h', tags: ['expansion', 'cyprus', 'shell-company-risk', 'AML-flag'] },
    { id: 'sp-16', scraperId: 'sc-05', platform: 'X', contentType: 'post', personId: 9, personName: 'Carlos Mendoza', orgId: null, orgName: '', profileHandle: '@mendoza_carlos', content: 'New phone, who dis? 📱 Fresh start.', likes: 12, shares: 1, comments: 3, views: 560, sentiment: 'flagged', aiFlagged: true, aiReason: 'SIM swap reference. Posted 30min after IMSI change detected. Confirms counter-surveillance awareness.', mediaUrl: '', hasMedia: false, timestamp: '2026-03-24 03:15', timeAgo: '7h', tags: ['sim-swap', 'counter-surv', 'phone-change', 'cross-ref-imsi'] },
    { id: 'sp-17', scraperId: 'sc-17', platform: 'Telegram', contentType: 'post', personId: 7, personName: 'Omar Hassan', orgId: 5, orgName: 'Falcon Trading LLC', profileHandle: 'falcon_ops', content: 'Meeting moved to 16:00. Storage unit B. Bring keys. 🔑', likes: 0, shares: 0, comments: 0, views: 0, sentiment: 'flagged', aiFlagged: true, aiReason: 'Storage unit reference matches Hassan visit pattern (48h intervals). "Bring keys" indicates physical access to materials.', mediaUrl: '', hasMedia: false, timestamp: '2026-03-23 14:30', timeAgo: '20h', tags: ['storage', 'meeting', 'keys', 'pattern-match'] },
];

const allPlatforms = Object.keys(platformConfig) as Platform[];
const allPersonsInScrapers = [...new Set(mockScrapers.filter(s => s.personName).map(s => ({ id: s.personId!, name: s.personName })))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number; name: string }[]);
const allOrgsInScrapers = [...new Set(mockScrapers.filter(s => s.orgName).map(s => ({ id: s.orgId!, name: s.orgName })))].reduce((acc, cur) => { if (!acc.find(a => a.id === cur.id)) acc.push(cur); return acc; }, [] as { id: number; name: string }[]);

type ViewTab = 'feed' | 'scrapers' | 'flagged';

function ScraperIndex() {
    const [tab, setTab] = useState<ViewTab>('feed');
    const [search, setSearch] = useState('');
    const [platformF, setPlatformF] = useState<Platform | 'all'>('all');
    const [personF, setPersonF] = useState<number | 'all'>('all');
    const [orgF, setOrgF] = useState<number | 'all'>('all');
    const [sentimentF, setSentimentF] = useState<Sentiment | 'all'>('all');
    const [contentF, setContentF] = useState<ContentType | 'all'>('all');
    const [selPost, setSelPost] = useState<string | null>(null);

    const post = selPost ? mockPosts.find(p => p.id === selPost) : null;

    const filtered = useMemo(() => mockPosts.filter(p => {
        if (platformF !== 'all' && p.platform !== platformF) return false;
        if (personF !== 'all' && p.personId !== personF) return false;
        if (orgF !== 'all' && p.orgId !== orgF) return false;
        if (sentimentF !== 'all' && p.sentiment !== sentimentF) return false;
        if (contentF !== 'all' && p.contentType !== contentF) return false;
        if (search && !p.content.toLowerCase().includes(search.toLowerCase()) && !p.personName.toLowerCase().includes(search.toLowerCase()) && !p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
    }), [platformF, personF, orgF, sentimentF, contentF, search]);

    const flaggedPosts = mockPosts.filter(p => p.aiFlagged);
    const stats = { scrapers: mockScrapers.length, active: mockScrapers.filter(s => s.status === 'Active').length, posts: mockPosts.length, flagged: flaggedPosts.length, totalCollected: mockScrapers.reduce((s, sc) => s + sc.totalPosts, 0) };

    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

    return (<>
        <PageMeta title="Social Scraper" />
        <div style={{ display: 'flex', height: 'calc(100vh - 90px)', margin: '-24px -24px -80px 0', overflow: 'hidden' }}>

            {/* LEFT */}
            <div style={{ width: 210, flexShrink: 0, borderRight: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', flexDirection: 'column' as const, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#06b6d410', border: '1px solid #06b6d425', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📱</div>
                        <div><div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>SCRAPER</div><div style={{ fontSize: 7, color: theme.textDim }}>Social Media OSINT</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '0 7px' }}>
                        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke={theme.textDim} strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10" y1="10" x2="13" y2="13"/></svg>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content..." style={{ background: 'transparent', border: 'none', outline: 'none', padding: '5px 0', color: theme.text, fontSize: 10, fontFamily: 'inherit', flex: 1, minWidth: 0 }} />
                    </div>
                </div>

                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 3 }}>
                    {[{ n: stats.scrapers, l: 'Scrap', c: theme.accent }, { n: stats.active, l: 'Live', c: '#22c55e' }, { n: stats.posts, l: 'Posts', c: '#3b82f6' }, { n: stats.flagged, l: 'Flag', c: '#ef4444' }].map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const, padding: '3px 0' }}><div style={{ fontSize: 13, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Platform filter */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Platform</div>
                    <button onClick={() => setPlatformF('all')} style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: platformF === 'all' ? `${theme.accent}08` : 'transparent', color: platformF === 'all' ? theme.accent : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${platformF === 'all' ? theme.accent : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}>All Platforms</button>
                    {allPlatforms.map(p => { const pc = platformConfig[p]; const c = mockPosts.filter(pp => pp.platform === p).length; const sc = mockScrapers.filter(s => s.platform === p).length; if (sc === 0) return null; return <button key={p} onClick={() => setPlatformF(p)} style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', padding: '3px 8px', border: 'none', borderRadius: 3, background: platformF === p ? `${pc.color}12` : 'transparent', color: platformF === p ? theme.text : theme.textDim, cursor: 'pointer', fontFamily: 'inherit', fontSize: 8, borderLeft: `2px solid ${platformF === p ? pc.color : 'transparent'}`, textAlign: 'left' as const, marginBottom: 1 }}><span>{pc.icon}</span><span style={{ flex: 1 }}>{pc.label}</span><span style={{ fontSize: 7, fontFamily: "'JetBrains Mono',monospace" }}>{c}</span></button>; })}
                </div>

                {/* Person / Org / Sentiment */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Person</div><select value={personF === 'all' ? 'all' : String(personF)} onChange={e => setPersonF(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Persons</option>{allPersonsInScrapers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Organization</div><select value={orgF === 'all' ? 'all' : String(orgF)} onChange={e => setOrgF(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Organizations</option>{allOrgsInScrapers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>AI Sentiment</div><div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                        {(['all', 'flagged', 'negative', 'neutral', 'positive'] as const).map(s => <button key={s} onClick={() => setSentimentF(s as any)} style={{ padding: '2px 5px', borderRadius: 3, border: `1px solid ${sentimentF === s ? (s === 'all' ? theme.accent : sentimentColors[s as Sentiment]) + '40' : theme.border}`, background: sentimentF === s ? `${s === 'all' ? theme.accent : sentimentColors[s as Sentiment]}08` : 'transparent', color: sentimentF === s ? (s === 'all' ? theme.accent : sentimentColors[s as Sentiment]) : theme.textDim, fontSize: 7, cursor: 'pointer', fontFamily: 'inherit' }}>{s === 'flagged' ? '🚩' : ''}{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
                    </div></div>
                    <div><div style={{ fontSize: 8, fontWeight: 700, color: theme.textDim, marginBottom: 2 }}>Content Type</div><select value={contentF} onChange={e => setContentF(e.target.value as any)} style={{ width: '100%', padding: '3px 6px', borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: 9, fontFamily: 'inherit', outline: 'none' }}><option value="all">All Types</option>{(Object.keys(contentIcons) as ContentType[]).map(c => <option key={c} value={c}>{contentIcons[c]} {c}</option>)}</select></div>
                </div>

                <div style={{ padding: '8px 12px', marginTop: 'auto' }}>
                    {[{ l: '🧑 Persons', h: '/persons' }, { l: '🏢 Organizations', h: '/organizations' }, { l: '📊 Activity', h: '/activity' }, { l: '📁 Storage', h: '/storage' }].map(lk => <a key={lk.h} href={lk.h} style={{ display: 'block', fontSize: 8, color: theme.textDim, textDecoration: 'none', padding: '2px 0' }}>{lk.l}</a>)}
                </div>
            </div>

            {/* CENTER */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0 }}>
                <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    {[{ id: 'feed' as ViewTab, l: '📋 Content Feed', n: filtered.length }, { id: 'flagged' as ViewTab, l: '🚩 AI Flagged', n: flaggedPosts.length }, { id: 'scrapers' as ViewTab, l: '⚙️ Scrapers', n: mockScrapers.length }].map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 14px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#06b6d4' : 'transparent'}`, background: 'transparent', color: tab === t.id ? theme.text : theme.textDim, fontSize: 10, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>{t.l} <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: `${tab === t.id ? '#06b6d4' : theme.border}20`, color: tab === t.id ? '#06b6d4' : theme.textDim }}>{t.n}</span></button>)}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {/* ═══ CONTENT FEED ═══ */}
                    {(tab === 'feed' || tab === 'flagged') && <>
                        {(tab === 'flagged' ? flaggedPosts : filtered).length === 0 && <div style={{ padding: 40, textAlign: 'center' as const }}><div style={{ fontSize: 28, opacity: 0.2 }}>📱</div><div style={{ fontSize: 13, fontWeight: 700, color: theme.textSecondary, marginTop: 4 }}>No posts match</div></div>}
                        {(tab === 'flagged' ? flaggedPosts : filtered).map(p => {
                            const pc = platformConfig[p.platform]; const sel = selPost === p.id;
                            return <div key={p.id} onClick={() => setSelPost(p.id)} style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}06`, cursor: 'pointer', background: sel ? `${pc.color}06` : p.aiFlagged ? '#ef444404' : 'transparent', borderLeft: `3px solid ${sel ? pc.color : p.aiFlagged ? '#ef4444' : 'transparent'}`, transition: 'all 0.1s' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                    {/* Platform icon */}
                                    <div style={{ width: 32, height: 32, borderRadius: 6, background: `${pc.color}15`, border: `1px solid ${pc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{pc.icon}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                                            <span style={{ fontSize: 9, fontWeight: 700, color: theme.text }}>{p.personName || p.orgName}</span>
                                            <span style={{ fontSize: 7, color: theme.textDim }}>{p.profileHandle}</span>
                                            <span style={{ fontSize: 7, color: pc.color, fontWeight: 600 }}>{pc.label}</span>
                                            <span style={{ fontSize: 7, color: theme.textDim, marginLeft: 'auto' }}>{p.timeAgo}</span>
                                        </div>
                                        {/* Content */}
                                        <div style={{ fontSize: 10, color: theme.text, lineHeight: 1.5, marginBottom: 6 }}>{p.content}</div>
                                        {/* Media indicator */}
                                        {p.hasMedia && <div style={{ width: '100%', height: 50, borderRadius: 4, background: `${theme.border}08`, border: `1px solid ${theme.border}`, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textDim, fontSize: 8 }}>{contentIcons[p.contentType]} {p.contentType === 'photo' ? 'Photo' : p.contentType === 'video' ? 'Video' : p.contentType === 'reel' ? 'Reel' : 'Story'} attachment</div>}
                                        {/* Engagement + tags */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
                                            <div style={{ display: 'flex', gap: 6, fontSize: 7, color: theme.textDim }}>
                                                {p.likes > 0 && <span>❤️ {fmt(p.likes)}</span>}
                                                {p.shares > 0 && <span>🔄 {fmt(p.shares)}</span>}
                                                {p.comments > 0 && <span>💬 {p.comments}</span>}
                                                {p.views > 0 && <span>👁️ {fmt(p.views)}</span>}
                                            </div>
                                            {p.aiFlagged && <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: '#ef444412', color: '#ef4444' }}>🚩 AI Flagged</span>}
                                            <span style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${sentimentColors[p.sentiment]}10`, color: sentimentColors[p.sentiment] }}>{p.sentiment}</span>
                                            <span style={{ fontSize: 7, padding: '1px 4px', borderRadius: 2, background: `${theme.border}15`, color: theme.textDim }}>{contentIcons[p.contentType]} {p.contentType}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>;
                        })}
                    </>}

                    {/* ═══ SCRAPERS ═══ */}
                    {tab === 'scrapers' && <div style={{ padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>{mockScrapers.length} Active Scrapers · {fmt(stats.totalCollected)} posts collected</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                            {mockScrapers.map(s => { const pc = platformConfig[s.platform]; const sc = statusColors[s.status];
                                return <div key={s.id} style={{ padding: '12px', borderRadius: 8, border: `1px solid ${sc}20`, background: `${sc}03` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${pc.color}15`, border: `1px solid ${pc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{pc.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{s.profileHandle}</div>
                                            <div style={{ fontSize: 7, color: theme.textDim }}>{pc.label} · {s.personName || s.orgName}</div>
                                        </div>
                                        <span style={{ fontSize: 7, fontWeight: 700, color: sc, padding: '2px 5px', borderRadius: 3, background: `${sc}12` }}>{s.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 8, color: theme.textDim }}>
                                        <span>📝 {s.totalPosts} posts</span>
                                        {s.newPosts > 0 && <span style={{ color: '#22c55e', fontWeight: 700 }}>+{s.newPosts} new</span>}
                                        <span>⏱️ {s.interval}</span>
                                    </div>
                                    {s.keywords.length > 0 && <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const, marginBottom: 6 }}>
                                        {s.keywords.slice(0, 4).map(k => <span key={k} style={{ fontSize: 6, padding: '1px 4px', borderRadius: 2, background: `${theme.border}20`, color: theme.textDim }}>{k}</span>)}
                                        {s.keywords.length > 4 && <span style={{ fontSize: 6, color: theme.textDim }}>+{s.keywords.length - 4}</span>}
                                    </div>}
                                    <div style={{ display: 'flex', gap: 3 }}>
                                        {s.personId && <a href={`/persons/${s.personId}`} onClick={e => e.stopPropagation()} style={{ fontSize: 7, color: theme.accent, textDecoration: 'none' }}>🧑 {s.personName.split(' ')[0]}</a>}
                                        {s.orgId && <a href={`/organizations/${s.orgId}`} onClick={e => e.stopPropagation()} style={{ fontSize: 7, color: '#8b5cf6', textDecoration: 'none' }}>🏢 {s.orgName.split(' ').slice(0, 2).join(' ')}</a>}
                                        {s.operationCode && <span style={{ fontSize: 7, color: theme.accent }}>{s.operationCode}</span>}
                                        <span style={{ fontSize: 7, color: theme.textDim, marginLeft: 'auto' }}>{s.lastRun.slice(5)}</span>
                                    </div>
                                </div>;
                            })}
                        </div>
                    </div>}
                </div>

                <div style={{ padding: '3px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, fontSize: 7, color: theme.textDim, background: theme.bg }}>
                    <span>{stats.scrapers} scrapers · {fmt(stats.totalCollected)} collected · {stats.flagged} AI-flagged</span>
                    <div style={{ flex: 1 }} /><span>NLP Sentiment · gRPC · On-Premise</span><span>·</span><span style={{ fontWeight: 600, color: '#ef4444' }}>CLASSIFIED // NOFORN</span>
                </div>
            </div>

            {/* RIGHT: Post Detail */}
            {post && (tab === 'feed' || tab === 'flagged') && <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${theme.border}`, background: theme.bgCard, overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column' as const }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${platformConfig[post.platform].color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{platformConfig[post.platform].icon}</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, color: theme.text }}>{post.personName || post.orgName}</div><div style={{ fontSize: 7, color: theme.textDim }}>{post.profileHandle} · {platformConfig[post.platform].label}</div></div>
                        <button onClick={() => setSelPost(null)} style={{ width: 18, height: 18, borderRadius: 3, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, color: theme.text, lineHeight: 1.6 }}>{post.content}</div>

                {/* AI Flag */}
                {post.aiFlagged && <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, background: '#ef444406' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', marginBottom: 3 }}>🚩 AI Intelligence Flag</div>
                    <div style={{ fontSize: 8, color: theme.textSecondary, lineHeight: 1.5 }}>{post.aiReason}</div>
                </div>}

                {/* Engagement */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 6 }}>
                    {[{ n: post.likes, l: '❤️ Likes' }, { n: post.shares, l: '🔄 Shares' }, { n: post.comments, l: '💬 Cmts' }, { n: post.views, l: '👁️ Views' }].filter(s => s.n > 0).map(s => <div key={s.l} style={{ flex: 1, textAlign: 'center' as const }}><div style={{ fontSize: 12, fontWeight: 800, color: theme.text, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(s.n)}</div><div style={{ fontSize: 6, color: theme.textDim }}>{s.l}</div></div>)}
                </div>

                {/* Details */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                    {[
                        { l: 'Platform', v: platformConfig[post.platform].label },
                        { l: 'Content Type', v: `${contentIcons[post.contentType]} ${post.contentType}` },
                        { l: 'Sentiment', v: post.sentiment },
                        { l: 'Timestamp', v: post.timestamp },
                        { l: 'Profile', v: post.profileHandle },
                    ].map(r => <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><span style={{ fontSize: 7, color: theme.textDim }}>{r.l}</span><span style={{ fontSize: 7, color: r.l === 'Sentiment' ? sentimentColors[post.sentiment] : theme.text, fontWeight: r.l === 'Sentiment' ? 700 : 400 }}>{r.v}</span></div>)}
                </div>

                {/* Tags */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' as const }}>
                        {post.tags.map(t => <span key={t} style={{ fontSize: 7, padding: '2px 5px', borderRadius: 3, background: t === 'CRITICAL' ? '#ef444415' : t.includes('flag') || t.includes('cross-ref') ? '#f59e0b10' : `${theme.border}20`, color: t === 'CRITICAL' ? '#ef4444' : t.includes('flag') || t.includes('cross-ref') ? '#f59e0b' : theme.textSecondary, fontWeight: t === 'CRITICAL' ? 800 : 400 }}>{t}</span>)}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '8px 12px', display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginTop: 'auto' }}>
                    {post.personId && <a href={`/persons/${post.personId}`} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.accent}30`, background: `${theme.accent}06`, color: theme.accent, textDecoration: 'none', fontSize: 8, fontWeight: 700, textAlign: 'center' as const }}>🧑 Profile</a>}
                    {post.orgId && <a href={`/organizations/${post.orgId}`} style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid #8b5cf630`, background: '#8b5cf606', color: '#8b5cf6', textDecoration: 'none', fontSize: 8, fontWeight: 700, textAlign: 'center' as const }}>🏢 Org</a>}
                    <a href="/activity" style={{ flex: 1, padding: '5px', borderRadius: 4, border: `1px solid ${theme.border}`, color: theme.textDim, textDecoration: 'none', fontSize: 8, textAlign: 'center' as const }}>📊 Activity</a>
                </div>
            </div>}
        </div>
    </>);
}

ScraperIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
export default ScraperIndex;
