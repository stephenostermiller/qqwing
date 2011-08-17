#/bin/sh

set -e

RPM_BUILD_DIR=`rpmbuild qqwing.spec 2>&1 | sed 's|.*File ||g' | sed 's|/SOURCES.*||g'`
PACKAGE=`grep AC_INIT configure.ac | sed 's|AC_INIT(||g' | sed 's|,.*||g'`
VERSION=`grep AC_INIT configure.ac | sed "s|.*$PACKAGE, ||g" | sed 's|,.*||g'`
RPM_BUILD_TARGET=`uname -m`

mkdir -p $RPM_BUILD_DIR/BUILD
mkdir -p $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET
mkdir -p $RPM_BUILD_DIR/SOURCES
mkdir -p $RPM_BUILD_DIR/SPECS
mkdir -p $RPM_BUILD_DIR/SRPMS
if [ ! -e $PACKAGE-$VERSION.tar.gz ]
then
  make dist
fi
cat $PACKAGE.spec | sed s/VERSION/$VERSION/g > $RPM_BUILD_DIR/SPECS/$PACKAGE.spec 
cp -f $PACKAGE-$VERSION.tar.gz $RPM_BUILD_DIR/SOURCES/$PACKAGE-$VERSION.tar.gz 
rpmbuild -ba --target $RPM_BUILD_TARGET -v $RPM_BUILD_DIR/SPECS/$PACKAGE.spec 
cp -f $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET/$PACKAGE-$VERSION-1.$RPM_BUILD_TARGET.rpm . 
cp -f $RPM_BUILD_DIR/SRPMS/$PACKAGE-$VERSION-1.src.rpm .
rm -f $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET/$PACKAGE-$VERSION-1.$RPM_BUILD_TARGET.rpm 
rm -f $RPM_BUILD_DIR/SRPMS/$PACKAGE-$VERSION-1.src.rpm 
rm -f $RPM_BUILD_DIR/SPECS/$PACKAGE.spec 
rm -f $RPM_BUILD_DIR/SOURCES/$PACKAGE-$VERSION.tar.gz 
rm -rf $RPM_BUILD_DIR/BUILD/$PACKAGE-$VERSION
