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
import type { ColorValue } from "../../shared/shared";

// @ts-ignore
import { AIEvent, AIEventAdapter } from '../main/BoltHostAdapter.js'
import { SystemPath } from "../lib/cep/csinterface";
import { appThemeChanged } from "../lib/utils/theme-manager";

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

const shallowScan = async () => {
  const result = JSON.parse(await evalES("shallowScan()"))
  // 
  // If no selection is present in app, trust the default values
  if (!result.hasSelection) {
    console.log("No selected objects present")
    settings.indicator.fill.multi = false;
    settings.indicator.stroke.multi = false;
    if (/rgb|cmyk/i.test(result.appFill.typename)) {
      settings.indicator.fill.color = result.appFill;
    } else {
      console.log("Something is up with fill:")
      console.log(result.appFill);
    }
    if (/rgb|cmyk/i.test(result.appStroke.typename)) {
      settings.indicator.stroke.color = result.appStroke;
    } else {
      console.log("Something is up with stroke:")
      console.log(result.appStroke);
    }
    return null;
  } else if (result.hasSelection) {
    // 
    console.log(result)
    const fills = result.fills.filter((v: ColorValue, i: number, a: ColorValue[]) => {
      return a.findIndex((el: ColorValue) => JSON.stringify(el) == JSON.stringify(v)) == i;
    })
    const strokes = result.strokes.filter((v: ColorValue, i: number, a: ColorValue[]) => {
      return a.findIndex((el: ColorValue) => JSON.stringify(el) == JSON.stringify(v)) == i;
    })
    if (fills.length == 1) {
      settings.indicator.fill.multi = false;
      if (fills.typename !== 'NoColor') {
        settings.indicator.fill.color = fills[0];
      } else {
        settings.indicator.fill.empty = true;
      }
    } else {
      settings.indicator.fill.empty = false;
      settings.indicator.fill.multi = true;
    }
    if (strokes.length == 1) {
      settings.indicator.stroke.multi = false;
      if (strokes.typename !== 'NoColor') {
        settings.indicator.stroke.color = strokes[0];
      } else {
        settings.indicator.stroke.empty = true;
      }
    } else {
      settings.indicator.stroke.empty = false;
      settings.indicator.stroke.multi = true;
    }
  } else {
    console.log("Something went wrong, script returned faulty data")
  }
  // 
}

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
  const isWin = (navigator.platform.indexOf('Win') > -1);
  const rootFolder = isWin ? `${appFolder.replace(/(\\|\/)Support\sFiles.*/gm, "")}/Plug-ins/Extensions` : `${appFolder.replace(/(\\|\/)Adobe\sIllustrator.app.*/gm, "")}/Plug-ins.localized`;
  const doesExist = exists(`${rootFolder}/AIHostAdapter.aip`);
  settings.adapter.online = doesExist;
  return doesExist;
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
        await shallowScan();
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