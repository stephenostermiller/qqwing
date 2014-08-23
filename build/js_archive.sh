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
gzname="qqwing-js-$version.tar.gz"
archive="target/$gzname"

if [ -e $archive ]
then
	newer=`find target/jsmin/ target/js -type f -newer $archive`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

version=`build/version.sh`
rm -rf $archive target/jsgz
mkdir -p target/jsgz/qqwing-$version
cp doc/COPYING target/js/qqwing-$version.js target/js/qqwing-main-$version.js target/jsmin/qqwing-$version.min.js target/jsmin/qqwing-main-$version.min.js target/jsgz/qqwing-$version
cp doc/JSREADME target/jsgz/qqwing-$version/README
cd target/jsgz
echo "creating $archive"
tar cfz $gzname qqwing-$version
mv $gzname ../
