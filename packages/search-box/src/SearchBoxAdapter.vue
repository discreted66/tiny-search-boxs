
<template>
  <search-box ref="wc" v-bind="passProps">
    <template v-for="(slotFn, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
    <slot v-if="$slots.default" />
  </search-box>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, toRefs } from 'vue-demi'

export default defineComponent({
  name: 'SearchBoxAdapter',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    items: {
      type: Array,
      default: () => []
    },
    emptyPlaceholder: {
      type: String,
      default: ''
    },
    potentialOptions: {
      type: Object,
      default: null
    },
    showHelp: {
      type: Boolean,
      default: true
    },
    idMapKey: {
      type: String,
      default: 'id'
    },
    defaultField: {
      type: String,
      default: ''
    },
    editable: {
      type: Boolean,
      default: false
    },
    maxlength: Number,
    panelMaxHeight: {
      type: String,
      default: '999px'
    },
    splitInputValue: {
      type: String,
      default: ','
    },
    mode: {
      type: String,
      default: 'saas'
    }
  },
  emits: [
    'update:modelValue',
    'change',
    'search',
    'exceed',
    'first-level-select',
    'clear'
  ],
  setup(props, { emit, attrs, slots }) {
    const wc = ref<any>(null)
    const { modelValue } = toRefs(props)
    // 合并 props 和 attrs 传递给 web component
    const passProps = { ...attrs, ...props }

    // 事件转发
    onMounted(() => {
      if (wc.value) {
        wc.value.addEventListener('search', (e: any) => emit('search', e.detail))
        wc.value.addEventListener('change', (e: any) => emit('change', e.detail))
        wc.value.addEventListener('update:modelValue', (e: any) => emit('update:modelValue', e.detail))
        wc.value.addEventListener('exceed', (e: any) => emit('exceed', e.detail))
        wc.value.addEventListener('first-level-select', (e: any) => emit('first-level-select', e.detail))
        wc.value.addEventListener('clear', (e: any) => emit('clear', e.detail))
      }
    })

    // v-model 双向绑定
    watch(modelValue, val => {
      if (wc.value) wc.value.modelValue = val
    })

    return { wc, passProps }
  }
})
</script>
