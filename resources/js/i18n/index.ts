import enAuth from './locales/en/auth.json';
import hrAuth from './locales/hr/auth.json';

type NestedRecord = { [key: string]: string | NestedRecord };

const dictionaries: Record<string, NestedRecord> = {
    en: enAuth as NestedRecord,
    hr: hrAuth as NestedRecord,
};

function resolve(obj: NestedRecord, path: string): string {
    const parts = path.split('.');
    let current: string | NestedRecord = obj;
    for (const part of parts) {
        if (typeof current !== 'object' || current === null) return path;
        current = current[part];
    }
    return typeof current === 'string' ? current : path;
}

export function t(key: string, locale: string = 'en', params?: Record<string, string>): string {
    const dict = dictionaries[locale] || dictionaries.en;
    let result = resolve(dict, key);
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            result = result.replace(`{${k}}`, v);
        });
    }
    return result;
}
