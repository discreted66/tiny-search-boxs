// Vue2版本的use-placeholder mixin
export const usePlaceholderMixin = {
  computed: {
    placeholder() {
      if (this.state.propItem.label) {
        const { placeholder, type } = this.state.prevItem
        if (placeholder) {
          return placeholder
        } else if (type === 'map') {
          return this.t('tvp.tvpSearchbox.tagPlaceholder')
        } else if (this.state.backupList?.length) {
          return this.t('tvp.tvpSearchbox.dynamicPlaceholder', { newValue: this.state.propItem.label })
        } else {
          return this.t('tvp.tvpSearchbox.addPlaceholder')
        }
      } else {
        if (this.modelValue.length > 0) {
          return this.t('tvp.tvpSearchbox.addPlaceholder')
        } else {
          return this.emptyPlaceholder || this.t('tvp.tvpSearchbox.addPlaceholder')
        }
      }
    }
  },
  watch: {
    'state.propItem.label'(newValue) {
      // placeholder现在是computed属性，不需要手动设置
    }
  },
  methods: {
    setPlaceholder(placeholderValue) {
      // placeholder现在是computed属性，不需要手动设置
      console.log('setPlaceholder called with:', placeholderValue)
    }
  }
}
