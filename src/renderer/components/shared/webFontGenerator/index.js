var fontGenerator = require('./fontGenerator.js')
var fs = require('fs')
var path = require('path')


var webFontGenerator = function (options ,callback) {
  fontGenerator(options, (options) => {
    var files = options.files
    var fontName = options.fontName
    var fileName = (options.fileName == '' || options.fileName == undefined) ? fontName : options.fileName
    var dest = options.dest
    var eot = fontName + '.eot'
    var woff = fontName + '.woff'
    var ttf = fontName + '.ttf'
    var svg = fontName + '.svg'
    
    var classPrefix = options.classPrefix
    var baseSelector = (options.baseSelector == '' || options.baseSelector == undefined) ? '' : '.'+options.baseSelector
    var unicode = options.startCodepoint
    var embedded=options.embedded
    
    var fontFace=`@font-face {
      font-family: "${fontName}";
      src: url('${eot}?95824722');
      src: url('${eot}?95824722#iefix') format('embedded-opentype'),
           url('${woff}?95824722') format('woff'),
           url('${ttf}?95824722') format('truetype'),
           url('${svg}?95824722#fontello') format('svg');
      font-weight: normal;
      font-style: normal;
    }`
    if(embedded==true){
      var ttfBase64=new Buffer(fs.readFileSync(path.join(dest,ttf))).toString('base64')
      var woffBase64=new Buffer(fs.readFileSync(path.join(dest,woff))).toString('base64')
       fontFace=`@font-face {
        font-family: "${fontName}";
        src: url('data:application/octet-stream;base64,${woffBase64}') format('woff'),
             url('data:application/octet-stream;base64,${ttfBase64}') format('truetype');
      }`
    }
    var cssTemplate = `
    ${fontFace}\n
    ${baseSelector}[class^="${classPrefix}"]:before, ${baseSelector}[class*=" ${classPrefix}"]:before {
      font-family: "${fontName}";
      font-style: normal;
      font-weight: normal;
      speak: none;
      display: inline-block;
      text-decoration: inherit;
      width: 1em;
      margin-right: .2em;
      text-align: center;
      font-variant: normal;
      text-transform: none;
      line-height: 1em;
      margin-left: .2em;
    }
    `
    files.forEach((file) => {
      var patt = new RegExp("[^\\\/]*$");
      var name = patt.exec(file)[0].replace(".svg", "")
      var code = "'" + '\\' + unicode.toString(16).toLocaleUpperCase() + "'"
      iconsLine = `.${classPrefix}${name}:before { content: ${code};}\n`
      cssTemplate = cssTemplate + iconsLine
      unicode++
    })

    fs.writeFileSync(path.join(dest, fileName + '.css'), cssTemplate, "utf8")
    if(embedded){
      fs.unlinkSync(path.join(dest,fontName+".eot"))
      fs.unlinkSync(path.join(dest,fontName+".svg"))
      fs.unlinkSync(path.join(dest,fontName+".ttf"))
      fs.unlinkSync(path.join(dest,fontName+".woff"))
      //fs.unlinkSync(path.join(dest,fontName+".woff2"))
    }
    callback()
  })
}
module.exports = webFontGenerator