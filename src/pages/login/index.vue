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
  <view class="login-page"
    ><view class="brand-mark">家</view><view class="page-title">生活物品管家</view
    ><text class="login-copy">清楚知道家里有什么、放在哪里、还剩多少。</text
    ><view class="feature-row"
      ><view><text class="feature-number">01</text><text>减少重复购买</text></view
      ><view><text class="feature-number">02</text><text>快速找到物品</text></view
      ><view><text class="feature-number">03</text><text>掌握家庭库存</text></view></view
    ><button class="primary-button login-button" :loading="session.loading" @click="session.login">
      微信一键登录</button
    ><view v-if="session.error" class="error">{{ session.error }}</view
    ><text class="config-link" @click="showConfig = !showConfig">{{
      showConfig ? '收起环境配置' : '首次使用？配置云环境'
    }}</text
    ><view v-if="showConfig" class="config-card"
      ><text class="form-label">云开发环境 ID</text
      ><input v-model="env" class="field" password placeholder="输入后仅保存在本机" /><button
        class="secondary-button"
        @click="saveEnv"
      >
        保存配置
      </button></view
    ><text class="privacy">登录即表示你同意以下条款，数据仅用于个人家庭物品管理。</text
    ><view class="links"
      ><text @click="showPrivacy">隐私说明</text><text>·</text
      ><text @click="showAgreement">用户协议</text></view
    ></view
  >
</template>
<style scoped>
.login-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 14vh 42rpx 60rpx;
  background: linear-gradient(180deg, #edf5f0 0, #f7f5ef 48%);
}
.brand-mark {
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 34rpx;
  border-radius: 30rpx;
  background: #276749;
  color: #fff;
  font-size: 42rpx;
  font-weight: 700;
  box-shadow: 0 18rpx 35rpx rgba(39, 103, 73, 0.22);
}
.login-copy {
  display: block;
  margin-top: 18rpx;
  color: #637169;
  font-size: 30rpx;
  line-height: 1.65;
}
.feature-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin: 50rpx 0;
}
.feature-row view {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 22rpx 14rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.72);
  color: #536159;
  font-size: 23rpx;
}
.feature-number {
  color: #276749;
  font-weight: 700;
}
.login-button {
  margin-top: 20rpx;
}
.config-link,
.privacy {
  display: block;
  text-align: center;
  margin-top: 24rpx;
  color: #77847d;
  font-size: 23rpx;
}
.config-card {
  margin-top: 22rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: #fff;
}
.links {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-top: 16rpx;
  color: #276749;
  font-size: 23rpx;
}
</style>
