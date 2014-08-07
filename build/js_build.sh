#!/bin/sh
set -e

if [ -e target/jscompile ]
then
	newer=`find src/js/ test/js/ -type f -newer target/jscompile`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

version=`build/version.sh`

mkdir -p target/js
echo "Compiling js sources"

cat src/js/qqwing-object-start.js src/js/qqwing-private-static.js src/js/qqwing-private-instance.js src/js/qqwing-object-end.js src/js/qqwing-public-static.js> target/js/qqwing-$version.js
echo -n '.'

cat target/js/qqwing-$version.js src/js/qqwing-main.js > target/js/qqwing-main-$version.js
echo -n '.'

cat src/js/qqwing-private-static.js test/js/qqwing-test.js > target/js/qqwing-test-$version.js
echo -n '.'

echo
touch target/jscompile
