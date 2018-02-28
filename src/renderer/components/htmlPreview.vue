<template>
  <v-container fluid id="preview">
    <link rel="stylesheet" :href="cssPath">
    <v-layout row wrap justify-center>
      <v-flex style="flex-basis:25%">
        <v-card id="fontInfo">
          <table>
            <tr>
              <td>
                <label for="">Base Selector </label>
              </td>
              <td>:
                <code>
                  {{baseSelector!==''? `${baseSelector}`:'NULL'}}
                </code>
              </td>
            </tr>
            <tr>
              <td>
                <label for="">Class Prefix </label>
              </td>
              <td>:
                <code>
                  {{classPrefix}}
                </code>
              </td>
            </tr>
            <tr>
              <td>css code</td>
              <td>
                <code class="code">
                  <span id="selected">&#x3C;i  class="{{baseSelector!==''? `.${baseSelector}`:''}} .{{classPrefix}}{{selectedIcon}}"&#x3E; &#x3C;/i&#x3E;</span>
                  <v-btn primary fab outline small v-tooltip:right="{ html: 'copy to clipboard' }" @click="copyToClipboard()">
                    <v-icon>icon-copy-to-clipboard</v-icon>
                  </v-btn>
                </code>
              </td>
            </tr>
          </table>

        </v-card>
        <v-card flat tile>
          <v-card-media class="py-1">
            <div v-for="(icon, i) in $store.state.iconsClass" class="icon-box" :key="i" style="">
              <span class="my-2" style="display:inline-block">
                <v-icon class="iconPreview" :style="style" @click="()=>selectedIcon=icon">
                  {{classPrefix}}{{icon}}
                </v-icon> <br>
                <code class="icon-name">{{icon}}</code>
              </span>
            </div>
          </v-card-media>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import fsMan from './shared/fsManager'
import path from 'path'
export default {
  data() {
    return {
      icons: [],
      baseSelector: '',
      classPrefix: '',
      selectedIcon: '',
      cssPath:''
    }
  },
  computed: {
    style() {
      return `font-size:${this.$store.state.fontSize}px`
    }
  },
  methods: {
    getIconName(iconDest) {
      var patt = new RegExp("[^\\\/]*.svg$");
      var iconName = patt.exec(iconDest)[0].replace(".svg", "")
      return iconName
    },
    copyToClipboard() {
      var selected = document.getElementById("selected")
      var range = document.createRange();
      range.selectNodeContents(selected);
      var selected = window.getSelection();
      selected.removeAllRanges();
      selected.addRange(range);
      document.execCommand("copy")
      selected.removeAllRanges();
    }
  },
  mounted() {
    if (fsMan.verify(session)) {
      var loadedSession = fsMan.readJSON(session)
      this.icons = loadedSession
    }
    if (fsMan.verify(path.join(configDir,'generatedFont.json'))) {
      var config = fsMan.readJSON(path.join(configDir,'generatedFont.json'))
      this.baseSelector = config.font.baseSelector
      this.classPrefix = config.font.classPrefix
      var fileName = config.cssFile.fileName
      this.cssPath=path.join(config.cssFile.generatedFilePath,fileName+'.css')
    }
    var $this = this
    this.icons.forEach(function(icon) {
      $this.$store.state.iconsClass.push($this.getIconName(icon.dest))
    })
    this.selectedIcon = this.$store.state.iconsClass[0]
  }
}
</script>
<style scoped>
#preview {
  position: relative;
  box-sizing: content-box;
  padding-top: 130px;
  overflow-y: scroll;
  height: calc(100vh - 300px);
}

#fontInfo {
  position: fixed;
  top: 75px;
  z-index: 1000;
  padding: 20px;
  width: calc(100vw - 120px);
}

.iconPreview {
  padding: 10px 5px;
  margin: 5px;
  border: dashed 1px silver;
}

.icon-box {
  margin: 10px;
  padding: 10px;
  box-sizing: content-box;
  border: solid 2px silver;
  border-radius: 2.5px;
  text-align: center;
  width: 19%;
  float: left
}

.icon-name {
  white-space: nowrap;
  overflow-x: hidden;
}

code {
  white-space: unset;
}
</style>

