<template>
  <tiny-container :aside-width="225">
    <template #header>
      <div class="header-left"><img class="pointer" src="./assets/log.svg" />TinySearchBox</div>
    </template>
    <template #aside>
      <div><tiny-tree-menu :data="treeData" @node-click="handleNodeClick"></tiny-tree-menu></div>
    </template>
    <header class="doc-header">{{ active.label }}</header>
    <div class="doc-main">
      <tiny-tabs v-model="activeName">
        <tiny-tab-item title="示例" name="first">
          <div v-html="active.desc"></div>
          <component v-if="currentComp" :is="currentComp" class="example-container" />
          <div class="icons">
            <TinyIconCopySolid class="pointer" />
            <TinyIconEditorCode class="pointer" @click="showCode = !showCode" />
          </div>
          <div v-show="showCode" class="demo-code">
            <pre>{{ sourceCode }}</pre>
          </div>
        </tiny-tab-item>
        <tiny-tab-item title="API" name="third">{{ active }}</tiny-tab-item>
      </tiny-tabs>
    </div>

    <!-- <component :is="activeComponent" class="example-container" v-if="activeComponent" /> -->
  </tiny-container>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent, shallowRef } from 'vue'
import { TinyContainer, TinyTabs, TinyTabItem, TinyRadioGroup, TinyTreeMenu } from '@opentiny/vue'
import { IconEditorCode, IconCopySolid } from '@opentiny/vue-icon'

import { routes } from 'vue-router/auto-routes'
import api from './webdoc/search-box.js'

const TinyIconEditorCode = IconEditorCode()
const TinyIconCopySolid = IconCopySolid()
// const router = useRouter()
console.info(routes)
console.info('apiapiapiapiapiapiapiapiapiapiapiapiapiapiapi', api)

// 从父组件接收自动注册的组件
// const props = defineProps(['components'])

const treeData = computed(() => {
  return api.demos.map((item) => {
    return {
      id: item.demoId,
      label: item.name['zhCN'],
      desc: item.desc['zhCN']
    }
  })
})

console.info(treeData)

const active = ref(treeData.value[0])
const handleNodeClick = (data) => {
  console.info(data)
  active.value = data
  // router.push({
  //   path: `/${data.label}`
  // })
  loadComponent()
}

const activeName = ref('first')

// 单文件组件加载
// const activeComponent = defineAsyncComponent(() => import(`./search-box/${active.value}.vue`))

const currentComp = shallowRef(null)
const sourceCode = ref('')

const loadComponent = async () => {
  currentComp.value = defineAsyncComponent(() => import(`./search-box/${active.value.id}.vue`))

  console.log(currentComp.value)

  // 获取对应源码文件
  const res = await fetch(`/src/search-box/${active.value.id}.vue`)
  sourceCode.value = await res.text()
}

loadComponent()
// const activeComponent = ref('auto-match')

// 从URL hash初始化选中组件
// onMounted(() => {
//   const hash = window.location.hash.replace('#', '')

//   console.info(props.components)

//   // if (props.components.includes(hash)) {
//   // activeComponent.value = hash
//   // }
// })
</script>

<style lang="less" scoped>
.doc-header {
  padding: 16px 40px;
  min-height: 50px;
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  background-color: #fff;
  color: var(--tv-color-text);
  box-shadow: 12px 0 20px 6px #0000000f;
}
:deep(.tiny-tabs__content) {
  display: flex;
  flex-direction: column;
  color: var(--tv-color-text);
  background: #fff;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  padding: 26px 18px 10px 18px;

  code {
    color: #476582;
    padding: 4px 8px;
    margin: 0 4px;
    font-size: 0.85em;
    background-color: var(--tv-color-bg-header);
    border-radius: 3px;
  }

  .icons {
    display: flex;
    align-items: center;
    justify-content: end;
    padding: 20px 5px 0;
    font-size: 17px;
    gap: 10px;
    fill: var(--tv-color-icon);
    svg {
      &:hover {
        fill: var(--tv-color-icon-hover);
      }
    }
  }
}
.doc-main {
  padding: 10px 42px;
}

.tiny-container {
  height: 100%;
  color: #5f6774;
  text-align: center;
  font-size: 18px;
  position: relative;
}
.pointer {
  cursor: pointer;
}
.tiny-container :deep(.tiny-container__header) {
  border: 3px solid var(--tv-color-border-container);
  border-radius: 4px;
  color: var(--tv-color-text);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;

  .header-left {
    display: flex;
    align-items: center;
    font-weight: bold;
    gap: 20px;
  }
}

.tiny-container :deep(.tiny-container__aside) {
  border: 3px solid var(--tv-color-border-container);
  color: var(--tv-color-error-text);
  text-align: left;
  border-radius: 4px;
}

.tiny-container :deep(.tiny-container__main) {
  border: 3px solid var(--tv-color-border-container);
  border-radius: 4px;
  text-align: left;
}

.tiny-container :deep(.tiny-container__footer) {
  background-color: var(--tv-color-success-bg-light);
  border: 3px solid var(--tv-color-border-container);
  color: var(--tv-color-success-text);
}
</style>
