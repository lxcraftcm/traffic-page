import {verifyJwt} from '@/lib/auth';
import {logger} from '@/lib/logger';
import {NextRequest, NextResponse} from 'next/server';

// 受保护路由配置
const PROTECTED_ROUTES = [
    '/api'
];

// 跳过配置
const IGNORE_ROUTES = [
    '/api/user/login',
    '/api/user/register',
    '/api/user/checkSystemInit',
    '/api/user/generateKey',
];

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const isProtected = PROTECTED_ROUTES.some(route =>
        pathname.startsWith(route) && !IGNORE_ROUTES.includes(pathname)
    );

    if (isProtected) {
        // 验证Authorization头
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                {error: 'Authorization header missing'},
                {status: 401}
            );
        }

        // 提取并验证JWT令牌
        const token = authHeader.split('Bearer ')[1];
        try {
            const user = await verifyJwt(token);
            logger.info(`Authenticated user: ${user.id}`);
            // 附加用户信息到请求头
            request.headers.set('X-User-ID', user.id);
            request.headers.set('X-User-Role', user.role);
            return NextResponse.next();
        } catch (error) {
            logger.error(`Authentication failed: ${error}`);
            return NextResponse.json(
                {error: 'Invalid token'},
                {status: 401}
            );
        }
    }

    return NextResponse.next();
}

// 路由匹配器配置
export const config = {
    matcher: [
        // 排除静态资源
        '/((?!static|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|avif|json|wasm)$).*)'
    ]
};