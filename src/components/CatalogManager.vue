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
  await props.save({ name: name.value.trim(), parentId: parentId.value || null })
  name.value = ''
  await refresh()
}
async function stop(id: string) {
  await props.disable(id)
  await refresh()
}
async function edit(row: T) {
  const result = await uni.showModal({
    title: '编辑名称',
    editable: true,
    placeholderText: row.name,
    content: row.name,
  })
  if (!result.confirm || !result.content?.trim()) return
  await props.save({ _id: row._id, name: result.content.trim(), parentId: row.parentId || null })
  await refresh()
}
onMounted(refresh)
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
      ><button class="btn" @click="add">新增</button></view
    ><view v-if="loading" class="muted">正在加载…</view
    ><view v-if="error" class="error">{{ error }}</view
    ><view v-for="row in rows" :key="row._id" class="card row"
      ><text>{{ row.name }}{{ row.isActive ? '' : '（已停用）' }}</text
      ><view
        ><button v-if="row.isActive" size="mini" @click="edit(row)">编辑</button
        ><button v-if="row.isActive" size="mini" @click="stop(row._id)">停用</button></view
      ></view
    ></view
  >
</template>
