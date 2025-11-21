import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faImage} from "@fortawesome/free-solid-svg-icons";

export const defaultColor = '#1f2937';
export const defaultIcon = faImage;

export const getIconClass = (icon: IconProp): string => {
    return `${icon.prefix} fa-${icon.iconName}`;
}

// 渲染图标
export const renderIcon = (
    item: { iconMode: 'preset' | 'class' | 'url', iconUrl?: string; fontAwesomeClass?: string; iconColor?: string },
    size: number = 5
) => {
    if ((item.iconMode === 'class' || item.iconMode === 'preset') && item.fontAwesomeClass) {
        return (
            <FontAwesomeIcon
                icon={item.fontAwesomeClass as any}
                style={{fontSize: `${size * 4}px`, color: item.iconColor || defaultColor}}
            />
        );
    }
    if (item.iconUrl) {
        return (
            <img
                src={item.iconUrl}
                alt="自定义图标"
                className="object-contain"
                style={{width: `${size * 4}px`, height: `${size * 4}px`}}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                }}
            />
        );
    }
    return (
        <FontAwesomeIcon
            icon={defaultIcon}
            style={{fontSize: `${size * 4}px`, color: item.iconColor || defaultColor}}
        />
    );
};