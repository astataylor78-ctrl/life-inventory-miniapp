<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { itemApi } from '@/services/api'
import { useSessionStore } from '@/stores/session'
import type { Item } from '@/types/models'
const items = ref<Item[]>([]),
  loading = ref(false),
  error = ref('')
const session = useSessionStore()
async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await itemApi.list({})
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}
onShow(async () => {
  if (await session.ensure()) await load()
  else error.value = session.error
})
const goAdd = () => uni.navigateTo({ url: '/pages/item-edit/index' })
const goItems = () => uni.switchTab({ url: '/pages/items/index' })
const goDetail = (id: string) => uni.navigateTo({ url: `/pages/item-detail/index?id=${id}` })
</script>
<template>
  <view class="page"
    ><view class="home-heading"
      ><view
        ><view class="page-title">我的家</view
        ><text class="page-subtitle">把生活里的每一件东西，都安放得刚刚好</text></view
      ><view class="home-badge">家</view></view
    ><view v-if="loading" class="card loading-card"
      ><view class="loading-dot" /><text>正在整理物品…</text></view
    ><view v-else-if="error" class="card error-state"
      ><text>{{ error }}</text
      ><button class="secondary-button" @click="load">重新加载</button></view
    ><view v-else-if="!items.length" class="card empty-state"
      ><view class="empty-mark">＋</view><view class="empty-title">还没有物品</view
      ><text class="empty-copy">从纸巾、洗衣液或常用食品开始，建立你的第一份家庭清单。</text
      ><button class="primary-button" @click="goAdd">添加第一件物品</button></view
    ><template v-else
      ><view class="overview-card"
        ><view
          ><text class="overview-label">已整理物品</text
          ><view
            ><text class="overview-number">{{ items.length }}</text
            ><text class="overview-unit"> 件</text></view
          ></view
        ><button class="overview-add" @click="goAdd">＋</button></view
      ><view class="section-head"
        ><text class="section-title">最近更新</text
        ><text class="text-button" @click="goItems">查看全部</text></view
      ><view class="item-list"
        ><view
          v-for="item in items.slice(0, 5)"
          :key="item._id"
          class="item-row"
          @click="goDetail(item._id)"
          ><view class="item-avatar">{{ item.name.slice(0, 1) }}</view
          ><view class="item-copy"
            ><text class="item-name">{{ item.name }}</text
            ><text class="item-meta">刚刚更新</text></view
          ><text class="chevron">›</text></view
        ></view
      ></template
    ></view
  >
</template>
<style scoped>
.home-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 34rpx;
}
.home-badge {
  width: 76rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  background: #e8f3ed;
  color: #276749;
  font-weight: 700;
}
.loading-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  color: #718078;
}
.loading-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #276749;
}
.error-state {
  text-align: center;
}
.overview-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 34rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #276749, #3d7f60);
  color: #fff;
  box-shadow: 0 18rpx 40rpx rgba(39, 103, 73, 0.2);
}
.overview-label {
  opacity: 0.78;
}
.overview-number {
  font-size: 64rpx;
  font-weight: 700;
}
.overview-unit {
  opacity: 0.8;
}
.overview-add {
  width: 88rpx;
  height: 88rpx;
  margin: 0;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 44rpx;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 38rpx 4rpx 18rpx;
}
.item-list {
  overflow: hidden;
  border-radius: 28rpx;
  background: #fff;
  box-shadow: 0 10rpx 30rpx rgba(35, 61, 47, 0.05);
}
.item-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  border-bottom: 1rpx solid #edf0ee;
}
.item-row:last-child {
  border-bottom: 0;
}
.item-avatar {
  width: 76rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
  background: #edf6f1;
  color: #276749;
  font-weight: 700;
}
.item-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}
.item-name {
  font-weight: 600;
}
.item-meta {
  font-size: 23rpx;
  color: #87938d;
}
</style>
