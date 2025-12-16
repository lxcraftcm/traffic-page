'use client';
import {GeneralSetting} from "@/app/api/systemSetting/generalSetting/route";
import React, {createContext, useContext, useEffect, useState} from "react";
import {getLocalStorage, setLocalStorage} from "@/utils/StorageUtil";
import {SupportedLanguage} from "@/i18n/config";
import CommonLoading from "@/components/common/CommonLoading";

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
            {isHydrated ? children : <CommonLoading message={'Init preferences...'}/>}
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