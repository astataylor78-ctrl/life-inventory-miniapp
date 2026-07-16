<script setup lang="ts">
import CatalogManager from '@/components/CatalogManager.vue'
import { locationApi } from '@/services/api'
</script>
<template>
  <CatalogManager
    title="位置管理"
    hierarchical
    :load="locationApi.list"
    :save="locationApi.save"
    :disable="locationApi.disable"
  />
</template>
