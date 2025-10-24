// Vue2版本的use-match mixin
import Loading from '@opentiny/vue-loading'
import { debounce } from '../utils/index'
import { hasTagItem, createNewTag, getTagId, emitChangeModelEvent } from '../utils/tag'
import { showDropdown } from '../utils/dropdown'

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getHighlightMatch = (labelRegex, label) => {
  const match = []
  let lastIndex = 0
  let result

  // 当正则表达式在label中找到匹配项时，不断进行匹配
  while ((result = labelRegex.exec(label)) !== null) {
    const startIndex = result.index // 获取当前匹配项的开始位置
    const endIndex = labelRegex.lastIndex // 获取当前匹配项的结束位置

    // 如果当前匹配项的开始位置大于上一次匹配项的结束位置，说明中间有未匹配的部分
    if (startIndex > lastIndex) {
      match.push(label.slice(lastIndex, startIndex)) // 将未匹配的部分添加到match数组中
    }

    match.push(label.slice(startIndex, endIndex)) // 将当前匹配项添加到match数组中
    lastIndex = endIndex // 更新上一次匹配项的结束位置
  }

  // 如果最后一次匹配项的结束位置小于label的长度，说明label的末尾还有未匹配的部分
  if (lastIndex < label.length) {
    match.push(label.slice(lastIndex)) // 将未匹配的部分添加到match数组中
  }

  return match
}

export const useMatchMixin = {
  data() {
    return {
      loadingInstance: null
    }
  },
  methods: {
    async getMatchList(keyword) {
      if (typeof document !== 'undefined') {
        !this.loadingInstance &&
          (this.loadingInstance = Loading.service({
            target: document.getElementById('potential-loading')
          }))
      }
      this.state.potentialOptions = await this.potentialOptions.getMatchList(keyword)
      this.loadingInstance && this.loadingInstance.close()
      showDropdown(this.state, true)
    },

    handleSearch(e) {
      const { recordItems, propItem } = this.state
      const inputValue = e.target.value.trim()
      const { maxlength } = this

      if (maxlength && maxlength < inputValue.length) {
        this.$emit('exceed', maxlength)
        return
      }

      if (inputValue.length === 0) {
        showDropdown(this.state)
        return
      }

      Object.keys(this.state.matchItems).forEach((key) => {
        this.state.matchItems[key].attr = []
        this.state.matchItems[key].attrValue = []
      })

      const value = escapeRegExp(inputValue)
      const patt = new RegExp(value, 'i')
      const hasItem =
        propItem.label || !value ? null : recordItems.find((item) => item.type === 'map' && patt.test(item.label))
      if (hasItem) {
        this.state.propItem.label = hasItem.label
        this.state.inputValue = ''
        this.state.prevItem = hasItem
        this.state.backupPrevItem = hasItem
        this.state.backupList = hasItem.options || []
        return
      }

      this.state.filterList = this.state.backupList?.filter((item) => {
        if (patt.test(item.label)) {
          delete item.isFilter
          if (hasTagItem(this.state, item.label)) {
            this.state.checkboxGroup.push(`${this.state.prevItem.label}${item.label}`)
          }

          return true
        } else {
          item.isFilter = true
          return false
        }
      })

      const labelRegex = new RegExp(value, 'ig')
      const hightlighStr = inputValue.toLowerCase()

      // 有label，只在backupList搜索
      if (this.state.propItem.label) {
        this.state.backupList?.forEach((item) => {
          item.hightlighStr = hightlighStr
          const itemLabel = item.label
          if (patt.test(itemLabel)) {
            item.match = getHighlightMatch(labelRegex, itemLabel)
            item.isFilter = false
          } else {
            item.isFilter = true
          }
        })
        // 添加默认选项，未匹配有输入值到也展示面板
        if (this.state.backupList?.length || inputValue) {
          showDropdown(this.state)
        } else {
          showDropdown(this.state, false)
        }
        return
      }

      // 无label，需要全局搜
      for (const item of recordItems) {
        const { options = [], groupKey = '0', ...rest } = item
        const itemLabel = rest.label
        if (patt.test(itemLabel)) {
          const match = getHighlightMatch(labelRegex, itemLabel)
          this.state.matchItems[groupKey].attr.push({ ...item, match, hightlighStr })
        }
        for (const option of options) {
          const optionLabel = this.state.propItem.label ? itemLabel : `${itemLabel}：${option.label}`
          if (patt.test(optionLabel)) {
            const match = getHighlightMatch(labelRegex, optionLabel)
            this.state.matchItems[groupKey].attrValue.push({
              ...option,
              ...rest,
              options,
              hightlighStr,
              value: option.label,
              match
            })
          }
        }
      }

      if (value && this.potentialOptions && this.potentialOptions.getMatchList) {
        this.getMatchList(value)
      } else {
        showDropdown(this.state)
      }
    },

    handleInput: debounce(function(e) {
      this.handleSearch(e)
    }, 500),

    resetBackupList() {
      this.state.backupList?.forEach((item) => item.isFilter && delete item.isFilter)
    },

    selectFirstMap(item, isFirst) {
      const { options } = item
      const { prevItem, propItem } = this.state
      if (options) {
        showDropdown(this.state, false)
        this.state.propItem.value = `${item.label}=`
        this.state.isShowTagKey = false
        this.state.inputValue = ''
        this.state.backupList = item.options || []
        this.resetBackupList()

        this.state.backupList?.forEach((subItem) => {
          const value = propItem.value + subItem.label
          subItem.isChecked = hasTagItem(this.state, value)
        })
      } else {
        if (item.isChecked) {
          return
        }

        showDropdown(this.state, false)
        this.state.isShowTagKey = true
        this.resetBackupList()
        const { field, type } = prevItem
        const value = propItem.value + item.label
        const id = getTagId(this, prevItem, item)
        const newTag = createNewTag({ type, field, label: propItem.label, value, ...id })
        const tagList = [newTag]
        emitChangeModelEvent({ emits: this.$emit, state: this.state, tagList })
      }
      if (isFirst) {
        showDropdown(this.state)
      }
    }
  }
}
