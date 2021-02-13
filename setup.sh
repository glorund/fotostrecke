#!/usr/bin/env bash

SCRIPT_PATH=$(dirname "$0")

# mogrify is available
# low res version of image
# python $SCRIPT_PATH/tools/duplicate.py min
/c/Program\ Files/ImageMagick-7.0.11-Q16/magick.exe mogrify -resize 640x $SCRIPT_PATH/src/assets/photos/**/*.min.jpeg &>/dev/null
/c/Program\ Files/ImageMagick-7.0.11-Q16/magick.exe mogrify -resize 640x $SCRIPT_PATH/src/assets/photos/**/*.min.png &>/dev/null
/c/Program\ Files/ImageMagick-7.0.11-Q16/magick.exe mogrify -resize 640x $SCRIPT_PATH/src/assets/photos/**/*.min.jpg &>/dev/null

# placeholder image for lazy loading
# python $SCRIPT_PATH/tools/duplicate.py placeholder
/c/Program\ Files/ImageMagick-7.0.11-Q16/magick.exe mogrify -resize 32x $SCRIPT_PATH/src/assets/photos/**/*.placeholder.jpeg &>/dev/null
/c/Program\ Files/ImageMagick-7.0.11-Q16/magick.exe mogrify -resize 32x $SCRIPT_PATH/src/assets/photos/**/*.placeholder.png &>/dev/null
/c/Program\ Files/ImageMagick-7.0.11-Q16/magick.exe mogrify -resize 32x $SCRIPT_PATH/src/assets/photos/**/*.placeholder.jpg &>/dev/null

python $SCRIPT_PATH/tools/setup.py
