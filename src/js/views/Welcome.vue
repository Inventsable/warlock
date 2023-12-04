<script setup lang="ts">
import Drawer from '../lib/components/drawer.vue'
import discordIcon from '../lib/components/discord-icon.vue';
</script>

<template>
  <div class="settings-wrapper">
    <div class="alert-banner">
      <div class="alert-content">
        HELLO WORLD
      </div>
    </div>
    <div class="placeholder-lottie"></div>
    <discordIcon></discordIcon>
  </div>
</template>

<style>
.alert-banner {
  padding: 20px 10px;
  width: 100%;
  height: 24px;
  border: 2px solid #ffba00;
  margin-bottom: 6px;
  background-color: rgba(255, 187, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.alert-content {
  border: 2px solid red;
}

.placeholder-lottie {
  border: 2px solid red;
  width: 100%;
  height: 300px;
}

.settings-page-content {
  padding: 0px 16px;
  position: absolute;
  box-sizing: border-box;
  left: var(--drawer-width);
  height: 100%;
  top: 0px;
  width: calc(100% - var(--drawer-width));
  overflow-y: auto;
}
</style>