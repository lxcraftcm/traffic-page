import {
    faLayerGroup,
    faTasks,
    faCalendarDays,
    faEnvelope,
    faHome,
    faBook,
    faShoppingCart,
    faBell,
    faGear,
    faFolderOpen,
    faTag,
    faUser
} from '@fortawesome/free-solid-svg-icons';

import {LanguageOption} from '@/types/base'
import {
    faAirbnb,
    faAlipay,
    faAmazon,
    faAndroid,
    faAngular,
    faApple,
    faBilibili,
    faCcAmex,
    faCentos,
    faCloudflare,
    faCss3,
    faDebian,
    faDiscord,
    faDocker,
    faDuolingo,
    faFacebook,
    faGithub,
    faGitlab,
    faGoogle,
    faHtml5,
    faInstagram,
    faJava,
    faJs,
    faLinkedin,
    faMicrosoft,
    faNodeJs,
    faNpm,
    faPaypal,
    faReact,
    faSlack,
    faSpotify,
    faSteam,
    faStripe,
    faTwitter,
    faUbuntu,
    faVuejs,
    faWeixin,
    faYarn,
    faYoutube
} from "@fortawesome/free-brands-svg-icons";

// 预设语言选项
export const LANGUAGE_OPTIONS: LanguageOption[] = [
    {code: 'zh', name: '中文', nativeName: '中文'},
    {code: 'en', name: 'English', nativeName: 'English'},
    {code: 'ja', name: 'Japanese', nativeName: '日本語'},
    {code: 'ko', name: 'Korean', nativeName: '한국어'},
];


// 预设图标库
export const PRESET_ICONS = [
    {icon: faHome, label: '首页', class: 'fa-solid fa-home'},
    {icon: faLayerGroup, label: '分组', class: 'fa-solid fa-layer-group'},
    {icon: faTasks, label: '任务', class: 'fa-solid fa-tasks'},
    {icon: faCalendarDays, label: '日历', class: 'fa-solid fa-calendar-days'},
    {icon: faEnvelope, label: '邮件', class: 'fa-solid fa-envelope'},
    {icon: faBook, label: '文档', class: 'fa-solid fa-book'},
    {icon: faShoppingCart, label: '购物', class: 'fa-solid fa-shopping-cart'},
    {icon: faUser, label: '用户', class: 'fa-solid fa-user'},
    {icon: faBell, label: '通知', class: 'fa-solid fa-bell'},
    {icon: faGear, label: '设置', class: 'fa-solid fa-settings'},
    {icon: faFolderOpen, label: '文件夹', class: 'fa-solid fa-folder-open'},
    {icon: faTag, label: '标签', class: 'fa-solid fa-tag'}
];

// 预设图标库
export const PRESET_BRANDS_ICONS = [
    {icon: faApple, label: 'Apple', class: 'fa-brands fa-apple'},
    {icon: faAndroid, label: 'Android', class: 'fa-brands fa-android'},
    {icon: faGoogle, label: 'Google', class: 'fa-brands fa-google'},
    {icon: faMicrosoft, label: 'Microsoft', class: 'fa-brands fa-microsoft'},
    {icon: faAmazon, label: 'Amazon', class: 'fa-brands fa-amazon'},
    {icon: faFacebook, label: 'Facebook', class: 'fa-brands fa-facebook'},
    {icon: faTwitter, label: 'Twitter', class: 'fa-brands fa-twitter'},
    {icon: faInstagram, label: 'Instagram', class: 'fa-brands fa-instagram'},
    {icon: faLinkedin, label: 'LinkedIn', class: 'fa-brands fa-linkedin'},
    {icon: faCloudflare, label: 'Cloudflare', class: 'fa-brands fa-cloudflare'},
    {icon: faBilibili, label: 'Bilibili', class: 'fa-brands fa-bilibili'},
    {icon: faYoutube, label: 'YouTube', class: 'fa-brands fa-youtube'},
    {icon: faGithub, label: 'GitHub', class: 'fa-brands fa-github'},
    {icon: faGitlab, label: 'GitLab', class: 'fa-brands fa-gitlab'},
    {icon: faDiscord, label: 'Discord', class: 'fa-brands fa-discord'},
    {icon: faDuolingo, label: 'Duolingo', class: 'fa-brands fa-duolingo'},
    {icon: faAirbnb, label: 'Airbnb', class: 'fa-brands fa-airbnb'},
    {icon: faDebian, label: 'Debian', class: 'fa-brands fa-debian'},
    {icon: faUbuntu, label: 'Ubuntu', class: 'fa-brands fa-ubuntu'},
    {icon: faCentos, label: 'Centos', class: 'fa-brands fa-centos'},
    {icon: faSlack, label: 'Slack', class: 'fa-brands fa-slack'},
    {icon: faSpotify, label: 'Spotify', class: 'fa-brands fa-spotify'},
    {icon: faSteam, label: 'Steam', class: 'fa-brands fa-steam'},
    {icon: faPaypal, label: 'PayPal', class: 'fa-brands fa-paypal'},
    {icon: faAlipay, label: 'Alipay', class: 'fa-brands fa-alipay'},
    {icon: faWeixin, label: 'Wechat', class: 'fa-brands fa-weixin'},
    {icon: faCcAmex, label: 'American Express', class: 'fa-brands fa-cc-amex'},
    {icon: faJava, label: 'Java', class: 'fa-brands fa-java'},
    {icon: faReact, label: 'React', class: 'fa-brands fa-react'},
    {icon: faVuejs, label: 'Vue.js', class: 'fa-brands fa-vuejs'},
    {icon: faAngular, label: 'Angular', class: 'fa-brands fa-angular'},
    {icon: faNodeJs, label: 'Node.js', class: 'fa-brands fa-node-js'},
    {icon: faDocker, label: 'Docker', class: 'fa-brands fa-docker'},
    {icon: faHtml5, label: 'HTML5', class: 'fa-brands fa-html5'},
    {icon: faCss3, label: 'CSS3', class: 'fa-brands fa-css3'},
    {icon: faJs, label: 'JavaScript', class: 'fa-brands fa-js'},
    {icon: faYarn, label: 'Yarn', class: 'fa-brands fa-yarn'},
    {icon: faNpm, label: 'npm', class: 'fa-brands fa-npm'},
    {icon: faStripe, label: 'Stripe', class: 'fa-brands fa-stripe'},
];

// 预设颜色
export const PRESET_ICON_COLORS = [
    '#6366f1', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#000'
];

export const PRESET_BG_COLORS = [
    '#f3f4f6', '#eff6ff', '#fef3c7', '#ecfdf5',
    '#fee2e2', '#faf5ff', '#ffe6e6', '#e0f2fe'
];