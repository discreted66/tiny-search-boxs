<template>
  <div class="tvp-search-box-first-level-panel">
    <tiny-dropdown-item
      v-show="state.inputValue.trim()"
      class="tvp-search-box__filter-item tvp-search-box__dropdown-item tvp-search-box__dropdown-item-init"
      @click="selectInputValue(state.inputValue)"
    >
      <span> {{ t('tvp.tvpSearchbox.initUse') }}＂{{ state.inputValue }}＂</span>
    </tiny-dropdown-item>
    <div v-show="!state.propItem.label && state.inputValue.trim()">
      <span v-for="(value, key) in state.matchItems" :key="key">
        <template v-if="value['attr'].length">
          <span class="tvp-search-box__filter-type">{{ key === '0' ? t('tvp.tvpSearchbox.attributeType') : key }}</span>
          <tiny-dropdown-item
            v-for="(item, index) in value['attr']"
            :key="item.label + index"
            class="tvp-search-box__filter-item tvp-search-box__dropdown-item"
            @click="selectPropItem(item)"
          >
              <span v-for="text in item.match" :key="text">
                <span v-if="text.toLowerCase() === item.hightlighStr" class="tvp-search-box__text-highlight">{{
                  text
                }}</span>
                <template v-else>{{ text }}</template>
              </span>
          </tiny-dropdown-item>
        </template>
        <template v-if="value['attrValue'].length">
          <span class="tvp-search-box__filter-type">{{
            t('tvp.tvpSearchbox.propertyValue', [key === '0' ? t('tvp.tvpSearchbox.attributeType') : key])
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
                <span v-if="text.toLowerCase() === item.hightlighStr" class="tvp-search-box__text-highlight">{{
                  text
                }}</span>
                <template v-else>{{ text }}</template>
              </span>
            </span>
          </tiny-dropdown-item>
        </template>
      </span>
      <div v-show="state.potentialOptions">
        <span class="tvp-search-box__filter-type">{{ t('tvp.tvpSearchbox.matched') }}</span>
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
    <div v-show="state.visible && !state.propItem.label && !state.inputValue.trim()" class="tvp-search-box__first-panel">
      <span v-for="(group, key) in state.groupItems" :key="key">
        <span v-if="group.length" class="tvp-search-box__filter-type">{{
          key === '0' ? t('tvp.tvpSearchbox.attributeType') : key
        }}</span>
        <tiny-dropdown-item
          v-for="(item, index) in group"
          :key="(item.field || item.label) + index"
          class="tvp-search-box__dropdown-item"
          @click="selectPropItem(item)"
        >
          <span :title="item.label">{{ item.label }}</span>
        </tiny-dropdown-item>
      </span>
    </div>
  </div>
</template>

<script>
// Vue2 版本的 first-level-panel 组件
import TinyDropdownItem from '@opentiny/vue-dropdown-item'
import '../index.less'

export default {
  name: 'TinySearchBoxFirstLevelPanel',
  components: {
    TinyDropdownItem
  },
  props: {
    state: {
      type: Object,
      default: () => ({})
    },
    potentialOptions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['events', 'selectInputValue', 'selectPropItem', 'selectRadioItem'],
  methods: {
    t(key, params) {
      const translations = {
        'tvp.tvpSearchbox.initUse': '使用',
        'tvp.tvpSearchbox.attributeType': '属性类型',
        'tvp.tvpSearchbox.propertyValue': '{0}属性值',
        'tvp.tvpSearchbox.matched': '匹配项'
      }
      let result = translations[key] || key
      if (params && Array.isArray(params)) {
        params.forEach((param, index) => {
          result = result.replace(`{${index}}`, param)
        })
      }
      return result
    },
    events(eventName, p1, p2) {
      this.$emit('events', eventName, p1, p2)
    },
    selectInputValue(e) {
      this.events('selectInputValue', e)
    },
    selectPropItem(e) {
      this.events('selectPropItem', e)
    },
    selectRadioItem(e, v) {
      this.events('selectRadioItem', e, v)
    }
  }
}
</script>