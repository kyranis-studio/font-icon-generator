const SVGIcons2SVGFontStream = require('svgicons2svgfont');
const fs = require('fs');
const path = require('path')
var fsMan = require('../fsManager.js')
var svg2ttf = require('svg2ttf');
var ttf2woff2 = require('ttf2woff2');
var ttf2woff = require('ttf2woff');
var ttf2eot = require('ttf2eot');
var svgToFont = function (options, callback) {
  //default initialisation
  //required options files[]:string , dest:string

  try {
    if (options == undefined) {
      throw "you must provide an options object"
    }
  } catch (err) {
    console.error("\x1b[31m", err)
    return
  }
  (options.fontName == undefined || options.fontName == '') ? options.fontName = 'icons': ''
  options.normalize == undefined ? options.normalize = 'true' : 'false'
  options.fixedWidth == undefined ? options.fixedWidth = 'true' : 'false'
  options.centerHorizontally == undefined ? options.centerHorizontally = 'true' : 'false'
  options.escapeSpace == undefined ? options.escapeSpace = '_' : options.escapeSpace
  options.startCodepoint == undefined ? options.startCodepoint = 59392 : options.startCodepoint
  options.classPrefix == undefined ? options.classPrefix = 'icon-' : options.classPrefix
  try {
    if (options.files == undefined) {
      throw "you must provide a files arry"
    }
  } catch (err) {
    console.error("\x1b[31m", err)
    return
  }
  try {
    if (options.dest == undefined) {
      throw "you must provide a destination"
    }
  } catch (err) {
    console.error("\x1b[31m", err)
    return
  }

  var files = options.files
  var dest = options.dest
  var fontName = options.fontName
  var destPath = path.join(dest, fontName + ".svg")
  var unicode = options.startCodepoint
  var font = new Buffer(0)

  const fontStream = new SVGIcons2SVGFontStream(options);

  fontStream.pipe(fs.createWriteStream(destPath))
    .on('data', function (data) {
      font = Buffer.concat([font, data])
    })
    .on('finish', function () {
      var ttf = svg2ttf(fs.readFileSync(path.join(dest, fontName + ".svg"), 'utf8'), options);
      fs.writeFileSync(path.join(dest, fontName + ".ttf"), new Buffer(ttf.buffer));


      //var woff = new Buffer(ttf2woff(ttf, options).buffer);
      //fs.writeFileSync(path.join(dest, fontName + ".woff"), woff);

      var ttf = new Uint8Array(ttf);
      //var ttf = Array.prototype.slice.call(input, 0);
      var woff = new Buffer(ttf2woff(ttf, options).buffer);
      fs.writeFileSync(path.join(dest, fontName + ".woff"), woff);	

      var eot = new Buffer(ttf2woff(new Uint8Array(ttf), options).buffer);
      fs.writeFileSync(path.join(dest, fontName + ".eot"), eot);

      //var woff2 = fs.readFileSync(path.join(dest,fontName+".ttf"));
      //fs.writeFileSync(path.join(dest,fontName+".woff2"), ttf2woff2(woff2));
      callback(options)
    })
    .on('error', function (err) {
      console.log(err);
    });
  files.forEach(function (file) {
    if (file != undefined) {
      var patt = new RegExp("[^\\\/]*$");
      var name = patt.exec(file)[0].replace(".svg", "")
      var glyph = fs.createReadStream(file);
      var code = "'" + '\\u' + unicode.toString(16).toLocaleUpperCase() + "'"
      glyph.metadata = {
        unicode: [eval(code)],
        name: name,
        encoding: "iso-8859-1"
      };
      fontStream.write(glyph);
      unicode++
    }
  })
  fontStream.end();
}
module.exports = svgToFont
