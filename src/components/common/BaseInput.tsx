import React, {useState, useEffect, useRef} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faCheck, faChevronDown
} from '@fortawesome/free-solid-svg-icons';

// 类型定义
export type InputType = 'input' | 'select' | 'checkbox' | 'radio' | 'textarea';

// 选项类型（用于select/radio）
export interface Option {
    label: string;
    value: string | number | boolean;
}

// 属性
interface BaseInputProps {
    /** id */
    id?: string;
    /** 初始值 */
    initialValue?: string | number | boolean | (string | number | boolean)[];
    /** 类型 */
    inputType: InputType | 'input';
    /** 是否关闭 */
    disabled?: boolean;
    /** 是否错误 */
    hasError?: boolean;
    /** 占位符（input/textarea） */
    placeholder?: string;
    /** 选项列表（select/radio） */
    options?: Option[];
    /** 是否搜索（select） */
    isSearch?: boolean;
    /** 选项布局（垂直/水平）（checkbox/radio）*/
    optionLayout?: 'vertical' | 'horizontal';
    /** 改变时 */
    onChange?: (newValue: any) => void;
    /** 失焦时 */
    onBlur?: (newValue: any) => void
}

/** 通用表单组件 */
const BaseInput: React.FC<BaseInputProps> = ({
                                                 id,
                                                 initialValue,
                                                 inputType,
                                                 disabled,
                                                 hasError,
                                                 placeholder,
                                                 options,
                                                 isSearch,
                                                 optionLayout,
                                                 onChange,
                                                 onBlur
                                             }) => {
    const getInitialValue = () => {
        if (initialValue) {
            return initialValue;
        } else if (inputType === 'checkbox') {
            return [];
        } else {
            return '';
        }
    }
    // ref引用
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false)
    const [value, setValue] = useState<string | number | boolean | (string | number | boolean)[] | undefined>(getInitialValue())
    const [selectLabel, setSelectLabel] = useState<string>()
    const [relOptions, setRelOptions] = useState<Option[] | undefined>(options)
    const [searchValue, setSearchValue] = useState<string>('')

    // 点击外部关闭语言切换
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsSelectorOpen(false)
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const init = async () => {
            if (initialValue) setValue(getInitialValue())
            if (inputType === 'select' && options) {
                options.map(option => {
                    if (option.value === value) {
                        setSelectLabel(option.label);
                    }
                })
            }
        }
        init();
    }, [initialValue, options])

    // 输入框样式
    const inputBaseClass = `w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-200
          ${disabled ? 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 cursor-not-allowed' : hasError
        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900'}
          text-slate-800 dark:text-slate-200 focus:outline-none duration-200`;

    // 处理字段值变化
    const handleChange = (v: any) => {
        let newValue = v;
        if (inputType === 'checkbox') {
            if (value instanceof Array) {
                newValue = value.includes(v)
                    ? value.filter(item => item !== v) // 存在则删除
                    : [...value, v] // 不存在则添加);
            } else {
                newValue = [v]
            }
        }
        setValue(newValue)
        if (onChange) onChange(newValue)
    };

    // 下拉框处理字段值变化
    const handleSelectChange = (value: any) => {
        setSearchValue(value)
        if (value) {
            let newOptions: Option[] = []
            if (options) {
                options.map(option => {
                    if (option.label.includes(value)) {
                        newOptions.push(option)
                    }
                })
            }
            setRelOptions(newOptions);
        } else {
            setRelOptions(options);
        }
    };

    // 下拉框下拉菜单更新
    const selectorOpenChange = (open: boolean, newValue?: any) => {
        setIsSelectorOpen(open)
        setSearchValue('')
        setRelOptions(options)
        if ((searchRef || buttonRef) && !open) {
            searchRef?.current?.blur()
            buttonRef?.current?.blur()
            if (onBlur) onBlur(newValue ?? value);
        }
    }

    // 渲染下拉框
    const renderSelect = () => {
        return <div ref={dropdownRef} className="relative inline-block w-full">
            {/* 触发按钮 */}
            {isSearch ? (
                <div className="flex items-center" onClick={disabled ? () => {
                } : () => {
                    selectorOpenChange(!isSelectorOpen)
                }}>
                    <input
                        ref={searchRef}
                        id={id}
                        type="text"
                        value={searchValue}
                        onChange={(e) => handleSelectChange(e.target.value)}
                        placeholder={selectLabel ?? placeholder}
                        disabled={disabled}
                        className={`${inputBaseClass} placeholder-slate-800 dark:placeholder-slate-200`}
                    />
                    <div className="-ml-7">
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${isSelectorOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex items-center" onClick={disabled ? () => {
                } : () => {
                    selectorOpenChange(!isSelectorOpen)
                }}>
                    <button
                        type="button"
                        ref={buttonRef}
                        className={`flex items-center w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-200
                            ${disabled ? 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 cursor-not-allowed' : hasError
                            ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
                            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900'}
                            text-slate-800 dark:text-slate-200 focus:outline-none duration-200`}
                        aria-expanded={isSelectorOpen}
                    >
                        <span>{selectLabel ?? placeholder}</span>
                    </button>
                    <div className="-ml-7">
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${isSelectorOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>
            )}

            {/* 下拉菜单 */}
            <div className={`absolute z-50 mt-1 w-44 rounded-md bg-white dark:bg-slate-800  border border-slate-200 dark:border-slate-700  
                            shadow-md  overflow-hidden transition-opacity duration-200 cursor-pointer
                            ${isSelectorOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {relOptions ? relOptions.map(option => (
                    <div
                        key={"options_" + option.value}
                        onClick={() => {
                            handleChange(option.value);
                            setSelectLabel(option.label)
                            selectorOpenChange(false, option.value)
                            if (onChange) onChange(option.value)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.75 text-sm
                            transition-colors duration-150
                            ${value === option.value
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-900/10'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                        }`}
                    >
                        <span>{option.label}</span>
                        {value === option.value && (
                            <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5"/>
                        )}
                    </div>
                )) : (<></>)}
            </div>
        </div>
    }

    // 渲染Checkbox
    const renderCheckbox = () => {
        // Checkbox选项容器样式
        const optionsContainerClass = `
              ${optionLayout === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2.5'}
              ${hasError ? 'border-l-2 border-red-500 pl-3' : ''}`;
        return (
            <div className={optionsContainerClass}>
                {options?.map(option => (
                    <div
                        key={"checkbox_option_" + option.value}
                        className={`flex items-center gap-2.5 transition-colors px-2 py-1.5 rounded-md ${
                            disabled ? 'opacity-70' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }
                        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={(e) => !disabled && handleChange(option.value)}
                    >
                        {/* Checkbox 核心样式 */}
                        <div
                            className={`relative w-5 h-5 flex items-center justify-center rounded-xs transition-all duration-200
                            ${hasError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                            ${value instanceof Array && option.value && value.includes(option.value)
                                ? 'border-2 border-indigo-600'
                                : 'bg-white dark:bg-slate-800 border-2 border-indigo-100'
                            }`}
                        >
                            {/* 选中圆点（选中时显示） */}
                            <div className={`w-2.5 h-2.5 rounded-xs bg-indigo-600 transition-opacity duration-200 
                                ${value instanceof Array && value.includes(option.value) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                            `}/>
                            {/* 隐藏原生input（用于无障碍访问） */}
                            <input
                                id={`checkbox-option-disabled-${option.value}`}
                                type="checkbox"
                                checked={value instanceof Array && value.includes(option.value)}
                                onChange={() => {
                                }}
                                disabled={disabled}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            />
                        </div>

                        {/* 选项文本 */}
                        <div
                            className={`text-sm ${disabled ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                            {option.label}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // 渲染Radio
    const renderRadio = () => {
        // Radio选项容器样式
        const optionsContainerClass = `
              ${optionLayout === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2.5'}
              ${hasError ? 'border-l-2 border-red-500 pl-3' : ''}`;
        return (
            <div className={optionsContainerClass}>
                {options?.map(option => (
                    <div
                        key={"radio_option_" + option.value}
                        className={`flex items-center gap-2.5 transition-colors px-2 py-1.5 rounded-md ${
                            disabled ? 'opacity-70' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }
                        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={(e) => !disabled && handleChange(option.value)}
                    >
                        {/* Radio 核心样式 */}
                        <div
                            className={`relative w-5 h-5 flex items-center justify-center rounded-full transition-all duration-200
                            ${hasError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                            ${value === option.value
                                ? 'border-2 border-indigo-600'
                                : 'bg-white dark:bg-slate-800 border-2 border-indigo-100'
                            }`}
                        >
                            {/* 选中圆点（选中时显示） */}
                            <div className={`w-2.5 h-2.5 rounded-full bg-indigo-600 transition-opacity duration-200 
                                ${value === option.value ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                            `}/>
                            {/* 隐藏原生input（用于无障碍访问） */}
                            <input
                                id={`radio-option-disabled-${option.value}`}
                                type="radio"
                                onChange={() => {
                                }}
                                checked={value === option.value}
                                disabled={disabled}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            />
                        </div>

                        {/* 选项文本 */}
                        <div
                            className={`text-sm ${disabled ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                            {option.label}
                        </div>
                    </div>
                ))}
            </div>
        );
    };


    return (
        <>
            {inputType === 'input' && (
                <input
                    id={id}
                    type="text"
                    value={value ? value.toString() : ''}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={inputBaseClass}
                    onBlur={() => {
                        if (onBlur) onBlur(value)
                    }}
                />
            )}

            {inputType === 'textarea' && (
                <textarea
                    id={id}
                    value={value ? value.toString() : ''}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`${inputBaseClass} duration-75`}
                    onBlur={() => {
                        if (onBlur) onBlur(value)
                    }}
                />
            )}

            {inputType === 'select' && (
                renderSelect()
            )}

            {inputType === 'checkbox' && (
                renderCheckbox()
            )}

            {inputType === 'radio' && (
                renderRadio()
            )}
        </>
    );
};

export default BaseInput;
