<script setup lang="ts">
import { useSessionStore } from '@/stores/session'
const session = useSessionStore()
</script>
<template>
  <view class="page"
    ><view class="card hero"
      ><view class="title">生活物品管家</view
      ><text class="muted">记录家中物品，减少重复购买和寻找时间。</text
      ><button class="btn" :loading="session.loading" @click="session.login">微信登录</button
      ><view v-if="session.error" class="error">{{ session.error }}</view
      ><text class="privacy">登录仅用于隔离你的家庭数据，不会公开个人信息。</text></view
    ></view
  >
</template>
<style scoped>
.hero {
  margin-top: 20vh;
}
.privacy {
  display: block;
  font-size: 24rpx;
  color: #87928b;
  margin-top: 30rpx;
}
</style>
