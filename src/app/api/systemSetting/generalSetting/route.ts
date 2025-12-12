import {NextRequest} from "next/server";
import {result, snakeToCamel} from "@/utils/ApiUtil";
import db from "@/lib/db";
import {getTranslation} from '@/lib/i18n'

export interface GeneralSetting {
    systemName: string;
    copyright: string;
    defaultLanguage: 'auto' | 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR';
}

const defaultSetting: GeneralSetting = {
    systemName: "TrafficPage",
    copyright: "2025 Navigation Center",
    defaultLanguage: "auto"
}

// 查询
export async function GET(req: NextRequest) {
    const setting = getGeneralSetting();
    console.log("setting", setting)
    return result.success(snakeToCamel({setting: setting || defaultSetting}));
}

// 更新
export async function POST(
    req: NextRequest
) {
    const {systemName, copyright, defaultLanguage} = await req.json();
    try {
        const statement = db.prepare(`
            INSERT INTO t_system_setting (id, system_name, copyright, default_language)
            VALUES (1, ?, ?, ?) ON CONFLICT(id) DO
            UPDATE
                SET
                    system_name = excluded.system_name, copyright = excluded.copyright, default_language = excluded.default_language RETURNING *;
        `);
        statement.run(systemName, copyright, defaultLanguage);
        // 返回响应
        return result.success("");
    } catch (error: any) {
        return result.error(500, `${await getTranslation(req, 'api.errors.internalServerError', 'Internal server error')} + ${error.message}`);
    }
}

export const getGeneralSetting = (): GeneralSetting => {
    const statement = db.prepare("SELECT * FROM t_system_setting WHERE id = 1");
    return statement.get() as GeneralSetting;
}