// 当前为独立的服务端i18n实例 不使用 i18next，直接操作 JSON
import zhCN from '@/i18n/locales/zh-CN.json';
import enUS from '@/i18n/locales/en-US.json';
import jaJP from '@/i18n/locales/ja-JP.json';
import koKR from '@/i18n/locales/ko-KR.json';
import {NextRequest} from "next/server";

// 共享的翻译资源
const resources = {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ja-JP': jaJP,
    'ko-KR': koKR,
};

export type SupportedLanguage = keyof typeof resources;

/**
 * 轻量级翻译函数 - 不使用 i18next，直接操作 JSON
 */
export class ServerTranslator {
    private language: SupportedLanguage;

    constructor(language: SupportedLanguage = 'en-US') {
        this.language = language;
    }

    /**
     * 翻译单个键
     */
    t(key: string, params?: Record<string, any>): string {
        const keys = key.split('.');
        let value: any = resources[this.language];

        // 遍历键路径
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }

        // 如果找不到翻译，尝试回退到英文
        if (value === undefined && this.language !== 'en-US') {
            value = this.getFallbackValue(keys, 'en-US');
        }

        // 如果还是找不到，返回键本身
        if (value === undefined) {
            return key;
        }

        // 处理插值
        if (params && typeof value === 'string') {
            return this.interpolate(value, params);
        }

        return String(value);
    }

    /**
     * 批量翻译
     */
    batch(keys: string[], params?: Record<string, any>): Record<string, string> {
        const result: Record<string, string> = {};
        for (const key of keys) {
            result[key] = this.t(key, params);
        }
        return result;
    }

    /**
     * 设置语言
     */
    setLanguage(language: SupportedLanguage): void {
        this.language = language;
    }

    /**
     * 获取当前语言
     */
    getLanguage(): string {
        return this.language;
    }

    /**
     * 获取回退值
     */
    private getFallbackValue(keys: string[], fallbackLang: SupportedLanguage): any {
        let value: any = resources[fallbackLang];
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return undefined;
            }
        }
        return value;
    }

    /**
     * 插值处理：{{key}} -> value
     */
    private interpolate(text: string, params: Record<string, any>): string {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? String(params[key]) : match;
        });
    }

    /**
     * 创建翻译器实例
     */
    static create(language: SupportedLanguage = 'en-US'): ServerTranslator {
        return new ServerTranslator(language);
    }
}

const detectLanguage = (req: NextRequest): SupportedLanguage => {
    const acceptLanguage = req.headers.get('accept-language');
    const supported: SupportedLanguage[] = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'];

    if (acceptLanguage) {
        const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());

        for (const lang of languages) {
            if (supported.includes(lang as SupportedLanguage)) {
                return lang as SupportedLanguage;
            }
        }
    }

    return 'en-US';
}

export const getTranslation = async (req: NextRequest, key: string, defaultValue: string) => {
    const language = detectLanguage(req);
    const translator = ServerTranslator.create(language);
    const message = translator.t(key);
    return message ? message : defaultValue;
}
