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
tstamp=target/automake/.compile-$target.tstamp
builddir=target/automake/$target

if [ -e $tstamp ]
then
	newer=`find src/cpp/ target/automake/Makefile -type f -newer $tstamp`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

echo "Building qqwing in $builddir"
rm -rf $builddir/qqwing target/qqwing $builddir/.libs $builddir/*.o $builddir/*.lo $builddir/*.la $builddir/.libs/ $builddir/autom4te.cache/*
cp src/cpp/*.cpp $builddir
cp src/cpp/*.hpp $builddir
pushd $builddir
make
popd
ls $builddir
#cp target/automake/qqwing target/qqwing
#ls target/qqwing
