<script setup lang="ts">
import { onMounted, ref, computed, watch, Ref } from "vue";
import { useSettings } from '../stores/settings';
import { evalES, csi } from "../lib/utils/utils";

import Preview from '../lib/components/preview.vue'
import Toolbar from '../lib/components/groups/toolbar.vue'
import ToolbarButton from '../lib/components/toolbar-button.vue'
import Table from '../lib/components/groups/table.vue'
import Options from '../lib/components/groups/options.vue'
const settings = useSettings()
//
//
const run = async (): Promise<void | null> => {
  // const diagnostic = JSON.parse(await evalES(`runDiagnostic()`));
}

const menuOpts = [
  {
    label: "Refresh panel",
    id: "refresh",
    callback: () => location.reload(),
    enabled: true,
    checked: false,
  },
  {
    label: "Reset data",
    id: "resetStore",
    callback: () => settings.softReset(),
    enabled: true,
    checked: false,
  },
  {
    label: "More cool stuff",
    id: "seeMore",
    callback: () => {
      console.log("OPEN LINK TO SITE")
    },
    enabled: true,
    checked: false,
  },
]

interface MenuItem {
  enabled?: boolean
  checked?: boolean
  callback: () => any
  id?: string
  label: string
}
type Menu = MenuItem[];

csi.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", (p: any) => {
  const item = menuOpts.find(i => i.id == p.data.menuId);
  item?.callback();
})

const flyoutXML = `
<Menu>
  <MenuItem Id="refresh" Label="Refresh panel" Enabled="true" Checked="false"/>
  <MenuItem Label="---" />
  <MenuItem Id="seeMore" Label="More cool stuff" Enabled="true" Checked="false"/>
  <MenuItem Id="resetStore" Label="Reset data" Enabled="true" Checked="false"/>
</Menu>
`
csi.setPanelFlyoutMenu(flyoutXML)

onMounted(() => {
  console.log("Mounted")
})

</script>
<template>
  <div class="home-content">
    HELLO WORLD
  </div>
</template>

<style>
:root {
  --color-warning: #FFEE00;
}

/* Slim */
@media screen and (max-width: 249px) {}
</style>