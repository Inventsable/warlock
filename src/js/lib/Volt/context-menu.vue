<script setup lang="ts">
/**
 * There still seems to be an issue with deep nesting where depths > 2 can't find menu items by id.
 * 
 * This could be due to ids being stripped or rewritten as different values, or wrong var references somewhere.
 * 
 * In any case, it works exactly like Brutalism's but with full Typescript support.
 */

import { generateQuickGuid } from "./mixins";
import { computed, onMounted, watch } from "vue";
import type { Ref } from 'vue'
import type { ContextMenuItem, ContextMenu } from './types'
import type { ContextMenuItemProp, ContextMenuProp } from './types/props'

const emit = defineEmits<{
  click: [value: ContextMenuItem],
  'update:modelValue': [value: ContextMenu | Ref<ContextMenu>],
}>();

export interface Props {
  debug?: boolean, // Used to toggle console statements within component for debugging
  refresh?: boolean | Ref<boolean>,
  modelValue?: ContextMenuItem[] | Ref<ContextMenuItem[]>,
}

const props = withDefaults(defineProps<Props>(), {
  refresh: false,
  debug: false,
  modelValue: () => [] as ContextMenuItem[]
})

const menuBase = computed<ContextMenuItem[] | Ref<ContextMenuItem[]>>({
  get(): ContextMenuItem[] | Ref<ContextMenuItem[]> {
    return props.modelValue as ContextMenuItem[] | Ref<ContextMenuItem[]>;
  },
  set(val: ContextMenuItem[] | Ref<ContextMenuItem[]>): void {
    emit("update:modelValue", val);
  }
});

const menuBaseSanitized = computed(() => {
  return sanitizeMenuList((menuBase as Ref<ContextMenu>).value ?? props.modelValue)
})

const sanitizeMenuList = (item: ContextMenu): ContextMenuProp => {
  return ((menuBase as Ref<ContextMenu>).value ?? props.modelValue).map((item: ContextMenuItem) =>
    sanitizeContextMenuItem(item)
  ) as ContextMenuProp
}

const desanitizeMenuList = (list: ContextMenuProp, comparator: ContextMenuItem[]): ContextMenuItem[] => {
  return list.map((item: ContextMenuItemProp, index: number) => desanitizeMenuItem(item as ContextMenuItemProp, comparator[index]))
}
const desanitizeMenuItem = (item: ContextMenuItemProp, comparator: ContextMenuItem) => {
  Object.keys(item).filter((key: string) => !Object.keys(comparator).includes(key)).forEach((key: string) => {
    delete item[key as keyof ContextMenuItemProp]
  })
  if (item.menu && comparator.menu)
    desanitizeMenuList(item.menu as ContextMenuProp, comparator.menu)
  return item;
}

const menuExtended = computed(() => {
  let prepend: ContextMenuItem[] = [];
  if ((props.refresh as Ref<boolean>).value ?? props.refresh) {
    prepend.push(sanitizeContextMenuItem({ label: 'Refresh panel', callback: () => location.reload() }))
    if ((props.modelValue as ContextMenu)?.length || (props.modelValue as Ref<ContextMenu>)?.value?.length)
      prepend.push({ label: '---' })
  }
  return [...prepend, ...(menuBaseSanitized.value as ContextMenuItem[])];
})

const sanitizeContextMenuItem = (item: ContextMenuItem): ContextMenuItemProp => {
  let temp = Object.assign({}, item);
  if (temp.label !== '---') {
    if (!temp.hasOwnProperty('id') && temp.label !== "---") {
      temp['id'] = generateQuickGuid();
    }
    if (!temp.hasOwnProperty('enabled')) temp['enabled'] = true;
    if (!temp.hasOwnProperty('checked')) temp['checked'] = false;
    if (!temp.hasOwnProperty('checkable')) temp['checkable'] = false;
    if (temp.menu && temp.menu.length)
      temp.menu = temp.menu.map((item: ContextMenuItem): ContextMenuItemProp => sanitizeContextMenuItem(item))
  }
  return temp as ContextMenuItemProp;
}

const findContextMenuItemById = (id: string, menu: ContextMenuItem[]): ContextMenuItem | undefined => {
  for (const item of menu) {
    if (item.id === id) return item;
    if (item.menu) {
      const foundInChildren = findContextMenuItemById(id, item.menu);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }
  return undefined;
}
const contextClickHandler = (id: string) => {
  if (props.debug) console.log(id)
  const target = findContextMenuItemById(id, menuExtended.value)
  if (target) {
    emit('click', target)
  }
  if (target && target.callback) {
    target.callback()
  } else if (target && target.checkable) {
    if (props.debug) {
      console.log("Toggling checked property on target:")
      console.log(target);
    }
    const mirror = JSON.parse(JSON.stringify(menuBaseSanitized.value))
    const sibling = findContextMenuItemById(id, mirror);
    if (sibling) {
      sibling.checked = !sibling?.checked;
      if (props.debug)
        console.log("Updating sibling to toggled value:", sibling.checked)
      menuBase.value = desanitizeMenuList(mirror, menuBase.value as ContextMenuItem[]);
    }
  } else if (props.debug) {
    console.log("Target not found")
  }
}

const hasContextMenu = computed(() => {
  return ((menuExtended as Ref<ContextMenu>).value ?? props.modelValue).length
})

const setContextMenu = (value?: ContextMenuProp | ContextMenu) => {
  if (props.debug) console.log("Setting context menu...")
  if (value && props.debug) console.log(JSON.stringify(value))
  else if (props.debug) console.log(JSON.stringify(menuExtended.value))
  try {
    window.__adobe_cep__.invokeAsync(
      "setContextMenuByJSON",
      JSON.stringify({
        menu: value || menuExtended.value
      }),
      contextClickHandler
    );
  } catch (err) {
    console.log(err)
  }
}

onMounted(() => {
  if (hasContextMenu.value && window.__adobe_cep__) {
    setContextMenu(menuExtended.value)
    watch(() => menuExtended.value, (newVal: ContextMenuProp | ContextMenu) => {
      console.log("Context menu change")
      setContextMenu(newVal)
    })
  }
})
</script>

<template />