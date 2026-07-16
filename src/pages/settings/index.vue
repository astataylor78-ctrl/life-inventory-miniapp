<script setup lang="ts">
import { ref } from 'vue'
import { saveCloudEnv } from '@/services/cloud'
const env = ref(uni.getStorageSync<string>('cloudEnvId') || '')
function save() {
  saveCloudEnv(env.value)
  uni.showToast({ title: '已保存', icon: 'success' })
}
const goCategories = () => uni.navigateTo({ url: '/pages/categories/index' })
const goLocations = () => uni.navigateTo({ url: '/pages/locations/index' })
</script>
<template>
  <view class="page"
    ><view class="page-title">我的</view><text class="page-subtitle">管理家庭空间和基础资料</text
    ><view class="profile-card"
      ><view class="profile-avatar">家</view
      ><view
        ><text class="profile-title">我的家</text
        ><text class="profile-subtitle">个人家庭空间</text></view
      ></view
    ><text class="group-label">内容管理</text
    ><view class="menu-card"
      ><view class="menu-row" @click="goCategories"
        ><view class="menu-icon">类</view
        ><view class="menu-copy"><text>分类管理</text><text>整理食品、清洁用品等分类</text></view
        ><text class="chevron">›</text></view
      ><view class="menu-row" @click="goLocations"
        ><view class="menu-icon">位</view
        ><view class="menu-copy"><text>位置管理</text><text>设置房间、柜子和抽屉层级</text></view
        ><text class="chevron">›</text></view
      ></view
    ><text class="group-label">云服务</text
    ><view class="card config"
      ><view class="row"
        ><view
          ><text class="config-title">云开发环境</text
          ><text class="config-tip">环境 ID 只保存在当前设备</text></view
        ><view class="pill">已保护</view></view
      ><input v-model="env" class="field" password placeholder="输入云开发环境 ID" /><button
        class="secondary-button"
        @click="save"
      >
        保存环境配置
      </button></view
    ><text class="coming-soon">库存流水、补货、保质期和数据导出将在后续里程碑提供。</text></view
  >
</template>
<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin: 38rpx 0;
  padding: 30rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #276749, #3d7f60);
  color: #fff;
}
.profile-avatar {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.17);
  font-size: 36rpx;
  font-weight: 700;
}
.profile-title,
.profile-subtitle {
  display: block;
}
.profile-title {
  font-size: 34rpx;
  font-weight: 650;
}
.profile-subtitle {
  margin-top: 8rpx;
  opacity: 0.75;
  font-size: 24rpx;
}
.group-label {
  display: block;
  margin: 34rpx 6rpx 14rpx;
  color: #78847d;
  font-size: 24rpx;
}
.menu-card {
  overflow: hidden;
  border-radius: 28rpx;
  background: #fff;
  box-shadow: 0 10rpx 30rpx rgba(35, 61, 47, 0.05);
}
.menu-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 26rpx;
  border-bottom: 1rpx solid #edf0ee;
}
.menu-row:last-child {
  border-bottom: 0;
}
.menu-icon {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
  background: #e8f3ed;
  color: #276749;
  font-weight: 700;
}
.menu-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.menu-copy text:first-child,
.config-title {
  font-weight: 600;
}
.menu-copy text:last-child,
.config-tip {
  color: #849089;
  font-size: 23rpx;
}
.config-title,
.config-tip {
  display: block;
}
.config .field {
  margin-top: 24rpx;
}
.coming-soon {
  display: block;
  padding: 18rpx;
  color: #89948e;
  font-size: 23rpx;
  line-height: 1.6;
}
</style>
