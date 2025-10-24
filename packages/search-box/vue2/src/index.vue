<template>
  <div class="tvp-search-box" @click.stop="showPopover(state)">
    <!-- // <TinyIconSearch class="tvp-search-box__prefix" /> -->
    <tiny-tag
      v-for="(tag, index) in modelValue"
      :key="tag.field + index"
      closable
      :class="[
        'tvp-search-box__tag',
        editable && tag.type !== 'map' ? 'tvp-search-box__tag-editor' : '',
      ]"
      :title="`${tag.label} ${tag.operator || ':'} ${tag.value}`"
      @close="deleteTag(tag)"
      @click.stop="editTag(tag, index, $event)"
    >
      <span class="tvp-search-box__tag-value"
        >{{ tag.label }} {{ tag.operator || ":" }} {{ tag.value }}
      </span>
    </tiny-tag>
    <span v-if="modelValue.length" class="tvp-search-box__placeholder"></span>
    <tiny-dropdown
      ref="dropdownRef"
      :visible="state.visible"
      trigger="click"
      class="tvp-search-box__dropdown"
      :show-icon="false"
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
        <div slot="suffix">
          <tiny-icon-close
            v-show="isShowClose"
            class="tvp-search-box__input-close"
            @click.stop="clearTag"
          />
          <span v-show="isShowClose" class="tvp-search-box__input-separator"></span>
          <tiny-tooltip
            v-if="showHelp"
            effect="light"
            :content="t('tvp.tvpSearchbox.help')"
            placement="top"
          >
            <tiny-icon-help-query
              class="tvp-search-box__input-help"
              @click.stop="helpClick"
            />
          </tiny-tooltip>
          <tiny-icon-search
            class="tvp-search-box__input-search"
            @click.stop="createTag"
          />
        </div>
      </tiny-input>
      <div slot="dropdown">
        <tiny-dropdown-menu
          placement="bottom-start"
          popper-class="tvp-search-box__dropdown-menu"
          :style="{ 'max-height': panelMaxHeight }"
          @mouseup.stop="() => {}"
        >
          <div v-show="!state.propItem.label || state.inputValue.trim()">
            <slot
              v-if="$scopedSlots['first-panel']"
              name="first-panel"
              v-bind="{
                state,
                handleEvents,
              }"
              @click.stop
            ></slot>
            <!-- <TinySearchBoxFirstLevelPanel
              v-else
              :state="state"
              @events="handleEvents"
            ></TinySearchBoxFirstLevelPanel> -->
          </div>
          <div v-show="state.propItem.label">
            <slot
              v-if="$scopedSlots['second-panel']"
              name="second-panel"
              v-bind="{
                state,
                pickerOptions,
                handleEvents,
                back: () => resetInput(state),
              }"
              @click.stop
            ></slot>
            <!-- <TinySearchBoxSecondLevelPanel
              v-else-if="state.prevItem.type !== 'custom'"
              :state="state"
              :picker-options="pickerOptions"
              @events="handleEvents"
            ></TinySearchBoxSecondLevelPanel> -->
            <div v-else class="tvp-search-box__panel-box" @click="showDropdown(state)">
              <slot
                :name="state.prevItem.slotName"
                v-bind="{
                  showDropdown: () => showDropdown(state),
                  onConfirm: handleConfirm,
                }"
                @click.stop
              ></slot>
            </div>
          </div>
        </tiny-dropdown-menu>
      </div>
    </tiny-dropdown>
    <!-- <tiny-form
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
            >{{ state.propItem.label }}&nbsp;{{
              `${state.operatorValue ? state.operatorValue : ""}&nbsp;`
            }}</span
          >
          <span v-show="state.propItem.value">{{ state.propItem.value }}</span>
        </section>
        <tiny-dropdown
          ref="dropdownRef"
          :visible.sync="state.visible"
          trigger="click"
          class="tvp-search-box__dropdown"
          :show-icon="false"
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
            <div slot="suffix">
              <tiny-icon-close
                v-show="isShowClose"
                class="tvp-search-box__input-close"
                @click.stop="clearTag"
              />
              <span v-show="isShowClose" class="tvp-search-box__input-separator"></span>
              <tiny-tooltip
                v-if="showHelp"
                effect="light"
                :content="t('tvp.tvpSearchbox.help')"
                placement="top"
              >
                <tiny-icon-help-query
                  class="tvp-search-box__input-help"
                  @click.stop="helpClick"
                />
              </tiny-tooltip>
              <tiny-icon-search
                class="tvp-search-box__input-search"
                @click.stop="createTag"
              />
            </div>
          </tiny-input>
          <div slot="dropdown">
            <tiny-dropdown-menu
              placement="bottom-start"
              popper-class="tvp-search-box__dropdown-menu"
              :style="{ 'max-height': panelMaxHeight }"
              @mouseup.stop="() => {}"
            >
              <div v-show="!state.propItem.label || state.inputValue.trim()">
                <slot
                  v-if="$scopedSlots['first-panel']"
                  name="first-panel"
                  v-bind="{
                    state,
                    handleEvents,
                  }"
                  @click.stop
                ></slot>
                <TinySearchBoxFirstLevelPanel
                  v-else
                  :state="state"
                  @events="handleEvents"
                ></TinySearchBoxFirstLevelPanel>
              </div>
              <div v-show="state.propItem.label">
                <slot
                  v-if="$scopedSlots['second-panel']"
                  name="second-panel"
                  v-bind="{
                    state,
                    pickerOptions,
                    handleEvents,
                    back: () => resetInput(state),
                  }"
                  @click.stop
                ></slot>
                <TinySearchBoxSecondLevelPanel
                  v-else-if="state.prevItem.type !== 'custom'"
                  :state="state"
                  :picker-options="pickerOptions"
                  @events="handleEvents"
                ></TinySearchBoxSecondLevelPanel>
                <div
                  v-else
                  class="tvp-search-box__panel-box"
                  @click="showDropdown(state)"
                >
                  <slot
                    :name="state.prevItem.slotName"
                    v-bind="{
                      showDropdown: () => showDropdown(state),
                      onConfirm: handleConfirm,
                    }"
                    @click.stop
                  ></slot>
                </div>
              </div>
            </tiny-dropdown-menu>
          </div>
        </tiny-dropdown>
      </div>

      <div v-if="editable">
        <tiny-popover
          ref="popoverRef"
          v-model="state.popoverVisible"
          placement="bottom-start"
          :visible-arrow="false"
          trigger="manual"
          popper-class="tvp-search-box__popover"
          class="tvp-search-box__form-popover"
        >
          <div v-if="state.prevItem.type !== 'custom'">
            <div class="tvp-search-box__date-wrap">
              <div class="tvp-search-box__dropdown-start">
                {{ t("tvp.tvpSearchbox.attributeType") }}
              </div>
              <tiny-form-item class="tvp-search-box__number-item">
                <tiny-select
                  v-model="state.selectValue"
                  searchable
                  :disabled="state.prevItem.editAttrDisabled"
                >
                  <tiny-option
                    :key="state.allTypeAttri.label"
                    :label="t('tvp.tvpSearchbox.allProperty')"
                    :value="state.allTypeAttri.label"
                    :disabled="selectItemIsDisable(state.allTypeAttri)"
                    @click="
                      selectPropChange(
                        state.allTypeAttri,
                        selectItemIsDisable(state.allTypeAttri)
                      )
                    "
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
                {{ t("tvp.tvpSearchbox.operator") }}
              </div>
              <tiny-form-item
                v-if="state.prevItem.operators"
                class="tvp-search-box__number-item"
              >
                <tiny-select v-model="state.operatorValue">
                  <tiny-option
                    v-for="item in state.currentOperators"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </tiny-option>
                </tiny-select>
              </tiny-form-item>
              <div
                v-if="state.prevItem.type !== 'numRange'"
                class="tvp-search-box__dropdown-end"
              >
                {{ t("tvp.tvpSearchbox.tagValue") }}
              </div>
              <tiny-form-item
                v-if="
                  !['numRange', 'dateRange', 'datetimeRange', 'custom'].includes(
                    state.prevItem.type
                  )
                "
                prop="inputEditValue"
                class="tvp-search-box__number-item"
              >
                <tiny-select
                  v-if="state.currentEditValue && state.currentEditValue.length > 0"
                  v-model="state.inputEditValue"
                  class="tvp-search-box-select"
                  :multiple="Boolean(state.prevItem.mergeTag)"
                  :allow-create="state.prevItem && state.prevItem.allowCreate"
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
              <div
                v-if="state.prevItem.type === 'numRange'"
                class="tvp-search-box__number"
              >
                <div class="tvp-search-box__dropdown-start">
                  {{ t("tvp.tvpSearchbox.minValueText") }}({{ state.prevItem.unit }})
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
                  {{ t("tvp.tvpSearchbox.maxValueText") }}({{ state.prevItem.unit }})
                </div>
                <tiny-form-item
                  :prop="state.curMaxNumVar"
                  class="tvp-search-box__number-item"
                >
                  <tiny-input
                    v-model="state[state.curMaxNumVar]"
                    type="number"
                    class="tvp-search-box__number-input"
                  ></tiny-input>
                </tiny-form-item>
              </div>
              <div
                v-if="state.prevItem.type === 'dateRange'"
                class="tvp-search-box__date-wrap"
              >
                <div class="tvp-search-box__dropdown-title">
                  {{
                    state.prevItem.maxTimeLength > 0
                      ? t("tvp.tvpSearchbox.timeLengthTitle", {
                          value: (state.prevItem.maxTimeLength / 86400000).toFixed(1),
                        })
                      : t("tvp.tvpSearchbox.rangeDateTitle")
                  }}
                </div>
                <div class="tvp-search-box__dropdown-start">
                  {{ t("tvp.tvpSearchbox.rangeBeginLabel") }}
                </div>
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
                <div class="tvp-search-box__dropdown-end">
                  {{ t("tvp.tvpSearchbox.rangeEndLabel") }}
                </div>
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
              <div
                v-if="state.prevItem.type === 'datetimeRange'"
                class="tvp-search-box__date-wrap"
              >
                <div class="tvp-search-box__dropdown-title">
                  {{
                    state.prevItem.maxTimeLength > 0
                      ? t("tvp.tvpSearchbox.timeLengthTitle", {
                          value: (state.prevItem.maxTimeLength / 86400000).toFixed(1),
                        })
                      : t("tvp.tvpSearchbox.rangeDateTitle")
                  }}
                </div>
                <div class="tvp-search-box__dropdown-start">
                  {{ t("tvp.tvpSearchbox.rangeBeginLabel") }}
                </div>
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
                <div class="tvp-search-box__dropdown-end">
                  {{ t("tvp.tvpSearchbox.rangeEndLabel") }}
                </div>
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
                {{ t("tvp.tvpSearchbox.cancel") }}
              </tiny-button>
              <tiny-button size="mini" @click="confirmEditTag(true)">
                {{ t("tvp.tvpSearchbox.confirm") }}
              </tiny-button>
            </div>
          </div>
          <div v-else class="tvp-search-box__panel-box">
            <slot
              :name="`${state.prevItem.slotName}-edit`"
              v-bind="{
                showDropdown: () => showPopover(state),
                onConfirm: handleEditConfirm,
              }"
              @click.stop
            ></slot>
          </div>
        </tiny-popover>
      </div>
    </tiny-form> -->
  </div>
</template>

<script>
// Vue2 版本，使用标准 Options API
// import TinyTag from "@opentiny/vue-tag";
// import TinyInput from "@opentiny/vue-input";
// import TinyDropdown from "@opentiny/vue-dropdown";
// import TinyDropdownMenu from "@opentiny/vue-dropdown-menu";
// import TinyButton from "@opentiny/vue-button";
// import TinyButtonGroup from "@opentiny/vue-button-group";
// import TinyTooltip from "@opentiny/vue-tooltip";
// import TinyDatePicker from "@opentiny/vue-date-picker";
// import TinyForm from "@opentiny/vue-form";
// import TinyFormItem from "@opentiny/vue-form-item";
// import TinyPopover from "@opentiny/vue-popover";
// import TinySelect from "@opentiny/vue-select";
// import TinyOption from "@opentiny/vue-option";

import {
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
} from "@opentiny/vue";

import { iconSearch, iconClose, iconHelpQuery } from "@opentiny/vue-icon";

// import TinySearchBoxFirstLevelPanel from "./components/first-level-panel.vue";
// import TinySearchBoxSecondLevelPanel from "./components/second-level-panel.vue";
import "./index.less";

// 导入工具函数
import { format } from "./utils/date";
import { showDropdown, showPopover } from "./utils/dropdown";
import { deepClone } from "./utils/clone";
import { resetInput, emitChangeModelEvent } from "./utils/tag";

// 导入mixins
import { useTagMixin } from "./mixins/use-tag";
import { useDropdownMixin } from "./mixins/use-dropdown";
import { useCheckboxMixin } from "./mixins/use-checkbox";
import { useEditMixin } from "./mixins/use-edit";
import { useNumRangeMixin } from "./mixins/use-num-range";
import { useDatePickerMixin } from "./mixins/use-datepicker";
import { useMatchMixin } from "./mixins/use-match";
import { useInitMixin } from "./mixins/use-init";
import { usePlaceholderMixin } from "./mixins/use-placeholder";
import { useCustomMixin } from "./mixins/use-custom";

export default {
  name: "TinySearchBox",
  mixins: [
    useTagMixin,
    useDropdownMixin,
    useCheckboxMixin,
    useEditMixin,
    useNumRangeMixin,
    useDatePickerMixin,
    useMatchMixin,
    useInitMixin,
    usePlaceholderMixin,
    useCustomMixin,
  ],
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
    // TinySearchBoxFirstLevelPanel,
    // TinySearchBoxSecondLevelPanel,
    // // 图标组件
    // TinyIconSearch: iconSearch(),
    // TinyIconClose: iconClose(),
    // TinyIconHelpQuery: iconHelpQuery(),
  },
  props: {
    modelValue: {
      type: Array,
      default() {
        return [];
      },
    },
    items: {
      type: Array,
      default: () => [],
    },
    emptyPlaceholder: {
      type: String,
      default: "",
    },
    potentialOptions: {
      type: Object,
      default() {
        return null;
      },
    },
    // 是否显示帮助图标，新规范默认显示
    showHelp: {
      type: Boolean,
      default: true,
    },
    // 标签标识键
    idMapKey: {
      type: String,
      default: "id",
    },
    // 自定义默认搜索项
    defaultField: {
      type: String,
      default: "",
    },
    editable: {
      type: Boolean,
      default: false,
    },
    maxlength: {
      type: Number,
    },
    // 3.18.0新增
    panelMaxHeight: {
      type: String,
      default: "999px",
    },
    // 3.18.0新增
    splitInputValue: {
      type: String,
      default: ",",
    },
  },
  emits: [
    "update:modelValue",
    "change",
    "search",
    "exceed",
    "first-level-select",
    "clear",
  ],
  data() {
    return {
      state: {
        innerModelValue: [...this.modelValue],
        recordItems: [],
        groupItems: {},
        inputValue: "",
        matchItems: {},
        propItem: {},
        backupList: [],
        filterList: [],
        checkboxGroup: [],
        prevItem: {},
        backupPrevItem: "",
        formRules: null,
        validType: "text",
        numberShowMessage: true,
        startDate: null,
        startDateTime: null,
        endDate: null,
        endDateTime: null,
        isShowTagKey: true,
        potentialOptions: null,
        dateRangeFormat: "yyyy/MM/dd",
        datetimeRangeFormat: "yyyy/MM/dd HH:mm:ss",
        indexMap: new Map(),
        valueMap: new Map(),
        popoverVisible: false,
        selectValue: "",
        allTypeAttri: {
          label: this.t("tvp.tvpSearchbox.rulekeyword1"),
          field: "tvpKeyword",
          type: "radio",
        },
        operatorValue: ":", // 当前操作符值
        inputEditValue: "",
        currentOperators: "",
        currentEditValue: "",
        currentModelValueIndex: -1, // 当前编辑的标签索引
        curMinNumVar: "", // numRange最小值变量
        curMaxNumVar: "", // numRange最大值变量
        instance: this.$refs,
        isMouseDown: false,
        currentEditSelectTags: [], // 当前编辑多选的标签值
        visible: false,
        visibleTimer: null,
        lastInputValue: this.inputValue,
        dropdownRef: this.$refs.dropdownRef,
      },
    };
  },
  computed: {
    hasBackupList() {
      return (
        this.state.propItem.label &&
        [undefined, "radio", "checkbox", "map"].includes(this.state.prevItem.type)
      );
    },
    isIndeterminate() {
      return (
        this.state.checkboxGroup.length > 0 &&
        this.state.checkboxGroup.length !== this.state.filterList.length
      );
    },
    checkAll: {
      get() {
        return (
          this.state.checkboxGroup.length &&
          this.state.checkboxGroup.length === this.state.filterList.length
        );
      },
      set(val) {
        if (val) {
          this.state.checkboxGroup = this.state.filterList.flatMap(
            (item) => `${this.state.prevItem.label}${item.label}`
          );
        } else {
          this.state.checkboxGroup = [];
        }
      },
    },
    // placeholder 现在在 usePlaceholderMixin 中定义
    isShowClose() {
      return this.modelValue.length > 0;
    },
  },
  watch: {
    items: {
      handler(newVal) {
        this.state.recordItems = deepClone(newVal);
        this.initItems();
        this.initFormRule();
      },
      deep: true,
      immediate: true,
    },
    "state.popoverVisible": {
      handler(newVal) {
        if (!newVal && !this.state.inputEditValue.length) {
          this.state.inputEditValue = this.state.currentEditSelectTags;
        }
      },
      immediate: true,
    },
    modelValue: {
      handler(newVal) {
        if (newVal) {
          this.state.indexMap.clear();
          this.state.valueMap.clear();
          newVal.forEach((item, index) => {
            const value = `${item.label}${item.value}`;
            this.state.indexMap.set(item.label, index);
            this.state.valueMap.set(value, index);
            if (item.options && item.options.length > 0) {
              item.options.forEach((option) => {
                const optionValue = `${item.label}${option.label}`;
                this.state.valueMap.set(optionValue, index);
              });
            }
          });
          showPopover(this.state, false);
          if (newVal.length === 0) {
            this.setPlaceholder(this.emptyPlaceholder);
          }

          if (this.editable && !this.state.inputEditValue.length && newVal[0]) {
            this.state.inputEditValue = newVal[0].value;
          }
        }
        this.state.innerModelValue = [...newVal];
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // i18n 函数
    t(key, params) {
      const translations = {
        "tvp.tvpSearchbox.help": "帮助",
        "tvp.tvpSearchbox.cancel": "取消",
        "tvp.tvpSearchbox.confirm": "确认",
        "tvp.tvpSearchbox.attributeType": "属性类型",
        "tvp.tvpSearchbox.allProperty": "全部属性",
        "tvp.tvpSearchbox.pleaseSelect": "请选择",
        "tvp.tvpSearchbox.minValue": "最小值",
        "tvp.tvpSearchbox.maxValue": "最大值",
        "tvp.tvpSearchbox.rangeEndLabel": "结束时间",
        "tvp.tvpSearchbox.operator": "操作符",
        "tvp.tvpSearchbox.tagValue": "标签值",
        "tvp.tvpSearchbox.minValueText": "最小值",
        "tvp.tvpSearchbox.maxValueText": "最大值",
        "tvp.tvpSearchbox.timeLengthTitle": "时间长度限制：{value}天",
        "tvp.tvpSearchbox.rangeDateTitle": "日期范围",
        "tvp.tvpSearchbox.rangeBeginLabel": "开始时间",
        "tvp.tvpSearchbox.rulekeyword1": "关键词",
      };
      let result = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((param) => {
          result = result.replace(`{${param}}`, params[param]);
        });
      }
      return result;
    },

    // 工具函数
    showDropdown,
    showPopover(state, isShow = true) {
      console.log("showPopover", state, isShow);
      state.popoverVisible = isShow;
      const { dropdownRef } = this.$refs;
      if (isShow && dropdownRef.state.visible) {
        console.log("showPopover", dropdownRef.state);
        clearTimeout(Number(dropdownRef.state.timeout));
        dropdownRef.state.timeout = null;
        dropdownRef.state.visible = false;
      }
    },
    resetInput,

    // Tag 相关方法
    changeIsChecked(tag) {
      if (tag) {
        const parent = this.state.recordItems.find((item) => item.label === tag.label);
        if (parent && parent.options) {
          const child = parent.options.find((item) => item.label === tag.value);
          child && (child.isChecked = false);
        }
      }
    },

    deleteTag(tag) {
      showDropdown(this.state, false);
      this.changeIsChecked(tag);
      const newValue = this.modelValue.filter((item) => item !== tag);
      emitChangeModelEvent({ emits: this.$emit, state: this.state, newValue });
    },

    clearTag() {
      showDropdown(this.state, false);
      this.modelValue.forEach((item) => this.changeIsChecked(item));
      this.state.propItem = {};
      this.state.inputValue = "";
      emitChangeModelEvent({ emits: this.$emit, state: this.state, newValue: [] });
      this.$emit("clear");
    },

    backspaceDeleteTag() {
      if (this.state.inputValue) {
        return;
      }
      if (this.state.propItem.label) {
        this.state.propItem = {};
        return;
      }
      if (this.state.lastInputValue === "" && this.state.inputValue === "") {
        showDropdown(this.state, false);
        const lastIndex = this.modelValue.length - 1;
        this.changeIsChecked(this.modelValue[lastIndex]);
        const newValue = this.state.innerModelValue.slice(0, this.modelValue.length - 1);
        emitChangeModelEvent({ emits: this.$emit, state: this.state, newValue });
      }
      this.state.lastInputValue = this.state.inputValue;
      this.$refs.inputRef && this.$refs.inputRef.$el.click();
    },

    // Dropdown 相关方法
    selectPropItem(item) {
      this.state.propItem = item;
      this.state.inputValue = "";
      this.state.operatorValue = (item.operators && item.operators[0]) || ":";
      this.state.prevItem = item;
      this.state.backupPrevItem = item.label;
      this.state.backupList = this.state.recordItems.filter(
        (recordItem) => recordItem.label !== item.label
      );
      this.state.filterList = item.options || [];
      this.state.currentOperators = item.operators || [":"];
      this.state.currentEditValue = item.options || [];
      this.state.inputEditValue = "";
      this.state.currentModelValueIndex = -1;
      this.state.currentEditSelectTags = [];
      showDropdown(this.state, true);
    },

    selectRadioItem(item) {
      this.state.propItem.value = item.label;
      this.state.inputValue = "";
      showDropdown(this.state, false);
      this.createTag();
    },

    selectInputValue(item) {
      this.state.propItem.value = item.label;
      this.state.inputValue = "";
      showDropdown(this.state, false);
      this.createTag();
    },

    setOperator(operator) {
      this.state.operatorValue = operator;
    },

    createTag() {
      if (!this.state.propItem.label) {
        return;
      }
      const tag = {
        label: this.state.propItem.label,
        value: this.state.propItem.value,
        operator: this.state.operatorValue,
        field: this.state.propItem.field || this.state.propItem.label,
      };
      const tagList = [tag];
      emitChangeModelEvent({ emits: this.$emit, state: this.state, tagList });
      this.state.propItem = {};
      this.state.inputValue = "";
      showDropdown(this.state, false);
    },

    helpClick() {
      // 帮助点击逻辑
      console.log("Help clicked");
    },

    // Edit 相关方法
    editTag(tag, index, event) {
      if (!this.editable) {
        return;
      }
      this.state.prevItem =
        this.state.recordItems.find((item) => item.label === tag.label) || {};
      this.state.currentModelValueIndex = index;
      this.state.inputEditValue = tag.value;
      this.state.currentEditSelectTags = tag.value;
      this.state.selectValue = tag.label;
      this.state.operatorValue = tag.operator || ":";
      this.state.currentOperators = this.state.prevItem.operators || [":"];
      this.state.currentEditValue = this.state.prevItem.options || [];
      this.state.backupList = this.state.recordItems.filter(
        (recordItem) => recordItem.label !== tag.label
      );
      this.state.filterList = this.state.prevItem.options || [];
      showPopover(this.state, true);
    },

    confirmEditTag(confirm) {
      if (confirm) {
        const newTag = {
          label: this.state.selectValue,
          value: this.state.inputEditValue,
          operator: this.state.operatorValue,
          field: this.state.prevItem.field || this.state.selectValue,
        };
        emitChangeModelEvent({
          emits: this.$emit,
          state: this.state,
          index: this.state.currentModelValueIndex,
          newTag,
          isEdit: true,
        });
      }
      showPopover(this.state, false);
      this.state.inputEditValue = "";
      this.state.currentEditSelectTags = [];
    },

    selectPropChange(item, disabled) {
      if (disabled) {
        return;
      }
      this.state.prevItem = item;
      this.state.currentOperators = item.operators || [":"];
      this.state.currentEditValue = item.options || [];
      this.state.inputEditValue = "";
    },

    selectItemIsDisable(item) {
      return false;
    },

    // Match 相关方法
    handleInput() {
      // 输入处理逻辑
      this.state.lastInputValue = this.state.inputValue;
    },

    selectFirstMap(item) {
      this.state.propItem.value = item.label;
      this.state.inputValue = "";
      showDropdown(this.state, false);
      this.createTag();
    },

    // Placeholder 相关方法
    setPlaceholder(placeholder) {
      // 设置占位符逻辑
    },

    // Checkbox 相关方法
    selectCheckbox(item) {
      const value = `${this.state.prevItem.label}${item.label}`;
      const index = this.state.checkboxGroup.indexOf(value);
      if (index > -1) {
        this.state.checkboxGroup.splice(index, 1);
      } else {
        this.state.checkboxGroup.push(value);
      }
    },

    // DatePicker 相关方法
    onConfirmDate() {
      // 确认日期逻辑
    },

    handleDateShow() {
      // 处理日期显示逻辑
    },

    pickerOptions(startDate, endDate) {
      return {};
    },

    // NumRange 相关方法
    sizeChange() {
      // 大小变化逻辑
    },

    initFormRule() {
      // 初始化表单规则逻辑
    },

    // Custom 相关方法
    handleConfirm(customTag) {
      // 确认处理逻辑
    },

    handleEditConfirm(customTag) {
      // 编辑确认处理逻辑
    },

    // Init 相关方法
    initItems() {
      // 初始化项目逻辑
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

    handleClick(e) {
      this.handleClick && this.handleClick(e);
      showPopover(this.state, false);
    },

    // 事件处理
    handleEvents(eventName, p1, p2) {
      const eventsMap = {
        selectInputValue: this.selectInputValue,
        selectPropItem: this.selectPropItem,
        selectRadioItem: this.selectRadioItem,
        setOperator: this.setOperator,
        selectCheckbox: this.selectCheckbox,
        sizeChange: this.sizeChange,
        onConfirmDate: this.onConfirmDate,
        selectFirstMap: this.selectFirstMap,
        handleDateShow: this.handleDateShow,
      };

      if (typeof eventsMap[eventName] === "function") {
        eventsMap[eventName](p1, p2);
      } else {
        console.warn(`[TinySearchBox] Unknown event: ${eventName}`);
      }
    },

    // 工具方法已通过导入的 emitChangeModelEvent 函数实现
  },
  mounted() {
    console.log("mounted", this.state.instance, this.$refs);
    this.state.dropdownRef = this.$refs.dropdownRef;
    // 添加事件监听
    if (typeof document !== "undefined") {
      document.addEventListener("click", this.watchOutsideClick);
      document.addEventListener("mousedown", this.watchMouseDown);
      document.addEventListener("mousemove", this.watchMouseMove);
    }
  },
  beforeDestroy() {
    // 移除事件监听
    if (typeof document !== "undefined") {
      document.removeEventListener("click", this.watchOutsideClick);
      document.removeEventListener("mousedown", this.watchMouseDown);
      document.removeEventListener("mousemove", this.watchMouseMove);
    }
  },
};
</script>
