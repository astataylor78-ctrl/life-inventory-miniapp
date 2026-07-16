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
    ><view class="title">我的</view><view class="card" @click="goCategories">分类管理</view
    ><view class="card" @click="goLocations">位置管理</view
    ><view class="card"
      ><view>云开发环境</view
      ><input
        v-model="env"
        class="field"
        password
        placeholder="仅保存在本机，不会提交到仓库"
      /><button class="btn" size="mini" @click="save">保存环境 ID</button></view
    ><view class="muted">库存流水、补货、保质期和数据导出将在后续里程碑提供。</view></view
  >
</template>
