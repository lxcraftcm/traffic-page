import jwt from 'jsonwebtoken';
import {getLocalStorage, removeLocalStorage, setLocalStorage} from "@/utils/StorageUtil";

interface JwtPayload {
    id: string;
    role: 'user' | 'admin';
}

export const verifyJwt = (token: string) => {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');

    return jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256']
    }) as JwtPayload;
};

// 获取当前 token
export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return getLocalStorage('authToken');
    }
    return null;
};

// 清除 token
export const removeToken = (): void => {
    if (typeof window !== 'undefined') {
        removeLocalStorage('authToken');
    }
};

// 设置 token
export const setToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        setLocalStorage('authToken', token);
    }
};