#!/bin/sh

set -e

mkdir -p target/jar
version=`build/version.sh`
cp target/classes/* doc/COPYING java/*.java target/jar
cd target/jar
jar cvmf ../../build/QQWing.mf ../qqwing-$version.jar *
