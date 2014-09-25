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

if [ -e target/cppconfigure ]
then
	newer=`find build/configure.ac build/Makefile.am doc/README doc/AUTHORS doc/COPYING -type f -newer target/cppconfigure`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

echo "Running automake and configure"
mkdir -p target/automake/debian/source
cp build/configure.ac build/Makefile.am build/qqwing.pc.in doc/README doc/AUTHORS doc/COPYING target/automake
cp doc/qqwing.man target/automake/qqwing.1
cp build/debian-changelog.txt target/automake/debian/changelog
cp build/debian-control.txt target/automake/debian/control
cp build/debian-copyright.txt target/automake/debian/copyright
cp build/debian-rules.txt target/automake/debian/rules
chmod +x target/automake/debian/rules
echo "3.0 (quilt)" > target/automake/debian/source/format
echo 9 > target/automake/debian/compat

cd target/automake
touch config.h.in
autoreconf --force --install
rm -f config.h.in~
./configure
touch ../cppconfigure
