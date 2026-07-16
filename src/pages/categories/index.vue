<script setup lang="ts">
import CatalogManager from '@/components/CatalogManager.vue'
import { categoryApi } from '@/services/api'
</script>
<template>
  <CatalogManager
    title="分类管理"
    :load="categoryApi.list"
    :save="categoryApi.save"
    :disable="categoryApi.disable"
  />
</template>
