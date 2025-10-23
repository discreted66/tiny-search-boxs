/**
 * Copyright (c) 2022 - present TinyVue Authors.
 * Copyright (c) 2022 - present Huawei Cloud Computing Technologies Co., Ltd.
 *
 * Use of this source code is governed by an MIT-style license.
 *
 * THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL,
 * BUT WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR
 * A PARTICULAR PURPOSE. SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
 *
 */

import { format } from '../utils/date'
import { t } from '../utils/i18n'
import { useTag } from '../composables/use-tag'
import { useDropdown } from '../composables/use-dropdown'
import { useMatch } from '../composables/use-match'
import { useCheckbox } from '../composables/use-checkbox'
import { useDatePicker } from '../composables/use-datepicker'
import { useNumRange } from '../composables/use-num-range'
import { useEdit } from '../composables/use-edit'
import { useCustom } from '../composables/use-custom'
import { useInit } from '../composables/use-init'
import { usePlaceholder } from '../composables/use-placeholder'
import { showDropdown, showPopover } from '../utils/dropdown'
import { deepClone } from '../utils/clone'
import { resetInput } from '../utils/tag'

/**
 * Renderless 函数 - 核心业务逻辑
 * 参考 tiny-vue 的 renderless 架构实现
 */
export const renderless = (
    props,
    { computed, reactive, watch, nextTick },
    { t, emit: $emit, vm, i18n, designConfig }
) => {
    const api = {}
    const emit = props.emitter ? props.emitter.emit : $emit

    // 响应式状态
    const state = reactive({
        innerModelValue: [...props.modelValue],
        recordItems: [],
        groupItems: {},
        inputValue: '',
        matchItems: {},
        propItem: {},
        backupList: [],
        filterList: [],
        checkboxGroup: [],
        prevItem: {},
        backupPrevItem: '',
        formRules: null,
        validType: 'text',
        numberShowMessage: true,
        startDate: null,
        startDateTime: null,
        endDate: null,
        endDateTime: null,
        isShowTagKey: true,
        potentialOptions: null,
        dateRangeFormat: 'yyyy/MM/dd',
        datetimeRangeFormat: 'yyyy/MM/dd HH:mm:ss',
        indexMap: new Map(),
        valueMap: new Map(),
        popoverVisible: false,
        selectValue: '',
        allTypeAttri: { label: t('tvp.tvpSearchbox.rulekeyword1'), field: 'tvpKeyword', type: 'radio' },
        operatorValue: ':',
        inputEditValue: '',
        currentOperators: '',
        currentEditValue: '',
        currentModelValueIndex: -1,
        curMinNumVar: '',
        curMaxNumVar: '',
        instance: vm,
        isMouseDown: false,
        currentEditSelectTags: [],
        visible: false,
        visibleTimer: null
    })

    // 初始化组合式函数
    const initComposables = () => {
        const emitFn = emit.bind(vm)
        const nextTickFn = nextTick.bind(vm)

        const dropdownApi = useDropdown({ props, emit: emitFn, state, t, format })
        const tagApi = useTag({ props, state, emit: emitFn })
        const editApi = useEdit({ props, state, t, nextTick: nextTickFn, format, emit: emitFn })
        const matchApi = useMatch({ props, state, emit: emitFn })
        const placeholderApi = usePlaceholder({ props, state, t })
        const checkboxApi = useCheckbox({ props, state, emit: emitFn })
        const datePickerApi = useDatePicker({ props, state, emit: emitFn })
        const numRangeApi = useNumRange({ props, state, t, emit: emitFn })
        const customApi = useCustom({ state, emit: emitFn })
        const initApi = useInit({ props, state })

        return {
            dropdownApi,
            tagApi,
            editApi,
            matchApi,
            placeholderApi,
            checkboxApi,
            datePickerApi,
            numRangeApi,
            customApi,
            initApi
        }
    }

    const composables = initComposables()

    // 计算属性
    const hasBackupList = computed(() => {
        return state.propItem.label && [undefined, 'radio', 'checkbox', 'map'].includes(state.prevItem.type)
    })

    const isIndeterminate = computed(() => {
        return state.checkboxGroup.length > 0 && state.checkboxGroup.length !== state.filterList.length
    })

    const checkAll = computed({
        get() {
            return state.checkboxGroup.length && state.checkboxGroup.length === state.filterList.length
        },
        set(val) {
            if (val) {
                state.checkboxGroup = state.filterList.flatMap((item) => `${state.prevItem.label}${item.label}`)
            } else {
                state.checkboxGroup = []
            }
        }
    })

    const placeholder = computed(() => {
        return composables.placeholderApi ? composables.placeholderApi.placeholder : ''
    })

    const isShowClose = computed(() => {
        return composables.checkboxApi ? composables.checkboxApi.isShowClose : false
    })

    // 事件处理方法
    const handleEvents = (eventName, p1, p2) => {
        const eventsMap = {
            selectInputValue: composables.dropdownApi?.selectInputValue,
            selectPropItem: composables.dropdownApi?.selectPropItem,
            selectRadioItem: composables.dropdownApi?.selectRadioItem,
            setOperator: composables.dropdownApi?.setOperator,
            selectCheckbox: composables.checkboxApi?.selectCheckbox,
            sizeChange: composables.numRangeApi?.sizeChange,
            onConfirmDate: composables.datePickerApi?.onConfirmDate,
            selectFirstMap: composables.matchApi?.selectFirstMap,
            handleDateShow: composables.datePickerApi?.handleDateShow
        }

        if (typeof eventsMap[eventName] === 'function') {
            eventsMap[eventName](p1, p2)
        } else {
            console.warn(`[TinySearchBox] Unknown event: ${eventName}`)
        }
    }

    // 代理方法到组合式函数
    const createTag = () => {
        if (composables.dropdownApi?.createTag) {
            composables.dropdownApi.createTag()
        }
    }

    const helpClick = () => {
        if (composables.dropdownApi?.helpClick) {
            composables.dropdownApi.helpClick()
        }
    }

    const deleteTag = (tag) => {
        if (composables.tagApi?.deleteTag) {
            composables.tagApi.deleteTag(tag)
        }
    }

    const clearTag = () => {
        if (composables.tagApi?.clearTag) {
            composables.tagApi.clearTag()
        }
    }

    const backspaceDeleteTag = () => {
        if (composables.tagApi?.backspaceDeleteTag) {
            composables.tagApi.backspaceDeleteTag()
        }
    }

    const editTag = (tag, index, event) => {
        if (composables.editApi?.editTag) {
            composables.editApi.editTag(tag, index, event)
        }
    }

    const confirmEditTag = (confirm) => {
        if (composables.editApi?.confirmEditTag) {
            composables.editApi.confirmEditTag(confirm)
        }
    }

    const selectPropChange = (item, disabled) => {
        if (composables.editApi?.selectPropChange) {
            composables.editApi.selectPropChange(item, disabled)
        }
    }

    const selectItemIsDisable = (item) => {
        return composables.editApi?.selectItemIsDisable ? composables.editApi.selectItemIsDisable(item) : false
    }

    const handleInput = () => {
        if (composables.matchApi?.handleInput) {
            composables.matchApi.handleInput()
        }
    }

    const handleClick = (e) => {
        if (composables.initApi?.handleClick) {
            composables.initApi.handleClick(e)
        }
    }

    const pickerOptions = (startDate, endDate) => {
        return composables.datePickerApi?.pickerOptions ? composables.datePickerApi.pickerOptions(startDate, endDate) : {}
    }

    const handleConfirm = (customTag) => {
        if (composables.customApi?.handleConfirm) {
            composables.customApi.handleConfirm(customTag)
        }
    }

    const handleEditConfirm = (customTag) => {
        if (composables.customApi?.handleEditConfirm) {
            composables.customApi.handleEditConfirm(customTag)
        }
    }

    const initItems = () => {
        if (composables.initApi?.initItems) {
            composables.initApi.initItems()
        }
    }

    const initFormRule = () => {
        if (composables.numRangeApi?.initFormRule) {
            composables.numRangeApi.initFormRule()
        }
    }

    const watchOutsideClick = () => {
        if (composables.initApi?.watchOutsideClick) {
            composables.initApi.watchOutsideClick()
        }
    }

    const watchMouseDown = () => {
        if (composables.initApi?.watchMouseDown) {
            composables.initApi.watchMouseDown()
        }
    }

    const watchMouseMove = () => {
        if (composables.initApi?.watchMouseMove) {
            composables.initApi.watchMouseMove()
        }
    }

    const setPlaceholder = (placeholder) => {
        if (composables.placeholderApi?.setPlaceholder) {
            composables.placeholderApi.setPlaceholder(placeholder)
        }
    }

    // 监听器
    watch(() => props.items, (newVal) => {
        state.recordItems = deepClone(newVal)
        initItems()
        initFormRule()
    }, { deep: true, immediate: true })

    watch(() => state.popoverVisible, (newVal) => {
        if (!newVal && !state.inputEditValue.length) {
            state.inputEditValue = state.currentEditSelectTags
        }
    }, { immediate: true })

    watch(() => props.modelValue, (newVal) => {
        if (newVal) {
            state.indexMap.clear()
            state.valueMap.clear()
            newVal.forEach((item, index) => {
                const value = `${item.label}${item.value}`
                state.indexMap.set(item.label, index)
                state.valueMap.set(value, index)
                if (item.options?.length > 0) {
                    item.options.forEach((option) => {
                        const optionValue = `${item.label}${option.label}`
                        state.valueMap.set(optionValue, index)
                    })
                }
            })
            showPopover(state, false)
            if (newVal.length === 0) {
                setPlaceholder(props.emptyPlaceholder)
            }

            if (props.editable && !state.inputEditValue.length && newVal[0]) {
                state.inputEditValue = newVal[0].value
            }
            state.innerModelValue = [...newVal]
        }
    }, { deep: true, immediate: true })

    // 初始化API
    Object.assign(api, {
        state,
        hasBackupList,
        isIndeterminate,
        checkAll,
        placeholder,
        isShowClose,
        handleEvents,
        createTag,
        helpClick,
        deleteTag,
        clearTag,
        backspaceDeleteTag,
        editTag,
        confirmEditTag,
        selectPropChange,
        selectItemIsDisable,
        handleInput,
        handleClick,
        pickerOptions,
        handleConfirm,
        handleEditConfirm,
        initItems,
        initFormRule,
        watchOutsideClick,
        watchMouseDown,
        watchMouseMove,
        setPlaceholder,
        // 工具方法
        t,
        showDropdown,
        showPopover,
        resetInput
    })

    return api
}
