'use server';

import {cookies} from 'next/headers';

import {defaultLocale, Locale, locales} from '@/i18n/config';

const COOKIE_NAME = 'TRAFFIC_PAGE_LOCALE';

export async function getLocale() {
    return (await cookies()).get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setLocale(locale: string) {
    if (!locales.includes((locale as Locale))) locale = 'en';
    (await cookies()).set(COOKIE_NAME, locale);
}