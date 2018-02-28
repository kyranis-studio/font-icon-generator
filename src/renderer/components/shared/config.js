import fsMan from './fsManager.js'
import path from 'path'
import fs from 'fs'
var config
var sessionObj
if (!fsMan.verify(configDir)) {
  fsMan.mkdir(configDir)
}
if (!fsMan.verify(workingDir)) {
  fsMan.mkdir(workingDir)
}
if (!fsMan.verify(session)) {
  fsMan.writeJSON(session, [])
}
if (!fsMan.verify(watchList)) {
  fsMan.writeJSON(watchList, [])
}
if (!fsMan.verify(figConfig)) {
  config = {
    font: {
      fontName: 'icons',
      classPrefix: 'icon-',
      baseSelector: ''
    },
    cssFile: {
      fileName: 'icons',
      embedded: false,
      generatedFilePath: null
    },
    autosave: true
  }
  fsMan.writeJSON(figConfig, config)
} else {
  config = fsMan.readJSON(figConfig)
}
export default {
  config: config,
  sessionObj: sessionObj
}