'use client';
import React, {useState, useRef, useEffect} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faLock,
    faUser,
    faEye,
    faEyeSlash,
    faSun,
    faMoon,
    faArrowRight,
    faUserCircle,
    faCheck,
    faShieldHalved,
    faGlobe,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import {getLocalStorage, setLocalStorage} from '@/utils/StorageUtil';
import Link from 'next/link';
import {LANGUAGE_OPTIONS} from "@/components/common/PreConstants";

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<{ username?: string; password?: string }>({});
    const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');
    // 初始化状态
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

    // 引用
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef<HTMLDivElement>(null);

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

    // 切换深色模式
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    // 切换语言
    const handleLanguageChange = (code: string) => {
        setSelectedLanguage(code);
        setIsLanguageSelectorOpen(false);
    };

    // 获取当前语言名称
    const getCurrentLanguageName = () => {
        const language = LANGUAGE_OPTIONS.find(option => option.code === selectedLanguage);
        return language ? language.nativeName : '中文';
    };

    // 表单验证
    const validateForm = (): boolean => {
        const errors: { username?: string; password?: string } = {};

        if (!username.trim()) {
            errors.username = '请输入用户名';
        }

        if (!password.trim()) {
            errors.password = '请输入密码';
        } else if (password.length < 6) {
            errors.password = '密码长度不能少于6位';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 登录处理
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setFormErrors({});

        try {
            // 模拟登录请求
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 登录成功后的处理
            if (rememberMe) {
                setLocalStorage('rememberedUsername', username);
            } else {
                setLocalStorage('rememberedUsername', '');
            }

            // 跳转到首页
            window.location.href = '/home';
        } catch (error) {
            setFormErrors({
                password: selectedLanguage === 'zh-CN' ? '用户名或密码错误，请重试' : 'Invalid username or password'
            });
            console.error('登录失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 输入框样式处理
    const getInputClass = (field: 'username' | 'password') => {
        const baseClass = 'w-full px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500/30';
        const errorClass = formErrors[field] ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30' : 'border-slate-200 dark:border-slate-700';
        const bgClass = 'dark:bg-slate-900 dark:text-slate-200 bg-white text-slate-800';

        return `${baseClass} ${errorClass} ${bgClass}`;
    };

    return (
        <div
            ref={pageRef}
            className={`min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900 dark:to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden`}
            style={{transition: 'opacity 0.3s ease-in-out'}}
        >
            <div
                className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/30 rounded-full filter blur-3xl opacity-70"></div>
            <div
                className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-70"></div>

            {/* 主内容区 - 居中布局 */}
            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* 登录卡片 */}
                    <div
                        className={`rounded-2xl shadow-lg overflow-hidden animate-fade-in-up dark:bg-slate-800 dark:border-slate-700 bg-white border border-slate-100
              hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5`}
                        style={{animationDelay: '100ms'}}
                    >
                        {/* 卡片顶部 */}
                        <div
                            className={`px-6 py-4 flex items-center justify-between dark:bg-slate-700/30 bg-slate-50`}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-105">
                                    <FontAwesomeIcon icon={faShieldHalved} className="text-white h-5 w-5"/>
                                </div>
                                <h1 className="text-lg font-semibold dark:text-amber-50">企业导航中心</h1>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* 深色模式切换 */}
                                <button
                                    onClick={toggleDarkMode}
                                    className={`
                    p-2 rounded-full transition-all duration-300 ease-in-out
                    flex items-center justify-center shadow-sm cursor-pointer
                    dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700 bg-white text-slate-700 hover:bg-slate-100
                    hover:scale-110 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/30
                  `}
                                    aria-label={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
                                >
                                    <FontAwesomeIcon
                                        icon={isDarkMode ? faSun : faMoon}
                                        className={`h-4.5 w-4.5 transition-transform duration-500 dark:rotate-0 dark:scale-100 rotate-180 scale-90`}
                                    />
                                </button>

                                {/* 语言切换 */}
                                <div ref={dropdownRef} className="relative inline-block">
                                    <button
                                        onClick={() => setIsLanguageSelectorOpen(!isLanguageSelectorOpen)}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium
                                    bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600
                                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:text-amber-50`}
                                    >
                                        <FontAwesomeIcon icon={faGlobe} className="h-4 w-4 text-indigo-500"/>
                                        <span>{getCurrentLanguageName()}</span>
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${isLanguageSelectorOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* 语言下拉菜单 */}
                                    <div className={`
                                      absolute z-50 mt-1 w-44 rounded-md bg-white dark:bg-slate-800  border border-slate-200 dark:border-slate-700  
                                      shadow-md  overflow-hidden transition-opacity duration-200
                                      ${isLanguageSelectorOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                                    `}
                                    >
                                        {LANGUAGE_OPTIONS.map((option, index) => (
                                            <button
                                                key={option.code}
                                                onClick={() => handleLanguageChange(option.code)}
                                                className={`
                                        w-full flex items-center justify-between px-4 py-2 text-sm transition-colors duration-150
                                        ${selectedLanguage === option.code
                                                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-900/10'
                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                                }
                                      `}
                                                style={{animationDelay: `${index * 50}ms`}}
                                            >
                                                <span>{option.nativeName}</span>
                                                {selectedLanguage === option.code && (
                                                    <FontAwesomeIcon icon={faCheck}
                                                                     className="h-4 w-4 text-indigo-500"/>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 登录表单区域 */}
                        <div className="p-8">
                            <div className="text-center mb-8 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                                <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold mb-2 dark:text-amber-50">欢迎回来</h2>
                                <p className={`text-sm  dark:text-slate-400 text-slate-500`}>
                                    请输入账号信息登录系统
                                </p>
                            </div>

                            {/* 登录表单 */}
                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* 用户名输入框 */}
                                <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '300ms'}}>
                                    <label htmlFor="username" className="block text-sm font-medium dark:text-amber-50">
                                        用户名
                                    </label>
                                    <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <FontAwesomeIcon icon={faUser} className="h-5 w-5"/>
                    </span>
                                        <input
                                            id="username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className={`${getInputClass('username')} pl-12`}
                                            placeholder={'请输入用户名/邮箱'}
                                            disabled={isLoading}
                                        />
                                        {username.trim() && !formErrors.username && (
                                            <span
                                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-emerald-500">
                        <FontAwesomeIcon icon={faCheck} className="h-4.5 w-4.5"/>
                      </span>
                                        )}
                                    </div>
                                    {formErrors.username && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faUserCircle} className="h-3.5 w-3.5"/>
                                            {formErrors.username}
                                        </p>
                                    )}
                                </div>

                                {/* 密码输入框 */}
                                <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '400ms'}}>
                                    <div className="flex items-center justify-between dark:text-amber-50">
                                        <label htmlFor="password" className="block text-sm font-medium">
                                            密码
                                        </label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline transition-colors duration-300"
                                        >
                                            忘记密码
                                        </Link>
                                    </div>
                                    <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <FontAwesomeIcon icon={faLock} className="h-5 w-5"/>
                    </span>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`${getInputClass('password')} pl-12`}
                                            placeholder={'请输入密码'}
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-500 transition-colors duration-300"
                                            disabled={isLoading}
                                            aria-label={showPassword ? (selectedLanguage === 'zh-CN' ? '隐藏密码' : 'Hide password') : (selectedLanguage === 'zh-CN' ? '显示密码' : 'Show password')}
                                        >
                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye}
                                                             className="h-5 w-5"/>
                                        </button>
                                    </div>
                                    {formErrors.password && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faUserCircle} className="h-3.5 w-3.5"/>
                                            {formErrors.password}
                                        </p>
                                    )}
                                </div>

                                {/* 记住我 */}
                                <div className="flex items-center animate-fade-in-up" style={{animationDelay: '500ms'}}>
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700"
                                        disabled={isLoading}
                                    />
                                    <label htmlFor="remember-me"
                                           className={`ml-2 block text-sm  dark:text-slate-300 text-slate-600`}>
                                        记住我
                                    </label>
                                </div>

                                {/* 登录按钮 */}
                                <button
                                    type="submit"
                                    className={`w-full py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                    ${isLoading
                                        ? 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-md hover:shadow-lg'
                                    }
                    text-white transform hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up`}
                                    style={{animationDelay: '600ms'}}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>登录中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>立即登录</span>
                                            <FontAwesomeIcon icon={faArrowRight} className="h-4.5 w-4.5"/>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* 版权信息 */}
                        <div className="mb-8 text-center text-sm text-slate-500 dark:text-slate-400 animate-fade-in"
                             style={{animationDelay: '800ms'}}>
                            © {new Date().getFullYear()} 企业导航中心 | 版本 3.6.0
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default LoginPage;
