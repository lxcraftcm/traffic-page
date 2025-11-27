export const getLocalStorage = (key: string) => {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null
    }
};

export const setLocalStorage = (key: string, value: string) => {
    try {
        return localStorage.setItem(key, value);
    } catch (e) {
        return null
    }
};

export const removeLocalStorage = (key: string) => {
    try {
        return localStorage.removeItem(key);
    } catch (e) {
        return null
    }
};

export const clearLocalStorage = () => {
    try {
        return localStorage.clear();
    } catch (e) {
        return null
    }
};