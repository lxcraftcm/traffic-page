'use client';
import React, {useState, useEffect} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faCog,
    faSync,
    faEdit,
    faLayerGroup,
    faGlobe,
    faServer,
    faRightFromBracket,
    faBars
} from '@fortawesome/free-solid-svg-icons';
import CategoryEditModal from '@/components/CategoryEditModal';
import {Category} from "@/types/base"
import {renderIcon} from "@/utils/IconUtil";
import {apis} from "@/utils/RequestUtil";
import {removeToken} from "@/lib/auth";
import {useToast} from "@/components/common/Toast";
import LanguageSelector from "@/components/LanguageSelector";
import SearchBar from "@/components/SearchBar";
import SystemEditModal from "@/components/SystemEdit/SystemEditModal";
import {useAppTranslation} from "@/providers/I18nProvider";
import ThemeSelector from "@/components/ThemeSelector";
import {usePreferences} from "@/providers/PreferencesProvider";

const NavigationHub = () => {
    const {generalSetting, userPreferences, setPreferences} = usePreferences();
    // 核心状态
    const [isInternal, setIsInternal] = useState(userPreferences.networkType === 'internal');
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [renderKey, setRenderKey] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [defaultSelectedId, setDefaultSelectedId] = useState<string>();
    const [isSystemEditModalOpen, setIsSystemEditModalOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // 初始化i18n
    const {t} = useAppTranslation("NavigationHub");
    // 初始化 Toast
    const {showToast} = useToast();

    // 加载数据
    const loadData = () => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        apis.getUserPage().then((res) => {
            setCategories(JSON.parse(res.userPage))
        }).catch((error: any) => {
            showToast({
                message: error?.message || t('loadDataFailed'),
                type: 'error',
                duration: 3000,
            });
        }).finally(() => {
            setIsLoading(false);
        })
    }

    // 初始化加载
    useEffect(() => {
        document.body.style.scrollbarWidth = 'thin';
        document.body.style.scrollbarColor = 'rgb(96 165 250) rgb(229 231 235)';
        document.body.style.scrollbarGutter = 'stable';
    }, [isLoading]);

    // 点击外部关闭菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMobileMenuOpen) {
                const menu = document.querySelector('.mobile-menu-container');
                if (menu && !menu.contains(event.target as Node)) {
                    setIsMobileMenuOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    //
    useEffect(() => {
        const init = async () => {
            loadData();
        }
        init();
    }, []);

    // 打开编辑弹窗
    const openEditModal = (defaultSelectedId?: string) => {
        setIsEditModalOpen(true);
        setDefaultSelectedId(defaultSelectedId);
    };

    // 分类切换
    const handleCategoryChange = (category: string) => {
        if (category === activeCategory) return;
        setActiveCategory(category);
        setRenderKey(prev => prev + 1);
    };

    // 保存数据
    const savePageData = (data: Category[]) => {
        setIsSaving(true)
        apis.saveUserPage({userPage: JSON.stringify(data)}).then(res => {
            showToast({
                message: t('saveSuccess'),
                type: 'success',
                duration: 3000,
            });
            loadData();
            setIsEditModalOpen(false);
        }).catch((err: any) => {
            showToast({
                message: err?.message || t('saveDataFailed'),
                type: 'error',
                duration: 3000,
            });
        }).finally(() => {
            setIsSaving(false)
        })
    }

    // 渲染卡片
    const renderVisibleCategories = () => {
        const visibleCategories = activeCategory === 'all' ? categories : categories.filter(cat => cat.id === activeCategory || cat.id === 'quick-access')
        return <div key={renderKey} className="space-y-6 sm:space-y-10 px-2">
            {visibleCategories.map((category, catIndex) => (
                <div
                    key={category.id}
                    className="animate-fade-in-up"
                    style={{animationDelay: `${catIndex * 200}ms`}}
                >
                    {/* 分类标题 */}
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div
                                className={"w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"}
                                style={{backgroundColor: category.iconBgColor}}
                            >
                                {renderIcon(category, isQuickAccess(category.id) ? 3.5 : 4.5)}
                            </div>
                            <h3 className={`font-semibold text-base sm:text-lg`}>
                                {category.name}
                            </h3>
                        </div>
                        <button
                            onClick={() => {
                                openEditModal(category.id)
                            }}
                            className="text-indigo-600 text-xs sm:text-sm hover:underline flex items-center gap-1 sm:gap-1.5 transition-colors duration-300 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5"/>
                            <span className="hidden sm:inline">{t('editCategory')}</span>
                        </button>
                    </div>

                    {/* 响应式网格 */}
                    <div
                        className={`grid gap-3 sm:gap-4 ${
                            isQuickAccess(category.id)
                                ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        }`}>

                        {category.sites.map((site, siteIndex) => {
                            const isQuick = isQuickAccess(category.id);
                            const delay = catIndex * 200 + (siteIndex + 1) * 100;

                            return (
                                <a key={site.id}
                                   target={'_blank'}
                                   href={isInternal ? site.internalUrl : site.externalUrl}
                                   className={`block rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border
                                                   bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 ${isQuick ? 'p-2.5 sm:p-3' : 'p-3 sm:p-5'}`}
                                   style={{animationDelay: `${delay}ms`}}
                                >
                                    {isQuick ?
                                        <div className="flex flex-col justify-center items-center">
                                            <div
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{backgroundColor: site.iconBgColor}}
                                            >
                                                {renderIcon(site, 4)}
                                            </div>

                                            <h4 className="font-medium text-xs sm:text-sm mt-2 sm:mt-3 text-center">{site.name}</h4>
                                        </div>
                                        : <div className="flex items-start gap-2 sm:gap-3">
                                            <div
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{backgroundColor: site.iconBgColor}}
                                            >
                                                {renderIcon(site, 5)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm sm:text-base mb-1 truncate">{site.name}</h4>
                                                <p className="text-xs sm:text-sm text-gray-500 mb-2 line-clamp-2">{site.desc}</p>
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                    <span
                                                        className="text-xs text-gray-400 domain-name truncate">{isInternal ? site.internalUrl : site.externalUrl}
                                                    </span>
                                                    <div className={`px-2 sm:px-2.5 py-0.5 text-xs dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full
                                                                    flex items-center justify-center flex-shrink-0
                                                                        ${isInternal ? 'bg-emerald-100 text-emerald-600' : 'text-blue-500 bg-blue-100'}`}>
                                                        <FontAwesomeIcon
                                                            icon={isInternal ? faServer : faGlobe}
                                                            className="mr-0.5 h-3 w-3"/>
                                                        <span
                                                            className="hidden sm:inline">{isInternal ? t('internal') : t('external')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </a>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    }

    // 快速访问id
    const isQuickAccess = (id: string) => id === 'quick-access';

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 ">
            {/* 背景装饰 */}
            <div className="fixed inset-0 -z-10 opacity-10">
                <div
                    className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-300 dark:bg-indigo-800 rounded-full blur-3xl"></div>
            </div>

            {/* 顶部导航栏 */}
            <header
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-all duration-300">
                <div className="max-w-7xl mx-auto py-3 sm:py-4 px-3 sm:px-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-105">
                                <FontAwesomeIcon icon={faLayerGroup} className="text-white h-4 w-4 sm:h-5.5 sm:w-5.5"/>
                            </div>
                            <h1 className="text-base sm:text-xl font-semibold">{t('navCenter')}</h1>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-5">
                            {/* 内外网切换 */}
                            <div className="flex items-center gap-1.5 sm:gap-2.5">
                                {/* 移动端只显示图标 */}
                                <span className={`sm:hidden text-sm font-medium transition-colors duration-300 ${
                                    !isInternal ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                    <FontAwesomeIcon icon={faGlobe} className="h-4 w-4"/>
                                </span>
                                {/* 桌面端显示完整标签 */}
                                <span
                                    className={`hidden sm:inline text-sm font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                                        !isInternal ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                    <FontAwesomeIcon icon={faGlobe} className="h-3.5 w-3.5"/>
                                    <span>{t('external')}</span>
                                </span>

                                {/* 切换开关 */}
                                <label className="relative inline-flex h-5 w-9 sm:h-7 sm:w-14 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isInternal}
                                        onChange={() => {
                                            setIsInternal(!isInternal)
                                            setPreferences('networkType', isInternal ? 'external' : 'internal')
                                        }}
                                        className="sr-only peer"
                                    />
                                    {/* 开关背景 */}
                                    <div
                                        className={`block h-5 w-9 sm:h-7 sm:w-14 rounded-full transition-colors duration-300 ${
                                            isInternal ? 'bg-emerald-500' : 'bg-blue-500'
                                        }`}/>
                                    {/* 开关滑块 */}
                                    <div
                                        className={`absolute left-0.5 top-0.5 h-4 w-4 sm:h-6 sm:w-6 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                                            isInternal ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                    />
                                </label>

                                {/* 内网标签 */}
                                <span
                                    className={`hidden sm:inline text-sm font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                                        isInternal ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                    <FontAwesomeIcon icon={faServer} className="h-3.5 w-3.5"/>
                                    <span>{t('internal')}</span>
                                </span>
                                <span className={`sm:hidden text-sm font-medium transition-colors duration-300 ${
                                    isInternal ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                    <FontAwesomeIcon icon={faServer} className="h-4 w-4"/>
                                </span>
                            </div>

                            {/* 桌面端功能按钮 */}
                            <div className="hidden sm:flex items-center gap-3">
                                <ThemeSelector/>
                                <button
                                    onClick={() => {
                                        setIsSystemEditModalOpen(true);
                                        setIsEditModalOpen(false);
                                    }}
                                    className="p-2 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center hover:shadow-sm cursor-pointer dark:hover:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 text-slate-700 hover:scale-110 active:scale-95"
                                >
                                    <FontAwesomeIcon icon={faCog} className="h-5 w-5"/>
                                </button>
                                <button
                                    onClick={loadData}
                                    className="p-2 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center hover:shadow-sm cursor-pointer dark:hover:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 text-slate-700 hover:scale-110 active:scale-95"
                                >
                                    <FontAwesomeIcon icon={faSync} className="h-5 w-5" onClick={(event) => {
                                        const button = event.currentTarget;
                                        if (!button.classList.contains('animate-spin-once')) {
                                            button.classList.add('animate-spin-once');
                                            setTimeout(() => {
                                                button.classList.remove('animate-spin-once');
                                            }, 700);
                                        }
                                    }}/>
                                </button>
                                <button
                                    onClick={() => {
                                        removeToken();
                                        window.location.href = '/login'
                                    }}
                                    className="p-2 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center hover:shadow-sm cursor-pointer dark:hover:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 text-slate-700 hover:scale-110 active:scale-95"
                                >
                                    <FontAwesomeIcon icon={faRightFromBracket} className="h-5 w-5"/>
                                </button>
                                <LanguageSelector/>
                            </div>

                            {/* 移动端汉堡菜单按钮 */}
                            <div className="sm:hidden relative mobile-menu-container">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 rounded-full transition-all duration-300 ease-in-out hover:shadow-sm cursor-pointer dark:hover:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 text-slate-700"
                                >
                                    <FontAwesomeIcon icon={faBars}
                                                     className={`h-5 w-5 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}/>
                                </button>

                                {/* 移动端下拉菜单 */}
                                {isMobileMenuOpen && (
                                    <div
                                        className="absolute right-0 top-12 mt-2 w-52 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-visible z-50">
                                        <div className="py-2">
                                            {/* 第一行：功能切换 */}
                                            <div className="flex gap-2 px-2 pl-5">
                                                <LanguageSelector onChange={() => {
                                                    setIsMobileMenuOpen(false);
                                                }}/>
                                                <ThemeSelector/>
                                            </div>

                                            <div className="border-t border-slate-200 dark:border-slate-700 my-2"/>

                                            {/* 第二行：设置按钮 */}
                                            <div className="px-2">
                                                <button
                                                    onClick={() => {
                                                        setIsSystemEditModalOpen(true);
                                                        setIsEditModalOpen(false);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    className="w-full p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-2"
                                                >
                                                    <FontAwesomeIcon icon={faCog} className="h-4 w-4"/>
                                                    <span className="text-xs">{t('settings')}</span>
                                                </button>
                                            </div>

                                            <div className="border-t border-slate-200 dark:border-slate-700 my-2"/>

                                            {/* 第三行：登出 */}
                                            <div className="px-2">
                                                <button
                                                    onClick={() => {
                                                        removeToken();
                                                        window.location.href = '/login'
                                                    }}
                                                    className="w-full p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2"
                                                >
                                                    <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4"/>
                                                    <span className="text-xs">{t('logout')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 主内容区 */}
            <main className="mx-full flex-1 px-4 sm:px-6 py-6 sm:py-10 overflow-y-auto flex flex-col items-center"
                  style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgb(96 165 250) rgb(229 231 235)',
                      scrollbarGutter: 'stable',
                  }}
            >
                {/* 内容 */}
                <div className="max-w-7xl xl:w-7xl flex-1 w-full">

                    <div id="searchContainer" className="max-w-2xl mx-auto mb-6 sm:mb-10 animate-fade-in px-2"
                         style={{animationDelay: '50ms'}}>
                        <h2 className="text-[clamp(1.25rem,4vw,2.5rem)] font-bold text-center mb-2">{t('discoverAndAccess')}</h2>
                        <p className="text-gray-500 text-center mb-4 sm:mb-6 text-sm sm:text-base">{t('oneStopNavigation')}</p>

                        <SearchBar/>
                    </div>

                    {/* 分类标签栏 */}
                    <div className="mb-6 sm:mb-10 animate-fade-in"
                         style={{animationDelay: '250ms'}}>
                        {/* 移动端横向滚动 */}
                        <div className="sm:hidden flex overflow-x-auto gap-2 px-2 pb-2 scrollbar-hide"
                             style={{scrollbarWidth: 'none'}}>
                            <button
                                onClick={() => handleCategoryChange('all')}
                                className={`px-4 py-2 rounded-full text-xs transition-all duration-300 h-7 flex items-center flex-shrink-0 cursor-pointer whitespace-nowrap ${
                                    activeCategory === 'all'
                                        ? 'bg-indigo-600 text-white shadow-md cursor-default'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                                disabled={activeCategory === 'all'}
                            >
                                {t('all')}
                            </button>
                            {categories.filter(cat => !isQuickAccess(cat.id)).map((cat, index) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`px-4 py-2 rounded-full text-xs transition-all duration-300 h-7 flex items-center flex-shrink-0 cursor-pointer whitespace-nowrap ${
                                        activeCategory === cat.id
                                            ? 'bg-indigo-600 text-white shadow-md cursor-default'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                    disabled={activeCategory === cat.id}
                                    style={{animationDelay: `${300 + index * 80}ms`}}
                                >
                                    {cat.name}
                                </button>
                            ))}
                            <button
                                onClick={() => openEditModal()}
                                className={`px-4 py-2 rounded-full text-xs bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 h-7 flex items-center flex-shrink-0 cursor-pointer whitespace-nowrap`}
                                disabled={isLoading}
                            >
                                <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5 mr-1"/>
                                {t('edit')}
                            </button>
                        </div>

                        {/* 桌面端换行显示 */}
                        <div className="hidden sm:flex flex-wrap gap-3 px-2 justify-start">
                            <button
                                onClick={() => handleCategoryChange('all')}
                                className={`px-4 py-2.5 rounded-full text-sm transition-all duration-300 h-8 flex items-center cursor-pointer ${
                                    activeCategory === 'all'
                                        ? 'bg-indigo-600 text-white shadow-md cursor-default'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                                disabled={activeCategory === 'all'}
                            >
                                {t('all')}
                            </button>
                            {categories.filter(cat => !isQuickAccess(cat.id)).map((cat, index) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`px-4 py-2.5 rounded-full text-sm transition-all duration-300 h-8 flex items-center cursor-pointer ${
                                        activeCategory === cat.id
                                            ? 'bg-indigo-600 text-white shadow-md cursor-default'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                    disabled={activeCategory === cat.id}
                                    style={{animationDelay: `${300 + index * 80}ms`}}
                                >
                                    {cat.name}
                                </button>
                            ))}
                            <button
                                onClick={() => openEditModal()}
                                className={`px-4 py-2.5 rounded-full text-sm bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 h-8 flex items-center cursor-pointer`}
                                disabled={isLoading}
                            >
                                <FontAwesomeIcon icon={faEdit} className="h-4.5 w-4.5 mr-1.5"/>
                                {t('editCategory')}
                            </button>
                        </div>
                    </div>

                    {/* 加载动画 */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="relative w-16 h-16">
                                <div
                                    className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-500 dark:border-t-indigo-400 animate-spin"
                                    style={{animationDuration: '1.5s'}}
                                ></div>
                                <div
                                    className="absolute inset-2 rounded-full border-2 border-indigo-200 dark:border-indigo-800/50 border-t-transparent animate-pulse"
                                    style={{animationDuration: '2s'}}
                                ></div>
                                <div
                                    className="absolute inset-6 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-ping opacity-75"
                                    style={{animationDuration: '2s'}}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        /* 网站卡片网格 */
                        renderVisibleCategories()
                    )}
                    {/* 页脚 */}
                </div>
                {/* 页脚 */}
                <footer
                    className="mt-12 sm:mt-16 py-4 sm:py-5 border-t border-slate-200 dark:border-slate-800 animate-fade-in"
                    style={{animationDelay: '400ms'}}>
                    <div
                        className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        © {generalSetting.copyright + ' | Version:' + t('version')}
                    </div>
                </footer>
            </main>


            {/*编辑弹窗组件 */}
            <CategoryEditModal
                visible={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                }}
                initialData={[...categories]}
                onSave={(data) => {
                    savePageData(data);
                }}
                defaultSelectedId={defaultSelectedId}
                isSaving={isSaving}
            />
            {/*系统属性编辑组件 */}
            <SystemEditModal
                visible={isSystemEditModalOpen}
                onClose={() => {
                    setIsSystemEditModalOpen(false)
                }}
            />
        </div>
    );
};

export default NavigationHub;
