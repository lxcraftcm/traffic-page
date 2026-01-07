import jwt from 'jsonwebtoken';
import {getLocalStorage, removeLocalStorage, setLocalStorage} from "@/utils/StorageUtil";
import {JWT_SECRET} from "@/lib/config";

interface JwtPayload {
    id: string;
    role: 'user' | 'admin';
}

export const verifyJwt = (token: string) => {
    return jwt.verify(token, JWT_SECRET, {
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