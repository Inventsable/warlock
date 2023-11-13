<script setup lang="ts">
import { useSettings } from '../../stores/settings';
import { ref, StyleValue } from 'vue';
import type { ColorValue, gradientColor } from '../../../shared/shared';
import type { swatch } from '../../stores/types'
import { getVerbosePackage } from '../utils/app';
const settings = useSettings();

interface swatchUI extends swatch {
  hover: boolean;
  active: boolean;
}

const UIList = ref(settings.activeList.swatches.map((swatch: swatch, index: number): swatchUI => {
  let temp = Object.assign({}, swatch) as swatchUI;
  temp['hover'] = false;
  temp['active'] = index ? false : true;
  return temp;
}))

const getGradientStyle = (color: gradientColor) => {
  // console.log(color)
  const angle = (color.angle + 90)
  let str = `background-color: ${color.gradient.type.linear ? 'linear-gradient(' : 'radial-gradient('}`
  str += `${angle}deg,`
  for (let i = 0; i < color.gradient.gradientStops.length; i++) {
    const gStop = color.gradient.gradientStops[i];
    const gRGB = getVerbosePackage(gStop.color).RGB;
    const doesContinue = i < color.gradient.gradientStops.length - 1;
    str += ` rgba(${gRGB.red}, ${gRGB.green}, ${gRGB.blue}, ${gStop.opacity}) ${gStop.rampPoint}%${doesContinue ? "," : ""} ${doesContinue ? `${gStop.midPoint}%,` : ""}`.trimEnd()
  }
  str += ');'
  return str;
}
</script>

<template>
  <div class="swatch-list-container">
    <div class="swatch-list-item" v-for="(item, index) in UIList" :key="index" @mouseenter="item.hover = true"
      @mouseleave="item.hover = false">
      <div class="swatch-item-sidebar" :class="item.hover ? 'active' : 'idle'"></div>
      <div class="swatch-item-main" v-if="item.color.typename && /rgb|cmyk|gray|hsb/i.test(item.color.typename)" :style="{
        backgroundColor: getVerbosePackage(item.color as ColorValue).hex
      }" />
      <div class="swatch-item-main" v-else-if="item.color.typename && /gradient/i.test(item.color.typename)"
        :style="getGradientStyle(item.color as gradientColor)" />
      <div class="swatch-item-indicator" :class="item.active ? 'active' : 'idle'"></div>
    </div>
  </div>
</template>

<style>
.swatch-list-container {
  padding: 10px 2px;
  background-color: var(--color-header);
  height: fit-content
}

.swatch-list-item {
  box-sizing: border-box;
  padding: 1px;
  height: 22px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  position: relative;
}

.swatch-item-sidebar.idle {
  width: 0px;
}

.swatch-item-sidebar.active {
  width: 20px;
}

.swatch-item-sidebar {
  box-sizing: border-box;
  position: absolute;
  top: 1px;
  left: 0px;
  background-color: var(--color-bg);
  height: 20px;
  transition: width 200ms var(--quint) 20ms;
}

.swatch-item-main {
  box-sizing: border-box;
  width: 100%;
  height: 20px;
}

.swatch-item-indicator {
  transition: width 200ms var(--quint) 0ms, margin-left 200ms var(--quint) 0ms;
  background-color: var(--color-selection);
  height: 8px;
}

.swatch-item-indicator.idle {
  margin-left: 0px;
  width: 0px;
}

.swatch-item-indicator.active {
  margin-left: 6px;
  width: 10px;
}
</style>