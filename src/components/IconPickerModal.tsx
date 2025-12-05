'use client';
import React, {useState, useEffect, useMemo} from 'react';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import * as regularIcons from '@fortawesome/free-regular-svg-icons';
import * as brandIcons from '@fortawesome/free-brands-svg-icons';
import Modal from "@/components/common/Modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faLayerGroup, faTimes, faSearch, faAngleLeft, faAngleRight} from "@fortawesome/free-solid-svg-icons";
import ResizeCard from "./common/ResizeCard";
import {IconProp} from "@fortawesome/fontawesome-svg-core";

interface IconItem {
    id: string;
    name: string;
    icon: IconProp;
    library: 'solid' | 'regular' | 'brands';
    importName: string;
}

interface IconPickerProps {
    onSubmit: (icon: IconProp) => void;
    onCancel: () => void;
}

interface IconPickerModalProps extends IconPickerProps {
    visible: boolean;
    onClose: () => void;
}

const ICONS_PER_PAGE = 30;
const MAX_VISIBLE_PAGES = 5;
const LIBRARY_OPTIONS = ['all', 'solid', 'regular', 'brands'] as const;

const IconPicker: React.FC<IconPickerProps> = ({onSubmit, onCancel}) => {
    // 状态管理
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLibrary, setSelectedLibrary] = useState<'all' | 'solid' | 'regular' | 'brands'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 加载所有图标
    const allIcons = useMemo(() => {
        setIsLoading(true);
        const icons: IconItem[] = [];

        try {
            // 统一处理图标库加载逻辑
            const iconLibraries = [
                {lib: solidIcons, prefix: 'fas', libraryType: 'solid' as const},
                {lib: regularIcons, prefix: 'far', libraryType: 'regular' as const},
                {lib: brandIcons, prefix: 'fab', libraryType: 'brands' as const},
            ];

            iconLibraries.forEach(({lib, prefix, libraryType}) => {
                Object.entries(lib).forEach(([key, value]) => {
                    const icon = value as any;
                    if (icon?.prefix === prefix) {
                        icons.push({
                            id: `${libraryType}-${key}`,
                            name: key.replace('Icon', ''),
                            icon: value as IconProp,
                            library: libraryType,
                            importName: key
                        });
                    }
                });
            });

            // 按名称排序
            icons.sort((a, b) => a.name.localeCompare(b.name));

        } catch (error) {
            console.error('Error loading icons:', error);
        } finally {
            setIsLoading(false);
        }

        return icons;
    }, []);

    // 过滤图标
    const filteredIcons = useMemo(() => {
        return allIcons.filter(icon => {
            // 库筛选
            if (selectedLibrary !== 'all' && icon.library !== selectedLibrary) return false;
            // 搜索筛选
            if (searchTerm) return icon.name.toLowerCase().includes(searchTerm.toLowerCase());
            return true;
        });
    }, [allIcons, selectedLibrary, searchTerm]);

    // 分页处理
    const paginatedIcons = useMemo(() => {
        const startIndex = (currentPage - 1) * ICONS_PER_PAGE;
        return filteredIcons.slice(startIndex, startIndex + ICONS_PER_PAGE);
    }, [filteredIcons, currentPage]);

    const totalPages = Math.ceil(filteredIcons.length / ICONS_PER_PAGE);

    // 过滤条件变化时重置页码
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedLibrary, searchTerm]);

    // 获取库显示名称
    const getLibraryName = (library: typeof LIBRARY_OPTIONS[number]) => {
        const nameMap = {
            all: 'All',
            solid: 'Solid',
            regular: 'Regular',
            brands: 'Brands'
        };
        return nameMap[library];
    };

    // 获取库颜色样式
    const getLibraryStyle = (library: string, isSelected = false) => {
        const base = "transition-all duration-150 ease-out font-medium rounded-lg"; // 缩短动画时长，使用ease-out缓动
        const selectedBase = "shadow-sm";

        const styles = {
            solid: {
                default: `${base} bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-md`,
                selected: `${base} ${selectedBase} bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-700`
            },
            regular: {
                default: `${base} bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:shadow-md`,
                selected: `${base} ${selectedBase} bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-700 dark:border-emerald-700`
            },
            brands: {
                default: `${base} bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:shadow-md`,
                selected: `${base} ${selectedBase} bg-purple-600 text-white border-purple-600 dark:bg-purple-700 dark:border-purple-700`
            },
            all: {
                default: `${base} bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-md`,
                selected: `${base} ${selectedBase} bg-slate-700 text-white border-slate-700 dark:bg-slate-600 dark:border-slate-600`
            }
        };

        const libStyles = styles[library as keyof typeof styles] || styles.all;
        return isSelected ? libStyles.selected : libStyles.default;
    };

    // 渲染页码
    const renderPageNumbers = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
        const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

        // 调整起始页
        if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
            startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
        }

        // 第一页
        if (startPage > 1) {
            pages.push(
                <button
                    key="first"
                    onClick={() => setCurrentPage(1)}
                    className={`w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 cursor-pointer
                     dark:hover:bg-slate-700 hover:shadow-md transition-all duration-300 flex items-center justify-center text-sm font-medium`}
                >
                    1
                </button>
            );
            if (startPage > 2) pages.push(<span key="ellipsis-start"
                                                className="w-6 text-center text-gray-400">...</span>);
        }

        // 中间页码
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-10 h-10 rounded-lg transition-all duration-300 flex items-center justify-center text-sm font-medium cursor-pointer ${
                        currentPage === i
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' // 扁平化选中
                            : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:shadow-md'
                    }`}
                >
                    {i}
                </button>
            );
        }

        // 最后一页
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push(<span key="ellipsis-end"
                                                           className="w-6 text-center text-gray-400">...</span>);
            pages.push(
                <button
                    key="last"
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 cursor-pointer
                     dark:hover:bg-slate-700 hover:shadow-md transition-all duration-300 flex items-center justify-center text-sm font-medium`}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    // 图标项渲染
    const renderIconItem = (icon: IconItem, index: number) => (
        <button
            key={icon.id}
            onClick={() => setSelectedIcon(icon)}
            className={`
                group relative flex flex-col items-center p-3 rounded-lg
                border transition-all duration-200 ease-in-out
                hover:shadow-md hover:scale-105 hover:z-10 cursor-pointer
                ${selectedIcon?.id === icon.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105  ring-blue-200 dark:ring-blue-900/30'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-white dark:hover:bg-slate-800'
            }
                animate-fade-in
            `}
            style={{animationDelay: `${index * 15}ms`}}
            aria-label={icon.name}
        >
            {/* 库标识 */}
            <div
                className={`absolute top-1 right-1 px-1.5 py-0.5 text-xs font-medium rounded-full ${getLibraryStyle(icon.library)}`}
            >
                {icon.library.charAt(0).toUpperCase()}
            </div>

            {/* 图标预览 */}
            <div
                className={`mb-2  group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 
                ${selectedIcon?.id === icon.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }
                `}
            >
                <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={icon.icon} size="lg"/>
                </div>
            </div>

            {/* 图标名称 */}
            <div className="w-full">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate text-center">
                    {icon.name.split('fa')[1]}
                </p>
            </div>
        </button>
    );

    const searchAllIcons = searchTerm ? allIcons.filter(icon => {
        // 搜索筛选
        return icon.name.toLowerCase().includes(searchTerm.toLowerCase());
    }) : allIcons;

    return (
        <ResizeCard
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl w-[100vw] md:max-w-[768px] max-h-[85vh]"
        >
            {/* 头部区域 */}
            <div
                className="min-h-[60px] border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/80 dark:to-slate-800/80"
            >
                <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <FontAwesomeIcon icon={faLayerGroup} className="h-5 text-indigo-500"/>
                    <span>选择图标</span>
                </h2>
            </div>

            {/* 主体内容 */}
            <div
                className="bg-gray-50 dark:bg-slate-900 p-4 md:p-6 transition-all duration-300 h-[78vh] overflow-auto"
            >
                <div className="max-w-7xl mx-auto">
                    {/* 控制面板 */}
                    <div
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 mb-6 transition-all duration-300 border border-slate-100 dark:border-slate-700"
                    >
                        <div className="space-y-5">
                            {/* 搜索框 */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faSearch}
                                                     className="h-5 w-5 text-gray-400 dark:text-gray-500"/>
                                </div>
                                <input type="text" id="searchInput"
                                       value={searchTerm}
                                       onChange={(e) => setSearchTerm(e.target.value)}
                                       className={`w-full pl-12 pr-4 py-3 rounded-lg border outline-none transition-all shadow-sm group-hover:shadow-md
                                   border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                                             bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200`}
                                       placeholder="搜索图标名称(如:home、user)"/>
                            </div>

                            {/* 库筛选按钮 */}
                            <div className="grid grid-cols-4 gap-3">
                                {LIBRARY_OPTIONS.map((library) => {
                                    const count = library === 'all'
                                        ? searchAllIcons.length
                                        : searchAllIcons.filter(i => i.library === library).length;

                                    return (
                                        <button
                                            key={library}
                                            onClick={() => setSelectedLibrary(library)}
                                            className={`
                                                ${getLibraryStyle(library, selectedLibrary === library)}
                                                flex items-center justify-center gap-2
                                                px-4 py-2.5
                                                text-sm
                                                font-medium
                                                transition-all duration-150 ease-out cursor-pointer
                                            `}
                                            aria-selected={selectedLibrary === library}
                                        >
                                            <span>{getLibraryName(library)}</span>
                                            <span
                                                className={`
                                                    text-xs font-medium rounded-full px-2 py-0.5
                                                    ${selectedLibrary === library
                                                    ? 'bg-white/20 text-white dark:bg-black/20'
                                                    : 'bg-white/70 text-slate-600 dark:bg-black/20 dark:text-slate-300'
                                                }
                                                `}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 加载状态 */}
                    {isLoading ? (
                        <div
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-16 text-center mb-6 border border-slate-100 dark:border-slate-700"
                        >
                            <div
                                className="inline-block animate-spin rounded-lg h-16 w-16 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400 mb-6"
                            ></div>
                            <p className="text-gray-600 dark:text-gray-400 animate-pulse text-lg">加载图标中...</p>
                        </div>
                    ) : (
                        <>
                            {/* 图标网格 */}
                            <div
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 mb-6 transition-all duration-300 border border-slate-100 dark:border-slate-700"
                            >
                                {paginatedIcons.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div
                                            className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 mb-6"
                                        >
                                            <FontAwesomeIcon icon={faSearch}
                                                             className="w-10 h-10 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">未找到匹配图标</h3>
                                        <p className="text-gray-500 dark:text-gray-500">尝试更换搜索关键词或选择其他图标库</p>
                                    </div>
                                ) : (
                                    <div
                                        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-4 md:gap-5"
                                    >
                                        {paginatedIcons.map(renderIconItem)}
                                    </div>
                                )}

                                {/* 分页控件 */}
                                {totalPages > 1 && (
                                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                All: {filteredIcons.length}, {((currentPage - 1) * ICONS_PER_PAGE) + 1} - {Math.min(currentPage * ICONS_PER_PAGE, filteredIcons.length)}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* 上一页 */}
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className={`px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 cursor-pointer
                                                    hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md text-sm font-medium`}
                                                    aria-label="上一页"
                                                >
                                                    <FontAwesomeIcon icon={faAngleLeft}
                                                                     className="h-5 w-5   dark:text-gray-300"/>
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    {renderPageNumbers()}
                                                </div>

                                                {/* 下一页 */}
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className={`px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 cursor-pointer
                                                    hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md text-sm font-medium`}
                                                    aria-label="下一页"
                                                >
                                                    <FontAwesomeIcon icon={faAngleRight}
                                                                     className="h-5 w-5  dark:text-gray-300"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* 表单操作按钮 */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onCancel}
                        className={`px-6 py-3 rounded-lg text-sm transition-colors bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 
                        text-slate-700 dark:text-slate-300 cursor-pointer`}
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-4 mr-1.5"/>
                        取消
                    </button>
                    <button
                        disabled={!selectedIcon}
                        onClick={() => selectedIcon && onSubmit(selectedIcon.icon)}
                        className={`px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer
                        disabled:bg-slate-200 disabled:dark:bg-slate-700 disabled:text-slate-500 disabled:hover:bg-slate-200 disabled:dark:hover:bg-slate-700 disabled:cursor-not-allowed`}
                    >
                        <FontAwesomeIcon icon={faCheck} className="h-4"/>
                        <span>确定选择</span>
                    </button>
                </div>
            </div>
        </ResizeCard>
    );
};

// 模态框包装组件
const IconPickerModal: React.FC<IconPickerModalProps> = ({
                                                             visible = false,
                                                             onClose,
                                                             onSubmit,
                                                             onCancel,
                                                         }) => {
    return (
        <Modal visible={visible} onClose={onClose}>
            <IconPicker onSubmit={onSubmit} onCancel={onCancel}/>
        </Modal>
    );
};

export default IconPickerModal;
