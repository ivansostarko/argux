import { Head } from '@inertiajs/react';

interface PageMetaProps {
    title: string;
    description?: string;
    keywords?: string;
    classification?: string;
    section?: string;
    entityName?: string;
}

export default function PageMeta({ title, description, keywords, classification = 'CLASSIFIED // NOFORN', section, entityName }: PageMetaProps) {
    const fullTitle = title;
    const desc = description || `ARGUX Tactical Intelligence Platform — ${title}. On-premise surveillance, geospatial tracking, and intelligence analysis.`;
    const kw = keywords || `ARGUX, tactical, intelligence, surveillance, ${title.toLowerCase()}, tracking, geospatial`;

    return (
        <Head title={fullTitle}>
            <meta name="description" content={desc} />
            <meta name="keywords" content={kw} />
            <meta name="robots" content="noindex, nofollow" />
            <meta name="classification" content={classification} />
            <meta name="application-name" content="ARGUX" />
            <meta name="theme-color" content="#060810" />
            {section && <meta name="section" content={section} />}
            {entityName && <meta name="entity" content={entityName} />}
            {/* Open Graph (for internal link previews) */}
            <meta property="og:title" content={`${fullTitle} — ARGUX`} />
            <meta property="og:description" content={desc} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="ARGUX Tactical Intelligence Platform" />
        </Head>
    );
}
