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
    async ensure() {
      if (this.session) return true
      this.loading = true
      this.error = ''
      try {
        this.session = await authApi.init()
        return true
      } catch (error) {
        this.error = error instanceof Error ? error.message : '登录失败'
        return false
      } finally {
        this.loading = false
      }
    },
    async login() {
      this.loading = true
      this.error = ''
      try {
        if (await this.ensure()) uni.switchTab({ url: '/pages/home/index' })
      } catch (error) {
        this.error = error instanceof Error ? error.message : '登录失败'
      } finally {
        this.loading = false
      }
    },
  },
})
