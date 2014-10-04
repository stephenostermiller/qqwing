#!/bin/sh
# qqwing - Sudoku solver and generator
# Copyright (C) 2014 Stephen Ostermiller
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
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
cp -r target/classes/* doc/COPYING src/java/* target/jar
cd target/jar
jar cmf ../../build/QQWing.mf ../$jar *
