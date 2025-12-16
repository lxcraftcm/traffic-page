import {NextRequest} from "next/server";
import {result, snakeToCamel} from "@/utils/ApiUtil";
import db from "@/lib/db";
import {getTranslation} from '@/lib/i18n'
import {dbCache} from "@/lib/cache";

export interface GeneralSetting {
    systemName: string;
    description: string;
    copyright: string;
    defaultLanguage: 'auto' | 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR';
    defaultTheme: 'auto' | 'light' | 'dark';
}

const defaultSetting: GeneralSetting = {
    systemName: "Navigation Center",
    description: "One-stop navigation to all important pages, improving your work efficiency",
    copyright: "2025 TrafficPage",
    defaultLanguage: "auto",
    defaultTheme: "auto"
}

const generalSettingCacheKey = "GeneralSetting";

// 查询
export async function GET(req: NextRequest) {
    const setting = await getGeneralSettingByCache();
    return result.success({setting});
}

// 更新
export async function POST(
    req: NextRequest
) {
    const {systemName, description, copyright, defaultLanguage, defaultTheme} = await req.json();
    try {
        const statement = db.prepare(`
            INSERT INTO t_system_setting (id, system_name, description, copyright, default_language, default_theme)
            VALUES (1, ?, ?, ?, ?, ?) ON CONFLICT(id) DO
            UPDATE
                SET system_name = excluded.system_name,
                description = excluded.description,
                copyright = excluded.copyright,
                default_language = excluded.default_language,
                default_theme = excluded.default_theme
                RETURNING *;
        `);
        statement.run(systemName, description, copyright, defaultLanguage, defaultTheme);
        // 更新缓存
        updateCache();
        // 返回响应
        return result.success("");
    } catch (error: any) {
        return result.error(500, `${await getTranslation(req, 'api.errors.internalServerError', 'Internal server error')} + ${error.message}`);
    }
}

// 查询通用配置
export const getGeneralSettingByCache = async (): Promise<GeneralSetting> => {
    let generalSetting = dbCache.get<GeneralSetting>(generalSettingCacheKey);
    if (generalSetting) {
        return snakeToCamel(generalSetting);
    } else {
        const statement = db.prepare("SELECT * FROM t_system_setting WHERE id = 1");
        generalSetting = statement.get() as GeneralSetting;
        dbCache.set(generalSettingCacheKey, generalSetting, 10000);
        return snakeToCamel(generalSetting || defaultSetting);
    }
}

// 更新缓存
const updateCache = () => {
    const statement = db.prepare("SELECT * FROM t_system_setting WHERE id = 1");
    const generalSetting = statement.get() as GeneralSetting;
    dbCache.set(generalSettingCacheKey, generalSetting, 10000);
}