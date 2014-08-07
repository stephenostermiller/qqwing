#!/bin/sh
set -e

if [ -e target/jsminimize ]
then
	newer=`find src/js/ -type f -newer target/jsminimize`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

mkdir -p target/jsmin
echo "Minimizing js sources"
for file in target/js/*.js
do
	output=${file/js/jsmin}
	output=${output/.js/.min.js}
	yui-compressor --type js --charset UTF-8 -o $output $file
	echo -n '.'
done
echo
touch target/jsminimize
