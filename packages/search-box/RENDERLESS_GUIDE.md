# 🎭 Renderless 架构：让 Vue 组件在 Vue2 和 Vue3 中自由穿梭

> **"一次编写，到处运行"** —— 这不是 Java 的专利，也是 Renderless 架构的座右铭！

## 📚 目录

- [开篇：什么是 Renderless 架构？](#开篇什么是-renderless-架构)
- [第一步：理解 @opentiny/vue-common（必须先掌握）](#第一步理解-opentinyvue-common必须先掌握)
- [第二步：核心概念 - 三大文件](#第二步核心概念---三大文件)
- [第三步：实战演练 - 从零开始改造组件](#第三步实战演练---从零开始改造组件)
- [第四步：进阶技巧](#第四步进阶技巧)
- [常见问题与解决方案](#常见问题与解决方案)
- [最佳实践](#最佳实践)

---

## 开篇：什么是 Renderless 架构？

### 🤔 传统组件的困境

想象一下，你写了一个超棒的 Vue 3 组件：

```vue
<!-- MyAwesomeComponent.vue -->
<template>
  <div>
    <button @click="handleClick">{{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const handleClick = () => {
  count.value++
}
</script>
```

**问题来了**：这个组件只能在 Vue 3 中使用！如果你的项目是 Vue 2，或者你需要同时支持 Vue 2 和 Vue 3，怎么办？

### ✨ Renderless 的解决方案

Renderless 架构将组件拆分成三个部分：

```
┌─────────────────────────────────────────┐
│         模板层 (pc.vue)                 │
│  "我只负责展示，不关心逻辑"              │
└─────────────────────────────────────────┘
              ↕️
┌─────────────────────────────────────────┐
│      逻辑层 (renderless.ts)             │
│  "我是大脑，处理所有业务逻辑"            │
└─────────────────────────────────────────┘
              ↕️
┌─────────────────────────────────────────┐
│      入口层 (index.ts)                  │
│  "我是门面，统一对外接口"                │
└─────────────────────────────────────────┘
```

**核心思想**：将 UI（模板）和逻辑（业务代码）完全分离，逻辑层使用 Vue 2 和 Vue 3 都兼容的 API。

### 📊 为什么需要 Renderless？

| 特性       | 传统组件 | Renderless 组件 |
| ---------- | -------- | --------------- |
| Vue 2 支持 | ❌       | ✅              |
| Vue 3 支持 | ✅       | ✅              |
| 逻辑复用   | 困难     | 简单            |
| 测试友好   | 一般     | 优秀            |
| 代码组织   | 耦合     | 解耦            |

### 🎯 适用场景

- ✅ 需要同时支持 Vue 2 和 Vue 3 的组件库
- ✅ 逻辑复杂，需要模块化管理的组件
- ✅ 需要多端适配的组件（PC、移动端、小程序等）
- ✅ 需要高度可测试性的组件

---

## 第一步：理解 @opentiny/vue-common（必须先掌握）

### ⚠️ 重要提示：为什么必须先学习 vue-common？

在学习 Renderless 架构之前，**你必须先理解 `@opentiny/vue-common`**，因为：

1. **它是基础工具**：Renderless 架构完全依赖 `vue-common` 提供的兼容层
2. **它是桥梁**：没有 `vue-common`，就无法实现 Vue 2/3 的兼容
3. **它是前提**：不理解 `vue-common`，就无法理解 Renderless 的工作原理

**打个比方**：`vue-common` 就像是你学开车前必须先了解的"方向盘、刹车、油门"，而 Renderless 是"如何驾驶"的技巧。没有基础工具，再好的技巧也无法施展！

### 🤔 为什么需要 vue-common？

想象一下，Vue 2 和 Vue 3 就像两个说不同方言的人：

- **Vue 2**：`this.$refs.input`、`this.$emit('event')`、`Vue.component()`
- **Vue 3**：`refs.input`、`emit('event')`、`defineComponent()`

如果你要同时支持两者，难道要写两套代码吗？**当然不！** 这就是 `@opentiny/vue-common` 存在的意义。

### ✨ vue-common 是什么？

`@opentiny/vue-common` 是一个**兼容层库**，它：

1. **统一 API**：提供一套统一的 API，自动适配 Vue 2 和 Vue 3
2. **隐藏差异**：让你无需关心底层是 Vue 2 还是 Vue 3
3. **类型支持**：提供完整的 TypeScript 类型定义

**简单来说**：`vue-common` 是一个"翻译官"，它让 Vue 2 和 Vue 3 能够"说同一种语言"。

### 🤔 为什么需要 vue-common？

想象一下，Vue 2 和 Vue 3 就像两个说不同方言的人：

- **Vue 2**：`this.$refs.input`、`this.$emit('event')`、`Vue.component()`
- **Vue 3**：`refs.input`、`emit('event')`、`defineComponent()`

如果你要同时支持两者，难道要写两套代码吗？**当然不！** 这就是 `@opentiny/vue-common` 存在的意义。

### ✨ vue-common 是什么？

`@opentiny/vue-common` 是一个**兼容层库**，它：

1. **统一 API**：提供一套统一的 API，自动适配 Vue 2 和 Vue 3
2. **隐藏差异**：让你无需关心底层是 Vue 2 还是 Vue 3
3. **类型支持**：提供完整的 TypeScript 类型定义

### 🛠️ 核心 API 详解

#### 1. `defineComponent` - 组件定义的统一入口

```typescript
import { defineComponent } from '@opentiny/vue-common'

// 这个函数在 Vue 2 和 Vue 3 中都能工作
export default defineComponent({
  name: 'MyComponent',
  props: { ... },
  setup() { ... }
})
```

**工作原理**：

- Vue 2：内部使用 `Vue.extend()` 或 `Vue.component()`
- Vue 3：直接使用 Vue 3 的 `defineComponent()`
- 你只需要写一套代码，`vue-common` 会自动选择正确的实现

#### 2. `setup` - 连接 Renderless 的桥梁

```typescript
import { setup } from '@opentiny/vue-common'

// 在 pc.vue 中
setup(props, context) {
  return setup({ props, context, renderless, api })
}
```

**工作原理**：

- 接收 `renderless` 函数和 `api` 数组
- 自动处理 Vue 2/3 的差异（如 `emit`、`slots`、`refs` 等）
- 将 `renderless` 返回的 `api` 对象注入到模板中

**关键点**：

```typescript
// vue-common 内部会做类似这样的处理：
function setup({ props, context, renderless, api }) {
  // Vue 2: context 包含 { emit, slots, attrs, listeners }
  // Vue 3: context 包含 { emit, slots, attrs, expose }

  // 统一处理差异
  const normalizedContext = normalizeContext(context)

  // 调用 renderless
  const apiResult = renderless(props, hooks, normalizedContext)

  // 返回给模板使用
  return apiResult
}
```

#### 3. `$props` - 通用 Props 定义

```typescript
import { $props } from '@opentiny/vue-common'

export const myComponentProps = {
  ...$props, // 继承通用 props
  title: String
}
```

**提供的基础 Props**：

- `tiny_mode`：组件模式（pc/saas）
- `customClass`：自定义类名
- `customStyle`：自定义样式
- 等等...

**好处**：

- 所有组件都有统一的 props 接口
- 减少重复代码
- 保证一致性

#### 4. `$prefix` - 组件名前缀

```typescript
import { $prefix } from '@opentiny/vue-common'

export default defineComponent({
  name: $prefix + 'SearchBox' // 自动变成 'TinySearchBox'
})
```

**作用**：

- 统一组件命名规范
- 避免命名冲突
- 便于识别组件来源

#### 5. `isVue2` / `isVue3` - 版本检测

```typescript
import { isVue2, isVue3 } from '@opentiny/vue-common'

if (isVue2) {
  // Vue 2 特定代码
  console.log('运行在 Vue 2 环境')
} else if (isVue3) {
  // Vue 3 特定代码
  console.log('运行在 Vue 3 环境')
}
```

**使用场景**：

- 需要针对特定版本做特殊处理时
- 调试和日志记录
- 兼容性检查

### 🔍 深入理解：vue-common 如何实现兼容？

#### 场景 1：响应式 API 兼容

```typescript
// 在 renderless.ts 中
export const renderless = (props, hooks, context) => {
  const { reactive, computed, watch } = hooks

  // 这些 hooks 来自 vue-common 的兼容层
  // Vue 2: 使用 @vue/composition-api 的 polyfill
  // Vue 3: 直接使用 Vue 3 的原生 API

  const state = reactive({ count: 0 })
  const double = computed(() => state.count * 2)

  watch(
    () => state.count,
    (newVal) => {
      console.log('count changed:', newVal)
    }
  )
}
```

**兼容原理**：

- Vue 2：`vue-common` 内部使用 `@vue/composition-api` 提供 Composition API
- Vue 3：直接使用 Vue 3 的原生 API
- 对开发者透明，无需关心底层实现

#### 场景 2：Emit 兼容

```typescript
export const renderless = (props, hooks, { emit }) => {
  const handleClick = () => {
    // vue-common 会自动处理 Vue 2/3 的差异
    emit('update:modelValue', newValue)
    emit('change', newValue)
  }
}
```

**兼容原理**：

```typescript
// vue-common 内部处理（简化版）
function normalizeEmit(emit, isVue2) {
  if (isVue2) {
    // Vue 2: emit 需要特殊处理
    return function (event, ...args) {
      // 处理 Vue 2 的事件格式
      this.$emit(event, ...args)
    }
  } else {
    // Vue 3: 直接使用
    return emit
  }
}
```

#### 场景 3：Refs 访问兼容

```typescript
export const renderless = (props, hooks, { vm }) => {
  const focusInput = () => {
    // vue-common 提供了统一的访问方式
    const inputRef = vm?.$refs?.inputRef || vm?.refs?.inputRef
    inputRef?.focus()
  }
}
```

**兼容原理**：

- Vue 2：`vm.$refs.inputRef`
- Vue 3：`vm.refs.inputRef`
- `vue-common` 提供统一的访问方式，自动适配

### 📊 vue-common 提供的完整 API 列表

| API               | 作用            | Vue 2 实现               | Vue 3 实现          |
| ----------------- | --------------- | ------------------------ | ------------------- |
| `defineComponent` | 定义组件        | `Vue.extend()`           | `defineComponent()` |
| `setup`           | 连接 renderless | Composition API polyfill | 原生 setup          |
| `$props`          | 通用 props      | 对象展开                 | 对象展开            |
| `$prefix`         | 组件前缀        | 字符串常量               | 字符串常量          |
| `isVue2`          | Vue 2 检测      | `true`                   | `false`             |
| `isVue3`          | Vue 3 检测      | `false`                  | `true`              |

### 🎯 使用 vue-common 的最佳实践

#### ✅ DO（推荐）

1. **始终使用 vue-common 提供的 API**

   ```typescript
   // ✅ 好
   import { defineComponent, setup } from '@opentiny/vue-common'

   // ❌ 不好
   import { defineComponent } from 'vue' // 这样只能在 Vue 3 中使用
   ```

2. **使用 $props 继承通用属性**

   ```typescript
   // ✅ 好
   export const props = {
     ...$props,
     customProp: String
   }
   ```

3. **使用 $prefix 统一命名**
   ```typescript
   // ✅ 好
   name: $prefix + 'MyComponent'
   ```

#### ❌ DON'T（不推荐）

1. **不要直接使用 Vue 2/3 的原生 API**

   ```typescript
   // ❌ 不好
   import Vue from 'vue' // 只能在 Vue 2 中使用
   import { defineComponent } from 'vue' // 只能在 Vue 3 中使用
   ```

2. **不要硬编码组件名前缀**

   ```typescript
   // ❌ 不好
   name: 'TinyMyComponent' // 硬编码前缀

   // ✅ 好
   name: $prefix + 'MyComponent' // 使用变量
   ```

### 🔗 总结

`@opentiny/vue-common` 是 Renderless 架构的**基石**：

- 🎯 **目标**：让一套代码在 Vue 2 和 Vue 3 中都能运行
- 🛠️ **手段**：提供统一的 API 和兼容层
- ✨ **结果**：开发者无需关心底层差异，专注于业务逻辑

**记住**：使用 Renderless 架构时，**必须**使用 `vue-common` 提供的 API，这是实现跨版本兼容的关键！

### 🎓 学习检查点

在继续学习之前，请确保你已经理解：

- ✅ `defineComponent` 的作用和用法
- ✅ `setup` 函数如何连接 renderless
- ✅ `$props` 和 `$prefix` 的用途
- ✅ `vue-common` 如何实现 Vue 2/3 兼容

如果你对以上内容还有疑问，请重新阅读本节。**理解 `vue-common` 是学习 Renderless 的前提！**

---

## 第二步：核心概念 - 三大文件

现在你已经理解了 `vue-common`，我们可以开始学习 Renderless 架构的核心了！

### 📋 文件结构

一个标准的 Renderless 组件包含三个核心文件：

```
my-component/
├── index.ts          # 入口文件：定义组件和 props
├── pc.vue            # 模板文件：只负责 UI 展示
└── renderless.ts     # 逻辑文件：处理所有业务逻辑
```

### 1. 三大核心文件详解

#### 📄 `index.ts` - 组件入口

```typescript
import { $props, $prefix, defineComponent } from '@opentiny/vue-common'
import template from './pc.vue'

// 定义组件的 props
export const myComponentProps = {
  ...$props, // 继承通用 props
  title: {
    type: String,
    default: 'Hello'
  },
  count: {
    type: Number,
    default: 0
  }
}

// 导出组件
export default defineComponent({
  name: $prefix + 'MyComponent', // 自动添加前缀
  props: myComponentProps,
  ...template // 展开模板配置
})
```

**关键点**：

- `$props`：提供 Vue 2/3 兼容的基础 props
- `$prefix`：统一的组件名前缀（如 `Tiny`）
- `defineComponent`：兼容 Vue 2/3 的组件定义函数

#### 🎨 `pc.vue` - 模板文件

```vue
<template>
  <div class="my-component">
    <h1>{{ title }}</h1>
    <button @click="handleClick">点击了 {{ count }} 次</button>
    <p>{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, setup, $props } from '@opentiny/vue-common'
import { renderless, api } from './renderless'

export default defineComponent({
  props: {
    ...$props,
    title: String,
    count: Number
  },
  setup(props, context) {
    // 关键：通过 setup 函数连接 renderless
    return setup({ props, context, renderless, api })
  }
})
</script>
```

**关键点**：

- 模板只负责 UI 展示
- 所有逻辑都从 `renderless` 函数获取
- `setup` 函数是连接模板和逻辑的桥梁

#### 🧠 `renderless.ts` - 逻辑层

```typescript
// 定义暴露给模板的 API
export const api = ['count', 'message', 'handleClick']

// 初始化状态
const initState = ({ reactive, props }) => {
  const state = reactive({
    count: props.count || 0,
    message: '欢迎使用 Renderless 架构！'
  })
  return state
}

// 核心：renderless 函数
export const renderless = (props, { reactive, computed, watch, onMounted }, { emit, nextTick, vm }) => {
  const api = {} as any
  const state = initState({ reactive, props })

  // 定义方法
  const handleClick = () => {
    state.count++
    emit('update:count', state.count)
  }

  // 计算属性
  const message = computed(() => {
    return `你已经点击了 ${state.count} 次！`
  })

  // 生命周期
  onMounted(() => {
    console.log('组件已挂载')
  })

  // 暴露给模板
  Object.assign(api, {
    count: state.count,
    message,
    handleClick
  })

  return api
}
```

**关键点**：

- `api` 数组：声明要暴露给模板的属性和方法
- `renderless` 函数接收三个参数：
  1. `props`：组件属性
  2. `hooks`：Vue 的响应式 API（reactive, computed, watch 等）
  3. `context`：上下文（emit, nextTick, vm 等）
- 返回的 `api` 对象会被注入到模板中

---

## 第三步：实战演练 - 从零开始改造组件

现在你已经掌握了：

- ✅ `vue-common` 的核心 API
- ✅ Renderless 架构的三大文件

让我们通过一个完整的例子，将理论知识转化为实践！

### 🎯 目标

将一个简单的计数器组件改造成 Renderless 架构，支持 Vue 2 和 Vue 3。

### 📝 步骤 1：创建文件结构

```
my-counter/
├── index.ts          # 入口文件
├── pc.vue            # 模板文件
└── renderless.ts     # 逻辑文件
```

### 📝 步骤 2：编写入口文件

```typescript
// index.ts
import { $props, $prefix, defineComponent } from '@opentiny/vue-common'
import template from './pc.vue'

export const counterProps = {
  ...$props,
  initialValue: {
    type: Number,
    default: 0
  },
  step: {
    type: Number,
    default: 1
  }
}

export default defineComponent({
  name: $prefix + 'Counter',
  props: counterProps,
  ...template
})
```

### 📝 步骤 3：编写逻辑层

```typescript
// renderless.ts
export const api = ['count', 'increment', 'decrement', 'reset', 'isEven']

const initState = ({ reactive, props }) => {
  return reactive({
    count: props.initialValue || 0
  })
}

export const renderless = (props, { reactive, computed, watch }, { emit, vm }) => {
  const api = {} as any
  const state = initState({ reactive, props })

  // 增加
  const increment = () => {
    state.count += props.step
    emit('change', state.count)
  }

  // 减少
  const decrement = () => {
    state.count -= props.step
    emit('change', state.count)
  }

  // 重置
  const reset = () => {
    state.count = props.initialValue || 0
    emit('change', state.count)
  }

  // 计算属性：是否为偶数
  const isEven = computed(() => {
    return state.count % 2 === 0
  })

  // 监听 count 变化
  watch(
    () => state.count,
    (newVal, oldVal) => {
      console.log(`计数从 ${oldVal} 变为 ${newVal}`)
    }
  )

  // 暴露 API
  Object.assign(api, {
    count: state.count,
    increment,
    decrement,
    reset,
    isEven
  })

  return api
}
```

### 📝 步骤 4：编写模板

```vue
<!-- pc.vue -->
<template>
  <div class="tiny-counter">
    <div class="counter-display">
      <span :class="{ 'even': isEven, 'odd': !isEven }">
        {{ count }}
      </span>
      <small v-if="isEven">(偶数)</small>
      <small v-else>(奇数)</small>
    </div>

    <div class="counter-buttons">
      <button @click="decrement">-</button>
      <button @click="reset">重置</button>
      <button @click="increment">+</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, setup, $props } from '@opentiny/vue-common'
import { renderless, api } from './renderless'

export default defineComponent({
  props: {
    ...$props,
    initialValue: Number,
    step: Number
  },
  emits: ['change'],
  setup(props, context) {
    return setup({ props, context, renderless, api })
  }
})
</script>

<style scoped>
.tiny-counter {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}

.counter-display {
  font-size: 48px;
  margin-bottom: 20px;
}

.counter-display .even {
  color: green;
}

.counter-display .odd {
  color: blue;
}

.counter-buttons button {
  margin: 0 5px;
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
}
</style>
```

### 🎉 完成！

现在这个组件可以在 Vue 2 和 Vue 3 中无缝使用了！

```vue
<!-- Vue 2 或 Vue 3 都可以 -->
<template>
  <tiny-counter :initial-value="10" :step="2" @change="handleChange" />
</template>
```

---

## 第四步：进阶技巧

恭喜你！如果你已经完成了实战演练，说明你已经掌握了 Renderless 架构的基础。现在让我们学习一些进阶技巧，让你的组件更加优雅和强大。

### 1. 模块化：使用 Composables

当逻辑变得复杂时，可以将功能拆分成多个 composables：

```typescript
// composables/use-counter.ts
export function useCounter({ state, props, emit }) {
  const increment = () => {
    state.count += props.step
    emit('change', state.count)
  }

  const decrement = () => {
    state.count -= props.step
    emit('change', state.count)
  }

  return { increment, decrement }
}

// composables/use-validation.ts
export function useValidation({ state }) {
  const isEven = computed(() => state.count % 2 === 0)
  const isPositive = computed(() => state.count > 0)

  return { isEven, isPositive }
}

// renderless.ts
import { useCounter } from './composables/use-counter'
import { useValidation } from './composables/use-validation'

export const renderless = (props, hooks, context) => {
  const api = {} as any
  const state = initState({ reactive, props })

  // 使用 composables
  const { increment, decrement } = useCounter({ state, props, emit })
  const { isEven, isPositive } = useValidation({ state })

  Object.assign(api, {
    count: state.count,
    increment,
    decrement,
    isEven,
    isPositive
  })

  return api
}
```

### 2. 访问组件实例（vm）

有时候需要访问组件实例，比如获取 refs：

```typescript
export const renderless = (props, hooks, { vm }) => {
  const api = {} as any

  const focusInput = () => {
    // Vue 2: vm.$refs.inputRef
    // Vue 3: vm.refs.inputRef
    const inputRef = vm?.$refs?.inputRef || vm?.refs?.inputRef
    if (inputRef) {
      inputRef.focus()
    }
  }

  // 存储 vm 到 state，方便在模板中使用
  state.instance = vm

  return api
}
```

### 3. 处理 Slots

在 Vue 2 中，slots 的访问方式不同：

```typescript
export const renderless = (props, hooks, { vm, slots }) => {
  const api = {} as any
  const state = initState({ reactive, props })

  // 存储 vm 和 slots
  state.instance = vm

  // Vue 2 中需要手动设置 slots
  if (vm && slots) {
    vm.slots = slots
  }

  return api
}
```

在模板中检查 slot：

```vue
<template>
  <div v-if="state.instance?.$slots?.default || state.instance?.slots?.default">
    <slot></slot>
  </div>
</template>
```

### 4. 生命周期处理

```typescript
export const renderless = (props, hooks, context) => {
  const { onMounted, onBeforeUnmount, onUpdated } = hooks

  // 组件挂载后
  onMounted(() => {
    console.log('组件已挂载')
    // 添加事件监听
    document.addEventListener('click', handleDocumentClick)
  })

  // 组件更新后
  onUpdated(() => {
    console.log('组件已更新')
  })

  // 组件卸载前
  onBeforeUnmount(() => {
    console.log('组件即将卸载')
    // 清理事件监听
    document.removeEventListener('click', handleDocumentClick)
  })

  return api
}
```

### 5. Watch 的高级用法

```typescript
export const renderless = (props, hooks, context) => {
  const { watch } = hooks

  // 监听单个值
  watch(
    () => state.count,
    (newVal, oldVal) => {
      console.log(`count 从 ${oldVal} 变为 ${newVal}`)
    }
  )

  // 监听多个值
  watch([() => state.count, () => props.step], ([newCount, newStep], [oldCount, oldStep]) => {
    console.log('count 或 step 发生了变化')
  })

  // 深度监听对象
  watch(
    () => state.user,
    (newUser) => {
      console.log('user 对象发生了变化', newUser)
    },
    { deep: true }
  )

  // 立即执行
  watch(
    () => props.initialValue,
    (newVal) => {
      state.count = newVal
    },
    { immediate: true }
  )

  return api
}
```

---

## 常见问题与解决方案

### ❓ 问题 1：为什么我的响应式数据不更新？

**原因**：在 `renderless` 中，需要将响应式数据暴露到 `api` 对象中。

```typescript
// ❌ 错误：直接返回 state
Object.assign(api, {
  state // 这样模板无法访问 state.count
})

// ✅ 正确：展开 state 或明确暴露属性
Object.assign(api, {
  count: state.count, // 明确暴露
  message: state.message
})

// 或者使用 computed
const count = computed(() => state.count)
Object.assign(api, {
  count // 使用 computed 包装
})
```

### ❓ 问题 2：如何在模板中访问组件实例？

**解决方案**：将 `vm` 存储到 `state` 中。

```typescript
export const renderless = (props, hooks, { vm }) => {
  const state = initState({ reactive, props })
  state.instance = vm // 存储实例

  return api
}
```

在模板中：

```vue
<template>
  <div>
    <!-- 访问 refs -->
    <input ref="inputRef" />
    <button @click="focusInput">聚焦</button>
  </div>
</template>
```

```typescript
const focusInput = () => {
  const inputRef = state.instance?.$refs?.inputRef || state.instance?.refs?.inputRef
  inputRef?.focus()
}
```

### ❓ 问题 3：Vue 2 和 Vue 3 的 emit 有什么区别？

**解决方案**：使用 `@opentiny/vue-common` 提供的兼容层。

```typescript
export const renderless = (props, hooks, { emit: $emit }) => {
  // 兼容处理
  const emit = props.emitter ? props.emitter.emit : $emit

  const handleClick = () => {
    // 直接使用 emit，兼容层会处理差异
    emit('update:modelValue', newValue)
    emit('change', newValue)
  }

  return api
}
```

### ❓ 问题 4：如何处理异步操作？

**解决方案**：使用 `nextTick` 确保 DOM 更新。

```typescript
export const renderless = (props, hooks, { nextTick }) => {
  const handleAsyncUpdate = async () => {
    // 执行异步操作
    const data = await fetchData()
    state.data = data

    // 等待 DOM 更新
    await nextTick()

    // 此时可以安全地操作 DOM
    const element = state.instance?.$el || state.instance?.el
    if (element) {
      element.scrollIntoView()
    }
  }

  return api
}
```

### ❓ 问题 5：如何调试 Renderless 组件？

**技巧**：

1. **使用 console.log**：

```typescript
export const renderless = (props, hooks, context) => {
  console.log('Props:', props)
  console.log('State:', state)
  console.log('Context:', context)

  // 在关键位置添加日志
  const handleClick = () => {
    console.log('Button clicked!', state.count)
    // ...
  }

  return api
}
```

2. **使用 Vue DevTools**：

   - 在模板中添加调试信息
   - 使用 `state` 存储调试数据

3. **断点调试**：
   - 在 `renderless.ts` 中设置断点
   - 检查 `api` 对象的返回值

---

## 最佳实践

### ✅ DO（推荐做法）

1. **模块化组织代码**

   ```
   src/
   ├── index.ts
   ├── pc.vue
   ├── renderless.ts
   ├── composables/
   │   ├── use-feature1.ts
   │   └── use-feature2.ts
   └── utils/
       └── helpers.ts
   ```

2. **明确声明 API**

   ```typescript
   // 在文件顶部声明所有暴露的 API
   export const api = ['count', 'increment', 'decrement', 'isEven']
   ```

3. **使用 TypeScript**

   ```typescript
   interface State {
     count: number
     message: string
   }

   const initState = ({ reactive, props }): State => {
     return reactive({
       count: props.initialValue || 0,
       message: 'Hello'
     })
   }
   ```

4. **处理边界情况**

   ```typescript
   const handleClick = () => {
     if (props.disabled) {
       return // 提前返回
     }

     try {
       // 业务逻辑
     } catch (error) {
       console.error('Error:', error)
       emit('error', error)
     }
   }
   ```

### ❌ DON'T（不推荐做法）

1. **不要在模板中写逻辑**

   ```vue
   <!-- ❌ 不好 -->
   <template>
     <div>{{ count + 1 }}</div>
   </template>

   <!-- ✅ 好 -->
   <template>
     <div>{{ nextCount }}</div>
   </template>
   ```

   ```typescript
   const nextCount = computed(() => state.count + 1)
   ```

2. **不要直接修改 props**

   ```typescript
   // ❌ 不好
   props.count++ // 不要这样做！

   // ✅ 好
   state.count = props.count + 1
   emit('update:count', state.count)
   ```

3. **不要忘记清理资源**

   ```typescript
   // ❌ 不好
   onMounted(() => {
     document.addEventListener('click', handler)
     // 忘记清理
   })

   // ✅ 好
   onMounted(() => {
     document.addEventListener('click', handler)
   })

   onBeforeUnmount(() => {
     document.removeEventListener('click', handler)
   })
   ```

---

## 🎓 总结

Renderless 架构的核心思想是**关注点分离**：

- **模板层**：只负责 UI 展示
- **逻辑层**：处理所有业务逻辑
- **入口层**：统一对外接口

通过这种方式，我们可以：

- ✅ 同时支持 Vue 2 和 Vue 3
- ✅ 提高代码的可维护性
- ✅ 增强代码的可测试性
- ✅ 实现逻辑的模块化复用

### 🚀 下一步

1. 查看 `@opentiny/vue-search-box` 的完整源码
2. 尝试改造自己的组件
3. 探索更多高级特性

### 📚 参考资源

- [@opentiny/vue-common 文档](https://github.com/opentiny/tiny-vue)
- [Vue 2 官方文档](https://v2.cn.vuejs.org/)
- [Vue 3 官方文档](https://cn.vuejs.org/)

---

**Happy Coding! 🎉**

> 记住：Renderless 不是魔法，而是一种思维方式。当你理解了它，你会发现，原来组件可以这样写！
