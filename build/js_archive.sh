#!/bin/sh
set -e

version=`build/version.sh`
archive="target/qqwing-js-$version.tar.gz"

if [ -e $archive ]
then
	newer=`find target/jsmin/ target/js -type f -newer $archive`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

version=`build/version.sh`
rm -f $archive
echo "creating $archive"
tar cfz $archive target/js/qqwing-$version.js target/js/qqwing-main-$version.js target/jsmin/qqwing-$version.min.js target/jsmin/qqwing-main-$version.min.js
