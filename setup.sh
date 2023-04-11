#!/usr/bin/env bash

SCRIPT_PATH=$(dirname "$0")

export PATH=$PATH:/d/Program\ Files/ImageMagick-7.0.11-Q16-HDRI

cp -r src/sources/* src/assets/photos/ 
# low res version of image
python $SCRIPT_PATH/tools/duplicate.py min
echo processing min
mogrify -resize 640x $SCRIPT_PATH/src/assets/photos/**/*.min.jpg # &>/dev/null

# placeholder image for lazy loading
python $SCRIPT_PATH/tools/duplicate.py placeholder
echo processing placeholders
mogrify -resize 32x $SCRIPT_PATH/src/assets/photos/**/*.placeholder.jpg #&>/dev/null

# TODO add watermark
for i in $SCRIPT_PATH/src/assets/photos/**/*.jpg
do
    if ! [[ "$i" =~ ".min.jpg" || "$i" =~ ".placeholder.jpg" ]]
    then
        composite -gravity Center src/sources/watermark.png  "$i" "$i"
    fi
done

python $SCRIPT_PATH/tools/setup.py
