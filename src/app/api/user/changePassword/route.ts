import {NextRequest} from "next/server";
import {result} from "@/utils/ApiUtil";
import db from "@/lib/db";
import bcrypt from 'bcryptjs';
import {decryptedRsa} from "@/utils/CryptoUtil";
import {getTranslation} from '@/lib/i18n';
import {logger} from "@/lib/logger";

// 修改密码接口
export async function POST(req: NextRequest) {
    const userId = req.headers.get('X-User-ID');
    logger.info(`change password request, userId: ${userId}`);

    if (!userId) {
        return result.error(401, await getTranslation(req, 'api.errors.invalidToken', 'Invalid token'));
    }

    try {
        const {currentPassword, newPassword, keyId} = await req.json();

        // 验证必填字段
        if (!currentPassword || !newPassword) {
            return result.error(400, await getTranslation(req, 'UserSetting.allFieldsRequired', 'All fields are required'));
        }

        // 获取用户信息
        const user = db.prepare('SELECT id, credentials FROM t_user WHERE id = ? AND deleted_at IS NULL').get(userId) as { credentials: string };
        if (!user) {
            return result.error(404, await getTranslation(req, 'UserSetting.userNotFound', 'User not found'));
        }

        // 解密当前密码
        const decryptedCurrentPassword = decryptedRsa(keyId, currentPassword);
        if (!decryptedCurrentPassword) {
            return result.error(400, await getTranslation(req, 'UserSetting.passwordDecryptFailed', 'Password decryption failed'));
        }

        // 验证当前密码
        const isPasswordValid = await bcrypt.compare(decryptedCurrentPassword, user.credentials);
        if (!isPasswordValid) {
            return result.error(400, await getTranslation(req, 'UserSetting.currentPasswordIncorrect', 'Current password is incorrect'));
        }

        // 解密新密码
        const decryptedNewPassword = decryptedRsa(keyId, newPassword);
        if (!decryptedNewPassword) {
            return result.error(400, await getTranslation(req, 'UserSetting.passwordDecryptFailed', 'Password decryption failed'));
        }

        // 验证新密码格式
        if (decryptedNewPassword.length < 6 || decryptedNewPassword.length > 20) {
            return result.error(400, await getTranslation(req, 'UserSetting.passwordLength', 'Password length must be between 6 and 20'));
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).*$/;
        if (!passwordRegex.test(decryptedNewPassword)) {
            return result.error(400, await getTranslation(req, 'UserSetting.passwordFormat', 'Password must contain letters and numbers'));
        }

        // 加密新密码
        const hashedPassword = await bcrypt.hash(decryptedNewPassword, 10);

        // 更新密码
        const updateStmt = db.prepare('UPDATE t_user SET credentials = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        updateStmt.run(hashedPassword, userId);

        logger.info(`password changed successfully for userId: ${userId}`);
        return result.success({message: 'Password changed successfully'});
    } catch (error: any) {
        logger.error(`change password error: ${error.message}`);
        return result.error(500, `${await getTranslation(req, 'api.errors.internalServerError', 'Internal server error')}: ${error.message}`);
    }
}
