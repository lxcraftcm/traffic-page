// Modal.jsx
import React, {MouseEvent, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faQuestionCircle,
    faExclamationCircle,
    faXmark,
    faCheckCircle,
    faInfoCircle,
    faTrash,
    faUndo
} from "@fortawesome/free-solid-svg-icons";

interface ModalBase {
    visible: boolean;
    onClose: (...args: any[]) => any;
    children?: any;
    className?: string;
}

interface ModalMessage extends ModalBase {
    onCancel: (...args: any[]) => any;
    onConfirm: (...args: any[]) => any;
    type: 'confirm' | 'alert' | 'success' | 'error' | 'info' | 'delete' | 'rollback';
    title: string;
    message: string;
}

// 图标映射
const IconMap = {
    confirm: <FontAwesomeIcon icon={faQuestionCircle} className="h-5 text-amber-500"/>,
    alert: <FontAwesomeIcon icon={faExclamationCircle} className="h-5 text-amber-500"/>,
    success: <FontAwesomeIcon icon={faCheckCircle} className="h-5 text-green-500"/>,
    error: <FontAwesomeIcon icon={faExclamationCircle} className="h-5 text-red-500"/>,
    info: <FontAwesomeIcon icon={faInfoCircle} className="h-5 text-blue-500"/>,
    delete: <FontAwesomeIcon icon={faTrash} className="h-5 text-red-500"/>,
    rollback: <FontAwesomeIcon icon={faUndo} className="h-5 text-amber-500"/>,
};

export const Modal = ({visible, onClose, children, className}: ModalBase) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef(null);
    const [container, setContainer]: any = useState(null);

    // 创建 Portal 容器
    useEffect(() => {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal-root';
        document.body.appendChild(modalContainer);
        setTimeout(() => {
            setContainer(modalContainer);
        }, 1)
        return () => {
            if (document.body.contains(modalContainer)) {
                document.body.removeChild(modalContainer);
            }
        };
    }, []);

    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && event.target instanceof Node && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    if (!container) return null;

    return ReactDOM.createPortal(
        <div
            ref={backdropRef}
            className={`fixed inset-0 flex items-center justify-center transition-opacity duration-300 w-[100vw] h-[100vh]
            ${visible
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            }`}
        >
            {/* 背景遮罩 */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 ${
                    visible ? 'opacity-50' : 'opacity-0'
                }`}
                onClick={handleClickOutside}
            ></div>

            {/* 弹窗内容 */}
            <div
                ref={modalRef}
                className={`relative bg-white rounded-lg shadow-xl transform transition-all duration-300 ${
                    visible
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-95 opacity-0 translate-y-4'
                } ${className? (className) :''}}`}
            >
                <button
                    onClick={onClose}
                    className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors text-slate-400 hover:bg-slate-100
                     dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer`}
                    aria-label="关闭"
                >
                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4"/>
                </button>

                {/* 动态内容区域 */}
                <>
                    {visible ? children : <></>}
                </>
            </div>
        </div>, document.body
    );
};

// 预设消息弹窗
export const MessageModal = ({visible, onClose, onCancel, onConfirm, type, title, message}: ModalMessage) => {
    return (
        <Modal visible={visible} onClose={onClose}>
            <div className="w-100 ">
                <div className="flex items-center justify-center">
                    <div
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                            {IconMap[type]}
                            {title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-5">
                            {message}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 rounded-lg text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600
                                transition-colors text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                                取消
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                                    type === 'error'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : type === 'success'
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                            >
                                确认
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>)
};

export default Modal;