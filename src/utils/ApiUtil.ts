import {NextRequest, NextResponse} from "next/server";
import {verifyJwt} from "@/lib/auth";
import {logger} from "@/lib/logger";
import {getLocale, getMessages} from "next-intl/server";

export const result = {
    success: (data: any) => {
        return NextResponse.json({message: 'success', ...data}, {status: 200});
    },

    error: (status: number, message: string) => {
        return NextResponse.json({message: message}, {status: status});
    }
}

export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const getUser = async (request: NextRequest) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;
    const token = authHeader.split('Bearer ')[1];
    try {
        const user = await verifyJwt(token);
        return user;
    } catch (e: any) {
        logger.warn("common,getUser error: ", e.message)
        return null;
    }
}

export const getMessage = async () => {
    // 获取请求的语言偏好
    const locale = await getLocale();
    // 获取对应语言的翻译消息
    return await getMessages({locale});
}