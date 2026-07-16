<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
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
  }
})
async function chooseImages() {
  const r = await uni.chooseImage({ count: 3 - form.imageUrls.length - localImages.value.length })
  localImages.value.push(...r.tempFilePaths)
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
    ><textarea
      v-model="form.note"
      class="field"
      maxlength="500"
      placeholder="备注（选填）"
    /><button class="btn-secondary" @click="chooseImages">选择图片（最多 3 张）</button
    ><view class="muted">已选择 {{ form.imageUrls.length + localImages.length }}/3 张</view
    ><view v-if="error" class="error">{{ error }}</view
    ><button class="btn" :loading="saving" @click="save">保存</button></view
  >
</template>
