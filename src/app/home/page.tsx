'use client';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faCog,
    faSync,
    faPlus,
    faEdit,
    faLayerGroup,
    faGlobe,
    faSun,
    faMoon,
    faServer,
    faCheck,
    faChevronDown,
    faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import CategoryEditModal from '@/components/CategoryEditModal';
import {Category} from "@/types/base"
import {LANGUAGE_OPTIONS} from '@/components/common/PreConstants'
import {getLocalStorage, setLocalStorage} from '@/utils/StorageUtil';
import {renderIcon} from "@/utils/IconUtil";

const NavigationHub = () => {
    // 核心状态
    const [isInternal, setIsInternal] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [renderKey, setRenderKey] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState<boolean>(false);
    const [languageSelectorValue, setLanguageSelectorValue] = useState<string>();
    // ref引用
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 加载数据hooks封装
    function useLoading(duration = 1500) {
        const [isLoading, setIsLoading] = useState(false);
        const load = useCallback(() => {
            setIsLoading(true);
            const timer = setTimeout(() => setIsLoading(false), duration);
            return () => clearTimeout(timer);
        }, [duration]);
        return {isLoading, load};
    }

    const {isLoading, load} = useLoading();

    // 初始化状态(优先从本地存储读取,默认跟随系统)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = getLocalStorage('darkMode');
        if (saved !== null) return saved === 'true';
        // 跟随系统偏好
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            return false;
        }
    });
    const [categories, setCategories] = useState<Category[]>([
        {
            id: 'quick-access',
            name: '快速访问',
            iconMode: 'preset',
            iconColor: '#06b6d4',
            iconBgColor: '#e0f2fe',
            sites: [
                {
                    id: 'console',
                    name: '控制台',
                    desc: '',
                    internalUrl: 'http://jira.corp.internal',
                    externalUrl: 'http://jira.corp.externa',
                    iconMode: 'preset',
                    iconColor: '#06b6d4',
                    iconBgColor: '#e0f2fe',
                },
                {
                    id: 'add',
                    name: '添加',
                    desc: '',
                    internalUrl: 'http://jira.corp.internal',
                    externalUrl: 'http://jira.corp.externa',
                    iconMode: 'preset',
                    iconColor: '#06b6d4',
                    iconBgColor: '#e0f2fe',
                }
            ]
        },
        {
            id: 'work-tools',
            name: '工作工具',
            iconMode: 'preset',
            iconColor: '#06b6d4',
            iconBgColor: '#e0f2fe',
            sites: [
                {
                    id: 'mail',
                    name: '邮件系统',
                    desc: '企业邮箱与通讯',
                    internalUrl: 'http://jira.corp.internal',
                    externalUrl: 'http://jira.corp.externa',
                    iconMode: 'preset',
                    iconColor: '#06b6d4',
                    iconBgColor: '#e0f2fe',
                },
                {
                    id: 'calendar',
                    name: '日程安排',
                    desc: '会议与任务提醒',
                    internalUrl: 'http://jira.corp.internal',
                    externalUrl: 'http://jira.corp.externa',
                    iconMode: 'preset',
                    iconColor: '#06b6d4',
                    iconBgColor: '#e0f2fe',
                },
                {
                    id: 'calendar1',
                    name: '测试网页',
                    desc: '测试网页',
                    internalUrl: 'http://jira.corp.internal',
                    externalUrl: 'http://jira.corp.externa',
                    iconMode: 'preset',
                    iconColor: '#06b6d4',
                    iconBgColor: '#e0f2fe',
                }
            ]
        },
        {
            id: 'project-management',
            name: '项目管理',
            iconMode: 'preset',
            iconColor: '#06b6d4',
            iconBgColor: '#e0f2fe',
            sites: [
                {
                    id: 'jira',
                    name: '任务跟踪',
                    desc: '项目任务与缺陷管理',
                    internalUrl: 'http://jira.corp.internal',
                    externalUrl: 'http://jira.corp.internal',
                    iconMode: 'preset',
                    iconColor: '#06b6d4',
                    iconBgColor: '#e0f2fe',
                }
            ]
        },
        {
            id: 'project-management1',
            name: '测试管理',
            iconMode: 'preset',
            iconColor: '#06b6d4',
            iconBgColor: '#e0f2fe',
            sites: [
                {
                    id: 'jira1',
                    name: '1111111',
                    desc: '项目任务与缺陷管理',
                    internalUrl: 'http://jira.corp.internal',
                    externalUrl: 'http://jira.corp.internal',
                    iconMode: 'preset',
                    iconColor: '#06b6d4',
                    iconBgColor: '#e0f2fe',
                }
            ]
        }
    ]);

    // 初始化加载
    useEffect(() => {
        document.body.style.scrollbarWidth = 'thin';
        document.body.style.scrollbarColor = 'rgb(96 165 250) rgb(229 231 235)';
        document.body.style.scrollbarGutter = 'stable';
        load();
    }, [load]);

    // 应用黑暗模式到文档
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // 保存到本地存储
        setLocalStorage('darkMode', isDarkMode.toString());
    }, [isDarkMode]);

    // 点击外部关闭语言切换
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsLanguageSelectorOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 切换模式
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };


    // 打开编辑弹窗
    const openEditModal = () => {
        setIsEditModalOpen(true);
    };

    // 分类切换
    const handleCategoryChange = (category: string) => {
        if (category === activeCategory) return;
        setActiveCategory(category);
        setRenderKey(prev => prev + 1);
    };

    // 语言切换
    const handleLanguageSelect = (code: string) => {
        setLanguageSelectorValue(code);
        setIsLanguageSelectorOpen(false)
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
                            onClick={openEditModal}
                            className="text-indigo-600 text-sm hover:underline flex items-center gap-1.5 transition-colors duration-300"
                        >
                            <FontAwesomeIcon icon={faEdit} className="h-4.5 w-4.5"/>
                            <span>编辑分类</span>
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
                                   href="http://mail.corp.internal"
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
                                                        <span>{isInternal ? '内网' : '外网'}</span>
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
    // 获取当前选中的语言信息
    const currentLanguage = LANGUAGE_OPTIONS.find(option => option.code === languageSelectorValue) || LANGUAGE_OPTIONS[0];

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {/* 背景装饰 */}
            <div className="fixed inset-0 -z-10 opacity-10">
                <div
                    className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-300 dark:bg-indigo-800 rounded-full blur-3xl"></div>
            </div>

            {/* 顶部导航栏 */}
            <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800
                 sticky top-0 z-20 transition-all duration-300">
                <div className="max-w-7xl mx-auto py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-105">
                                <FontAwesomeIcon icon={faLayerGroup} className="text-white h-5.5 w-5.5"/>
                            </div>
                            <h1 className="text-xl font-semibold">导航中心</h1>
                        </div>

                        <div className="flex items-center gap-5">
                            {/* 内外网切换 */}
                            <div className="flex items-center gap-2.5">
                                {/* 外网标签 + 图标 */}
                                <span
                                    className={`text-sm font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                                        !isInternal ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                    <span>外网</span>
                                  </span>

                                {/* 切换开关 */}
                                <label className="relative inline-flex h-7 w-14 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isInternal}
                                        onChange={() => setIsInternal(!isInternal)}
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
                                    <span>内网</span>
                                  </span>
                            </div>


                            <button
                                onClick={toggleDarkMode}
                                className={`
                                        p-2 rounded-full transition-all duration-300 ease-in-out
                                        flex items-center justify-center shadow-sm cursor-pointer
                                        ${isDarkMode
                                    ? 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                                }
                                        hover:scale-110 active:scale-95
                                        focus:outline-none focus:ring-2 focus:ring-offset-2
                                        ${isDarkMode
                                    ? 'focus:ring-indigo-500 dark:focus:ring-indigo-400'
                                    : 'focus:ring-indigo-500'
                                }
                                        aria-label={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
                                      `}
                            >
                                <FontAwesomeIcon
                                    icon={isDarkMode ? faSun : faMoon}
                                    className={`h-5 w-5 transition-transform duration-500 ${
                                        isDarkMode ? 'rotate-0 scale-100' : 'rotate-180 scale-90'
                                    }`}
                                />
                            </button>

                            {/* 功能按钮 */}
                            <button
                                onClick={() => {}}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300
                                 transition-all duration-300 hover:text-indigo-600 cursor-pointer">
                                <FontAwesomeIcon icon={faCog} className="h-5 w-5"/>
                            </button>
                            <button
                                onClick={load}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300
                                transition-all duration-300 hover:text-indigo-600 cursor-pointer">
                                <FontAwesomeIcon icon={faSync} className="h-5 w-5"/>
                            </button>
                            <button
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300
                                transition-all duration-300 hover:text-indigo-600 cursor-pointer">
                                <FontAwesomeIcon icon={faRightFromBracket} className="h-5 w-5"/>
                            </button>

                            {/* 语言切换 */}
                            <div ref={dropdownRef} className="relative inline-block">
                                {/* 触发按钮 */}
                                <button onClick={() => setIsLanguageSelectorOpen(!isLanguageSelectorOpen)}
                                        className="flex items-center gap-1.5 px-3 py-1.75 rounded-md cursor-pointer bg-slate-100 dark:bg-slate-800 border border-slate-200
                                               dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-200
                                               dark:hover:bg-slate-700 transition-all duration-200  focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        aria-expanded={isLanguageSelectorOpen}
                                >
                                    <FontAwesomeIcon icon={faGlobe} className="h-4 w-4 text-indigo-500"/>
                                    <span>{currentLanguage.nativeName}</span>
                                    <FontAwesomeIcon
                                        icon={faChevronDown}
                                        className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${isLanguageSelectorOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* 下拉菜单 */}
                                <div className={`
                                      absolute z-50 mt-1 w-44 rounded-md bg-white dark:bg-slate-800  border border-slate-200 dark:border-slate-700  
                                      shadow-md  overflow-hidden transition-opacity duration-200
                                      ${isLanguageSelectorOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                                    `}
                                >
                                    {LANGUAGE_OPTIONS.map(option => (
                                        <button
                                            key={option.code}
                                            onClick={() => handleLanguageSelect(option.code)}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-1.75 text-sm
                                                transition-colors duration-150 cursor-pointer
                                                ${languageSelectorValue === option.code
                                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-900/10'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                            }   
                                        `}
                                        >
                                            <span>{option.nativeName}</span>
                                            {languageSelectorValue === option.code && (
                                                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5"/>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                        <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-center mb-2">发现并访问你的常用网站</h2>
                        <p className="text-gray-500 text-center mb-6">一站式导航到所有重要页面,提高你的工作效率</p>

                        <div className="relative group animate-fade-in" style={{animationDelay: '150ms'}}>
                            <input type="text" id="searchInput"
                                   className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all shadow-sm group-hover:shadow-md
                                   border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                                             bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                                   placeholder="搜索网站或服务..."/>
                            <FontAwesomeIcon icon={faSearch}
                                             className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5.5 w-5.5 transition-colors duration-300 group-hover:text-indigo-500"/>
                        </div>
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
                            全部
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
                            onClick={openEditModal}
                            className="px-4 py-2.5 rounded-full text-sm bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
                             hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 h-8 flex items-center cursor-pointer "
                            disabled={isLoading}
                        >
                            <FontAwesomeIcon icon={faEdit} className="h-4.5 w-4.5 mr-1.5"/>
                            编辑分类
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
                        © {new Date().getFullYear()} 企业导航中心 | 版本 3.6.0
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
                    console.log("saveData", data)
                    setCategories(data)
                    setIsEditModalOpen(false)
                    load()
                }}
            />
        </div>
    );
};

export default NavigationHub;
