import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
// import { ColorValue, DocumentDiagonostic, Config } from "../../shared/shared";
import { getVerbosePackage } from "../lib/utils/app";
import path from "path";
import {
  readFile,
  writeFile,
  makeFolder,
  exists,
  deleteFile,
} from "../lib/utils/fs";
import type {
  rgbColor,
  cmykColor,
  hsbColor,
  ColorValue,
} from "../../shared/shared";
import type { swab, swabList, SettingsStore } from "./types";

const name = "settings";
const storage = window.localStorage;
const override = false;
import { useHelp } from "./help";

const deduceTheme = () => {
  isLightTheme =
    JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo
      .panelBackgroundColor.color.red > 200;
};
const getFilePath = (filepath: string): string => {
  return filepath.replace(/^file\:\\/, "").replace(/\\/gm, "/");
};
const APPDATA_FOLDER = getFilePath(
  path.join(window.__adobe_cep__.getSystemPath("userData"), "Warlock")
);
const SETTINGS_FILE = getFilePath(path.join(APPDATA_FOLDER, "settings.json"));
const HELP_FILE = getFilePath(path.join(APPDATA_FOLDER, "help.json"));
const CHANGELOG_FILE = getFilePath(path.join(APPDATA_FOLDER, "changelog.json"));

let isLightTheme = false;
deduceTheme();

export const useSettings = defineStore(name, {
  state: () =>
    ({
      selection: {
        length: 0,
      },
      filters: {
        indicatorsOnTop: true,
        byHue: false,
        bySaturation: true,
        byFrequency: false,
        reversed: false,
      },
      options: {
        locked: false,
        isCMYK: false,
        activeIndex: 0,
        includeIndicatorInDeepScan: true,
        displayTooltipOnSwatch: true,
        displayColorModeInTooltip: false,
        displayCountInTooltip: false,
      },
      adapter: {
        online: false,
        disabled: false,
        listenTo: {
          fillStroke: true,
          selection: true,
          documentChange: true,
        },
      },
      indicator: {
        show: true,
        stroke: {
          active: false,
          colors: [
            {
              red: 255,
              green: 255,
              blue: 255,
            } as ColorValue,
          ],
        },
        fill: {
          colors: [
            {
              red: 255,
              green: 255,
              blue: 255,
            } as ColorValue,
          ],
        },
      },
      lists: [
        {
          name: "foo",
          index: 0,
          swabs: [
            // {
            //   color: {
            //     red: 255,
            //     green: 0,
            //     blue: 0,
            //     typename: "RGBColor",
            //   } as ColorValue,
            //   index: 0,
            // } as swab,
            // {
            //   color: {
            //     red: 0,
            //     green: 150,
            //     blue: 150,
            //     typename: "RGBColor",
            //   } as ColorValue,
            //   index: 1,
            // } as swab,
            // {
            //   color: {
            //     red: 100,
            //     green: 0,
            //     blue: 100,
            //     typename: "RGBColor",
            //   } as ColorValue,
            //   index: 2,
            // } as swab,
            // {
            //   color: {
            //     angle: 0,
            //     hiliteAngle: 0,
            //     hiliteLength: 0,
            //     length: 1,
            //     matrix: {
            //       mValueA: 1,
            //       mValueB: 0,
            //       mValueC: 0,
            //       mValueD: 1,
            //       mValueTX: 0,
            //       mValueTY: 0,
            //       typename: "Matrix",
            //     },
            //     origin: [0, 0],
            //     typename: "GradientColor",
            //     gradient: {
            //       name: "Unnamed gradient",
            //       type: {
            //         linear: true,
            //         radial: false,
            //       },
            //       typename: "Gradient",
            //       gradientStops: [
            //         {
            //           color: {
            //             gray: 100,
            //             typename: "GrayColor",
            //           },
            //           midPoint: 50,
            //           opacity: 100,
            //           rampPoint: 100,
            //           typename: "GradientStop",
            //         },
            //         {
            //           color: {
            //             gray: 0,
            //             typename: "GrayColor",
            //           },
            //           midPoint: 50,
            //           opacity: 100,
            //           rampPoint: 0,
            //           typename: "GradientStop",
            //         },
            //       ],
            //     },
            //   },
            //   index: 3,
            // } as swab,
            // {
            //   color: {
            //     red: 70,
            //     green: 160,
            //     blue: 245,
            //     typename: "RGBColor",
            //   } as ColorValue,
            //   index: 4,
            // } as swab,
          ],
        } as swabList,
      ],
    } as SettingsStore),
  getters: {
    currentFilter(state) {
      if (state.filters.byHue) return "Hue";
      else if (state.filters.bySaturation) return "Saturation";
      else if (state.filters.byFrequency) return "Frequency";
    },
    hueFilter(state) {
      return state.filters.byHue;
    },
    saturationFilter(state) {
      return state.filters.bySaturation;
    },
    frequencyFilter(state) {
      return state.filters.byFrequency;
    },
    filteredActiveList(state) {
      const list = state.lists[state.options.activeIndex].swabs.slice();
      console.log(list);

      // // Wtf typescript
      // list.sort((a: swab, b: swab) => {
      //   if (/gradient/i.test(a.color.typename)) {
      //     console.log("FOUND GRADIENT A");
      //     console.log(a.color);
      //     return -1;
      //   } else if (/gradient/i.test(b.color.typename)) {
      //     console.log("FOUND GRADIENT B");
      //     console.log(b.color);
      //     return 1;
      //   }
      //   const aS = getVerbosePackage(a),
      //     bS = getVerbosePackage(b);
      //   if (state.filters.indicatorsOnTop) {
      //     if (a.color == this.fillColor || a.color == this.strokeColor)
      //       return -1;
      //     else if (b.color == this.fillColor || b.color == this.strokeColor)
      //       return 1;
      //   }
      //   if (state.filters.byHue) {
      //     return aS.HSB.hue - bS.HSB.hue;
      //   } else if (state.filters.bySaturation) {
      //     return aS.HSB.saturation - bS.HSB.saturation;
      //   } else if (state.filters.byFrequency) {
      //     return b.count - a.count;
      //   }
      // });
      // console.log(list);
      // return list;

      return [];
    },
    deepScanOptions(state) {
      return {
        includeIndicator: state.options.includeIndicatorInDeepScan,
      };
    },
    // This will need to have some kind of index or determination
    activeList(state) {
      return state.lists[state.options.activeIndex];
    },
    fillIsGradient(state) {
      return (
        state.indicator.fill.colors &&
        state.indicator.fill.colors.length == 1 &&
        state.indicator.fill.colors[0].typename &&
        /gradient/i.test(state.indicator.fill.colors[0].typename)
      );
    },
    fillIsEmpty(state) {
      return (
        state.indicator.fill.colors &&
        state.indicator.fill.colors.length == 1 &&
        state.indicator.fill.colors[0].typename &&
        /nocolor/i.test(state.indicator.fill.colors[0].typename)
      );
    },
    fillColor(state) {
      return state.indicator.fill.colors.length
        ? state.indicator.fill.colors[0]
        : {
            red: 0,
            blue: 0,
            green: 0,
            typename: "RGBColor",
          };
    },
    fillIsMulti(state) {
      return state.indicator.fill.colors.length > 1;
    },
    strokeIsEmpty(state) {
      return (
        state.indicator.stroke.colors &&
        state.indicator.stroke.colors.length == 1 &&
        state.indicator.stroke.colors[0].typename &&
        /nocolor/i.test(state.indicator.stroke.colors[0].typename)
      );
    },
    strokeIsGradient(state) {
      return (
        state.indicator.stroke.colors &&
        state.indicator.stroke.colors.length == 1 &&
        state.indicator.stroke.colors[0].typename &&
        /gradient/i.test(state.indicator.stroke.colors[0].typename)
      );
    },
    strokeColor(state) {
      return state.indicator.stroke.colors.length
        ? state.indicator.stroke.colors[0]
        : {
            red: 0,
            blue: 0,
            green: 0,
            typename: "RGBColor",
          };
    },
    strokeIsMulti(state) {
      return state.indicator.stroke.colors.length > 1;
    },
  },
  actions: {
    refreshActivesWithNew(item:any) {
      console.log("REFRESH ACTIVES NOT DONE YET")
    },
    // Instead of using a computed getter and cloning, it might be better to sort in place
    // and trigger this action every time the list is set
    triggerFilter(reset: boolean = false) {

      const DEBUG = false;
      console.log("Sort explicitly");
      if (reset) {
        this.filters.byFrequency = false;
        this.filters.byHue = false;
        this.filters.bySaturation = false;
        this.lists[this.options.activeIndex].swabs.sort((a: swab, b: swab) => {
          return b.index - a.index;
        });
      } else {
        this.lists[this.options.activeIndex].swabs.sort((a: swab, b: swab) => {
          const aSwab = getVerbosePackage(a.color),
            bSwab = getVerbosePackage(b.color);
          const aIsGradient = /gradient/i.test(a.color.typename),
            bIsGradient = /gradient/i.test(b.color.typename);
          if (aIsGradient) return -1;
          if (bIsGradient) return 1;

          if (this.filters.byHue) {
            if (DEBUG) console.log(
              aSwab.HSB.hue,
              " > ",
              bSwab.HSB.hue,
              aSwab.HSB.hue - bSwab.HSB.hue
            );
            return aSwab.HSB.hue - bSwab.HSB.hue;
          } else if (this.filters.bySaturation) {
            if (DEBUG)
              console.log(
                aSwab.HSB.saturation,
                " > ",
                bSwab.HSB.saturation,
                aSwab.HSB.saturation - bSwab.HSB.saturation
              );
            return aSwab.HSB.hue - bSwab.HSB.hue;
          } else if (this.filters.byFrequency) {
            if (DEBUG) console.log(a.count, " > ", b.count, a.count > b.count);
            return a.count - b.count;
          } else {
            // Otherwise sort as normal
            return b.index - a.index;
          }
          // Should never be invoked
          return 0;
        });
      }
    },
    toggleSortByFrequency(value: boolean) {
      if (value) {
        this.$state.filters.byHue = false;
        this.$state.filters.bySaturation = false;
        this.$state.filters.byFrequency = true;
      } else {
        this.$state.filters.byHue = false;
        this.$state.filters.bySaturation = false;
        this.$state.filters.byFrequency = false;
      }
    },
    toggleSortByHue(value: boolean) {
      if (value) {
        this.$state.filters.byHue = true;
        this.$state.filters.bySaturation = false;
        this.$state.filters.byFrequency = false;
      } else {
        this.$state.filters.byHue = false;
        this.$state.filters.bySaturation = false;
        this.$state.filters.byFrequency = false;
      }
    },
    toggleSortBySaturation(value: boolean) {
      if (value) {
        this.$state.filters.byHue = false;
        this.$state.filters.bySaturation = true;
        this.$state.filters.byFrequency = false;
      } else {
        this.$state.filters.byHue = false;
        this.$state.filters.bySaturation = false;
        this.$state.filters.byFrequency = false;
      }
    },
    setHardList(value: swab[]) {
      this.lists[this.options.activeIndex].swabs = value;
      console.log("Set explicitly");
      console.log(this.lists[this.options.activeIndex].swabs);
      this.triggerFilter();
    },

    // setHardList(value: ColorValue[] | swab[]) {
    //   const list = this.$state.lists[this.$state.options.activeIndex].swabList;
    //   for (let i = list.length - 1; i >= 0; i--) {
    //     list.pop();
    //   }
    //   for (let i = value.length - 1; i >= 0; i--) {
    //     // @ts-ignore
    //     list.push(value[i] as ColorValue | swab);
    //   }
    // },
    setHardFill(value: ColorValue) {
      this.$state.indicator.fill.colors = [value];
    },
    setHardStroke(value: ColorValue) {
      this.$state.indicator.stroke.colors = [value];
    },
    async init() {
      console.log("SETTINGS INIT");
      await this.verifyTempFolder();
      await this.loadSettingsFromAppData();
      let temp = storage.getItem(name);
      if (!override && temp) this.$state = JSON.parse(temp) as any;
      else if (!temp) storage.setItem(name, JSON.stringify(this.$state));
      watch(
        this.$state,
        async (state) => {
          storage.setItem(name, JSON.stringify(state));
          await this.saveSettings();
        },
        { deep: true }
      );
    },
    async softReset() {
      deduceTheme();
      await this.deleteSettings();
      this.$reset();
    },
    async flyoutReset() {
      await this.deleteSettings();
      this.$reset();
      await this.init();
    },
    async deleteSettings() {
      if (exists(SETTINGS_FILE)) return await deleteFile(SETTINGS_FILE);
      else return false;
    },
    async saveSettings() {
      // console.log("Saving settings....");
      return await writeFile(
        SETTINGS_FILE,
        JSON.stringify(this.$state, null, 4)
      );
    },
    async loadSettingsFromAppData() {
      if (exists(SETTINGS_FILE)) {
        let lastSettings = await readFile(SETTINGS_FILE, false);
        this.$state = lastSettings;
      }
    },
    async verifyTempFolder() {
      if (!exists(APPDATA_FOLDER)) await makeFolder(APPDATA_FOLDER);
      if (!exists(SETTINGS_FILE)) await this.saveSettings();
    },
    async getHelpPages() {
      const help = useHelp();
      const data = await fetch(help.URL).catch((err) => {
        console.error(err);
      });
      // @ts-ignore
      return data.text();
    },
    async preloadHelpPages() {
      const pages = await this.getHelpPages();
      try {
        let temp = JSON.parse(pages);
      } catch (err) {
        console.log(pages);
        console.log(err);
      }
      if (exists(APPDATA_FOLDER) && pages) {
        return await writeFile(
          HELP_FILE,
          // @ts-ignore
          JSON.stringify(JSON.parse(pages), null, 4)
        );
      }
    },
    // async getChangelogPages() {
    //   const data = await fetch("XXX").catch((err) => {
    //     console.error(err);
    //   });
    //   // @ts-ignore
    //   return data.text();
    // },
    // async preloadChangelogPages() {
    //   const pages = await this.getChangelogPages();
    //   try {
    //     let temp = JSON.parse(pages);
    //   } catch (err) {
    //     console.log(pages);
    //     console.log(err);
    //   }
    //   if (exists(APPDATA_FOLDER) && pages) {
    //     return await writeFile(
    //       CHANGELOG_FILE,
    //       // @ts-ignore
    //       JSON.stringify(JSON.parse(pages), null, 4)
    //     );
    //   }
    // },
  },
});
