export const getLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
        // 仅在客户端执行
        return localStorage.getItem(key);
    }
    return null;
};

export const setLocalStorage = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
        // 仅在客户端执行
        return localStorage.setItem(key, value);
    }
    return null;
};

export const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
        // 仅在客户端执行
        return localStorage.clear();
    }
    return null;
};