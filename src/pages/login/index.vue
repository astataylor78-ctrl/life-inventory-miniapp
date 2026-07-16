<script setup lang="ts">
import { ref } from 'vue'
import { useSessionStore } from '@/stores/session'
import { saveCloudEnv } from '@/services/cloud'
const session = useSessionStore()
const env = ref(uni.getStorageSync<string>('cloudEnvId') || '')
const showConfig = ref(false)
const saveEnv = () => {
  saveCloudEnv(env.value)
  uni.showToast({ title: '环境已保存', icon: 'success' })
}
const showPrivacy = () =>
  uni.showModal({
    title: '隐私说明',
    content: '仅收集微信身份标识及你主动录入的家庭物品数据，用于提供个人库存管理服务。',
    showCancel: false,
  })
const showAgreement = () =>
  uni.showModal({
    title: '用户协议',
    content: '本工具仅供个人管理生活物品使用。请勿录入密码、证件号码等敏感信息。',
    showCancel: false,
  })
</script>
<template>
  <view class="page"
    ><view class="card hero"
      ><view class="title">生活物品管家</view
      ><text class="muted">记录家中物品，减少重复购买和寻找时间。</text
      ><button class="btn" :loading="session.loading" @click="session.login">微信登录</button
      ><text class="config-link" @click="showConfig = !showConfig">首次配置云环境</text
      ><view v-if="showConfig"
        ><input v-model="env" class="field" password placeholder="输入云开发环境 ID" /><button
          size="mini"
          @click="saveEnv"
        >
          保存
        </button></view
      ><view v-if="session.error" class="error">{{ session.error }}</view
      ><text class="privacy">登录仅用于隔离你的家庭数据，不会公开个人信息。</text
      ><view class="links"
        ><text @click="showPrivacy">隐私说明</text
        ><text @click="showAgreement">用户协议</text></view
      ></view
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
.links {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  margin-top: 20rpx;
  color: #287a4d;
  font-size: 24rpx;
}
.config-link {
  display: block;
  text-align: center;
  margin-top: 24rpx;
  color: #738078;
  font-size: 24rpx;
}
</style>
