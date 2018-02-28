cp  ../font-icon-generator-0.0.1-x86_64.AppImage ./dist
chmod a+xwr dist/setup.sh
./makeself/makeself.sh --header "./makeself/makeself-header.sh" dist bin/font-icon-generator.sh "font icon generator" ./setup.sh
rm -rf "./dist/font-icon-generator-0.0.1-x86_64.AppImage"
chmod a+xwr bin/font-icon-generator.sh

