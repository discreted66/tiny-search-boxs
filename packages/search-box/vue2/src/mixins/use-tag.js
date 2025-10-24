// Vue2版本的use-tag mixin
import { showDropdown } from '../utils/dropdown'
import { emitChangeModelEvent } from '../utils/tag'

export const useTagMixin = {
  methods: {
    changeIsChecked(tag) {
      if (tag) {
        const parent = this.state.recordItems.find((item) => item.label === tag.label)
        if (parent && parent.options) {
          const child = parent.options.find((item) => item.label === tag.value)
          child && (child.isChecked = false)
        }
      }
    },

    deleteTag(tag) {
      showDropdown(this.state, false)
      this.changeIsChecked(tag)
      const newValue = this.modelValue.filter((item) => item !== tag)
      emitChangeModelEvent({ emits: this.$emit, state: this.state, newValue })
    },

    clearTag() {
      showDropdown(this.state, false)
      this.modelValue.forEach((item) => this.changeIsChecked(item))
      this.state.propItem = {}
      this.state.inputValue = ''
      emitChangeModelEvent({ emits: this.$emit, state: this.state, newValue: [] })
      this.$emit('clear')
    },

    backspaceDeleteTag() {
      if (this.state.inputValue) {
        return
      }
      if (this.state.propItem.label) {
        this.state.propItem = {}
        return
      }
      if (this.state.lastInputValue === '' && this.state.inputValue === '') {
        showDropdown(this.state, false)
        const lastIndex = this.modelValue.length - 1
        this.changeIsChecked(this.modelValue[lastIndex])
        const newValue = this.state.innerModelValue.slice(0, this.modelValue.length - 1)
        emitChangeModelEvent({ emits: this.$emit, state: this.state, newValue })
      }
      this.state.lastInputValue = this.state.inputValue
      this.$refs.inputRef && this.$refs.inputRef.$el.click()
    }
  }
}
