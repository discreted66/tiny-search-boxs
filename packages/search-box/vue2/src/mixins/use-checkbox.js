// Vue2版本的use-checkbox mixin
import { hasTagItem, createNewTag, getTagId, emitChangeModelEvent } from '../utils/tag'
import { deepClone, omitObj } from '../utils/clone'
import { showDropdown } from '../utils/dropdown'

export const useCheckboxMixin = {
  computed: {
    isShowClose() {
      return this.modelValue.length || this.state.propItem.label || this.state.inputValue
    }
  },
  methods: {
    selectCheckbox(confirm) {
      showDropdown(this.state, false)
      const { checkboxGroup, prevItem, propItem } = this.state
      const rest = omitObj(prevItem)
      if (confirm) {
        const tagList = []
        const oldValue = deepClone(this.state.innerModelValue)
        const { mergeTag, operators, label: prevLabel } = prevItem
        if (mergeTag) {
          let value = ''
          const options = []
          const { indexMap } = this.state
          const hasTagIndex = indexMap.get(prevLabel)
          hasTagIndex !== undefined && this.state.innerModelValue.splice(hasTagIndex, 1)

          this.state.backupList?.forEach((item) => {
            const { label } = item
            const checkboxLabel = `${prevLabel}${label}`
            const hasItem = checkboxGroup.includes(checkboxLabel)
            if (hasItem) {
              delete item.isFilter
              const id = getTagId(this, prevItem, item)
              const newOptions = { label: item.label, ...id }
              value += !value ? label : ` | ${label}`
              options.push(newOptions)
            }
          })
          if (options.length > 0) {
            const newTag = { ...rest, value, options }
            tagList.push(newTag)
          }
        } else {
          const { valueMap } = this.state
          const indexList = []
          this.state.backupList?.forEach((item) => {
            const { label } = item
            const value = `${prevLabel}${label}`
            const hasItem = checkboxGroup.includes(value)
            if (hasItem && !hasTagItem(this.state, label)) {
              const id = getTagId(this, prevItem, item)
              const operator = this.state.operatorValue && operators ? { operator: this.state.operatorValue } : null
              const newTag = createNewTag({ ...rest, label: propItem.label, value: label, ...id, ...operator })
              tagList.push(newTag)
              item.isChecked = true
            } else if (!hasItem && hasTagItem(this.state, label)) {
              item.isChecked = false
              const index = valueMap.get(value)
              indexList.push(index)
            }
          })
          if (indexList.length) {
            this.state.innerModelValue = this.state.innerModelValue.filter((item, index) => item && !indexList.includes(index))
          }
        }
        emitChangeModelEvent({ emits: this.$emit, state: this.state, tagList, oldValue })
      } else {
        this.state.propItem.label = ''
        this.state.inputValue = ''
      }
    }
  }
}
