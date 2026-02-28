import {NextRequest} from "next/server";
import {result} from "@/utils/ApiUtil";
import db from "@/lib/db";
import {getTranslation} from '@/lib/i18n';
import {logger} from "@/lib/logger";

// 更新用户信息接口
export async function POST(req: NextRequest) {
    const userId = req.headers.get('X-User-ID');
    logger.info(`update user info request, userId: ${userId}`);

    if (!userId) {
        return result.error(401, await getTranslation(req, 'api.errors.invalidToken', 'Invalid token'));
    }

    try {
        const {username, email} = await req.json();

        // 验证必填字段
        if (!username) {
            return result.error(400, await getTranslation(req, 'UserSetting.usernameRequired', 'Username is required'));
        }

        // 验证用户名长度
        if (username.length < 3 || username.length > 20) {
            return result.error(400, await getTranslation(req, 'UserSetting.usernameLength', 'Username length must be between 3 and 20'));
        }

        // 验证邮箱格式（如果提供）
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return result.error(400, await getTranslation(req, 'UserSetting.emailInvalid', 'Invalid email format'));
            }
        }

        // 检查用户名是否已被其他用户占用
        const existingUser = db.prepare('SELECT id FROM t_user WHERE username = ? AND id != ? AND deleted_at IS NULL')
            .get(username, userId);
        if (existingUser) {
            return result.error(400, await getTranslation(req, 'UserSetting.usernameExists', 'Username already exists'));
        }

        // 更新用户信息
        const updateStmt = db.prepare('UPDATE t_user SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        updateStmt.run(username, email || null, userId);

        // 获取更新后的用户信息
        const updatedUser = db.prepare('SELECT id, username, email FROM t_user WHERE id = ?').get(userId);

        logger.info(`user info updated successfully: ${JSON.stringify(updatedUser)}`);
        return result.success({user: updatedUser});
    } catch (error: any) {
        logger.error(`update user info error: ${error.message}`);
        return result.error(500, `${await getTranslation(req, 'api.errors.internalServerError', 'Internal server error')}: ${error.message}`);
    }
}
