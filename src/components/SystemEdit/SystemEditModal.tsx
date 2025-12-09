'use client';
import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Modal} from "@/components/common/Modal";
import {useTranslations} from 'next-intl';
import {
    faCog,
    faHeart,
    faShieldAlt,
    faUser,
    faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import GeneralSetting from "@/components/SystemEdit/GeneralSetting";

// 系统设置项类型
type SettingItem = {
    id: string;
    icon: any;
    label: string;
    color: string;
    render: () => React.ReactElement
};

interface SystemEditModalProps {
    visible: boolean;
    onClose: () => void;
}


const SystemEdit: React.FC = () => {
    // 翻译钩子
    const t = useTranslations('SystemEdit');

    // 默认渲染
    const defaultSetting = () => {
        return <div className="flex-1 p-6 flex items-center justify-center">
            <div
                className="text-center py-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-sm">
                <div
                    className="w-24 h-24 mb-5 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto shadow-md">
                    <FontAwesomeIcon icon={faInfoCircle}
                                     className="h-12 text-indigo-500 dark:text-indigo-400"/>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    {t('selectSettingToEdit')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {settingItems.find(i => i.id === activeSetting) ? t('selectSettingDesc', {name: settingItems.find(i => i.id === activeSetting)?.label || ''}) : ''}
                </p>
            </div>
        </div>
    }

    // 系统设置项列表 导航数据
    const settingItems: SettingItem[] = [
        // 通用设置
        {id: 'general', icon: faCog, label: t('general.title'), color: '#6366f1', render: () => <GeneralSetting/>},
        // 偏好设置
        {id: 'preference', icon: faHeart, label: t('preference.title'), color: '#ec4899', render: defaultSetting},
        // 安全设置
        {id: 'security', icon: faShieldAlt, label: t('security.title'), color: '#ef4444', render: defaultSetting},
        // 用户设置
        {id: 'user', icon: faUser, label: t('user.title'), color: '#10b981', render: defaultSetting}
    ];
    // 状态管理
    const [activeSetting, setActiveSetting] = useState<SettingItem['id']>();

    const activeSettingOption = settingItems.find(i => i.id === activeSetting);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700
                        transition-all duration-250 ease-in-out w-[100vw] md:min-w-[768px] md:max-w-[1024px] max-h-[85vh]">
            {/* 标题栏 */}
            <div
                className="min-h-15 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <FontAwesomeIcon icon={faCog} className="h-5 text-indigo-500"/>
                    <span>{t('title')}</span>

                </h2>
            </div>

            {/* 主内容区 */}
            <div className="flex flex-1 overflow-hidden bg-white dark:bg-slate-900/30">
                {/* 左侧设置项切换区 */}
                <div
                    className="w-73 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgb(96 165 250) rgb(229 231 235)',
                        scrollbarGutter: 'stable',
                    }}>
                    <div className="p-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium uppercase tracking-wider">
                            {t('settingsMenu')}
                        </p>

                        {/* 设置项列表 */}
                        <div className="space-y-2">
                            {settingItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSetting(item.id)}
                                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer border transition-all duration-300 ease-in-out
                                        ${activeSetting === item.id
                                        ? 'bg-white dark:bg-slate-700 border-indigo-200 dark:border-indigo-600 shadow-md transform translate-x-1'
                                        : 'hover:bg-slate-200 dark:hover:bg-slate-700/80 border-transparent hover:translate-x-0.5'
                                    }`}
                                >
                                    {/* 图标区域 */}
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                                        style={{
                                            backgroundColor: item.color,
                                            boxShadow: `0 2px 8px ${item.color}33`
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={item.icon}
                                            className="h-5 text-white"
                                        />
                                    </div>

                                    {/* 文本区域 */}
                                    <div className="flex-1 min-w-0 text-right">
                                        <span
                                            className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100 block">
                                            {item.label}
                                        </span>
                                    </div>

                                    {/* 选中状态指示器 */}
                                    {activeSetting === item.id && (
                                        <div className="w-1.5 h-6 rounded-full bg-indigo-500 flex-shrink-0 shadow-md"/>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* 分隔线 */}
                        <div className="my-6 border-t border-slate-200 dark:border-slate-700"/>

                        {/* 说明文本 */}
                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2.5 pl-1">
                            <p className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faInfoCircle}
                                                 className="h-3.5 mt-0.5 flex-shrink-0 text-slate-400"/>
                                <span>{t('helpText.selectOption')}</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faInfoCircle}
                                                 className="h-3.5 mt-0.5 flex-shrink-0 text-slate-400"/>
                                <span>{t('helpText.refreshPage')}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* 右侧内容区 */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
                    {activeSettingOption ? activeSettingOption.render() : defaultSetting()}
                </div>
            </div>
        </div>
    );
};

const SystemEditModal: React.FC<SystemEditModalProps> = ({
                                                             visible = false,
                                                             onClose,
                                                         }) => {
    return (
        <Modal
            visible={visible}
            onClose={onClose}
        >
            <SystemEdit/>
        </Modal>
    );
};

export default SystemEditModal;
