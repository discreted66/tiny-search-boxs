# 🎉 TinySearchBox 重磅更新：Vue2 支持 + SaaS 风格，一次满足你的所有需求！

> **"一次编写，到处运行"** —— 这次我们真的做到了！🎊

## 📢 重大更新

经过团队的不懈努力，**TinySearchBox** 现在正式支持：

- ✅ **Vue 2** 和 **Vue 3** 双版本支持
- ✅ **普通主题** 和 **SaaS 主题** 双风格
- ✅ **一套代码，四个版本**（Vue2、Vue2-SaaS、Vue3、Vue3-SaaS）

这意味着什么？**无论你的项目是 Vue 2 还是 Vue 3，无论你喜欢传统风格还是现代 SaaS 风格，TinySearchBox 都能完美适配！**

---

## 🚀 快速开始

### Vue 3 项目（普通主题）

```bash
npm install @opentiny/vue-search-box@3.27.1
```

```vue
<template>
  <tiny-search-box v-model="tags" :items="items" />
</template>

<script setup>
import { ref } from 'vue'
import TinySearchBox from '@opentiny/vue-search-box'

const tags = ref([])
const items = ref([
  {
    label: '名称',
    field: 'name',
    options: [
      { label: '选项1' },
      { label: '选项2' }
    ]
  }
])
</script>
```

### Vue 2 项目（普通主题）

```bash
npm install @opentiny/vue-search-box@2.27.1
```

```vue
<template>
  <tiny-search-box v-model="tags" :items="items" />
</template>

<script>
import TinySearchBox from '@opentiny/vue-search-box'

export default {
  components: {
    TinySearchBox
  },
  data() {
    return {
      tags: [],
      items: [
        {
          label: '名称',
          field: 'name',
          options: [
            { label: '选项1' },
            { label: '选项2' }
          ]
        }
      ]
    }
  }
}
</script>
```

### Vue 3 项目（SaaS 主题）✨

```bash
npm install @opentiny/vue-search-box-saas@3.27.1
```

```vue
<template>
  <ConfigProvider :config="designSaasConfig">
    <tiny-search-box v-model="tags" :items="items" />
  </ConfigProvider>
</template>

<script setup>
import { ref } from 'vue'
import ConfigProvider from '@opentiny/vue-config-provider'
import designSaasConfig from '@opentiny/vue-design-saas'
import TinySearchBox from '@opentiny/vue-search-box-saas'

const tags = ref([])
const items = ref([
  {
    label: '名称',
    field: 'name',
    options: [
      { label: '选项1' },
      { label: '选项2' }
    ]
  }
])
</script>
```

### Vue 2 项目（SaaS 主题）✨

```bash
npm install @opentiny/vue-search-box-saas@2.27.1
```

```vue
<template>
  <ConfigProvider :config="designSaasConfig">
    <tiny-search-box v-model="tags" :items="items" />
  </ConfigProvider>
</template>

<script>
import ConfigProvider from '@opentiny/vue-config-provider'
import designSaasConfig from '@opentiny/vue-design-saas'
import TinySearchBox from '@opentiny/vue-search-box-saas'

export default {
  components: {
    ConfigProvider,
    TinySearchBox
  },
  data() {
    return {
      designSaasConfig,
      tags: [],
      items: [
        {
          label: '名称',
          field: 'name',
          options: [
            { label: '选项1' },
            { label: '选项2' }
          ]
        }
      ]
    }
  }
}
</script>
```

---

## 📦 版本说明

### 包名和版本对应表

| 包名                          | Vue 版本 | 主题风格 | 版本号  |
| ----------------------------- | -------- | -------- | ------- |
| `@opentiny/vue-search-box`    | Vue 3    | 普通主题 | 3.27.1  |
| `@opentiny/vue-search-box`    | Vue 2    | 普通主题 | 2.27.1  |
| `@opentiny/vue-search-box-saas` | Vue 3    | SaaS 主题 | 3.27.1  |
| `@opentiny/vue-search-box-saas` | Vue 2    | SaaS 主题 | 2.27.1  |

**选择指南**：

- 🎯 **Vue 3 项目**：使用 `3.27.1` 版本
- 🎯 **Vue 2 项目**：使用 `2.27.1` 版本
- 🎨 **喜欢现代风格**：选择 `-saas` 包
- 🎨 **喜欢传统风格**：选择普通包

---

## 🎨 SaaS 主题 vs 普通主题

### 普通主题

- 经典的企业级 UI 风格
- 适合传统后台管理系统
- 样式简洁、稳重

### SaaS 主题 ✨

- 现代化的 SaaS 应用风格
- 使用 Tailwind CSS 构建
- 更轻盈、更现代的设计
- 支持更灵活的样式定制

**视觉效果对比**：

```
普通主题：稳重、经典、企业级
SaaS 主题：轻盈、现代、SaaS 风格
```

---

## 🛠️ 技术实现：Renderless 架构

### 🤔 为什么能做到"一套代码，四个版本"？

答案就是：**Renderless 架构**！

### 核心思路

```
┌─────────────────────────────────────┐
│     一套源代码 (src/)                │
│  - index.ts (入口)                  │
│  - pc.vue (模板)                    │
│  - renderless.ts (逻辑)              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   构建时适配 (vite.config.*.ts)     │
│  - vue2.ts → Vue 2 构建             │
│  - vue3.ts → Vue 3 构建             │
│  - vue2-saas.ts → Vue 2 + SaaS      │
│  - vue3-saas.ts → Vue 3 + SaaS      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   四个独立包 (dist/)                │
│  - vue2/                             │
│  - vue2-saas/                        │
│  - vue3/                             │
│  - vue3-saas/                        │
└─────────────────────────────────────┘
```

### 关键技术点

#### 1. **@opentiny/vue-common - 兼容层魔法**

`vue-common` 是核心兼容层，它：

- 提供统一的 API（`defineComponent`、`setup`、`reactive` 等）
- 自动适配 Vue 2 和 Vue 3 的差异
- 让开发者无需关心底层实现

```typescript
// 在 renderless.ts 中
import { defineComponent, setup } from '@opentiny/vue-common'

// 这个代码在 Vue 2 和 Vue 3 中都能运行！
export const renderless = (props, hooks, context) => {
  const { reactive, computed, watch } = hooks
  // ... 业务逻辑
}
```

#### 2. **逻辑与模板分离**

- **模板层**（`pc.vue`）：只负责 UI 展示
- **逻辑层**（`renderless.ts`）：处理所有业务逻辑
- **入口层**（`index.ts`）：统一对外接口

这样的设计让：
- 逻辑可以在不同版本间复用
- 模板可以根据版本调整
- 代码组织更清晰

#### 3. **构建时适配**

通过不同的 Vite 配置，在构建时：

- **Vue 2 版本**：使用 `vite-plugin-vue2` 和 Vue 2 运行时
- **Vue 3 版本**：使用 `@vitejs/plugin-vue` 和 Vue 3 运行时
- **SaaS 主题**：使用 `theme-saas/` 目录的样式，并启用 Tailwind CSS

```typescript
// vite.config.vue2.ts
import vue2 from 'vite-plugin-vue2'
// 使用 Vue 2 构建

// vite.config.vue3-saas.ts
import vue from '@vitejs/plugin-vue'
// 使用 Vue 3 + SaaS 主题构建
```

#### 4. **样式系统**

- **普通主题**：使用 Less，编译为 CSS
- **SaaS 主题**：使用 Less + Tailwind CSS，通过 PostCSS 处理

```less
// theme/index.less - 普通主题
.tv-search-box {
  // 传统样式
}

// theme-saas/index.less - SaaS 主题
.tv-search-box {
  @apply flex items-center; // Tailwind 类
}
```

---

## 💡 实现方案详解

### 方案架构图

```
源代码层
├── src/
│   ├── index.ts          # 组件入口
│   ├── pc.vue            # 模板（UI）
│   ├── renderless.ts     # 逻辑（业务）
│   └── composables/      # 功能模块
│
构建配置层
├── vite.config.vue2.ts           # Vue 2 构建
├── vite.config.vue2-saas.ts      # Vue 2 + SaaS
├── vite.config.vue3.ts            # Vue 3 构建
└── vite.config.vue3-saas.ts       # Vue 3 + SaaS
│
样式层
├── theme/                # 普通主题样式
│   └── index.less
└── theme-saas/          # SaaS 主题样式
    └── index.less
│
输出层
└── dist/
    ├── vue2/            # Vue 2 普通主题包
    ├── vue2-saas/       # Vue 2 SaaS 主题包
    ├── vue3/            # Vue 3 普通主题包
    └── vue3-saas/       # Vue 3 SaaS 主题包
```

### 关键技术实现

#### 1. Renderless 函数签名

```typescript
export const renderless = (
  props,                    // 组件属性
  hooks,                    // Vue 响应式 API（来自 vue-common）
  context                   // 上下文（emit, nextTick, vm 等）
) => {
  // 业务逻辑
  return api                // 返回给模板使用的 API
}
```

**关键点**：
- `hooks` 来自 `vue-common`，自动适配 Vue 2/3
- `context` 统一了 Vue 2/3 的差异（如 `emit`、`slots`）
- 返回的 `api` 对象会被注入到模板中

#### 2. 模板连接

```vue
<!-- pc.vue -->
<script lang="ts">
import { defineComponent, setup } from '@opentiny/vue-common'
import { renderless, api } from './renderless'

export default defineComponent({
  setup(props, context) {
    // 关键：通过 setup 连接 renderless
    return setup({ props, context, renderless, api })
  }
})
</script>
```

**关键点**：
- `setup` 函数来自 `vue-common`
- 自动处理 Vue 2/3 的差异
- 将 `renderless` 返回的 API 注入到模板

#### 3. 构建时主题切换

```typescript
// vite.config.vue3-saas.ts
includeStyle({
  lessSrcPath: resolve(__dirname, 'theme-saas/index.less'), // SaaS 主题
  isSaas: true,  // 启用 Tailwind 处理
  postcssConfigPath: resolve(__dirname, 'postcss.config.cjs'),
  tailwindConfigPath: resolve(__dirname, 'tailwind.config.cjs')
})
```

**关键点**：
- 构建时选择不同的样式文件
- SaaS 版本启用 Tailwind CSS 处理
- 普通版本直接编译 Less

---

## 🎯 使用场景

### 场景 1：Vue 2 老项目升级

**问题**：你的项目还在用 Vue 2，但想用现代化的搜索组件？

**解决方案**：直接安装 Vue 2 版本！

```bash
npm install @opentiny/vue-search-box@2.27.1
```

无需升级 Vue，无需重构代码，**开箱即用**！

### 场景 2：Vue 3 新项目

**问题**：新项目想用最新的技术栈？

**解决方案**：使用 Vue 3 版本！

```bash
npm install @opentiny/vue-search-box@3.27.1
```

享受 Vue 3 的性能优势和 Composition API！

### 场景 3：SaaS 应用

**问题**：你的应用是 SaaS 风格，需要现代化的 UI？

**解决方案**：使用 SaaS 主题包！

```bash
npm install @opentiny/vue-search-box-saas@3.27.1
```

现代化的设计，Tailwind CSS 加持，**颜值爆表**！

### 场景 4：企业级后台

**问题**：传统企业后台，需要稳重的 UI？

**解决方案**：使用普通主题包！

```bash
npm install @opentiny/vue-search-box@3.27.1
```

经典的企业级风格，**稳重可靠**！

---

## 🔥 核心优势

### 1. **真正的"一次编写，到处运行"**

- ✅ 一套源代码
- ✅ 四个构建版本
- ✅ 零代码差异

### 2. **完美的兼容性**

- ✅ Vue 2.6.14+ 支持
- ✅ Vue 3.x 支持
- ✅ TypeScript 支持
- ✅ 完整的类型定义

### 3. **灵活的主题系统**

- ✅ 普通主题：经典企业级风格
- ✅ SaaS 主题：现代化 SaaS 风格
- ✅ 支持样式定制
- ✅ Tailwind CSS 支持（SaaS 版本）

### 4. **优秀的开发体验**

- ✅ 完整的 TypeScript 类型
- ✅ 详细的文档和示例
- ✅ 丰富的 API
- ✅ 活跃的社区支持

---

## 📚 文档资源

- 📖 [使用指南](https://github.com/opentiny/tiny-search-box)
- 🎨 [SaaS 模式开发指南](https://github.com/opentiny/tiny-search-box)
- 🛠️ [Renderless 架构详解](./RENDERLESS_GUIDE.md)
- 💻 [在线示例](https://github.com/opentiny/tiny-search-box)

---

## 🎊 总结

**TinySearchBox** 现在真正做到了：

- 🎯 **Vue 2 和 Vue 3 全支持** - 无论你的项目是什么版本
- 🎨 **普通和 SaaS 双主题** - 无论你喜欢什么风格
- 🚀 **一套代码，四个版本** - 维护成本低，兼容性高
- 💪 **Renderless 架构** - 代码组织清晰，易于扩展

**还在等什么？赶紧试试吧！** 🎉

```bash
# Vue 3 项目
npm install @opentiny/vue-search-box@3.27.1

# Vue 2 项目
npm install @opentiny/vue-search-box@2.27.1

# SaaS 主题（Vue 3）
npm install @opentiny/vue-search-box-saas@3.27.1

# SaaS 主题（Vue 2）
npm install @opentiny/vue-search-box-saas@2.27.1
```

---

## 🤝 贡献与反馈

- 🐛 发现问题？[提交 Issue](https://github.com/opentiny/tiny-search-box/issues)
- 💡 有好的想法？[提交 PR](https://github.com/opentiny/tiny-search-box/pulls)
- ⭐ 觉得不错？给个 Star 吧！

---

**Happy Coding! 🎉**

> 记住：选择 TinySearchBox，就是选择了**兼容性**、**灵活性**和**可维护性**！

