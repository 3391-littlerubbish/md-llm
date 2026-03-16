import { createRouter, createWebHistory } from 'vue-router'

import Home from "@/views/Home/index.vue"
import Markdown from "@/views/Markdown/index.vue"
import LlmChat from "@/views/LlmChat/index.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/markdown',
      component: Markdown,
      // children: [
      //   {
      //     path: 'llmchat',
      //     component: LlmChat
      //   }
      // ]
    },
  ],
})

export default router
