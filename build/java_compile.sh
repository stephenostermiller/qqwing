#!/bin/sh
set -e

if [ -e target/javacompile ]
then
	newer=`find src/java/ -type f -newer target/javacompile`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

mkdir -p target/classes
echo "Compiling java sources"
javac -sourcepath src/java/ -d target/classes/ src/java/*.java
touch target/javacompile
