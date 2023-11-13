<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useSettings } from "../stores/settings";
import "../index.scss";

const settings = useSettings();

function refresh() {
  location.reload()
}

</script>

<template>
  <div class="panel-content">
    <router-view />
    <div class="version-toolbar">
      0.0.1
    </div>
  </div>
</template>

<style>
:root {
  --version-height: 20px;
  --extra-padding: 20px;
}

.panel-content {
  box-sizing: border-box;
  margin: 6px;
  height: calc(100vh - 12px)
}

.version-toolbar {
  user-select: none;
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 100vw;
  box-sizing: border-box;
  letter-spacing: 0.25ch;
  background-color: var(--color-header);
  color: var(--color-checkbox-disabled);
  max-height: var(--version-height);
  font-size: 9px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 4px;
}


/* Slim */
@media screen and (max-width: 160px) {
  .panel-content {
    overflow-y: hidden;
    /* height: calc(100vh - 72px); */
    /* margin: 70px 0px 0px 0px; */
  }

  .panel,
  .panel-content,
  .home-content {
    overflow-x: hidden;
  }
}

/* Toolbar */
@media screen and (max-width: 90px) {
  .panel-content {
    /* margin: 70px 0px 0px 0px;
    height: calc(100vh - 72px); */
  }
}
</style>