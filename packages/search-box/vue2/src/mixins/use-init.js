// Vue2版本的use-init mixin
import { showDropdown, showPopover } from '../utils/dropdown'
import { hasTagItem } from '../utils/tag'

export const useInitMixin = {
  methods: {
    initItems() {
      this.state.groupItems = {}
      this.state.recordItems.forEach((item) => {
        const { groupKey = '0' } = item
        if (this.state.groupItems[groupKey]) {
          this.state.groupItems[groupKey].push({ ...item })
        } else {
          this.state.groupItems[groupKey] = [{ ...item }]
          this.state.matchItems[groupKey] = { attr: [], attrValue: [] }
        }
        if (this.state.prevItem && item.field === this.state.prevItem.field && item !== this.state.prevItem) {
          const { options, type } = item
          this.state.prevItem = item
          if (options?.length) {
            this.state.backupList = options
          }
          if (type === 'checkbox') {
            this.state.filterList = this.state.backupList
            this.state.checkboxGroup = []
            this.state.backupList?.forEach((subItem) => {
              const { label } = subItem
              if (hasTagItem(this.state, label)) {
                this.state.checkboxGroup.push(`${item.label}${label}`)
              }
              subItem.isFilter = false
            })
          }
          showDropdown(this.state, item.field === this.state.prevItem.field && item !== this.state.prevItem)
        }
      })
    },

    handleClick(e) {
      const { backupPrevItem, prevItem } = this.state
      e.stopPropagation()
      if (this.editable) {
        this.state.popoverVisible = false
        this.state.currentEditValue = []
        if (this.state.propItem.label && backupPrevItem && backupPrevItem !== prevItem) {
          this.state.prevItem = backupPrevItem
        }
      }

      if (
        (this.state.hasBackupList && (this.state.backupList?.length === 0 || !this.state.backupList) && !this.state.inputValue) ||
        this.items.length === 0
      ) {
        showDropdown(this.state, false)
      } else {
        showDropdown(this.state)
      }
    },

    watchOutsideClick() {
      if (this.editable) {
        showPopover(this.state, false)
      }

      this.state.isMouseDown = false
      showDropdown(this.state, false)
    },

    watchMouseDown() {
      this.state.isMouseDown = true
    },

    watchMouseMove() {
      if (this.state.isMouseDown) {
        this.state.isMouseDown = false
      }
    }
  }
}
