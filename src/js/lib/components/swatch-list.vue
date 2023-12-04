<script setup lang="ts">
import { useSettings } from '../../stores/settings';
import { ref, watch, StyleValue, computed, onMounted, onBeforeUnmount } from 'vue';
import type { ColorValue, gradientColor, rgbColor, hsbColor } from '../../../shared/shared';
import type { swab } from '../../stores/types'
import { getVerbosePackage, setCSS, debounce } from '../utils/app';
import { CopyOptions } from 'fs';
import { evalES } from '../utils/bolt';

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

interface swabUI extends swab {
  hover: boolean;
  active: boolean;
  color: ColorValue
}

watch(() => settings.currentFilter, (val) => {
  settings.triggerFilter();
})

const UIList = computed(() => settings.activeList.swabs.map((v: ColorValue | swab): swabUI => {
  const temp = {
    color: (v as swab).color || (v as ColorValue),
    hover: false // Completely redundant
  } as swabUI
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

const displayHSB = (color: ColorValue) => {
  const HSB = getVerbosePackage(color).HSB;
  return `hsb(${HSB.hue}, ${HSB.saturation}, ${HSB.brightness})`
}

watch(() => settings.filteredActiveList, (newVal, oldVal) => {
  console.log(settings.currentFilter)
  console.log("NEW:")
  newVal.forEach((value: swab | ColorValue) => {
    // @ts-ignore
    if ((value as swab).color && /rgb/i.test(((value as swab).color as ColorValue).typename)) {
      console.log(`rgb(${((value as swab).color as rgbColor)?.red}, ${((value as swab).color as rgbColor)?.green}, ${((value as swab).color as rgbColor)?.blue})\t\t==\t${displayHSB((value as swab).color)}\t@@ ${((value as swab)).count}`)
    } else {
      console.log("GRADIENT:", (value as swab).color)
    }
  })
})

const constructTooltip = (item: swabUI) => {
  let str = ``;
  let pckg = getVerbosePackage(item.color)
  if (settings.options.displayColorModeInTooltip) str += `${item.color.typename}\n`
  str += `${pckg.hex}\n`
  str += `HSB(${pckg.HSB.hue}, ${pckg.HSB.saturation}, ${pckg.HSB.brightness})\n`
  if (settings.options.displayCountInTooltip) str += `Count: ${item.count}`
  return str.trim();
}

const activateSwatch = async (item:any, index:number) => {
  console.log(item)
  console.log(index)
  const temp = getVerbosePackage(item.color);
  let payload = {
    model: (settings.options.isCMYK) ? "CMYK" : "RGB",
    data: (settings.options.isCMYK) ? temp.CMYK : temp.RGB,
    isFill: !!settings.indicator.stroke.active
  }
  await evalES(`setActiveColor('${JSON.stringify(payload)}')`);
  settings.refreshActivesWithNew(item);
}

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
    <div class="swatch-list-item" v-for="(item, index) in UIList" :key="index"
      @click="activateSwatch(item, index)" :title="settings.options.displayTooltipOnSwatch ? constructTooltip(item) : ''">
      <div class="swatch-item-sidebar" :class="item.hover ? 'active' : 'idle'"></div>
      <div class="swatch-item-main" v-if="item.color.typename && /rgb|cmyk|gray|hsb/i.test(item.color.typename)" :style="{
        backgroundColor: getVerbosePackage(item.color as ColorValue).hex
      }" />
      <div class="swatch-item-main" v-else-if="item.color.typename && /gradient/i.test(item.color.typename)"
        :style="getGradientStyle(item.color as gradientColor)" />
      <div class="swatch-item-indicator" :class="checkIfColorActive(item.color) ? 'active' : 'idle'" :style="{
        // backgroundColor: getVerbosePackage(item.color as ColorValue).hex
      }">
        <!-- <div :style="{
          backgroundColor: getVerbosePackage(item.color as ColorValue).hex
          // backgroundColor: checkIfColorActiveStroke(item.color) ? 'var(--color-header)' : getVerbosePackage(item.color as ColorValue).hex
        }" class="swatch-item-indicator-center" /> -->
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
  overflow-x: hidden;
}


.swatch-list-item:last-child {
  margin-bottom: 2px;
}

.swatch-list-container::-webkit-scrollbar {
  background-color: var(--color-scrollbar);
  width: 6px;
}

.swatch-list-item {
  position: relative;
  box-sizing: border-box;
  height: 22px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
}

.swatch-list-item:hover .swatch-item-sidebar {
  width: 30%;
}

.swatch-item-sidebar {
  width: 0px;
}

.swatch-item-sidebar {
  /* border-radius: 100%; */
  box-sizing: border-box;
  position: absolute;
  top: 1px;
  /* left: -60%; */
  background-color: var(--color-bg);
  height: 20px;
  transition: width 200ms var(--quint) 20ms, left 200ms var(--quint) 20ms;
}

.swatch-item-main {
  box-sizing: border-box;
  width: 80%;
  height: 20px;
}

.swatch-item-indicator {
  position: absolute;
  transition: width 100ms var(--quint) 0ms, right 100ms var(--quint) 0ms;
  background-color: var(--color-selection);
  height: 6px;
  max-width: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.swatch-item-indicator.idle {
  right: 6px;
  width: 0px;
}

.swatch-item-indicator.active {
  right: 0px;
  width: 6px;
}

.swatch-item-indicator.active .swatch-item-indicator-center {
  height: 6px;
  width: 6px;
}

.swatch-item-indicator.idle .swatch-item-indicator-center {
  height: 0px;
  width: 0px;
}

.swatch-item-indicator-center {
  transition: width 200ms var(--quint) 0ms, height 200ms var(--quint) 0ms;
}
</style>