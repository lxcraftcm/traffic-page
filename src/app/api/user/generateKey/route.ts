import {result} from "@/utils/ApiUtil";
import {getKeyPair} from "@/utils/CryptoUtil";

export async function GET() {
    return result.success(getKeyPair());
}