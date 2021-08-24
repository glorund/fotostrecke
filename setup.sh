#!/usr/bin/env bash

SCRIPT_PATH=$(dirname "$0")

export PATH=$PATH:/d/Program\ Files/ImageMagick-7.0.11-Q16-HDRI

# mogrify is available
cp -r src/sources/* src/assets/photos/ 
# low res version of image
python $SCRIPT_PATH/tools/duplicate.py min
magick.exe mogrify -resize 640x $SCRIPT_PATH/src/assets/photos/**/*.min.jpg # &>/dev/null

# placeholder image for lazy loading
python $SCRIPT_PATH/tools/duplicate.py placeholder
magick.exe mogrify -resize 32x $SCRIPT_PATH/src/assets/photos/**/*.placeholder.jpg #&>/dev/null

# TODO add watermark
#/d/Program\ Files/ImageMagick-7.0.11-Q16-HDRI/composite.exe  -gravity Center ../../../sources/watermark.png source.jpeg output.jpeg
python $SCRIPT_PATH/tools/setup.py
