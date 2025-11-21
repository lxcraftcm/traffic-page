import {
    faLayerGroup,
    faTasks,
    faCalendarDays,
    faEnvelope,
    faHome,
    faBook,
    faShoppingCart,
    faBell,
    faGear,
    faFolderOpen,
    faTag,
    faUser
} from '@fortawesome/free-solid-svg-icons';

import {LanguageOption} from '@/types/base'

// 预设语言选项
export const LANGUAGE_OPTIONS: LanguageOption[] = [
    {code: 'zh-CN', name: '中文', nativeName: '中文'},
    {code: 'en-US', name: 'English', nativeName: 'English'},
    {code: 'ja-JP', name: 'Japanese', nativeName: '日本語'},
    {code: 'ko-KR', name: 'Korean', nativeName: '한국어'},
];


// 预设图标库
export const PRESET_ICONS = [
    {icon: faHome, label: '首页', class: 'fa-solid fa-home'},
    {icon: faLayerGroup, label: '分组', class: 'fa-solid fa-layer-group'},
    {icon: faTasks, label: '任务', class: 'fa-solid fa-tasks'},
    {icon: faCalendarDays, label: '日历', class: 'fa-solid fa-calendar-days'},
    {icon: faEnvelope, label: '邮件', class: 'fa-solid fa-envelope'},
    {icon: faBook, label: '文档', class: 'fa-solid fa-book'},
    {icon: faShoppingCart, label: '购物', class: 'fa-solid fa-shopping-cart'},
    {icon: faUser, label: '用户', class: 'fa-solid fa-user'},
    {icon: faBell, label: '通知', class: 'fa-solid fa-bell'},
    {icon: faGear, label: '设置', class: 'fa-solid fa-settings'},
    {icon: faFolderOpen, label: '文件夹', class: 'fa-solid fa-folder-open'},
    {icon: faTag, label: '标签', class: 'fa-solid fa-tag'}
];

// 预设颜色
export const PRESET_ICON_COLORS = [
    '#6366f1', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#000'
];

export const PRESET_BG_COLORS = [
    '#f3f4f6', '#eff6ff', '#fef3c7', '#ecfdf5',
    '#fee2e2', '#faf5ff', '#ffe6e6', '#e0f2fe'
];