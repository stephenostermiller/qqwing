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
#/bin/sh
set -e

version=`build/version.sh`
tgz=qqwing-$version.tar.gz

if ls target/*.deb &> /dev/null;
then
	file=`ls target/*.deb -1 | head -n 1`
	newer=`find build/debian* target/$tgz -type f -newer $file`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

echo "Building debian package"
rm -rf target/deb
mkdir -p target/deb
cp target/qqwing-$version.tar.gz target/deb/qqwing_$version.orig.tar.gz
cd target/deb
tar xfz qqwing_$version.orig.tar.gz
cd qqwing-$version
export DEBEMAIL='debian@ostermiller.org'
export DEBFULLNAME='Stephen Ostermiller'

debuild -us -uc

cd ../../..
cp target/deb/qqwing*.deb target/
ls target/*.deb
