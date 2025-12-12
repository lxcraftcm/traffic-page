'use client';
import React, {useMemo, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import ResizeCard from '@/components/common/ResizeCard'
import {
    PRESET_BRANDS_ICONS,
    PRESET_ICON_COLORS,
    PRESET_BG_COLORS
} from "@/components/common/PreConstants"
import {
    faCheck, faTimes, faImage, faFont, faLink,
    faExclamationCircle, faGlobe,
    faServer, faExternalLink, faPalette,
    faLayerGroup, faEllipsis, faUndo
} from '@fortawesome/free-solid-svg-icons';
import {Site} from '@/types/base'
import Modal, {MessageModal} from "@/components/common/Modal";
import {getIconClass, renderIcon} from "@/utils/IconUtil";
import {validateFaClassFormat, validateNotEmpty, validateUrlFormat} from "@/utils/ValidateUtil";
import IconPickerModal from '@/components/IconPickerModal'
import {useAppTranslation} from "@/providers/I18nProvider";
// 核心入参
interface SiteEditProps {
    isEditing: boolean;
    editSite?: Site;
    onSubmit: (siteData: Site) => void;
    onCancel: () => void;
}

// 核心入参
interface SiteEditModalProps extends SiteEditProps {
    visible: boolean;
    onClose: () => void;
}

const SiteEdit: React.FC<SiteEditProps> = ({
                                               isEditing = false,
                                               editSite,
                                               onSubmit,
                                               onCancel
                                           }) => {
    // 翻译钩子
    const {t} = useAppTranslation('SiteEdit');

    const init = (): Site => {
        if (editSite) {
            return {
                id: editSite.id || '',
                name: editSite.name || '',
                internalUrl: editSite.internalUrl || '',
                externalUrl: editSite.externalUrl || '',
                iconMode: editSite.iconMode || 'preset',
                fontAwesomeClass: editSite.fontAwesomeClass || PRESET_BRANDS_ICONS[0].class,
                iconUrl: editSite.iconUrl,
                iconColor: editSite.iconColor || PRESET_ICON_COLORS[0],
                iconBgColor: editSite.iconBgColor || PRESET_BG_COLORS[0],
            };
        } else {
            return {
                id: '',
                name: '',
                internalUrl: '',
                externalUrl: '',
                iconMode: 'preset',
                iconUrl: '',
                fontAwesomeClass: PRESET_BRANDS_ICONS[0].class,
                iconColor: PRESET_ICON_COLORS[0],
                iconBgColor: PRESET_BG_COLORS[0],
            };
        }
    }

    const fields: {
        [key: string]: {
            name: string;
            validate: ((value: string | any) => boolean) | null
        }
    } = {
        name: {
            name: t('siteName'),
            validate: validateNotEmpty
        },
        internalUrl: {
            name: t('internalUrl'),
            validate: validateUrlFormat
        },
        externalUrl: {
            name: t('externalUrl'),
            validate: validateUrlFormat
        },
        fontAwesomeClass: {
            name: t('faClassName'),
            validate: validateFaClassFormat
        },
        iconUrl: {
            name: t('imageUrl'),
            validate: validateUrlFormat
        }
    }

    // 状态
    const [form, setForm] = useState<Site>(init());
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
    const [isShowIconPickerModal, setIsShowIconPickerModal] = useState<boolean>(false);

    // 比较两个数据是否相同
    const isDataEqual = (a: Site, b: Site): boolean => {
        return JSON.stringify(a) === JSON.stringify(b);
    };

    const hasChanges = useMemo(() => {
        return editSite && !isDataEqual(form, editSite);
    }, [form, editSite]);

    // 表单字段变更
    const handleFieldChange = (
        field: keyof Omit<Site, 'id'>,
        value: string | any
    ) => {
        setForm(prev => ({...prev, [field]: value}));
        const validate = fields[field]?.validate;
        setErrors(prev => ({...prev, [field]: validate ? validate(value) : true}));
    };

    // 判断是否存在错误
    const hasError = (field: string): boolean => {
        return errors.hasOwnProperty(field) ? !errors[field] : false;
    }

    // 判断是否存在任意错误
    const hasAnyError = (): boolean => {
        for (const errorsKey in errors) {
            if (!errors[errorsKey]) return true;
        }
        for (const fieldsKey in fields) {
            if ((fieldsKey === 'iconUrl' && form.iconMode !== 'url') || (fieldsKey === 'fontAwesomeClass' && form.iconMode === 'url')) {
                continue;
            }
            const field = fields[fieldsKey];
            if (field && field.validate && Object.hasOwn(form, fieldsKey) && fieldsKey in form) {
                const value = form[fieldsKey as keyof Site];
                const res = field.validate(value);
                if (!res) {
                    return true;
                }
            }
        }
        return false;
    }

    // 图标模式切换
    const handleIconModeChange = (mode: 'preset' | 'class' | 'url') => {
        setForm(prev => ({
            ...prev,
            iconMode: mode
        }));
    };
    // 表单提交
    const handleSubmit = () => {
        for (const fieldsKey in fields) {
            if ((fieldsKey === 'iconUrl' && form.iconMode !== 'url') || (fieldsKey === 'fontAwesomeClass' && form.iconMode === 'url')) {
                continue;
            }
            const field = fields[fieldsKey];
            if (field && field.validate && Object.hasOwn(form, fieldsKey) && fieldsKey in form) {
                const value = form[fieldsKey as keyof Site];
                const res = field.validate(value);
                if (!res) {
                    setErrors(prev => ({...prev, [fieldsKey]: false}));
                    return;
                }
            }
        }

        const siteData: Site = {
            id: isEditing && editSite ? editSite.id : `site-${Date.now()}`,
            name: form.name.trim(),
            internalUrl: form.internalUrl?.trim() || undefined,
            externalUrl: form.externalUrl?.trim() || undefined,
            iconMode: form.iconMode,
            fontAwesomeClass: form.fontAwesomeClass?.trim(),
            iconUrl: form.iconMode === 'url' ? form.iconUrl?.trim() : undefined,
            iconColor: form.iconColor,
            iconBgColor: form.iconBgColor,
        };

        onSubmit(siteData);
    };

    // 顶部信息卡片
    const renderTopCard = () => {
        if (isEditing && editSite) {
            return (
                <div
                    className="p-5 rounded-xl mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-lg flex items-center justify-center shadow-sm"
                            style={{backgroundColor: form.iconBgColor || PRESET_BG_COLORS[0]}}
                        >
                            {renderIcon(form, 7)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                {form.name}
                            </h3>
                            <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                {form.internalUrl && (
                                    <div className="flex items-center gap-1.5 truncate">
                                        <FontAwesomeIcon icon={faServer} className="h-4 text-indigo-500"/>
                                        <span className="truncate">{t('internalUrl')}: {form.internalUrl}</span>
                                    </div>
                                )}
                                {form.externalUrl && (
                                    <div className="flex items-center gap-1.5 truncate">
                                        <FontAwesomeIcon icon={faExternalLink} className="h-4 text-indigo-500"/>
                                        <span className="truncate">{t('externalUrl')}: {form.externalUrl}</span>
                                    </div>
                                )}
                                {!form.internalUrl && !form.externalUrl && (
                                    <div className="text-slate-500 dark:text-slate-500">
                                        {t('noAssociatedUrls')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div
                className="p-5 rounded-xl mb-6 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div
                        className="w-14 h-14 rounded-lg flex items-center justify-center shadow-sm"
                        style={{backgroundColor: PRESET_BG_COLORS[0]}}
                    >
                        <FontAwesomeIcon icon={faGlobe} style={{fontSize: '28px', color: PRESET_ICON_COLORS[0]}}/>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                            {t('addSiteInfo')}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {t('fillSiteInfo')}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    // 渲染
    return (
        <ResizeCard
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden w-[100vw] md:max-w-[768px]">
            <div
                className="min-h-15 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <FontAwesomeIcon icon={faLayerGroup} className="h-5 text-indigo-500"/>
                    <span>{isEditing ? t('editSite') : t('addSite')}</span>
                </h2>
            </div>

            {/* 表单内容区域 */}
            <div className="p-6 max-h-[80vh] overflow-auto">
                {/* 顶部信息卡片 */}
                {renderTopCard()}

                {/* 表单字段区域 */}
                <div className="space-y-6">
                    {/* 基本信息区域 */}
                    <div className="space-y-4">
                        <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faGlobe} className="h-4 text-indigo-500"/>
                            {t('basicInfo')}
                        </h5>

                        {/* 网页名称 */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                {t('siteName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                placeholder={t('siteNamePlaceholder')}
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                                    errors.invalidName
                                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
                                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900'
                                } text-slate-800 dark:text-slate-200`}
                            />
                            {hasError('name') && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="h-3"/>
                                    {t('pleaseEnterSiteName')}
                                </p>
                            )}
                        </div>

                        {/* 内网地址 */}
                        <div>
                            <label
                                className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faServer} className="h-3.5 text-indigo-500"/>
                                {t('internalUrl')}
                            </label>
                            <input
                                type="url"
                                value={form.internalUrl}
                                onChange={(e) => handleFieldChange('internalUrl', e.target.value)}
                                placeholder={t('internalUrlPlaceholder')}
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                                    errors.invalidInternalUrl
                                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
                                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900'
                                } text-slate-800 dark:text-slate-200`}
                            />
                            {hasError('internalUrl') && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="h-3"/>
                                    {t('pleaseEnterValidUrl')}
                                </p>
                            )}
                        </div>

                        {/* 外网地址 */}
                        <div>
                            <label
                                className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faExternalLink} className="h-3.5 text-indigo-500"/>
                                {t('externalUrl')}
                            </label>
                            <input
                                type="url"
                                value={form.externalUrl}
                                onChange={(e) => handleFieldChange('externalUrl', e.target.value)}
                                placeholder={t('externalUrlPlaceholder')}
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                                    errors.invalidExternalUrl
                                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
                                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900'
                                } text-slate-800 dark:text-slate-200`}
                            />
                            {hasError('externalUrl') && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="h-3"/>
                                    {t('pleaseEnterValidUrl')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 图标设置区域 */}
                    <div className="space-y-4">
                        <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faImage} className="h-4 text-indigo-500"/>
                            {t('iconSettings')}
                        </h5>

                        {/* 图标模式切换 */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => handleIconModeChange('preset')}
                                className={`py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer 
                                                    duration-200 ${
                                    form.iconMode === 'preset' ? 'ring-1 ring-indigo-200 bg-indigo-100 text-indigo-700  dark:ring-indigo-800' +
                                        ' dark:bg-indigo-900/30 dark:text-indigo-300' : 'dark:text-indigo-300 dark:bg-slate-600 bg-slate-100' +
                                        ' ring-slate-100 hover:bg-indigo-200 dark:hover:ring-indigo-600 dark:hover:bg-indigo-900/30'
                                }`}
                            >
                                <FontAwesomeIcon icon={faImage} className="h-3.5"/>
                                <span>{t('presetIcon')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleIconModeChange('class')}
                                className={`py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer 
                                                    duration-200 ${
                                    form.iconMode === 'class' ? 'ring-1 ring-indigo-200 bg-indigo-100 text-indigo-700  dark:ring-indigo-800' +
                                        ' dark:bg-indigo-900/30 dark:text-indigo-300' : 'dark:text-indigo-300 dark:bg-slate-600 bg-slate-100' +
                                        ' ring-slate-100 hover:bg-indigo-200 dark:hover:ring-indigo-600 dark:hover:bg-indigo-900/30'
                                }`}
                            >
                                <FontAwesomeIcon icon={faFont} className="h-3.5"/>
                                <span>{t('faClass')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleIconModeChange('url')}
                                className={`py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer 
                                                    duration-200 ${
                                    form.iconMode === 'url' ? 'ring-1 ring-indigo-200 bg-indigo-100 text-indigo-700  dark:ring-indigo-800' +
                                        ' dark:bg-indigo-900/30 dark:text-indigo-300' : 'dark:text-indigo-300 dark:bg-slate-600 bg-slate-100' +
                                        ' ring-slate-100 hover:bg-indigo-200 dark:hover:ring-indigo-600 dark:hover:bg-indigo-900/30'
                                } `}
                            >
                                <FontAwesomeIcon icon={faLink} className="h-3.5"/>
                                <span>{t('iconUrl')}</span>
                            </button>
                        </div>

                        {/* 图标预览 + 选择区域 */}
                        <div className="flex items-center gap-3 mt-3">
                            <label className="text-sm text-slate-700 dark:text-slate-300">{t('preview')}: </label>
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm"
                                style={{backgroundColor: form.iconBgColor}}
                            >
                                {renderIcon(form, 5)}
                            </div>
                        </div>

                        {form.iconMode === 'preset' && (
                            <div className="flex gap-2 flex-wrap mt-2">
                                {PRESET_BRANDS_ICONS.map(({icon, label, class: className}, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        title={label}
                                        onClick={() => {
                                            handleFieldChange('fontAwesomeClass', getIconClass(icon));
                                        }}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer 
                                        bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900
                                        dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200
                                        border border-gray-200 dark:border-gray-700 ${
                                            form.fontAwesomeClass === getIconClass(icon) ? 'ring-2 ring-indigo-500' : ''
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={icon} style={{fontSize: '16px', color: '#6366f1'}}/>
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        setIsShowIconPickerModal(true)
                                    }}
                                    className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer
                                        bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900
                                        dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200
                                        border border-gray-200 dark:border-gray-700
                                    `}
                                    title={t('more')}
                                >
                                    <FontAwesomeIcon icon={faEllipsis} style={{fontSize: '16px'}}/>
                                </button>
                            </div>
                        )}

                        {form.iconMode === 'class' && (
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                    {t('faClassName')} <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={form.fontAwesomeClass}
                                        onChange={(e) => handleFieldChange('fontAwesomeClass', e.target.value)}
                                        placeholder={t('faClassPlaceholder')}
                                        className={`flex-1 px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                                            errors.invalidFaClass
                                                ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
                                                : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500/30 bg-white dark:bg-slate-900'
                                        } text-slate-800 dark:text-slate-200`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleFieldChange('fontAwesomeClass', '')}
                                        disabled={!form.fontAwesomeClass}
                                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-500"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="h-4"/>
                                    </button>
                                </div>
                                {hasError('fontAwesomeClass') && (
                                    <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faExclamationCircle} className="h-3"/>
                                        {t('invalidClassFormat')}
                                    </p>
                                )}
                            </div>
                        )}

                        {form.iconMode === 'url' && (
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                    {t('iconImageUrl')}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={form.iconUrl}
                                        onChange={(e) => handleFieldChange('iconUrl', e.target.value)}
                                        placeholder={t('iconImageUrlPlaceholder')}
                                        className={`flex-1 px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 border-slate-200
                                         dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleFieldChange('iconUrl', '')}
                                        disabled={!form.iconUrl}
                                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-500"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="h-4"/>
                                    </button>
                                </div>
                                {hasError('iconUrl') && (
                                    <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faExclamationCircle} className="h-3"/>
                                        {t('pleaseEnterValidUrl')}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 颜色设置区域 */}
                    <div className="space-y-4">
                        <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faPalette} className="h-4 text-indigo-500"/>
                            {t('colorSettings')}
                        </h5>

                        {/* 图标颜色选择 */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                {t('iconColor')} ({t('current')}: {form.iconColor})
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1 flex-wrap flex-1">
                                    {PRESET_ICON_COLORS.map((color, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            title={color}
                                            onClick={() => handleFieldChange('iconColor', color)}
                                            className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer relative 
                                                        ${form.iconColor === color ?
                                                'ring-2 ring-indigo-500 dark:ring-indigo-400' :
                                                'hover:ring-1 hover:ring-slate-400 dark:hover:ring-slate-500'}
                                            `}
                                            style={{backgroundColor: color}}
                                        >
                                            {form.iconColor === color && (
                                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full
                                                                   bg-white dark:bg-slate-100 shadow-[0_0_0_0.5px_rgba(0,0,0,0.1)]"/>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div
                                    className="w-10 h-10 border-0 rounded-lg shadow-sm overflow-hidden">
                                    <input
                                        type="color"
                                        value={form.iconColor}
                                        onChange={(e) => handleFieldChange('iconColor', e.target.value)}
                                        className="w-16 h-16 -mt-3 -ml-3 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 图标背景色选择 */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                {t('bgColor')} ({t('current')}: {form.iconBgColor})
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1 flex-wrap flex-1">
                                    {PRESET_BG_COLORS.map((color, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            title={color}
                                            onClick={() => handleFieldChange('iconBgColor', color)}
                                            className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer relative ${
                                                form.iconBgColor === color
                                                    ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 border-transparent'
                                                    : 'border-slate-200 dark:border-slate-600'}
                                            `}
                                            style={{backgroundColor: color}}
                                        >
                                            {form.iconBgColor === color && (
                                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full
                                                                   bg-black shadow-[0_0_0_0.5px_rgba(0,0,0,0.1)]"/>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div
                                    className="w-10 h-10 border-0 rounded-lg shadow-sm overflow-hidden">
                                    <input
                                        type="color"
                                        value={form.iconBgColor}
                                        onChange={(e) => handleFieldChange('iconBgColor', e.target.value)}
                                        className="w-16 h-16 -mt-3 -ml-3 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 表单操作按钮 */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onCancel}
                        className={`px-6 py-3 rounded-lg text-sm transition-colors bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 cursor-pointer`}
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-4 mr-1.5"/>
                        {t('cancel')}
                    </button>
                    {editSite && hasChanges ? (
                        <button
                            onClick={() => setShowRestoreConfirm(true)}
                            className="px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300
                                 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faUndo} className="h-4"/>
                            <span>{t('restoreChanges')}</span>
                        </button>
                    ) : (<></>)}
                    <button
                        onClick={handleSubmit}
                        disabled={(editSite && !hasChanges) || hasAnyError()}
                        className={`px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer
                        disabled:bg-slate-200 disabled:dark:bg-slate-700 disabled:text-slate-500 disabled:hover:bg-slate-200 disabled:dark:hover:bg-slate-700 disabled:cursor-not-allowed`}
                    >
                        <FontAwesomeIcon icon={faCheck} className="h-4"/>
                        <span>{isEditing ? t('saveChanges') : t('addSite')}</span>
                    </button>
                </div>
            </div>
            {/* 恢复确认对话框 */}
            <MessageModal
                visible={showRestoreConfirm}
                onClose={() => setShowRestoreConfirm(false)}
                onCancel={() => setShowRestoreConfirm(false)}
                onConfirm={() => {
                    if (editSite) setForm(editSite);
                    setShowRestoreConfirm(false);
                    setErrors({})
                }}
                type="rollback"
                title={t('confirmRestoreChanges')}
                message={t('restoreChangesMessage')}
            />
            {/*更多图标选择*/}
            <IconPickerModal
                visible={isShowIconPickerModal}
                onClose={() => setIsShowIconPickerModal(false)}
                onSubmit={(icon) => {
                    setForm(prev => ({
                        ...prev,
                        fontAwesomeClass: getIconClass(icon)
                    }));
                    setIsShowIconPickerModal(false)
                }}
                onCancel={() => setIsShowIconPickerModal(false)}

            />
        </ResizeCard>
    );
};

const SiteEditModal: React.FC<SiteEditModalProps> = ({
                                                         visible = false,
                                                         isEditing = false,
                                                         onClose,
                                                         editSite,
                                                         onSubmit,
                                                         onCancel
                                                     }) => {
    // 渲染
    return (
        <Modal
            visible={visible}
            onClose={onClose}
        >
            <SiteEdit
                isEditing={isEditing}
                editSite={editSite}
                onSubmit={onSubmit}
                onCancel={onCancel}
            />
        </Modal>
    );
};

export default SiteEditModal;