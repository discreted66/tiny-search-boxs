// Vue2版本的use-edit mixin
import { emitChangeModelEvent } from '../utils/tag'
import { getVerifyNumTag, getVerifyDateTag, setStateNumRange, getVerifyTag } from '../utils/validate'
import { showDropdown } from '../utils/dropdown'

export const useEditMixin = {
  methods: {
    setDropdownProps(curTag) {
      const { operator, value, start, end } = curTag
      const { options, operators, type, mergeTag } = this.state.prevItem
      if (type === 'custom') {
        return
      } else if (type === 'numRange') {
        setStateNumRange(this.state, curTag, this.t)
      } else if (type === 'dateRange') {
        const { dateRangeFormat } = this.state
        this.state.startDate = this.format(start, dateRangeFormat)
        this.state.endDate = this.format(end, dateRangeFormat)
      } else if (type === 'datetimeRange') {
        const { datetimeRangeFormat } = this.state
        this.state.startDateTime = this.format(start, datetimeRangeFormat)
        this.state.endDateTime = this.format(end, datetimeRangeFormat)
      } else {
        if (mergeTag) {
          this.state.inputEditValue = curTag.options?.flatMap((item) => item.label)
          this.state.currentEditSelectTags = this.state.inputEditValue
        } else {
          this.state.inputEditValue = value
        }
        this.state.currentEditValue = options
      }
      this.state.operatorValue = operator
      this.state.currentOperators = operators
    },

    editTag(tag, index, e) {
      if (!this.editable || (tag.type && tag.type === 'map')) {
        return
      }

      showDropdown(this.state, false)
      this.state.popoverVisible = false
      const dom = e.target.classList.contains('tiny-tag') ? e.target : e.srcElement.parentElement

      this.$nextTick(() => {
        const { popoverRef } = this.$refs
        popoverRef.state.referenceElm = dom
        popoverRef.state.popperElm && (popoverRef.state.popperElm.style.display = 'none')
        popoverRef.doDestroy()
        this.state.popoverVisible = true
      })

      this.state.prevItem = this.state.recordItems.find((item) => item.field === tag.field)
      !this.state.prevItem && (this.state.prevItem = tag)
      this.state.selectValue = tag.label
      this.state.currentModelValueIndex = index

      this.$emit('tagClick', tag)
      this.setDropdownProps(tag)
    },

    selectPropChange(item, disabled) {
      if (disabled) return
      this.state.prevItem = item
      this.setDropdownProps(item)
    },

    async confirmEditTag(isConfirm) {
      if (!isConfirm) {
        this.state.popoverVisible = false
        return
      }

      const { prevItem, currentModelValueIndex: index } = this.state

      let newTag = null
      if (prevItem.type === 'numRange') {
        newTag = await getVerifyNumTag(this, this.state, this)
      } else if (prevItem.type === 'dateRange') {
        newTag = await getVerifyDateTag(this, this.state, this, false)
      } else if (prevItem.type === 'datetimeRange') {
        newTag = await getVerifyDateTag(this, this.state, this, true)
      } else {
        newTag = await getVerifyTag(this, this.state, this)
      }

      if (newTag) {
        showDropdown(this.state, false)
        this.state.popoverVisible = false
        emitChangeModelEvent({ emits: this.$emit, state: this.state, index, newTag, isEdit: true })
      } else {
        this.state.popoverVisible = true
      }

      this.state.currentEditValue = []
    },

    selectItemIsDisable(item) {
      if (item.type && item.type === 'map') {
        return true
      }

      if (this.state.prevItem?.operators || item.operators) {
        return this.state.prevItem.operators?.length !== item.operators?.length
      }

      const typeArr = ['radio', 'checkbox']
      if (this.state.prevItem.type && typeArr.includes(this.state.prevItem.type)) {
        return !item.type ? false : !typeArr.includes(item.type)
      }

      return this.state.prevItem?.type !== item.type
    }
  }
}
