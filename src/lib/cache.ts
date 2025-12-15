import NodeCache from 'node-cache';
import {createHash} from 'crypto'; // 使用 ES6 import

// 单例封装
export class DBCache {
    private static instance: DBCache;
    private cache: NodeCache;

    private constructor() {
        this.cache = new NodeCache({
            stdTTL: 300, // 默认5分钟（秒）
            checkperiod: 60, // 定期检查过期（秒）
            useClones: false, // 禁用克隆，提高性能
            deleteOnExpire: true,
        });

        // 统计信息
        this.cache.on('expired', (key: string) => {
            console.log(`[Cache] Expired: ${key}`);
        });
    }

    static getInstance(): DBCache {
        if (!DBCache.instance) {
            DBCache.instance = new DBCache();
        }
        return DBCache.instance;
    }

    // 生成查询的缓存键
    private generateKey(query: string, params?: any): string {
        const paramsStr = params ? JSON.stringify(params) : '';
        const hash = createHash('md5')
            .update(query + paramsStr)
            .digest('hex');
        return `sql:${hash}`;
    }

    // 获取或设置
    async getOrSet<T>(
        query: string,
        params: any,
        fetchFn: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        const key = this.generateKey(query, params);

        // 尝试获取缓存
        const cached = this.cache.get<T>(key);
        if (cached !== undefined) {
            return cached;
        }

        // 执行查询
        const result = await fetchFn();

        // 设置缓存
        this.cache.set(key, result, ttl || 300);

        return result;
    }

    // 手动管理
    set<T>(key: string, value: T, ttl: number): boolean {
        return this.cache.set(key, value, ttl);
    }

    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    del(key: string): number {
        return this.cache.del(key);
    }

    // 按模式删除
    delByPattern(pattern: string): number {
        const keys = this.cache.keys();
        const matchingKeys = keys.filter((key: string) => key.includes(pattern));
        return this.cache.del(matchingKeys);
    }

    // 获取统计
    getStats() {
        const stats = this.cache.getStats();
        return {
            hits: stats.hits,
            misses: stats.misses,
            keys: stats.keys,
            ksize: stats.ksize,
            vsize: stats.vsize,
        };
    }
}

// 导出单例实例
export const dbCache = DBCache.getInstance();