import fs from 'fs'
import os from 'os'
import path from 'path'
global.configDir = path.join(os.homedir(), '.font icon generator')
global.workingDir = path.join(os.homedir(), '.font icon generator', 'working directory')
global.session = path.join(os.homedir(), '.font icon generator', 'session.json')
global.watchList = path.join(os.homedir(), '.font icon generator', 'watch.json')
global.figConfig = path.join(os.homedir(), '.font icon generator', 'config.json')
export default {
  verify(url) {
    try {
      fs.statSync(url)
    } catch (err) {
      return false
    }
    return true
  },
  isFile() {

  },
  isDirectory() {

  },
  mkdir(url) {
    fs.mkdirSync(url)
  },
  clearDir(url) {
    var files = fs.readdirSync(url)
    files.forEach(function (file) {
      fs.unlinkSync(path.join(url, file))
    })
  },
  copy(src, dest) {
    console.log(src, dest)
    let readStream = fs.createReadStream(src);

    readStream.once('error', (err) => {
      console.log(err);
    });

    readStream.once('end', () => {
      console.log('done copying');
    });

    readStream.pipe(fs.createWriteStream(dest));
  },
  remove(dest) {
    fs.unlinkSync(dest)
  },
  rmdir(dest) {
    this.clearDir(dest)
    fs.rmdirSync(dest)
  },
  rename(destUrl, newName) {
    fs.rename(destUrl, newName, function () {})
  },
  resolve(filename) {
    var index = 1
    var filePath = path.join(workingDir, filename)
    if (!this.verify(filePath)) {
      return filePath
    } else {
      while (true) {
        filename = filename.replace('.svg', '')
        filePath = path.join(workingDir, filename + '-' + index + '.svg')
        if (!this.verify(filePath))
          break;
        index++
      }
      return filePath
    }
  },
  readJSON(url) {
    var file = fs.readFileSync(url, 'utf8')
    return JSON.parse(file)
  },
  writeJSON(url, content) {
    fs.writeFileSync(url, JSON.stringify(content, null, 4), 'utf8');
  },
  writeFile(url, content) {
    fs.writeFileSync(url, content, 'utf8');
  },
  readdir(folder) {
    var svgFiles = []
    var patt = new RegExp("\.svg$");
    var files = fs.readdirSync(folder)
    svgFiles = files.map(svg => {
      if (patt.test(svg)) {
        return path.join(folder, svg)
      }
    })
    return svgFiles
  },
  readfolder(folder) {
    var svgFiles = []
    var files = fs.readdirSync(folder)
    svgFiles = files.map(svg => {
      return path.join(folder, svg)
    })
    return svgFiles
  },
  loopFolderTree(dirPath, callback) {
    var folderStack = []
    var currenFolder = []
    var currentFiles = []
    folderStack.push(dirPath)
    if (this.verify(dirPath) && fs.lstatSync(dirPath).isDirectory() && folderStack.length > 0) {
      loopFile(this)
      callback(currentFiles)
    } else {
      console.log("path is not a folder")
      return
    }
    //recurcive loop
    function loopFile($this) {
      if (folderStack.length > 0) {
        var currenFolder = readdir(folderStack[0])
        currenFolder.forEach(function (url) {
          if ($this.verify(url) && fs.lstatSync(url).isFile() == true) {
            currentFiles.push(url)
          } else if ($this.verify(url) && fs.lstatSync(url).isDirectory() == true) {
            folderStack.push(url)
          }
        })
        folderStack.splice(0, 1)
        loopFile($this)
      } else {
        return
      }
    }
    //function get current dir
    function readdir(folder) {
      var tree = []
      var files = fs.readdirSync(folder)
      files.forEach(function (file) {
        tree.push(path.join(folder, file))
      })
      return tree
    }
  },
  watch(folder, callback, timeout) {
    var timeout = timeout || 1000
    var myVar = null
    var w = fs.watch(folder, (event, filename) => {
      clearTimeout(myVar)
      myVar = setTimeout(function () {
        callback()
      }, timeout);
      /*if (filename) {
        //console.log('filename provided: ' + filename);
      } else {
        //console.log('filename not provided');
      }*/
    });
    return w;
  }
}