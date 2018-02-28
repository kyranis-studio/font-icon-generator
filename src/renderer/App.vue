<template>
  <v-app id="v-app" application--dark>
    <v-tabs light :icons="true">
      <v-tabs-bar class="grey lighten-3 elevation-5 hidden-xs-only">
        <v-toolbar-title><img id="logo" src="./assets/logo.png"></v-toolbar-title>
        <v-toolbar-title id="brand"> Font Icon Generator</v-toolbar-title>
        <v-tabs-item to="/" exact v-if="$route.path!=='/preview'">
          <v-icon large>icon-editor</v-icon> Editor
        </v-tabs-item>
        <v-tabs-item to="svglib" v-if="$route.path!=='/preview'">
          <v-icon large>icon-svg-lib</v-icon>SVG Lib
        </v-tabs-item>
        <v-tabs-item to="watch" v-if="$route.path!=='/preview'">
          <v-icon large>icon-watch-folder</v-icon>Watch Folders
        </v-tabs-item>
        <v-tabs-item to="settings" v-if="$route.path!=='/preview'">
          <v-icon large>icon-settings</v-icon>Settings
        </v-tabs-item>
        <v-tabs-item v-if="$route.path!=='/preview'" v-on:click.stop.native="()=>dialog=true">
          <v-icon large>icon-about</v-icon>About
          <v-dialog v-model="dialog" lazy absolute width="400px">
            <v-toolbar dense>
              <v-icon>icon-about</v-icon>
              <v-toolbar-title>About</v-toolbar-title>
            </v-toolbar>
            <v-list two-line subheader dense>
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <v-icon>memory</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>0.0.1.beta_test</v-list-tile-title>
                  <v-list-tile-sub-title>Version</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <v-icon>person</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>wael zekri</v-list-tile-title>
                  <v-list-tile-sub-title>Author</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <v-icon>email</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>kyranis.contact@gmail.com</v-list-tile-title>
                  <v-list-tile-sub-title>Email</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <v-icon>public</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content >
                  <v-list-tile-title @click="openInBrowser('https://github.com/kyranis-studio/font-icon-generator')">
                    <a style="cursor:pointer">https://github.com/kyranis-studio/font-icon-generator</a>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>Website</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <v-icon>verified_user</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>
                    free to use for commercial and non commercial use
                  </v-list-tile-title>
                  <v-list-tile-sub-title>Licence</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-card-actions>
                <v-btn class="blue--text darken-1" flat="flat" @click.native="dialog = false" style="margin:auto">ok</v-btn>
              </v-card-actions>
            </v-list>
          </v-dialog>
        </v-tabs-item>
        <v-tabs-slider class="orange accent-4"></v-tabs-slider>
      </v-tabs-bar>
      <v-container id="main" fluid>
        <router-view id="main"></router-view>
      </v-container>
    </v-tabs>
    <v-footer id="footer" v-if="$route.path!=='/dropbox'" class="hidden-xs-only">
      <v-layout row wrap style="width:100%">
        <v-flex sm11 lg11>
          <v-slider id="iconSize" v-model="$store.state.fontSize" append-icon="zoom_in" prepend-icon="zoom_out" min="16" max="64" step="2" thumb-label></v-slider>
        </v-flex>
        <v-flex sm1 lg1>
          <v-text-field id="inputSize" v-model.lazy="$store.state.fontSize" type="number" min="16" max="64" suffix="px"></v-text-field>
        </v-flex>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
import fsMan from './components/shared/fsManager'
import config from './components/shared/config'
import {shell} from 'electron'
export default {
  data() {
    return {
      inputSize: 32,
      dialog: false
    }
  },
  methods:{
    openInBrowser(url){
      shell.openExternal(url)
    }
  },
  mounted() {
    window.addEventListener("dragover", function(e) {
      e = e || event;
      e.preventDefault();
    }, false);
    window.addEventListener("drop", function(e) {
      e = e || event;
      e.preventDefault();
    }, false);
  }
}
var icons = []
</script>

<style>
#v-app {
  height: 100%;
}

#logo {
  width: 64px;
  height: 64px;
}

#brand {
  letter-spacing: 5px;
  margin-right: 10px;
  font-weight: 100;
  font-size: 30px;
  font-family: 'urban_sketchregular';
}

#iconSize {
  width: 100%;
  padding: 0 20px;
  float: right;
  margin-top: 30px;
}

a.tabs__item--active {
  color: darkorange !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

@media screen and (min-width: 401px) {
  #main {
    height: calc(100vh - 150px);
  }
}


#footer {
  height: 60px;
}
</style>
