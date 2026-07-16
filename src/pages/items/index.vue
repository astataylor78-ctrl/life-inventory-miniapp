<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { categoryApi, itemApi, locationApi } from '@/services/api'
import { fromScaledQuantity } from '@/domain/quantity'
import type { Category, Item, Location } from '@/types/models'

const items = ref<Item[]>([])
const categories = ref<Category[]>([])
const locations = ref<Location[]>([])
const keyword = ref('')
const categoryId = ref('')
const locationId = ref('')
const sort = ref('updated')
const sorts = ['最近更新', '名称', '库存从低到高']
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await itemApi.list({
      keyword: keyword.value,
      categoryId: categoryId.value,
      locationId: locationId.value,
      sort: sort.value,
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}
onShow(async () => {
  ;[categories.value, locations.value] = await Promise.all([categoryApi.list(), locationApi.list()])
  await load()
})
function selectCategory(index: number) {
  categoryId.value = categories.value[index]?._id || ''
  load()
}
function selectLocation(index: number) {
  locationId.value = locations.value[index]?._id || ''
  load()
}
function selectSort(index: number) {
  sort.value = ['updated', 'name', 'quantity'][index] || 'updated'
  load()
}
const goDetail = (id: string) => uni.navigateTo({ url: `/pages/item-detail/index?id=${id}` })
const goAdd = () => uni.navigateTo({ url: '/pages/item-edit/index' })
</script>
<template>
  <view class="page">
    <view class="row"
      ><input
        v-model="keyword"
        class="field"
        placeholder="搜索名称、品牌或备注"
        confirm-type="search"
        @confirm="load"
      /><button size="mini" @click="load">搜索</button></view
    >
    <view class="row filters"
      ><picker
        :range="categories"
        range-key="name"
        @change="selectCategory(Number($event.detail.value))"
        ><text>分类筛选</text></picker
      ><picker
        :range="locations"
        range-key="name"
        @change="selectLocation(Number($event.detail.value))"
        ><text>位置筛选</text></picker
      ><picker :range="sorts" @change="selectSort(Number($event.detail.value))"
        ><text>排序</text></picker
      ></view
    >
    <view v-if="loading" class="muted">正在加载…</view
    ><view v-else-if="error" class="error">{{ error }}</view
    ><view v-else-if="!items.length" class="card muted">没有找到物品</view>
    <view v-for="item in items" v-else :key="item._id" class="card" @click="goDetail(item._id)"
      ><view class="row"
        ><view
          ><view>{{ item.name }}</view
          ><text class="muted">{{ item.brand || '未填写品牌' }}</text></view
        ><text>{{ fromScaledQuantity(item.quantityScaled) }} {{ item.unit }}</text></view
      ></view
    >
    <button class="btn add" @click="goAdd">＋ 新增物品</button>
  </view>
</template>
<style scoped>
.field {
  flex: 1;
}
.filters {
  padding: 0 12rpx 24rpx;
  color: #287a4d;
}
.add {
  position: fixed;
  right: 30rpx;
  bottom: 130rpx;
}
</style>
