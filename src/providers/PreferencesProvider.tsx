'use client';
import {GeneralSetting} from "@/app/api/systemSetting/generalSetting/route";
import {createContext, useContext} from "react";

interface ThemeContextType {
    generalSetting: GeneralSetting;
}

const PreferencesContext = createContext<ThemeContextType | null>(null);

export function PreferencesProvider({
                                        children,
                                        generalSetting
                                    }: {
    children: React.ReactNode;
    generalSetting: GeneralSetting;
}) {
    console.log('generalSetting Provider', generalSetting)
    return (
        <PreferencesContext.Provider
            value={{
                generalSetting: generalSetting
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