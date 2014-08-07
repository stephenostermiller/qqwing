#!/bin/sh
set -e

version=`build/version.sh`
jar="qqwing-$version.jar"

if [ -e target/$jar ]
then
	newer=`find target/classes/ doc/COPYING src/java/ -type f -newer target/$jar`
	if [ "z$newer" = "z" ]
	then
		exit
	fi
fi

mkdir -p target/jar
echo "Creating jar file: target/$jar"
cp target/classes/* doc/COPYING src/java/*.java target/jar
cd target/jar
jar cmf ../../build/QQWing.mf ../$jar *
