<!--
 * Copyright (c) 2022 - present TinyVue Authors.
 * Copyright (c) 2022 - present Huawei Cloud Computing Technologies Co., Ltd.
 *
 * Use of this source code is governed by an MIT-style license.
 *
 * THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL,
 * BUT WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR
 * A PARTICULAR PURPOSE. SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
 *
 -->
<template>
  <div class="tvp-search-box-mobile" @click.stop="showPopover(state, false)">
    <!-- 移动端简化版本 -->
    <tiny-input
      v-model="state.inputValue"
      class="tvp-search-box__input"
      :placeholder="placeholder"
      tiny_mode="mobile-first"
      @keydown.enter.stop="createTag"
      @input="handleInput"
      @click="handleClick"
    >
      <template #suffix>
        <tiny-icon-search class="tvp-search-box__input-search" tiny_mode="mobile-first" @click.stop="createTag" />
      </template>
    </tiny-input>
    
    <!-- 移动端标签显示 -->
    <div v-if="modelValue.length" class="tvp-search-box__tags">
      <tiny-tag
        v-for="(tag, index) in modelValue"
        :key="tag.field + index"
        closable
        tiny_mode="mobile-first"
        @close="deleteTag(tag)"
      >
        {{ tag.label }} {{ tag.operator || ':' }} {{ tag.value }}
      </tiny-tag>
    </div>
  </div>
</template>
