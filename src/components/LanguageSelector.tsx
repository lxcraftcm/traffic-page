'use client';
import React, {useEffect, useRef, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faGlobe, faChevronDown, faCheck} from '@fortawesome/free-solid-svg-icons';
import {LANGUAGE_OPTIONS} from '@/components/common/PreConstants';
import {useLocale} from "use-intl";
import {setLocale} from "@/lib/i18n";

interface LanguageSelectorProps {
    className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({className}) => {
    const locale = useLocale();
    const [selectedLanguage, setSelectedLanguage] = useState(locale);
    const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 点击外部关闭语言切换
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsLanguageSelectorOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 切换语言
    const handleLanguageChange = (code: string) => {
        setLocale(code).then(() => {
            setSelectedLanguage(code);
            setIsLanguageSelectorOpen(false);
        });
    };

    // 获取当前语言名称
    const getCurrentLanguageName = () => {
        const language = LANGUAGE_OPTIONS.find(option => option.code === selectedLanguage);
        return language ? language.nativeName : 'English';
    };

    return (
        <div ref={dropdownRef} className="relative inline-block">
            {/* 触发按钮 */}
            <button onClick={() => setIsLanguageSelectorOpen(!isLanguageSelectorOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.75 rounded-md cursor-pointer bg-slate-100 dark:bg-slate-800 border border-slate-200
                    dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-200
                    dark:hover:bg-slate-700 transition-all duration-200  focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
                    aria-expanded={isLanguageSelectorOpen}
            >
                <FontAwesomeIcon icon={faGlobe} className="h-4 w-4 text-indigo-500"/>
                <span>{getCurrentLanguageName()}</span>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${isLanguageSelectorOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* 下拉菜单 */}
            <div className={`absolute z-50 mt-1 w-44 rounded-md bg-white dark:bg-slate-800  border border-slate-200 dark:border-slate-700  
            shadow-md  overflow-hidden transition-opacity duration-200
             ${isLanguageSelectorOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                {LANGUAGE_OPTIONS.map(option => (
                    <button
                        key={option.code}
                        onClick={() => handleLanguageChange(option.code)}
                        className={`w-full flex items-center justify-between px-3 py-1.75 text-sm
                        transition-colors duration-150 cursor-pointer
                        ${selectedLanguage === option.code
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-900/10'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                        }`}
                    >
                        <span>{option.nativeName}</span>
                        {selectedLanguage === option.code && (
                            <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5"/>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default LanguageSelector;