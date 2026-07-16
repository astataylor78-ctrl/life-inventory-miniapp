import { defineStore } from 'pinia'
import { authApi } from '@/services/api'
import type { Session } from '@/types/models'

export const useSessionStore = defineStore('session', {
  state: (): { session: Session | null; loading: boolean; error: string } => ({
    session: null,
    loading: false,
    error: '',
  }),
  actions: {
    async login() {
      this.loading = true
      this.error = ''
      try {
        this.session = await authApi.init()
        uni.switchTab({ url: '/pages/home/index' })
      } catch (error) {
        this.error = error instanceof Error ? error.message : '登录失败'
      } finally {
        this.loading = false
      }
    },
  },
})
