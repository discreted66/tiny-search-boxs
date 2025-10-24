<template>
  <div class="tvp-search-box-second-level-panel">
    <div v-if="state.currentOperators && state.currentOperators.length">
      <span class="tvp-search-box__filter-type">{{
        t("tvp.tvpSearchbox.operator")
      }}</span>
      <tiny-dropdown-item
        v-for="(item, index) in state.currentOperators"
        v-show="item.includes(state.inputValue)"
        :key="item + index"
        class="tvp-search-box__dropdown-item"
        @click="setOperator(item)"
      >
        {{ item }}
      </tiny-dropdown-item>
    </div>
    <div
      v-else-if="!state.prevItem.type || state.prevItem.type === 'radio'"
      v-loading="isLoading"
      :class="['tvp-search-box__radio-wrap', isLoading && 'tvp-search-box__loading-box']"
    >
      <tiny-dropdown-item
        v-for="(item, index) in state.backupList"
        v-show="!item.isFilter || !state.inputValue"
        :key="index + (item.field || item.label)"
        :disabled="item.isChecked"
        class="tvp-search-box__dropdown-item"
        @click="selectRadioItem(item)"
      >
        <span v-if="item.match" :title="item.label">
          <span v-for="text in item.match" :key="text">
            <span
              v-if="text.toLowerCase() === item.hightlighStr"
              class="tvp-search-box__text-highlight"
              >{{ text }}</span
            >
            <template v-else>{{ text }}</template>
          </span>
        </span>
        <span v-else :title="item.label">{{ item.label }}</span>
      </tiny-dropdown-item>
    </div>
    <div
      v-else-if="state.prevItem.type === 'checkbox'"
      v-loading="isLoading"
      :class="isLoading && 'tvp-search-box__loading-box'"
    >
      <template v-if="showCheckBoxList">
        <div class="tvp-search-box__checkbox-wrap">
          <tiny-checkbox-group v-model="state.checkAll" class="tvp-search-box__checkbox">
            <tiny-dropdown-item
              class="tvp-search-box__dropdown-item tvp-search-box__checkbox-item"
            >
              <tiny-checkbox
                v-model="state.checkAll"
                :indeterminate="state.isIndeterminate"
              >
                {{ t("tvp.tvpSearchbox.selectAll") }}
              </tiny-checkbox>
            </tiny-dropdown-item>
          </tiny-checkbox-group>
          <tiny-checkbox-group
            v-model="state.checkboxGroup"
            class="tvp-search-box__checkbox"
          >
            <tiny-dropdown-item
              v-for="(item, index) in state.backupList"
              v-show="!item.isFilter"
              :key="(item.field || item.label) + index"
              class="tvp-search-box__dropdown-item tvp-search-box__checkbox-item"
            >
              <tiny-checkbox
                :label="state.prevItem.label + item.label"
                :title="item.label"
                class="tvp-search-box__checkbox-item-label"
              >
                {{ item.label }}
              </tiny-checkbox>
            </tiny-dropdown-item>
          </tiny-checkbox-group>
        </div>
        <div class="tvp-search-box__checkbox-btn">
          <tiny-button size="mini" @click="selectCheckbox(false)">
            {{ t("tvp.tvpSearchbox.cancel") }}
          </tiny-button>
          <tiny-button size="mini" @click="selectCheckbox(true)">
            {{ t("tvp.tvpSearchbox.confirm") }}
          </tiny-button>
        </div>
      </template>
    </div>
    <div v-else-if="state.prevItem.type === 'numRange'" class="tvp-search-box__panel-box">
      <div class="tvp-search-box__number">
        <div class="tvp-search-box__dropdown-title">
          {{ t("tvp.tvpSearchbox.rangeNumberTitle") }}
        </div>
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
        <tiny-form-item :prop="state.curMaxNumVar" class="tvp-search-box__number-item">
          <tiny-input
            v-model="state[state.curMaxNumVar]"
            type="number"
            class="tvp-search-box__number-input"
          ></tiny-input>
        </tiny-form-item>
      </div>
      <div class="tvp-search-box__bottom-btn">
        <tiny-button size="mini" @click="sizeChange(false)">{{
          t("tvp.tvpSearchbox.cancel")
        }}</tiny-button>
        <tiny-button size="mini" @click.stop="sizeChange(true)">
          {{ t("tvp.tvpSearchbox.confirm") }}
        </tiny-button>
      </div>
    </div>

    <div
      v-else-if="state.prevItem.type === 'dateRange'"
      class="tvp-search-box__panel-box"
    >
      <div class="tvp-search-box__date-wrap">
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
            @change="handleDateShow"
            @blur="handleDateShow"
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
            @change="handleDateShow"
            @blur="handleDateShow"
          ></tiny-date-picker>
        </tiny-form-item>
      </div>
      <div class="tvp-search-box__bottom-btn">
        <tiny-button size="mini" @click="onConfirmDate(false)">
          {{ t("tvp.tvpSearchbox.cancel") }}
        </tiny-button>
        <tiny-button size="mini" @click="onConfirmDate(true)">
          {{ t("tvp.tvpSearchbox.confirm") }}
        </tiny-button>
      </div>
    </div>

    <div
      v-else-if="state.prevItem.type === 'datetimeRange'"
      class="tvp-search-box__panel-box"
    >
      <div class="tvp-search-box__date-wrap">
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
            @change="handleDateShow"
            @blur="handleDateShow"
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
            @change="handleDateShow"
            @blur="handleDateShow"
          ></tiny-date-picker>
        </tiny-form-item>
      </div>
      <div class="tvp-search-box__bottom-btn">
        <tiny-button size="mini" @click="onConfirmDate(false, true)">
          {{ t("tvp.tvpSearchbox.cancel") }}
        </tiny-button>
        <tiny-button size="mini" @click="onConfirmDate(true, true)">
          {{ t("tvp.tvpSearchbox.confirm") }}
        </tiny-button>
      </div>
    </div>

    <div v-else-if="state.prevItem.type === 'map'" v-loading="isLoading">
      <span v-if="state.isShowTagKey" class="tvp-search-box__filter-type">{{
        t("tvp.tvpSearchbox.tagKey")
      }}</span>
      <span v-else class="tvp-search-box__filter-type">{{
        t("tvp.tvpSearchbox.tagValue")
      }}</span>
      <tiny-dropdown-item
        v-for="(item, index) in state.backupList"
        v-show="!item.isFilter"
        :key="item.label + item.value + index"
        :disabled="item.isChecked"
        class="tvp-search-box__dropdown-item"
        @click="selectFirstMap(item, state.isShowTagKey)"
      >
        <span :title="item.label">{{ item.label }}</span>
      </tiny-dropdown-item>
    </div>
  </div>
</template>

<script>
// Vue2 版本的 second-level-panel 组件
import TinyFormItem from "@opentiny/vue-form-item";
import TinyDropdownItem from "@opentiny/vue-dropdown-item";
import TinyCheckbox from "@opentiny/vue-checkbox";
import TinyCheckboxGroup from "@opentiny/vue-checkbox-group";
import TinyDatePicker from "@opentiny/vue-date-picker";
import TinyInput from "@opentiny/vue-input";
import TinyButton from "@opentiny/vue-button";
import TinyLoading from "@opentiny/vue-loading";
import "../index.less";

export default {
  name: "TinySearchBoxSecondLevelPanel",
  components: {
    TinyFormItem,
    TinyDropdownItem,
    TinyCheckbox,
    TinyCheckboxGroup,
    TinyDatePicker,
    TinyInput,
    TinyButton,
  },
  directives: {
    loading: TinyLoading.directive,
  },
  props: {
    state: {
      type: Object,
      default: () => ({}),
    },
    pickerOptions: {
      type: Function,
      default: () => {
        // do nothing.
      },
    },
  },
  emits: ["events"],
  computed: {
    isLoading() {
      return (
        this.state.hasBackupList &&
        this.state.backupList &&
        this.state.backupList.length === 0
      );
    },
    // 多选未匹配到选项情况下，不显示全选以及确认按钮
    showCheckBoxList() {
      return (
        this.state.backupList && this.state.backupList.find((item) => !item.isFilter)
      );
    },
  },
  methods: {
    t(key, params) {
      const translations = {
        "tvp.tvpSearchbox.operator": "操作符",
        "tvp.tvpSearchbox.selectAll": "全选",
        "tvp.tvpSearchbox.cancel": "取消",
        "tvp.tvpSearchbox.confirm": "确认",
        "tvp.tvpSearchbox.rangeNumberTitle": "数字范围",
        "tvp.tvpSearchbox.minValueText": "最小值",
        "tvp.tvpSearchbox.maxValueText": "最大值",
        "tvp.tvpSearchbox.timeLengthTitle": "时间长度限制：{value}天",
        "tvp.tvpSearchbox.rangeDateTitle": "日期范围",
        "tvp.tvpSearchbox.rangeBeginLabel": "开始时间",
        "tvp.tvpSearchbox.rangeEndLabel": "结束时间",
        "tvp.tvpSearchbox.tagKey": "标签键",
        "tvp.tvpSearchbox.tagValue": "标签值",
      };
      let result = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((param) => {
          result = result.replace(`{${param}}`, params[param]);
        });
      }
      return result;
    },
    events(eventName, p1, p2) {
      this.$emit("events", eventName, p1, p2);
    },
    setOperator(e) {
      this.events("setOperator", e);
    },
    selectRadioItem(e) {
      this.events("selectRadioItem", e);
    },
    selectCheckbox(e) {
      this.events("selectCheckbox", e);
    },
    sizeChange(e) {
      this.events("sizeChange", e);
    },
    onConfirmDate(e, b) {
      this.events("onConfirmDate", e, b);
    },
    selectFirstMap(e, b) {
      this.events("selectFirstMap", e, b);
    },
    handleDateShow(e) {
      this.events("handleDateShow", e);
    },
  },
};
</script>
