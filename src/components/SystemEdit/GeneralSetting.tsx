'use client';
import React, {useState} from 'react';
import BaseForm, {FormField} from '@/components/common/BaseForm';

const GeneralSetting = () => {
    const [loading, setLoading] = useState(false);

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
            label: '系统标题',
            name: 'systemTitle',
            type: 'input',
            placeholder: '请输入系统标题',
            rules: [{required: true}]
        },
        {
            label: '系统子标题',
            name: 'systemSubTitle',
            type: 'textarea',
            placeholder: '请输入系统子标题',
            rules: [{required: true}]
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
                {label: '英语', value: "en"},
                {label: '中文', value: 'zh'},
                {label: '日语', value: 'ja'},
                {label: '韩语', value: 'ko'}
            ],
            isSearch: true,
            rules: [{required: true}]
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
        {
            name: 'status2',
            type: 'radio',
            label: '状态2',
            placeholder: '所有状态',
            options: [
                {label: '选项1', value: 'option1'},
                {label: '选项2', value: 'option2'}
            ],
            optionLayout: 'horizontal'
        }
    ];

    return (
        <BaseForm
            fields={searchFields}
            // initialValues={mockUserData[0]}
            onSubmit={(values) => {
                console.log("submit", values)
            }}
            onReset={() => {
            }}
            disabled={loading}
            layout={'vertical'}
            submitText={'搜索'}
            resetText={'重置'}
            fieldGap="1.5rem"
        />
    );
};

export default GeneralSetting;
