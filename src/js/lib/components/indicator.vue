<script setup lang="ts">
import { StyleValue, computed } from 'vue';
import { useSettings } from '../../stores/settings';
import { getVerbosePackage } from '../utils/app';
import { gradientColor } from '../../../shared/shared';

const settings = useSettings();

const showFillMulti = computed(() => settings.fillIsMulti),
  showFillNone = computed(() => settings.fillIsEmpty),
  showFillBG = computed(() => !settings.fillIsEmpty && !settings.fillIsMulti && !settings.fillIsGradient),
  showFillGradient = computed(() => !settings.fillIsEmpty && !settings.fillIsMulti && settings.fillIsGradient);


const showStrokeMulti = computed(() => settings.strokeIsMulti),
  showStrokeNone = computed(() => settings.strokeIsEmpty),
  showStrokeBG = computed(() => !settings.strokeIsEmpty && !settings.strokeIsMulti && !settings.strokeIsGradient),
  showStrokeGradient = computed(() => !settings.strokeIsEmpty && !settings.strokeIsMulti && settings.strokeIsGradient)

const fillBGColor = computed(() => !settings.fillIsGradient ? getVerbosePackage(settings.fillColor).hex : "#000"),
  strokeBGColor = computed(() => !settings.strokeIsGradient ? getVerbosePackage(settings.strokeColor).hex : "#000");


const getGradientStyle = (color: gradientColor): StyleValue => {
  const isAbove180 = color.angle + 90 > 180;
  const angle = (color.angle - 90)
  let str = `fill: ${color.gradient.type.linear ? 'linear-gradient(' : 'radial-gradient('}`
  str += `${angle}deg,`
  for (let i = 0; i < color.gradient.gradientStops.length; i++) {
    const gStop = color.gradient.gradientStops[i];
    const gRGB = getVerbosePackage(gStop.color).RGB;
    const doesContinue = i < color.gradient.gradientStops.length - 1;
    str += ` rgba(${gRGB.red}, ${gRGB.green}, ${gRGB.blue}, ${gStop.opacity}) ${gStop.rampPoint}%${doesContinue ? "," : ""} ${doesContinue ? `${gStop.midPoint}%,` : ""}`.trimEnd()
  }
  str += ');'
  console.log(str)
  return str;
}

</script>

<template>
  <div class="indicator-wrapper">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      viewBox="0 0 54 54">
      <g id="fill" v-if="!settings.indicator.stroke.active">
        <rect class="indicator-fill" v-if="showFillBG" :style="{
          fill: fillBGColor
        }" width="36" height="36" />
        <rect class="indicator-fill svg-gradient" v-if="showFillGradient"
          :style="getGradientStyle(settings.fillColor as gradientColor)" width="36" height="36" />
        <g id="fillMulti" v-if="showFillMulti">
          <g id="fillBGLock">
            <rect x="0.5" y="0.5" class="indicator-none-fill" width="35" height="35" />
            <path d="M35,1v34H1V1H35 M36,0H0v36h36V0L36,0z" />
          </g>
          <path class="indicator-multi-text" d="M17,19.4V19c0-0.5,0.1-1,0.2-1.3c0.2-0.3,0.5-0.7,0.9-1.1c0.6-0.5,1-0.9,1.2-1.2
				c0.2-0.3,0.2-0.6,0.2-1c0-0.5-0.2-0.8-0.5-1.1c-0.3-0.3-0.7-0.4-1.3-0.4c-0.4,0-0.7,0-1.1,0.1c-0.3,0.1-0.7,0.2-1.2,0.5l-0.4-0.9
				c0.9-0.5,1.8-0.7,2.7-0.7c0.9,0,1.6,0.2,2.1,0.6s0.7,1,0.7,1.8c0,0.3,0,0.6-0.1,0.9c-0.1,0.3-0.2,0.5-0.4,0.7
				c-0.2,0.2-0.6,0.6-1.1,1.1c-0.5,0.4-0.8,0.7-0.9,1c-0.1,0.3-0.2,0.6-0.2,1.1v0.2H17z M16.6,21.4c0-0.6,0.3-0.9,0.8-0.9
				c0.3,0,0.5,0.1,0.6,0.2c0.1,0.2,0.2,0.4,0.2,0.7c0,0.3-0.1,0.5-0.2,0.7c-0.1,0.2-0.4,0.2-0.6,0.2c-0.2,0-0.4-0.1-0.6-0.2
				C16.7,22,16.6,21.7,16.6,21.4z" />
        </g>
        <g v-if="showFillNone">
          <rect x="0.5" y="0.5" class="indicator-empty-bg" width="35" height="35" />
          <line id="fillNone" class="indicator-empty-line" x1="0.7" y1="35.3" x2="35.3" y2="0.7" />
        </g>
        <g id="fillFrame">
          <rect x="0" y="0" class="indicator-stroke-shim svg-no-fill" width="36" height="36" />
          <rect x="1.2" y="1.2" v-if="showFillBG" class="indicator-stroke-pad svg-no-fill" width="33.6" height="33.6" />
          <rect x="1.2" y="1.2" v-if="showFillGradient" class="indicator-stroke-pad svg-no-fill" width="33.6"
            height="33.6" />
        </g>
      </g>
      <g id="stroke" :style="{
        zIndex: settings.indicator.stroke.active ? 3 : 1
      }">
        <g id="strokeBG" v-if="showStrokeBG">
          <rect x="18.5" y="18.5" :style="{
            fill: strokeBGColor
          }" width="35" height="35" />
          <rect x="28.1" y="28.1" class="indicator-stroke-center indicator-stroke-pad" width="15.8" height="15.8" />
          <rect x="29.1" y="29.1" class="indicator-stroke-shim" width="13.8" height="13.8" />
          <!-- <path d="M53,19v34H19V19H53 M54,18H18v36h36V18L54,18z" /> -->
        </g>
        <g id="strokeBG" v-if="showStrokeGradient">
          <rect x="18.5" y="18.5" class="svg-gradient" width="35" height="35" />
          <rect x="28.1" y="28.1" class="indicator-stroke-center indicator-stroke-pad" width="15.8" height="15.8" />
          <rect x="29.1" y="29.1" class="indicator-stroke-shim" width="13.8" height="13.8" />
          <!-- <path d="M53,19v34H19V19H53 M54,18H18v36h36V18L54,18z" /> -->
        </g>
        <g v-if="showStrokeMulti">
          <g id="strokeBGLock">
            <rect x="18.5" y="18.5" class="indicator-none-fill" width="36" height="36" />
            <rect x="28.1" y="28.1" class="indicator-stroke-center" width="15.8" height="15.8" />
            <path d="M43.4,28.6v14.8H28.6V28.6H43.4 M44.4,27.6H27.6v16.8h16.8V27.6L44.4,27.6z" />
            <path d="M53,19v34H19V19H53 M54,18H18v36h36V18L54,18z" />
          </g>
          <g id="_x3F__00000078026555349427796820000001742698723664755885_">
            <path class="indicator-multi-text" d="M22.9,25v-0.2c0-0.3,0-0.6,0.1-0.8c0.1-0.2,0.3-0.4,0.5-0.6c0.4-0.3,0.6-0.5,0.7-0.7
            c0.1-0.2,0.1-0.3,0.1-0.6c0-0.3-0.1-0.5-0.3-0.6c-0.2-0.1-0.4-0.2-0.7-0.2c-0.2,0-0.4,0-0.6,0.1c-0.2,0-0.4,0.1-0.7,0.3
            l-0.2-0.5c0.5-0.3,1-0.4,1.6-0.4c0.5,0,0.9,0.1,1.2,0.4s0.4,0.6,0.4,1c0,0.2,0,0.4-0.1,0.5c-0.1,0.1-0.1,0.3-0.2,0.4
            c-0.1,0.1-0.3,0.3-0.6,0.6c-0.3,0.2-0.4,0.4-0.5,0.6c-0.1,0.1-0.1,0.3-0.1,0.6V25H22.9z M22.7,26.1c0-0.4,0.2-0.5,0.5-0.5
            c0.2,0,0.3,0,0.4,0.1c0.1,0.1,0.1,0.2,0.1,0.4c0,0.2,0,0.3-0.1,0.4c-0.1,0.1-0.2,0.1-0.3,0.1c-0.1,0-0.2,0-0.3-0.1
            S22.7,26.3,22.7,26.1z" />
            <path class="indicator-multi-text"
              d="M48,25v-0.2c0-0.3,0-0.6,0.1-0.8c0.1-0.2,0.3-0.4,0.5-0.6c0.4-0.3,0.6-0.5,0.7-0.7c0.1-0.2,0.1-0.3,0.1-0.6
            c0-0.3-0.1-0.5-0.3-0.6c-0.2-0.1-0.4-0.2-0.7-0.2c-0.2,0-0.4,0-0.6,0.1c-0.2,0-0.4,0.1-0.7,0.3L47,21.1c0.5-0.3,1-0.4,1.6-0.4
            c0.5,0,0.9,0.1,1.2,0.4s0.4,0.6,0.4,1c0,0.2,0,0.4-0.1,0.5c-0.1,0.1-0.1,0.3-0.2,0.4c-0.1,0.1-0.3,0.3-0.6,0.6
            c-0.3,0.2-0.4,0.4-0.5,0.6c-0.1,0.1-0.1,0.3-0.1,0.6V25H48z M47.8,26.1c0-0.4,0.2-0.5,0.5-0.5c0.2,0,0.3,0,0.4,0.1
            c0.1,0.1,0.1,0.2,0.1,0.4c0,0.2,0,0.3-0.1,0.4c-0.1,0.1-0.2,0.1-0.3,0.1c-0.1,0-0.2,0-0.3-0.1S47.8,26.3,47.8,26.1z" />
            <path class="indicator-multi-text" d="M22.9,49.7v-0.2c0-0.3,0-0.6,0.1-0.8c0.1-0.2,0.3-0.4,0.5-0.6c0.4-0.3,0.6-0.5,0.7-0.7
            c0.1-0.2,0.1-0.3,0.1-0.6c0-0.3-0.1-0.5-0.3-0.6C24,46.1,23.7,46,23.4,46c-0.2,0-0.4,0-0.6,0.1c-0.2,0-0.4,0.1-0.7,0.3l-0.2-0.5
            c0.5-0.3,1-0.4,1.6-0.4c0.5,0,0.9,0.1,1.2,0.4s0.4,0.6,0.4,1c0,0.2,0,0.4-0.1,0.5c-0.1,0.1-0.1,0.3-0.2,0.4
            c-0.1,0.1-0.3,0.3-0.6,0.6c-0.3,0.2-0.4,0.4-0.5,0.6c-0.1,0.1-0.1,0.3-0.1,0.6v0.1H22.9z M22.7,50.9c0-0.4,0.2-0.5,0.5-0.5
            c0.2,0,0.3,0,0.4,0.1c0.1,0.1,0.1,0.2,0.1,0.4c0,0.2,0,0.3-0.1,0.4c-0.1,0.1-0.2,0.1-0.3,0.1c-0.1,0-0.2,0-0.3-0.1
            S22.7,51.1,22.7,50.9z" />
            <path class="indicator-multi-text" d="M48,49.7v-0.2c0-0.3,0-0.6,0.1-0.8c0.1-0.2,0.3-0.4,0.5-0.6c0.4-0.3,0.6-0.5,0.7-0.7
            c0.1-0.2,0.1-0.3,0.1-0.6c0-0.3-0.1-0.5-0.3-0.6c-0.2-0.1-0.4-0.2-0.7-0.2c-0.2,0-0.4,0-0.6,0.1c-0.2,0-0.4,0.1-0.7,0.3L47,45.9
            c0.5-0.3,1-0.4,1.6-0.4c0.5,0,0.9,0.1,1.2,0.4s0.4,0.6,0.4,1c0,0.2,0,0.4-0.1,0.5c-0.1,0.1-0.1,0.3-0.2,0.4
            c-0.1,0.1-0.3,0.3-0.6,0.6c-0.3,0.2-0.4,0.4-0.5,0.6c-0.1,0.1-0.1,0.3-0.1,0.6v0.1H48z M47.8,50.9c0-0.4,0.2-0.5,0.5-0.5
            c0.2,0,0.3,0,0.4,0.1c0.1,0.1,0.1,0.2,0.1,0.4c0,0.2,0,0.3-0.1,0.4c-0.1,0.1-0.2,0.1-0.3,0.1c-0.1,0-0.2,0-0.3-0.1
            S47.8,51.1,47.8,50.9z" />
          </g>
        </g>
        <g id="strokeGapLock" v-if="showStrokeNone">
          <rect x="18.5" y="18.5" class="indicator-empty-bg" width="36" height="36" />
          <rect x="28.1" y="28.1" class="indicator-stroke-center indicator-stroke-pad" width="15.8" height="15.8" />
          <rect x="29.1" y="29.1" class="indicator-stroke-shim" width="13.8" height="13.8" />
          <line id="strokeNone" class="indicator-empty-line" x1="18.7" y1="53.3" x2="53.3" y2="18.7" />
        </g>
        <g id="strokeFrame">
          <rect x="18.5" y="18.5" class="indicator-stroke-shim svg-no-fill" width="36" height="36" />
          <rect x="19.5" y="19.5" v-if="showStrokeBG" class="indicator-stroke-pad svg-no-fill" width="33.6"
            height="33.6" />
        </g>
      </g>
      <g id="fill" v-if="settings.indicator.stroke.active">
        <rect class="indicator-fill" v-if="showFillBG" :style="{
          fill: fillBGColor
        }" width="36" height="36" />
        <rect class="indicator-fill svg-gradient" v-if="showFillGradient"
          :style="getGradientStyle(settings.fillColor as gradientColor)" width="36" height="36" />
        <g id="fillMulti" v-if="showFillMulti">
          <g id="fillBGLock">
            <rect x="0.5" y="0.5" class="indicator-none-fill" width="35" height="35" />
            <path d="M35,1v34H1V1H35 M36,0H0v36h36V0L36,0z" />
          </g>
          <path class="indicator-multi-text" d="M17,19.4V19c0-0.5,0.1-1,0.2-1.3c0.2-0.3,0.5-0.7,0.9-1.1c0.6-0.5,1-0.9,1.2-1.2
				c0.2-0.3,0.2-0.6,0.2-1c0-0.5-0.2-0.8-0.5-1.1c-0.3-0.3-0.7-0.4-1.3-0.4c-0.4,0-0.7,0-1.1,0.1c-0.3,0.1-0.7,0.2-1.2,0.5l-0.4-0.9
				c0.9-0.5,1.8-0.7,2.7-0.7c0.9,0,1.6,0.2,2.1,0.6s0.7,1,0.7,1.8c0,0.3,0,0.6-0.1,0.9c-0.1,0.3-0.2,0.5-0.4,0.7
				c-0.2,0.2-0.6,0.6-1.1,1.1c-0.5,0.4-0.8,0.7-0.9,1c-0.1,0.3-0.2,0.6-0.2,1.1v0.2H17z M16.6,21.4c0-0.6,0.3-0.9,0.8-0.9
				c0.3,0,0.5,0.1,0.6,0.2c0.1,0.2,0.2,0.4,0.2,0.7c0,0.3-0.1,0.5-0.2,0.7c-0.1,0.2-0.4,0.2-0.6,0.2c-0.2,0-0.4-0.1-0.6-0.2
				C16.7,22,16.6,21.7,16.6,21.4z" />
        </g>
        <g v-if="showFillNone">
          <rect x="0.5" y="0.5" class="indicator-empty-bg" width="35" height="35" />
          <line id="fillNone" class="indicator-empty-line" x1="0.7" y1="35.3" x2="35.3" y2="0.7" />
        </g>
        <g id="fillFrame">
          <!-- <path d="M35,1v34H1V1H35 M36,0H0v36h36V0L36,0z" /> -->
          <rect x="0" y="0" class="indicator-stroke-shim svg-no-fill" width="36" height="36" />
          <rect x="1.2" y="1.2" v-if="showFillBG" class="indicator-stroke-pad svg-no-fill" width="33.6" height="33.6" />
          <rect x="1.2" y="1.2" v-if="showFillGradient" class="indicator-stroke-pad svg-no-fill" width="33.6"
            height="33.6" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style>
:root {
  --indicator-empty-bg: #fff;
  --indicator-empty-slash: #ff0000;
  --indicator-border-outer: #000;
  --indicator-border-inner: #fff;
  --indicator-multi-text: #E0E0E0;
  --indicator-multi-bg: #333;
  --indicator-stroke-inside: #383838;
}

.indicator-wrapper {
  box-sizing: border-box;
  margin: 5px;
  min-height: 30px;
  height: fit-content;
  width: calc(100% - 10px);
}

.svg-no-fill {
  fill: transparent;
}

.indicator-wrapper svg {
  width: 100%;
}

.indicator-empty-bg {
  fill: var(--indicator-empty-bg);
}

.indicator-stroke-pad {
  stroke-width: 1.2px;
  stroke: var(--indicator-border-inner);
}

.indicator-stroke-shim {
  stroke-width: 1.2px;
  stroke: var(--indicator-border-outer);
  fill: transparent;
}

.indicator-none-fill {
  fill: var(--indicator-multi-bg);
}

.indicator-multi-text {
  fill: var(--indicator-multi-text);
}

.indicator-empty-line {
  fill: none;
  stroke: var(--indicator-empty-slash);
  stroke-width: 2;
  stroke-miterlimit: 10;
}

.indicator-stroke-center {
  fill: var(--indicator-stroke-inside);
}
</style>