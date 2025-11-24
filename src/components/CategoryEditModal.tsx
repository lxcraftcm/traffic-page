'use client';
import React, {useState, useCallback, useMemo} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import SiteEditModal from './SiteEditModal'
import {Modal, MessageModal} from "@/components/common/Modal";
import {Category, Site} from "@/types/base";
import {library} from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';
import {fab} from '@fortawesome/free-brands-svg-icons';
import {
    PRESET_ICONS,
    PRESET_ICON_COLORS,
    PRESET_BG_COLORS
} from "@/components/common/PreConstants"
import {
    faGripVertical,
    faPlus,
    faCheck,
    faTimes,
    faTrash,
    faLayerGroup,
    faSave,
    faSpinner,
    faUndo,
    faEdit,
    faLink,
    faImage,
    faFont,
    faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import ResizeCard from "@/components/common/ResizeCard";
import {getIconClass, renderIcon} from "@/utils/IconUtil";

// 初始化FontAwesome库
library.add(fas, far, fab);

interface CategoryEditProps {
    initialData?: Category[];
    onSave: (finalData: Category[]) => void;
    title?: string;
    defaultSelectedId?: string;
}

interface CategoryEditModalProps extends CategoryEditProps {
    visible: boolean,
    onClose: () => void;
    initialData?: Category[];
    onSave: (finalData: Category[]) => void;
    title?: string;
    defaultSelectedId?: string;
}

// 深拷贝函数
const deepClone = (data: any) => {
    return JSON.parse(JSON.stringify(data));
};

// 比较两个数据是否相同
const isDataEqual = (a: Category[], b: Category[]): boolean => {
    return JSON.stringify(a) === JSON.stringify(b);
};

const CategoryEdit: React.FC<CategoryEditProps> = ({
                                                       initialData = [],
                                                       onSave,
                                                       title = "编辑分类",
                                                       defaultSelectedId
                                                   }) => {
    // 初始化数据
    const safeData = initialData.map(cat => ({
        ...cat,
        iconColor: cat.iconColor || '#6366f1',
        iconBgColor: cat.iconBgColor || '#f3f4f6',
        sites: cat.sites || []
    }));
    // 状态管理
    const [originalData, setOriginalData] = useState<Category[]>(deepClone(safeData));
    const [localCategories, setLocalCategories] = useState<Category[]>(deepClone(safeData));
    const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId ? defaultSelectedId : (safeData.length > 0 ? safeData[0].id : null));
    const [isShowSiteEditModal, setIsShowSiteEditModal] = useState(false);
    const [siteEditData, setSiteEditData] = useState<Site | undefined>(undefined);
    const [newCat, setNewCat] = useState<{
        name: string;
        iconUrl?: string;
        fontAwesomeClass?: string;
        iconMode: 'preset' | 'class' | 'url';
        iconColor: string;
        iconBgColor: string;
    }>({
        name: '',
        iconUrl: '',
        fontAwesomeClass: '',
        iconMode: 'preset',
        iconColor: '#6366f1',
        iconBgColor: '#f3f4f6'
    });
    const [showAddForm, setShowAddForm] = useState(false);

    // 分类拖拽状态 - 包含方向和位置判断
    const [draggingCategory, setDraggingCategory] = useState<{
        source: string | null;
        target: string | null;
        position: 'above' | 'below' | null; // 辅助线位置
        startY: number; // 拖拽开始Y坐标
    }>({source: null, target: null, position: null, startY: 0});

    // 网站拖拽状态 - 基于方向判断位置
    const [draggingSite, setDraggingSite] = useState<{
        sourceCategoryId: string | null;
        sourceSiteId: string | null;
        targetCategoryId: string | null;
        targetSiteId: string | null;
        position: 'above' | 'below' | null;
        isDragging: boolean;
        startY: number;
    }>({
        sourceCategoryId: null,
        sourceSiteId: null,
        targetCategoryId: null,
        targetSiteId: null,
        position: null,
        isDragging: false,
        startY: 0
    });

    const [isSaving, setIsSaving] = useState(false);
    const [invalidClass, setInvalidClass] = useState(false);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
    const [deleteSite, setDeleteSite] = useState<Site>();
    const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false);
    const [showDeleteSiteConfirm, setshowDeleteSiteConfirm] = useState(false);

    const hasUnsavedChanges = useMemo(() => {
        return !isDataEqual(localCategories, originalData);
    }, [localCategories, originalData]);

    // 分类拖拽相关函数
    const handleCategoryDragStart = (id: string, e: React.DragEvent) => {
        if (id !== 'quick-access') {
            setDraggingCategory(prev => ({
                ...prev,
                source: id,
                startY: e.clientY
            }));
        }
    };

    const handleCategoryDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();

        if (id !== 'quick-access' && draggingCategory.source && draggingCategory.source !== id) {
            const isDraggingDown = e.clientY > draggingCategory.startY;
            const position: 'above' | 'below' = isDraggingDown ? 'below' : 'above';

            setDraggingCategory(prev => ({
                ...prev,
                target: id,
                position
            }));
        }
    };

    const handleCategoryDragEnd = () => {
        setDraggingCategory(prev => ({
            ...prev,
            target: null,
            position: null
        }));
    };

    const handleCategoryDrop = () => {
        if (!draggingCategory.source || !draggingCategory.target || draggingCategory.source === draggingCategory.target) return;

        const newOrder = [...localCategories];
        const sourceIdx = newOrder.findIndex(c => c.id === draggingCategory.source);
        const targetIdx = newOrder.findIndex(c => c.id === draggingCategory.target);
        const adjustedTargetIdx = draggingCategory.position === 'below' ? targetIdx + 1 : targetIdx;

        const [movedItem] = newOrder.splice(sourceIdx, 1);
        newOrder.splice(adjustedTargetIdx, 0, movedItem);

        setLocalCategories(newOrder);
        setDraggingCategory({source: null, target: null, position: null, startY: 0});
    };

    // 网站拖拽相关函数
    const handleSiteDragStart = (categoryId: string, siteId: string, e: React.DragEvent) => {
        setDraggingSite(prev => ({
            ...prev,
            sourceCategoryId: categoryId,
            sourceSiteId: siteId,
            isDragging: true,
            startY: e.clientY
        }));
    };

    const handleSiteDragOver = (e: React.DragEvent, categoryId: string, siteId: string) => {
        e.preventDefault();

        if (draggingSite.sourceCategoryId === categoryId && draggingSite.sourceSiteId === siteId) {
            return;
        }

        const isDraggingDown = e.clientY > draggingSite.startY;
        const position: 'above' | 'below' = isDraggingDown ? 'below' : 'above';

        setDraggingSite(prev => ({
            ...prev,
            targetCategoryId: categoryId,
            targetSiteId: siteId,
            position
        }));
    };

    const handleEmptyCategoryDragOver = (e: React.DragEvent, categoryId: string) => {
        e.preventDefault();
        if (draggingSite.sourceCategoryId !== categoryId) {
            setDraggingSite(prev => ({
                ...prev,
                targetCategoryId: categoryId,
                targetSiteId: null,
                position: null
            }));
        }
    };

    const handleSiteDragEnd = () => {
        setDraggingSite(prev => ({
            ...prev,
            isDragging: false,
            position: null
        }));
    };

    const handleSiteDrop = () => {
        const {sourceCategoryId, sourceSiteId, targetCategoryId, targetSiteId, position} = draggingSite;

        if (!sourceCategoryId || !sourceSiteId || !targetCategoryId) return;

        const updatedCategories = deepClone(localCategories);
        const sourceCat = updatedCategories.find((cat: { id: string; }) => cat.id === sourceCategoryId);
        const targetCat = updatedCategories.find((cat: { id: string; }) => cat.id === targetCategoryId);

        if (!sourceCat || !targetCat) return;

        const sourceIndex = sourceCat.sites.findIndex((site: { id: string; }) => site.id === sourceSiteId);
        if (sourceIndex === -1) return;

        const [movedSite] = sourceCat.sites.splice(sourceIndex, 1);

        if (targetSiteId) {
            let targetIndex = targetCat.sites.findIndex((site: { id: string; }) => site.id === targetSiteId);

            if (targetIndex !== -1) {
                if (position === 'below') {
                    targetIndex += 1;
                }
                targetCat.sites.splice(targetIndex, 0, movedSite);
            } else {
                targetCat.sites.push(movedSite);
            }
        } else {
            targetCat.sites.push(movedSite);
        }

        setLocalCategories(updatedCategories);
        setDraggingSite({
            sourceCategoryId: null,
            sourceSiteId: null,
            targetCategoryId: null,
            targetSiteId: null,
            position: null,
            isDragging: false,
            startY: 0
        });
    };

    // 图标模式切换
    const handleIconModeChange = (mode: 'preset' | 'class' | 'url', isNew: boolean = false) => {
        if (isNew) {
            setNewCat(prev => ({
                ...prev,
                iconMode: mode,
            }));
            if (mode !== 'class') setInvalidClass(false);
        } else {
            setLocalCategories(prev =>
                prev?.map(category =>
                    category.id === selectedId
                        ? {
                            ...category,
                            iconMode: mode,
                        }
                        : category
                ) || []
            );
            if (mode !== 'class') setInvalidClass(false);
        }
    };

    // 验证FontAwesome类名格式
    const validateFaClassFormat = (className: string | undefined): boolean => {
        if (!className) return false;
        const parts = className.trim().split(/\s+/);
        return parts.length === 2 && parts[0].startsWith('fa-') && parts[1].startsWith('fa-');
    };

    // FontAwesome类名输入处理
    const handleFontAwesomeClassChange = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false) => {
        const className = e.target.value.trim();

        if (isNew) {
            setNewCat(prev => ({...prev, fontAwesomeClass: className}));
        } else {
            setLocalCategories(prev =>
                prev?.map(category =>
                    category.id === selectedId
                        ? {
                            ...category,
                            fontAwesomeClass: className
                        }
                        : category
                ) || []
            );
        }

        setInvalidClass(!validateFaClassFormat(className));
    };

    // 图标链接输入处理
    const handleIconUrlChange = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false) => {
        const value = e.target.value.trim();
        if (isNew) {
            setNewCat(prev => ({...prev, iconUrl: value}));
        } else {
            setLocalCategories(prev =>
                prev?.map(category =>
                    category.id === selectedId
                        ? {
                            ...category,
                            iconUrl: value
                        }
                        : category
                ) || []
            );
        }
    };

    // 添加分类
    const handleAddCategory = () => {
        if (!newCat.name.trim()) return;

        const newCategory: Category = {
            id: `cat-${Date.now()}`,
            name: newCat.name,
            iconMode: newCat.iconMode,
            fontAwesomeClass: newCat.iconMode === 'class' ? newCat.fontAwesomeClass : undefined,
            iconUrl: newCat.iconMode === 'url' ? newCat.iconUrl : undefined,
            iconColor: newCat.iconColor,
            iconBgColor: newCat.iconBgColor,
            sites: []
        };

        const updated = [...localCategories, newCategory];
        setSelectedId(newCategory.id);
        setLocalCategories(updated);
        setShowAddForm(false);
        setNewCat({
            name: '',
            iconUrl: '',
            fontAwesomeClass: '',
            iconMode: 'preset',
            iconColor: '#6366f1',
            iconBgColor: '#f3f4f6'
        });
    };

    // 编辑分类名称
    const handleEditNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalCategories(prev =>
            prev?.map(category =>
                category.id === selectedId
                    ? {
                        ...category,
                        name: e.target.value
                    }
                    : category
            ) || []
        );
    };

    // 选择预设图标
    const handleIconSelect = (icon: any, className: string, isNew: boolean = false) => {
        if (isNew) {
            setNewCat(prev => ({
                ...prev,
                icon,
                fontAwesomeClass: getIconClass(icon),
                iconMode: 'preset'
            }));
        } else {
            setLocalCategories(prev =>
                prev?.map(category =>
                    category.id === selectedId
                        ? {
                            ...category,
                            icon,
                            fontAwesomeClass: getIconClass(icon),
                            iconMode: 'preset'
                        }
                        : category
                ) || []
            );
        }
        setInvalidClass(false);
    };

    // 颜色选择处理
    const handleColorSelect = (color: string, isNew: boolean = false) => {
        if (isNew) {
            setNewCat(prev => ({...prev, iconColor: color}));
        } else {
            setLocalCategories(prev =>
                prev?.map(category =>
                    category.id === selectedId
                        ? {
                            ...category,
                            iconColor: color
                        }
                        : category
                ) || []
            );
        }
    };

    const handleBgColorSelect = (color: string, isNew: boolean = false) => {
        if (isNew) {
            setNewCat(prev => ({...prev, iconBgColor: color}));
        } else {
            setLocalCategories(prev =>
                prev?.map(category =>
                    category.id === selectedId
                        ? {
                            ...category,
                            iconBgColor: color
                        }
                        : category
                ) || []
            );
        }
    };

    // 删除分类前置
    const handleDeleteCategory = () => {
        if (!selectedId || selectedId === 'quick-access') return;
        setShowDeleteCategoryConfirm(true);

    };

    // 删除分类
    const handleDeleteCategoryConfirm = () => {
        if (!selectedId || selectedId === 'quick-access') return;
        const updated = localCategories.filter(cat => cat.id !== selectedId);
        setSelectedId(updated.length > 0 ? updated[0].id : null);
        setLocalCategories(updated);
        setShowDeleteCategoryConfirm(false);
    }

    // 保存所有更改
    const handleFinalSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            onSave([...localCategories]);
            setOriginalData(deepClone(localCategories));
            // setHasUnsavedChanges(false);
            setIsSaving(false);
        }, 300);
    };

    // 恢复所有修改
    const handleRestoreChanges = useCallback(() => {
        const restoredData = deepClone(originalData);
        setSelectedId(restoredData.length > 0 ? restoredData[0].id : null);
        setLocalCategories(restoredData);
        setShowAddForm(false);
        setShowRestoreConfirm(false);
        // setHasUnsavedChanges(false);
    }, [originalData]);

    // 打开新增/编辑网页弹窗
    const handleEditSite = (site: Site) => {
        setIsShowSiteEditModal(true);
        setSiteEditData(site);
    }

    // 删除网页前置
    const handleDeleteSite = async (site: Site) => {
        setDeleteSite(site);
        setshowDeleteSiteConfirm(true);
    }

    // 确认删除网页
    const handleDeleteSiteConfirm = () => {
        if (!deleteSite) return;
        const updatedCategories = localCategories.map(cat => {
            if (cat.id === selectedId) {
                const isExist = cat.sites.some(s => s.id === deleteSite.id);
                return {
                    ...cat,
                    sites: isExist ? cat.sites.filter(s => s.id !== deleteSite.id) : cat.sites
                };
            }
            return cat;
        });
        setLocalCategories(updatedCategories);
        setshowDeleteSiteConfirm(false); // 关闭弹窗
    }

    // 保存
    const handleSaveSite = (siteData: Site) => {
        // 处理提交: 更新对应分类的sites数组
        const updatedCategories = localCategories.map(cat => {
            if (cat.id === selectedId) {
                const isExist = cat.sites.some(s => s.id === siteData.id);
                return {
                    ...cat,
                    sites: isExist
                        ? cat.sites.map(s => s.id === siteData.id ? siteData : s) // 编辑
                        : [...cat.sites, siteData] // 新增
                };
            }
            return cat;
        });
        setLocalCategories(updatedCategories);
        setIsShowSiteEditModal(false); // 关闭弹窗
    }

    // 当前选中分类
    const selectedCategory = localCategories?.find(cat => cat.id === selectedId) || null;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700
                        transition-all duration-250 ease-in-out max-w-[calc(100vw)]">
            {/* 标题栏 */}
            <div
                className="min-h-15 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <FontAwesomeIcon icon={faLayerGroup} className="h-5 text-indigo-500"/>
                    <span>{title}</span>
                    {hasUnsavedChanges && (
                        <span
                            className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full flex
                                items-center gap-1">
                          <FontAwesomeIcon icon={faExclamationCircle} className="h-3"/>
                          有未保存的更改
                        </span>
                    )}
                </h2>

                <div className="flex items-center gap-3 mr-5">
                    {hasUnsavedChanges && !isSaving && (
                        <button
                            onClick={() => setShowRestoreConfirm(true)}
                            className="px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300
                                 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faUndo} className="h-4"/>
                            <span>恢复修改</span>
                        </button>
                    )}

                    <button
                        onClick={handleFinalSave}
                        disabled={isSaving || !hasUnsavedChanges}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                            isSaving
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-wait'
                                : !hasUnsavedChanges
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                        }`}
                    >
                        {isSaving ? (
                            <FontAwesomeIcon icon={faSpinner} className="h-4 animate-spin"/>
                        ) : (
                            <FontAwesomeIcon icon={faSave} className="h-4"/>
                        )}
                        <span>{isSaving ? '保存中...' : '保存所有更改'}</span>
                    </button>
                </div>
            </div>

            {/* 主内容区 */}
            <div className="flex flex-1 overflow-hidden bg-white dark:bg-slate-900/30">
                {/* 左侧分类列表 */}
                <div className="bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 border-r-1">
                    <ResizeCard className="w-73 bg-slate-100 dark:bg-slate-800">
                        <div className="overflow-y-auto p-4 max-h-220"
                             style={{
                                 scrollbarWidth: 'thin',
                                 scrollbarColor: 'rgb(96 165 250) rgb(229 231 235)',
                                 scrollbarGutter: 'stable',
                             }}
                        >
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">分类列表(拖拽排序)</p>
                            <div className={`transition-all duration-250 ease-in-out overflow-hidden h-1/3
                             ${showAddForm ? 'max-h-200' : 'max-h-13'}`}>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="w-full flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm transition-colors mb-3
                                         bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600
                                         text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="h-4"/>
                                    <span>添加分类</span>
                                </button>

                                {/* 添加分类表单 */}
                                <div className={`overflow-hidden mb-5 p-3 bg-white dark:bg-slate-700 rounded-lg border 
                                border-slate-200 dark:border-slate-600 shadow-sm`}>
                                    <div className="mb-3">
                                        <label
                                            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">分类名称</label>
                                        <input
                                            type="text"
                                            value={newCat.name}
                                            onChange={(e) => setNewCat(prev => ({...prev, name: e.target.value}))}
                                            placeholder="输入分类名称"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">图标来源</label>
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <button
                                                type="button"
                                                onClick={() => handleIconModeChange('preset', true)}
                                                className={`py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer 
                                                    duration-200 ${
                                                    newCat.iconMode === 'preset' ? 'ring-1 ring-indigo-200 bg-indigo-100 text-indigo-700  dark:ring-indigo-800' +
                                                        ' dark:bg-indigo-900/30 dark:text-indigo-300' : 'dark:text-indigo-300 dark:bg-slate-600 bg-slate-100' +
                                                        ' ring-slate-100 hover:bg-indigo-200 dark:hover:ring-indigo-600 dark:hover:bg-indigo-900/30'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faImage} className="h-3.5"/>
                                                <span>预设</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleIconModeChange('class', true)}
                                                className={`py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer 
                                                    duration-200 ${
                                                    newCat.iconMode === 'class' ? 'ring-1 ring-indigo-200 bg-indigo-100 text-indigo-700  dark:ring-indigo-800' +
                                                        ' dark:bg-indigo-900/30 dark:text-indigo-300' : 'dark:text-indigo-300 dark:bg-slate-600 bg-slate-100' +
                                                        ' ring-slate-100 hover:bg-indigo-200 dark:hover:ring-indigo-600 dark:hover:bg-indigo-900/30'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faFont} className="h-3.5"/>
                                                <span>FA</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleIconModeChange('url', true)}
                                                className={`py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer 
                                                    duration-200 ${
                                                    newCat.iconMode === 'url' ? 'ring-1 ring-indigo-200 bg-indigo-100 text-indigo-700  dark:ring-indigo-800' +
                                                        ' dark:bg-indigo-900/30 dark:text-indigo-300' : 'dark:text-indigo-300 dark:bg-slate-600 bg-slate-100' +
                                                        ' ring-slate-100 hover:bg-indigo-200 dark:hover:ring-indigo-600 dark:hover:bg-indigo-900/30'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faLink} className="h-3.5"/>
                                                <span>链接</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 mt-3 mb-3">
                                            <label
                                                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">预览: </label>
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                                                style={{backgroundColor: newCat.iconBgColor}}
                                            >
                                                {renderIcon(newCat, 5)}
                                            </div>
                                        </div>

                                        {/* 1. 预设图标选择 */}
                                        {newCat.iconMode === 'preset' && (
                                            <div className="flex gap-2 flex-wrap mt-1">
                                                {PRESET_ICONS.map(({icon, label, class: className}, i) => (
                                                    <button
                                                        key={"newCat_preset_icon_" + i}
                                                        type="button"
                                                        title={`${label} (${className})`}
                                                        onClick={() => handleIconSelect(icon, className, true)}
                                                        className={`w-9.5 h-9.5 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                                            newCat.fontAwesomeClass === getIconClass(icon) ? 'ring-2 ring-indigo-500' : ''
                                                        }`}
                                                        style={{backgroundColor: '#f3f4f6'}}
                                                    >
                                                        <FontAwesomeIcon icon={icon}
                                                                         style={{
                                                                             fontSize: '20px',
                                                                             color: '#6366f1'
                                                                         }}/>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* 2. FontAwesome类名输入 */}
                                        {newCat.iconMode === 'class' && (
                                            <div className="mt-1">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newCat.fontAwesomeClass}
                                                        onChange={(e) => handleFontAwesomeClassChange(e, true)}
                                                        placeholder="输入FontAwesome类名(格式: fa-solid fa-house)"
                                                        className={`flex-1 min-w-10 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                                                            invalidClass
                                                                ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
                                                                : 'border-slate-200 dark:border-slate-600 focus:ring-indigo-500/30'
                                                        } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewCat(prev => ({
                                                            ...prev,
                                                            fontAwesomeClass: ''
                                                        }))}
                                                        disabled={!newCat.fontAwesomeClass}
                                                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500
                                                    text-slate-500 cursor-pointer"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="h-4"/>
                                                    </button>
                                                </div>

                                                {invalidClass && (
                                                    <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faExclamationCircle}
                                                                         className="h-3"/>
                                                        格式错误,请使用&quot;缀 图标名&quot;格式(如fa-solid
                                                        fa-house)
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* 3. 图标链接输入 */}
                                        {newCat.iconMode === 'url' && (
                                            <div className="mt-1">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        value={newCat.iconUrl}
                                                        onChange={(e) => handleIconUrlChange(e, true)}
                                                        placeholder="输入图标图片链接(http/https)"
                                                        className="flex-1 min-w-10 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                                                                text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white dark:bg-slate-800
                                                                text-slate-800 dark:text-slate-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewCat(prev => ({...prev, iconUrl: ''}))}
                                                        disabled={!newCat.iconUrl}
                                                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500
                                                     text-slate-500 cursor-pointer"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="h-4"/>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 图标颜色选择 */}
                                    <div className="mb-3">
                                        <label
                                            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            图标颜色(当前: {newCat.iconColor})
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1 flex-wrap flex-1">
                                                {PRESET_ICON_COLORS.map((color, i) => (
                                                    <button
                                                        key={"newCat_icon_color_" + i}
                                                        type="button"
                                                        title={color}
                                                        onClick={() => handleColorSelect(color, true)}
                                                        className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer relative 
                                                                ${newCat.iconColor === color ?
                                                            'ring-2 ring-indigo-500 dark:ring-indigo-400' :
                                                            'hover:ring-1 hover:ring-slate-400 dark:hover:ring-slate-500'}
                                                            }`}
                                                        style={{backgroundColor: color}}
                                                    >
                                                        {newCat.iconColor === color && (
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
                                                    value={newCat.iconColor}
                                                    onChange={(e) => handleColorSelect(e.target.value, true)}
                                                    className="w-16 h-16 -mt-3 -ml-3 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 图标背景色选择 */}
                                    <div className="mb-3">
                                        <label
                                            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            图标背景色(当前: {newCat.iconBgColor})
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1 flex-wrap flex-1">
                                                {PRESET_BG_COLORS.map((color, i) => (
                                                    <button
                                                        key={"newCat_back_color_" + i}
                                                        type="button"
                                                        title={color}
                                                        onClick={() => handleBgColorSelect(color, true)}
                                                        className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer relative ${
                                                            newCat.iconBgColor === color
                                                                ? 'ring-2 ring-indigo-500 border-transparent'
                                                                : 'border-slate-200 dark:border-slate-600'
                                                        }`}
                                                        style={{backgroundColor: color}}
                                                    >
                                                        {newCat.iconBgColor === color && (
                                                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full
                                                                   bg-black  shadow-[0_0_0_0.5px_rgba(0,0,0,0.1)]"/>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                            <div
                                                className="w-10 h-10 border-0 rounded-lg shadow-sm overflow-hidden">
                                                <input
                                                    type="color"
                                                    value={newCat.iconBgColor}
                                                    onChange={(e) => handleBgColorSelect(e.target.value, true)}
                                                    className="w-16 h-16 -mt-3 -ml-3 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 操作按钮 */}
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setShowAddForm(false)}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300
                                        dark:hover:bg-slate-500 transition-colors text-slate-700 dark:text-slate-300 cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="h-3.5 mr-1"/>
                                            取消
                                        </button>
                                        <button
                                            onClick={handleAddCategory}
                                            disabled={!newCat.name.trim() || (newCat.iconMode === 'class' && invalidClass)}
                                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                (!newCat.name.trim() || (newCat.iconMode === 'class' && invalidClass))
                                                    ? 'bg-slate-200 dark:bg-slate-600 text-slate-400 cursor-not-allowed'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="h-3.5 mr-1"/>
                                            添加
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 分类列表 - 细虚线辅助线 */}
                            <div className="space-y-3 flex-1">

                                {localCategories.map((category) => (
                                    <div key={"category_parent_" + category.id}>
                                        {/* 分类上方辅助线 - 细虚线(1px) */}
                                        {draggingCategory.source &&
                                            draggingCategory.target === category.id &&
                                            draggingCategory.position === 'above' &&
                                            draggingCategory.source !== category.id && (
                                                <div
                                                    className="border-t border-dashed border-indigo-500 dark:border-indigo-400 animate-pulse"
                                                    style={{width: 'calc(100% - 1rem)', borderWidth: '1px'}}
                                                />
                                            )}

                                        <div
                                            key={category.id}
                                            // ref={el => categoryRefs.current[category.id] = el}
                                            draggable={category.id !== 'quick-access'}
                                            onDragStart={(e) => handleCategoryDragStart(category.id, e)}
                                            onDragOver={(e) => handleCategoryDragOver(e, category.id)}
                                            onDragEnd={handleCategoryDragEnd}
                                            onDrop={handleCategoryDrop}
                                            onClick={() => setSelectedId(category.id)}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer border transition-all duration-200 ${
                                                selectedId === category.id
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm'
                                                    : 'hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent'
                                            } ${draggingCategory.source === category.id ? 'opacity-80 shadow-md scale-105' : ''} ${
                                                draggingCategory.target === category.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                                            }`}
                                        >
                                            {category.id !== 'quick-access' && (
                                                <div className="text-slate-400 flex-shrink-0">
                                                    <FontAwesomeIcon icon={faGripVertical} className="h-4"/>
                                                </div>
                                            )}
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{backgroundColor: category.iconBgColor}}
                                            >
                                                {renderIcon(category, 5)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                        <span
                                            className="text-sm font-medium truncate text-slate-800 dark:text-slate-200 block">
                                            {category.name}
                                        </span>
                                                <span
                                                    className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                                            {category.sites.length} 个网站
                                        </span>
                                            </div>
                                            {category.id === 'quick-access' && (
                                                <span
                                                    className="ml-1 text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400 flex-shrink-0">
                                            固定
                                        </span>
                                            )}
                                            {category.id !== 'quick-access' && (
                                                <button
                                                    onClick={handleDeleteCategory}
                                                    disabled={isSaving}
                                                    className={`p-1 rounded-lg text-sm transition-colors cursor-pointer ${
                                                        isSaving
                                                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                                            : 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30'
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="h-4"/>
                                                </button>
                                            )}
                                        </div>

                                        {/* 分类下方辅助线 - 细虚线(1px) */}
                                        {draggingCategory.source &&
                                            draggingCategory.target === category.id &&
                                            draggingCategory.position === 'below' &&
                                            draggingCategory.source !== category.id && (
                                                <div
                                                    className="border-t border-dashed border-indigo-500 dark:border-indigo-400 animate-pulse"
                                                    style={{width: 'calc(100% - 1rem)', borderWidth: '1px'}}
                                                />
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ResizeCard>
                </div>
                {/* 右侧编辑区 */}
                <ResizeCard className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-800">
                    <div className="flex-1 overflow-y-auto p-6 max-h-220"
                         style={{
                             scrollbarWidth: 'thin',
                             scrollbarColor: 'rgb(96 165 250) rgb(229 231 235)',
                             scrollbarGutter: 'stable'
                         }}
                    >
                        <div className="max-w-lg mx-auto lg:w-lg">
                            {selectedCategory ? (
                                <>
                                    {/* 分类信息卡片 */}
                                    <div className={`p-5 rounded-xl mb-6 ${
                                        selectedCategory.id === 'quick-access'
                                            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50'
                                            : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-14 h-14 rounded-lg flex items-center justify-center shadow-sm"
                                                style={{backgroundColor: selectedCategory.iconBgColor}}
                                            >
                                                {renderIcon(selectedCategory, 7)}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{selectedCategory.name}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                    {selectedCategory.sites.length} 个网站 ·
                                                    图标色: {selectedCategory.iconColor} ·
                                                    背景色: {selectedCategory.iconBgColor}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 编辑表单 */}
                                    <div className="mb-6">
                                        <label
                                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">分类名称</label>
                                        <input
                                            type="text"
                                            value={selectedCategory.name}
                                            onChange={handleEditNameChange}
                                            className={`w-full px-5 py-3 rounded-lg border transition-all text-base 
                                             border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                                             bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200`}
                                        />
                                    </div>

                                    {/* 图标模式切换(编辑区) */}
                                    <div className="mb-6">
                                        <label
                                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            图标来源
                                        </label>
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <button
                                                type="button"
                                                onClick={() => handleIconModeChange('preset')}
                                                className={`py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer 
                                                    duration-200 ${
                                                    selectedCategory.iconMode === 'preset' ? 'ring-1 ring-indigo-200 bg-indigo-100 text-indigo-700  dark:ring-indigo-800' +
                                                        ' dark:bg-indigo-900/30 dark:text-indigo-300' : 'dark:text-indigo-300 dark:bg-slate-600 bg-slate-100' +
                                                        ' ring-slate-100 hover:bg-indigo-200 dark:hover:ring-indigo-600 dark:hover:bg-indigo-900/30'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faImage} className="h-3.5"/>
                                                <span>预设图标</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleIconModeChange('class')}
                                                className={`py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer 
                                                    duration-200 ${
                                                    selectedCategory.iconMode === 'class' ? 'ring-1 ring-indigo-200 bg-indigo-100 text-indigo-700  dark:ring-indigo-800' +
                                                        ' dark:bg-indigo-900/30 dark:text-indigo-300' : 'dark:text-indigo-300 dark:bg-slate-600 bg-slate-100' +
                                                        ' ring-slate-100 hover:bg-indigo-200 dark:hover:ring-indigo-600 dark:hover:bg-indigo-900/30'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faFont} className="h-3.5"/>
                                                <span>FA类名</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleIconModeChange('url')}
                                                className={`py-1.5 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer 
                                                    duration-200 ${
                                                    selectedCategory.iconMode === 'url' ? 'ring-1 ring-indigo-200 bg-indigo-100 text-indigo-700  dark:ring-indigo-800' +
                                                        ' dark:bg-indigo-900/30 dark:text-indigo-300' : 'dark:text-indigo-300 dark:bg-slate-600 bg-slate-100' +
                                                        ' ring-slate-100 hover:bg-indigo-200 dark:hover:ring-indigo-600 dark:hover:bg-indigo-900/30'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faLink} className="h-3.5"/>
                                                <span>图标链接</span>
                                            </button>
                                        </div>

                                        {/* 图标预览 + 选择区域 */}
                                        <div className="flex items-center gap-3 mt-3 mb-3">
                                            <label
                                                className="text-sm text-slate-700 dark:text-slate-300">预览: </label>
                                            <div
                                                className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm"
                                                style={{backgroundColor: selectedCategory.iconBgColor}}
                                            >
                                                {renderIcon(selectedCategory, 5)}
                                            </div>
                                        </div>

                                        {/* 图标选择/输入区域 */}
                                        {selectedCategory.iconMode === 'preset' && (
                                            <div className="flex gap-2 flex-wrap">
                                                {PRESET_ICONS.map(({icon, label, class: className}, i) => (
                                                    <button
                                                        key={"edit_preset_icon_" + i}
                                                        type="button"
                                                        title={`${label} (${className})`}
                                                        onClick={() => handleIconSelect(icon, className)}
                                                        className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                                            selectedCategory.fontAwesomeClass === getIconClass(icon) ? 'ring-2 ring-indigo-500' : ''
                                                        }`}
                                                        style={{backgroundColor: '#f3f4f6'}}
                                                    >
                                                        <FontAwesomeIcon icon={icon} style={{
                                                            fontSize: '20px',
                                                            color: '#6366f1'
                                                        }}/>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {selectedCategory.iconMode === 'class' && (
                                            <div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={selectedCategory.fontAwesomeClass}
                                                        onChange={(e) => handleFontAwesomeClassChange(e)}
                                                        placeholder="输入FontAwesome类名(格式: fa-solid fa-house)"
                                                        className={`flex-1 px-3 py-2 rounded-lg border transition-all text-sm border-slate-200 dark:border-slate-600 focus:outline-none
                                                                 focus:ring-2 focus:ring-indigo-500/30 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 
                                                                 ${invalidClass ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30' : ''}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setLocalCategories(prev =>
                                                            prev?.map(category =>
                                                                category.id === selectedId
                                                                    ? {
                                                                        ...category,
                                                                        fontAwesomeClass: ''
                                                                    }
                                                                    : category
                                                            ) || []
                                                        )}
                                                        disabled={!selectedCategory.fontAwesomeClass}
                                                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500
                                                            text-slate-500 cursor-pointer"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="h-4"/>
                                                    </button>
                                                </div>

                                                {invalidClass && (
                                                    <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faExclamationCircle}
                                                                         className="h-3"/>
                                                        格式错误,请使用&quot;前缀 图标名&quot;格式
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {selectedCategory.iconMode === 'url' && (
                                            <div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        value={selectedCategory.iconUrl}
                                                        onChange={(e) => handleIconUrlChange(e)}
                                                        placeholder="输入图标图片链接(http/https)"
                                                        className={`flex-1 px-3 py-2 rounded-lg border transition-all text-sm border-slate-200 dark:border-slate-600 focus:outline-none
                                                         focus:ring-2 focus:ring-indigo-500/30 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setLocalCategories(prev =>
                                                            prev?.map(category =>
                                                                category.id === selectedId
                                                                    ? {
                                                                        ...category,
                                                                        iconUrl: ''
                                                                    }
                                                                    : category
                                                            ) || []
                                                        )}
                                                        disabled={!selectedCategory.iconUrl}
                                                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500
                                                            text-slate-500 cursor-pointer"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="h-4"/>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 颜色选择区域 */}
                                    <div className="mb-6">
                                        <label
                                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            图标颜色(当前: {selectedCategory.iconColor})
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1 flex-wrap flex-1">
                                                {PRESET_ICON_COLORS.map((color, i) => (
                                                    <button
                                                        key={"edit_back_color_" + i}
                                                        type="button"
                                                        title={color}
                                                        onClick={() => handleColorSelect(color)}
                                                        className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer relative
                                                                ${selectedCategory.iconColor === color ?
                                                            'ring-2 ring-indigo-500 dark:ring-indigo-400' :
                                                            'hover:ring-1 hover:ring-slate-400 dark:hover:ring-slate-500'}`}
                                                        style={{backgroundColor: color}}
                                                    >
                                                        {selectedCategory.iconColor === color && (
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
                                                    value={selectedCategory.iconColor}
                                                    onChange={(e) => handleColorSelect(e.target.value)}
                                                    className="w-16 h-16 -mt-3 -ml-3 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label
                                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            图标背景色(当前: {selectedCategory.iconBgColor})
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1 flex-wrap flex-1">
                                                {PRESET_BG_COLORS.map((color, i) => (
                                                    <button
                                                        key={"edit_back_color_" + i}
                                                        type="button"
                                                        title={color}
                                                        onClick={() => handleBgColorSelect(color)}
                                                        className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer relative ${
                                                            selectedCategory.iconBgColor === color
                                                                ? 'ring-2 ring-indigo-500 border-transparent'
                                                                : 'border-slate-200 dark:border-slate-600'
                                                        }`}
                                                        style={{backgroundColor: color}}
                                                    >
                                                        {selectedCategory.iconBgColor === color && (
                                                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full
                                                                   bg-black  shadow-[0_0_0_0.5px_rgba(0,0,0,0.1)]"/>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                            <div
                                                className="w-10 h-10 border-0 rounded-lg shadow-sm overflow-hidden">
                                                <input
                                                    type="color"
                                                    value={selectedCategory.iconBgColor}
                                                    onChange={(e) => handleBgColorSelect(e.target.value)}
                                                    className="w-16 h-16 -mt-3 -ml-3 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-3">
                                        <label
                                            className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        </label>
                                        <button
                                            onClick={() => {
                                                setIsShowSiteEditModal(true);
                                                setSiteEditData(undefined);
                                            }}
                                            disabled={isSaving}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300
                                                 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="h-3.5 mr-1"/>
                                            新增网页
                                        </button>
                                    </div>

                                    {/* 包含网站列表 - 细虚线辅助线 */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <label
                                                className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                包含网站(拖拽排序)
                                            </label>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                拖动 <FontAwesomeIcon icon={faGripVertical} className="h-3 inline"/> 调整顺序
                                            </span>
                                        </div>

                                        <div
                                            className="space-y-3"
                                            onDragOver={(e) => handleEmptyCategoryDragOver(e, selectedCategory.id)}
                                            onDrop={handleSiteDrop}
                                        >
                                            {selectedCategory.sites.length > 0 ? (
                                                selectedCategory.sites.map((site) => (
                                                    <div key={"site_parent_" + site.id}>
                                                        {/* 网站上方辅助线 - 细虚线(1px) */}
                                                        {draggingSite.isDragging &&
                                                            draggingSite.targetCategoryId === selectedCategory.id &&
                                                            draggingSite.targetSiteId === site.id &&
                                                            draggingSite.position === 'above' &&
                                                            !(draggingSite.sourceCategoryId === selectedCategory.id &&
                                                                draggingSite.sourceSiteId === site.id) && (
                                                                <div
                                                                    className="border-t border-dashed border-indigo-500 dark:border-indigo-400 animate-pulse"
                                                                    style={{borderWidth: '1px'}}
                                                                />
                                                            )}

                                                        <div
                                                            key={site.id}
                                                            // ref={el => siteRefs.current[site.id] = el}
                                                            draggable
                                                            onDragStart={(e) => handleSiteDragStart(selectedCategory.id, site.id, e)}
                                                            onDragOver={(e) => handleSiteDragOver(e, selectedCategory.id, site.id)}
                                                            onDragEnd={handleSiteDragEnd}
                                                            onDrop={handleSiteDrop}
                                                            className={`p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center gap-3 border transition-all duration-200 ${
                                                                draggingSite.sourceSiteId === site.id
                                                                    ? 'opacity-80 shadow-md scale-105 border-indigo-300 dark:border-indigo-700'
                                                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600/50'
                                                            } ${
                                                                draggingSite.targetSiteId === site.id &&
                                                                draggingSite.position === 'above' &&
                                                                draggingSite.sourceSiteId &&
                                                                !(draggingSite.sourceCategoryId === selectedCategory.id &&
                                                                    draggingSite.sourceSiteId === site.id)
                                                                    ? 'mt-3'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <div
                                                                className="text-slate-400 cursor-move flex-shrink-0">
                                                                <FontAwesomeIcon icon={faGripVertical}
                                                                                 className="h-4"/>
                                                            </div>
                                                            <div
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                                style={{
                                                                    backgroundColor: site.iconBgColor || selectedCategory.iconBgColor
                                                                }}
                                                            >
                                                                {renderIcon({
                                                                    iconMode: site.iconMode,
                                                                    iconUrl: site.iconUrl,
                                                                    fontAwesomeClass: site.fontAwesomeClass,
                                                                    iconColor: site.iconColor || selectedCategory.iconColor
                                                                }, 4.5)}
                                                            </div>
                                                            <span
                                                                className="text-sm text-slate-800 dark:text-slate-200 flex-1">{site.name}</span>
                                                            <div
                                                                className="flex items-center gap-0.5 ml-2 opacity-90 hover:opacity-100 transition-opacity duration-200">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditSite(site);
                                                                    }}
                                                                    disabled={isSaving}
                                                                    className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                                                                        isSaving
                                                                            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                                            : 'text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
                                                                    }`}
                                                                    title="编辑网页"
                                                                    aria-label={`编辑 ${site.name}`}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit}
                                                                                     className="h-4 w-4"/>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteSite(site);
                                                                    }}
                                                                    disabled={isSaving}
                                                                    className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                                                                        isSaving
                                                                            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                                            : 'text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
                                                                    }`}
                                                                    title="删除网页"
                                                                    aria-label={`删除 ${site.name}`}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash}
                                                                                     className="h-4 w-4"/>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* 网站下方辅助线 - 细虚线(1px) */}
                                                        {draggingSite.isDragging &&
                                                            draggingSite.targetCategoryId === selectedCategory.id &&
                                                            draggingSite.targetSiteId === site.id &&
                                                            draggingSite.position === 'below' &&
                                                            !(draggingSite.sourceCategoryId === selectedCategory.id &&
                                                                draggingSite.sourceSiteId === site.id) && (
                                                                <div
                                                                    className="border-t border-dashed border-indigo-500 dark:border-indigo-400 animate-pulse"
                                                                    style={{borderWidth: '1px'}}
                                                                />
                                                            )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div
                                                    className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-600"
                                                    onDragOver={(e) => handleEmptyCategoryDragOver(e, selectedCategory.id)}
                                                    onDrop={handleSiteDrop}
                                                >
                                                    {draggingSite.isDragging ? (
                                                        <>
                                                            {/* 空分类拖拽提示线 - 细虚线(1px) */}
                                                            <div
                                                                className="border-t border-dashed border-indigo-500 dark:border-indigo-400 animate-pulse mx-auto mb-4"
                                                                style={{width: '4rem', borderWidth: '1px'}}
                                                            />
                                                            <p>拖放网站到这里</p>
                                                            <div
                                                                className="border-t border-dashed border-indigo-500 dark:border-indigo-400 animate-pulse mx-auto mt-4"
                                                                style={{width: '4rem', borderWidth: '1px'}}
                                                            />
                                                        </>
                                                    ) : (
                                                        <div>
                                                            <FontAwesomeIcon icon={faLink}
                                                                             className="h-8 text-slate-400 mb-2"/>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                                该分类下暂无网站,点击&quot;新增网页&quot;按钮开始添加
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div
                                    className="flex flex-col items-center justify-center h-full text-center py-10 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <div
                                        className="w-20 h-20 mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <FontAwesomeIcon icon={faGripVertical} className="h-10 text-slate-400"/>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400">请从左侧选择一个分类进行编辑</p>
                                </div>
                            )}
                        </div>
                    </div>
                </ResizeCard>
            </div>
            {/* 恢复确认对话框 */}
            <MessageModal
                visible={showRestoreConfirm}
                onClose={() => setShowRestoreConfirm(false)}
                onCancel={() => setShowRestoreConfirm(false)}
                onConfirm={handleRestoreChanges}
                type="rollback"
                title="确认恢复修改"
                message="此操作将放弃所有未保存的更改,恢复到上次保存的状态。确定要继续吗？"
            />
            {/* 删除分类对话框 */}
            <MessageModal
                visible={showDeleteCategoryConfirm}
                onClose={() => setShowDeleteCategoryConfirm(false)}
                onCancel={() => setShowDeleteCategoryConfirm(false)}
                onConfirm={handleDeleteCategoryConfirm}
                type="delete"
                title="确认删除"
                message={`确定要删除分类「${selectedCategory?.name}」吗？此操作不可撤销`}
            />
            {/* 删除网页对话框 */}
            <MessageModal
                visible={showDeleteSiteConfirm}
                onClose={() => setshowDeleteSiteConfirm(false)}
                onCancel={() => setshowDeleteSiteConfirm(false)}
                onConfirm={handleDeleteSiteConfirm}
                type="delete"
                title="确认删除"
                message={`确定要删除网页「${deleteSite?.name}」吗？此操作不可撤销`}
            />
            {/*网页编辑弹窗*/}
            <SiteEditModal
                visible={isShowSiteEditModal}
                onClose={() => setIsShowSiteEditModal(false)}
                isEditing={!!siteEditData}
                editSite={siteEditData}
                onSubmit={handleSaveSite}
                onCancel={() => setIsShowSiteEditModal(false)}
                isSaving={isSaving}
            />
        </div>
    );
};

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
                                                                 visible = false,
                                                                 onClose,
                                                                 initialData = [],
                                                                 onSave,
                                                                 title = "编辑分类",
                                                                 defaultSelectedId
                                                             }) => {
    return (
        <Modal
            visible={visible}
            onClose={onClose}
        >
            <CategoryEdit
                initialData={initialData}
                onSave={onSave}
                title={title}
                defaultSelectedId={defaultSelectedId}
            ></CategoryEdit>
        </Modal>
    );
};


export default CategoryEditModal;
