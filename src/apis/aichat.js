import httpDeepInstance from '@/utils/index.js'

export const goChatAPI = (data) => {
    return httpDeepInstance({
        url: '/compatible-mode/v1/chat/completions',
        method: 'POST',
        data
    })
}