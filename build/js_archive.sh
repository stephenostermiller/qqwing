#!/bin/sh
set -e

version=`build/version.sh`
gzname="qqwing-js-$version.tar.gz"
archive="target/$gzname"

if [ -e $archive ]
then
	newer=`find target/jsmin/ target/js -type f -newer $archive`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

version=`build/version.sh`
rm -rf $archive target/jsgz
mkdir -p target/jsgz/qqwing-$version
cp doc/COPYING target/js/qqwing-$version.js target/js/qqwing-main-$version.js target/jsmin/qqwing-$version.min.js target/jsmin/qqwing-main-$version.min.js target/jsgz/qqwing-$version
cp doc/JSREADME target/jsgz/qqwing-$version/README
cd target/jsgz
echo "creating $archive"
tar cfz $gzname qqwing-$version
mv $gzname ../
