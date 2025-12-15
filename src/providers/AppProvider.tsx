'use client';

import React, {ReactNode} from 'react';
import {I18nProvider} from './I18nProvider';
import {ThemeProvider} from "./ThemeProvider";

export function AppProviders({children}: { children: ReactNode }) {
    return (
        <I18nProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </I18nProvider>
    );
}