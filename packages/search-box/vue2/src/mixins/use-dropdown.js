// Vue2版本的use-dropdown mixin - 完整功能版本
import { hasTagItem, resetInput, createNewTag, getTagId, emitChangeModelEvent } from '../utils/tag'
import { showDropdown } from '../utils/dropdown'
import { setStateNumRange } from '../utils/validate'
import { deepClone, omitObj } from '../utils/clone'

export const useDropdownMixin = {
  methods: {
    showValueItem(item) {
      const { start, end, type } = item
      this.state.backupList = item.options
      if (type === 'numRange') {
        setStateNumRange(this.state, item, this.t)
      } else if (type === 'dateRange') {
        const { dateRangeFormat } = this.state
        if (!this.state.startDate && start) {
          const newStart = this.format(start, dateRangeFormat)
          this.state.startDate = this.state.endDate < newStart ? null : newStart
        }
        if (!this.state.endDate && end) {
          const newEnd = this.format(end, dateRangeFormat)
          this.state.endDate = newEnd < this.state.startDate ? null : newEnd
        }
      } else if (type === 'datetimeRange') {
        const { datetimeRangeFormat } = this.state
        if (!this.state.startDateTime && start) {
          const newStart = this.format(start, datetimeRangeFormat)
          this.state.startDateTime = this.state.endDateTime < newStart ? null : newStart
        }
        if (!this.state.endDateTime && end) {
          const newEnd = this.format(end, datetimeRangeFormat)
          this.state.endDateTime = newEnd < this.state.startDateTime ? null : newEnd
        }
      } else if (this.state.backupList && type === 'checkbox') {
        this.state.filterList = this.state.backupList
        this.state.checkboxGroup = []
        this.state.backupList?.forEach((subItem) => {
          if (hasTagItem(this.state, subItem.label)) {
            this.state.checkboxGroup.push(`${item.label}${subItem.label}`)
          }
          subItem.isFilter = false
        })
      }

      if (type !== 'checkbox' && this.state.backupList?.length) {
        this.state.backupList?.forEach((option) => {
          option.isFilter = false
          option.isChecked = hasTagItem(this.state, option.label)
        })
      }

      this.state.currentOperators = null
      if (!this.state.backupList && !['dateRange', 'datetimeRange', 'numRange', 'custom'].includes(type)) {
        showDropdown(this.state, false)
      } else {
        showDropdown(this.state)
      }
    },

    selectPropItem(item) {
      const { field, label } = item
      this.state.propItem.label = label

      this.$emit('first-level-select', field)

      const inputRef = this.$refs.inputRef
      this.state.prevItem = item
      this.state.backupPrevItem = item
      const { operators } = item
      if (operators?.length) {
        this.state.operatorValue = ''
        this.state.currentOperators = operators
        showDropdown(this.state)
      } else {
        this.state.operatorValue = ':'
        this.showValueItem(item)
      }
      this.state.inputValue = ''
      inputRef.focus()
    },

    setOperator(operator) {
      this.state.operatorValue = operator
      this.showValueItem(this.state.prevItem)
    },

    /**
     * 更新modelValue值
     * @param prevItem items数组的第一层元素信息，用来识别此类型标签的某些属性作相应处理
     * @param item 当前选中的标签值信息
     * @param label 标签左侧的label
     * @param value 标签右侧值的value
     */
    updateModelValue(prevItem, item, label, value) {
      const { replace, operators, mergeTag } = prevItem
      const rest = omitObj(prevItem)
      const { indexMap } = this.state
      const index = indexMap.get(label)
      const id = getTagId(this, prevItem, item)
      const operator = this.state.operatorValue && operators ? { operator: this.state.operatorValue } : null
      let newTag = null

      if (mergeTag) {
        const options = { label: value, ...id }
        if (index >= 0) {
          const newValue = `${this.state.innerModelValue[index].value} | ${value}`
          const newOptions = [...this.state.innerModelValue[index].options, options]
          newTag = createNewTag({ ...this.state.innerModelValue[index], value: newValue, options: newOptions })
        } else {
          newTag = createNewTag({ ...rest, label, value, options: [options] })
        }
      } else {
        newTag = createNewTag({ ...rest, label, value, ...id, ...operator })
      }
      if (hasTagItem(this.state, value, label)) {
        resetInput(this.state)
        return
      }
      showDropdown(this.state, false)

      const oldValue = deepClone(this.state.innerModelValue)
      if ((replace || mergeTag) && index >= 0) {
        this.state.innerModelValue.splice(index, 1)
      }
      this.state.innerModelValue.push(newTag)
      const newValue = this.state.innerModelValue
      emitChangeModelEvent({ emits: this.$emit, state: this.state, newValue, oldValue })
    },

    /**
     * 使用输入选项
     * @param val 输入框的值
     */
    selectInputValue(val) {
      if (this.state.propItem?.label) {
        this.selectRadioItem({ label: val })
      } else {
        this.createTag()
      }
    },

    /**
     * 选中单选标签
     * @param item 选中的标签option项
     * @param isPotential 是否为选择潜在匹配项，默认否。参数可选
     */
    selectRadioItem(item, isPotential = false) {
      showDropdown(this.state, false)
      // 潜在匹配项没有prevItem
      if (isPotential) {
        this.state.prevItem = item
        this.state.backupPrevItem = item
      }

      const { prevItem } = this.state
      const value = item.value || item.label
      const inputRef = this.$refs.inputRef
      if (!hasTagItem(this.state, value)) {
        const tagLabel = this.state.propItem.label || item.label
        this.updateModelValue(prevItem, item, tagLabel, value)
      }
      inputRef.focus()
    },

    hasNotInputValueCreateTag(propItem, prevItem) {
      // 有label
      if (propItem.label) {
        if (!prevItem.options) {
          return
        }

        const hasTag = this.modelValue.find((item) => item.value === prevItem.options[0].label)

        if (!hasTag) {
          const label = prevItem.label
          const value = prevItem.options && prevItem.options[0].label
          this.updateModelValue(prevItem, prevItem.options[0], label, value)
          return
        }
      } else {
        this.$emit('search', this.state.innerModelValue)
      }
    },

    newTagUpdateModelValue(prevItem, propItem, tag) {
      const item = this.state.backupList?.find((subItem) => subItem.label === tag)
      this.updateModelValue(prevItem, item, propItem.label, tag)
    },

    hasInputValueCreateTag(inputValue, propItem, prevItem) {
      // 有label的情况
      if (propItem.label) {
        const { regexp, replace, type, mergeTag } = prevItem
        const tagList =
          (type !== 'checkbox' && replace) || (type === 'checkbox' && mergeTag)
            ? [inputValue]
            : inputValue.split(this.splitInputValue)

        if (regexp) {
          for (const tag of tagList) {
            if (regexp.test(tag)) {
              this.newTagUpdateModelValue(prevItem, propItem, tag)
            }
          }
          // 有输入且无正则
        } else {
          for (const tag of tagList) {
            this.newTagUpdateModelValue(prevItem, propItem, tag)
          }
        }
        // 无label的情况
      } else {
        const { items, defaultField } = this
        const currentItem =
          items.find((item) => {
            const { regexp } = item
            return regexp && regexp.test(this.state.inputValue)
          }) || (defaultField ? items.find((item) => item.field === defaultField) : this.state.allTypeAttri)
        const { replace, type, mergeTag } = currentItem
        const tagList =
          (type !== 'checkbox' && replace) || (type === 'checkbox' && mergeTag)
            ? [inputValue]
            : inputValue.split(this.splitInputValue)

        if (currentItem?.options?.length) {
          this.state.backupList = [...currentItem.options]
          this.state.backupList?.forEach((item) => {
            const label = item.value || item.label
            if (tagList.includes(label)) {
              item.isChecked = true
            }
          })
        }
        const label = currentItem.label
        for (const tag of tagList) {
          this.updateModelValue(currentItem, {}, label, tag)
        }
      }
    },

    createTag() {
      const { inputValue, propItem, prevItem } = this.state
      showDropdown(this.state, false)
      if (!inputValue) {
        // 输入为空的情况
        this.hasNotInputValueCreateTag(propItem, prevItem)
      } else {
        // 输入不为空的情况
        const { maxlength } = this
        if (maxlength && maxlength < inputValue.length) {
          this.$emit('exceed', maxlength)
          return
        }

        this.hasInputValueCreateTag(inputValue, propItem, prevItem)
      }
    },

    // 帮助图标点击事件
    helpClick() {
      this.$emit('help')
    }
  }
}