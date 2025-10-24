// Vue2版本的use-datepicker mixin
import { showDropdown } from '../utils/dropdown'
import { getVerifyDateTag } from '../utils/validate'
import { emitChangeModelEvent } from '../utils/tag'

export const useDatePickerMixin = {
  methods: {
    async onConfirmDate(confirm, isDateTimeType = false) {
      if (!confirm) {
        this.state.propItem.label = ''
        return
      }
      const newTag = await getVerifyDateTag(this, this.state, this, isDateTimeType)
      if (newTag) {
        showDropdown(this.state, false)
        const newValue = this.modelValue.filter((prev) => prev.type !== newTag.type || prev.field !== newTag.field)
        newValue.push(newTag)
        emitChangeModelEvent({ emits: this.$emit, state: this.state, newValue })
      } else {
        showDropdown(this.state)
      }
    },

    handleDateShow() {
      return showDropdown(this.state)
    },

    pickerOptions(startDate, endName = '') {
      return {
        disabledDate(time) {
          const { maxTimeLength = 0, min, max } = this.state.prevItem

          const endDate = this.state[endName]
          const curTime = time.getTime()
          // 有限制时间跨度timeLength时
          if (maxTimeLength > 0) {
            if (min || max) {
              if (endName && endDate) {
                const end = new Date(endDate).getTime()
                const start = !min && max ? end - maxTimeLength : Math.max(min.getTime(), end - maxTimeLength)
                return curTime < start || curTime > end
              } else if (!endName && startDate) {
                const start = new Date(startDate).getTime()
                const end = min && !max ? start + maxTimeLength : Math.min(max.getTime(), start + maxTimeLength)
                return curTime < start || curTime > end
              } else {
                return (min && curTime < min.getTime()) || (max && curTime > max.getTime())
              }
            } else {
              if (endName && endDate) {
                const end = new Date(endDate).getTime()
                const start = end - maxTimeLength
                return curTime < start || curTime > end
              } else if (!endName && startDate) {
                const start = new Date(startDate).getTime()
                const end = start + maxTimeLength
                return curTime < start || curTime > end
              } else {
                return false
              }
            }
          } else {
            if (min || max) {
              if (endName && endDate) {
                const end = new Date(endDate).getTime()
                return (min && curTime < min.getTime()) || curTime > end
              } else if (!endName && startDate) {
                const start = new Date(startDate).getTime()
                return curTime < start || (max && curTime > max.getTime())
              } else {
                return curTime < min || curTime > max
              }
            } else {
              if (endName && endDate) {
                const end = new Date(endDate).getTime()
                return curTime > end
              } else if (!endName && startDate) {
                const start = new Date(startDate).getTime()
                return curTime < start
              } else {
                return false
              }
            }
          }
        }
      }
    }
  }
}
