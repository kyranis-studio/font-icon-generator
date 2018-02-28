#!/bin/sh
rm -rf $HOME/".local/share/font icon generator"
mkdir -p $HOME/".font icon generator"
mkdir -p $HOME/".local/share/font icon generator"
cp -r svg-lib  $HOME/".font icon generator/"
cp -r "font-icon-generator-0.0.1-x86_64.AppImage"  $HOME/".local/share/font icon generator"
cp  font-icon-generator.sh  $HOME/".local/share/font icon generator/"
cp  icon.png  $HOME/".local/share/font icon generator/"
$HOME/".local/share/font icon generator/font-icon-generator.sh"

