import {NextRequest} from "next/server";
import {getMessage, result} from "@/utils/ApiUtil";
import db from "@/lib/db";
import bcrypt from 'bcryptjs';
import {decryptedRsa} from "@/utils/CryptoUtil";
import {getTranslation} from "@/lib/i18n";

const saltRounds = 12;

// 注册接口
export async function POST(
    req: NextRequest
) {
    const messages = await getMessage();
    const {keyId, username, password} = await req.json()
    try {
        const user = db.prepare('select * from t_user where deleted_at is null').all()
        if (user && user.length > 0) {
            return result.error(403, await getTranslation(messages, 'api.errors.systemInitialized', 'System has been initialized, registration is not allowed. Please contact the administrator.'));
        }
        const decryptedPsw = decryptedRsa(keyId, password);
        if (!decryptedPsw) {
            return result.error(403, await getTranslation(messages, 'api.errors.invalidCredentials', 'Invalid credentials'));
        }
        const hashedPassword = await bcrypt.hash(decryptedPsw, saltRounds);
        const stmt = db.prepare('INSERT INTO t_user (username, credentials) VALUES (?, ?)');
        stmt.run(username, hashedPassword);
        return result.success("")
    } catch (error: any) {
        return result.error(500, `${await getTranslation(messages, 'api.errors.internalServerError', 'Internal server error')} + ${error.message}`);
    }
}