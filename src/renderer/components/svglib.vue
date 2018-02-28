<template>
  <div>
    <v-dialog v-model="aboutDialog" lazy absolute>
      <v-toolbar dense>
        <v-icon>icon-about</v-icon>
        <v-toolbar-title>About</v-toolbar-title>
      </v-toolbar>
      <v-list two-line subheader dense>
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <v-icon>person</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{aboutInfo.author}}</v-list-tile-title>
            <v-list-tile-sub-title>Author</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <v-icon>email</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{aboutInfo.email}}</v-list-tile-title>
            <v-list-tile-sub-title>Email</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <v-icon>public</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content >
            <v-list-tile-title @click="openInBrowser(aboutInfo.website)"><a style="cursor:pointer" >{{aboutInfo.website}}</a></v-list-tile-title>
            <v-list-tile-sub-title>Website</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <v-icon>verified_user</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title @click="openInBrowser(aboutInfo.licenceAgreement)">{{aboutInfo.licence }}
              <a  style="cursor:pointer">Licence Agreement</a>
            </v-list-tile-title>
            <v-list-tile-sub-title>Licence</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-card-actions>
          <v-btn class="blue--text darken-1" flat="flat" @click.native="aboutDialog = false" style="margin:auto">ok</v-btn>
        </v-card-actions>
      </v-list>
    </v-dialog>
    <div flat id="svglib-toolbar" class="mb-3">
      <v-layout row justify-space-between>
        <v-flex style="flex:none">
          <v-dialog v-model="alertDialog" lazy absolute>
            <v-btn slot="activator" class="black--text mr-1" @click.stop="newLib()">
              New Lib
              <v-icon>icon-new-lib</v-icon>
            </v-btn>
            <v-card>
              <v-card-title>
                <div class="headline">The editor is empty</div>
              </v-card-title>
              <v-card-text style="text-align:center">
                add some icons to your editor before creating a new lib
              </v-card-text>
              <v-card-actions>
                <v-btn class="blue--text darken-1" 
                flat="flat" @click="alertDialog = !alertDialog"
                style="margin:auto">ok</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-btn info class="mr-1" disabled>
            Dolwnload
            <v-icon right class="white--text">icon-download</v-icon>
          </v-btn>
        </v-flex>
        <v-flex xl1 lg2 md2 sm3>
          <v-text-field v-model="search" label="Search ..." single-line :append-icon="appendIcon" style="margin:-17px;" :append-icon-cb="() => {search=''}"></v-text-field>
        </v-flex>
      </v-layout>
    </div>
    <v-expansion-panel :expand="false">
      <v-expansion-panel-content v-for="(lib,i) in svgLibFilter" :key="i">
        <div slot="header" @click="toggleCheck($event)">
          <v-toolbar class="white" light dense flat open>
            <v-icon>menu</v-icon>
            <v-toolbar-title>{{lib.info.svgLibName || lib.folderName}}
              <span v-if="search.length>0">({{lib.icons.length}})</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <div :class="deleteLib?'delete':'hide'">
              <strong>Delete {{lib.info.svgLibName || lib.folderName}}</strong>
              <v-btn :class="deleteLib?'delete':''" flat @click="deleteLib=false">cancel</v-btn>
              <v-btn :class="deleteLib?'sdeletehow':''" error @click="deleteLibConfirm(i)">delete</v-btn>
            </div>
            <v-spacer></v-spacer>
            <v-btn light icon v-if="!editIcons" @click="getSelectedIcons(lib)">
              <v-icon class="green--text">icon-mark</v-icon>
            </v-btn>
            <v-btn light icon @click="selectAll(lib)">
              <v-icon>icon-select-all</v-icon>
            </v-btn>
            <v-btn light icon @click="selectNone(lib)">
              <v-icon>icon-select-none</v-icon>
            </v-btn>
            <v-btn light icon @click="flipSelection(lib)">
              <v-icon>icon-select-flip</v-icon>
            </v-btn>
            <v-btn icon v-if="editIcons" @click="quitEdit()">
              <v-icon>close</v-icon>
            </v-btn>
            <v-menu bottom left :offset-y="true" v-if="!editIcons">
              <v-btn icon slot="activator">
                <v-icon class="more_vert dark--text">more_vert</v-icon>
              </v-btn>
              <v-list>
                <v-list-tile>
                  <v-list-tile-title class="cursor" @click=" editLib(lib)">
                    <v-icon class="mr-3">edit</v-icon>Edit Lib</v-list-tile-title>
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-title class="cursor" @click="deleteLib=true">
                    <v-icon class="mr-3">delete</v-icon>Delete Lib</v-list-tile-title>
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-title class="cursor" @click="aboutDialog=true;aboutInfo=lib.info">
                    <v-icon class="mr-3">info</v-icon>About
                  </v-list-tile-title>
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-title class="cursor" @click="openSettings(lib)">
                    <v-icon class="mr-3">settings</v-icon>Settings</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-toolbar>
        </div>
        <v-card>
          <v-card-text class="grey lighten-3 ">
            <div class="scroll">
              <div v-if="lib.icons.length==0 && search.length>0">
                <h5>search not found</h5>
              </div>
              <img :src="icon.src" 
              v-for="(icon,i) in lib.icons" 
              :class="icon.selected?'selected':''" 
              @click="select(icon)" 
              :title="icon.name" 
              :key="i"
              :style="style">
            </div>
          </v-card-text>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-dialog v-model="settings" persistent fullscreen transition="dialog-bottom-transition" :overlay="false">
      <v-card>
        <v-card-text>
          <v-card flat>
            <v-toolbar>
              <v-toolbar-side-icon></v-toolbar-side-icon>
              <v-toolbar-title>Settings</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn flat icon @click.native="confirmProject() " class="show">
                <v-icon>close</v-icon>
              </v-btn>
            </v-toolbar>
            <v-form>
              <v-layout row justify-center fill-height>
                <v-flex>
                  <v-card class="pa-2 ma-2 fxiheight">
                    <v-card-title primary-title>
                      <div>
                        <h5 class="headline mb-0">Lib Settings</h5>
                      </div>
                    </v-card-title>
                    <v-text-field prepend-icon="edit" v-model="svgLibName" label="Lib Name" required></v-text-field>
                    <v-text-field prepend-icon="person" v-model="author" label="Author"></v-text-field>
                    <v-text-field prepend-icon="email" v-model="email" label="Email"></v-text-field>
                  </v-card>
                </v-flex>
                <v-flex>
                  <v-card class="pa-2 ma-2">
                    <v-card-title primary-title>
                      <div>
                        <h5 class="headline mb-0">Auxiliary Info</h5>
                      </div>
                    </v-card-title>
                    <v-text-field prepend-icon="public" v-model="website" label="Website"></v-text-field>
                    <v-select prepend-icon="verified_user" v-bind:items="licenceItems" v-model="licence" label="Licence Type" single-line item-text="type" item-value="licence" return-object></v-select>
                    <v-text-field label="Licence Agreement" v-model="licenceAgreement" multi-line persistent-hint :hint="`${licence.licence}`"></v-text-field>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import path from 'path'
import fsMan from './shared/fsManager.js'
import {shell} from "electron"
export default {
  data() {
    return {
      search: "",
      editIcons: false,
      svgLibFolders: [],
      svgLibFilter: [],
      aboutDialog: false,
      aboutInfo: {},
      settings: false,
      newProject: false,
      deleteLib: false,
      alertDialog: false,
      svgLibName: '',
      appendIcon: 'search',
      author: '',
      email: '',
      website: '',
      licenceType: '',
      licenceAgreement: '',
      licence: { type: 'MIT', licence: 'see :https://en.wikipedia.org/wiki/MIT_License' },
      licenceItems: [
        { type: 'BSD', licence: 'see : https://en.wikipedia.org/wiki/BSD_licenses' },
        { type: 'MIT', licence: 'see : https://en.wikipedia.org/wiki/MIT_License' },
        { type: 'CCO', licence: 'see : https://en.wikipedia.org/wiki/Creative_Commons_license' },
        { type: 'other', licence: 'other license' }
      ]
    }
  },
  methods: {
    openInBrowser(url){
      shell.openExternal(url)
    },
    newLib() {
      if (fsMan.readdir(workingDir).length == 0) {
        this.alertDialog = true
      } else {
        this.newProject = true
        this.settings = true
      }
    },
    toggleCheck(event) {
      var element = event.target.attributes.class.nodeValue.trim()
      if (!(element == "toolbar__content" || element == "toolbar__title" || element == "material-icons icon")) {
        event.stopPropagation()
      }
    },
    getIconName(iconDest) {
      var patt = new RegExp("[^\\\/]*.svg$");
      var iconName = patt.exec(iconDest)[0].replace(".svg", "")
      return iconName
    },
    select(icon) {
      icon.selected = !icon.selected
    },
    selectAll(svgLib) {
      svgLib.icons.forEach(function(icon) {
        icon.selected = true
      })
    },
    selectNone(svgLib) {
      svgLib.icons.forEach(function(icon) {
        icon.selected = false
      })
    },
    flipSelection(svgLib) {
      svgLib.icons.forEach(function(icon) {
        icon.selected = !icon.selected
      })
    },
    getSelectedIcons(svgLib) {
      var selectedIcons = []
      svgLib.icons.map((icon) => {
        if (icon.selected === true) {
          selectedIcons.push(icon.src)
        }
      })
      this.$store.state.svgLibIcons.push(selectedIcons)
      this.$router.push('/')
    },
    getIconName(iconDest) {
      var patt = new RegExp("[^\\\/]*.svg$");
      var iconName = patt.exec(iconDest)[0]
      return iconName
    },
    confirmProject(index) {
      var svgLib = {
        folderName: this.svgLibName,
        icons: [],
        info: {
          svgLibName: this.svgLibName,
          author: this.author,
          email: this.email,
          website: this.website,
          licence: this.licenceType,
          licenceAgreement: this.licenceAgreement
        }
      }
      if (this.newProject == true) {
        if (!fsMan.verify(path.join(configDir, 'svg-lib', this.svgLibName)) && this.svgLibName !== '') {
          fsMan.mkdir(path.join(configDir, 'svg-lib', this.svgLibName))
          fsMan.writeJSON(path.join(configDir, 'svg-lib', this.svgLibName, 'info.json'), svgLib.info)
          var icons = fsMan.readdir(workingDir)
          
          icons.forEach((icon) => {
            var iconName = this.getIconName(icon)
            fsMan.copy(icon, path.join(configDir, 'svg-lib', this.svgLibName, this.getIconName(icon)))
            svgLib.icons.push({
              src:icon,
              name:iconName,
              selected:false
            })
          })
          this.svgLibFilter.push(svgLib)
          this.svgLibFolders.push(svgLib)
          this.settings = false
          this.newProject = false
        } 
      } else if (this.svgLibName !== '') {
        fsMan.writeJSON(path.join(configDir, 'svg-lib', this.svgLibName, 'info.json'), svgLib.info)
        this.svgLibFilter.push(svgLib)
        this.svgLibFolders.push(svgLib)
        this.settings = false
      }
    },
    deleteLibConfirm(index) {
      var folderName = this.svgLibFilter[index].folderName
      fsMan.rmdir(path.join(configDir, 'svg-lib', folderName))
      this.svgLibFilter.splice(index, 1)
      this.deleteLib = false
    },
    editLib(lib) {
      var selectedIcons = []
      this.$store.state.svgLibIcons = []
      lib.icons.forEach((icon) => {
        selectedIcons.push(icon.src)
      })
      this.$store.state.svgLibIcons.push(selectedIcons)
      this.$router.push('/')
    },
    openSettings(lib) {
      var folderName = lib.folderName
      this.svgLibName = lib.info.svgLibName
      this.author = lib.info.author
      this.email = lib.info.email
      this.website = lib.info.website
      this.licence = { type: lib.info.licence, licence: '' }
      this.licenceAgreement = lib.info.licenceAgreement
      this.settings = true
    }
  },
  watch: {
    search() {
      if (this.search.length > 0) {
        this.appendIcon = 'close'
      } else {
        this.appendIcon = 'search'
      }
      this.svgLibFilter = []
      var pattern = new RegExp(this.search)
      var folderName = ''
      this.svgLibFolders.forEach((svgFolder) => {
        folderName = svgFolder.folderName
        this.svgLibFilter.push({
          folderName: folderName,
          icons: [],
          info: svgFolder.info
        })
        svgFolder.icons.filter((icon) => {
          var iconName = this.getIconName(icon.src)
          if (pattern.test(iconName)) {
            this.svgLibFilter[this.svgLibFilter.length - 1].icons.push(icon)
          }
        })
        if (this.svgLibFilter[this.svgLibFilter.length - 1].icons == 0) {
          this.svgLibFilter.splice(this.svgLibFilter.length - 1, 1)
        }
      })
    }
  },
  computed:{
    style() {
      return `width:${this.$store.state.fontSize}px;height:${this.$store.state.fontSize}px`
    }
  },
  mounted() {
    var folders = fsMan.readfolder(path.join(configDir, 'svg-lib'))
    folders.forEach(function(folder) {
      var patt = new RegExp("[^\\\/]*$");
      var folderName = patt.exec(folder)[0]
      if (fsMan.verify(path.join(configDir, 'svg-lib', folderName, 'info.json'))) {
        var info = fsMan.readJSON(path.join(configDir, 'svg-lib', folderName, 'info.json'))
      }
      var iconsPath = fsMan.readdir(folder)
      var svgLib = {
        folderName: folderName,
        icons: [],
        info: info || {
          svgLibName: folderName,
          author: "",
          email: "",
          website: "",
          licence: "",
          licenceAgreement: ""
        }
      }
      if (iconsPath) {
        iconsPath.forEach((url) => {
          if (url != undefined) {
            svgLib.icons.push({
              src: url,
              name: this.getIconName(url),
              selected: false
            })
          }
        })
      }
      this.svgLibFolders.push(svgLib)
      this.svgLibFilter.push(svgLib)
    }, this);
  }
}
</script>
<style scoped>
#svglib-toolbar {
  padding: 10px 20px;
  margin: 0;
  border: dashed 1px silver;
}

#svglib-toolbar button {
  width: 162px;
}

.toolbar__content button:not(.show) {
  display: none;
}

.expansion-panel__container--active button:not(.show) {
  display: inline-block;
}

.cursor:hover {
  cursor: pointer;
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

.fxiheight {
  height: 404px !important;
}

li.expansion-panel__container.expansion-panel__container--active {
  position: absolute;
  z-index: 2;
  width: 100%;
}

.scroll {
  height: calc(100vh - 340px);
  overflow-y: scroll;
}

.delete {
  display: inline-block;
}

.hide {
  display: none;
}
</style>
