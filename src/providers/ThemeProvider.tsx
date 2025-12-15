'use client'
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {getLocalStorage, removeLocalStorage, setLocalStorage} from "@/utils/StorageUtil";
import {usePreferences} from "@/providers/PreferencesProvider";

type SupportedTheme = 'light' | 'dark';

interface ThemeContextType {
    theme: SupportedTheme;
    setTheme: (theme: SupportedTheme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const getPreference = () => {
    return getLocalStorage("theme");
}

const setPreference = (theme: SupportedTheme) => {
    return setLocalStorage("theme", theme);
}

const clearPreference = () => {
    removeLocalStorage("theme");
}

// 检测浏览器设置的网站配色偏好
const getBrowserColorScheme = () => {
    if (typeof window === 'undefined') return 'light';

    // 标准检测方法
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    // 注意：当用户明确设置时，只有一个会为 true
    if (isDark) return 'dark';
    if (isLight) return 'light';

    return null;
};

export function ThemeProvider({children}: { children: ReactNode }) {
    const {generalSetting} = usePreferences()
    // 是否更随浏览器
    const isAuto = generalSetting.defaultTheme === 'auto';
    const defaultTheme = generalSetting.defaultTheme === 'auto' ? 'light' : generalSetting.defaultTheme;

    const [theme, setTheme] = useState<SupportedTheme>(defaultTheme);
    const setHtml = (theme: string) => {
        const html = document.documentElement;
        // 移除旧的类
        html.classList.remove('light', 'dark');
        // 添加新类
        html.classList.add(theme);
    }

    // 设置主题
    const updateTheme = (newTheme?: SupportedTheme) => {
        if (!newTheme) {
            if (isAuto) {
                const browserColorScheme = getBrowserColorScheme();
                newTheme = browserColorScheme ? browserColorScheme : defaultTheme;
            } else {
                newTheme = defaultTheme;
            }
        }
        setTheme(newTheme);
        setHtml(newTheme);
        // 偏好设置
        if (isAuto && newTheme === getBrowserColorScheme()) {
            // 在更随浏览器设置 并且偏好和浏览器相同时 删除本地偏好
            clearPreference();
        } else {
            setPreference(newTheme);
        }

    };

    // 切换主题
    const toggleTheme = () => {
        updateTheme(theme === 'light' ? 'dark' : 'light');
    };

    // 监听浏览器设置
    const browserColorSchemeListener = () => {
        if (isAuto) {
            const preference = getPreference();
            if (!preference) {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setTheme(isDark ? 'dark' : 'light');
                setHtml(isDark ? 'dark' : 'light');
            }
        }
    }

    useEffect(() => {
        const init = async () => {
            const preference = getPreference();
            updateTheme(preference as SupportedTheme);
            // 增加监听浏览器设置
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', browserColorSchemeListener);
        };
        init();
    }, []);


    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}