// Vue2版本的use-num-range mixin
import { showDropdown } from '../utils/dropdown'
import { getVerifyNumTag } from '../utils/validate'
import { emitChangeModelEvent } from '../utils/tag'

export const useNumRangeMixin = {
  methods: {
    async sizeChange(confirm) {
      if (!confirm) {
        this.state.propItem.label = ''
        return
      }

      const newTag = await getVerifyNumTag(this, this.state, this)
      if (newTag) {
        showDropdown(this.state, false)
        const newValue = this.modelValue.filter((prev) => prev.type !== newTag.type || prev.field !== newTag.field)
        newValue.push(newTag)
        emitChangeModelEvent({ emits: this.$emit, state: this.state, newValue })
      } else {
        showDropdown(this.state)
      }
    },

    /**
     * 创建 type=dateRange 和 type = datetimeRange 的校验规则
     * @param startKey 校验的开始日期名
     * @param endKey 校验的结束日期名
     */
    createDateRules(item, startKey, endKey) {
      const { maxTimeLength = 0 } = item
      return {
        [startKey]: {
          validator: (rule, value, cb) => {
            if (maxTimeLength > 0 && !value) {
              cb(new Error(this.t('tvp.tvpSearchbox.notBeNull')))
            } else if (!value && !this.state[endKey]) {
              cb(new Error(this.t('tvp.tvpSearchbox.rangeDateTitle')))
            } else {
              cb()
            }
          }
        },
        [endKey]: {
          validator: (rule, value, cb) => {
            if (maxTimeLength > 0 && !value) {
              cb(new Error(this.t('tvp.tvpSearchbox.notBeNull')))
            } else if (!value && !this.state[startKey]) {
              cb(new Error(this.t('tvp.tvpSearchbox.rangeDateTitle')))
            } else {
              cb()
            }
          }
        }
      }
    },

    initFormRule() {
      let dateRules = {},
        datetimeRules = {}
      this.items.forEach((item) => {
        if (item.type === 'dateRange') {
          dateRules = this.createDateRules(item, 'startDate', 'endDate')
        }

        if (item.type === 'datetimeRange') {
          datetimeRules = this.createDateRules(item, 'startDateTime', 'endDateTime')
        }
      })
      this.state.formRules = {
        ...dateRules,
        ...datetimeRules
      }
      if (this.editable) {
        this.state.formRules.inputEditValue = {
          required: true,
          message: this.t('tvp.tvpSearchbox.notBeNull'),
          trigger: ['change', 'blur']
        }
      }
    }
  }
}
