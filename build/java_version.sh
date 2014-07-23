#!/bin/sh

set -e

version=`build/version.sh`
fileversion=`grep 'QQWING_VERSION =' java/QQWing.java | grep -oE '[0-9]+\.[0-9]+\.[0-9\.]+'`

if [ "$version" != "$fileversion" ]
then
	echo "Setting version in QQWing.java to $version (was $fileversion)"
	sed -i "s/$fileversion/$version/g" java/QQWing.java
fi
