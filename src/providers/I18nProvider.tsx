'use client';

import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {I18nextProvider, useTranslation} from 'react-i18next';
import {i18nInstance} from '@/i18n/config';

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
    const [language, setLanguage] = useState<string>('zh-CN');
    const [supportedLanguages, setSupportedLanguages] = useState<I18nContextType['supportedLanguages']>([]);
    const [isChanging, setIsChanging] = useState(false);
    const [i18n, setI18n] = useState<any>(null);

    // 初始化 i18n 实例
    useEffect(() => {
        const init = async () => {
            const instance = await i18nInstance.initialize();
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
        console.log('languageCode',languageCode)
        if (!i18n || languageCode === language || isChanging) return;

        setIsChanging(true);
        try {
            await i18n.changeLanguage(languageCode);
            setLanguage(languageCode);

            // 同时更新偏好存储
            // setPreference('language', languageCode);
        } catch (error) {
            console.error('Failed to change language:', error);
        } finally {
            setIsChanging(false);
        }
    };

    // 如果 i18n 还没初始化，显示加载状态
    if (!i18n) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">初始化语言设置...</p>
                </div>
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