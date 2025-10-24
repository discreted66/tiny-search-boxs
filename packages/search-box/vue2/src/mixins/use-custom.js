// Vue2版本的use-custom mixin
import { resetInput, emitChangeModelEvent, hasTagItem } from '../utils/tag'
import { showDropdown, showPopover } from '../utils/dropdown'

export const useCustomMixin = {
  methods: {
    updateCustomValue(customTag) {
      showDropdown(this.state, false)
      const { prevItem, indexMap } = this.state
      const { replace, label } = prevItem

      const tagList = []
      if (replace && indexMap.has(label)) {
        const index = indexMap.get(label)
        const newTag = { ...prevItem, ...customTag }
        emitChangeModelEvent({ emits: this.$emit, state: this.state, newTag, index })
        return
      } else if (!replace && Array.isArray(customTag)) {
        customTag.forEach((tag) => {
          if (!hasTagItem(this.state, tag.value)) {
            tagList.push({ ...prevItem, ...tag })
          }
        })
      } else {
        if (!hasTagItem(this.state, customTag.value)) {
          tagList.push({ ...prevItem, ...customTag })
        }
      }
      emitChangeModelEvent({ emits: this.$emit, state: this.state, tagList })
    },

    handleConfirm(customTag) {
      if (!customTag) {
        resetInput(this.state)
        showDropdown(this.state, false)
        return
      }

      this.updateCustomValue(customTag)
    },

    handleEditConfirm(customTag) {
      if (!customTag) {
        showPopover(this.state, false)
        return
      }

      this.updateCustomValue(customTag)
    }
  }
}
