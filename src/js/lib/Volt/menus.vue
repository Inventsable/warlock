<script setup lang="ts">
import { csi } from "../../lib/utils/utils";
import { computed, onMounted, watch } from "vue";
import type { Ref } from 'vue'
import type { ContextMenuItem, ContextMenu, FlyoutMenuItem, FlyoutMenu, FlyoutMenuItemProp } from './types'

const emit = defineEmits<{
  (e: "click"): void;
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
    if (!temp.hasOwnProperty('id')) {
      temp['id'] = generateRandomIDValue();
    }
    return temp as FlyoutMenuItemProp;
  }) as FlyoutMenu
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

onMounted(() => {
  if (hasFlyoutMenu.value) csi.setPanelFlyoutMenu(flyoutXML.value);
})
</script>