<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useSettings } from '../stores/settings';
import { evalES, csi } from "../lib/utils/utils";
import type { Ref } from "vue";
import flyoutMenu from "../lib/Volt/flyout-menu.vue";
import contextMenu from '../lib/Volt/context-menu.vue'
import Button from "../lib/Volt/button.vue";
import swatchList from "../lib/components/swatch-list.vue";
import indicator from "../lib/components/indicator.vue";
import type { FlyoutMenuItem, FlyoutMenu, ContextMenuItem, ContextMenu } from '../lib/Volt/types'
import checkbox from "../lib/Volt/checkbox.vue";

const settings = useSettings()

const run = async (): Promise<void | null> => {
  // const diagnostic = JSON.parse(await evalES(`runDiagnostic()`));
}

const context = [
  {
    label: "Delete AppData",
    callback: () => {
      settings.deleteSettings()
      console.log("Local settings deleted")
    }
  }
]

onMounted(() => {
  console.log("Mounted")
})

const isStrokeActive = computed({
  get() {
    return settings.indicator.stroke.active
  },
  set(val: boolean) {
    settings.indicator.stroke.active = val;
  }
})

</script>
<template>
  <checkbox label="stroke" v-model="isStrokeActive" />
  <flyoutMenu refresh />
  <contextMenu refresh v-model="context" />
  <div class="home-content">
    <indicator />
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