<template>
  <div>
    <v-snackbar :timeout="6000" :bottom="!fullScreen" :top="fullScreen" :right="fullScreen" v-model="snakbar">
      Files created : {{generatedPath}}
      <v-btn flat class="pink--text" @click.native="snakbar = false">Close</v-btn>
    </v-snackbar>
    <div flat id="editor-toolbar" class="hidden-xs-only">
      <v-layout row justify-center>
        <v-flex style="flex:none">
          <v-btn light @click="openFiles()" v-tooltip:top="{ html: 'Open Files' }">
            <v-icon>icon-open-file</v-icon>
          </v-btn>
          <v-btn light @click="openFolder()" v-tooltip:top="{ html: 'Open Folder' }">
            <v-icon>icon-open-folder</v-icon>
          </v-btn>
          <v-btn light @click="preview()" v-tooltip:top="{ html: 'Preview Icons' }">
            <v-icon>icon-preview</v-icon>
          </v-btn>
          <v-btn light @click.stop="windowOnTop()" :class="$store.state.windowOnTop== false ?'elevation-0 ':'orange darken-1'" v-tooltip:top="{ html: 'window on top' }">
            <v-icon :class="$store.state.windowOnTop == true ? 'white--text ':'grey--text lighten-2'">icon-top</v-icon>
          </v-btn>
          <v-btn primary @click="generate()" class="mx-2" v-tooltip:top="{ html: 'Generate Files' }" :loading="loading" @click.native="loader = 'loading'" :disabled="loading">
            <v-icon class="white--text ">icon-generate</v-icon>
          </v-btn>
          <v-btn light @click="selectAll()" v-tooltip:top="{ html: 'Select All' }">
            <v-icon>icon-select-all</v-icon>
          </v-btn>
          <v-btn light @click="selectNone()" v-tooltip:top="{ html: 'Select None' }">
            <v-icon>icon-select-none</v-icon>
          </v-btn>
          <v-btn light @click="flipSelection()" v-tooltip:top="{ html: 'Filp Seletion' }">
            <v-icon>icon-select-flip</v-icon>
          </v-btn>
          <v-dialog v-model="dialog" lazy absolute :disabled="icons.length==0 ? true:false">
            <v-btn error dark slot="activator" class="white--text mr-2" v-tooltip:top="{ html: 'Delete'}">
              <v-icon>icon-delete</v-icon>
            </v-btn>
            <v-card>
              <v-card-title>
                <div class="headline" v-if="selected">Delete Selected Icons</div>
                <div class="headline" v-if="!selected">Delete All Icons</div>
              </v-card-title>
              <v-card-text style="text-align:center" v-if="selected">Youd you like to delete
                <b>{{selected}} {{selected===1 ? 'icon':'icons'}}?</b>
              </v-card-text>
              <v-card-text style="text-align:center" v-if="!selected">Youd you like to delete
                <b>All Icons?</b>
              </v-card-text>
              <v-card-actions>
                <v-btn class="blue--text darken-1" flat="flat" @click.native="dialog = false">cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn error class="white--text" @click.native="remove()">Delete</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-flex>
        <v-flex xl2 lg3 md4>
          <v-text-field :solo="true" v-model="query" label="Search ..." single-line :append-icon="appendIcon" :append-icon-cb="() => {query=''}"></v-text-field>
        </v-flex>
      </v-layout>
    </div>
    <div id="editor" @drop="drop($event)" style="dropbox" :class="dropBoxMode ?'dropbox':''">
      <v-btn flat icon @click="()=>{dropBoxMode=false;$store.state.windowOnTop = false}" style="float:right" v-if="dropBoxMode">
        <v-icon>close</v-icon>
      </v-btn>
      <v-layout row justify-center align-center fill-height v-if="(icons.length==0||dropBoxMode)">
        <v-flex style="position:absolute;flex:none">
          <h1 id="drop-icon">
            <v-icon class=" green--after" v-badge="dropBoxMode ?{ value: icons.length, right: true}:undefined">icon-drop</v-icon>
          </h1>
          <h3 id="drop">Drop Files Here</h3>

          <p id="drop-hint" v-if="!dropBoxMode">
            <v-icon>icon-top</v-icon> Double click to open the drop box</p>
        </v-flex>
      </v-layout>
      <div>
        <span>
          <template v-for="(icon , i) in icons">
            <img :src='icon.dest' :style="style" :key="i" @drag.prevent.stop="" @click="selectIcon(icon)" :class="icon.selected === true ? 'selected' :''" :title="getIconName(icon.dest)" v-if="!dropBoxMode">
          </template>
        </span>
      </div>
    </div>
    <v-dialog v-model="edit" lazy absolute :disabled="icons.length==0 ? true:false">
      <v-card>
        <v-card-title>
          <div class="headline">rename icon</div>
        </v-card-title>
        <v-card-text style="text-align:center">
          <div>
            <img :src="editIcon.dest" class="rename">
          </div>
          <v-text-field v-model="editIcon.name"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn class="blue--text darken-1" flat="flat" @click.native="edit = false">cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn primary class="white--text" @click.native="rename(editIcon)">rename</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import path from 'path'
import { remote } from "electron"
import fsMan from './shared/fsManager'
import fs from 'fs'
import webFontGenerator from './shared/webFontGenerator'
const { BrowserWindow, dialog } = remote
export default {
  data() {
    return {
      session: [],
      icons: [],
      dialog: false,
      selected: 0,
      query: "",
      appendIcon: 'search',
      loading: false,
      snakbar: false,
      generatedPath: '',
      fullScreen: false,
      edit: false,
      nbClickIcon: 0,
      nbClickonTop: 0,
      dropBoxMode: false,
      svgLibIcons: this.$store.state.svgLibIcons,
      editIcon: {
        name: '',
        dest: ''
      },
      keyup:null
    }
  },
  methods: {
    addIcons(icons) {
      this.loading = true
      var $this = this
      function exist(url) {
        for (var i = 0; i < $this.session.length; i++) {
          if ($this.session[i].src == url) {
            return i
          }
        }
        return -1
      }
      icons.forEach(function(src) {
        
        var patt = new RegExp("[^\\\/]*.svg$");
        if (patt.test(src)) {
          var filename = path.basename(src)
          var filePath = ''
          if (exist(src) > -1) {
            filePath = $this.session[exist(src)].dest
          } else {
            filePath = fsMan.resolve(filename)
            $this.session.push({
              'src': src,
              'dest': filePath,
              'selected': false
            })
          }
          console.log(src,filePath)
          fsMan.copy(src, filePath)
        }
      });
      this.loading = false
      fsMan.writeJSON(session, this.session)
    },
    countSelectedIcon() {
      this.selected = 0
      for (var i = 0; i < this.icons.length; i++) {
        if (this.icons[i].selected == true) {
          this.selected++
        }
      }
    },
    getIconName(iconDest) {
      var patt = new RegExp("[^\\\/]*.svg$");
      var iconName = patt.exec(iconDest)[0].replace(".svg", "")
      return iconName
    },
    openFiles() {
      var files = dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: "svg", extensions: ['svg'] }] })
      if (files) {
        var svgFiles = []
        var patt = new RegExp("\.svg$");
        for (var i = 0; i < files.length; i++) {
          if (patt.test(files[i])) {
            svgFiles.push(files[i])
          }
        }
        this.addIcons(svgFiles)
      }
    },
    openFolder() {
      var folder = dialog.showOpenDialog({ properties: ['openDirectory'] })
      if (folder) {
        var svgFiles = fsMan.readdir(folder[0])
        this.addIcons(svgFiles)
      }
    },
    drop(event) {
      var files = event.dataTransfer.files
      var svgFiles = []
      var patt = new RegExp("\.svg$");
      for (var i = 0; i < files.length; i++) {
        if (fs.lstatSync(files[i].path).isFile()) {
          if (patt.test(files[i].path)) {
            svgFiles.push(files[i].path)
          }
        } else if (fs.lstatSync(files[i].path).isDirectory()) {
          fsMan.loopFolderTree(files[i].path, (filesArray) => {
            this.addIcons(filesArray)
          })
        }
      }
      this.addIcons(svgFiles)
    },
    selectIcon(icon) {
      this.nbClickIcon++
      setTimeout(() => {
        if (this.nbClickIcon == 1) {
          icon.selected = !icon.selected
          this.countSelectedIcon()
        } else {
          this.edit = true
          this.editIcon = {
            dest: icon.dest,
            name: this.getIconName(icon.dest)
          }
        }
        this.nbClickIcon = 0
      }, 200)
    },
    rename(icon) {
      var i = 0
      var oldName = this.getIconName(icon.dest)
      var newPath = icon.dest.replace(oldName + ".svg", icon.name + '.svg')
      fsMan.rename(icon.dest, newPath)
      this.session.forEach((item) => {
        if (item.dest == icon.dest) {
          this.session[i].dest = newPath
          this.icons[i].dest = newPath
          fsMan.writeJSON(session, this.session)
          this.edit = false
          return
        }
        i++
      })
    },
    preview() {
      const winURL = process.env.NODE_ENV === 'development'
        ? `http://localhost:9080/#/preview`
        : `file://${__dirname}/index.html#/preview`
      var preview = new BrowserWindow({
        minHeight: 580,
        useContentSize: true,
        minWidth: 870
      })
      preview.loadURL(winURL)
    },
    windowOnTop() {
      this.nbClickonTop++
      setTimeout(() => {
        if (this.nbClickonTop == 1) {
          var win = remote.getCurrentWindow()
          if (this.$store.state.windowOnTop == false) {
            win.unmaximize()
            win.setSize(955, 580)
            win.setResizable(false)
            win.setAlwaysOnTop(true)
            this.$store.state.windowOnTop = true
          } else {
            win.setMinimumSize(955, 580)
            win.setResizable(true)
            win.maximize()
            win.setAlwaysOnTop(false)
            this.$store.state.windowOnTop = false
          }
        } else {
          this.dropBoxMode = true
          this.dropbox()
        }
        this.nbClickonTop = 0
      }, 300)
    },
    dropbox() {
      var win = remote.getCurrentWindow()
      if (this.dropBoxMode == true) {
        win.unmaximize()
        win.setSize(400, 400)
        win.setResizable(false)
        win.setAlwaysOnTop(true)
        win.s
      } else {
        win.setSize(955, 580)
        win.setMinimumSize(955, 580)
        win.setAlwaysOnTop(true)
        win.setResizable(false)
        this.$store.state.windowOnTop = true
      }
    },
    generate() {
      var files = fsMan.readdir(workingDir)
      var config = fsMan.readJSON(figConfig)
      var fileName = config.cssFile.fileName
      var dest = config.cssFile.generatedFilePath
      var classPrefix = config.font.classPrefix
      var fontName = config.font.fontName
      var baseSelector = config.font.baseSelector
      var embedded = config.cssFile.embedded
      if (dest == null) {
        var folder = dialog.showOpenDialog({ properties: ['openDirectory'] })
        config.cssFile.generatedFilePath = folder[0]
        dest = folder[0]
        fsMan.writeJSON(figConfig, config)
      }
      fsMan.writeJSON(path.join(configDir, 'generatedFont.json'), config)
      this.loading = true
      webFontGenerator({
        files: files,
        fileName: fileName,
        fontName: fontName,
        classPrefix: classPrefix,
        dest: dest,
        baseSelector: baseSelector,
        embedded: embedded
      }, () => {
        this.loading = false
        this.snakbar = true
        this.generatedPath = dest
        console.log("done")
      })
      var win = remote.getCurrentWindow()
      this.fullScreen = win.isMaximized()
    },
    selectAll() {
      for (var i = 0; i < this.icons.length; i++) {
        this.icons[i].selected = true
      }
      this.selected = this.icons.length
    },
    selectNone() {
      for (var i = 0; i < this.icons.length; i++) {
        this.icons[i].selected = false
      }
      this.selected = 0
    },
    flipSelection() {
      this.selected = false
      for (var i = 0; i < this.icons.length; i++) {
        this.icons[i].selected = !this.icons[i].selected
        if (this.icons[i].selected == true) {
          this.selected++
        }
      }
    },
    remove() {
      this.dialog = false
      if (this.selected == 0 || this.selected == this.icons.length) {
        this.session = []
        this.selected = 0
        fsMan.clearDir(workingDir)
      } else {
        for (var i = this.icons.length - 1; i >= 0; i--) {
          if (this.icons[i].selected == true) {
            fsMan.remove(this.session[i].dest)
            this.icons.splice(i, 1)
            this.session.splice(i, 1)
          }
        }
      }
      fsMan.writeJSON(session, this.session)
    }
  },
  computed: {
    style() {
      return `width:${this.$store.state.fontSize}px;height:${this.$store.state.fontSize}px`
    }
  },
  watch: {
    dropBoxMode() {
      this.dropbox()
    },
    query() {
      clearInterval(this.keyup)
      this.keyup=setTimeout(() => {
        var pattern = new RegExp(this.query)
        this.icons = this.session.filter((icon) => {
          var iconName = this.getIconName(icon.src)
          if (pattern.test(iconName)) {
            return icon
          }
        })
        if (this.query.length > 0) {
          this.appendIcon = 'close'
        } else {
          this.appendIcon = 'search'
        }
      }, 500)
    }
  },
  mounted() {
    var $this = this
    if (fsMan.verify(session)) {
      var loadedSession = fsMan.readJSON(session)
      this.icons = loadedSession
    }
    this.session = fsMan.readJSON(session)
    if (this.svgLibIcons.length > 0) {
      this.loading = true
      setTimeout(() => {
        var iconsSrc = []
        this.svgLibIcons[0].forEach(function(src) {
          if (typeof (src) == 'string')
            iconsSrc.push(src)
        })
        this.addIcons(iconsSrc)
        this.$store.state.svgLibIcons = []
      }, 300)
    }
    fsMan.watch(session, function() {
      var loadedSession = fsMan.readJSON(session)
      $this.icons = loadedSession
    })
  }
}
</script>
<style scoped>
#editor-toolbar {
  padding: 10px 20px;
  margin: 0;
  border: dashed 1px silver;
}

#editor-toolbar button {
  padding: 11px 0;
  margin: 0;
  height: auto;
  min-width: auto;
}

#editor:not(.dropbox) {
  margin: 20px 0;
  height: calc( 100% - 120px);
  border: dashed 3px silver;
  overflow-y: scroll;
}

.dropbox {
  width: 100%;
  height: calc(100vh - 50px);
  overflow-y: hidden;
  border: dashed 3px silver;
  text-align: center;
  padding-left: 40px;
}

#drop {
  font-family: 'urban_sketchregular';
  text-align: center;
}

#drop-icon i {
  font-size: 112px;
}

#drop-icon,
#drop-hint {
  color: silver;
  text-align: center;
}

#drop-hint {
  font-size: 18px;
}

img {
  width: 32px;
  height: 32px;
  margin: 10px;
  padding: 10px;
  box-sizing: content-box;
  border: solid 2px silver;
  border-radius: 2.5px;
}

.selected {
  border: solid 2px darkorange;
  border-radius: 2.5px;
}

.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}

.rename {
  width: 64px;
  height: 64px;
}

@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
