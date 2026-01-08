import {NextRequest} from 'next/server';
import db from "@/lib/db";
import {result} from "@/utils/ApiUtil";
import {getTranslation} from '@/lib/i18n';
import {logger} from "@/lib/logger";

export async function GET(req: NextRequest) {
    const userId = req.headers.get('X-User-ID');
    logger.info(`req user: ${userId}`);
    if (!userId) {
        return result.error(401, await getTranslation(req, 'api.errors.invalidToken', 'Invalid token'));
    }
    try {
        const user = db.prepare('select id, email, username from t_user where id = ?').get(userId);
        logger.info(`user: ${JSON.stringify(user)}`);
        if (!user) {
            return result.error(401, await getTranslation(req, 'api.errors.invalidToken', 'Invalid token'));
        }

        return result.success({user});
    } catch (error: any) {
        return result.error(500, `${await getTranslation(req, 'api.errors.internalServerError', 'Internal server error')} + ${error.message}`);
    }
}