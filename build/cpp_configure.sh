#!/bin/sh
set -e

if [ -e target/cppconfigure ]
then
	newer=`find build/configure.ac build/Makefile.am doc/README doc/AUTHORS doc/COPYING -type f -newer target/cppconfigure`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

echo "Running automake and configure"
mkdir -p target/automake
cp build/configure.ac build/Makefile.am build/qqwing.pc.in build/qqwing.1 doc/README doc/AUTHORS doc/COPYING target/automake
cd target/automake
touch config.h.in
autoreconf --force --install
rm -f config.h.in~
./configure
touch ../cppconfigure
