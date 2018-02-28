import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
export const store = new Vuex.Store({
    state:{
        fontSize:32,
        windowOnTop:false,
        fontName: "icons",
        classPrefix: "icon",
        baseSelector: "",
        fileName: "icons",
        embedded: true,
        generatedFilePath: null,
        iconsClass:[],
        svgLibIcons:[]
    }
})