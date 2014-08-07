#!/bin/sh
set -e

if [ -e target/javatestcompile ]
then
	newer=`find test/java/ -type f -newer target/javatestcompile`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

mkdir -p target/testclasses
echo "Compiling java test sources"
javac -sourcepath test/java/ -classpath target/classes -d target/testclasses/ test/java/*.java
touch target/javatestcompile
