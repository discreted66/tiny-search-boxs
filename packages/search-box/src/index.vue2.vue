<template>
  <div class="tvp-search-box"  @click.stop="showPopover(state, false)">
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
          tiny_mode="pc"
        >
          <template v-if="state.prevItem.type !== 'custom'">
            <div class="tvp-search-box__date-wrap">
              <div class="tvp-search-box__dropdown-start">
                {{ t('tvp.tvpSearchbox.attributeType') }}
              </div>
              <tiny-form-item class="tvp-search-box__number-item" tiny_mode="pc">
                <tiny-select tiny_mode="pc" v-model="state.selectValue" searchable :disabled="state.prevItem.editAttrDisabled">
                  <tiny-option tiny_mode="pc"
                    :key="state.allTypeAttri.label"
                    :label="t('tvp.tvpSearchbox.allProperty')"
                    :value="state.allTypeAttri.label"
                    :disabled="selectItemIsDisable(state.allTypeAttri)"
                    @click="selectPropChange(state.allTypeAttri, selectItemIsDisable(state.allTypeAttri))"
                  >
                  </tiny-option>
                  <tiny-option tiny_mode="pc"
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
              <tiny-form-item tiny_mode="pc" v-if="state.prevItem.operators" class="tvp-search-box__number-item">
                <tiny-select tiny_mode="pc" v-model="state.operatorValue">
                  <tiny-option tiny_mode="pc" v-for="item in state.currentOperators" :key="item" :label="item" :value="item">
                  </tiny-option>
                </tiny-select>
              </tiny-form-item>
              <div v-if="state.prevItem.type !== 'numRange'" class="tvp-search-box__dropdown-end">
                {{ t('tvp.tvpSearchbox.tagValue') }}
              </div>
              <tiny-form-item tiny_mode="pc"
                v-if="!['numRange', 'dateRange', 'datetimeRange', 'custom'].includes(state.prevItem.type)"
                prop="inputEditValue"
                class="tvp-search-box__number-item"
              >
                <tiny-select tiny_mode="pc"
                  v-if="state.currentEditValue?.length > 0"
                  v-model="state.inputEditValue"
                  class="tvp-search-box-select"
                  :multiple="Boolean(state.prevItem.mergeTag)"
                  :allow-create="state.prevItem?.allowCreate"
                  filterable
                  default-first-option
                  clearable
                >
                  <tiny-option tiny_mode="pc"
                    v-for="item in state.currentEditValue"
                    :key="item.label"
                    :label="item.label"
                    :value="item.label"
                  >
                  </tiny-option>
                </tiny-select>
                <tiny-input tiny_mode="pc" v-else v-model="state.inputEditValue" clearable></tiny-input>
              </tiny-form-item>
              <div v-if="state.prevItem.type === 'numRange'" class="tvp-search-box__number">
                <div class="tvp-search-box__dropdown-start">
                  {{ t('tvp.tvpSearchbox.minValueText') }}({{ state.prevItem.unit }})
                </div>
                <tiny-form-item tiny_mode="pc"
                  :prop="state.curMinNumVar"
                  class="tvp-search-box__number-item"
                  :show-message="state.numberShowMessage"
                >
                  <tiny-input tiny_mode="pc"
                    v-model="state[state.curMinNumVar]"
                    type="number"
                    class="tvp-search-box__number-input"
                  ></tiny-input>
                </tiny-form-item>
                <div class="tvp-search-box__dropdown-end">
                  {{ t('tvp.tvpSearchbox.maxValueText') }}({{ state.prevItem.unit }})
                </div>
                <tiny-form-item tiny_mode="pc" :prop="state.curMaxNumVar" class="tvp-search-box__number-item">
                  <tiny-input tiny_mode="pc"
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
                <tiny-form-item tiny_mode="pc"
                  prop="startDate"
                  :show-message="Boolean(state.prevItem.maxTimeLength)"
                  class="tvp-search-box__date-item"
                >
                  <tiny-date-picker tiny_mode="pc"
                    v-model="state.startDate"
                    :format="state.prevItem.format || state.dateRangeFormat"
                    :value-format="state.prevItem.format || state.dateRangeFormat"
                    :picker-options="pickerOptions(state.startDate, 'endDate')"
                    class="tvp-search-box__date-picker"
                  ></tiny-date-picker>
                </tiny-form-item>
                <div class="tvp-search-box__dropdown-end">{{ t('tvp.tvpSearchbox.rangeEndLabel') }}</div>
                <tiny-form-item tiny_mode="pc" prop="endDate" class="tvp-search-box__date-item">
                  <tiny-date-picker tiny_mode="pc"
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
                <tiny-form-item tiny_mode="pc"
                  prop="startDateTime"
                  :show-message="Boolean(state.prevItem.maxTimeLength)"
                  class="tvp-search-box__date-item"
                >
                  <tiny-date-picker tiny_mode="pc"
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
                <tiny-form-item tiny_mode="pc" prop="endDateTime" class="tvp-search-box__date-item">
                  <tiny-date-picker tiny_mode="pc"
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
              <!-- <tiny-button tiny_mode="pc" size="mini" @click="confirmEditTag(false)">
                {{ t('tvp.tvpSearchbox.cancel') }}
              </tiny-button>
              <tiny-button tiny_mode="pc" size="mini" @click="confirmEditTag(true)">
                {{ t('tvp.tvpSearchbox.confirm') }}
              </tiny-button> -->
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
// Vue2 版本，使用 tiny-vue 的 renderless 架构
import { defineComponent, setup, $props , isVue2} from '@opentiny/vue-common'
import { renderless, api } from './renderless'
console.info(isVue2, 'isVue2')
// 导入组件
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

import TinySearchBoxFirstLevelPanel from './components/first-level-panel.vue2.vue'
import TinySearchBoxSecondLevelPanel from './components/second-level-panel.vue2.vue'
import './index.less'

export default defineComponent({
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
    TinySearchBoxFirstLevelPanel,
    TinySearchBoxSecondLevelPanel,
    // 图标组件
    TinyIconSearch: iconSearch(),
    TinyIconClose: iconClose(),
    TinyIconHelpQuery: iconHelpQuery()
  },
  props: {
    ...$props,
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
  setup(props, context) {
    console.info(props, context, 'props' ,api)
    return setup({ props, context, renderless, api })
  }
})
</script>
