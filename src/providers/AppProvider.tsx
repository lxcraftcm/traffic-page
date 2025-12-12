'use client';

import React, {ReactNode} from 'react';
import {I18nProvider} from './I18nProvider';

export function AppProviders({children}: { children: ReactNode }) {
    return (
        <I18nProvider>
            {children}
        </I18nProvider>
    );
}