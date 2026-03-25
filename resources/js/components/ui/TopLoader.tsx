/**
 * ARGUX — Global Top Loader
 *
 * Automatically shows on every Inertia page navigation.
 * Also exposes useTopLoader() hook for manual triggers from any page.
 *
 * Hooks into:
 *   - router.on('start')  → starts the loader (0% → 30% → slow crawl to 90%)
 *   - router.on('finish') → completes the loader (→ 100% → fade out)
 *   - useTopLoader().trigger() → manual quick pulse for in-page actions
 */
import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { router } from '@inertiajs/react';

interface TopLoaderContextValue {
    /** Quick pulse animation for in-page actions (30% → 70% → 100% → fade) */
    trigger: () => void;
    /** Start loader (used automatically by Inertia navigation) */
    start: () => void;
    /** Finish loader (used automatically by Inertia navigation) */
    finish: () => void;
    /** Current progress value (0 = hidden) */
    progress: number;
}

const TopLoaderContext = createContext<TopLoaderContextValue>({
    trigger: () => {}, start: () => {}, finish: () => {}, progress: 0,
});

export function useTopLoader() { return useContext(TopLoaderContext); }

export function TopLoaderProvider({ children, accentColor = 'var(--ax-accent, #3b82f6)' }: { children: ReactNode; accentColor?: string }) {
    const [progress, setProgress] = useState(0);
    const timerRef = useRef<number | null>(null);
    const crawlRef = useRef<number | null>(null);
    const activeRef = useRef(false);

    const clearTimers = useCallback(() => {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        if (crawlRef.current) { clearInterval(crawlRef.current); crawlRef.current = null; }
    }, []);

    // Start: jump to 30%, then slowly crawl toward 90% (never reaches 100% until finish)
    const start = useCallback(() => {
        clearTimers();
        activeRef.current = true;
        setProgress(30);
        // Slow crawl: +2-5% every 300ms, caps at 90%
        crawlRef.current = window.setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return 90;
                return prev + Math.random() * 3 + 2;
            });
        }, 300);
    }, [clearTimers]);

    // Finish: jump to 100%, fade out, reset
    const finish = useCallback(() => {
        clearTimers();
        activeRef.current = false;
        setProgress(100);
        timerRef.current = window.setTimeout(() => setProgress(0), 400);
    }, [clearTimers]);

    // Quick trigger for in-page actions (not navigation)
    const trigger = useCallback(() => {
        clearTimers();
        activeRef.current = false;
        setProgress(30);
        timerRef.current = window.setTimeout(() => {
            setProgress(70);
            timerRef.current = window.setTimeout(() => {
                setProgress(100);
                timerRef.current = window.setTimeout(() => setProgress(0), 400);
            }, 200);
        }, 150);
    }, [clearTimers]);

    // ═══ Inertia Router Integration ═══
    // Automatically start/finish on every page navigation
    useEffect(() => {
        const removeStart = router.on('start', () => {
            start();
        });
        const removeFinish = router.on('finish', () => {
            finish();
        });
        return () => {
            removeStart();
            removeFinish();
            clearTimers();
        };
    }, [start, finish, clearTimers]);

    return (
        <TopLoaderContext.Provider value={{ trigger, start, finish, progress }}>
            {progress > 0 && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.min(progress, 100)}%`,
                        background: `linear-gradient(90deg, ${accentColor}, #8b5cf6, #ec4899)`,
                        borderRadius: '0 2px 2px 0',
                        transition: progress === 100
                            ? 'width 0.2s ease-out, opacity 0.4s ease-out'
                            : progress <= 30
                                ? 'width 0.1s ease-out'
                                : 'width 0.6s ease-out',
                        opacity: progress === 100 ? 0 : 1,
                        boxShadow: `0 0 10px color-mix(in srgb, ${accentColor} 60%, transparent), 0 0 4px color-mix(in srgb, ${accentColor} 40%, transparent)`,
                    }}>
                        <div style={{ position: 'absolute' as const, right: 0, top: 0, width: 80, height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3))', animation: 'ax-loader-shimmer 0.8s ease-in-out infinite' }} />
                    </div>
                </div>
            )}
            <style>{`@keyframes ax-loader-shimmer { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
            {children}
        </TopLoaderContext.Provider>
    );
}
