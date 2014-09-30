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

target="$1"
if [ "z$target" == "z" ]
then
	target="native"
fi

mkdir -p target/automake
tstamp=target/automake/.configure-$target.tstamp
builddir=target/automake/$target

if [ -e $tstamp ]
then
	newer=`find build/debian build/configure.ac build/Makefile.am doc/README doc/AUTHORS doc/COPYING -type f -newer $tstamp`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

echo "Running automake and configure"
mkdir -p $builddir
cp build/configure.ac build/Makefile.am build/qqwing.pc.in doc/README doc/AUTHORS doc/COPYING $builddir
cp doc/qqwing.man $builddir/qqwing.1
cp -r build/debian $builddir/debian

pushd $builddir
touch config.h.in
autoreconf --force --install
rm -f config.h.in~
if [ "$target" == "native" ]
then
	./configure
else
	./configure --host "$target"
fi
popd

touch $tstamp
