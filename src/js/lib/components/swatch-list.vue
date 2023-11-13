<script setup lang="ts">
import { useSettings } from '../../stores/settings';
import { ref, watch, StyleValue, computed, onMounted, onBeforeUnmount } from 'vue';
import type { ColorValue, gradientColor } from '../../../shared/shared';
import type { swatch } from '../../stores/types'
import { getVerbosePackage, setCSS, debounce } from '../utils/app';

const settings = useSettings();
watch(() => settings.indicator.show, (value: boolean) => {
  resetSwatchListHeight();
})

const resetSwatchListHeight = () => {
  const temp = document.querySelector('.indicator-wrapper')?.getBoundingClientRect();
  if (temp) {
    setCSS(`--max-swatch-list-height`, `calc(100vh - ${temp.height}px - 40px)`)
  } else {
    setCSS(`--max-swatch-list-height`, `calc(100vh - 40px)`)
  }
}

interface swatchUI extends swatch {
  hover: boolean;
  active: boolean;
  color: ColorValue
}

const UIList = computed(() => settings.filteredActiveList.map((v: ColorValue | swatch): swatchUI => {
  const temp = {
    color: (v as swatch).color || (v as ColorValue),
    hover: false // Completely redundant
  } as swatchUI
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

const checkIfColorActive = (color: ColorValue): boolean => {
  const isActiveFill = JSON.stringify(color) == JSON.stringify(settings.fillColor) && !settings.fillIsEmpty && !settings.fillIsMulti
  const isActiveStroke = JSON.stringify(color) == JSON.stringify(settings.strokeColor) && !settings.strokeIsEmpty && !settings.strokeIsMulti
  return isActiveFill || isActiveStroke
}
const checkIfColorActiveStroke = (color: ColorValue): boolean => {
  return JSON.stringify(color) == JSON.stringify(settings.strokeColor) && !settings.strokeIsEmpty && !settings.strokeIsMulti
}

const handleWindowResize = debounce(() => {
  resetSwatchListHeight();
}, 200);

const windowWidth = ref(window.innerWidth);

watch(() => window.innerWidth, (newWidth, oldWidth) => {
  if (newWidth !== oldWidth) {
    windowWidth.value = newWidth;
    handleWindowResize();
  }
});

onMounted(() => {
  resetSwatchListHeight();
  window.addEventListener('resize', handleWindowResize);
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize);
});
</script>

<template>
  <div class="swatch-list-container">
    <div class="swatch-list-item" v-for="(item, index) in UIList" :key="index">
      <div class="swatch-item-sidebar" :class="item.hover ? 'active' : 'idle'"></div>
      <div class="swatch-item-main" v-if="item.color.typename && /rgb|cmyk|gray|hsb/i.test(item.color.typename)" :style="{
        backgroundColor: getVerbosePackage(item.color as ColorValue).hex
      }" />
      <div class="swatch-item-main" v-else-if="item.color.typename && /gradient/i.test(item.color.typename)"
        :style="getGradientStyle(item.color as gradientColor)" />
      <div class="swatch-item-indicator" :class="checkIfColorActive(item.color) ? 'active' : 'idle'" :style="{
        backgroundColor: getVerbosePackage(item.color as ColorValue).hex
      }">
        <div :style="{
          backgroundColor: checkIfColorActiveStroke(item.color) ? 'var(--color-header)' : getVerbosePackage(item.color as ColorValue).hex
        }" class="swatch-item-indicator-center" />
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --max-swatch-list-height: 700px;
}

.swatch-list-container {
  padding: 10px 2px;
  background-color: var(--color-header);
  height: fit-content;
  padding: 2px;
  max-height: var(--max-swatch-list-height);
  overflow-y: auto;
}

.swatch-list-item:last-child {
  margin-bottom: 2px;
}

.swatch-list-container::-webkit-scrollbar {
  background-color: var(--color-scrollbar);
  width: 6px;
}

.swatch-list-item {
  box-sizing: border-box;
  height: 22px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  position: relative;
}

.swatch-list-item:hover .swatch-item-sidebar {
  width: 40%;
}

.swatch-item-sidebar {
  width: 0px;
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.swatch-item-indicator.idle {
  margin-left: 0px;
  width: 0px;
}

.swatch-item-indicator.active {
  margin-left: 6px;
  width: 10px;
}

.swatch-item-indicator.active .swatch-item-indicator-center {
  height: 55%;
  width: 55%;
}

.swatch-item-indicator.idle .swatch-item-indicator-center {
  height: 0px;
  width: 0px;
}

.swatch-item-indicator-center {
  background-color: var(--color-header);
  transition: width 200ms var(--quint) 0ms, height 200ms var(--quint) 0ms
}
</style>