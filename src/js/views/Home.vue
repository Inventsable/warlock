<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useSettings } from '../stores/settings';
import { evalES, csi } from "../lib/utils/utils";
import type { Ref } from "vue";
import Menus from '../lib/Volt/menus.vue'
import flyoutMenu from "../lib/Volt/flyout-menu.vue";
import Button from "../lib/Volt/button.vue";
import type { FlyoutMenuItem, FlyoutMenu, ContextMenuItem, ContextMenu } from '../lib/Volt/types'

const settings = useSettings()
//
//
const run = async (): Promise<void | null> => {
  // const diagnostic = JSON.parse(await evalES(`runDiagnostic()`));
}

const flyoutContent = ref([
  {
    label: "Refresh panel",
    id: "refresh",
    callback: () => location.reload(),
    enabled: true,
    checked: false,
  },
  {
    label: "More cool stuff",
    callback: () => {
      console.log("OPEN LINK TO SITE")
    },
    enabled: true,
    checked: false,
    checkable: true,
  },
]) as Ref<FlyoutMenuItem[]>

const contextMenu = ref([
  {
    label: "More cool stuff",
    callback: () => {
      console.log("OPEN LINK TO SITE")
    },
    enabled: true,
    checkable: false,
    id: "test",
    checked: false,
  },
  {
    label: "Test",
    callback: () => {
      console.log("OPEN LINK TO SITE")
    },
    enabled: true,
    checkable: false,
    checked: false,
    menu: [
      {
        label: "Test 1",
        checkable: true,
        checked: false,
      },
      {
        label: "test 2",
        menu: [
          {
            label: "Hello world"
          }
        ]
      }
    ]
  },
]) as Ref<ContextMenuItem[]>

const findMenuItemById = (id: string, menu: ContextMenuItem[]): ContextMenuItem | undefined => {
  for (const item of menu) {
    if (item.id === id) return item;
    if (item.menu) {
      const foundInChildren = findMenuItemById(id, item.menu);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }
  return undefined;
}

const toggleMenuItemCheckedById = (id: string | undefined, menu: ContextMenuItem[]): boolean | null => {
  const target = findMenuItemById(id || "", menu);
  if (target) {
    target.checked = !target?.checked;
    return target.checked
  } else return null;
}

onMounted(() => {
  console.log("Mounted")
})

function generateRandomIDValue(length: number = 4): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
  return result;
}

const randomizeMenu = () => {
  contextMenu.value.push({
    label: generateRandomIDValue(6),
    id: generateRandomIDValue(6),
    checkable: false,
    checked: false,
    enabled: true,
  } as FlyoutMenuItem)
  console.log("TEST")
  console.log(contextMenu.value)
}

const reportUpdate = (item: ContextMenuItem, state: boolean) => {
  console.log(item, state, item.checked !== state)
  toggleMenuItemCheckedById(item.id, contextMenu.value)
}

const flyoutClicked = (evt: any): void => {
  console.log("CLICKED:", evt)
}
const flyoutOpened = (): void => {
  console.log("OPENED")
}
const flyoutClosed = (): void => {
  console.log("CLOSED")
}
</script>
<template>
  <flyoutMenu v-model="flyoutContent" @click="flyoutClicked" @close="flyoutClosed" @open="flyoutOpened" />
  <!-- <Menus :flyout="flyoutContent" :context="contextMenu" @context-check-update="reportUpdate" /> -->
  <div class="home-content">
    HELLO WORLD
    <Button label="Test" @click="randomizeMenu" />
  </div>
</template>

<style>
:root {
  --color-warning: #FFEE00;
}

/* Slim */
@media screen and (max-width: 249px) {}
</style>