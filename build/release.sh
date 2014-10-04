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
major=`echo $version | cut -f1 -d.`
let "nextmajor=major+1"
minor=`echo $version | cut -f2 -d.`
let "nextminor=minor+1"
bugfix=`echo $version | cut -f3 -d.`
let "nextbugfix=bugfix+1"

nextversion="0"
while [ $nextversion == "0" ]
do
	echo "Current version: $version"
	echo "Release type: "
	echo "1) Major ($nextmajor.0.0)"
	echo "2) Minor ($major.$nextminor.0)"
	echo "3) Bugfix ($major.$minor.$nextbugfix)"
	read release_type
	case $release_type in
		"1" )
			nextversion="$nextmajor.0.0"
			;;
		"2" )
			nextversion="$major.$nextminor.0"
			;;
		"3" )
			nextversion="$major.$minor.$nextbugfix"
			;;
	esac
done


cd build
dch -v $nextversion-1 -M

if ! grep -q $nextversion debian/changelog
then
	echo "Aborting release"
	exit 1
fi
sed -i 's/UNRELEASED/RELEASED/g' debian/changelog
cd ..

sed -i s/$version/$nextversion/g src/java/com/qqwing/QQWing.java build/configure.ac src/js/qqwing-main.js

libcurrent=`grep QQWING_CURRENT= build/configure.ac | grep -oE '[0-9]+'`
let "nextlibcurrent=libcurrent+1"
librevision=`grep QQWING_REVISION= build/configure.ac | grep -oE '[0-9]+'`
let "nextlibrevision=librevision+1"
libage=`grep QQWING_AGE= build/configure.ac | grep -oE '[0-9]+'`
let "nextlibage=libage+1"
nextlib="0"
while [ $nextlib == "0" ]
do
	echo "Current C++ library version: $libcurrent.$librevision.$libage"
	echo "1) Methods removed or binary compatibility broken ($nextlibcurrent.0.0)"
	echo "2) Methods added ($nextlibcurrent.0.$nextlibage)"
	echo "3) No interface changes ($libcurrent.$nextlibrevision.$libage)"
	read lib_release_type
	case $lib_release_type in
		"1" )
			libcurrent=$nextlibcurrent
			librevision=0
			libage=0
			;;
		"2" )
			libcurrent=$nextlibcurrent
			librevision=0
			libage=$nextlibage
			;;
		"3" )
			libcurrent=$libcurrent
			librevision=$nextlibrevision
			libage=$libage
			;;
	esac
	nextlib="$libcurrent.$librevision.$libage"
done

sed -ri "s/QQWING_CURRENT=.*/QQWING_CURRENT=$libcurrent/g;s/QQWING_REVISION=.*/QQWING_REVISION=$librevision/g;s/QQWING_AGE=.*/QQWING_AGE=$libage/g" build/configure.ac

make clean
make

git commit -a
git tag -a "v$nextversion" -m "Release version $nextversion"

echo "Changed to next version: $nextversion (C++ library version $nextlib)"
echo "Push to origin and github now:"
echo "  git push origin master && git push origin --tags"
echo "  git push github master && git push github --tags"
