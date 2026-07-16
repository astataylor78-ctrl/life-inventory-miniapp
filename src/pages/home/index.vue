<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { itemApi } from '@/services/api'
import { useSessionStore } from '@/stores/session'
import type { Item } from '@/types/models'
const items = ref<Item[]>([])
const loading = ref(false)
const error = ref('')
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
    ><view class="title">我的家</view><view v-if="loading" class="card muted">正在加载…</view
    ><view v-else-if="error" class="card error"
      >{{ error }}<button size="mini" @click="load">重试</button></view
    ><view v-else-if="!items.length" class="card"
      ><view>还没有物品</view><text class="muted">建议先录入纸巾、洗衣液或食品。</text
      ><button class="btn" @click="goAdd">添加第一件物品</button></view
    ><template v-else
      ><view class="card"
        ><text class="muted">全部物品</text><view class="title">{{ items.length }}</view></view
      ><view class="card"
        ><view class="row"
          ><text>最近更新</text><text class="muted" @click="goItems">查看全部</text></view
        ><view
          v-for="item in items.slice(0, 5)"
          :key="item._id"
          class="row item-link"
          @click="goDetail(item._id)"
          ><text>{{ item.name }}</text
          ><text>›</text></view
        ></view
      ></template
    ></view
  >
</template>
<style scoped>
.item-link {
  padding: 20rpx 0;
  border-bottom: 1px solid #edf0ee;
}
</style>
