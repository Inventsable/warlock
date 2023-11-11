<script setup lang="ts">
import { csi } from "../../lib/utils/utils";
import { computed, onMounted, watch, nextTick } from "vue";
import type { Ref } from 'vue'
import type { FlyoutMenuItem, FlyoutMenu, FlyoutMenuItemProp, FlyoutMenuProp } from './types'

const emit = defineEmits<{
  click: [value: FlyoutMenuItem],
  open: [],
  close: [],
  'update:modelValue': [value: FlyoutMenu | Ref<FlyoutMenu>],
}>();

export interface Props {
  refresh?: boolean | Ref<boolean>,
  modelValue: FlyoutMenuItem[] | Ref<FlyoutMenuItem[]>,
}

const props = withDefaults(defineProps<Props>(), {
  refresh: false,
  modelValue: () => [
    {
      label: "Refresh panel",
      id: "refresh",
      callback: () => location.reload(),
      enabled: true,
      checked: false,
    } as FlyoutMenuItem<void>,
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

function generateRandomIDValue(length: number = 4): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
  return result;
}

const flyout = computed(() => {
  let prepend: FlyoutMenuItem[] = [];
  if ((props.refresh as Ref<boolean>).value ?? props.refresh) {
    prepend.push({ label: 'Refresh panel', callback: () => location.reload() })
    prepend.push({ label: '---' })
  }
  return [...prepend, ...(props.modelValue as FlyoutMenuItem[])];
})

const hasFlyoutMenu = computed(() => {
  return ((flyout as Ref<FlyoutMenu>).value ?? props.modelValue).length
})

const sanitizedFlyoutMenu = computed(() => {
  return ((flyout as Ref<FlyoutMenu>).value ?? props.modelValue).map((item: FlyoutMenuItem) => {
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

onMounted(() => {
  csi.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", (p: any) => {
    const item = sanitizedFlyoutMenu.value.find(i => i.id == p.data.menuId);
    if (item && item.callback) {
      emit('click', item)
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
  csi.addEventListener("com.adobe.csxs.events.flyoutMenuOpened", (p: any) => {
    emit("open");
  })
  csi.addEventListener("com.adobe.csxs.events.flyoutMenuClosed", (p: any) => {
    // I want a linear event chain like open > click > close instead of open > close > click,
    // so adding an arbitrary small delay to push close to the end should serve for most cases
    setTimeout(() => {
      nextTick(() => emit("close"))
    }, 5);
  })
  if (hasFlyoutMenu.value) {
    csi.setPanelFlyoutMenu(flyoutXML.value)
    watch(() => flyoutXML.value, (newVal) => {
      if (JSON.stringify(props.modelValue) !== (JSON.stringify(newVal))) {
        csi.setPanelFlyoutMenu(newVal)
      }
    })
  }
})

</script>

<template />