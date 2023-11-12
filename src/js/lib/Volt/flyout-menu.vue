<script setup lang="ts">
/**
 * Should prop types be moved to the types declarations?
 */

import { computed, onMounted, watch, nextTick } from "vue";
import type { Ref } from 'vue'
import type { FlyoutMenuItem, FlyoutMenu } from './types'
import type { FlyoutMenuItemProp, FlyoutMenuProp } from './types/props'
import { generateQuickGuid } from "./mixins";

const emit = defineEmits<{
  click: [value: FlyoutMenuItem],
  open: [],
  close: [],
  // update:modelValue not currently used since flyout menus don't have checked toggle properties:
  'update:modelValue': [value: FlyoutMenu | Ref<FlyoutMenu>],
}>();

export interface Props {
  refresh?: boolean | Ref<boolean>,
  modelValue?: FlyoutMenuItem[] | Ref<FlyoutMenuItem[]>,
}

const props = withDefaults(defineProps<Props>(), {
  refresh: false,
  modelValue: () => [
    //   {
    //     label: "Refresh panel",
    //     id: "refresh",
    //     callback: () => location.reload(),
    //     enabled: true,
    //     checked: false,
    //   } as FlyoutMenuItem<void>,
  ] as FlyoutMenuItem[]
})

// const value = computed<FlyoutMenuItem[] | Ref<FlyoutMenuItem[]>>({
//   get(): FlyoutMenuItem[] | Ref<FlyoutMenuItem[]> {
//     return props.modelValue as FlyoutMenuItem[] | Ref<FlyoutMenuItem[]>;
//   },
//   set(val: FlyoutMenuItem[] | Ref<FlyoutMenuItem[]>): void {
//     emit("update:modelValue", val);
//   }
// });

// In the case where we want quick, standard menu items via prop callouts, append them as extra entries to our menu:
const flyout = computed(() => {
  let prepend: FlyoutMenuItem[] = [];
  if ((props.refresh as Ref<boolean>).value ?? props.refresh) {
    prepend.push({ label: 'Refresh panel', callback: () => location.reload() })
    if ((props.modelValue as FlyoutMenu)?.length || (props.modelValue as Ref<FlyoutMenu>)?.value?.length)
      prepend.push({ label: '---' })
  }
  return [...prepend, ...(props.modelValue as FlyoutMenuItem[])];
})

// Used to determine whether a flyout should be set to begin with
const hasFlyoutMenu = computed(() => {
  return ((flyout as Ref<FlyoutMenu>).value ?? props.modelValue).length
})

// This is likely unnecessary but conforming data to have defaults like generated ids will be useful
// for the component to more easily search and match by uuid
const sanitizedFlyoutMenu = computed(() => {
  return ((flyout as Ref<FlyoutMenu>).value ?? props.modelValue).map((item: FlyoutMenuItem) => {
    let temp = Object.assign({}, item);
    if (temp.label !== '---') {
      if (!temp.hasOwnProperty('id')) {
        temp['id'] = generateQuickGuid();
      }
      if (!temp.hasOwnProperty('enabled')) temp['enabled'] = true;
      if (!temp.hasOwnProperty('checked')) temp['checked'] = false;
      if (!temp.hasOwnProperty('checkable')) temp['checkable'] = false;
    }
    return temp as FlyoutMenuItemProp;
  }) as FlyoutMenuProp
})

// Computed property to convert our current flyout menu into XML to send to Adobe, since flyout menus only support XML
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

onMounted(() => {
  window.__adobe_cep__.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", (p: any) => {
    // This event only returns a label and id, so we need to comb through our menu to find a match
    const item = sanitizedFlyoutMenu.value.find(i => i.id == p.data.menuId);
    if (item) {
      // First we emit the click event with our match
      emit('click', item)
    }
    if (item && item.callback) {
      // And invoke it's callback if it contains one
      item?.callback();
    } else {
      /**
       * HMR causes redundant events firing with previous generated ids used for lookup,
       * causing an issue where exponential-logging can occur. Ignoring it should be fine
       */
      // console.log("ITEM NOT FOUND:", p.data.menuId)
      // console.log(sanitizedFlyoutMenu.value)
    }
  })
  window.__adobe_cep__.addEventListener("com.adobe.csxs.events.flyoutMenuOpened", (p: any) => {
    emit("open");
  })
  window.__adobe_cep__.addEventListener("com.adobe.csxs.events.flyoutMenuClosed", (p: any) => {
    // I want a linear event chain like open > click > close instead of open > close > click,
    // so adding an arbitrary small delay to push close to the end should serve for most cases
    setTimeout(() => {
      nextTick(() => emit("close"))
    }, 5);
  })
  // If there is a flyout menu
  if (hasFlyoutMenu.value) {
    // Set it immediately on mount
    window.__adobe_cep__.invokeSync("setPanelFlyoutMenu", flyoutXML.value)
    // Then watch for any change to it's value
    watch(() => flyoutXML.value, (newVal) => {
      // And if it isn't identical to what it was before
      if (JSON.stringify(props.modelValue) !== (JSON.stringify(newVal))) {
        // Set the value again
        window.__adobe_cep__.setPanelFlyoutMenu(newVal)
      }
    })
  }
})

</script>

<template />