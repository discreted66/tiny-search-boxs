<template>
  <div class="tvp-search-box" @click.stop="handleClick">
    <tiny-icon-search class="tvp-search-box__prefix" tiny_mode="pc" />
    <tiny-tag
      v-for="(tag, index) in modelValue"
      :key="tag.field + index"
      closable
      tiny_mode="pc"
      :class="['tvp-search-box__tag', editable && tag.type !== 'map' ? 'tvp-search-box__tag-editor' : '']"
      :title="`${tag.label} ${tag.operator || ':'} ${tag.value}`"
      @close="deleteTag(tag)"
      @click.stop="editTag(tag, index, $event)"
    >
      <span class="tvp-search-box__tag-value">{{ tag.label }} {{ tag.operator || ':' }} {{ tag.value }} </span>
    </tiny-tag>
    <span v-if="modelValue.length" class="tvp-search-box__placeholder"></span>

    <tiny-form
      v-if="state.instance"
      ref="formRef"
      :model="state"
      :rules="state.formRules"
      :validate-type="state.validType"
      label-width="0px"
      message-type="block"
      tiny_mode="pc"
      class="tvp-search-box__form"
    >
      <div class="tvp-search-box__input-wrapper">
        <section class="tvp-search-box__prop">
          <span v-show="state.propItem.label"
            >{{ state.propItem.label }}&nbsp;{{ `${state.operatorValue ? state.operatorValue : ''}&nbsp;` }}</span
          >
          <span v-show="state.propItem.value">{{ state.propItem.value }}</span>
        </section>
        <tiny-dropdown
          ref="dropdownRef"
          :visible.sync="state.visible"
          trigger="click"
          class="tvp-search-box__dropdown"
          :show-icon="false"
          lazy-show-popper
          :close-on-click-outside="true"
          tiny_mode="pc"
        >
          <tiny-input
            ref="inputRef"
            v-model="state.inputValue"
            class="tvp-search-box__input"
            :placeholder="placeholder"
            :maxlength="maxlength && maxlength + 1"
            tiny_mode="pc"
            @keydown.delete.stop="backspaceDeleteTag"
            @keydown.enter.stop="createTag"
            @input="handleInput"
            @click="handleClick"
          >
            <template #suffix>
              <tiny-icon-close v-show="isShowClose" class="tvp-search-box__input-close" tiny_mode="pc" @click.stop="clearTag" />
              <span v-show="isShowClose" class="tvp-search-box__input-separator"></span>
              <tiny-tooltip v-if="showHelp" effect="light" :content="t('tvp.tvpSearchbox.help')" placement="top" tiny_mode="pc">
                <tiny-icon-help-query class="tvp-search-box__input-help" tiny_mode="pc" @click.stop="helpClick" />
              </tiny-tooltip>
              <tiny-icon-search class="tvp-search-box__input-search" tiny_mode="pc" @click.stop="createTag" />
            </template>
          </tiny-input>
          <template #dropdown>
            <tiny-dropdown-menu tiny_mode="pc"
              placement="bottom-start"
              popper-class="tvp-search-box__dropdown-menu"
              :style="{ 'max-height': panelMaxHeight }"
              @mouseup.stop="() => {}"
            >
              <div v-show="!state.propItem.label || state.inputValue.trim()">
                <slot
                  name="first-panel"
                  v-bind="{
                    state,
                    handleEvents
                  }"
                ></slot>
              </div>
              <div v-show="state.propItem.label && !state.inputValue.trim()">
                <slot
                  name="second-panel"
                  v-bind="{
                    state,
                    handleEvents,
                    pickerOptions
                  }"
                ></slot>
              </div>
            </tiny-dropdown-menu>
          </template>
        </tiny-dropdown>
      </div>

      <template v-if="editable">
        <tiny-popover
          ref="popoverRef"
          v-model="state.popoverVisible"
          placement="bottom-start"
          :visible-arrow="false"
          trigger="manual"
          popper-class="tvp-search-box__popover"
          class="tvp-search-box__form-popover"
          tiny_mode="pc"
        >
          <template v-if="state.prevItem.type !== 'custom'">
            <div class="tvp-search-box__date-wrap">
              <div class="tvp-search-box__dropdown-start">
                {{ t('tvp.tvpSearchbox.attributeType') }}
              </div>
              <tiny-form-item class="tvp-search-box__number-item" tiny_mode="pc">
                <tiny-select v-model="state.selectValue" searchable :disabled="state.prevItem.editAttrDisabled" tiny_mode="pc">
                  <tiny-option
                    :key="state.allTypeAttri.label"
                    :label="t('tvp.tvpSearchbox.allProperty')"
                    :value="state.allTypeAttri.label"
                    tiny_mode="pc"
                  ></tiny-option>
                  <tiny-option
                    v-for="item in state.backupList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="selectItemIsDisable(item)"
                    tiny_mode="pc"
                  ></tiny-option>
                  <tiny-option
                    v-for="item in state.filterList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="selectItemIsDisable(item)"
                    tiny_mode="pc"
                  ></tiny-option>
                </tiny-select>
              </tiny-form-item>
              <tiny-form-item v-if="state.prevItem.operators" class="tvp-search-box__number-item" tiny_mode="pc">
                <tiny-select v-model="state.operatorValue" tiny_mode="pc">
                  <tiny-option v-for="item in state.currentOperators" :key="item" :label="item" :value="item" tiny_mode="pc">
                  </tiny-option>
                </tiny-select>
              </tiny-form-item>
              <tiny-form-item
                v-if="state.prevItem.type === 'radio' || state.prevItem.type === 'checkbox'"
                class="tvp-search-box__number-item"
                tiny_mode="pc"
              >
                <tiny-select
                  v-if="state.prevItem.type === 'radio'"
                  v-model="state.inputEditValue"
                  :placeholder="t('tvp.tvpSearchbox.pleaseSelect')"
                  tiny_mode="pc"
                >
                  <tiny-option
                    v-for="item in state.filterList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    tiny_mode="pc"
                  ></tiny-option>
                </tiny-select>
                <tiny-input v-else v-model="state.inputEditValue" clearable tiny_mode="pc"></tiny-input>
              </tiny-form-item>
              <div v-if="state.prevItem.type === 'number'">
                <tiny-form-item
                  v-if="state.prevItem.min !== undefined"
                  :prop="state.curMinNumVar"
                  class="tvp-search-box__number-item"
                  tiny_mode="pc"
                >
                  <tiny-input
                    v-model="state.startDate"
                    :placeholder="t('tvp.tvpSearchbox.minValue')"
                    tiny_mode="pc"
                  ></tiny-input>
                </tiny-form-item>
                <tiny-form-item :prop="state.curMaxNumVar" class="tvp-search-box__number-item" tiny_mode="pc">
                  <tiny-input
                    v-model="state.endDate"
                    :placeholder="t('tvp.tvpSearchbox.maxValue')"
                    tiny_mode="pc"
                  ></tiny-input>
                </tiny-form-item>
              </div>
              <div v-if="state.prevItem.type === 'date'">
                <tiny-form-item
                  v-if="state.prevItem.min !== undefined"
                  :prop="state.curMinNumVar"
                  class="tvp-search-box__date-item"
                  tiny_mode="pc"
                >
                  <tiny-date-picker
                    v-model="state.startDate"
                    type="date"
                    :isutc8="true"
                    :format="state.prevItem.format || state.dateRangeFormat"
                    :value-format="state.prevItem.format || state.dateRangeFormat"
                    :picker-options="pickerOptions(state.startDate)"
                    class="tvp-search-box__date-picker"
                    tiny_mode="pc"
                  ></tiny-date-picker>
                </tiny-form-item>
                <tiny-form-item prop="endDate" class="tvp-search-box__date-item" tiny_mode="pc">
                  <tiny-date-picker
                    v-model="state.endDate"
                    type="date"
                    :isutc8="true"
                    :format="state.prevItem.format || state.dateRangeFormat"
                    :value-format="state.prevItem.format || state.dateRangeFormat"
                    :picker-options="pickerOptions(state.startDate)"
                    class="tvp-search-box__date-picker"
                    tiny_mode="pc"
                  ></tiny-date-picker>
                </tiny-form-item>
              </div>
              <div v-if="state.prevItem.type === 'datetime'">
                <tiny-form-item
                  v-if="state.prevItem.min !== undefined"
                  :prop="state.curMinNumVar"
                  class="tvp-search-box__date-item"
                  tiny_mode="pc"
                >
                  <tiny-date-picker
                    v-model="state.startDateTime"
                    type="datetime"
                    :isutc8="true"
                    :format="state.prevItem.format || state.datetimeRangeFormat"
                    :value-format="state.prevItem.format || state.datetimeRangeFormat"
                    :picker-options="pickerOptions(state.startDateTime)"
                    class="tvp-search-box__date-picker"
                    tiny_mode="pc"
                  ></tiny-date-picker>
                </tiny-form-item>
                <div class="tvp-search-box__dropdown-end">{{ t('tvp.tvpSearchbox.rangeEndLabel') }}</div>
                <tiny-form-item prop="endDateTime" class="tvp-search-box__date-item" tiny_mode="pc">
                  <tiny-date-picker
                    v-model="state.endDateTime"
                    type="datetime"
                    :isutc8="true"
                    :format="state.prevItem.format || state.datetimeRangeFormat"
                    :value-format="state.prevItem.format || state.datetimeRangeFormat"
                    :picker-options="pickerOptions(state.startDateTime)"
                    class="tvp-search-box__date-picker"
                    tiny_mode="pc"
                  ></tiny-date-picker>
                </tiny-form-item>
              </div>
            </div>
            <div class="tvp-search-box__bottom-btn">
              <tiny-button tiny_mode="pc" size="mini" @click="confirmEditTag(false)">
                {{ t('tvp.tvpSearchbox.cancel') }}
              </tiny-button>
              <tiny-button tiny_mode="pc" size="mini" @click="confirmEditTag(true)">
                {{ t('tvp.tvpSearchbox.confirm') }}
              </tiny-button>
            </div>
          </template>
          <div v-else class="tvp-search-box__panel-box">
            <slot
              :name="`${state.prevItem.slotName}-edit`"
              v-bind="{
                showDropdown: () => showPopover(this, true),
                onConfirm: handleEditConfirm
              }"
              @click.stop
            ></slot>
          </div>
        </tiny-popover>
      </template>
    </tiny-form>
  </div>
</template>

<script>
// Vue2 版本，使用标准 Options API
import TinyTag from '@opentiny/vue-tag'
import TinyInput from '@opentiny/vue-input'
import TinyDropdown from '@opentiny/vue-dropdown'
import TinyDropdownMenu from '@opentiny/vue-dropdown-menu'
import TinyButton from '@opentiny/vue-button'
import TinyButtonGroup from '@opentiny/vue-button-group'
import TinyTooltip from '@opentiny/vue-tooltip'
import TinyDatePicker from '@opentiny/vue-date-picker'
import TinyForm from '@opentiny/vue-form'
import TinyFormItem from '@opentiny/vue-form-item'
import TinyPopover from '@opentiny/vue-popover'
import TinySelect from '@opentiny/vue-select'
import TinyOption from '@opentiny/vue-option'

import { iconSearch, iconClose, iconHelpQuery } from '@opentiny/vue-icon'

import '../../style/index.less'

export default {
  name: 'TinySearchBox',
  components: {
    TinyTag,
    TinyInput,
    TinyDropdown,
    TinyDropdownMenu,
    TinyButton,
    TinyButtonGroup,
    TinyTooltip,
    TinyDatePicker,
    TinyForm,
    TinyFormItem,
    TinyPopover,
    TinySelect,
    TinyOption,
    // 图标组件
    TinyIconSearch: iconSearch(),
    TinyIconClose: iconClose(),
    TinyIconHelpQuery: iconHelpQuery()
  },
  props: {
    tiny_mode: {
      type: String,
      default: 'pc'
    },
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
      default: () => null
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
    maxlength: {
      type: Number,
      default: undefined
    },
    panelMaxHeight: {
      type: String,
      default: '999px'
    },
    splitInputValue: {
      type: String,
      default: ','
    }
  },
  emits: ['update:modelValue', 'change', 'search', 'exceed', 'first-level-select', 'clear'],
  data() {
    return {
      state: {
        innerModelValue: [...this.modelValue],
        recordItems: [],
        groupItems: {},
        inputValue: '',
        matchItems: {},
        propItem: {},
        backupList: [],
        filterList: [],
        checkboxGroup: [],
        prevItem: {},
        backupPrevItem: '',
        formRules: null,
        validType: 'text',
        numberShowMessage: true,
        startDate: null,
        startDateTime: null,
        endDate: null,
        endDateTime: null,
        isShowTagKey: true,
        potentialOptions: null,
        dateRangeFormat: 'yyyy/MM/dd',
        datetimeRangeFormat: 'yyyy/MM/dd HH:mm:ss',
        indexMap: new Map(),
        valueMap: new Map(),
        popoverVisible: false,
        selectValue: '',
        allTypeAttri: {
          label: '关键词',
          field: 'tvpKeyword',
          type: 'radio'
        },
        operatorValue: ':',
        inputEditValue: '',
        currentOperators: '',
        currentEditValue: '',
        currentModelValueIndex: -1,
        curMinNumVar: '',
        curMaxNumVar: '',
        instance: this,
        isMouseDown: false,
        currentEditSelectTags: [],
        visible: false,
        visibleTimer: null
      }
    }
  },
  computed: {
    placeholder() {
      return this.emptyPlaceholder || '请输入搜索内容'
    },
    isShowClose() {
      return this.modelValue.length > 0
    }
  },
  watch: {
    items: {
      handler(newVal) {
        this.state.recordItems = [...newVal]
      },
      deep: true,
      immediate: true
    },
    modelValue: {
      handler(newVal) {
        this.state.innerModelValue = [...newVal]
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    t(key, params) {
      // 简单的i18n实现
      const translations = {
        'tvp.tvpSearchbox.help': '帮助',
        'tvp.tvpSearchbox.cancel': '取消',
        'tvp.tvpSearchbox.confirm': '确认',
        'tvp.tvpSearchbox.attributeType': '属性类型',
        'tvp.tvpSearchbox.allProperty': '全部属性',
        'tvp.tvpSearchbox.pleaseSelect': '请选择',
        'tvp.tvpSearchbox.minValue': '最小值',
        'tvp.tvpSearchbox.maxValue': '最大值',
        'tvp.tvpSearchbox.rangeEndLabel': '结束时间'
      }
      return translations[key] || key
    },
    showPopover(state, visible) {
      state.popoverVisible = visible
    },
    deleteTag(tag) {
      const newValue = this.modelValue.filter(item => item !== tag)
      this.$emit('update:modelValue', newValue)
    },
    clearTag() {
      this.$emit('update:modelValue', [])
    },
    backspaceDeleteTag() {
      if (this.modelValue.length > 0) {
        const newValue = [...this.modelValue]
        newValue.pop()
        this.$emit('update:modelValue', newValue)
      }
    },
    editTag(tag, index, event) {
      // 编辑标签逻辑
      console.log('Edit tag:', tag, index)
    },
    confirmEditTag(confirm) {
      // 确认编辑逻辑
      console.log('Confirm edit:', confirm)
    },
    selectPropChange(item, disabled) {
      // 属性选择变化逻辑
      console.log('Select prop change:', item, disabled)
    },
    selectItemIsDisable(item) {
      return false
    },
    handleInput() {
      // 输入处理逻辑
    },
    handleClick(e) {
      this.showPopover(this.state, false)
    },
    pickerOptions(startDate, endDate) {
      return {}
    },
    handleConfirm(customTag) {
      // 确认处理逻辑
    },
    handleEditConfirm(customTag) {
      // 编辑确认处理逻辑
    },
    initItems() {
      // 初始化项目逻辑
    },
    initFormRule() {
      // 初始化表单规则逻辑
    },
    watchOutsideClick() {
      // 外部点击监听逻辑
    },
    watchMouseDown() {
      // 鼠标按下监听逻辑
    },
    watchMouseMove() {
      // 鼠标移动监听逻辑
    },
    setPlaceholder(placeholder) {
      // 设置占位符逻辑
    },
    createTag() {
      // 创建标签逻辑
    },
    helpClick() {
      // 帮助点击逻辑
    },
    handleEvents(eventName, p1, p2) {
      // 事件处理逻辑
      console.log('Handle event:', eventName, p1, p2)
    }
  },
  mounted() {
    // 添加事件监听
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.watchOutsideClick)
      document.addEventListener('mousedown', this.watchMouseDown)
      document.addEventListener('mousemove', this.watchMouseMove)
    }
  },
  beforeDestroy() {
    // 移除事件监听
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.watchOutsideClick)
      document.removeEventListener('mousedown', this.watchMouseDown)
      document.removeEventListener('mousemove', this.watchMouseMove)
    }
  }
}
</script>

<style scoped lang="less">
@import '../../style/index.less';
</style>
