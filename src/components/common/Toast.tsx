'use client';
import React, {createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faXmark,
    faInfoCircle,
    faExclamationTriangle,
    faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

// Toast 配置类型
interface ToastOptions {
    message: ReactNode;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number; // 自动关闭时间（毫秒），0 表示不自动关闭
    showCloseBtn?: boolean; // 是否显示关闭按钮
    className?: string; // 自定义类名
    onClose?: () => void; // 关闭回调
}

// Toast 实例类型
interface ToastInstance extends ToastOptions {
    id: string;
    timestamp: number; // 用于排序和稳定渲染
}

// 上下文类型
interface ToastContextType {
    showToast: (options: ToastOptions) => void;
    removeToast: (id: string) => void;
}

// 创建上下文
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 单个 Toast 组件
const ToastItem = (({
                        toast,
                        onRemove,
                    }: {
    toast: ToastInstance;
    onRemove: (id: string) => void;
}) => {
    const [isClosing, setIsClosing] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 手动关闭
    const handleClose = useCallback(() => {
        if (isClosing) return;

        // 清除自动关闭定时器
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        setIsClosing(true);
        // 退场动画结束后移除组件
        const exitTimer = setTimeout(() => {
            onRemove(toast.id);
            toast.onClose?.();
        }, 300); // 与退场动画时长完全匹配

        return () => clearTimeout(exitTimer);
    }, [toast, onRemove, isClosing]);

    // 入场动画完成后添加稳定类
    useEffect(() => {
        // 确保入场动画完成后组件处于稳定状态
        const timeout = setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.classList.add('toast-stable');
            }
        }, 400); // 与入场动画时长一致

        return () => clearTimeout(timeout);
    }, []);

    // 自动关闭逻辑
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            timerRef.current = setTimeout(() => {
                handleClose();
            }, toast.duration);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [toast, handleClose]);

    // 根据类型获取样式
    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return {
                    bg: 'bg-emerald-50 dark:bg-emerald-900/90',
                    border: 'border-emerald-100 dark:border-emerald-800/30',
                    text: 'text-emerald-700 dark:text-emerald-400',
                    icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-emerald-500 dark:text-emerald-300"/>,
                    iconBg: 'bg-emerald-100 dark:bg-emerald-800/30',
                };
            case 'error':
                return {
                    bg: 'bg-red-50 dark:bg-red-900/90',
                    border: 'border-red-100 dark:border-red-800/30',
                    text: 'text-red-700 dark:text-red-400',
                    icon: <FontAwesomeIcon icon={faExclamationCircle}
                                           className="h-4 w-4 text-red-500 dark:text-red-300"/>,
                    iconBg: 'bg-red-100 dark:bg-red-800/30',
                };
            case 'warning':
                return {
                    bg: 'bg-amber-50 dark:bg-amber-900/90',
                    border: 'border-amber-100 dark:border-amber-800/30',
                    text: 'text-amber-700 dark:text-amber-400',
                    icon: <FontAwesomeIcon icon={faExclamationTriangle}
                                           className="h-4 w-4 text-amber-500 dark:text-amber-300"/>,
                    iconBg: 'bg-amber-100 dark:bg-amber-800/30',
                };
            case 'info':
            default:
                return {
                    bg: 'bg-indigo-50 dark:bg-indigo-900/90',
                    border: 'border-indigo-100 dark:border-indigo-800/30',
                    text: 'text-indigo-700 dark:text-indigo-400',
                    icon: <FontAwesomeIcon icon={faInfoCircle}
                                           className="h-4 w-4 text-indigo-500 dark:text-indigo-300"/>,
                    iconBg: 'bg-indigo-100 dark:bg-indigo-800/30',
                };
        }
    };

    const styles = getToastStyles();

    return (
        <div
            ref={containerRef}
            className={`
        ${styles.bg} ${styles.border} border rounded-lg shadow-sm flex items-center overflow-hidden
        ${toast.className || ''} hover:shadow-md transition-shadow duration-200
        relative z-10 w-full
        ${isClosing ? 'animate-toast-out' : 'animate-toast-in'}
        toast-stable:opacity-100 toast-stable:translate-y-0 toast-stable:scale-100
      `}
            style={{
                minHeight: '44px',
                animationFillMode: 'forwards', // 确保动画结束后保持最终状态
            }}
            onClick={toast.showCloseBtn ? handleClose : undefined}
        >
            {/* 图标区域 */}
            <div className={`${styles.iconBg} p-2 rounded-md`}>
                {styles.icon}
            </div>

            {/* 消息内容 */}
            <div className={`flex-1 px-3 py-2 ${styles.text} text-xs sm:text-sm`}>
                {toast.message}
            </div>

            {/* 关闭按钮 */}
            {toast.showCloseBtn && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    className={`
            p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200
            transition-colors duration-200 focus:outline-none cursor-pointer
          `}
                    aria-label="关闭提示"
                >
                    <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5"/>
                </button>
            )}
        </div>
    );
});

// Toast 提供者组件
export const ToastProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [toasts, setToasts] = useState<ToastInstance[]>([]);

    // 生成唯一 ID
    const generateId = useCallback(() => {
        return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    }, []);

    // 显示 Toast
    const showToast = useCallback((options: ToastOptions) => {
        const id = generateId();
        const newToast: ToastInstance = {
            id,
            timestamp: Date.now(),
            type: 'info',
            duration: 3000,
            showCloseBtn: false,
            ...options,
        };

        setToasts(prev => [...prev, newToast]);
    }, [generateId]);

    // 移除 Toast
    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{showToast, removeToast}}>
            {children}
            {/* Toast 容器 */}
            <div
                className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// 自定义 Hook
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
