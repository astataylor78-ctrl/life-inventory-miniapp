<script
  setup
  lang="ts"
  generic="T extends { _id: string; name: string; isActive: boolean; parentId?: string | null }"
>
import { ref, shallowRef, onMounted } from 'vue'
const props = defineProps<{
  title: string
  load: () => Promise<T[]>
  save: (x: { _id?: string; name: string; parentId?: string | null }) => Promise<T>
  disable: (id: string) => Promise<void>
  hierarchical?: boolean
}>()
const rows = shallowRef<T[]>([]),
  name = ref(''),
  parentId = ref(''),
  loading = ref(false),
  busy = ref(false),
  error = ref('')
async function refresh() {
  loading.value = true
  try {
    rows.value = await props.load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}
async function add() {
  if (!name.value.trim()) return
  busy.value = true
  error.value = ''
  try {
    await props.save({ name: name.value.trim(), parentId: parentId.value || null })
    name.value = ''
    await refresh()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '新增失败'
  } finally {
    busy.value = false
  }
}
async function stop(id: string) {
  const result = await uni.showModal({
    title: '确认停用',
    content: '停用后新增物品时将无法选择该项。',
  })
  if (!result.confirm) return
  busy.value = true
  error.value = ''
  try {
    await props.disable(id)
    await refresh()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '停用失败'
  } finally {
    busy.value = false
  }
}
async function edit(row: T) {
  const result = await uni.showModal({
    title: '编辑名称',
    editable: true,
    placeholderText: row.name,
    content: row.name,
  })
  if (!result.confirm || !result.content?.trim()) return
  busy.value = true
  error.value = ''
  try {
    await props.save({ _id: row._id, name: result.content.trim(), parentId: row.parentId || null })
    await refresh()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '编辑失败'
  } finally {
    busy.value = false
  }
}
async function move(row: T) {
  const candidates = rows.value.filter((item) => item._id !== row._id && item.isActive)
  const result = await uni.showActionSheet({
    itemList: ['设为顶级位置', ...candidates.map((item) => item.name)],
  })
  const newParentId = result.tapIndex === 0 ? null : candidates[result.tapIndex - 1]?._id || null
  busy.value = true
  error.value = ''
  try {
    await props.save({ _id: row._id, name: row.name, parentId: newParentId })
    await refresh()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '移动失败'
  } finally {
    busy.value = false
  }
}
onMounted(refresh)
function displayName(row: T) {
  const parent = rows.value.find((item) => item._id === row.parentId)
  return parent ? `${parent.name} / ${row.name}` : row.name
}
function viewItems(id: string) {
  uni.setStorageSync('pendingLocationFilter', id)
  uni.switchTab({ url: '/pages/items/index' })
}
</script>
<template>
  <view class="page"
    ><view class="title">{{ title }}</view
    ><view class="card"
      ><input v-model="name" class="field" placeholder="输入名称" /><picker
        v-if="hierarchical"
        :range="rows"
        range-key="name"
        @change="parentId = rows[Number($event.detail.value)]?._id || ''"
        ><view class="field"
          >上级：{{ rows.find((x) => x._id === parentId)?.name || '无' }}</view
        ></picker
      ><button class="btn" :loading="busy" @click="add">新增</button></view
    ><view v-if="loading" class="muted">正在加载…</view
    ><view v-if="error" class="error"
      >{{ error }}<button size="mini" @click="refresh">重试</button></view
    ><view v-for="row in rows" :key="row._id" class="card row"
      ><text>{{ displayName(row) }}{{ row.isActive ? '' : '（已停用）' }}</text
      ><view
        ><button v-if="hierarchical" size="mini" @click="viewItems(row._id)">物品</button
        ><button v-if="hierarchical && row.isActive" size="mini" @click="move(row)">移动</button
        ><button v-if="row.isActive" size="mini" @click="edit(row)">编辑</button
        ><button v-if="row.isActive" size="mini" @click="stop(row._id)">停用</button></view
      ></view
    ></view
  >
</template>
