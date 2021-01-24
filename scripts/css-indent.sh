#!/bin/sh
for a in $* ; do
src/node_modules/.bin/css-beautify -r $a
done
