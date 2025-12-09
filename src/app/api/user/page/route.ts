import {result, getUser, getMessage} from "@/utils/ApiUtil";
import db from "@/lib/db";
import {NextRequest} from "next/server";
import {getTranslation} from "@/lib/i18n";

const defaultPage = [
    {
        id: 'quick-access',
        name: 'QuickAccess',
        iconMode: 'preset',
        fontAwesomeClass: 'fas fa-bolt',
        iconColor: '#06b6d4',
        iconBgColor: '#e0f2fe',
        sites: [
            {
                id: 'quick-access-1',
                name: 'Google',
                desc: 'Global search engine',
                internalUrl: 'https://google.com',
                externalUrl: 'https://google.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-google',
                iconColor: '#f55c0a',
                iconBgColor: '#e0f2fe'
            },
            {
                id: 'quick-access-2',
                name: 'Bing',
                desc: 'Microsoft search engine',
                internalUrl: 'https://bing.com',
                externalUrl: 'https://bing.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-b',
                iconColor: '#258ffa',
                iconBgColor: '#e6f2ff'
            },
            {
                id: 'quick-access-3',
                name: 'GitHub',
                desc: 'Code hosting platform',
                internalUrl: 'https://github.com',
                externalUrl: 'https://github.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-github',
                iconColor: '#000',
                iconBgColor: '#e0f2fe'
            }
        ]
    },
    {
        id: 'common-tools',
        name: 'CommonTools',
        iconMode: 'preset',
        fontAwesomeClass: 'fas fa-toolbox',
        iconColor: '#10b981',
        iconBgColor: '#d1fae5',
        sites: [
            {
                id: 'common-tools-1',
                name: 'Google Docs',
                desc: 'Online document editor',
                internalUrl: 'https://docs.google.com',
                externalUrl: 'https://docs.google.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-google',
                iconColor: '#6b7280',
                iconBgColor: '#f3f4f6'
            },
            {
                id: 'common-tools-2',
                name: 'Notion',
                desc: 'Knowledge management tool',
                internalUrl: 'https://notion.so',
                externalUrl: 'https://notion.so',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-th-large',
                iconColor: '#000',
                iconBgColor: '#f3f4f6'
            },
            {
                id: 'common-tools-3',
                name: 'Dropbox',
                desc: 'Cloud storage service',
                internalUrl: 'https://dropbox.com',
                externalUrl: 'https://dropbox.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-dropbox',
                iconColor: '#3d9ae8',
                iconBgColor: '#e6f2ff'
            },
            {
                id: 'tools-4',
                name: 'Docker',
                desc: 'Containerization platform',
                internalUrl: 'https://www.docker.com',
                externalUrl: 'https://www.docker.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-docker',
                iconColor: '#2496ed',
                iconBgColor: '#e6f2ff'
            },
            {
                id: 'common-tools-5',
                name: 'Evernote',
                desc: 'Note management tool',
                internalUrl: 'https://evernote.com',
                externalUrl: 'https://evernote.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-sticky-note',
                iconColor: '#8bc34a',
                iconBgColor: '#e8f5e9'
            }
        ]
    },
    {
        id: 'development',
        name: 'Development',
        iconMode: 'preset',
        fontAwesomeClass: 'fas fa-code',
        iconColor: '#8b5cf6',
        iconBgColor: '#ede9fe',
        sites: [
            {
                id: 'development-1',
                name: 'Stack Overflow',
                desc: 'Developer Q&A community',
                internalUrl: 'https://stackoverflow.com',
                externalUrl: 'https://stackoverflow.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-stack-overflow',
                iconColor: '#f48024',
                iconBgColor: '#fff7ed'
            },
            {
                id: 'development-2',
                name: 'Java',
                desc: 'Programming language platform',
                internalUrl: 'https://www.java.com',
                externalUrl: 'https://www.java.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-java',
                iconColor: '#007396',
                iconBgColor: '#e6f2ff'
            },
            {
                id: 'development-3',
                name: 'React',
                desc: 'JavaScript library for UI',
                internalUrl: 'https://reactjs.org',
                externalUrl: 'https://reactjs.org',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-react',
                iconColor: '#61dafb',
                iconBgColor: '#e6f7ff'
            },
            {
                id: 'development-4',
                name: 'Vue.js',
                desc: 'Frontend framework',
                internalUrl: 'https://vuejs.org',
                externalUrl: 'https://vuejs.org',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-vuejs',
                iconColor: '#42b983',
                iconBgColor: '#e0f2e9'
            },
            {
                id: 'development-5',
                name: 'GitHub Gist',
                desc: 'Code snippet sharing',
                internalUrl: 'https://gist.github.com',
                externalUrl: 'https://gist.github.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-github',
                iconColor: '#000',
                iconBgColor: '#e0f2fe'
            },
            {
                id: 'development-6',
                name: 'CodePen',
                desc: 'Frontend code playground',
                internalUrl: 'https://codepen.io',
                externalUrl: 'https://codepen.io',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-codepen',
                iconColor: '#000',
                iconBgColor: '#f3f4f6'
            },
            {
                id: 'development-7',
                name: 'JSFiddle',
                desc: 'Online code editor',
                internalUrl: 'https://jsfiddle.net',
                externalUrl: 'https://jsfiddle.net',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-code',
                iconColor: '#f7df1e',
                iconBgColor: '#fff9c4'
            },
            {
                id: 'development-8',
                name: 'W3Schools',
                desc: 'Web development tutorials',
                internalUrl: 'https://w3schools.com',
                externalUrl: 'https://w3schools.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-graduation-cap',
                iconColor: '#4a86e8',
                iconBgColor: '#e6f2ff'
            }
        ]
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        iconMode: 'preset',
        fontAwesomeClass: 'fas fa-play-circle',
        iconColor: '#ef4444',
        iconBgColor: '#fee2e2',
        sites: [
            {
                id: 'entertainment-1',
                name: 'Spotify',
                desc: 'Music streaming service',
                internalUrl: 'https://spotify.com',
                externalUrl: 'https://spotify.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-spotify',
                iconColor: '#1db954',
                iconBgColor: '#e0f2e9'
            },
            {
                id: 'entertainment-2',
                name: 'Bilibili',
                desc: 'Video sharing platform',
                internalUrl: 'https://bilibili.com',
                externalUrl: 'https://bilibili.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-bilibili',
                iconColor: '#00a1d6',
                iconBgColor: '#e6f7ff'
            }
        ]
    },
    {
        id: 'operating-systems',
        name: 'OperatingSystems',
        iconMode: 'preset',
        fontAwesomeClass: 'fas fa-desktop',
        iconColor: '#4b5563',
        iconBgColor: '#f3f4f6',
        sites: [
            {
                id: 'os-1',
                name: 'Debian',
                desc: 'Stable Linux foundation',
                internalUrl: 'https://www.debian.org',
                externalUrl: 'https://www.debian.org',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-debian',
                iconColor: '#d70a53',
                iconBgColor: '#ffe6e6'
            },
            {
                id: 'os-2',
                name: 'Ubuntu',
                desc: 'Popular Linux distribution',
                internalUrl: 'https://ubuntu.com',
                externalUrl: 'https://ubuntu.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-ubuntu',
                iconColor: '#e95420',
                iconBgColor: '#ffe8e8'
            },
            {
                id: 'os-3',
                name: 'CentOS',
                desc: 'Linux distribution for servers',
                internalUrl: 'https://centos.org',
                externalUrl: 'https://centos.org',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-centos',
                iconColor: '#262577',
                iconBgColor: '#e6e6ff'
            },
            {
                id: 'os-4',
                name: 'Fedora',
                desc: 'Linux distribution by Red Hat',
                internalUrl: 'https://fedoraproject.org',
                externalUrl: 'https://fedoraproject.org',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-fedora',
                iconColor: '#294172',
                iconBgColor: '#e6e9ff'
            }
        ]
    },
    {
        id: 'shopping',
        name: 'Shopping',
        iconMode: 'preset',
        fontAwesomeClass: 'fas fa-shopping-cart',
        iconColor: '#10b981',
        iconBgColor: '#e0f2e9',
        sites: [
            {
                id: 'shopping-1',
                name: 'Amazon',
                desc: 'Global e-commerce platform',
                internalUrl: 'https://amazon.com',
                externalUrl: 'https://amazon.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-amazon',
                iconColor: '#ff9900',
                iconBgColor: '#fff8e6'
            },
            {
                id: 'shopping-2',
                name: 'TaoBao',
                desc: 'Chinese e-commerce platform',
                internalUrl: 'https://taobao.com',
                externalUrl: 'https://taobao.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-yen-sign',
                iconColor: '#e93b3d',
                iconBgColor: '#ffe6e6'
            },
            {
                id: 'shopping-3',
                name: 'JD',
                desc: 'Chinese B2C retail platform',
                internalUrl: 'https://jd.com',
                externalUrl: 'https://jd.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-dog',
                iconColor: '#f10215',
                iconBgColor: '#ffe6e6'
            },
            {
                id: 'shopping-4',
                name: 'Ebay',
                desc: 'Global auction and shopping',
                internalUrl: 'https://ebay.com',
                externalUrl: 'https://ebay.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-ebay',
                iconColor: '#0064d2',
                iconBgColor: '#e6f2ff'
            }
        ]
    },
    {
        id: 'knowledge',
        name: 'Knowledge',
        iconMode: 'preset',
        fontAwesomeClass: 'fas fa-graduation-cap',
        iconColor: '#6b46c1',
        iconBgColor: '#f0e6ff',
        sites: [
            {
                id: 'knowledge-1',
                name: 'ZhiHu',
                desc: 'Chinese Q&A knowledge community',
                internalUrl: 'https://zhihu.com',
                externalUrl: 'https://zhihu.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-zhihu',
                iconColor: '#0084ff',
                iconBgColor: '#e6f2ff'
            },
            {
                id: 'knowledge-2',
                name: 'RedBook',
                desc: 'Lifestyle sharing & discovery',
                internalUrl: 'https://xiaohongshu.com',
                externalUrl: 'https://xiaohongshu.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-book-open',
                iconColor: '#ff2d4b',
                iconBgColor: '#ffe6e6'
            },
            {
                id: 'knowledge-3',
                name: 'DouBan',
                desc: 'Book/movie reviews & discussions',
                internalUrl: 'https://douban.com',
                externalUrl: 'https://douban.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-comments',
                iconColor: '#007722',
                iconBgColor: '#e6ffe6'
            },
            {
                id: 'knowledge-4',
                name: 'Quora',
                desc: 'International Q&A platform',
                internalUrl: 'https://quora.com',
                externalUrl: 'https://quora.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-quora',
                iconColor: '#b92b27',
                iconBgColor: '#ffe6e6'
            },
            {
                id: 'knowledge-5',
                name: 'Medium',
                desc: 'Long-form writing & ideas',
                internalUrl: 'https://medium.com',
                externalUrl: 'https://medium.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-medium',
                iconColor: '#000000',
                iconBgColor: '#e6e6e6'
            }
        ]
    },
    {
        id: 'game',
        name: 'Games',
        iconMode: 'preset',
        fontAwesomeClass: 'fas fa-gamepad',
        iconColor: '#e53e3e',
        iconBgColor: '#ffe6e6',
        sites: [
            {
                id: 'game-1',
                name: 'Minecraft',
                desc: 'Sandbox construction game',
                internalUrl: 'https://minecraft.net',
                externalUrl: 'https://minecraft.net',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-cube',
                iconColor: '#00b050',
                iconBgColor: '#e6ffe6'
            },
            {
                id: 'game-2',
                name: 'Minecraft Wiki',
                desc: 'Official Minecraft wiki',
                internalUrl: 'https://minecraft.fandom.com',
                externalUrl: 'https://minecraft.fandom.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-book-open',
                iconColor: '#4a6baf',
                iconBgColor: '#e6f2ff'
            },
            {
                id: 'game-3',
                name: 'MC Mod Wiki',
                desc: 'Chinese Minecraft mod encyclopedia',
                internalUrl: 'https://www.mcmod.cn',
                externalUrl: 'https://www.mcmod.cn',
                iconMode: 'preset',
                fontAwesomeClass: 'fas fa-book-open',
                iconColor: '#4a6baf',
                iconBgColor: '#e6f2ff'
            },
            {
                id: 'game-4',
                name: 'Steam',
                desc: 'Digital game distribution platform',
                internalUrl: 'https://store.steampowered.com',
                externalUrl: 'https://store.steampowered.com',
                iconMode: 'preset',
                fontAwesomeClass: 'fab fa-steam',
                iconColor: '#000000',
                iconBgColor: '#e6e6e6'
            }
        ]
    }
];

export async function GET(req: NextRequest) {
    const messages = await getMessage();
    const user = await getUser(req) as { userId: number } | null;
    if (!user) {
        return result.error(401, await getTranslation(messages, 'api.errors.invalidToken', 'Invalid token'));
    }
    const selectStatement = db.prepare("SELECT up.* FROM t_user_page up LEFT JOIN t_user u WHERE u.id = ?");
    const userPage = selectStatement.get(user.userId) as { page_json: string };
    return result.success({userPage: (userPage && userPage.page_json && JSON.parse(userPage.page_json)) ? userPage.page_json : JSON.stringify(defaultPage)});
}

export async function POST(req: NextRequest) {
    const messages = await getMessage();
    const user = await getUser(req) as { userId: number } | null;
    if (!user) {
        return result.error(401, await getTranslation(messages, 'api.errors.invalidToken', 'Invalid token'));
    }
    const {userPage: savePage} = await req.json()
    if (!isValidJsonArray(savePage)) {
        return result.error(400, await getTranslation(messages, 'api.errors.jsonError', 'Json error'));
    }
    const selectStatement = db.prepare("SELECT up.* FROM t_user_page up LEFT JOIN t_user u WHERE u.id = ?");
    const userPage = selectStatement.get(user.userId) as { id: number, page_json: string };
    if (!userPage) {
        // 不存在 新增
        const insertStatement = db.prepare('INSERT INTO t_user_page (user_id, page_json) VALUES (?, ?)');
        insertStatement.run(user.userId, savePage);
    } else {
        // 编辑
        const updateStatement = db.prepare('UPDATE t_user_page SET page_json = ? WHERE id = ?');
        updateStatement.run(savePage, userPage.id);
    }
    return result.success(null);
}

const isValidJsonArray = (jsonStr: string): boolean => {
    try {
        const parsed = JSON.parse(jsonStr);
        return Array.isArray(parsed) && parsed.length > 0;
    } catch (error) {
        return false; // 解析失败说明不是合法的 JSON
    }
}