'use client';
import React, {useState, useEffect} from 'react';
import BaseForm, {FormField} from '@/components/common/BaseForm';
import {apis} from "@/utils/RequestUtil";
import {faSave, faUndo, faUser, faLock} from '@fortawesome/free-solid-svg-icons';
import CommonLoading from "@/components/common/CommonLoading";
import {useAppTranslation} from "@/providers/I18nProvider";
import {useToast} from "@/components/common/Toast";
import forge from 'node-forge';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {removeToken} from "@/lib/auth";

const UserSettingModal = () => {
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<any>({});
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const {t} = useAppTranslation('UserSetting');
    const {showToast} = useToast();

    // 加载用户信息
    const loadUserInfo = () => {
        apis.getUserInfo().then(res => {
            setUserInfo(res.user);
        }).catch(err => {
            console.error('loadUserInfo error:', err);
            showToast({
                message: err?.message || t('loadFailed'),
                type: 'error',
                duration: 3000,
            });
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        loadUserInfo();
    }, []);

    // 表单配置 - 基本信息
    const profileFields: FormField[] = [
        {
            label: t('username'),
            name: 'username',
            type: 'input',
            placeholder: t('usernamePlaceholder'),
            rules: [{required: true, message: t('usernameRequired')}]
        },
        {
            label: t('email'),
            name: 'email',
            type: 'input',
            placeholder: t('emailPlaceholder'),
            rules: [
                {
                    validator: (value: string) => {
                        if (!value) return true; // 邮箱非必填
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        return emailRegex.test(value) || t('emailInvalid');
                    }
                }
            ]
        },
    ];

    // 表单配置 - 修改密码
    const passwordFields: FormField[] = [
        {
            label: t('currentPassword'),
            name: 'currentPassword',
            type: 'password',
            placeholder: t('currentPasswordPlaceholder'),
            rules: [{required: true, message: t('currentPasswordRequired')}]
        },
        {
            label: t('newPassword'),
            name: 'newPassword',
            type: 'password',
            placeholder: t('newPasswordPlaceholder'),
            rules: [
                {required: true, message: t('newPasswordRequired')},
                {
                    validator: (value: string) => {
                        if (value.length < 6 || value.length > 20) {
                            return t('passwordLength');
                        }
                        if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(value)) {
                            return t('passwordFormat');
                        }
                        return true;
                    }
                }
            ]
        },
        {
            label: t('confirmPassword'),
            name: 'confirmPassword',
            type: 'password',
            placeholder: t('confirmPasswordPlaceholder'),
            rules: [
                {required: true, message: t('confirmPasswordRequired')},
                {
                    validator: (value: string) => {
                        // 简单验证，实际匹配在提交时检查
                        if (!value) return true;
                        return true;
                    }
                }
            ]
        },
    ];

    // RSA加密密码
    const encryptPassword = (password: string, publicKey: string) => {
        const key = forge.pki.publicKeyFromPem(publicKey);
        const encrypted = key.encrypt(password, 'RSA-OAEP');
        return forge.util.encode64(encrypted);
    };

    // 保存基本信息
    const handleSaveProfile = async (values: any) => {
        setLoading(true);
        try {
            // 验证用户名长度
            if (values.username.length < 3 || values.username.length > 20) {
                showToast({
                    message: t('usernameLength'),
                    type: 'error',
                    duration: 3000,
                });
                return;
            }

            await apis.updateUserInfo({
                username: values.username,
                email: values.email || null
            });

            // 重新加载用户信息
            await loadUserInfo();

            showToast({
                message: t('saveSuccess'),
                type: 'success',
                duration: 3000,
            });
        } catch (err: any) {
            showToast({
                message: err?.message || t('saveFailed'),
                type: 'error',
                duration: 3000,
            });
            console.error('save profile error:', err);
        }
        // 注意：loadUserInfo 的 finally 块会处理 setLoading(false)
    };

    // 修改密码
    const handleChangePassword = async (values: any) => {
        setLoading(true);
        try {
            // 验证确认密码
            if (values.newPassword !== values.confirmPassword) {
                showToast({
                    message: t('confirmPasswordMismatch'),
                    type: 'error',
                    duration: 3000,
                });
                setLoading(false);
                return;
            }

            // 获取RSA密钥
            const rsaInfo = await apis.generateKey();
            const {keyId, publicKey} = rsaInfo;

            await apis.changePassword({
                keyId,
                currentPassword: encryptPassword(values.currentPassword, publicKey),
                newPassword: encryptPassword(values.newPassword, publicKey)
            });

            showToast({
                message: t('changePasswordSuccess'),
                type: 'success',
                duration: 3000,
            });

            // 密码修改成功，退出登录
            setTimeout(() => {
                removeToken();
                window.location.href = '/login';
            }, 1000);
        } catch (err: any) {
            showToast({
                message: err?.message || t('changePasswordFailed'),
                type: 'error',
                duration: 3000,
            });
            console.error('change password error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !userInfo.username) {
        return <CommonLoading/>;
    }

    return (
        <div className={'p-5 relative h-full flex flex-col'}>
            {loading && <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center">
                <CommonLoading/>
            </div>}

            {/* 标签页切换 */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-all duration-200 border-b-2 font-medium text-sm
                        ${activeTab === 'profile'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                >
                    <FontAwesomeIcon icon={faUser} className="h-4 w-4"/>
                    <span>{t('profileTab')}</span>
                </button>
                <button
                    onClick={() => setActiveTab('password')}
                    className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-all duration-200 border-b-2 font-medium text-sm
                        ${activeTab === 'password'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                >
                    <FontAwesomeIcon icon={faLock} className="h-4 w-4"/>
                    <span>{t('passwordTab')}</span>
                </button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'profile' ? (
                    <BaseForm
                        fields={profileFields}
                        initialValues={{username: userInfo.username || '', email: userInfo.email || ''}}
                        onSubmit={handleSaveProfile}
                        onReset={() => {
                            // 重新加载初始数据
                            setUserInfo({...userInfo});
                        }}
                        disabled={loading}
                        layout={'vertical'}
                        submitText={t('save')}
                        submitIcon={faSave}
                        resetText={t('reset')}
                        resetIcon={faUndo}
                        fieldGap="1.5rem"
                    />
                ) : (
                    <BaseForm
                        fields={passwordFields}
                        initialValues={{}}
                        onSubmit={handleChangePassword}
                        onReset={() => {
                            // 重置表单
                        }}
                        disabled={loading}
                        layout={'vertical'}
                        submitText={t('changePassword')}
                        submitIcon={faSave}
                        resetText={t('reset')}
                        resetIcon={faUndo}
                        fieldGap="1.5rem"
                    />
                )}
            </div>
        </div>
    );
};

export default UserSettingModal;
