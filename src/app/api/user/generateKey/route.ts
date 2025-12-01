import {result} from "@/app/api/common/route";
import {getKeyPair} from "@/utils/CryptoUtil";

export async function GET() {
    return result.success(getKeyPair());
}