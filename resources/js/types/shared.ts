export interface AppConfig {
    name: string;
    version: string;
}

export interface LocaleConfig {
    current: string;
    available: string[];
}

export interface FlashMessages {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
}

export interface SharedProps {
    [key: string]: unknown;
    app: AppConfig;
    locale: LocaleConfig;
    flash: FlashMessages;
}

export interface TwoFactorProps extends SharedProps {
    maskedEmail: string;
    maskedPhone: string;
}
