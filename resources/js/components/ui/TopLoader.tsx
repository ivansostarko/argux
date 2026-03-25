/**
 * ARGUX — Global Top Loader
 * Animated gradient progress bar that sits at the top of the app layout.
 * Any page can trigger it via the useTopLoader() hook.
 *
 * Usage:
 *   import { useTopLoader } from '@/components/ui/TopLoader';
 *   const { trigger } = useTopLoader();
 *   trigger(); // fires the loader animation
 */
import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

interface TopLoaderContextValue {
    /** Fire the top loader animation (30% → 70% → 100% → fade) */
    trigger: () => void;
    /** Current progress value (0 = hidden) */
    progress: number;
}

const TopLoaderContext = createContext<TopLoaderContextValue>({ trigger: () => {}, progress: 0 });

export function useTopLoader() { return useContext(TopLoaderContext); }

export function TopLoaderProvider({ children, accentColor = 'var(--ax-accent, #3b82f6)' }: { children: ReactNode; accentColor?: string }) {
    const [progress, setProgress] = useState(0);
    const timer = useRef<number | null>(null);

    const trigger = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        setProgress(30);
        timer.current = window.setTimeout(() => {
            setProgress(70);
            timer.current = window.setTimeout(() => {
                setProgress(100);
                timer.current = window.setTimeout(() => setProgress(0), 400);
            }, 200);
        }, 150);
    }, []);

    return (
        <TopLoaderContext.Provider value={{ trigger, progress }}>
            {progress > 0 && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${accentColor}, #8b5cf6, #ec4899)`,
                        borderRadius: '0 2px 2px 0',
                        transition: progress === 100 ? 'width 0.2s ease-out, opacity 0.4s ease-out' : 'width 0.3s ease-out',
                        opacity: progress === 100 ? 0 : 1,
                        boxShadow: `0 0 10px color-mix(in srgb, ${accentColor} 60%, transparent), 0 0 4px color-mix(in srgb, ${accentColor} 40%, transparent)`,
                    }}>
                        <div style={{ position: 'absolute' as const, right: 0, top: 0, width: 60, height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3))', animation: 'ax-loader-shimmer 0.8s ease-in-out infinite' }} />
                    </div>
                </div>
            )}
            <style>{`@keyframes ax-loader-shimmer { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
            {children}
        </TopLoaderContext.Provider>
    );
}
