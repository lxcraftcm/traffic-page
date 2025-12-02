import {result, getUser} from "@/utils/ApiUtil";
import db from "@/lib/db";
import {NextRequest} from "next/server";

const defaultPage = [{
    id: 'quick-access',
    name: '快速访问',
    iconMode: 'preset',
    iconColor: '#06b6d4',
    iconBgColor: '#e0f2fe',
    sites: [
        {
            id: 'console',
            name: '控制台',
            desc: '',
            internalUrl: 'http://jira.corp.internal',
            externalUrl: 'http://jira.corp.externa',
            iconMode: 'preset',
            iconColor: '#06b6d4',
            iconBgColor: '#e0f2fe',
        },
        {
            id: 'add',
            name: '添加',
            desc: '',
            internalUrl: 'http://jira.corp.internal',
            externalUrl: 'http://jira.corp.externa',
            iconMode: 'preset',
            iconColor: '#06b6d4',
            iconBgColor: '#e0f2fe',
        }
    ]
}]

export async function GET(req: NextRequest) {
    const user = await getUser(req) as { userId: number } | null;
    if (!user) {
        return result.error(401, "Invalid token");
    }
    const selectStatement = db.prepare("SELECT up.* FROM t_user_page up LEFT JOIN t_user u WHERE u.id = ?");
    const userPage = selectStatement.get(user.userId) as { page_json: string };
    return result.success({userPage: (userPage && userPage.page_json && JSON.parse(userPage.page_json)) ? userPage.page_json : JSON.stringify(defaultPage)});
}

export async function POST(req: NextRequest) {
    const user = await getUser(req) as { userId: number } | null;
    if (!user) {
        return result.error(401, "Invalid token");
    }
    const {userPage: savePage} = await req.json()
    if (!isValidJsonArray(savePage)) {
        return result.error(400, "Json error");
    }
    const selectStatement = db.prepare("SELECT up.* FROM t_user_page up LEFT JOIN t_user u WHERE u.id = ?");
    const userPage = selectStatement.get(user.userId) as { id: number, page_json: string };
    if (!userPage) {
        // 不存在 新增
        const insertStatement = db.prepare('INSERT INTO t_user_page (user_id, page_json) VALUES (?, ?)');
        insertStatement.run(user.userId, savePage);
    } else {
        // 编辑
        const updateStatement = db.prepare('UPDATE t_user_page SET page_json = ? WHERE id = ?');
        updateStatement.run(savePage, userPage.id);
    }
    return result.success(null);
}

const isValidJsonArray = (jsonStr: string): boolean => {
    try {
        const parsed = JSON.parse(jsonStr);
        return Array.isArray(parsed) && parsed.length > 0;
    } catch (error) {
        return false; // 解析失败说明不是合法的 JSON
    }
}