import {sign} from 'jsonwebtoken';
import {NextRequest} from "next/server";
import {result} from "@/app/api/common/route";

interface User {
    id: string;
    email: string;
    password: string;
    name: string;
}

// 登录接口
export async function POST(
    req: NextRequest
) {
    const {username, password, rememberMe} = await req.json()
    try {
        // 验证用户凭证
        const user = await validateUser(username, password);
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
    } catch (error) {
        return result.error(500, 'Internal server error');
    }
}

// 用户验证逻辑
export const validateUser = async (
    username: string,
    password: string
): Promise<User | null> => {
    // 实际项目中应查询数据库
    const mockUser = {
        id: '123',
        email: 'admin',
        password: '123456', // 实际应存储哈希值
        name: 'admin'
    };

    // 密码验证（实际应使用bcrypt等库验证哈希）
    if ((username === mockUser.email || username === mockUser.name) && password === mockUser.password) {
        return mockUser;
    }

    return null;
};