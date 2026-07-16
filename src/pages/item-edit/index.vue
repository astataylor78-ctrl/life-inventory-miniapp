<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import { categoryApi, itemApi, locationApi } from '@/services/api'
import { toScaledQuantity, validateStockTargets, fromScaledQuantity } from '@/domain/quantity'
import { uploadImages } from '@/services/cloud'
import type { Category, Location } from '@/types/models'
const id = ref(''),
  categories = ref<Category[]>([]),
  locations = ref<Location[]>([]),
  saving = ref(false),
  error = ref(''),
  localImages = ref<string[]>([])
const ready = ref(false),
  dirty = ref(false),
  leaving = ref(false)
const form = reactive({
  name: '',
  brand: '',
  categoryId: '',
  locationId: '',
  quantity: '1',
  unit: '个',
  minQuantity: '0',
  targetQuantity: '',
  note: '',
  imageUrls: [] as string[],
})
onLoad(async (q) => {
  id.value = String(q?.id || '')
  try {
    ;[categories.value, locations.value] = await Promise.all([
      categoryApi.list(),
      locationApi.list(),
    ])
    if (id.value) {
      const x = await itemApi.get(id.value)
      Object.assign(form, {
        name: x.name,
        brand: x.brand || '',
        categoryId: x.categoryId || '',
        locationId: x.locationId || '',
        quantity: fromScaledQuantity(x.quantityScaled),
        unit: x.unit,
        minQuantity: fromScaledQuantity(x.minQuantityScaled),
        targetQuantity:
          x.targetQuantityScaled === null ? '' : fromScaledQuantity(x.targetQuantityScaled),
        note: x.note || '',
        imageUrls: x.imageUrls,
      })
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    ready.value = true
  }
})
watch(
  [form, localImages],
  () => {
    if (ready.value) dirty.value = true
  },
  { deep: true },
)
onBackPress(() => {
  if (leaving.value || !dirty.value) return false
  uni.showModal({ title: '放弃修改？', content: '尚未保存的内容将丢失。' }).then((result) => {
    if (result.confirm) {
      leaving.value = true
      uni.navigateBack()
    }
  })
  return true
})
async function chooseImages() {
  if (form.imageUrls.length + localImages.value.length >= 3) {
    uni.showToast({ title: '最多选择 3 张图片', icon: 'none' })
    return
  }
  const r = await uni.chooseImage({ count: 3 - form.imageUrls.length - localImages.value.length })
  localImages.value.push(...r.tempFilePaths)
}
function removeSaved(index: number) {
  form.imageUrls.splice(index, 1)
}
function removeLocal(index: number) {
  localImages.value.splice(index, 1)
}
function preview(url: string) {
  uni.previewImage({ current: url, urls: [...form.imageUrls, ...localImages.value] })
}
async function save() {
  saving.value = true
  error.value = ''
  try {
    if (!form.name.trim()) throw new Error('请填写物品名称')
    const min = toScaledQuantity(form.minQuantity)
    const target = form.targetQuantity === '' ? null : toScaledQuantity(form.targetQuantity)
    validateStockTargets(min, target)
    const uploaded = localImages.value.length ? await uploadImages(localImages.value) : []
    await itemApi.save({
      _id: id.value || undefined,
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      categoryId: form.categoryId || null,
      locationId: form.locationId || null,
      imageUrls: [...form.imageUrls, ...uploaded].slice(0, 3),
      quantityScaled: toScaledQuantity(form.quantity),
      unit: form.unit.trim() || '个',
      minQuantityScaled: min,
      targetQuantityScaled: target,
      note: form.note.trim() || null,
    })
    leaving.value = true
    uni.showToast({ title: '保存成功', icon: 'success' })
    uni.navigateBack()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败'
  } finally {
    saving.value = false
  }
}
</script>
<template>
  <view class="page"
    ><input v-model="form.name" class="field" maxlength="50" placeholder="名称（必填）" /><input
      v-model="form.brand"
      class="field"
      maxlength="50"
      placeholder="品牌（选填）"
    /><input v-model="form.quantity" class="field" type="digit" placeholder="当前数量" /><input
      v-model="form.unit"
      class="field"
      maxlength="10"
      placeholder="单位"
    /><input v-model="form.minQuantity" class="field" type="digit" placeholder="安全库存" /><input
      v-model="form.targetQuantity"
      class="field"
      type="digit"
      placeholder="目标库存（选填）"
    /><picker
      :range="categories"
      range-key="name"
      @change="form.categoryId = categories[Number($event.detail.value)]?._id || ''"
      ><view class="field"
        >分类：{{ categories.find((x) => x._id === form.categoryId)?.name || '未选择' }}</view
      ></picker
    ><picker
      :range="locations"
      range-key="name"
      @change="form.locationId = locations[Number($event.detail.value)]?._id || ''"
      ><view class="field"
        >位置：{{ locations.find((x) => x._id === form.locationId)?.name || '未选择' }}</view
      ></picker
    ><textarea v-model="form.note" class="field" maxlength="500" placeholder="备注（选填）" /><view
      class="image-list"
      ><view v-for="(url, index) in form.imageUrls" :key="url" class="image-wrap"
        ><image :src="url" mode="aspectFill" @click="preview(url)" /><text
          @click="removeSaved(index)"
          >删除</text
        ></view
      ><view v-for="(url, index) in localImages" :key="url" class="image-wrap"
        ><image :src="url" mode="aspectFill" @click="preview(url)" /><text
          @click="removeLocal(index)"
          >删除</text
        ></view
      ></view
    ><button
      class="btn-secondary"
      :disabled="form.imageUrls.length + localImages.length >= 3"
      @click="chooseImages"
    >
      选择图片（最多 3 张）</button
    ><view class="muted">已选择 {{ form.imageUrls.length + localImages.length }}/3 张</view
    ><view v-if="error" class="error">{{ error }}</view
    ><button class="btn" :loading="saving" @click="save">保存</button></view
  >
</template>
<style scoped>
.image-list {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}
.image-wrap image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 12rpx;
}
.image-wrap text {
  display: block;
  text-align: center;
  color: #b42318;
}
</style>
