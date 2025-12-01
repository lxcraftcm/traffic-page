import crypto from "crypto";
import db from "@/lib/db";
import forge from 'node-forge';
import {formatDateTime} from "@/utils/DateUtil";
import {logger} from "@/lib/logger";

// 密钥有效期
const CACHE_TTL = 20000;

// 获取密钥key和id 不存在或者过期将重新生成
export const getKeyPair = () => {
    const selectStatement = db.prepare('SELECT * FROM t_rsa_info WHERE deleted_at IS NULL ORDER BY created_at DESC');
    const rsaInfo = selectStatement.get() as { id: any, public_key: any, private_key: any, created_at: any };
    if (rsaInfo && !checkTimeExceeded(rsaInfo['created_at'])) {
        return {keyId: rsaInfo['id'], publicKey: rsaInfo['public_key']};
    }
    return generateKeyPair();
}

// 生成rsa非对称密钥 返回密钥key和id
export const generateKeyPair = () => {
    const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });

    // 存入数据库
    const insertStatement = db.prepare('INSERT INTO t_rsa_info (public_key, private_key) VALUES (?, ?)');
    const result = insertStatement.run(publicKey, privateKey)
    setTimeout(() => {
        // 更新数据
        const updateStatement = db.prepare('UPDATE t_rsa_info SET deleted_at = ? WHERE deleted_at IS NULL');
        updateStatement.run(formatDateTime(new Date()));
    }, CACHE_TTL)
    // 返回id和publicKey
    return {keyId: result.lastInsertRowid, publicKey};
}

// 根据密钥id查询rsa非对称密钥 解密
export const decryptedRsa = (keyId: string, encrypted: string) => {
    // 查询
    const selectStatement = db.prepare('SELECT * FROM t_rsa_info WHERE deleted_at IS NULL AND id = ?');
    const rsaInfo = selectStatement.get(keyId) as { id: any, public_key: any, private_key: any, created_at: any };
    if (!rsaInfo || checkTimeExceeded(rsaInfo['created_at'])) {
        return null;
    }
    const privateKey = rsaInfo['private_key'];
    try {
        const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
        const decoded = forge.util.decode64(encrypted);
        return privateKeyObj.decrypt(decoded, 'RSA-OAEP');
    } catch (error) {
        logger.error('Decryption failed:', error);
        return null;
    }
}

// 检查密钥是否过期
const checkTimeExceeded = (timeString: string) => {
    const time = new Date(timeString + ".000Z");
    if (isNaN(time.getTime())) {
        logger.error(`Invalid time string provided: "${timeString}"`);
        // 无效的时间
        return false;
    }
    const now = new Date();
    const timeDifference = now.getTime() - time.getTime();
    return timeDifference > CACHE_TTL;
}