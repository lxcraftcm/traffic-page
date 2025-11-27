import {NextResponse} from "next/server";

export const result = {
    success: (data: any) => {
        return NextResponse.json({...data}, {status: 200});
    },

    error: (status: number, message: string) => {
        return NextResponse.json({error: message}, {status: status});
    }
}

const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}