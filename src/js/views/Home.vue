<script setup lang="ts">
import { onMounted, ref, computed, watch, onBeforeMount, nextTick } from "vue";
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

// @ts-ignore - These don't have explicit types since the file is from Adobe
import { AIEvent, AIEventAdapter } from '../main/BoltHostAdapter.js'
import { SystemPath } from "../lib/cep/csinterface";
import { appThemeChanged } from "../lib/utils/theme-manager";

const selectionWorker = new Worker(new URL('../worker/colorSelectionFilter.js', import.meta.url))
const docWorker = new Worker(new URL('../worker/documentScanMerger.js', import.meta.url))

const adapter = AIEventAdapter.getInstance();
const settings = useSettings()

const showIndicator = computed({
  get() {
    return settings.indicator.show;
  },
  set(value) {
    settings.indicator.show = value;
  }
})

/** DOCUMENT SCANNING */
type ColorData = {
  [key: string]: number | string;
  typename: string;
};

type InputItem = {
  data: ColorData;
  type: string;
};

type ResultItem = {
  color: ColorData;
  types: string[];
  count: number;
  index: number;
};

const documentScan = async () => {
  // console.log("Scan document")
  const result = JSON.parse(await evalES(`deepScan('${JSON.stringify(settings.deepScanOptions)}')`));

  if (window.Worker) {
    const timeStart = Date.now();
    // Pass fills and strokes from JSX into a ./worker/worker.js:
    const payload = JSON.stringify(result);
    docWorker.postMessage(payload);

    docWorker.onmessage = (response: any) => {
      const parsedResult = JSON.parse(response.data as string)
      if (parsedResult.error) {
        // Something went wrong
        console.error(parsedResult.error)
      } else {
        const timeTotal = `${(parsedResult.timeEnd - timeStart)}ms`;
        console.log(`DEEP SCAN @${timeTotal}:`, parsedResult.list)
        settings.setHardList(parsedResult.list);
      }
    };
  } else {
    // In theory this should never be triggered unless some false-positive triggers on webworker availability
    console.error("No webworker is available in this environment")
  }
  // const finalList: ResultItem[] = result.colors.reduce(mergeColorsReducer, []);
  // console.log(finalList);
  // const colors = result.colors.filter((v: ColorValue, i: number, a: ColorValue[]) => {
  //   return a.findIndex((el: ColorValue) => JSON.stringify(el) == JSON.stringify(v)) == i;
  // }).filter((v: ColorValue) => v.typename && !/nocolor/i.test(v.typename))
  // // console.log(colors);
  // settings.setHardList(colors);
}

/** SELECTION SCANNING */

const syncToAppIndicator = async (): Promise<void> => {
  settings.indicator.stroke.active = /false/i.test(await evalES(`checkFillStroke()`))
}
/**
 * Only trigger on a selection change as a shallow and lightweight look at selected objects
 */
const shallowScan = async () => {
  const result = JSON.parse(await evalES("shallowScan()"));
  // 
  // If no selection is present in app, trust the default values
  if (!result.hasSelection) {
    // If an RGB, CMYK, or NoColor type on fill then assign
    if (/rgb|cmyk|nocolor/i.test(result.appFill.typename)) {
      // Rewrite all fills to a single entry array with current value:
      settings.setHardFill(result.appFill);
    } else if (/gradient/i.test(result.appFill.typename)) {
      // Otherwise if a gradient, just complain for now
      console.log("Warlock can't support gradient colors yet:")
      console.log(result.appFill)
      settings.setHardFill(result.appFill);
    } else {
      // Otherwise something went haywire and isn't accounted for:
      console.log("Something is up with fill:")
      console.log(result.appFill);
    }
    // If an RGB, CMYK, or NoColor type on stroke then assign
    if (/rgb|cmyk|nocolor/i.test(result.appStroke.typename)) {
      // Rewrite all stroke to a single entry array with current value:
      settings.setHardStroke(result.appStroke)
    } else if (/gradient/i.test(result.appStroke.typename)) {
      // Otherwise if a gradient, just complain for now
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

    if (window.Worker) {
      const timeStart = Date.now();
      // Pass fills and strokes from JSX into a ./worker/worker.js:
      const payload = JSON.stringify(result);
      selectionWorker.postMessage(payload);

      // The worker's own postMessage() function will trigger our onmessage handler here:
      selectionWorker.onmessage = (response:any) => {
        const parsedResult = JSON.parse(response.data as string)
        if (parsedResult.error) {
          // Something went wrong
          console.error(parsedResult.error)
        } else {
          // Then just set our values directly:
          settings.indicator.fill.colors = parsedResult.fills;
          settings.indicator.stroke.colors = parsedResult.strokes;
          const timeTotal = `${(parsedResult.timeEnd - timeStart)}ms`;
          console.log(`WEB WORKER RESULT @${timeTotal}:`, parsedResult)
        }
      };
    } else {
      // In theory this should never be triggered unless some false-positive triggers on webworker availability
      console.error("No webworker is available in this environment")
    }
  } else {
    // In theory this should never be triggered unless the script returns without a hasSelection property
    console.log("Something went wrong, script returned faulty data")
  }
}

function forcePopup() {
  function openPopup() {
    csi.requestOpenExtension("com.warlock.cep.settings", "")
  }
  openPopup()
  setTimeout(() => {
    openPopup();
  }, 1000);
}


/** CONTEXT / FLYOUT MENUS */

const buildContextMenu = () => {
  return [
    {
      label: "Show indicator",
      checked: showIndicator.value,
      checkable: true,
      enabled: true,
      id: "showIndicator"
    },
    {
      label: "Show help",
      enabled: true,
      id: "showHelp",
      callback: () => {
        console.log("Popup?")
        forcePopup()
      }
    },
    {
      label: 'Filters',
      menu: [
        {
          label: 'Actives always on top',
          checkable: true,
          checked: settings.filters.indicatorsOnTop,
          callback: () => {
            settings.filters.indicatorsOnTop = !settings.filters.indicatorsOnTop;
          }
        },
        {
          label: '---'
        },
        {
          label: 'Sort by hue',
          checkable: true,
          checked: settings.filters.byHue,
          callback: () => {
            settings.toggleSortByHue(!settings.filters.byHue);
          }
        },
        {
          label: 'Sort by saturation',
          checkable: true,
          checked: settings.filters.bySaturation,
          callback: () => {
            settings.toggleSortBySaturation(!settings.filters.bySaturation);
          }
        },
        {
          label: 'Sort by frequency',
          checkable: true,
          checked: settings.filters.byFrequency,
          callback: () => {
            settings.toggleSortByFrequency(!settings.filters.byFrequency);
          }
        }
      ]
    },
    {
      label: '---'
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
  ] as ContextMenuItem[]
}

const contextMenuRef = ref(buildContextMenu());

/**
 * Used to bypass update:modelValue failing to echo with computed getter
 */
const checkClick = (item: ContextMenuItem | ContextMenuItemProp) => {
  if (item.id && /indicator/i.test(item.id)) {
    showIndicator.value = !item.checked
  } else {
    // This is stupid, but I can't get it to react to my Pinia state otherwise
    contextMenuRef.value = [];
    // So clear the value completely
    nextTick(() => {
      // And on nextTick, repopulate the menu with updated values to force a redraw
      contextMenuRef.value = buildContextMenu();
    })
  }


}

/** MISC */

const checkForHostAdapterInFilepath = () => {
  const appFolder = csi.getSystemPath(SystemPath.HOST_APPLICATION);
  const isWin = (navigator.platform.indexOf('Win') > -1);
  const rootFolder = isWin ? `${appFolder.replace(/(\\|\/)Support\sFiles.*/gm, "")}/Plug-ins/Extensions` : `${appFolder.replace(/(\\|\/)Adobe\sIllustrator.app.*/gm, "")}/Plug-ins.localized`;
  const doesExist = exists(`${rootFolder}/AIHostAdapter.aip`);
  settings.adapter.online = doesExist;
  return doesExist;
}

/** LIFECYCLE HOOKS */

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
  } else {
    console.error("HOST ADAPTER NOT ONLINE")
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
  <contextMenu refresh v-model="contextMenuRef" @click="checkClick" />
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