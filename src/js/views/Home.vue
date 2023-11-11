<script setup lang="ts">
import { onMounted, ref, computed, watch, Ref } from "vue";
import { useSettings } from '../stores/settings';
import { evalES, csi } from "../lib/utils/utils";
import Menus from '../lib/Volt/menus.vue'
import Button from "../lib/Volt/button.vue";
import type { FlyoutMenuItem } from '../lib/Volt/types/index.ts'

const settings = useSettings()
//
//
const run = async (): Promise<void | null> => {
  // const diagnostic = JSON.parse(await evalES(`runDiagnostic()`));
}

const flyoutMenu = ref([
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
  },
])

// csi.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", (p: any) => {
//   const item = menuOpts.find(i => i.id == p.data.menuId);
//   item?.callback();
// })
// const flyoutXML = `
// <Menu>
//   <MenuItem Id="refresh" Label="Refresh panel" Enabled="true" Checked="false"/>
//   <MenuItem Label="---" />
//   <MenuItem Id="seeMore" Label="More cool stuff" Enabled="true" Checked="false"/>
//   <MenuItem Id="resetStore" Label="Reset data" Enabled="true" Checked="false"/>
// </Menu>
// `
// csi.setPanelFlyoutMenu(flyoutXML)

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
  flyoutMenu.value.push({
    label: generateRandomIDValue(6),
    callback: () => console.log("TESTING")
  } as FlyoutMenuItem)

  console.log("TEST")
  console.log(flyoutMenu.value)
}

</script>
<template>
  <Menus :flyout="flyoutMenu" />
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