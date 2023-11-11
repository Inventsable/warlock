<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useSettings } from '../stores/settings';
import { evalES, csi } from "../lib/utils/utils";
import type { Ref } from "vue";
import flyoutMenu from "../lib/Volt/flyout-menu.vue";
import contextMenu from '../lib/Volt/context-menu.vue'
import Button from "../lib/Volt/button.vue";
import type { FlyoutMenuItem, FlyoutMenu, ContextMenuItem, ContextMenu } from '../lib/Volt/types'

const settings = useSettings()

const run = async (): Promise<void | null> => {
  // const diagnostic = JSON.parse(await evalES(`runDiagnostic()`));
}

onMounted(() => {
  console.log("Mounted")
})

</script>
<template>
  <flyoutMenu refresh />
  <contextMenu refresh />
  <div class="home-content">
    HELLO WORLD
    <Button label="Test" />
  </div>
</template>

<style>
:root {
  --color-warning: #FFEE00;
}

/* Slim */
@media screen and (max-width: 249px) {}
</style>