<template>
  <v-layout row justify-center>
    <v-flex fill-height>
      <v-card flat>
        <v-toolbar>
          <v-switch label="autosave" v-model="autosave"></v-switch>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn success :disabled="autosave" @click="save()">{{autosave ?'autosave' : 'save'}}</v-btn>
          <v-btn @click="reset()" flat icon title="Reset Default">
            <v-icon>restore_page</v-icon>
          </v-btn>
        </v-toolbar>
        <v-form>
          <v-layout class="centerVertical" row justify-center row align-center>
            <v-flex>
              <v-card class="pa-2 ma-2">
                <v-card-title primary-title>
                  <div>
                    <h5 class="headline mb-0">Font Settings</h5>
                  </div>
                </v-card-title>
                <v-text-field label="Font Name" v-model="fontName" required v-bind:value="fontName"></v-text-field>
                <v-text-field label="Class Prefix" v-model="classPrefix" required v-bind:value="classPrefix"></v-text-field>
                <v-text-field label="Base Selector" v-model="baseSelector" v-bind:value="baseSelector"></v-text-field>
              </v-card>
            </v-flex>
            <v-flex>
              <v-card class="pa-2 ma-2">
                <v-card-title primary-title>
                  <div>
                    <h5 class="headline mb-0">File Settings</h5>
                  </div>
                </v-card-title>
                <v-text-field label="File Name" v-model="fileName" required v-bind:value="fileName"></v-text-field>
                <v-text-field label="Generated File Path" v-model="generatedFilePath" required :readonly="true" append-icon="folder" v-bind:value="generatedFilePath" :append-icon-cb="()=>openDir()"></v-text-field>
                <v-switch label="Embedded CSS" v-model="embedded"></v-switch>
              </v-card>
            </v-flex>
          </v-layout>
        </v-form>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import { remote } from "electron"
import path from 'path'
import fsMan from './shared/fsManager'
const dialog = remote.dialog
export default {
  name: 'settings',
  data() {
    return {
      autosave: true
    }
  },
  computed: {
    fontName: {
      get() {
        return this.$store.state.fontName
      },
      set(value) {
        this.$store.state.fontName = value
      }
    },
    classPrefix: {
      get() {
        return this.$store.state.classPrefix
      },
      set(value) {
        this.$store.state.classPrefix = value
      }
    },
    fileName: {
      get() {
        return this.$store.state.fileName
      },
      set(value) {
        this.$store.state.fileName = value
      }
    },
    generatedFilePath: {
      get() {
        return this.$store.state.generatedFilePath
      },
      set(value) {
        this.$store.state.generatedFilePath = value
      }
    },
    baseSelector: {
      get() {
        return this.$store.state.baseSelector
      },
      set(value) {
        this.$store.state.baseSelector = value
      }
    },
    embedded: {
      get() {
        return this.$store.state.embedded
      },
      set(value) {
        this.$store.state.embedded = value
      }
    }
  },
  watch: {
    autosave() {
      this.save()
      var config = fsMan.readJSON(figConfig)
      config.autosave=this.autosave
      fsMan.writeJSON(figConfig,config)
    },
    fontName() {
      if (this.fontName != '' && this.autosave)
        this.save()
    },
    classPrefix() {
      if (this.classPrefix != '' && this.autosave)
        this.save()
    },
    fileName() {
      if (this.fileName != '' && this.autosave)
        this.save()
    },
    generatedFilePath() {
      if (this.generatedFilePath != '' && this.autosave)
        this.save()
    },
    baseSelector() {
      if (this.autosave)
        this.save()
    },
    embedded() {
      if (this.autosave)
        this.save()
    }
  },
  methods: {
    openDir() {
      var folder = dialog.showOpenDialog({ properties: ['openDirectory'] })
      if (folder)
        this.generatedFilePath = folder[0]
    },
    reset() {
      this.fontName = this.fileName = 'icons'
      this.classPrefix = 'icon-'
      this.baseSelector = ''
      this.embedded = true
    },
    save() {
      var config = {
        font: {
          fontName: this.fontName,
          classPrefix: this.classPrefix,
          baseSelector: this.baseSelector
        },
        cssFile: {
          fileName: this.fileName,
          embedded: this.embedded,
          generatedFilePath: this.generatedFilePath
        },
        autosave: this.autosave
      }
      fsMan.writeJSON(figConfig, config)
    }
  },
  mounted() {
    if (fsMan.verify(figConfig)) {
      var readSetting = fsMan.readJSON(figConfig)
      this.fontName = readSetting.font.fontName.trim()
      this.classPrefix = readSetting.font.classPrefix.trim()
      this.baseSelector = readSetting.font.baseSelector.trim()
      this.fileName = readSetting.cssFile.fileName.trim()
      this.embedded = readSetting.cssFile.embedded
      this.generatedFilePath = readSetting.cssFile.generatedFilePath
      this.autosave = readSetting.autosave
    }
  }
}
</script>
<style scoped>

</style>
