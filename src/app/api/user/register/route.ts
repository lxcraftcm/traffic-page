import {NextRequest} from "next/server";
import {result} from "@/utils/ApiUtil";
import db from "@/lib/db";
import bcrypt from 'bcryptjs';
import {decryptedRsa} from "@/utils/CryptoUtil";

interface User {
    id: string;
    email: string;
    password: string;
    name: string;
}

const saltRounds = 12;

// 注册接口
export async function POST(
    req: NextRequest
) {
    const {keyId, username, password} = await req.json()
    try {
        const decryptedPsw = decryptedRsa(keyId, password);
        if (!decryptedPsw) {
            return result.error(403, 'Invalid credentials');
        }
        const hashedPassword = await bcrypt.hash(decryptedPsw, saltRounds);
        const stmt = db.prepare('INSERT INTO t_user (username, credentials) VALUES (?, ?)');
        stmt.run(username, hashedPassword);
        return result.success("")
    } catch (error: any) {
        return result.error(500, 'Internal server error: ' + error.message);
    }
}