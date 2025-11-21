// 校验url
export const validateUrlFormat = (url: string | undefined): boolean => {
    if (!url) return false;
    if (!url.trim()) return true;
    const reg = /^(?:(https?|ftp|file):\/\/)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$/i;
    return reg.test(url);
};
// 校验图标className
export const validateFaClassFormat = (className: string | undefined): boolean => {
    if (!className) return false
    const parts = className.trim().split(/\s+/);
    return parts.length === 2 && parts[0].startsWith('fa') && parts[1].startsWith('fa-');
};
// 校验非空
export const validateNotEmpty = (value: string | undefined): boolean => {
    if (!value) return false;
    const regex = /^\s*\S+/; // 允许前后空格，中间必须非空
    return regex.test(value);
};