'use client';
import {GeneralSetting} from "@/app/api/systemSetting/generalSetting/route";
import {createContext, useContext, useEffect, useState} from "react";
import {getLocalStorage, setLocalStorage} from "@/utils/StorageUtil";

interface ThemeContextType {
    generalSetting: GeneralSetting;
    userPreferences: UserPreferences;
    setPreferences: (key: string, value: any) => void;
}

interface UserPreferences {
    theme?: SupportedTheme;
}

export type SupportedTheme = 'light' | 'dark';

const PreferencesContext = createContext<ThemeContextType | null>(null);

export function PreferencesProvider({
                                        children,
                                        generalSetting
                                    }: {
    children: React.ReactNode;
    generalSetting: GeneralSetting;
}) {
    const [userPreferences, setUserPreferences] = useState<UserPreferences>({theme: 'light'})

    useEffect(() => {
        const init = async () => {
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

    const setPreferences = (key: string, value: any) => {
        if (key === 'theme') {
            setUserPreferences(prev => ({
                ...prev,
                theme: value,
            }))
        }
    }


    return (
        <PreferencesContext.Provider
            value={{
                generalSetting: generalSetting,
                userPreferences: userPreferences,
                setPreferences: setPreferences
            }}
        >
            {children}
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