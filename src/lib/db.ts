import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import {fileURLToPath} from 'url';
import Database from 'better-sqlite3';
import {logger} from "@/lib/logger";

// 设置路径解析
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({path: path.join(__dirname, '../.env')});

// 数据库配置类型
type DbConfig = {
    path: string;
    initScript?: string;
};

// 初始化数据库并执行初始化脚本
export const initDatabase = (config: DbConfig) => {
    logger.log("initDatabase", config)
    // 创建数据库连接
    const db = new Database(config.path, {
        verbose: console.log,
        timeout: 5000,
    });

    // 执行初始化脚本
    const executeInitScript = (scriptPath: string) => {
        if (!fs.existsSync(scriptPath)) {
            logger.warn(`警告: 初始化脚本不存在 - ${scriptPath}`);
            return;
        }

        const script = fs.readFileSync(scriptPath, 'utf-8');
        try {
            db.exec(script);
            logger.log(`初始化脚本已执行:`, scriptPath);
        } catch (error: any) {
            logger.error(`初始化脚本执行失败: ${error.message}`);
            throw error;
        }
    };

    // 检查表是否存在
    const checkTableExists = (tableName: string): boolean => {
        const result = db.prepare(
            "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?"
        ).get(tableName) as { 'COUNT(*)': number };
        return result['COUNT(*)'] > 0;
    };

    // 如果配置了初始化脚本且表不存在，则执行脚本
    if (config.initScript && !checkTableExists('t_user')) {
        executeInitScript(config.initScript);
    }

    return db;
};

// 获取数据库路径
const getDbPath = (): string => {
    const envPath = process.env.DATABASE_URL;
    return envPath || path.join(__dirname, '../dev.db');
};

// 数据库初始化配置
const dbConfig: DbConfig = {
    path: getDbPath(),
    initScript: process.env.INIT_SCRIPT_PATH || path.join(__dirname, '../init.sql'),
};

// 初始化数据库
const db = initDatabase(dbConfig);

// 返回数据库对象
export default db;