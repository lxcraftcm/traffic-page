'use client';

import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {I18nextProvider, useTranslation} from 'react-i18next';
import {defaultPreference, i18nInstance} from '@/i18n/config';
import {usePreferences} from "@/providers/PreferencesProvider";

interface I18nContextType {
    language: string;
    supportedLanguages: Array<{
        code: string;
        name: string;
        nativeName: string;
    }>;
    changeLanguage: (languageCode: string) => Promise<void>;
    isChanging: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({children}: { children: ReactNode }) {
    const [language, setLanguage] = useState<string>(defaultPreference);
    const [supportedLanguages, setSupportedLanguages] = useState<I18nContextType['supportedLanguages']>([]);
    const [isChanging, setIsChanging] = useState(false);
    const [i18n, setI18n] = useState<any>(null);
    const {generalSetting, userPreferences, setPreferences} = usePreferences();

    // 初始化 i18n 实例
    useEffect(() => {
        const init = async () => {
            const instance = await i18nInstance.initialize(generalSetting.defaultLanguage, userPreferences.language);
            setI18n(instance);
            // 获取当前语言
            setLanguage(instance.language);
            // 获取支持的语言列表
            setSupportedLanguages(i18nInstance.getSupportedLanguages());
        };
        init();
    }, []);

    // 切换语言
    const changeLanguage = async (languageCode: string) => {
        if (!i18n || languageCode === language || isChanging) return;

        setIsChanging(true);
        try {
            await i18n.changeLanguage(languageCode);
            setLanguage(languageCode);

            // 同时更新偏好存储
            setPreferences('language', languageCode);
        } catch (error) {
            console.error('Failed to change language:', error);
        } finally {
            setIsChanging(false);
        }
    };

    // 如果 i18n 还没初始化，显示加载状态
    if (!i18n) {
        return (
            <div
                className="absolute flex flex-col inset-0 bg-white/10 dark:bg-slate-800/10 items-center justify-center z-50 backdrop-blur-sm transition-all duration-300 ease-in-out">
                <div className="relative">
                    <div className="w-14 h-14 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30"/>
                    <div
                        className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-indigo-500 dark:border-t-indigo-400 animate-spin [animation-duration:1.2s] [animation-timing-function:cubic-bezier(0.4,0,0.2,1)]"/>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 opacity-70"/>
                    </div>
                    <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 blur-md"/>
                </div>
                <p className="mt-4 text-gray-600">Init language...</p>
            </div>
        );
    }

    return (
        <I18nextProvider i18n={i18n}>
            <I18nContext.Provider
                value={{
                    language,
                    supportedLanguages,
                    changeLanguage,
                    isChanging,
                }}
            >
                {children}
            </I18nContext.Provider>
        </I18nextProvider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}

// 简化的翻译 hook，集成了偏好
export function useAppTranslation(preKey?: string) {
    const {t, i18n} = useTranslation();
    const {language, changeLanguage} = useI18n();

    return {
        t: (key: string, values?: Record<string, any>) => t((preKey ? preKey + "." : "") + key, values),
        i18n,
        currentLanguage: language,
        changeLanguage
    };
}