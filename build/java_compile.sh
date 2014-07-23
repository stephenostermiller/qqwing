#!/bin/sh
set -e

if [ -e target/javacompile ]
then
    newer=`find java/ -type f -newer target/javacompile`
    if [ "z$newer" = "z" ]
    then
        exit 0
    fi
fi

mkdir -p target/classes
echo "Compiling java sources"
javac -sourcepath java/ -d target/classes/ java/*.java
touch target/javacompile