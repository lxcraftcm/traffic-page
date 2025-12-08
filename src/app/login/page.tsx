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
} from '@fortawesome/free-solid-svg-icons';
import {getLocalStorage, setLocalStorage} from '@/utils/StorageUtil';
import Link from 'next/link';
import {apis} from "@/utils/RequestUtil";
import forge from 'node-forge';
import {setToken} from "@/lib/auth";
import {useToast} from "@/components/common/Toast";
import {useTranslations} from 'next-intl';
import LanguageSelector from "@/components/LanguageSelector";

const LoginPage = () => {
    // 原有状态
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<{
        username?: string;
        password?: string;
        confirmPassword?: string
    }>({});
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = getLocalStorage('darkMode');
        if (saved !== null) return saved === 'true';
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // 新增状态：系统初始化判断与注册相关
    const [isRegisterMode, setIsRegisterMode] = useState<boolean | null>(null);
    const [confirmPassword, setConfirmPassword] = useState(''); // 注册确认密码
    const [registerLoading, setRegisterLoading] = useState(false); // 注册加载状态

    // 引用
    const pageRef = useRef<HTMLDivElement>(null);

    const t = useTranslations('LoginPage');

    // 初始化 Toast
    const {showToast} = useToast();

    // 检测系统初始化状态
    useEffect(() => {
        checkSystemInit()
    }, []);

    // 应用黑暗模式
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        setLocalStorage('darkMode', isDarkMode.toString());
    }, [isDarkMode]);

    const checkSystemInit = async () => {
        try {
            // 调用接口检测系统是否初始化
            const res = await apis.checkSystemInit();
            setIsRegisterMode(!res.initialized);
        } catch (error: any) {
            showToast({
                message: error?.message || 'Check System failed',
                type: 'error',
                duration: 3000,
            });
            // 出错时默认视为已初始化
            setIsRegisterMode(false);
        }
    };

    // 切换深色模式
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    // 表单验证
    const validateForm = (): boolean => {
        const errors: { username?: string; password?: string; confirmPassword?: string } = {};

        // 用户名验证
        if (!username.trim()) {
            errors.username = '请输入用户名';
        } else if (username.length < 3 || username.length > 20) {
            errors.username = '用户名长度需在3-20位之间';
        }

        // 密码验证
        if (!password.trim()) {
            errors.password = '请输入密码';
        } else if (password.length < 6 || password.length > 20) {
            errors.password = '密码长度需在6-20位之间';
        } else if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(password)) {
            errors.password = '密码需包含字母和数字';
        }

        // 注册模式额外验证确认密码
        if (isRegisterMode) {
            if (!confirmPassword.trim()) {
                errors.confirmPassword = '请确认密码';
            } else if (confirmPassword !== password) {
                errors.confirmPassword = '两次输入的密码不一致';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const encryptPassword = (password: string, key: string) => {
        const publicKey = forge.pki.publicKeyFromPem(key);
        const encrypted = publicKey.encrypt(password, 'RSA-OAEP');
        return forge.util.encode64(encrypted);
    };

    // 登录处理
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setFormErrors({});
        try {
            const rsaInfo = await apis.generateKey();
            const {keyId, publicKey} = rsaInfo;
            const res = await apis.login({keyId, username, password: encryptPassword(password, publicKey)});
            setToken(res.token);
            // 记住用户名
            if (rememberMe) {
                setLocalStorage('rememberedUsername', username);
            } else {
                setLocalStorage('rememberedUsername', '');
            }
            window.location.href = '/home';
        } catch (error: any) {
            showToast({
                message: error?.message || 'Login failed, please try again',
                type: 'error',
                duration: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 新增：注册处理
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setRegisterLoading(true);
        setFormErrors({});
        try {
            const rsaInfo = await apis.generateKey();
            const {keyId, publicKey} = rsaInfo;
            // 调用注册接口
            await apis.register({
                keyId,
                username,
                password: encryptPassword(password, publicKey),
            });
            // 注册成功后自动切换到登录模式
            setIsRegisterMode(false);
            setUsername(username);
            setPassword('');
            setConfirmPassword('');
            // 显示注册成功提示
            // alert(selectedLanguage === 'zh-CN' ? '注册成功,请登录！' : 'Registration successful, please log in!');
        } catch (error: any) {
            showToast({
                message: error?.message || 'Registration failed, please try again',
                type: 'error',
                duration: 3000,
            });
        } finally {
            setRegisterLoading(false);
        }
    };


    // 输入框样式处理
    const getInputClass = (field: 'username' | 'password' | 'confirmPassword') => {
        const baseClass = 'w-full px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500/30';
        const errorClass = formErrors[field] ? 'border-red-500 dark:border-red-500 focus:ring-red-500/30' : 'border-slate-200 dark:border-slate-700';
        const bgClass = 'dark:bg-slate-900 dark:text-slate-200 bg-white text-slate-800';

        return `${baseClass} ${errorClass} ${bgClass}`;
    };

    // 加载中占位
    if (isRegisterMode === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="w-16 h-16 relative">
                    <div
                        className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-500 dark:border-t-indigo-400 animate-spin"></div>
                </div>
            </div>
        );
    }

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
                    {/* 登录/注册卡片 */}
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
                                <h1 className="text-lg font-semibold dark:text-amber-50">
                                    {isRegisterMode ? '初始化系统' : '导航中心'}
                                </h1>
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
                                <LanguageSelector className="bg-white py-1.5"/>
                            </div>
                        </div>

                        {/* 登录/注册表单区域 */}
                        <div className="p-8">
                            {/* 表单标题与切换 */}
                            <div className="text-center mb-6 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                                <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold mb-2 dark:text-amber-50">
                                    {isRegisterMode ? '创建新账号' : '欢迎回来'}
                                </h2>
                                <p className={`text-sm dark:text-slate-400 text-slate-500 mb-4`}>
                                    {isRegisterMode
                                        ? '填写以下信息完成初始化'
                                        : '请输入账号信息登录系统'}
                                </p>
                            </div>

                            {/* 表单内容 */}
                            <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-5">
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
                                            placeholder={isRegisterMode ? '请设置用户名(3-20位)' : '请输入用户名/邮箱'}
                                            disabled={isLoading || registerLoading}
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
                                            {isRegisterMode ? '设置密码' : '密码'}
                                        </label>
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
                                            placeholder={isRegisterMode ? '请设置密码(6-20位,含字母和数字)' : '请输入密码'}
                                            disabled={isLoading || registerLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-500 transition-colors duration-300"
                                            disabled={isLoading || registerLoading}
                                            aria-label={showPassword ? '隐藏密码' : '显示密码'}
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

                                {/* 注册模式 - 确认密码 */}
                                {isRegisterMode && (
                                    <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '450ms'}}>
                                        <label htmlFor="confirmPassword"
                                               className="block text-sm font-medium dark:text-amber-50">
                                            确认密码
                                        </label>
                                        <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <FontAwesomeIcon icon={faLock} className="h-5 w-5"/>
                    </span>
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`${getInputClass('confirmPassword')} pl-12`}
                                                placeholder="请再次输入密码"
                                                disabled={registerLoading}
                                            />
                                            {confirmPassword.trim() && !formErrors.confirmPassword && confirmPassword === password && (
                                                <span
                                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-emerald-500">
                        <FontAwesomeIcon icon={faCheck} className="h-4.5 w-4.5"/>
                      </span>
                                            )}
                                        </div>
                                        {formErrors.confirmPassword && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <FontAwesomeIcon icon={faUserCircle} className="h-3.5 w-3.5"/>
                                                {formErrors.confirmPassword}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* 记住我 */}
                                {!isRegisterMode && (
                                    <div className="flex items-center animate-fade-in-up"
                                         style={{animationDelay: '500ms'}}>
                                        <input
                                            id="remember-me"
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700"
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="remember-me"
                                               className={`ml-2 block text-sm dark:text-slate-300 text-slate-600`}>
                                            记住我
                                        </label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline transition-colors duration-300 ml-auto"
                                        >
                                            忘记密码
                                        </Link>
                                    </div>
                                )}

                                {/* 登录/注册按钮 */}
                                <button
                                    type="submit"
                                    className={`w-full py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                    ${(isLoading || registerLoading)
                                        ? 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-md hover:shadow-lg'
                                    }
                    text-white transform hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up`}
                                    style={{animationDelay: '600ms'}}
                                    disabled={isLoading || registerLoading}
                                >
                                    {(isLoading || registerLoading) ? (
                                        <>
                                            <div
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>{isRegisterMode ? '注册中...' : '登录中...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{isRegisterMode ? '确认注册' : '立即登录'}</span>
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
