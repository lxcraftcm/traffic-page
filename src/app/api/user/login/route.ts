import {sign} from 'jsonwebtoken';
import {NextRequest} from "next/server";
import {result} from "@/utils/ApiUtil";
import db from "@/lib/db";
import bcrypt from 'bcryptjs';
import {decryptedRsa} from "@/utils/CryptoUtil";

// 登录接口
export async function POST(
    req: NextRequest
) {
    const {keyId, username, password, rememberMe} = await req.json()
    try {
        const decryptedPsw = decryptedRsa(keyId, password);
        if (!decryptedPsw) {
            return result.error(403, 'Invalid credentials');
        }
        // 验证用户凭证
        const user = await validateUser(username, decryptedPsw);
        if (!user) {
            return result.error(403, 'Invalid credentials');
        }
        // 生成JWT token
        const token = sign(
            {userId: user.id, email: user.email},
            process.env.JWT_SECRET!,
            {
                expiresIn: rememberMe ? '30d' : '1h',
                issuer: 'your-domain.com'
            }
        );
        // 返回响应
        return result.success({user, token})
    } catch (error: any) {
        return result.error(500, 'Internal server error ' + error.message);
    }
}

// 用户验证逻辑
export const validateUser = async (
    username: string,
    inputPassword: string
): Promise<any> => {
    const statement = db.prepare("select * from t_user where deleted_at is null and (username = ? or email = ?)");
    const user = statement.get(username, username) as { credentials: any };
    const isMatch = user && await bcrypt.compare(inputPassword, user.credentials);
    // 密码验证
    if (isMatch) {
        return user;
    }
    return null;
};