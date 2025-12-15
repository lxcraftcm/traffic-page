'use client';
import React, {useEffect, useState} from 'react';
import BaseForm, {FormField} from '@/components/common/BaseForm';
import {apis} from "@/utils/RequestUtil";
import {faSave, faUndo} from '@fortawesome/free-solid-svg-icons';

const GeneralSettingModal = () => {
    const [loading, setLoading] = useState(true);
    const [initialValues, setInitialValues] = useState<any>({}); // 明确类型

    // 表单配置
    const searchFields: FormField[] = [
        {
            label: '系统名称',
            name: 'systemName',
            type: 'input',
            placeholder: '请输入系统名称',
            rules: [{required: true}]
        },
        {
            label: '系统介绍',
            name: 'description',
            type: 'textarea',
            placeholder: '请输入系统介绍',
            rules: [{required: true}],
        },
        {
            label: '版权信息',
            name: 'copyright',
            type: 'input',
            placeholder: '请输入版权信息',
            rules: [{required: true}]
        },
        {
            label: '系统默认语言',
            name: 'defaultLanguage',
            type: 'select',
            placeholder: '请选择系统默认语言',
            options: [
                {label: '自动', value: "auto"},
                {label: '英语', value: "en-US"},
                {label: '中文', value: 'zh-CN'},
                {label: '日语', value: 'ja-JP'},
                {label: '韩语', value: 'ko-KR'}
            ],
            isSearch: true,
            rules: [{required: true}]
        },
        {
            label: '默认主题',
            name: 'defaultTheme',
            type: 'radio',
            placeholder: '请选择主题偏好',
            options: [
                {label: '自动', value: 'auto'},
                {label: '明亮', value: 'light'},
                {label: '黑暗', value: 'dark'}
            ],
            rules: [{required: true}],
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
            console.log(res.setting);
            setInitialValues(res.setting);
        }).catch(err => {
            console.error('加载通用设置失败:', err);
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className={'p-5 relative'}>
            {loading && (
                <div
                    className="absolute inset-0 bg-white/10 dark:bg-slate-800/10 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300 ease-in-out">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30"/>
                        <div
                            className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-indigo-500 dark:border-t-indigo-400 animate-spin [animation-duration:1.2s] [animation-timing-function:cubic-bezier(0.4,0,0.2,1)]"/>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 opacity-70"/>
                        </div>
                        <div
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 blur-md"/>
                    </div>
                </div>
            )}


            {/* 表单内容 - 加载完成后显示 */}
            <BaseForm
                fields={searchFields}
                initialValues={initialValues}
                onSubmit={(values) => {
                    console.log("submit", values);
                    // 提交时也可添加加载状态
                    setLoading(true);
                    apis.saveGeneralSetting({
                        systemName: values.systemName,
                        description: values.description,
                        copyright: values.copyright,
                        defaultLanguage: values.defaultLanguage,
                        defaultTheme: values.defaultTheme
                    }).then(() => {
                        loadData(); // 重新加载数据
                    }).catch(err => {
                        console.error('保存失败:', err);
                        setLoading(false); // 保存失败也需关闭加载
                    });
                }}
                onReset={() => {
                    // 重置时可清空表单或重新加载初始数据
                }}
                disabled={loading} // 加载中禁用表单
                layout={'vertical'}
                submitText={'保存'}
                submitIcon={faSave}
                resetText={'重置'}
                resetIcon={faUndo}
                fieldGap="1.5rem"
            />
        </div>
    );
};

export default GeneralSettingModal;
