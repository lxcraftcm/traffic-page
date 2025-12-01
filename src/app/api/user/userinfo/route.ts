import db from "@/lib/db";
import {result} from "@/utils/ApiUtil";

export async function GET() {
    const user = db.prepare('select * from t_user where 1 = 1').all()
    return result.success(user);
}