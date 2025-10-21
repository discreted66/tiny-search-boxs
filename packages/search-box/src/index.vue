<template>
  <div class="tvp-search-box" @click.stop="showPopover(state, false)">
    <tiny-icon-search class="tvp-search-box__prefix" />
    <tiny-tag
      v-for="(tag, index) in modelValue"
      :key="tag.field + index"
      closable
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
        >
          <tiny-input
            ref="inputRef"
            v-model="state.inputValue"
            class="tvp-search-box__input"
            :placeholder="placeholder"
            :maxlength="maxlength && maxlength + 1"
            @keydown.delete.stop="backspaceDeleteTag"
            @keydown.enter.stop="createTag"
            @input="handleInput"
            @click="handleClick"
          >
            <template #suffix>
              <tiny-icon-close v-show="isShowClose" class="tvp-search-box__input-close" @click.stop="clearTag" />
              <span v-show="isShowClose" class="tvp-search-box__input-separator"></span>
              <tiny-tooltip v-if="showHelp" effect="light" :content="t('tvp.tvpSearchbox.help')" placement="top">
                <tiny-icon-help-query class="tvp-search-box__input-help" @click.stop="helpClick" />
              </tiny-tooltip>
              <tiny-icon-search class="tvp-search-box__input-search" @click.stop="createTag" />
            </template>
          </tiny-input>
          <template #dropdown>
            <tiny-dropdown-menu
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
                  @click.stop
                >
                  <TinySearchBoxFirstLevelPanel :state="state" @events="handleEvents"></TinySearchBoxFirstLevelPanel>
                </slot>
              </div>
              <!-- 有label的情况 -->
              <div v-show="state.propItem.label">
                <slot
                  name="second-panel"
                  v-bind="{
                    state,
                    pickerOptions,
                    handleEvents,
                    back: () => resetInput(state)
                  }"
                  @click.stop
                >
                  <TinySearchBoxSecondLevelPanel
                    v-if="state.prevItem.type !== 'custom'"
                    :state="state"
                    :picker-options="pickerOptions"
                    @events="handleEvents"
                  ></TinySearchBoxSecondLevelPanel>
                  <div v-else class="tvp-search-box__panel-box" @click="showDropdown(state)">
                    <slot
                      :name="state.prevItem.slotName"
                      v-bind="{
                        showDropdown: () => showDropdown(state),
                        onConfirm: handleConfirm
                      }"
                      @click.stop
                    ></slot>
                  </div>
                </slot>
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
        >
          <template v-if="state.prevItem.type !== 'custom'">
            <div class="tvp-search-box__date-wrap">
              <div class="tvp-search-box__dropdown-start">
                {{ t('tvp.tvpSearchbox.attributeType') }}
              </div>
              <tiny-form-item class="tvp-search-box__number-item">
                <tiny-select v-model="state.selectValue" searchable :disabled="state.prevItem.editAttrDisabled">
                  <tiny-option
                    :key="state.allTypeAttri.label"
                    :label="t('tvp.tvpSearchbox.allProperty')"
                    :value="state.allTypeAttri.label"
                    :disabled="selectItemIsDisable(state.allTypeAttri)"
                    @click="selectPropChange(state.allTypeAttri, selectItemIsDisable(state.allTypeAttri))"
                  >
                  </tiny-option>
                  <tiny-option
                    v-for="item in state.recordItems"
                    :key="item.label"
                    :label="item.label"
                    :value="item.label"
                    :disabled="selectItemIsDisable(item)"
                    @click="selectPropChange(item, selectItemIsDisable(item))"
                  >
                  </tiny-option>
                </tiny-select>
              </tiny-form-item>
              <div v-if="state.prevItem.operators" class="tvp-search-box__dropdown-end">
                {{ t('tvp.tvpSearchbox.operator') }}
              </div>
              <tiny-form-item v-if="state.prevItem.operators" class="tvp-search-box__number-item">
                <tiny-select v-model="state.operatorValue">
                  <tiny-option v-for="item in state.currentOperators" :key="item" :label="item" :value="item">
                  </tiny-option>
                </tiny-select>
              </tiny-form-item>
              <div v-if="state.prevItem.type !== 'numRange'" class="tvp-search-box__dropdown-end">
                {{ t('tvp.tvpSearchbox.tagValue') }}
              </div>
              <tiny-form-item
                v-if="!['numRange', 'dateRange', 'datetimeRange', 'custom'].includes(state.prevItem.type)"
                prop="inputEditValue"
                class="tvp-search-box__number-item"
              >
                <tiny-select
                  v-if="state.currentEditValue?.length > 0"
                  v-model="state.inputEditValue"
                  class="tvp-search-box-select"
                  :multiple="Boolean(state.prevItem.mergeTag)"
                  :allow-create="state.prevItem?.allowCreate"
                  filterable
                  default-first-option
                  clearable
                >
                  <tiny-option
                    v-for="item in state.currentEditValue"
                    :key="item.label"
                    :label="item.label"
                    :value="item.label"
                  >
                  </tiny-option>
                </tiny-select>
                <tiny-input v-else v-model="state.inputEditValue" clearable></tiny-input>
              </tiny-form-item>
              <div v-if="state.prevItem.type === 'numRange'" class="tvp-search-box__number">
                <div class="tvp-search-box__dropdown-start">
                  {{ t('tvp.tvpSearchbox.minValueText') }}({{ state.prevItem.unit }})
                </div>
                <tiny-form-item
                  :prop="state.curMinNumVar"
                  class="tvp-search-box__number-item"
                  :show-message="state.numberShowMessage"
                >
                  <tiny-input
                    v-model="state[state.curMinNumVar]"
                    type="number"
                    class="tvp-search-box__number-input"
                  ></tiny-input>
                </tiny-form-item>
                <div class="tvp-search-box__dropdown-end">
                  {{ t('tvp.tvpSearchbox.maxValueText') }}({{ state.prevItem.unit }})
                </div>
                <tiny-form-item :prop="state.curMaxNumVar" class="tvp-search-box__number-item">
                  <tiny-input
                    v-model="state[state.curMaxNumVar]"
                    type="number"
                    class="tvp-search-box__number-input"
                  ></tiny-input>
                </tiny-form-item>
              </div>
              <div v-if="state.prevItem.type === 'dateRange'" class="tvp-search-box__date-wrap">
                <div class="tvp-search-box__dropdown-title">
                  {{
                    state.prevItem.maxTimeLength > 0
                      ? t('tvp.tvpSearchbox.timeLengthTitle').replace(
                          '{value}',
                          (state.prevItem.maxTimeLength / 86400000).toFixed(1)
                        )
                      : t('tvp.tvpSearchbox.rangeDateTitle')
                  }}
                </div>
                <div class="tvp-search-box__dropdown-start">{{ t('tvp.tvpSearchbox.rangeBeginLabel') }}</div>
                <tiny-form-item
                  prop="startDate"
                  :show-message="Boolean(state.prevItem.maxTimeLength)"
                  class="tvp-search-box__date-item"
                >
                  <tiny-date-picker
                    v-model="state.startDate"
                    :format="state.prevItem.format || state.dateRangeFormat"
                    :value-format="state.prevItem.format || state.dateRangeFormat"
                    :picker-options="pickerOptions(state.startDate, 'endDate')"
                    class="tvp-search-box__date-picker"
                  ></tiny-date-picker>
                </tiny-form-item>
                <div class="tvp-search-box__dropdown-end">{{ t('tvp.tvpSearchbox.rangeEndLabel') }}</div>
                <tiny-form-item prop="endDate" class="tvp-search-box__date-item">
                  <tiny-date-picker
                    v-model="state.endDate"
                    :format="state.prevItem.format || state.dateRangeFormat"
                    :value-format="state.prevItem.format || state.dateRangeFormat"
                    :picker-options="pickerOptions(state.startDate)"
                    class="tvp-search-box__date-picker"
                  ></tiny-date-picker>
                </tiny-form-item>
              </div>
              <div v-if="state.prevItem.type === 'datetimeRange'" class="tvp-search-box__date-wrap">
                <div class="tvp-search-box__dropdown-title">
                  {{
                    state.prevItem.maxTimeLength > 0
                      ? t('tvp.tvpSearchbox.timeLengthTitle').replace(
                          '{value}',
                          (state.prevItem.maxTimeLength / 86400000).toFixed(1)
                        )
                      : t('tvp.tvpSearchbox.rangeDateTitle')
                  }}
                </div>
                <div class="tvp-search-box__dropdown-start">{{ t('tvp.tvpSearchbox.rangeBeginLabel') }}</div>
                <tiny-form-item
                  prop="startDateTime"
                  :show-message="Boolean(state.prevItem.maxTimeLength)"
                  class="tvp-search-box__date-item"
                >
                  <tiny-date-picker
                    v-model="state.startDateTime"
                    type="datetime"
                    :isutc8="true"
                    :format="state.prevItem.format || state.datetimeRangeFormat"
                    :value-format="state.prevItem.format || state.datetimeRangeFormat"
                    :picker-options="pickerOptions(state.startDateTime, 'endDateTime')"
                    class="tvp-search-box__date-picker"
                  ></tiny-date-picker>
                </tiny-form-item>
                <div class="tvp-search-box__dropdown-end">{{ t('tvp.tvpSearchbox.rangeEndLabel') }}</div>
                <tiny-form-item prop="endDateTime" class="tvp-search-box__date-item">
                  <tiny-date-picker
                    v-model="state.endDateTime"
                    type="datetime"
                    :isutc8="true"
                    :format="state.prevItem.format || state.datetimeRangeFormat"
                    :value-format="state.prevItem.format || state.datetimeRangeFormat"
                    :picker-options="pickerOptions(state.startDateTime)"
                    class="tvp-search-box__date-picker"
                  ></tiny-date-picker>
                </tiny-form-item>
              </div>
            </div>
            <div class="tvp-search-box__bottom-btn">
              <tiny-button size="mini" @click="confirmEditTag(false)">
                {{ t('tvp.tvpSearchbox.cancel') }}
              </tiny-button>
              <tiny-button size="mini" @click="confirmEditTag(true)">
                {{ t('tvp.tvpSearchbox.confirm') }}
              </tiny-button>
            </div>
          </template>
          <div v-else class="tvp-search-box__panel-box">
            <slot
              :name="`${state.prevItem.slotName}-edit`"
              v-bind="{
                showDropdown: () => showPopover(state),
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
// Vue 2 和 Vue 3 兼容版本
import { defineComponent, reactive, watch, nextTick,  computed, isVue2 } from 'vue-demi'
import { onMounted,onBeforeUnmount , getCurrentInstance} from 'vue'
// 导入组件
import TinyTag from '@opentiny/vue-tag'
import TinyInput from '@opentiny/vue-input'
import TinyDropdown from '@opentiny/vue-dropdown'
import TinyDropdownMenu from '@opentiny/vue-dropdown-menu'
import TinyButton from '@opentiny/vue-button'
import TinyTooltip from '@opentiny/vue-tooltip'
import TinyDatePicker from '@opentiny/vue-date-picker'
import TinyForm from '@opentiny/vue-form'
import TinyFormItem from '@opentiny/vue-form-item'
import TinyPopover from '@opentiny/vue-popover'
import TinySelect from '@opentiny/vue-select'
import TinyOption from '@opentiny/vue-option'

import { iconSearch, iconClose, iconHelpQuery } from '@opentiny/vue-icon'

// 导入工具函数和类型
import { format } from './utils/date.ts'
import { t } from './index.ts'
import { useTag } from './composables/use-tag'
import { useDropdown } from './composables/use-dropdown'
import { useMatch } from './composables/use-match'
import { useCheckbox } from './composables/use-checkbox'
import { useDatePicker } from './composables/use-datepicker'
import { useNumRange } from './composables/use-num-range'
import { useEdit } from './composables/use-edit'
import { useCustom } from './composables/use-custom'
import { useInit } from './composables/use-init'
import { usePlaceholder } from './composables/use-placeholder'
// 类型导入 - 兼容 Vue 2 和 Vue 3
import './index.type'
import { showDropdown, showPopover } from './utils/dropdown'

import { deepClone } from './utils/clone'
import { resetInput } from './utils/tag'
import { useEmitter } from './utils/index'

import TinySearchBoxFirstLevelPanel from './components/first-level-panel.vue'
import TinySearchBoxSecondLevelPanel from './components/second-level-panel.vue'
import './index.less'

export default defineComponent({
  name: 'TinySearchBox',
  components: {
    TinyTag,
    TinyInput,
    TinyDropdown,
    TinyDropdownMenu,
    TinyButton,
    TinyTooltip,
    TinyDatePicker,
    TinyForm,
    TinyFormItem,
    TinyPopover,
    TinySelect,
    TinyOption,
    TinySearchBoxFirstLevelPanel,
    TinySearchBoxSecondLevelPanel,
    // 图标组件
    TinyIconSearch: iconSearch(),
    TinyIconClose: iconClose(),
    TinyIconHelpQuery: iconHelpQuery()
  },

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
  setup(props, { emit }) {
    const instance = getCurrentInstance()
    // 兼容 Vue2：给第三方组件（如 @opentiny/vue-form）提供 $emitter
    const customEmit = useEmitter()

    if (isVue2 && instance) {
      const proxy = instance.proxy || instance
      if (proxy) {
        if (!proxy.$emitter) proxy.$emitter = customEmit
        // 覆盖 $emit，保证组合式 emit 能被 Vue2 生态识别
        proxy.$emit = customEmit
        instanc.$emittry
      }
    }

    console.info('TinyDropdownTinyDropdownTinyDropdownTinyDropdown', instance)

    // 响应式状态
    const state = reactive({
      emit,
      innerModelValue: [...props.modelValue],
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
      allTypeAttri: { label: t('tvp.tvpSearchbox.rulekeyword1'), field: 'tvpKeyword', type: 'radio' },
      operatorValue: ':',
      inputEditValue: '',
      currentOperators: '',
      currentEditValue: '',
      currentModelValueIndex: -1,
      curMinNumVar: '',
      curMaxNumVar: '',
      instance: isVue2 ? instance?.proxy : instance,
      isMouseDown: false,
      currentEditSelectTags: [],
      visible: false,
      visibleTimer: null,
      hasBackupList: computed(
        () => state.propItem.label && [undefined, 'radio', 'checkbox', 'map'].includes(state.prevItem.type)
      ),
      isIndeterminate: computed(
        () => state.checkboxGroup.length > 0 && state.checkboxGroup.length !== state.filterList.length
      ),
      checkAll: computed({
        get: () => state.checkboxGroup.length && state.checkboxGroup.length === state.filterList.length,
        set: (val) => {
          if (val) {
            state.checkboxGroup = state.filterList.flatMap((item) => `${state.prevItem.label}${item.label}`)
          } else {
            state.checkboxGroup = []
          }
        }
      })
    })

    console.info('*************instnce', state.instance)

    // 使用组合式函数
    // 统一组合式函数参数为 emit
    const dropdownApi = useDropdown({ props, emit, state, t, format })
    const tagApi = useTag({ props, state, emit })
    const editApi = useEdit({ props, state, t, nextTick, format, emit })
    const matchApi = useMatch({ props, state, emit })
    const placeholderApi = usePlaceholder({ props, state, t })
    const checkboxApi = useCheckbox({ props, state, emit })
    const datePickerApi = useDatePicker({ props, state, emit })
    const numRangeApi = useNumRange({ props, state, t, emit })
    const customApi = useCustom({ state, emit })
    const initApi = useInit({ props, state })

    // 解构所有事件方法
    const { selectPropItem, selectRadioItem, selectInputValue, createTag, helpClick, setOperator } = dropdownApi
    const { deleteTag, clearTag, backspaceDeleteTag } = tagApi
    const { editTag, confirmEditTag, selectPropChange, selectItemIsDisable } = editApi
    const { handleInput, selectFirstMap } = matchApi
    const { placeholder, setPlaceholder } = placeholderApi
    const { selectCheckbox, isShowClose } = checkboxApi
    const { onConfirmDate, handleDateShow, pickerOptions } = datePickerApi
    const { sizeChange, initFormRule } = numRangeApi
    const { handleConfirm, handleEditConfirm } = customApi
    const { initItems, watchOutsideClick, watchMouseDown, watchMouseMove, handleClick } = initApi

    // 事件映射
    // 事件映射，始终闭包引用最新api
    const eventsMap = () => ({
      selectInputValue,
      selectPropItem,
      selectRadioItem,
      setOperator,
      selectCheckbox,
      sizeChange,
      onConfirmDate,
      selectFirstMap,
      handleDateShow
    })

    const handleEvents = (eventName, p1, p2) => {
      const map = eventsMap()
      if (typeof map[eventName] === 'function') {
        map[eventName](p1, p2)
      } else {
        console.warn(`[TinySearchBox] Unknown event: ${eventName}`)
      }
    }

    // 监听器
    watch(
      () => props.items,
      (newVal) => {
        state.recordItems = deepClone(newVal)
        initItems()
        initFormRule()
      },
      {
        deep: true,
        immediate: true
      }
    )

    watch(
      () => state.popoverVisible,
      (newVal) => {
        if (!newVal && !state.inputEditValue.length) {
          state.inputEditValue = state.currentEditSelectTags
        }
      },
      {
        immediate: true
      }
    )

    watch(
      () => props.modelValue,
      (newVal) => {
        if (newVal) {
          state.indexMap.clear()
          state.valueMap.clear()
          newVal.forEach((item, index) => {
            const value = `${item.label}${item.value}`
            state.indexMap.set(item.label, index)
            state.valueMap.set(value, index)
            if (item.options?.length > 0) {
              item.options.forEach((option) => {
                const optionValue = `${item.label}${option.label}`
                state.valueMap.set(optionValue, index)
              })
            }
          })
          showPopover(state, false)
          if (newVal.length === 0) {
            setPlaceholder(props.emptyPlaceholder)
          }

          if (props.editable && !state.inputEditValue.length && newVal[0]) {
            state.inputEditValue = newVal[0].value
          }
          state.innerModelValue = [...newVal]
        }
      },
      {
        deep: true,
        immediate: true
      }
    )

    // 生命周期
    onMounted(() => {
      if (typeof document !== 'undefined') {
        document.addEventListener('click', watchOutsideClick)
        document.addEventListener('mousedown', watchMouseDown)
        document.addEventListener('mousemove', watchMouseMove)
      }
    })

    onBeforeUnmount(() => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', watchOutsideClick)
        document.removeEventListener('mousedown', watchMouseDown)
        document.removeEventListener('mousemove', watchMouseMove)
      }
    })

    // 暴露给模板的方法
    return {
      t,
      state,
      placeholder,
      isShowClose,
      deleteTag,
      editTag,
      backspaceDeleteTag,
      createTag,
      clearTag,
      helpClick,
      handleInput,
      handleClick,
      handleEvents,
      pickerOptions,
      resetInput,
      selectItemIsDisable,
      selectPropChange,
      confirmEditTag,
      handleConfirm,
      handleEditConfirm,
      showDropdown,
      showPopover
    }
  }
})
</script>
