#!/bin/sh
set -e

if [ -e target/qqwing ]
then
	newer=`find src/cpp/ target/automake/Makefile -type f -newer target/qqwing`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

echo "Building target/qqwing"
cp src/cpp/*.cpp target/automake
cp src/cpp/*.hpp target/automake
cd target/automake
make
cd ../..
cp target/automake/qqwing target/qqwing
ls target/qqwing

