<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { itemApi } from '@/services/api'
import { fromScaledQuantity } from '@/domain/quantity'
import type { Item } from '@/types/models'
const item = ref<Item | null>(null),
  loading = ref(true),
  error = ref('')
const id = ref('')
onLoad((q) => {
  id.value = String(q?.id || '')
})
async function load() {
  loading.value = true
  error.value = ''
  try {
    item.value = await itemApi.get(id.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}
onShow(load)
async function archive() {
  if (!item.value) return
  const c = await uni.showModal({ title: '确认归档', content: '归档后物品默认不再显示。' })
  if (c.confirm) {
    try {
      await itemApi.archive(item.value._id)
      uni.showToast({ title: '已归档', icon: 'success' })
      uni.navigateBack()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '归档失败'
    }
  }
}
const goEdit = () => {
  if (item.value) uni.navigateTo({ url: `/pages/item-edit/index?id=${item.value._id}` })
}
</script>
<template>
  <view class="page"
    ><view v-if="loading" class="card loading">正在加载物品…</view
    ><view v-else-if="error" class="card error-state"
      ><text>{{ error }}</text
      ><button class="secondary-button" @click="load">重试</button></view
    ><view v-else-if="item"
      ><view class="detail-head"
        ><view class="detail-avatar">{{ item.name.slice(0, 1) }}</view
        ><view class="page-title">{{ item.name }}</view
        ><text v-if="item.brand" class="page-subtitle">{{ item.brand }}</text
        ><view class="stock"
          ><text class="stock-number">{{ fromScaledQuantity(item.quantityScaled) }}</text
          ><text>{{ item.unit }}</text></view
        ><text class="pill">当前库存</text></view
      ><view class="detail-card"
        ><view class="detail-row"
          ><text>安全库存</text
          ><text>{{ fromScaledQuantity(item.minQuantityScaled) }} {{ item.unit }}</text></view
        ><view class="detail-row"
          ><text>目标库存</text
          ><text>{{
            item.targetQuantityScaled === null
              ? '未设置'
              : fromScaledQuantity(item.targetQuantityScaled) + ' ' + item.unit
          }}</text></view
        ><view class="detail-row"
          ><text>品牌</text><text>{{ item.brand || '未填写' }}</text></view
        ><view class="detail-note"
          ><text>备注</text><text>{{ item.note || '暂无备注' }}</text></view
        ></view
      ><button class="primary-button" @click="goEdit">编辑物品</button
      ><button class="secondary-button danger-button" @click="archive">归档物品</button></view
    ></view
  >
</template>
<style scoped>
.loading,
.error-state {
  text-align: center;
}
.detail-head {
  text-align: center;
  padding: 24rpx 0 42rpx;
}
.detail-avatar {
  width: 132rpx;
  height: 132rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24rpx;
  border-radius: 40rpx;
  background: #e8f3ed;
  color: #276749;
  font-size: 52rpx;
  font-weight: 700;
}
.stock {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8rpx;
  margin: 28rpx 0 10rpx;
  color: #276749;
}
.stock-number {
  font-size: 70rpx;
  font-weight: 700;
}
.detail-card {
  overflow: hidden;
  border-radius: 28rpx;
  background: #fff;
  box-shadow: 0 10rpx 30rpx rgba(35, 61, 47, 0.05);
}
.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 30rpx;
  padding: 26rpx;
  border-bottom: 1rpx solid #edf0ee;
}
.detail-row text:first-child,
.detail-note text:first-child {
  color: #7d8982;
}
.detail-note {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  padding: 26rpx;
}
.detail-note text:last-child {
  line-height: 1.7;
}
</style>
