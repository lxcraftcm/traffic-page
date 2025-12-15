'use client';

import React, {ReactNode} from 'react';
import {I18nProvider} from './I18nProvider';
import {ThemeProvider} from "./ThemeProvider";
import {PreferencesProvider} from "@/providers/PreferencesProvider";
import {GeneralSetting} from "@/app/api/systemSetting/generalSetting/route";

export function AppProviders({children, generalSetting}: { children: ReactNode, generalSetting: GeneralSetting; }) {
    return (
        <PreferencesProvider generalSetting={generalSetting}>
            <I18nProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </I18nProvider>
        </PreferencesProvider>
    );
}