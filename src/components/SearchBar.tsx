'use client';
import React, {useState, useRef, useLayoutEffect} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronDown, faSearch} from '@fortawesome/free-solid-svg-icons';
import {Baidu, Google, Bing} from "@lobehub/icons";
import ReactDOM from 'react-dom';
import {useAppTranslation} from "@/providers/I18nProvider";

// 搜索引擎选项
const SEARCH_ENGINES = [
    {id: 'google', name: 'Google', icon: <Google.Color/>, url: 'https://www.google.com/search?q='},
    {id: 'bing', name: 'Bing', icon: <Bing.Color/>, url: 'https://www.bing.com/search?q='},
    {id: 'baidu', name: 'Baidu', icon: <Baidu.Color/>, url: 'https://www.baidu.com/s?wd='},
];

const SearchBar = () => {
    const {t} = useAppTranslation('SearchBar');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEngine, setSelectedEngine] = useState(SEARCH_ENGINES[0]);
    const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [isMenuReady, setIsMenuReady] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // 处理搜索提交
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.open(`${selectedEngine.url}${encodeURIComponent(searchQuery.trim())}`, '_blank');
            setSearchQuery('');
        }
    };

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e);
        }
    };

    // 计算下拉菜单位置
    const calculateMenuPosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
            });
            setIsMenuReady(true);
        }
    };

    // 监听菜单显示状态，计算位置
    useLayoutEffect(() => {
        if (isEngineMenuOpen) {
            calculateMenuPosition();
            const handleResize = () => calculateMenuPosition();
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [isEngineMenuOpen]);

    // 点击外部关闭菜单
    useLayoutEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isEngineMenuOpen && menuRef.current && buttonRef.current) {
                if (!menuRef.current.contains(e.target as Node) && !buttonRef.current.contains(e.target as Node)) {
                    setIsEngineMenuOpen(false);
                }
            }
        };

        if (isEngineMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isEngineMenuOpen]);

    // 处理引擎选择
    const handleEngineSelect = (engine: typeof SEARCH_ENGINES[0]) => {
        setSelectedEngine(engine);
        setIsEngineMenuOpen(false);
    };

    return (
        <div className="relative group animate-fade-in" style={{animationDelay: '150ms'}}>
            <form onSubmit={handleSearch} className="relative">
                {/* 搜索引擎选择按钮 */}
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setIsEngineMenuOpen(!isEngineMenuOpen)}
                    className={`absolute left-0 top-0 bottom-0 rounded-l-xl border-t border-b border-l flex items-center gap-1.5 px-4 transition-all cursor-pointer
                    duration-300 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none 
                    focus:bg-slate-50 focus:dark:bg-slate-800`}
                    aria-expanded={isEngineMenuOpen}
                >
                    {selectedEngine.icon}
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isEngineMenuOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* 搜索输入框 */}
                <input
                    type="text"
                    id="searchInput"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-24 pr-12 py-3 rounded-xl border outline-none transition-all shadow-sm group-hover:shadow-md border-slate-200
                    dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200`}
                    placeholder={t('searchPlaceholder')}
                    onKeyDown={handleKeyDown}
                />

                {/* 搜索按钮 */}
                <button
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-4 transition-colors duration-300 text-slate-400 hover:text-indigo-500 focus:outline-none cursor-pointer"
                >
                    <FontAwesomeIcon icon={faSearch} className="h-5.5 w-5.5"/>
                </button>
            </form>

            {/* 使用 React Portal */}
            {isEngineMenuOpen && isMenuReady && menuPosition && ReactDOM.createPortal(
                <div
                    ref={menuRef}
                    className="fixed z-[9999] transition-all duration-200 ease-out"
                    style={{
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                        opacity: 1,
                        transform: 'translateY(0) scale(1)',
                    }}
                >
                    <div
                        className="w-48 rounded-xl shadow-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {SEARCH_ENGINES.map((engine) => (
                            <button
                                key={engine.id}
                                type="button"
                                onClick={() => handleEngineSelect(engine)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 
                                text-slate-700 dark:text-slate-300 cursor-pointer 
                                ${selectedEngine.id === engine.id
                                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100/80 dark:bg-indigo-900/10'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                }`}
                            >
                                {engine.icon}
                                <span className="text-sm font-medium">{engine.name}</span>
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default SearchBar;
