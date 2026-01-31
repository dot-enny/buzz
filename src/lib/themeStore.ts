import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
    theme: Theme;
    resolvedTheme: 'dark' | 'light';
    setTheme: (theme: Theme) => void;
}

// Get system preference
const getSystemTheme = (): 'dark' | 'light' => {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
};

// Apply theme to document
const applyTheme = (theme: 'dark' | 'light') => {
    if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(theme);
        document.documentElement.setAttribute('data-theme', theme);
    }
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'dark',
            resolvedTheme: 'dark',
            setTheme: (theme: Theme) => {
                const resolved = theme === 'system' ? getSystemTheme() : theme;
                applyTheme(resolved);
                set({ theme, resolvedTheme: resolved });
            },
        }),
        {
            name: 'buzz-theme',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    const resolved = state.theme === 'system' ? getSystemTheme() : state.theme;
                    applyTheme(resolved);
                    state.resolvedTheme = resolved;
                }
            },
        }
    )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const state = useThemeStore.getState();
        if (state.theme === 'system') {
            const resolved = e.matches ? 'dark' : 'light';
            applyTheme(resolved);
            useThemeStore.setState({ resolvedTheme: resolved });
        }
    });
}
