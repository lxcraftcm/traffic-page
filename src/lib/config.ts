import crypto from 'crypto';

/**
 * JWT 密钥配置
 * 优先使用环境变量，如果未设置则自动生成一个随机密钥存储在内存中
 * 密钥在进程生命周期内保持不变
 */

const generateSecretKey = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

// 使用 globalThis 确保密钥在进程生命周期内只生成一次
// globalThis 在所有 JavaScript 环境中都可用
const getOrGenerateSecret = (): string => {
  // 首先尝试环境变量
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  // 如果没有环境变量，生成并缓存在 globalThis 中
  const globalCache = globalThis as typeof globalThis & { _jwtSecret?: string };

  if (!globalCache._jwtSecret) {
    globalCache._jwtSecret = generateSecretKey();
    console.warn('⚠️  JWT_SECRET not configured in environment variables');
    console.warn('⚠️  Using auto-generated secret key (will change on restart)');
    console.warn('⚠️  Set JWT_SECRET in environment for persistent sessions');
    console.warn('✅ Auto-generated JWT_SECRET loaded successfully');
  }

  return globalCache._jwtSecret;
};

export const JWT_SECRET = getOrGenerateSecret();