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

const documentScan = async () => {
  console.log("Scan document")
  const result = JSON.parse(await evalES(`deepScan('${JSON.stringify(settings.deepScanOptions)}')`));
  // console.log(result);
  const colors = result.colors.filter((v: ColorValue, i: number, a: ColorValue[]) => {
    return a.findIndex((el: ColorValue) => JSON.stringify(el) == JSON.stringify(v)) == i;
  }).filter((v: ColorValue) => v.typename && !/nocolor/i.test(v.typename))
  // console.log(colors);
  settings.setHardList(colors);
}

/**
 * Only trigger on a selection change as a shallow and lightweight look at selected objects
 */
const shallowScan = async () => {
  const result = JSON.parse(await evalES("shallowScan()"))
  // 
  // If no selection is present in app, trust the default values
  if (!result.hasSelection) {
    if (/rgb|cmyk|nocolor/i.test(result.appFill.typename)) {
      // Rewrite all fills to a single entry array with current value:
      settings.setHardFill(result.appFill);
    } else if (/gradient/i.test(result.appFill.typename)) {
      console.log("Warlock can't support gradient colors yet:")
      console.log(result.appFill)
      settings.setHardFill(result.appFill);

    } else {
      // Otherwise something went haywire and isn't accounted for:
      console.log("Something is up with fill:")
      console.log(result.appFill);
    }
    if (/rgb|cmyk|nocolor/i.test(result.appStroke.typename)) {
      // Rewrite all stroke to a single entry array with current value:
      settings.setHardStroke(result.appStroke)
    } else if (/gradient/i.test(result.appStroke.typename)) {
      console.log("Warlock can't support gradient colors yet:")
      console.log(result.appStroke)
    } else {
      // Otherwise something went haywire and isn't accounted for:
      console.log("Something is up with stroke:")
      console.log(result.appStroke);
    }
    // Check entire document for colors
    return await documentScan();
  } else if (result.hasSelection) {
    settings.selection.length = result.selectionLength;
    // The needle>haystack logic isn't perfect in JSX via NoColors, which create duplicates.
    // Filter out duplicate entries here via filter instead of Set, to retain Array form:
    const fills = result.fills.filter((v: ColorValue, i: number, a: ColorValue[]) => {
      return a.findIndex((el: ColorValue) => JSON.stringify(el) == JSON.stringify(v)) == i;
    })
    const strokes = result.strokes.filter((v: ColorValue, i: number, a: ColorValue[]) => {
      return a.findIndex((el: ColorValue) => JSON.stringify(el) == JSON.stringify(v)) == i;
    })
    // Then just set our values directly:
    settings.indicator.fill.colors = fills;
    settings.indicator.stroke.colors = strokes;

    console.log(settings.indicator.fill.colors);
  } else {
    // In theory this should never be triggered unless the script returns without a hasSelection property
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

const syncToAppIndicator = async (): Promise<void> => {
  settings.indicator.stroke.active = /false/i.test(await evalES(`checkFillStroke()`))
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
        await syncToAppIndicator();
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

onMounted(async () => {
  console.log("Sync to indicator")
  await syncToAppIndicator();
  await shallowScan();
  console.log("Mounted")
  // For testing
  // const result = JSON.parse(await evalES(`getActiveFillColor()`))
  // console.log(result);

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

.home-content {
  overflow-y: hidden;
}

.panel-content {
  margin: 6px 0px;
}

/* Slim */
@media screen and (max-width: 249px) {}
</style>