'use client'

import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMoon, faSun} from "@fortawesome/free-solid-svg-icons";
import {useTheme} from "@/providers/ThemeProvider";
import {useAppTranslation} from "@/providers/I18nProvider";

interface ThemeSelectorProps {
    className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({className}) => {
    const {theme, toggleTheme} = useTheme()
    // 翻译钩子
    const {t} = useAppTranslation('ThemeSelector');
    const isDarkMode = theme === 'dark';
    return (
        <button
            onClick={() => {
                toggleTheme()
            }}
            className={`
                p-2 rounded-full transition-all duration-300 ease-in-out
                flex items-center justify-center shadow-sm cursor-pointer
                dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700
                bg-slate-100 text-slate-700 hover:bg-slate-200
                hover:scale-110 active:scale-95
                dark:focus:ring-indigo-400 focus:ring-indigo-500
                ${className ? className : ''}
              `}
            aria-label={isDarkMode ? t('switchToLightMode') : t('switchToDarkMode')}
        >
            <FontAwesomeIcon
                icon={isDarkMode ? faSun : faMoon}
                className={`h-5 w-5 transition-transform duration-500 dark:rotate-0 dark:scale-100 rotate-180 scale-90`}
            />
        </button>
    )
}

export default ThemeSelector;