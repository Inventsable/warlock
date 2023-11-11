<script setup lang="ts">

/**
 * This file is deprecated, use context-menu and flyout-menu standalone components instead.
 * 
 * There is no easy way to sync update from child > parent in Vue 3, so it's best
 * to just rely on v-model and update:modelValue within standalone components to keep
 * all values fully synced between parent and child (for things like checked properties)
 */

import { csi } from "../../lib/utils/utils";
import { computed, onMounted, watch } from "vue";
import type { Ref } from 'vue'
import type { ContextMenuItem, ContextMenu, FlyoutMenuItem, FlyoutMenu } from './types'
import type { ContextMenuItemProp, ContextMenuProp, FlyoutMenuItemProp, FlyoutMenuProp } from './types/props'

const emit = defineEmits<{
  flyoutClick: [value: FlyoutMenuItem],
  flyoutOpen: [],
  flyoutClose: [],
  contextClick: [value: ContextMenuItem],
  contextOpen: [],
  contextClose: [],
  contextCheckUpdate: [value: ContextMenuItem, state: boolean]
}>();

export interface Props {
  refresh?: boolean | Ref<boolean>,
  debug?: boolean | Ref<boolean>,
  context?: ContextMenuItem[] | Ref<ContextMenuItem[]>,
  flyout?: FlyoutMenuItem[] | Ref<FlyoutMenuItem[]>
}

const props = withDefaults(defineProps<Props>(), {
  refresh: false,
  debug: false,
  context: () => [
    {
      label: 'Refresh panel',
      callback: () => location.reload()
    } as ContextMenuItem<void>
  ] as ContextMenuItem[],
  flyout: () => [
    {
      label: "Refresh panel",
      id: "refresh",
      callback: () => location.reload(),
      enabled: true,
      checked: false,
    } as FlyoutMenuItem<void>,
    {
      label: "More cool stuff",
      id: "seeMore",
      callback: () => {
        console.log("OPEN LINK TO SITE")
      },
      enabled: true,
      checked: false,
    } as FlyoutMenuItem<any>,
  ] as FlyoutMenuItem[]
})

function generateRandomIDValue(length: number = 4): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
  return result;
}

/**
 * 
 * FLYOUT
 * 
 */
const flyout = computed(() => {
  let append: FlyoutMenuItem[] = [];
  if ((props.refresh as Ref<boolean>).value ?? props.refresh) {
    append.push({ label: '---' })
    append.push({ label: 'Refresh panel', callback: () => location.reload() })
  }
  return [...(props.flyout as FlyoutMenuItem[]), ...append];
})

const hasFlyoutMenu = computed(() => {
  return ((flyout as Ref<FlyoutMenu>).value ?? props.flyout).length
})

const sanitizedFlyoutMenu = computed(() => {
  return ((flyout as Ref<FlyoutMenu>).value ?? props.flyout).map((item: FlyoutMenuItem) => {
    let temp = Object.assign({}, item);
    if (temp.label !== '---') {
      if (!temp.hasOwnProperty('id')) {
        temp['id'] = generateRandomIDValue();
      }
      if (!temp.hasOwnProperty('enabled')) temp['enabled'] = true;
      if (!temp.hasOwnProperty('checked')) temp['checked'] = false;
      if (!temp.hasOwnProperty('checkable')) temp['checkable'] = false;
    }
    return temp as FlyoutMenuItemProp;
  }) as FlyoutMenuProp
})

const flyoutXML = computed(() => {
  const stringifiedValue = (obj: FlyoutMenuItemProp) => {
    let temp = ""
    const validKeys = Object.keys(obj).filter((key: string) => !['callback'].includes(key));
    validKeys.forEach((key: string, index) => {
      temp += `${key.charAt(0).toUpperCase()}${key.slice(1)}="${obj[key as keyof FlyoutMenuItemProp]}"${index < validKeys.length - 1 ? " " : ""}`
    })
    return temp;
  }
  return `<Menu>\n\t${sanitizedFlyoutMenu.value.map((item: FlyoutMenuItemProp) => `<MenuItem ${stringifiedValue(item)} />`).join(`\n\t`)}\n</Menu>`
})

csi.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", (p: any) => {
  const item = sanitizedFlyoutMenu.value.find(i => i.id == p.data.menuId);
  if (item && item.callback) {
    emit('flyoutClick', item)
    item?.callback();
  } else {
    console.log("ITEM NOT FOUND:", p.data.menuId)
  }

})
if (hasFlyoutMenu.value) {
  watch(() => flyoutXML.value, (newVal) => {
    csi.setPanelFlyoutMenu(newVal)
  })
}

/**
 * 
 * CONTEXT
 * 
 */

const contextBase = computed(() => {
  let prepend: ContextMenuItem[] = [];
  if ((props.refresh as Ref<boolean>).value ?? props.refresh) {
    prepend.push({ label: 'Refresh panel', callback: () => location.reload() })
    // prepend.push({ label: '---' })
  }
  return [...prepend, ...(props.context as ContextMenuItem[])];
})

const hasContextMenu = computed(() => {
  return ((contextBase as Ref<ContextMenu>).value ?? props.context).length
})

const sanitizeContextMenuItem = (item: ContextMenuItem): ContextMenuItemProp => {
  let temp = Object.assign({}, item);
  if (temp.label !== '---') {
    if (!temp.hasOwnProperty('id') && temp.label !== "---") {
      temp['id'] = generateRandomIDValue();
    }
    if (!temp.hasOwnProperty('enabled')) temp['enabled'] = true;
    if (!temp.hasOwnProperty('checked')) temp['checked'] = false;
    if (!temp.hasOwnProperty('checkable')) temp['checkable'] = false;
    if (temp.menu && temp.menu.length)
      temp.menu = temp.menu.map((item: ContextMenuItem): ContextMenuItemProp => sanitizeContextMenuItem(item))
  }
  return temp as ContextMenuItemProp;
}

const sanitizedContextMenu = computed(() => {
  return ((contextBase as Ref<ContextMenu>).value ?? props.context).map((item: ContextMenuItem) => sanitizeContextMenuItem(item)) as ContextMenuProp
})

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
  console.log(id)
  const target = findContextMenuItemById(id, sanitizedContextMenu.value)
  if (target && target.callback) {
    target.callback()
  } else if (target && target.checkable) {
    emit("contextCheckUpdate", (target as ContextMenuItemProp), !target.checked || false)
  } else {
    console.log("Target not found")
  }
}

const setContextMenu = (value?: ContextMenuProp) => {
  console.log("Setting context menu...")
  if (value) console.log(JSON.stringify(value))
  else console.log(JSON.stringify(sanitizedContextMenu.value))
  try {
    window.__adobe_cep__.invokeAsync(
      "setContextMenuByJSON",
      JSON.stringify({
        menu: value || sanitizedContextMenu.value
      }),
      contextClickHandler
    );
  } catch (err) {
    console.log(err)
  }
}

if (hasContextMenu.value) {
  watch(() => sanitizedContextMenu.value, (newVal: ContextMenuProp) => {
    setContextMenu(newVal)
  })
}

onMounted(() => {
  if (hasFlyoutMenu.value && window.__adobe_cep__) {
    csi.setPanelFlyoutMenu(flyoutXML.value);
    csi.addEventListener("com.adobe.csxs.events.flyoutMenuOpened", () => emit("flyoutOpen"))
    csi.addEventListener("com.adobe.csxs.events.flyoutMenuClosed", () => emit("flyoutClose"))
  }
  if (hasContextMenu.value && window.__adobe_cep__) {
    setContextMenu(sanitizedContextMenu.value)
  }
  else {
    console.log("No context menu?")
  }
})
</script>

<template />