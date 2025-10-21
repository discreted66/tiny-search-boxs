<script setup lang="ts">
import { ref, watch } from 'vue'
import { dataSource } from './data-source'

const tags = ref([])
watch(tags, (newVal) => {
  console.log('Selected tags:', newVal)
})
</script>

<template>
  <ClientOnly>
    <tiny-search-box v-model="tags" :items="dataSource" />
  </ClientOnly>
</template>
