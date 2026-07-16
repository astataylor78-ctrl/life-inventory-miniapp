<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { initCloud } from '@/services/cloud'

onLaunch(() => initCloud())
</script>

<style lang="scss">
page {
  background: #f5f7f5;
  color: #203028;
  font-family: sans-serif;
}
</style>
