#!/bin/sh

set -e

mkdir -p target/automake
cp build/configure.ac build/Makefile.am doc/NEWS doc/README doc/AUTHORS doc/ChangeLog doc/COPYING target/automake
cd target/automake
touch config.h.in
aclocal
automake -a -c
autoreconf
rm -f config.h.in~
