import React, {useState, useCallback, useEffect} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faTimes,
    faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import BaseInput, {InputType, Option} from "@/components/common/BaseInput";

// 表单字段配置
export interface FormField {
    /** 字段唯一标识 */
    name: string;
    /** 字段标签 */
    label?: string;
    /** 字段类型 */
    type: InputType;
    /** 占位符（input/textarea） */
    placeholder?: string;
    /** 选项列表（select/radio） */
    options?: Option[];
    /** 是否搜索（select） */
    isSearch?: boolean;
    /** 默认值 */
    defaultValue?: any;
    /** 是否禁用 */
    disabled?: boolean;
    /** 验证规则 */
    rules?: {
        /** 是否必填 */
        required?: boolean;
        /** 错误提示文本 */
        message?: string;
        /** 自定义验证函数 */
        validator?: (value: any) => boolean | string;
    }[];
    /** 字段宽度（如"100%"、"200px"） */
    width?: string;
    /** 额外样式 */
    style?: React.CSSProperties;
    /** 选项布局（垂直/水平）（checkbox/radio）*/
    optionLayout?: 'horizontal' | 'vertical';
}

// 表单组件属性
interface BaseFormProps {
    /** 表单字段配置 */
    fields: FormField[];
    /** 表单提交回调 */
    onSubmit: (values: Record<string, any>) => void;
    /** 表单重置回调 */
    onReset?: () => void;
    /** 表单初始值 */
    initialValues?: Record<string, any>;
    /** 是否禁用整个表单 */
    disabled?: boolean;
    /** 表单布局（垂直/水平） */
    layout?: 'vertical' | 'horizontal';
    /** 提交按钮文本 */
    submitText?: string;
    /** 是否显示重置按钮 */
    showReset?: boolean;
    /** 重置按钮文本 */
    resetText?: string;
    /** 表单容器样式 */
    formClass?: string;
    /** 表单字段间距 */
    fieldGap?: string;
}

/** 通用表单组件 */
const BaseForm: React.FC<BaseFormProps> = ({
                                               fields = [],
                                               onSubmit,
                                               onReset,
                                               initialValues = {},
                                               disabled = false,
                                               layout = 'horizontal',
                                               submitText = '提交',
                                               showReset = true,
                                               resetText = '重置',
                                               formClass = '',
                                               fieldGap = '1rem',
                                           }) => {
    // 初始化表单值（合并默认值和初始值）
    const getInitialValues = useCallback(() => {
        return fields.reduce((values, field) => {
            values[field.name] = initialValues[field.name] ?? field.defaultValue ?? '';
            return values;
        }, {} as Record<string, any>);
    }, [fields, initialValues]);

    // 表单状态管理
    const [formValues, setFormValues] = useState<Record<string, any>>(getInitialValues());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // 初始值变化时同步更新
    // useEffect(() => {
    //     // setFormValues(getInitialValues());
    // }, [initialValues]);

    // 处理字段值变化
    const handleChange = (name: string, value: any) => {
        setFormValues(prev => ({...prev, [name]: value}));

        // 已触碰的字段自动验证
        if (touched[name]) {
            validateField(name, value);
        }
    };

    // 字段验证
    const validateField = (name: string, value: any): boolean => {
        const field = fields.find(f => f.name === name);
        if (!field?.rules?.length) return true;

        for (const rule of field.rules) {
            // 必填验证
            if (rule.required && (!value && value !== 0 && value !== false)) {
                setErrors(prev => ({...prev, [name]: rule.message || '此字段为必填项'}));
                return false;
            }

            // 自定义验证
            if (rule.validator) {
                const result = rule.validator(value);
                if (result !== true) {
                    setErrors(prev => ({...prev, [name]: result as string || '验证失败'}));
                    return false;
                }
            }
        }

        // 验证通过
        setErrors(prev => ({...prev, [name]: ''}));
        return true;
    };

    // 整体表单验证
    const validateForm = (): boolean => {
        let isValid = true;
        const newErrors: Record<string, string> = {};

        fields.forEach(field => {
            const value = formValues[field.name];
            if (!validateField(field.name, value)) {
                isValid = false;
                newErrors[field.name] = errors[field.name];
            }
        });

        setTouched(fields.reduce((obj, field) => {
            obj[field.name] = true;
            return obj;
        }, {} as Record<string, boolean>));

        return isValid;
    };

    // 提交表单
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({...formValues});
        }
    };

    // 重置表单
    const handleReset = () => {
        const initial = getInitialValues();
        setFormValues(initial);
        setErrors({});
        setTouched({});
        onReset?.();
    };

    const isRequired = (field: FormField): boolean => {
        if (!field.rules) return false;
        let required = false;
        field.rules.map((rule) => {
            if (rule.required) required = true;
        })
        return required;
    }

    // 渲染表单字段
    const renderField = (field: FormField) => {
        const {
            name,
            label,
            type,
            placeholder,
            options,
            disabled: fieldDisabled = false,
            width = '100%',
            style = {},
            isSearch,
            optionLayout
        } = field;
        const value = formValues[name];
        const isDisabled = disabled || fieldDisabled;
        const hasError = touched[name] && !!errors[name];
        const required = isRequired(field);

        return (
            <div
                key={name}
                className={`${layout === 'horizontal' ? 'flex items-center gap-2' : 'flex flex-col gap-1'}`}
                style={{width, ...style}}
            >
                {label && (
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                        {label} {required ? <span className="text-red-500">*</span> : <></>}
                    </label>
                )}

                <div className={layout === 'horizontal' ? 'flex-1' : ''}>
                    <BaseInput
                        initialValue={value}
                        inputType={type}
                        placeholder={placeholder}
                        options={options}
                        isSearch={isSearch}
                        disabled={isDisabled}
                        optionLayout={optionLayout}
                        onChange={(newValue) => {
                            handleChange(name, newValue)
                        }}
                        onBlur={(newValue) => {
                            setTouched(prev => ({...prev, [name]: true}))
                            validateField(name, newValue)
                        }}
                    />

                    {/* 错误提示 */}
                    {hasError && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                            <FontAwesomeIcon icon={faExclamationCircle} className="h-3"/>
                            <span>{errors[name]}</span>
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                gap: fieldGap,
            }}
            className={`w-full p-3 flex flex-col ${formClass}`}
        >
            {/* 表单字段区域 */}
            <div className={`flex flex-wrap gap-3 ${layout === 'horizontal' ? '' : 'flex-col'}`}>
                {fields.map(field => renderField(field))}
            </div>

            {/* 按钮区域 */}
            <div className="flex gap-2 pt-1">
                <button
                    type="submit"
                    disabled={disabled}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        disabled
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                    <FontAwesomeIcon icon={faCheck} className="h-4 w-4"/>
                    <span>{submitText}</span>
                </button>

                {showReset && (
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={disabled}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                            disabled
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4"/>
                        <span>{resetText}</span>
                    </button>
                )}
            </div>
        </form>
    );
};

export default BaseForm;
