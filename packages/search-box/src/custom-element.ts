import { defineCustomElement } from 'vue'
import TinySearchBox from './index.vue'

const TinySearchBoxElement = defineCustomElement(TinySearchBox)

// 注册为自定义元素
if (typeof window !== 'undefined' && !customElements.get('search-box')) {
  customElements.define('search-box', TinySearchBoxElement)
}

export default TinySearchBoxElement
