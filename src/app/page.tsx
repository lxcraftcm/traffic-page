'use client';

import React, {useEffect, useState} from 'react';
import {apis} from '@/utils/RequestUtil';
import CommonLoading from "@/components/common/CommonLoading";

export default function Home() {

    const [errMessage, setErrMessage] = useState()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await apis.getUserInfo()
                window.location.href = '/home'
            } catch (error: any) {
                setErrMessage(error.message);
            }
        };

        checkAuth();
    }, []);

    return (
        <CommonLoading message={errMessage ? errMessage : 'Check auth...'}/>
    );
}
