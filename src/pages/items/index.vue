<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { categoryApi, itemApi, locationApi } from '@/services/api'
import { fromScaledQuantity } from '@/domain/quantity'
import type { Category, Item, Location } from '@/types/models'
import { useSessionStore } from '@/stores/session'

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
const catalogError = ref('')
const session = useSessionStore()

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
  if (!(await session.ensure())) {
    error.value = session.error
    return
  }
  const pendingLocation = uni.getStorageSync<string>('pendingLocationFilter')
  if (pendingLocation) {
    locationId.value = pendingLocation
    uni.removeStorageSync('pendingLocationFilter')
  }
  catalogError.value = ''
  try {
    ;[categories.value, locations.value] = await Promise.all([
      categoryApi.list(),
      locationApi.list(),
    ])
    await load()
  } catch (e) {
    catalogError.value = e instanceof Error ? e.message : '筛选条件加载失败'
  }
})
function selectCategory(index: number) {
  categoryId.value = index === 0 ? '' : categories.value[index - 1]?._id || ''
  load()
}
function selectLocation(index: number) {
  locationId.value = index === 0 ? '' : locations.value[index - 1]?._id || ''
  load()
}
function selectSort(index: number) {
  sort.value = ['updated', 'name', 'quantity'][index] || 'updated'
  load()
}
const goDetail = (id: string) => uni.navigateTo({ url: `/pages/item-detail/index?id=${id}` })
const goAdd = () => uni.navigateTo({ url: '/pages/item-edit/index' })
const categoryOptions = () => ['全部分类', ...categories.value.map((item) => item.name)]
const locationOptions = () => ['全部位置', ...locations.value.map((item) => item.name)]
const categoryLabel = () =>
  categories.value.find((item) => item._id === categoryId.value)?.name || '全部分类'
const locationLabel = () =>
  locations.value.find((item) => item._id === locationId.value)?.name || '全部位置'
function clearFilters() {
  keyword.value = ''
  categoryId.value = ''
  locationId.value = ''
  sort.value = 'updated'
  load()
}
</script>
<template>
  <view class="page"
    ><view class="page-title">全部物品</view
    ><text class="page-subtitle">随时查看家里有什么、放在哪里</text
    ><view class="search-box"
      ><text class="search-mark">⌕</text
      ><input
        v-model="keyword"
        placeholder="搜索名称、品牌或备注"
        confirm-type="search"
        @confirm="load"
      /><button @click="load">搜索</button></view
    ><scroll-view class="filter-scroll" scroll-x
      ><view class="filters"
        ><picker :range="categoryOptions()" @change="selectCategory(Number($event.detail.value))"
          ><view class="filter-pill">{{ categoryLabel() }}⌄</view></picker
        ><picker :range="locationOptions()" @change="selectLocation(Number($event.detail.value))"
          ><view class="filter-pill">{{ locationLabel() }}⌄</view></picker
        ><picker :range="sorts" @change="selectSort(Number($event.detail.value))"
          ><view class="filter-pill">排序⌄</view></picker
        ><view v-if="keyword || categoryId || locationId" class="clear-pill" @click="clearFilters"
          >清除</view
        ></view
      ></scroll-view
    ><view v-if="catalogError" class="card error-state"
      ><text>{{ catalogError }}</text
      ><button class="secondary-button" @click="clearFilters">重试</button></view
    ><view v-if="loading" class="loading-list"
      ><view v-for="i in 3" :key="i" class="skeleton" /></view
    ><view v-else-if="error" class="card error-state"
      ><text>{{ error }}</text
      ><button class="secondary-button" @click="load">重新加载</button></view
    ><view v-else-if="!items.length" class="card empty-state"
      ><view class="empty-mark">⌕</view><view class="empty-title">没有找到物品</view
      ><text class="empty-copy">换个关键词，或者清除筛选条件再试试。</text
      ><button class="secondary-button" @click="clearFilters">清除筛选</button></view
    ><view v-else class="item-list"
      ><view class="result-count">{{ items.length }} 件物品</view
      ><view v-for="item in items" :key="item._id" class="item-row" @click="goDetail(item._id)"
        ><view class="item-avatar">{{ item.name.slice(0, 1) }}</view
        ><view class="item-copy"
          ><text class="item-name">{{ item.name }}</text
          ><text class="item-meta">{{ item.brand || '未填写品牌' }}</text></view
        ><view class="item-quantity"
          ><text>{{ fromScaledQuantity(item.quantityScaled) }}</text
          ><text>{{ item.unit }}</text></view
        ></view
      ></view
    ><button class="floating-add" @click="goAdd">＋</button></view
  >
</template>
<style scoped>
.search-box {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin: 30rpx 0 18rpx;
  padding: 12rpx 14rpx 12rpx 22rpx;
  border-radius: 22rpx;
  background: #fff;
  box-shadow: 0 8rpx 26rpx rgba(35, 61, 47, 0.05);
}
.search-box input {
  flex: 1;
}
.search-box button {
  margin: 0;
  padding: 14rpx 24rpx;
  border-radius: 16rpx;
  background: #276749;
  color: #fff;
  line-height: 1.4;
}
.search-mark {
  color: #718078;
  font-size: 36rpx;
}
.filter-scroll {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 24rpx;
}
.filters {
  display: inline-flex;
  gap: 12rpx;
  padding: 2rpx;
}
.filter-pill,
.clear-pill {
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: #fff;
  color: #506158;
  font-size: 24rpx;
  border: 1rpx solid #e4e8e5;
}
.clear-pill {
  color: #276749;
  background: #e8f3ed;
}
.result-count {
  margin: 10rpx 4rpx 16rpx;
  color: #7b8881;
  font-size: 24rpx;
}
.item-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 14rpx;
  padding: 24rpx;
  border-radius: 26rpx;
  background: #fff;
  box-shadow: 0 8rpx 24rpx rgba(35, 61, 47, 0.045);
}
.item-avatar {
  width: 84rpx;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  background: #edf6f1;
  color: #276749;
  font-size: 32rpx;
  font-weight: 700;
}
.item-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 7rpx;
}
.item-name {
  font-weight: 600;
}
.item-meta {
  color: #87938d;
  font-size: 23rpx;
}
.item-quantity {
  display: flex;
  align-items: baseline;
  gap: 5rpx;
  color: #276749;
}
.item-quantity text:first-child {
  font-size: 34rpx;
  font-weight: 650;
}
.item-quantity text:last-child {
  font-size: 22rpx;
}
.floating-add {
  position: fixed;
  right: 34rpx;
  bottom: 140rpx;
  width: 100rpx;
  height: 100rpx;
  margin: 0;
  border-radius: 32rpx;
  background: #276749;
  color: #fff;
  font-size: 46rpx;
  box-shadow: 0 18rpx 36rpx rgba(39, 103, 73, 0.28);
}
.error-state {
  text-align: center;
}
.skeleton {
  height: 126rpx;
  margin-bottom: 14rpx;
  border-radius: 26rpx;
  background: #e9ece9;
}
</style>
