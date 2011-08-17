#!/bin/sh

set -e

version=`cat version.txt`
fileversion=`grep 'QQWING_VERSION =' QQWing.java | grep -oE '[0-9]+\.[0-9]+\.[0-9\.]+'`

if [ "$version" != "$fileversion" ]
then
    echo "Setting version in QQWing.java to $version (was $fileversion)"
    sed -i "s/$fileversion/$version/g" QQWing.java
fi
