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
    faRightFromBracket
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
        return <div key={renderKey} className="space-y-10">
            {visibleCategories.map((category, catIndex) => (
                <div
                    key={category.id}
                    className="animate-fade-in-up"
                    style={{animationDelay: `${catIndex * 200}ms`}}
                >
                    {/* 分类标题 */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div
                                className={"w-10 h-10 rounded-lg flex items-center justify-center"}
                                style={{backgroundColor: category.iconBgColor}}
                            >
                                {renderIcon(category, isQuickAccess(category.id) ? 4.5 : 5.5)}
                            </div>
                            <h3 className={`font-semibold text-lg`}>
                                {category.name}
                            </h3>
                        </div>
                        <button
                            onClick={() => {
                                openEditModal(category.id)
                            }}
                            className="text-indigo-600 text-sm hover:underline flex items-center gap-1.5 transition-colors duration-300 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faEdit} className="h-4.5 w-4.5"/>
                            <span>{t('editCategory')}</span>
                        </button>
                    </div>

                    {/* 响应式网格 */}
                    <div
                        className={`grid gap-4 ${isQuickAccess(category.id) ? 'grid-cols-6' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>

                        {category.sites.map((site, siteIndex) => {
                            const isQuick = isQuickAccess(category.id);
                            const delay = catIndex * 200 + (siteIndex + 1) * 100;

                            return (
                                <a key={site.id}
                                   target={'_blank'}
                                   href={isInternal ? site.internalUrl : site.externalUrl}
                                   className={`block rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border
                                                   bg-white  dark:bg-slate-800 border-gray-100 dark:border-slate-700 ${isQuick ? 'p-3' : 'p-5'}`}
                                   style={{animationDelay: `${delay}ms`}}
                                >
                                    {isQuick ?
                                        <div className="flex flex-col justify-center items-center">
                                            <div
                                                className="w-10 h-10 rounded-lg  flex items-center justify-center flex-shrink-0"
                                                style={{backgroundColor: site.iconBgColor}}
                                            >
                                                {renderIcon(site, 5)}
                                            </div>

                                            <h4 className="font-medium mt-3">{site.name}</h4>
                                        </div>
                                        : <div className="flex items-start">
                                            <div
                                                className="w-12 h-12 rounded-lg  flex items-center justify-center mr-3 flex-shrink-0"
                                                style={{backgroundColor: site.iconBgColor}}
                                            >
                                                {renderIcon(site, 6)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium mb-1">{site.name}</h4>
                                                <p className="text-sm text-gray-500 mb-2">{site.desc}</p>
                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span
                                                                        className="text-xs text-gray-400 domain-name">{isInternal ? site.internalUrl : site.externalUrl}
                                                                    </span>
                                                    <div className={`px-2.5 py-0.5 text-xs dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full 
                                                                    flex items-center justify-center
                                                                        ${isInternal ? 'bg-emerald-100 text-emerald-600' : 'text-blue-500 bg-blue-100'}`}>
                                                        <FontAwesomeIcon
                                                            icon={isInternal ? faServer : faGlobe}
                                                            className="mr-0.5"/>
                                                        <span>{isInternal ? t('internal') : t('external')}</span>
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
                <div className="max-w-7xl mx-auto py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-105">
                                <FontAwesomeIcon icon={faLayerGroup} className="text-white h-5.5 w-5.5"/>
                            </div>
                            <h1 className="text-xl font-semibold">{t('navCenter')}</h1>
                        </div>

                        <div className="flex items-center gap-5">
                            {/* 内外网切换 */}
                            <div className="flex items-center gap-2.5">
                                {/* 外网标签 + 图标 */}
                                <span
                                    className={`text-sm font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                                        !isInternal ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                    <span>{t('external')}</span>
                                  </span>

                                {/* 切换开关 */}
                                <label className="relative inline-flex h-7 w-14 cursor-pointer">
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
                                    <div className={`block h-7 w-14 rounded-full transition-colors duration-300 ${
                                        isInternal ? 'bg-emerald-500' : 'bg-blue-500'
                                    }`}/>
                                    {/* 开关滑块 */}
                                    <div
                                        className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                                            isInternal ? 'translate-x-7' : 'translate-x-0'
                                        }`}
                                    />
                                </label>

                                {/* 内网标签 + 图标 */}
                                <span
                                    className={`text-sm font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                                        isInternal ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                    <span>{t('internal')}</span>
                                  </span>
                            </div>

                            <ThemeSelector/>

                            {/* 功能按钮 */}
                            <button
                                onClick={() => {
                                    setIsSystemEditModalOpen(true);
                                    setIsEditModalOpen(false);
                                }}
                                className={`
                                        p-2 rounded-full transition-all duration-300 ease-in-out
                                        flex items-center justify-center hover:shadow-sm cursor-pointer
                                        dark:hover:bg-slate-800 dark:text-slate-300 hover:bg-slate-100
                                        text-slate-700 hover:scale-110 active:scale-95 dark:focus:ring-indigo-400
                                        focus:ring-indigo-500 hover:text-indigo-600
                                      `}
                            >
                                <FontAwesomeIcon icon={faCog} className="h-5 w-5"/>
                            </button>
                            <button
                                onClick={loadData}
                                className={`
                                        p-2 rounded-full transition-all duration-300 ease-in-out
                                        flex items-center justify-center hover:shadow-sm cursor-pointer
                                        dark:hover:bg-slate-800 dark:text-slate-300 hover:bg-slate-100
                                        text-slate-700 hover:scale-110 active:scale-95 dark:focus:ring-indigo-400
                                        focus:ring-indigo-500 hover:text-indigo-600
                                      `}
                            >
                                <FontAwesomeIcon icon={faSync} className="h-5 w-5" onClick={(event) => {
                                    // 添加旋转动画类
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
                                className={`
                                        p-2 rounded-full transition-all duration-300 ease-in-out
                                        flex items-center justify-center hover:shadow-sm cursor-pointer
                                        dark:hover:bg-slate-800 dark:text-slate-300 hover:bg-slate-100
                                        text-slate-700 hover:scale-110 active:scale-95 dark:focus:ring-indigo-400
                                        focus:ring-indigo-500 hover:text-indigo-600
                                      `}
                            >
                                <FontAwesomeIcon icon={faRightFromBracket} className="h-5 w-5"/>
                            </button>

                            {/* 语言切换 */}
                            <LanguageSelector/>
                        </div>
                    </div>
                </div>
            </header>

            {/* 主内容区 */}
            <main className="mx-full flex-1 px-6 py-10 overflow-y-auto flex flex-col items-center"
                  style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgb(96 165 250) rgb(229 231 235)',
                      scrollbarGutter: 'stable',
                  }}
            >
                {/* 内容 */}
                <div className="max-w-7xl xl:w-7xl flex-1">

                    <div id="searchContainer" className="max-w-2xl mx-auto mb-10 animate-fade-in"
                         style={{animationDelay: '50ms'}}>
                        <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-center mb-2">{t('discoverAndAccess')}</h2>
                        <p className="text-gray-500 text-center mb-6">{t('oneStopNavigation')}</p>

                        <SearchBar/>
                    </div>

                    {/* 分类标签栏 */}
                    <div className="flex flex-wrap gap-3 mb-10 animate-fade-in"
                         style={{animationDelay: '250ms'}}>
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
                        {categories.map((cat, index) => (
                            isQuickAccess(cat.id) ? <div key={cat.id}></div>
                                : <button
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
                        {/* 编辑分类按钮 */}
                        <button
                            onClick={() => {
                                openEditModal()
                            }}
                            className={`px-4 py-2.5 rounded-full text-sm bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
                             hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 h-8 flex items-center cursor-pointer`}
                            disabled={isLoading}
                        >
                            <FontAwesomeIcon icon={faEdit} className="h-4.5 w-4.5 mr-1.5"/>
                            {t('editCategory')}
                        </button>
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
                <footer className="mt-16 py-5 border-t border-slate-200 dark:border-slate-800 animate-fade-in"
                        style={{animationDelay: '400ms'}}>
                    <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500 dark:text-slate-400">
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
