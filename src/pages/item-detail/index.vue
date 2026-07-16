<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { itemApi } from '@/services/api'
import { fromScaledQuantity } from '@/domain/quantity'
import type { Item } from '@/types/models'
const item = ref<Item | null>(null),
  loading = ref(true),
  error = ref('')
onLoad(async (q) => {
  try {
    item.value = await itemApi.get(String(q?.id || ''))
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
})
async function archive() {
  if (!item.value) return
  const c = await uni.showModal({ title: '确认归档', content: '归档后物品默认不再显示。' })
  if (c.confirm) {
    await itemApi.archive(item.value._id)
    uni.navigateBack()
  }
}
const goEdit = () => {
  if (item.value) uni.navigateTo({ url: `/pages/item-edit/index?id=${item.value._id}` })
}
</script>
<template>
  <view class="page"
    ><view v-if="loading" class="muted">正在加载…</view
    ><view v-else-if="error" class="error">{{ error }}</view
    ><view v-else-if="item"
      ><view class="title">{{ item.name }}</view
      ><view class="card"
        ><view>当前库存：{{ fromScaledQuantity(item.quantityScaled) }} {{ item.unit }}</view
        ><view>安全库存：{{ fromScaledQuantity(item.minQuantityScaled) }} {{ item.unit }}</view
        ><view>品牌：{{ item.brand || '未填写' }}</view
        ><view>备注：{{ item.note || '无' }}</view></view
      ><button class="btn" @click="goEdit">编辑</button
      ><button class="btn-secondary" @click="archive">归档</button></view
    ></view
  >
</template>
