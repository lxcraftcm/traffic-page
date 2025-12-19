import "./globals.css";
import "./navigationHub.css";
import {ToastProvider} from '@/components/common/Toast';
import {AppProviders} from "@/providers/AppProvider";
import {getGeneralSettingByCache} from "@/app/api/systemSetting/generalSetting/route";
import {unstable_noStore as noStore} from 'next/cache';

export async function generateMetadata() {
    // 禁用缓存
    noStore();
    const generalSetting = await getGeneralSettingByCache();
    return {
        title: generalSetting.systemName,
        description: generalSetting.description,
    };
}

export default async function RootLayout({
                                             children
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const generalSetting = await getGeneralSettingByCache();
    return (
        <html lang='en'>
        <body className={`antialiased`}>
        <AppProviders generalSetting={generalSetting}>
            <ToastProvider>
                {children}
            </ToastProvider>
        </AppProviders>
        </body>
        </html>
    );
}
