<template>
  <div>
    <v-snackbar warning :timeout="10000" :top="true" v-model="snackbar">
      {{snackbarMessage}}
      <v-btn flat @click.native="()=>{snackbar = false ; settings=false ;isEdit=false}">{{btnLabel}}</v-btn>
      <v-btn flat @click.native="()=>{snackbar = false }" v-if="towBtn">no</v-btn>
    </v-snackbar>
    <v-layout id="watch-toolbar" row justify-space-between>
      <v-flex>
        <v-btn light @click="addFolder()">
          <span>Add folder</span>
          <v-icon right>folder</v-icon>
        </v-btn>
        <v-btn light @click="importConfig()">
          <span>Import</span>
          <v-icon right>move_to_inbox</v-icon>
        </v-btn>
        <v-btn light @click="watchAll()">
          <span>watch all</span>
          <v-icon right class="green--text">play_arrow</v-icon>
        </v-btn>
        <v-btn light @click="stopAll()">
          <span>stop all</span>
          <v-icon right class="red--text">stop</v-icon>
        </v-btn>
      </v-flex>
      <v-flex>
      </v-flex>
    </v-layout>
    <v-dialog v-model="settings" persistent fullscreen transition="dialog-bottom-transition" :overlay="false">
      <v-card class="vertical-center">
        <v-card-text>
          <v-card flat>
            <v-toolbar>
              <v-toolbar-side-icon></v-toolbar-side-icon>
              <v-toolbar-title>Settings</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn flat icon @click.native="confirmProject() ">
                <v-icon>close</v-icon>
              </v-btn>
            </v-toolbar>
            <v-form>
              <v-layout row justify-center align-center fill-height>
                <v-flex>
                  <v-card class="pa-2 ma-2">
                    <v-card-title primary-title>
                      <div>
                        <h5 class="headline mb-0">Font Settings</h5>
                      </div>
                    </v-card-title>
                    <v-text-field label="Font Name" v-model="fontName" required></v-text-field>
                    <v-text-field label="Class Prefix" v-model="classPrefix" required></v-text-field>
                    <v-text-field label="Base Selector" v-model="baseSelector"></v-text-field>
                  </v-card>
                </v-flex>
                <v-flex>
                  <v-card class="pa-2 ma-2">
                    <v-card-title primary-title>
                      <div>
                        <h5 class="headline mb-0">Project Settings</h5>
                      </div>
                    </v-card-title>
                    <v-text-field label="Project Name" v-model="projectName" required></v-text-field>
                    <v-text-field label="Css Dest Foder" v-model="cssFile" required :readonly="true" append-icon="folder" :append-icon-cb="()=>{saveCss()}"></v-text-field>
                    <v-switch label="Embedded CSS" v-model="embedded"></v-switch>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div v-if="watchConfig.length>0">
      <v-list two-line v-for="(config,i) in watchConfig" :key="i">
        <v-list-tile>
          <v-list-tile-avatar>
            <v-icon>folder</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{config.projectSettings.projectName}}</v-list-tile-title>
            <v-list-tile-sub-title>{{config.projectSettings.svgFolder}}</v-list-tile-sub-title>
            <v-list-tile-sub-title>{{config.projectSettings.cssFile}}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action v-if="config.watch">
            <v-btn icon ripple @click="stopWatch(config)">
              <v-icon class="red--text">stop</v-icon>
            </v-btn>
          </v-list-tile-action>
          <v-list-tile-action v-if="!config.watch">
            <v-btn icon ripple @click="warchFolder(config)">
              <v-icon class="green--text">play_arrow</v-icon>
            </v-btn>
          </v-list-tile-action>
          <v-list-tile-action>
            <v-btn icon ripple @click.stop="remove(i)">
              <v-icon class="red--text">close</v-icon>
            </v-btn>
          </v-list-tile-action>
          <v-list-tile-action>
            <v-btn icon ripple @click="edit(config)">
              <v-icon>more_vert</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
        <v-divider inset></v-divider>
      </v-list>
    </div>
    <v-dialog v-model="removeDialog" lazy absolute v-if="removeDialog">
      <v-card>
        <v-card-title>
          <div class="headline">{{configToRemove.projectSettings.projectName}}</div>
        </v-card-title>
        <v-card-text style="text-align:center">
          Do you want to delete this project?<br> {{configToRemove.projectSettings.svgFolder}}
        </v-card-text>
        <v-card-actions>
          <v-btn class="blue--text darken-1" flat="flat" @click.native="removeDialog = false">cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn error class="white--text" @click.native="removeConfirm()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { remote } from "electron"
import fsMan from './shared/fsManager'
import webFontGenerator from './shared/webFontGenerator'
import path from 'path'
const dialog = remote.dialog
export default {
  data() {
    return {
      watchList: [],
      watchConfig: [],
      settings: false,
      fontName: '',
      classPrefix: '',
      baseSelector: '',
      projectName: '',
      cssFile: '',
      svgFolder: '',
      embedded: false,
      snackbar: false,
      snackbarMessage: '',
      isEdit: false,
      removeDialog: false,
      configToRemove: undefined,
      configToRemoveIndex: -1,
      towBtn: true,
      btnLabel: 'yes'
    }
  },
  computed: {
    form() {
      return this.fontName != '' && this.classPrefix != '' && this.projectName != '' && this.cssFolder != ''
    }
  },
  methods: {
    addFolder() {
      var folder = dialog.showOpenDialog({ properties: ['openDirectory'] })
      if (folder) {
        var exist = this.watchList.indexOf(folder[0])
        if (exist != -1) {
          var projectName = this.watchConfig[exist].projectSettings.projectName
          this.snackbar = true
          this.snackbarMessage = 'Folder Already in watch list project name : ' + projectName
          this.towBtn = false
          this.btnLabel = 'ok'
        } else {
          this.fontName = 'icons'
          this.classPrefix = 'icon-'
          this.baseSelector = ''
          this.projectName = ''
          this.svgFolder = folder[0]
          this.embedded = true
          this.settings = true
        }
      }
    },
    importConfig() {
      var file = dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: "json", extensions: ['json'] }] })
      var config = fsMan.readJSON(file[0])
      config.watch = false
      var exist = this.watchList.indexOf(config.projectSettings.svgFolder)
      if (exist == -1) {
        this.watchList.push(config.projectSettings.svgFolder)
        fsMan.writeJSON(watchList, this.watchList)
        config['watch'] = false
        this.watchConfig.push(config)
      } else {
        this.watchConfig.splice(exist, 1, config)
      }
    },
    confirmProject() {
      var config = {
        font: {
          fontName: this.fontName,
          classPrefix: this.classPrefix,
          baseSelector: this.baseSelector
        },
        projectSettings: {
          projectName: this.projectName,
          cssFile: this.cssFile,
          svgFolder: this.svgFolder,
          embedded: this.embedded
        }
      }
      var cssFolder=this.cssFile.replace(new RegExp("[^\\\/]*.css"),'').slice(0, -1)
      if(this.svgFolder == cssFolder){
        this.snackbar = true
          this.snackbarMessage = 'css file must not be in the same svg folder '
          this.towBtn = false
          this.btnLabel = 'ok'
          return
      }
      if (this.isEdit) {
        //edit and save an existant project
        var exist = this.watchList.indexOf(this.svgFolder)
        var watch = this.watchConfig[exist].watch
        if (watch != false && watch != undefined) {
          this.stopWatch(this.watchConfig[exist])
        }
        if (this.form) {
          fsMan.writeJSON(path.join(this.svgFolder, 'fig.watcher.json'), config)
          config.watch = watch
          this.watchConfig.splice(exist, 1, config)
          this.settings = false
        } else {
          this.snackbar = true
          this.snackbarMessage = 'Required Filed Empty Discard Change?'
          this.towBtn = true
          this.btnLabel = 'yes'
        }
        this.isEdit = false
        if (watch != false && watch != undefined) {
          this.warchFolder(this.watchConfig[exist])
        }

      } else {
        //save the new project
        if (this.form) {
          var exist = this.watchList.indexOf(this.svgFolder)
          if (exist == -1) {
            fsMan.writeJSON(path.join(this.svgFolder, 'fig.watcher.json'), config)
            this.watchConfig.push(config)
            this.watchList.push(this.svgFolder)
            fsMan.writeJSON(watchList, this.watchList)
            this.settings = false
          } else {
          }
        } else {
          this.snackbar = true
          this.snackbarMessage = 'Required Filed Empty Discard The project?'
          this.towBtn = true
          this.btnLabel = 'yes'
        }
      }
    },
    saveCss() {
      var filename = dialog.showSaveDialog({ filters: [{ name: "svg", extensions: ['css'] }] })
      this.cssFile = filename
    },
    edit(config) {
      this.fontName = config.font.fontName
      this.classPrefix = config.font.classPrefix
      this.baseSelector = config.font.baseSelector
      this.projectName = config.projectSettings.projectName
      this.cssFile = config.projectSettings.cssFile
      this.embedded = config.projectSettings.embedded
      this.svgFolder = config.projectSettings.svgFolder
      this.settings = true
      this.isEdit = true
    },
    remove(index) {
      this.removeDialog = true
      this.configToRemove = this.watchConfig[index]
      this.configToRemoveIndex = index
    },
    removeConfirm() {
      this.removeDialog = false
      var index = this.configToRemoveIndex
      this.watchConfig.splice(index, 1)
      this.watchList.splice(index, 1)
      fsMan.writeJSON(watchList, this.watchList)
      this.configToRemove = undefined
    },
    warchFolder(config) {
      this.generate(config)
      config.watch = fsMan.watch(config.projectSettings.svgFolder, () => {
        this.generate(config)
      })
    },
    stopWatch(config) {
      config.watch.close()
      config.watch = false
    },
    watchAll() {
      this.watchConfig.forEach((config) => {
        this.generate(config)
        config.watch = fsMan.watch(config.projectSettings.svgFolder, () => {
          this.generate(config)
        })
      })
    },
    stopAll() {
      this.watchConfig.forEach(function(config) {
        if (config.watch!==undefined && config.watch!==false) {
        config.watch.close()
        config.watch = false
        }
      })
    },
    generate(config) {
      var files = fsMan.readdir(config.projectSettings.svgFolder)
      var patt = new RegExp("[^\\\/]*.css$");
      var fileName = patt.exec(config.projectSettings.cssFile)[0].replace(".css", "")
      var dest = config.projectSettings.cssFile.replace('/' + fileName + '.css', '')
      var fontName = config.font.fontName
      var baseSelector = config.font.baseSelector
      var classPrefix = config.font.classPrefix
      var embedded = config.projectSettings.embedded
      webFontGenerator({
        files: files,
        fileName: fileName,
        fontName: fontName,
        classPrefix: classPrefix,
        dest: dest,
        baseSelector: baseSelector,
        embedded: embedded
      }, () => {
        console.log("done")
      })
    }
  },
  mounted() {
    if (fsMan.verify(watchList)) {
      var folderList = fsMan.readJSON(watchList)
      folderList.forEach(function(folder) {
        var file = path.join(folder, 'fig.watcher.json')
        if (fsMan.verify(file)) {
          var config = fsMan.readJSON(file)
          config['watch'] = false
          this.watchList.push(config.projectSettings.svgFolder)
          this.watchConfig.push(config)
        }
      }, this);
    }

  }
}
</script>
<style scoped>
#watch-toolbar {
  padding: 10px 20px;
  margin: 0;
  border: dashed 1px silver;
}

.vertical-center {
  padding-top: calc((100vh - 422px)/5) !important;
}
</style>
