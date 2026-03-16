import axios from "axios";

const httpDeepInstance = axios.create({
    baseURL: '/api',
    timeout: 30000,
})

// 添加请求拦截器
httpDeepInstance.interceptors.request.use(function (config) {
    config.headers.Authorization = `Bearer ${import.meta.env.VITE_DEEPSEEK_KEY}`

    return config;
}, function (error) {
    return Promise.reject(error);
});

// 添加响应拦截器
httpDeepInstance.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default httpDeepInstance