import db from "@/lib/db";
import {result} from "@/utils/ApiUtil";

export async function GET() {
    const user = db.prepare('select * from t_user where deleted_at is null').all()
    return result.success({
        initialized: (user && user.length > 0)
    });
}