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
  <div class="tvp-search-box" @click.stop="showPopover(state, false)">
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
          <tiny-dropdown-menu tiny_mode="pc" :max-height="panelMaxHeight">
            <tiny-search-box-first-level-panel
              :state="state"
              :potential-options="potentialOptions"
              @events="handleEvents"
            />
            <tiny-search-box-second-level-panel
              :state="state"
              :picker-options="pickerOptions"
              @events="handleEvents"
            />
          </tiny-dropdown-menu>
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
                showDropdown: () => showPopover(state, true),
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
