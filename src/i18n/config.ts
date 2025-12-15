import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {getLocalStorage, setLocalStorage} from '@/utils/StorageUtil';
import zhCN from '@/i18n/locales/zh-CN.json';
import enUS from '@/i18n/locales/en-US.json';
import jaJP from '@/i18n/locales/ja-JP.json';
import koKR from '@/i18n/locales/ko-KR.json';

// 支持的语言类型
export type SupportedLanguage = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR';

// 静态翻译资源 - 所有语言包直接打包进 bundle
export const resources: Record<SupportedLanguage, { translation: any }> = {
    'zh-CN': {translation: zhCN},
    'en-US': {translation: enUS},
    'ja-JP': {translation: jaJP},
    'ko-KR': {translation: koKR},
};
export const SUPPORTED_LANGUAGES = Object.keys(resources) as SupportedLanguage[];

export const defaultPreference = "en-US";

// 获取对应
const getPreference = () => {
    return getLocalStorage("language");
}

// 扩展的 i18n 实例，集成偏好管理
class I18nWithPreferences {
    private initialized = false;

    async initialize() {
        if (this.initialized) return i18n;
        const savedPrefs = getPreference();
        const detectedLanguage = this.detectLanguage(savedPrefs);
        // 初始化 i18next
        await i18n
            .use(initReactI18next)
            .init({
                resources,
                lng: detectedLanguage,
                fallbackLng: 'en-US',

                // 性能优化
                initImmediate: true,
                partialBundledLanguages: true,

                // 插值配置
                interpolation: {
                    escapeValue: false,
                },

                // 复数规则
                pluralSeparator: '_',

                // 键名分隔符
                keySeparator: '.',
                nsSeparator: ':',

                // 简化回退
                returnEmptyString: false,
                returnNull: false,

                // 调试
                debug: process.env.NODE_ENV === 'development',
            });

        // 监听语言变化
        i18n.on('languageChanged', (lng) => {
            setLocalStorage("language", lng);
            // 同时更新 HTML lang 属性
            if (typeof document !== 'undefined') {
                document.documentElement.lang = lng;
            }

            // 发送自定义事件，通知其他组件
            window.dispatchEvent(new CustomEvent('i18n:languageChanged', {
                detail: {language: lng}
            }));
        });

        this.initialized = true;
        return i18n;
    }

    // 语言检测逻辑
    private detectLanguage(savedPref: string | null): string {
        // 优先级: 1. Preferences保存 > 2. 浏览器设置 > 3. 默认
        if (savedPref && SUPPORTED_LANGUAGES.includes(savedPref as SupportedLanguage)) {
            return savedPref;
        }

        // 检测浏览器语言
        if (typeof navigator !== 'undefined') {
            const browserLanguages = navigator.languages || [navigator.language];

            for (const lang of browserLanguages) {
                // 完全匹配
                if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
                    return lang;
                }

                // 语言代码匹配（忽略地区）
                const langCode = lang.split('-')[0];
                const matchedLang = Object.keys(resources).find(key =>
                    key.startsWith(langCode)
                );

                if (matchedLang) {
                    return matchedLang;
                }
            }
        }

        return defaultPreference;
    }

    // 获取支持的语言列表
    getSupportedLanguages() {
        return Object.keys(resources).map(code => ({
            code,
            name: this.getLanguageName(code),
            nativeName: this.getNativeLanguageName(code),
        }));
    }

    private getLanguageName(code: string): string {
        const names: Record<string, string> = {
            'zh-CN': 'Chinese (Simplified)',
            'en-US': 'English',
            'ja-JP': 'Japanese',
            'ko-KR': 'Korean',
        };
        return names[code] || code;
    }

    private getNativeLanguageName(code: string): string {
        const nativeNames: Record<string, string> = {
            'zh-CN': '中文',
            'en-US': 'English',
            'ja-JP': '日本語',
            'ko-KR': '한국어',
        };
        return nativeNames[code] || code;
    }
}

// 导出单例实例
export const i18nInstance = new I18nWithPreferences();