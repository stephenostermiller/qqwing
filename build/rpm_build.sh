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

export PACKAGE=`grep AC_INIT build/configure.ac | sed 's|AC_INIT(||g' | sed 's|,.*||g'`
export VERSION=`build/version.sh`
tgz=qqwing-$VERSION.tar.gz
SRPM=$PACKAGE-$VERSION-1.src.rpm

if [ -e target/$SRPM ]
then
	newer=`find build/qqwing.spec target/$tgz -type f -newer target/$SRPM`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

export RPM_BUILD_TARGET=`uname -m`

mkdir -p target/rpm
cp -v build/qqwing.spec target/qqwing*.tar.gz target/rpm
cd target/rpm
RPM_BUILD_DIR=`rpmbuild qqwing.spec 2>&1 | sed 's|.*File ||g' | sed 's|/SOURCES.*||g'`
cd ../..

mkdir -p $RPM_BUILD_DIR/BUILD
mkdir -p $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET
mkdir -p $RPM_BUILD_DIR/SOURCES
mkdir -p $RPM_BUILD_DIR/SPECS
mkdir -p $RPM_BUILD_DIR/SRPMS
cat build/$PACKAGE.spec | sed s/VERSION/$VERSION/g > $RPM_BUILD_DIR/SPECS/$PACKAGE.spec
cp -f target/$PACKAGE-$VERSION.tar.gz $RPM_BUILD_DIR/SOURCES/$PACKAGE-$VERSION.tar.gz
rpmbuild -ba --target $RPM_BUILD_TARGET -v $RPM_BUILD_DIR/SPECS/$PACKAGE.spec
cp -f $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET/$PACKAGE-$VERSION-1.$RPM_BUILD_TARGET.rpm target/
cp -f $RPM_BUILD_DIR/SRPMS/$SRPM target/
rm -f $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET/$PACKAGE-$VERSION-1.$RPM_BUILD_TARGET.rpm
rm -f $RPM_BUILD_DIR/SRPMS/$SRPM
rm -f $RPM_BUILD_DIR/SPECS/$PACKAGE.spec
rm -f $RPM_BUILD_DIR/SOURCES/$PACKAGE-$VERSION.tar.gz
rm -rf $RPM_BUILD_DIR/BUILD/$PACKAGE-$VERSION
