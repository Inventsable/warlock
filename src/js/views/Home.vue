<script setup lang="ts">
import { onMounted, ref, computed, watch, onBeforeMount } from "vue";
import { useSettings } from '../stores/settings';
import { evalES, csi } from "../lib/utils/utils";
import type { Ref } from "vue";
import flyoutMenu from "../lib/Volt/flyout-menu.vue";
import contextMenu from '../lib/Volt/context-menu.vue'
import Button from "../lib/Volt/button.vue";
import swatchList from "../lib/components/swatch-list.vue";
import indicator from "../lib/components/indicator.vue";
import type { FlyoutMenuItem, FlyoutMenu, ContextMenuItem, ContextMenu } from '../lib/Volt/types'
import type { ContextMenuItemProp } from "../lib/Volt/types/props";
import checkbox from "../lib/Volt/checkbox.vue";
import { path } from "../lib/cep/node";
import { exists } from "../lib/utils/fs";

// @ts-ignore
import { AIEvent, AIEventAdapter } from '../main/BoltHostAdapter.js'
import { SystemPath } from "../lib/cep/csinterface";

const adapter = AIEventAdapter.getInstance();
const settings = useSettings()

const run = async (): Promise<void | null> => {
  // const diagnostic = JSON.parse(await evalES(`runDiagnostic()`));
}

const showIndicator = computed({
  get() {
    return settings.indicator.show;
  },
  set(value) {
    settings.indicator.show = value;
  }
})

const context = ref([
  {
    label: "Show indicator",
    checked: showIndicator.value,
    checkable: true,
    enabled: true,
    id: "showIndicator"
  },
  {
    label: "Delete AppData",
    callback: () => {
      settings.deleteSettings()
      console.log("Local settings deleted")
    }
  },
  {
    label: "Delete local storage",
    callback: () => {
      window.localStorage.removeItem("settings");
      console.log("Local storage deleted")
    }
  },
])

/**
 * Used to bypass update:modelValue failing to echo with computed getter
 */
const checkClick = (item: ContextMenuItem | ContextMenuItemProp) => {
  if (item.id && /indicator/i.test(item.id)) {
    showIndicator.value = !item.checked
  }
}

const checkForHostAdapterInFilepath = () => {
  const appFolder = csi.getSystemPath(SystemPath.HOST_APPLICATION);
  console.log(appFolder)
  if (navigator.platform.indexOf('Win') > -1) {
    const rootFolder = `${appFolder.replace(/(\\|\/)Support\sFiles.*/gm, "")}/Plug-ins/Extensions`
    const doesExist = exists(`${rootFolder}/AIHostAdapter.aip`)
    settings.adapter.online = doesExist;
    return doesExist
  } else {
    console.log("Mac")
  }
}

onBeforeMount(async () => {
  const adapterOnline = checkForHostAdapterInFilepath();
  // 
  // If the adapter is found to be present in file system
  if (adapterOnline) {
    // 
    // If the user toggles active fill/stroke, trigger
    if (settings.adapter.listenTo.fillStroke) {
      adapter.addEventListener(AIEvent.PAINT_STYLE_FILL_STROKE_CHANGED, async (e: any) => {
        settings.indicator.stroke.active = /false/i.test(await evalES(`checkFillStroke()`))
      });
    }
    // 
    // If the user clicks, changes selection, changes color, etc.
    // This will be the heaviest because it will be frequent and potentially scan entire document
    if (settings.adapter.listenTo.selection) {
      adapter.addEventListener(AIEvent.ART_SELECTION_CHANGED, async (e: any) => {
        console.log("Adapter selection changed:");
        console.log(e);
      });
    }
    // 
    // If user switches documents, warlock should repaint itself with the new document's palette
    // ALSO TRIGGERS SELECTION, in which case not really necessary
    if (settings.adapter.listenTo.documentChange) {
      adapter.addEventListener(AIEvent.DOCUMENT_CHANGED, async (e: any) => {
        console.log("Adapter document changed:");
        console.log(e);
      });
    }
    // adapter.addEventListener(AIEvent.ART_STYLE_FOCUS_CHANGED, async (e: any) => {
    //   console.log("Adapter focus changed:");
    //   console.log(e);
    // });

  }
})

onMounted(() => {
  console.log("Mounted")
})
</script>
<template>
  <flyoutMenu refresh />
  <contextMenu refresh v-model="context" @click="checkClick" />
  <div class="home-content">
    <indicator v-if="showIndicator" />
    <swatchList />
  </div>
</template>

<style>
:root {
  --color-warning: #FFEE00;
}

.home-content {}

.panel-content {
  margin: 6px 0px;
}

/* Slim */
@media screen and (max-width: 249px) {}
</style>