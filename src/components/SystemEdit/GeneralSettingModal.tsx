'use client';
import React, {useEffect, useState} from 'react';
import BaseForm, {FormField} from '@/components/common/BaseForm';
import {apis} from "@/utils/RequestUtil";
import {faSave, faUndo} from '@fortawesome/free-solid-svg-icons';
import CommonLoading from "@/components/common/CommonLoading";
import {useAppTranslation} from "@/providers/I18nProvider";
import {useToast} from "@/components/common/Toast";

const GeneralSettingModal = () => {
    const [loading, setLoading] = useState(true);
    const [initialValues, setInitialValues] = useState<any>({});
    const {t} = useAppTranslation('GeneralSetting');
    const {showToast} = useToast();

    // 表单配置
    const searchFields: FormField[] = [
        {
            label: t('systemName'),
            name: 'systemName',
            type: 'input',
            placeholder: t('systemNamePlaceholder'),
            rules: [{required: true, message: t('systemNameRequired')}]
        },
        {
            label: t('description'),
            name: 'description',
            type: 'textarea',
            placeholder: t('descriptionPlaceholder'),
            rules: [{required: true, message: t('descriptionRequired')}],
        },
        {
            label: t('copyright'),
            name: 'copyright',
            type: 'input',
            placeholder: t('copyrightPlaceholder'),
            rules: [{required: true, message: t('copyrightRequired')}]
        },
        {
            label: t('defaultLanguage'),
            name: 'defaultLanguage',
            type: 'select',
            placeholder: t('defaultLanguagePlaceholder'),
            options: [
                {label: t('language.auto'), value: "auto"},
                {label: 'English', value: "en-US"},
                {label: '中文', value: 'zh-CN'},
                {label: '日本語', value: 'ja-JP'},
                {label: '한국어', value: 'ko-KR'}
            ],
            isSearch: true,
            rules: [{required: true, message: t('defaultLanguageRequired')}]
        },
        {
            label: t('defaultTheme'),
            name: 'defaultTheme',
            type: 'radio',
            placeholder: t('defaultThemePlaceholder'),
            options: [
                {label: t('theme.auto'), value: 'auto'},
                {label: t('theme.light'), value: 'light'},
                {label: t('theme.dark'), value: 'dark'}
            ],
            rules: [{required: true, message: t('defaultThemeRequired')}],
            optionLayout: 'horizontal'
        },
        {
            name: 'status1',
            type: 'checkbox',
            label: '状态1',
            placeholder: '所有状态',
            options: [
                {label: '选项1', value: 'option1'},
                {label: '选项2', value: 'option2'},
                {label: '选项3', value: 'option3'},
                {label: '选项4', value: 'option4'}
            ],
            optionLayout: 'horizontal'
        },
    ];

    // 加载数据
    const loadData = () => {
        apis.getGeneralSetting().then(res => {
            setInitialValues(res.setting);
        }).catch(err => {
            console.error('loadData error:', err);
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className={'p-5 relative'}>
            {loading && <CommonLoading/>}

            {/* 表单内容 - 加载完成后显示 */}
            <BaseForm
                fields={searchFields}
                initialValues={initialValues}
                onSubmit={(values) => {
                    setLoading(true);
                    apis.saveGeneralSetting({
                        systemName: values.systemName,
                        description: values.description,
                        copyright: values.copyright,
                        defaultLanguage: values.defaultLanguage,
                        defaultTheme: values.defaultTheme
                    }).then(() => {
                        loadData();
                        showToast({
                            message: t('saveSuccess'),
                            type: 'success',
                            duration: 3000,
                        });
                    }).catch(err => {
                        showToast({
                            message: t('saveFailed') + err,
                            type: 'error',
                            duration: 3000,
                        })
                        console.error('save error:', err);
                        setLoading(false);
                    });
                }}
                onReset={() => {
                    // 重置时可清空表单或重新加载初始数据
                }}
                disabled={loading}
                layout={'vertical'}
                submitText={t('save')}
                submitIcon={faSave}
                resetText={t('reset')}
                resetIcon={faUndo}
                fieldGap="1.5rem"
            />
        </div>
    );
};

export default GeneralSettingModal;
