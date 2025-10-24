<template>
  <div tiny_mode="pc">
    <tiny-dropdown-item
      v-show="state.inputValue.trim()"
      class="tvp-search-box__filter-item tvp-search-box__dropdown-item tvp-search-box__dropdown-item-init"
      @click="selectInputValue(state.inputValue)"
    >
      <span> {{ t("tvp.tvpSearchbox.initUse") }}＂{{ state.inputValue }}＂</span>
    </tiny-dropdown-item>
    <div v-show="!state.propItem.label && state.inputValue.trim()">
      <div v-for="(value, key) in state.matchItems" :key="key">
        <div v-if="value['attr'].length">
          <span class="tvp-search-box__filter-type">{{
            key === "0" ? t("tvp.tvpSearchbox.attributeType") : key
          }}</span>
          <tiny-dropdown-item
            v-for="(item, index) in value['attr']"
            :key="item.label + index"
            class="tvp-search-box__filter-item tvp-search-box__dropdown-item"
            @click="selectPropItem(item)"
          >
            <span>
              <span v-for="text in item.match" :key="text">
                <span
                  v-if="text.toLowerCase() === item.hightlighStr"
                  class="tvp-search-box__text-highlight"
                  >{{ text }}</span
                >
                <span v-else>{{ text }}</span>
              </span>
            </span>
          </tiny-dropdown-item>
        </div>
        <template v-if="value['attrValue'].length">
          <span class="tvp-search-box__filter-type">{{
            t("tvp.tvpSearchbox.propertyValue", [
              key === "0" ? t("tvp.tvpSearchbox.attributeType") : key,
            ])
          }}</span>
          <tiny-dropdown-item
            v-for="(item, index) in value['attrValue']"
            :key="item.label + index"
            :disabled="item.isChecked"
            class="tvp-search-box__filter-item tvp-search-box__dropdown-item"
            @click="selectRadioItem(item, true)"
          >
            <span>
              <span v-for="text in item.match" :key="text">
                <span
                  v-if="text.toLowerCase() === item.hightlighStr"
                  class="tvp-search-box__text-highlight"
                  >{{ text }}</span
                >
                <span v-else>{{ text }}</span>
              </span>
            </span>
          </tiny-dropdown-item>
        </template>
      </div>
      <div v-show="state.potentialOptions">
        <span class="tvp-search-box__filter-type">{{
          t("tvp.tvpSearchbox.matched")
        }}</span>
        <div id="potential-loading" class="tvp-search-box__potential-box">
          <div v-if="state.potentialOptions">
            <tiny-dropdown-item
              v-for="(item, index) in state.potentialOptions"
              :key="item.label + index"
              class="tvp-search-box__filter-item tvp-search-box__dropdown-item"
              @click="selectRadioItem(item, true)"
            >
              {{ item.label }}：
              <span class="tvp-search-box__text-highlight">{{ item.value }}</span>
            </tiny-dropdown-item>
          </div>
        </div>
      </div>
    </div>
    <div
      v-show="state.visible && !state.propItem.label && !state.inputValue.trim()"
      class="tvp-search-box__first-panel"
    >
      <div v-for="(group, key) in state.groupItems" :key="key">
        <span v-if="group.length" class="tvp-search-box__filter-type">{{
          key === "0" ? t("tvp.tvpSearchbox.attributeType") : key
        }}</span>
        <tiny-dropdown-item
          v-for="(item, index) in group"
          :key="(item.field || item.label) + index"
          class="tvp-search-box__dropdown-item"
          @click="selectPropItem(item)"
        >
          <span :title="item.label">{{ item.label }}</span>
        </tiny-dropdown-item>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// import { defineComponent, getCurrentInstance } from 'vue'
import { defineComponent, getCurrentInstance, isVue2 } from "vue-demi";
import TinyDropdownItem from "@opentiny/vue-dropdown-item";
import { useEmitter } from "../utils/index";
import { createSimpleEmitter } from "../utils/emitter";

import { t } from "../index";
import "../index.less";

export default defineComponent({
  name: "TinySearchBoxFirstLevelPanel",
  components: {
    TinyDropdownItem,
  },
  props: {
    state: {
      type: Object,
      default: () => ({}),
    },
    potentialOptions: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["events", "selectInputValue", "selectPropItem", "selectRadioItem"],
  setup() {
    const emit = useEmitter();
    const instance = getCurrentInstance();

    // 在 Vue 2 中设置 emit，但添加额外的保护措施
    if (isVue2 && instance && instance.proxy) {
      // 确保 $emitter 属性存在，避免第三方组件库访问时出错
      if (!instance.proxy.$emitter) {
        instance.proxy.$emitter =
          (instance.proxy.$root && instance.proxy.$root.$emitter) ||
          createSimpleEmitter();
      }
      // 保持组合式 emit 的功能（覆盖 $emit），同时不破坏 $emitter 对象
      instance.proxy.$emit = emit;
    }

    const events = (eventName: string, p1?: any, p2?: any) => {
      emit("events", eventName, p1, p2);
    };
    const selectInputValue = (e: any) => {
      events("selectInputValue", e);
    };
    const selectPropItem = (e: any) => {
      events("selectPropItem", e);
    };
    const selectRadioItem = (e: any, v: any) => {
      events("selectRadioItem", e, v);
    };

    // 暴露给模板的方法
    return {
      t,
      events,
      selectInputValue,
      selectPropItem,
      selectRadioItem,
    };
  },
});
</script>
