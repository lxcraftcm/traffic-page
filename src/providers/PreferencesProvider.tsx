'use client';
import {GeneralSetting} from "@/app/api/systemSetting/generalSetting/route";
import React, {createContext, useContext, useEffect, useState} from "react";
import {getLocalStorage, setLocalStorage} from "@/utils/StorageUtil";
import {SupportedLanguage} from "@/i18n/config";

interface ThemeContextType {
    generalSetting: GeneralSetting;
    userPreferences: UserPreferences;
    setPreferences: (key: keyof UserPreferences, value: any) => void;
}

interface UserPreferences {
    theme?: SupportedTheme;
    networkType?: NetworkType;
    language?: SupportedLanguage;
}

export type SupportedTheme = 'light' | 'dark';

export type NetworkType = 'external' | 'internal';

const PreferencesContext = createContext<ThemeContextType | null>(null);

export function PreferencesProvider({
                                        children,
                                        generalSetting
                                    }: {
    children: React.ReactNode;
    generalSetting: GeneralSetting;
}) {
    const [userPreferences, setUserPreferences] = useState<UserPreferences>({})
    const [isHydrated, setIsHydrated] = useState<boolean>(false)

    useEffect(() => {
        const init = async () => {
            setIsHydrated(true);
            const preStr = getLocalStorage("userPreferences");
            if (preStr) {
                const preObj = JSON.parse(preStr) as UserPreferences;
                if (preObj) setUserPreferences(preObj);
            }
        }
        init();
    }, []);

    useEffect(() => {
        setLocalStorage("userPreferences", JSON.stringify(userPreferences))
    }, [userPreferences]);

    const setPreferences = (key: keyof UserPreferences, value: any) => {
        setUserPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };


    return (
        <PreferencesContext.Provider
            value={{
                generalSetting: generalSetting,
                userPreferences: userPreferences,
                setPreferences: setPreferences
            }}
        >
            {isHydrated ? children : <div
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
                <p className="mt-4 text-gray-600">Init preferences...</p>
            </div>}
        </PreferencesContext.Provider>
    );
}


export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within PreferencesProvider');
    }
    return context;
}