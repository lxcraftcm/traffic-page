import axios, {AxiosRequestConfig} from 'axios';
import {getToken, removeToken} from '@/lib/auth';

// 创建 axios 实例
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// 请求拦截器：自动添加 Authorization 头
api.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error.response.data)
);

// 响应拦截器：处理 401 错误
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            removeToken();
            // 客户端路由跳转
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            // 服务器端返回 401 响应
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error.response.data);
    }
);

// 统一请求方法
const requestUtil = (config: AxiosRequestConfig): Promise<any> => {
    return api(config).then(({data}) => data);
};

// API 调用
export const apis = {
    getUserInfo: () => {
        return requestUtil({url: '/api/user/userinfo', method: 'GET'});
    },
    login: (data: any) => {
        return requestUtil({
            url: '/api/user/login',
            method: 'POST',
            responseType: 'json',
            data: JSON.stringify(data)
        });
    },
    register: (data: any) => {
        return requestUtil({
            url: '/api/user/register',
            method: 'POST',
            responseType: 'json',
            data: JSON.stringify(data)
        });
    },
    checkSystemInit: () => {
        return requestUtil({url: '/api/user/checkSystemInit', method: 'GET'});
    },
    generateKey: () => {
        return requestUtil({url: '/api/user/generateKey', method: 'GET'});
    },
    getUserPage: () => {
        return requestUtil({url: '/api/user/page', method: 'GET'});
    },
    saveUserPage: (data: any) => {
        return requestUtil({url: '/api/user/page', method: 'POST', data: JSON.stringify(data)});
    }
}