#!/bin/sh
set -e

version=`build/version.sh`
tgz=qqwing-$version.tar.gz

if [ -e target/$tgz ]
then
	newer=`find target/qqwing -type f -newer target/$tgz`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

cd target/automake
make dist
cd ../..
cp target/automake/$tgz target/$tgz
ls target/$tgz

