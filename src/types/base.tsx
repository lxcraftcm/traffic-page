// 数据类型定义

export interface Site {
    id: string;
    name: string;
    internalUrl?: string;
    externalUrl?: string;
    iconMode: 'preset' | 'class' | 'url';
    iconUrl?: string;
    fontAwesomeClass?: string;
    iconColor?: string;
    iconBgColor?: string;
    desc?: string;
}

export interface Category {
    id: string;
    name: string;
    iconMode: 'preset' | 'class' | 'url';
    iconUrl?: string;
    fontAwesomeClass?: string;
    iconColor: string;
    iconBgColor: string;
    sites: Site[];
}

export interface LanguageOption {
    code: string; // 语言代码(如zh-CN、en-US)
    name: string; // 显示名称(如中文、English)
    nativeName: string; // 本地名称(如中文、英文)
}

// 定义系统属性类型
export interface SystemInfo {
    name: string; // 系统名称(必填)
    description: string; // 系统描述(选填)
    footerText: string; // 页脚文本(选填)
    footerLink: {
        text: string; // 页脚链接文本(选填)
        url: string; // 页脚链接地址(选填)
    };
}