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